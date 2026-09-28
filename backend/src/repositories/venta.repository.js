import { dbQuery, dbRun } from '../config/db.js';

const VentaRepository = {
    async obtenerTodas(filtros = {}) {
        let paramsObj = filtros;
        if (typeof filtros === 'string') {
            paramsObj = { dni: filtros, cliente_id: arguments[1] || null };
        }
        const { dni, cliente_id, buscar, nombre, apellido, fechaDesde, fechaHasta } = paramsObj || {};

        let sql = `
            select v.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido, c.dni as cliente_dni
            from ventas v join clientes c on v.cliente_id = c.id
            where 1=1
        `;
        const params = [];

        // Búsqueda flexible por texto: nombre, apellido, combinación o DNI
        if (buscar && buscar.trim()) {
            const term = `%${buscar.trim()}%`;
            sql += ` AND (c.nombre LIKE ? OR c.apellido LIKE ? OR (c.nombre || ' ' || c.apellido) LIKE ? OR (c.apellido || ' ' || c.nombre) LIKE ? OR c.dni LIKE ?)`;
            params.push(term, term, term, term, term);
        }

        if (dni && dni.trim()) {
            sql += ` AND c.dni LIKE ?`;
            params.push(`%${dni.trim()}%`);
        }

        if (nombre && nombre.trim()) {
            sql += ` AND c.nombre LIKE ?`;
            params.push(`%${nombre.trim()}%`);
        }

        if (apellido && apellido.trim()) {
            sql += ` AND c.apellido LIKE ?`;
            params.push(`%${apellido.trim()}%`);
        }

        if (cliente_id) {
            sql += ` AND v.cliente_id = ?`;
            params.push(cliente_id);
        }

        // Filtro por rango de fechas (YYYY-MM-DD)
        if (fechaDesde && fechaDesde.trim()) {
            sql += ` AND date(v.fecha) >= ?`;
            params.push(fechaDesde.trim());
        }

        if (fechaHasta && fechaHasta.trim()) {
            sql += ` AND date(v.fecha) <= ?`;
            params.push(fechaHasta.trim());
        }

        sql += ` order by v.fecha desc`;
        return await dbQuery(sql, params);
    },

    async obtenerPorId(ventaId) {
        const sql = `
        select v.*, c.nombre as cliente_nombre
        from ventas v join clientes c on v.cliente_id = c.id
        where v.id = ?`;
        const rows = await dbQuery(sql, [ventaId]);
        return rows[0] || null;
    },

    async obtenerDetallePorVentaId(ventaId) {
        const sql = `
        select dv.precio_unitario, dv.cantidad, 
               p.nombre as producto_nombre,
               c.descripcion as cristal_descripcion,
               c.material as cristal_material
        from detalle_ventas dv 
        left join productos p on dv.producto_id = p.id
        left join cristales c on dv.cristal_id = c.id
        where dv.venta_id = ?`;
        return await dbQuery(sql, [ventaId]);
    },

    async crearVenta({ cliente_id, total, descripcion }) {
        const sql = `
        insert into ventas (cliente_id, total, descripcion)
        values (?, ?, ?)`;
        const resultado = await dbRun(sql, [cliente_id, total, descripcion || '']);
        return resultado.id;
    },

    async crearDetalleVenta({ venta_id, producto_id, cristal_id, cantidad, precio_unitario }) {
        const sql = `
        insert into detalle_ventas (venta_id, producto_id, cristal_id, cantidad, precio_unitario)
        values (?, ?, ?, ?, ?)`;
        const resultado = await dbRun(sql, [venta_id, producto_id || null, cristal_id || null, cantidad, precio_unitario]);
        return resultado.id;
    },

    async eliminar(id) {
        await dbRun('DELETE FROM detalle_ventas WHERE venta_id = ?', [id]);
        await dbRun('DELETE FROM graduaciones WHERE venta_id = ?', [id]);
        const resultado = await dbRun('DELETE FROM ventas WHERE id = ?', [id]);
        return resultado.changes > 0;
    }
};
export default VentaRepository;