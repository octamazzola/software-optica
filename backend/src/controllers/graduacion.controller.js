import GraduacionService from '../services/graduacion.service.js';

const GraduacionController = {
    async obtenerPorVentaId(req, res) {
        const { ventaId } = req.params;
        const graduacion = await GraduacionService.obtenerPorVentaId(ventaId);
        res.json(graduacion);
    }
};

export default GraduacionController;
