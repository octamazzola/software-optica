import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const dbPath = path.resolve(_dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);

const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const allQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

async function migrateProductos() {
    try {
        await runQuery('BEGIN TRANSACTION;');

        console.log('Migrando tabla productos...');

        // 1. Obtener todos los productos
        const productosAnteriores = await allQuery('SELECT * FROM productos;');
        console.log(`Encontrados ${productosAnteriores.length} productos.`);

        // 2. Crear tabla nueva sin UNIQUE en codigo
        await runQuery(`
            CREATE TABLE IF NOT EXISTS productos_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo TEXT NOT NULL,
                nombre TEXT NOT NULL,
                descripcion TEXT,
                precio REAL NOT NULL
            );
        `);

        // 3. Insertar datos en tabla nueva
        for (const p of productosAnteriores) {
            await runQuery(`
                INSERT INTO productos_new (id, codigo, nombre, descripcion, precio)
                VALUES (?, ?, ?, ?, ?)
            `, [p.id, p.codigo, p.nombre, p.descripcion, p.precio]);
        }

        // 4. Reemplazar tabla vieja por nueva
        await runQuery('PRAGMA foreign_keys = OFF;');
        await runQuery('DROP TABLE productos;');
        await runQuery('ALTER TABLE productos_new RENAME TO productos;');
        await runQuery('PRAGMA foreign_keys = ON;');

        await runQuery('COMMIT;');
        console.log('✅ Migración de productos completada exitosamente.');

    } catch (error) {
        await runQuery('ROLLBACK;');
        console.error('❌ Error durante la migración de productos:', error);
    } finally {
        db.close();
    }
}

migrateProductos();
