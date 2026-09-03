import sqlite3 from "sqlite3"
import path from "path"
import { fileURLToPath } from "url"
import bcrypt from "bcryptjs"
import ENV from "./env.js"
import pg from 'pg'
const { Pool } = pg

const _filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_filename)
const isTestEnv = process.env.NODE_ENV === 'test'
const dbPath = path.resolve(_dirname, isTestEnv ? '../../database.test.sqlite' : '../../database.sqlite')

// Detección de PostgreSQL (Supabase)
const usePostgres = !!process.env.DATABASE_URL;
let db;
let pgPool;

if (usePostgres) {
    pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Requerido por la mayoría de cloud hosts
    });
    console.log('🌐 Conectado con éxito a la base de datos PostgreSQL (Supabase).');
} else {
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error al conectar la base de datos', err.message);
        } else {
            console.log(`💾 Conectado con exito a la base de datos SQLite (${isTestEnv ? 'TEST' : 'PROD'}).`)
        }
    });
}

// --- ENVOLTORIO DE PROMESAS DUAL (PostgreSQL / SQLite) ---

export const dbQuery = async (sql, params = []) => {
    if (usePostgres) {
        let i = 1;
        const pgSql = sql.replace(/\?/g, () => `$${i++}`);
        const result = await pgPool.query(pgSql, params);
        return result.rows;
    } else {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

export const dbRun = async (sql, params = []) => {
    if (usePostgres) {
        let i = 1;
        let pgSql = sql.replace(/\?/g, () => `$${i++}`);
        
        // PostgreSQL requiere "RETURNING id" para emular this.lastID
        if (/^\s*INSERT\s+INTO/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
            pgSql = pgSql.replace(/;?\s*$/, ' RETURNING id;');
        }
        
        const result = await pgPool.query(pgSql, params);
        const lastID = result.rows && result.rows.length > 0 ? result.rows[0].id : null;
        return { id: lastID, changes: result.rowCount };
    } else {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }
};

// --- CREACIÓN DEL ESQUEMA E INICIALIZACIÓN ---

export const inicializarBaseDeDatos = async () => {
    try {
        if (!usePostgres) {
            await dbRun('PRAGMA foreign_keys = ON;');
            console.log('🛡️ Validación de claves foráneas activada (SQLite).');
        }

        const idCol = usePostgres ? 'id SERIAL PRIMARY KEY' : 'id INTEGER PRIMARY KEY AUTOINCREMENT';
        const datetime = usePostgres ? 'TIMESTAMP' : 'DATETIME';

        await dbRun(`
      CREATE TABLE IF NOT EXISTS clientes (
        ${idCol},
        nombre TEXT NOT NULL,
        telefono TEXT,
        email TEXT,
        fecha_registro ${datetime} DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await dbRun(`
      CREATE TABLE IF NOT EXISTS productos (
        ${idCol},
        codigo TEXT NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio REAL NOT NULL,
        categoria TEXT DEFAULT 'Armazón de Vista'
      )
    `);

        await dbRun(`
      CREATE TABLE IF NOT EXISTS ventas (
        ${idCol},
        cliente_id INTEGER NOT NULL,
        fecha ${datetime} DEFAULT CURRENT_TIMESTAMP,
        total REAL NOT NULL,
        descripcion TEXT,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

        await dbRun(`
      CREATE TABLE IF NOT EXISTS cristales (
          ${idCol},
          material TEXT,
          tipo_lente TEXT,
          tratamiento TEXT,
          con_antirreflejo INTEGER,
          con_blue_cut INTEGER DEFAULT 0,
          con_fotocromatico INTEGER DEFAULT 0,
          descripcion TEXT,
          precio_tradicional REAL,
          precio_digital REAL,
          precio_ar_eternal REAL
      )
    `);

        await dbRun(`
      CREATE TABLE IF NOT EXISTS detalle_ventas (
        ${idCol},
        venta_id INTEGER NOT NULL,
        producto_id INTEGER,
        cristal_id INTEGER,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL,
        FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id),
        FOREIGN KEY (cristal_id) REFERENCES cristales(id)
      )
    `);

        await dbRun(`
      CREATE TABLE IF NOT EXISTS usuarios (
        ${idCol},
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        rol TEXT NOT NULL DEFAULT 'vendedor',
        nombre TEXT NOT NULL,
        activo INTEGER DEFAULT 1,
        creado_en ${datetime} DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await dbRun(`
      CREATE TABLE IF NOT EXISTS auditoria (
        ${idCol},
        usuario_id INTEGER,
        accion TEXT NOT NULL,
        tabla TEXT,
        registro_id INTEGER,
        detalle TEXT,
        ip TEXT,
        fecha ${datetime} DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await dbRun(`
      CREATE TABLE IF NOT EXISTS graduaciones (
        ${idCol},
        venta_id INTEGER NOT NULL UNIQUE,
        material TEXT,
        con_antirreflejo INTEGER DEFAULT 0,
        color TEXT,
        laca TEXT,
        calibrado TEXT,
        dp_derecho REAL,
        dp_izquierdo REAL,
        altura_derecho REAL,
        altura_izquierdo REAL,
        esf_od_lejos REAL,
        cil_od_lejos REAL,
        eje_od_lejos REAL,
        diametro_od_lejos REAL,
        esf_od_cerca REAL,
        cil_od_cerca REAL,
        eje_od_cerca REAL,
        diametro_od_cerca REAL,
        esf_oi_lejos REAL,
        cil_oi_lejos REAL,
        eje_oi_lejos REAL,
        diametro_oi_lejos REAL,
        esf_oi_cerca REAL,
        cil_oi_cerca REAL,
        eje_oi_cerca REAL,
        diametro_oi_cerca REAL,
        FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE
      )
    `);

        console.log('✅ Esquema de base de datos verificado/creado con éxito.');
        await cargarDatosSemilla();

    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error.message);
    }
};

async function cargarDatosSemilla() {
    const resultado = await dbQuery('SELECT COUNT(*) as cantidad FROM clientes');
    // En Postgres "cantidad" vuelve como string si count es bigint, por eso parseamos
    const count = parseInt(resultado[0].cantidad, 10);

    if (count === 0) {
        console.log('🌱 Base de datos vacía. Cargando datos de muestra...');
        await dbRun("INSERT INTO clientes (nombre, telefono, email) VALUES ('Juan Pérez', '555-0199', 'juan.perez@email.com')");
        await dbRun("INSERT INTO clientes (nombre, telefono, email) VALUES ('María Gómez', '555-0144', 'maria.gomez@email.com')");
        await dbRun("INSERT INTO productos (codigo, nombre, descripcion, precio, categoria) VALUES ('ARM-001', 'Armazón Ray-Ban Clubmaster', 'Estilo clásico retro de acetato.', 12500, 'Armazón de Sol')");
        await dbRun("INSERT INTO productos (codigo, nombre, descripcion, precio, categoria) VALUES ('LEN-002', 'Par de Cristales Antireflejo', 'Tratamiento protector de luz artificial.', 8000, 'Accesorio')");
        await dbRun("INSERT INTO productos (codigo, nombre, descripcion, precio, categoria) VALUES ('EST-003', 'Estuche Rígido con Microfibra', 'Protección clásica para anteojos.', 1500, 'Accesorio')");
        console.log('🌱 Datos semilla cargados correctamente.');
    }

    const usuariosCount = await dbQuery('SELECT COUNT(*) as cantidad FROM usuarios');
    if (parseInt(usuariosCount[0].cantidad, 10) === 0) {
        console.log('🌱 Creando usuario administrador inicial por defecto...');
        const hashedPassword = await bcrypt.hash(ENV.ADMIN_PASSWORD, ENV.BCRYPT_ROUNDS);
        await dbRun(
            'INSERT INTO usuarios (username, password, rol, nombre, activo) VALUES (?, ?, ?, ?, 1)',
            [ENV.ADMIN_USERNAME, hashedPassword, 'admin', ENV.ADMIN_NOMBRE]
        );
        console.log(`👤 Usuario admin creado: ${ENV.ADMIN_USERNAME}`);
    }
}

export default db;
