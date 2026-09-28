import VentaService from "../services/venta.service.js";

const VentaController = {
    async obtenerVentas(req, res) {
        const { dni, cliente_id, buscar, nombre, apellido, fechaDesde, fechaHasta } = req.query;
        const ventas = await VentaService.obtenerVentas({
            dni,
            cliente_id,
            buscar,
            nombre,
            apellido,
            fechaDesde,
            fechaHasta
        });
        res.json(ventas);
    },

    async obtenerVentaPorId(req, res) {
        const { id } = req.params;
        const venta = await VentaService.obtenerVentaPorId(id);
        res.json(venta);
    },

    async crearVenta(req, res) {
        const { cliente_id, items, descripcion, graduacion } = req.body;
        const ventaId = await VentaService.crearVenta({ cliente_id, items, descripcion, graduacion });
        res.status(201).json({ id: ventaId, ventaId, message: 'Venta registrada con éxito.' });
    },

    async eliminarVenta(req, res) {
        const { id } = req.params;
        await VentaService.eliminarVenta(id);
        res.json({ message: 'Venta eliminada correctamente.' });
    }
};

export default VentaController;
