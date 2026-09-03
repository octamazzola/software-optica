import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_DIR = path.dirname(__dirname);
const DB_PATH = path.join(BACKEND_DIR, 'database.sqlite');
const BACKUP_DIR = path.join(BACKEND_DIR, 'backups');

function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

function deleteOldBackups(backupDir, daysToKeep = 30) {
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    let deletedCount = 0;

    files.forEach(file => {
        if (file.startsWith('db_') && file.endsWith('.sqlite')) {
            const filePath = path.join(backupDir, file);
            const stats = fs.statSync(filePath);
            const daysOld = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);
            
            if (daysOld > daysToKeep) {
                fs.unlinkSync(filePath);
                deletedCount++;
            }
        }
    });
    
    if (deletedCount > 0) {
        console.log(`[LIMPIEZA] Se eliminaron ${deletedCount} backups antiguos (mayores a ${daysToKeep} días).`);
    }
}

async function verifyDatabase(dbPath) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) return reject(err);
        });
        
        // Ejecutar un PRAGMA integrity_check para asegurar que el backup sea válido
        db.get('PRAGMA integrity_check;', (err, row) => {
            db.close();
            if (err) {
                return reject(err);
            }
            if (row.integrity_check !== 'ok') {
                return reject(new Error('La base de datos falló el chequeo de integridad: ' + row.integrity_check));
            }
            resolve(true);
        });
    });
}

async function performBackup() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            console.error(`[ERROR] No se encontró la base de datos en ${DB_PATH}`);
            process.exit(1);
        }

        ensureDirectoryExists(BACKUP_DIR);

        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        
        const fechaStr = `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
        const backupFile = path.join(BACKUP_DIR, `db_${fechaStr}.sqlite`);

        console.log(`[BACKUP] Copiando base de datos a ${backupFile}...`);
        fs.copyFileSync(DB_PATH, backupFile);
        
        const stats = fs.statSync(backupFile);
        const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`[BACKUP] Creado con éxito. Tamaño: ${sizeMb} MB`);

        console.log(`[BACKUP] Verificando integridad del backup creado...`);
        await verifyDatabase(backupFile);
        console.log(`[BACKUP] Integridad verificada. ¡El archivo es válido!`);

        deleteOldBackups(BACKUP_DIR);
        
        console.log(`[BACKUP] Proceso completado exitosamente.`);
    } catch (error) {
        console.error(`[ERROR] Falló el proceso de backup: ${error.message}`);
        process.exit(1);
    }
}

performBackup();
