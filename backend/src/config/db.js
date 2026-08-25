import sqlite3 from "sqlite3"
import path from "path"
import { fileURLToPath } from "url"

const _filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_filename)
const dbPath = path.resolve(_dirname, '../../database.sqlite')


const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar la base de datos', err.message);
    } else {
        console.log('Conectado con exito a la base de datos SQLite.')
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

        // 3. Tabla Productos (Con código único)
        await dbRun(`
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio REAL NOT NULL
      )
    `);

        // 4. Tabla Ventas (Cabecera)
        await dbRun(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        total REAL NOT NULL,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

        // 5. Tabla Detalle de Ventas (Renglones)
        await dbRun(`
      CREATE TABLE IF NOT EXISTS detalle_ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venta_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL,
        FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      )
    `);

        console.log('✅ Esquema de base de datos verificado/creado con éxito.');

        // 6. Cargamos algunos datos semilla para no arrancar con la base vacía
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
        await dbRun("INSERT INTO productos (codigo, nombre, descripcion, precio) VALUES ('ARM-001', 'Armazón Ray-Ban Clubmaster', 'Estilo clásico retro de acetato.', 12500)");
        await dbRun("INSERT INTO productos (codigo, nombre, descripcion, precio) VALUES ('LEN-002', 'Par de Cristales Antireflejo', 'Tratamiento protector de luz artificial.', 8000)");
        await dbRun("INSERT INTO productos (codigo, nombre, descripcion, precio) VALUES ('EST-003', 'Estuche Rígido con Microfibra', 'Protección clásica para anteojos.', 1500)");

        console.log('🌱 Datos semilla cargados correctamente.');
    }
}

export default db;
