import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const dbPath = path.resolve(_dirname, 'backend', 'database.sqlite');

const db = new sqlite3.Database(dbPath);

const dbQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

async function migrar() {
    console.log("Iniciando migración de cristales...");

    try {
        // Añadir columnas si no existen
        try {
            await dbRun("ALTER TABLE cristales ADD COLUMN con_blue_cut INTEGER DEFAULT 0");
            console.log("Columna con_blue_cut añadida.");
        } catch (e) {
            if (!e.message.includes("duplicate column name")) throw e;
            console.log("La columna con_blue_cut ya existe.");
        }

        try {
            await dbRun("ALTER TABLE cristales ADD COLUMN con_fotocromatico INTEGER DEFAULT 0");
            console.log("Columna con_fotocromatico añadida.");
        } catch (e) {
            if (!e.message.includes("duplicate column name")) throw e;
            console.log("La columna con_fotocromatico ya existe.");
        }

        // Obtener todos los cristales para migrar tratamientos
        const cristales = await dbQuery("SELECT id, tratamiento FROM cristales");
        
        let actualizados = 0;
        
        for (const cristal of cristales) {
            let tratamiento = cristal.tratamiento || "";
            let con_blue_cut = 0;
            let con_fotocromatico = 0;
            
            const original = tratamiento;
            const tratUpper = tratamiento.toUpperCase();
            
            if (tratUpper.includes("BLUE CUT") || tratUpper.includes("BLUECUT")) {
                con_blue_cut = 1;
                tratamiento = tratamiento.replace(/blue\s*cut/i, "");
            }
            if (tratUpper.includes("FOTOCROMATICO") || tratUpper.includes("FOTOCROMÁTICO")) {
                con_fotocromatico = 1;
                tratamiento = tratamiento.replace(/fotocrom[aá]tico/i, "");
            }
            
            // Limpiar texto restante
            tratamiento = tratamiento.replace(/^[,\s\+]+|[,\s\+]+$/g, "").trim();
            
            await dbRun("UPDATE cristales SET con_blue_cut = ?, con_fotocromatico = ?, tratamiento = ? WHERE id = ?", 
                [con_blue_cut, con_fotocromatico, tratamiento, cristal.id]
            );
            actualizados++;
        }
        
        console.log(`Migración completada. ${actualizados} cristales revisados/actualizados.`);
        process.exit(0);
        
    } catch (e) {
        console.error("Error durante la migración:", e);
        process.exit(1);
    }
}

migrar();
