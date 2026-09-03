import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_DIR = path.dirname(__dirname);
const DB_PATH = path.join(BACKEND_DIR, 'database.sqlite');
const BACKUP_DIR = path.join(BACKEND_DIR, 'backups');

async function testRestore() {
    try {
        console.log('[TEST] Iniciando script de validación de Backup y Restore...');
        
        // 1. Ejecutar el backup (simular que fue llamado antes)
        // Ya que el script test_backup_restore no debe duplicar logica, importaremos o ejecutaremos el backup
        // Pero para ser mas robustos y no fallar en CJS/ESM mix, lo ejecutamos via execSync (o similar)
        // En lugar de eso, corremos un simple volcado de DB a la carpeta backups si no hay
        const backups = fs.existsSync(BACKUP_DIR) ? fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.sqlite')) : [];
        if (backups.length === 0) {
            console.error('[ERROR] No hay backups disponibles en', BACKUP_DIR);
            process.exit(1);
        }
        
        const latestBackup = backups.sort().reverse()[0];
        const backupPath = path.join(BACKUP_DIR, latestBackup);
        console.log(`[TEST] Backup más reciente seleccionado: ${latestBackup}`);

        const originalRenamed = DB_PATH + '.original.bak';
        console.log(`[TEST] Paso 1: Moviendo DB original a ${originalRenamed} para simular caída de producción...`);
        fs.renameSync(DB_PATH, originalRenamed);

        console.log(`[TEST] Paso 2: Restaurando backup desde ${backupPath} a ${DB_PATH}...`);
        fs.copyFileSync(backupPath, DB_PATH);

        console.log('[TEST] Paso 3: Conectando a la base de datos restaurada y haciendo query de lectura...');
        
        const testResult = await new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
                if (err) return reject(err);
            });
            
            db.all('SELECT COUNT(*) as cuenta FROM clientes', (err, rows) => {
                db.close();
                if (err) return reject(err);
                resolve(rows[0]);
            });
        });

        console.log(`[TEST] ÉXITO: Se pudo leer la base restaurada. Total de clientes = ${testResult.cuenta}`);

        console.log('[TEST] Paso 4: Devolviendo la base de datos ORIGINAL a su lugar para no perder datos vivos...');
        fs.unlinkSync(DB_PATH);
        fs.renameSync(originalRenamed, DB_PATH);
        console.log('[TEST] Base original restaurada. Validación COMPLETADA con estado VERIFIED.');
        
    } catch (e) {
        console.error('[ERROR] La verificación falló:', e);
        
        // Safety fallback para no dejar la app sin la DB original
        if (fs.existsSync(DB_PATH + '.original.bak')) {
            console.log('[RESTORE FALLBACK] Restaurando la original tras el error...');
            if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
            fs.renameSync(DB_PATH + '.original.bak', DB_PATH);
        }
        process.exit(1);
    }
}

testRestore();
