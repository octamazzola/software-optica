import { dbQuery, dbRun } from '../config/db.js';

const ProductoRepository = {
    async obtenerTodos(buscar = '') {
        if (buscar) {
            const sql = 'SELECT * FROM productos WHERE codigo LIKE ? OR nombre LIKE ? ORDER BY nombre ASC';
            const termino = `%${buscar}%`
            return await dbQuery(sql, [termino, termino]);
        }
        // Si no hay búsqueda, retornamos todos los productos
        return await dbQuery('SELECT * FROM productos ORDER BY nombre ASC');
    },


    async obtenerPorCodigo(codigo) {
        // Ejecutamos la consulta en la base de datos
        const rows = await dbQuery('SELECT * FROM productos WHERE codigo = ?', [codigo]);
        return rows[0] || null;
    },

    async crear({ codigo, nombre, precio, descripcion }) {
        const sql = `
            INSERT INTO productos (codigo, nombre, precio, descripcion) 
            VALUES (?, ?, ?, ?)
        `;
        const resultado = await dbRun(sql, [codigo, nombre, precio, descripcion]);
        return resultado.id; // Retornamos directamente el ID creado
    },

    async actualizar(codigo, { nombre, precio, descripcion }) {
        const sql = `
            UPDATE productos
            SET nombre = ?, precio = ?, descripcion = ?
            WHERE codigo = ?
        `;
        const resultado = await dbRun(sql, [nombre, precio, descripcion, codigo]);
        return resultado.changes > 0;
    },
    async eliminar(codigo) {
        const resultado = await dbRun('DELETE FROM productos WHERE codigo = ?', [codigo]);
        return resultado.changes > 0;
    }

};

export default ProductoRepository;



