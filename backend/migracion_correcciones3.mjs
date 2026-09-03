import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const dbPath = path.resolve(_dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar la base de datos', err.message);
        process.exit(1);
    }
});

const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

const dbQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

async function migrar() {
    try {
        console.log('Iniciando migración de Correcciones 3...');

        // 1. Añadir columna 'categoria' a 'productos'
        try {
            await dbRun(`ALTER TABLE productos ADD COLUMN categoria TEXT DEFAULT 'Armazón de Vista'`);
            console.log('Columna categoria añadida a productos.');
        } catch (e) {
            if (e.message.includes('duplicate column name')) {
                console.log('La columna categoria ya existe en productos.');
            } else {
                throw e;
            }
        }

        // 2. Crear tabla 'cristales'
        await dbRun(`
            CREATE TABLE IF NOT EXISTS cristales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                material TEXT,
                tipo_lente TEXT,
                tratamiento TEXT,
                con_antirreflejo INTEGER,
                descripcion TEXT,
                precio_tradicional REAL,
                precio_digital REAL,
                precio_ar_eternal REAL
            )
        `);
        console.log('Tabla cristales creada o verificada.');

        // 3. Añadir columna 'descripcion' a 'ventas'
        try {
            await dbRun(`ALTER TABLE ventas ADD COLUMN descripcion TEXT`);
            console.log('Columna descripcion añadida a ventas.');
        } catch (e) {
            if (e.message.includes('duplicate column name')) {
                console.log('La columna descripcion ya existe en ventas.');
            } else {
                throw e;
            }
        }

        // 4. Recrear 'detalle_ventas' para permitir producto_id nulo y agregar cristal_id
        console.log('Recreando tabla detalle_ventas...');
        await dbRun(`PRAGMA foreign_keys=off`);
        
        await dbRun(`ALTER TABLE detalle_ventas RENAME TO detalle_ventas_old`);
        
        await dbRun(`
            CREATE TABLE detalle_ventas (
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

        // Insertar los datos viejos
        await dbRun(`
            INSERT INTO detalle_ventas (id, venta_id, producto_id, cantidad, precio_unitario)
            SELECT id, venta_id, producto_id, cantidad, precio_unitario FROM detalle_ventas_old
        `);

        await dbRun(`DROP TABLE detalle_ventas_old`);
        
        await dbRun(`PRAGMA foreign_keys=on`);
        console.log('Tabla detalle_ventas migrada correctamente.');

        // 5. Obtener y mostrar productos categorizados por defecto
        const productosDefault = await dbQuery("SELECT id, codigo, nombre FROM productos WHERE categoria = 'Armazón de Vista'");
        console.log('\n--- PRODUCTOS RECATEGORIZADOS POR DEFECTO ---');
        console.log('Cantidad total:', productosDefault.length);
        productosDefault.forEach(p => console.log(`[${p.id}] ${p.codigo} - ${p.nombre}`));
        console.log('---------------------------------------------\n');

        console.log('Migración completada con éxito.');
    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        db.close();
    }
}

migrar();
