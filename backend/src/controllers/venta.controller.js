import VentaService from "../services/venta.service.js";

const VentaController = {
    async obtenerVentas(req, res) {
        const { dni, cliente_id } = req.query;
        const ventas = await VentaService.obtenerVentas(dni, cliente_id);
        res.json(ventas);
    },

    async obtenerVentaPorId(req, res) {
        const { id } = req.params;
        const venta = await VentaService.obtenerVentaPorId(id);
        res.json(venta);
    },

    async crearVenta(req, res) {
        const { cliente_id, items, descripcion, graduacion } = req.body;
        const venta = await VentaService.crearVenta({ cliente_id, items, descripcion, graduacion });
        res.json(venta);
    }
};

export default VentaController;
