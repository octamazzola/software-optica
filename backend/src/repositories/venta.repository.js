import { dbQuery, dbRun } from '../config/db.js';

const VentaRepository = {
    async obtenerTodas() {
        const sql = `
        select v.*, c.nombre as cliente_nombre
        from ventas v join clientes c on v.cliente_id = c.id
        order by v.fecha desc`;
        return await dbQuery(sql);
    },

    async obtenerDetallePorVentaId(ventaId) {
        const sql = `
        select dv.precio_unitario, dv.cantidad, p.nombre as producto_nombre
        from detalle_ventas dv join productos p on dv.producto_id = p.id
        where dv.venta_id = ?`;
        return await dbQuery(sql, [ventaId]);
    },

    async crearVenta({ cliente_id, total }) {
        const sql = `
        insert into ventas (cliente_id, total)
        values (?, ?)`;
        const resultado = await dbRun(sql, [cliente_id, total]);
        return resultado.id;
    },

    async crearDetalleVenta({ venta_id, producto_id, cantidad, precio_unitario }) {
        const sql = `
        insert into detalle_ventas (venta_id, producto_id, cantidad, precio_unitario)
        values (?, ?, ?, ?)`;
        const resultado = await dbRun(sql, [venta_id, producto_id, cantidad, precio_unitario]);
        return resultado.id;
    }
};
export default VentaRepository;