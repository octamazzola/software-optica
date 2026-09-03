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

async function migrate() {
    try {
        await runQuery('BEGIN TRANSACTION;');

        // 1. Obtener datos actuales
        const clientesAnteriores = await allQuery('SELECT * FROM clientes;');
        console.log(`Migrando ${clientesAnteriores.length} clientes...`);

        // 2. Crear nueva tabla temporal con el esquema actualizado
        await runQuery(`
            CREATE TABLE IF NOT EXISTS clientes_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                apellido TEXT NOT NULL,
                dni TEXT UNIQUE NOT NULL,
                telefono TEXT,
                email TEXT,
                fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Backfill de datos (migrando y adaptando registros)
        let dniCounter = 10000000;
        for (const c of clientesAnteriores) {
            // Dividir nombre completo en nombre y apellido como backfill básico
            const partes = c.nombre.split(' ');
            const nombre = partes[0] || c.nombre;
            const apellido = partes.slice(1).join(' ') || 'Sin Apellido';
            
            // Asignar un DNI ficticio secuencial a los que ya existen para cumplir UNIQUE y NOT NULL
            const dni = dniCounter.toString();
            dniCounter++;

            await runQuery(`
                INSERT INTO clientes_new (id, nombre, apellido, dni, telefono, email, fecha_registro)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [c.id, nombre, apellido, dni, c.telefono, c.email, c.fecha_registro]);
            
            console.log(`Migrado: ${c.nombre} -> Nombre: ${nombre}, Apellido: ${apellido}, DNI: ${dni}`);
        }

        // 4. Actualizar las referencias de claves foráneas
        // Desactivamos temporalmente para permitir el drop y rename
        await runQuery('PRAGMA foreign_keys = OFF;');

        // Eliminar la tabla vieja
        await runQuery('DROP TABLE clientes;');

        // Renombrar la tabla nueva
        await runQuery('ALTER TABLE clientes_new RENAME TO clientes;');

        // Reactivar foreign keys
        await runQuery('PRAGMA foreign_keys = ON;');

        await runQuery('COMMIT;');
        console.log('✅ Migración completada exitosamente.');

    } catch (error) {
        await runQuery('ROLLBACK;');
        console.error('❌ Error durante la migración:', error);
    } finally {
        db.close();
    }
}

migrate();
