import GraduacionRepository from '../repositories/graduacion.repository.js';

const GraduacionService = {
    async obtenerPorVentaId(ventaId) {
        return await GraduacionRepository.obtenerPorVentaId(ventaId);
    },

    async crear(datos) {
        if (!datos.venta_id) {
            throw new Error('La graduación debe estar asociada a un ID de venta válido.');
        }
        return await GraduacionRepository.crear(datos);
    }
};

export default GraduacionService;
