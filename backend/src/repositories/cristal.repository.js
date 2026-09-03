import { dbQuery, dbRun } from '../config/db.js';

const CristalRepository = {
    async obtenerTodos(filtros = {}) {
        let sql = 'SELECT * FROM cristales WHERE 1=1';
        const params = [];
        
        if (filtros.material) {
            sql += ' AND material = ?';
            params.push(filtros.material);
        }
        if (filtros.tipo_lente) {
            sql += ' AND tipo_lente = ?';
            params.push(filtros.tipo_lente);
        }
        if (filtros.tratamiento) {
            sql += ' AND tratamiento LIKE ?';
            params.push(`%${filtros.tratamiento}%`);
        }
        
        sql += ' ORDER BY material, tipo_lente, descripcion';
        return await dbQuery(sql, params);
    },

    async obtenerPorId(id) {
        const rows = await dbQuery('SELECT * FROM cristales WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async crear({ material, tipo_lente, tratamiento, con_antirreflejo, con_blue_cut, con_fotocromatico, descripcion, precio_tradicional, precio_digital, precio_ar_eternal }) {
        const sql = `
            INSERT INTO cristales (material, tipo_lente, tratamiento, con_antirreflejo, con_blue_cut, con_fotocromatico, descripcion, precio_tradicional, precio_digital, precio_ar_eternal) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            material, 
            tipo_lente, 
            tratamiento || '', 
            con_antirreflejo ? 1 : 0,
            con_blue_cut ? 1 : 0,
            con_fotocromatico ? 1 : 0, 
            descripcion || '', 
            precio_tradicional || null, 
            precio_digital || null, 
            precio_ar_eternal || null
        ];
        const resultado = await dbRun(sql, params);
        return resultado.id;
    },

    async actualizar(id, { material, tipo_lente, tratamiento, con_antirreflejo, con_blue_cut, con_fotocromatico, descripcion, precio_tradicional, precio_digital, precio_ar_eternal }) {
        const sql = `
            UPDATE cristales
            SET material = ?, tipo_lente = ?, tratamiento = ?, con_antirreflejo = ?, con_blue_cut = ?, con_fotocromatico = ?, descripcion = ?, 
                precio_tradicional = ?, precio_digital = ?, precio_ar_eternal = ?
            WHERE id = ?
        `;
        const params = [
            material, 
            tipo_lente, 
            tratamiento || '', 
            con_antirreflejo ? 1 : 0,
            con_blue_cut ? 1 : 0,
            con_fotocromatico ? 1 : 0, 
            descripcion || '', 
            precio_tradicional || null, 
            precio_digital || null, 
            precio_ar_eternal || null, 
            id
        ];
        const resultado = await dbRun(sql, params);
        return resultado.changes > 0;
    },

    async eliminar(id) {
        const resultado = await dbRun('DELETE FROM cristales WHERE id = ?', [id]);
        return resultado.changes > 0;
    },
    
    async truncar() {
        await dbRun('DELETE FROM cristales');
        // Opcional: Reiniciar la secuencia de IDs si SQLite
        await dbRun("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'cristales'").catch(() => {});
        return true;
    }
};

export default CristalRepository;
