import sqlite3 from "sqlite3"
import path from "path"
import { fileURLToPath } from "url"
import bcrypt from "bcryptjs"
import ENV from "./env.js"

const _filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_filename)
const isTestEnv = process.env.NODE_ENV === 'test'
const dbPath = path.resolve(_dirname, isTestEnv ? '../../database.test.sqlite' : '../../database.sqlite')


const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar la base de datos', err.message);
    } else {
        console.log(`Conectado con exito a la base de datos SQLite (${isTestEnv ? 'TEST' : 'PROD'}).`)
    }

})


// --- ENVOLTORIO DE PROMESAS (Para usar async/await) ---

// Para consultas de lectura (SELECT)
export const dbQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Para consultas de escritura (INSERT, UPDATE, DELETE, CREATE TABLE)
export const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            // 'this' contiene información del último registro afectado
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

// --- CREACIÓN DEL ESQUEMA E INICIALIZACIÓN ---

export const inicializarBaseDeDatos = async () => {
    try {
        // 1. Activamos claves foráneas para validar relaciones de datos
        await dbRun('PRAGMA foreign_keys = ON;');
        console.log('🛡️ Validación de claves foráneas activada.');

        // 2. Tabla Clientes
        await dbRun(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT,
        email TEXT,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // 3. Tabla Productos (Con categoría)
        await dbRun(`
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio REAL NOT NULL,
        categoria TEXT DEFAULT 'Armazón de Vista'
      )
    `);

        // 4. Tabla Ventas (Cabecera)
        await dbRun(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        total REAL NOT NULL,
        descripcion TEXT,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

        // 4.5 Tabla Cristales
        await dbRun(`
      CREATE TABLE IF NOT EXISTS cristales (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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

        // 5. Tabla Detalle de Ventas (Renglones)
        await dbRun(`
      CREATE TABLE IF NOT EXISTS detalle_ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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

        // 6. Tabla Usuarios (Autenticación y RBAC)
        await dbRun(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        rol TEXT NOT NULL DEFAULT 'vendedor',
        nombre TEXT NOT NULL,
        activo INTEGER DEFAULT 1,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // 7. Tabla Auditoría
        await dbRun(`
      CREATE TABLE IF NOT EXISTS auditoria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        accion TEXT NOT NULL,
        tabla TEXT,
        registro_id INTEGER,
        detalle TEXT,
        ip TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // 8. Tabla Graduaciones (Receta / Pedido óptico)
        await dbRun(`
      CREATE TABLE IF NOT EXISTS graduaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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

        // 7. Cargamos algunos datos semilla para no arrancar con la base vacía
        await cargarDatosSemilla();

    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error.message);
    }
};

// Función auxiliar para rellenar la base de datos la primera vez
async function cargarDatosSemilla() {
    // Comprobamos si ya existen clientes para no duplicar datos cada vez que reiniciamos el servidor
    const resultado = await dbQuery('SELECT COUNT(*) as cantidad FROM clientes');

    if (resultado[0].cantidad === 0) {
        console.log('🌱 Base de datos vacía. Cargando datos de muestra...');

        // Clientes semilla
        await dbRun("INSERT INTO clientes (nombre, telefono, email) VALUES ('Juan Pérez', '555-0199', 'juan.perez@email.com')");
        await dbRun("INSERT INTO clientes (nombre, telefono, email) VALUES ('María Gómez', '555-0144', 'maria.gomez@email.com')");

        // Productos semilla
        await dbRun("INSERT INTO productos (codigo, nombre, descripcion, precio, categoria) VALUES ('ARM-001', 'Armazón Ray-Ban Clubmaster', 'Estilo clásico retro de acetato.', 12500, 'Armazón de Sol')");
        await dbRun("INSERT INTO productos (codigo, nombre, descripcion, precio, categoria) VALUES ('LEN-002', 'Par de Cristales Antireflejo', 'Tratamiento protector de luz artificial.', 8000, 'Accesorio')");
        await dbRun("INSERT INTO productos (codigo, nombre, descripcion, precio, categoria) VALUES ('EST-003', 'Estuche Rígido con Microfibra', 'Protección clásica para anteojos.', 1500, 'Accesorio')");

        console.log('🌱 Datos semilla cargados correctamente.');
    }

    // Comprobamos si ya existen usuarios para crear el admin inicial si está vacío
    const usuariosCount = await dbQuery('SELECT COUNT(*) as cantidad FROM usuarios');
    if (usuariosCount[0].cantidad === 0) {
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
