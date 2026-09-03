import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_DIR = __dirname;
const DB_PATH = path.join(BACKEND_DIR, 'database.sqlite');
const BACKUP_DIR = path.join(BACKEND_DIR, 'backups');

let logContent = '';
function log(msg) {
    logContent += msg + '\n';
}

function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

async function verifyDatabase(dbPath) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) return reject(err);
        });
        
        db.get('PRAGMA integrity_check;', (err, row) => {
            db.close();
            if (err) return reject(err);
            if (row.integrity_check !== 'ok') return reject(new Error('Fallo integridad'));
            resolve(true);
        });
    });
}

async function performBackup() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            log(`[ERROR] No se encontró DB en ${DB_PATH}`);
            fs.writeFileSync('backup_out.txt', logContent);
            process.exit(1);
        }

        ensureDirectoryExists(BACKUP_DIR);
        const fechaStr = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(BACKUP_DIR, `db_${fechaStr}.sqlite`);

        log(`[BACKUP] Copiando a ${backupFile}...`);
        fs.copyFileSync(DB_PATH, backupFile);
        
        const stats = fs.statSync(backupFile);
        log(`[BACKUP] Creado. Tamaño: ${(stats.size / (1024*1024)).toFixed(2)} MB`);

        log(`[BACKUP] Verificando...`);
        await verifyDatabase(backupFile);
        log(`[BACKUP] Verificado exitosamente.`);

        fs.writeFileSync('backup_out.txt', logContent);
    } catch (e) {
        log(`[ERROR] Falló el proceso: ${e.message}`);
        fs.writeFileSync('backup_out.txt', logContent);
    }
}

performBackup();
