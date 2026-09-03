import { dbQuery, dbRun } from '../config/db.js';

const ProductoRepository = {
    async obtenerTodos(buscar = '', categoria = '') {
        let sql = 'SELECT * FROM productos WHERE 1=1';
        const params = [];
        if (buscar) {
            sql += ' AND (codigo LIKE ? OR nombre LIKE ?)';
            params.push(`%${buscar}%`, `%${buscar}%`);
        }
        if (categoria) {
            sql += ' AND categoria = ?';
            params.push(categoria);
        }
        sql += ' ORDER BY nombre ASC';
        return await dbQuery(sql, params);
    },

    async obtenerMasVendidos() {
        const sql = `
            SELECT p.id, p.codigo, p.nombre, p.precio, p.descripcion, p.categoria, SUM(dv.cantidad) as total_vendido
            FROM productos p
            JOIN detalle_ventas dv ON p.id = dv.producto_id
            GROUP BY p.id
            ORDER BY total_vendido DESC
            LIMIT 5
        `;
        return await dbQuery(sql);
    },


    async obtenerPorCodigo(codigo) {
        // Ejecutamos la consulta en la base de datos
        const rows = await dbQuery('SELECT * FROM productos WHERE codigo = ?', [codigo]);
        return rows[0] || null;
    },

    async obtenerPorId(id) {
        const rows = await dbQuery('SELECT * FROM productos WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async crear({ codigo, nombre, precio, descripcion, categoria }) {
        const cat = categoria || 'Armazón de Vista';
        const sql = `
            INSERT INTO productos (codigo, nombre, precio, descripcion, categoria) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const resultado = await dbRun(sql, [codigo, nombre, precio, descripcion, cat]);
        return resultado.id; // Retornamos directamente el ID creado
    },

    async actualizar(id, { codigo, nombre, precio, descripcion, categoria }) {
        const cat = categoria || 'Armazón de Vista';
        const sql = `
            UPDATE productos
            SET codigo = ?, nombre = ?, precio = ?, descripcion = ?, categoria = ?
            WHERE id = ?
        `;
        const resultado = await dbRun(sql, [codigo, nombre, precio, descripcion, cat, id]);
        return resultado.changes > 0;
    },
    async eliminar(id) {
        const resultado = await dbRun('DELETE FROM productos WHERE id = ?', [id]);
        return resultado.changes > 0;
    }

};

export default ProductoRepository;



