import CristalRepository from '../repositories/cristal.repository.js';

const CristalService = {
    async obtenerCristales(filtros = {}) {
        return await CristalRepository.obtenerTodos(filtros);
    },

    async obtenerPorId(id) {
        const cristal = await CristalRepository.obtenerPorId(id);
        if (!cristal) {
            throw Error(`El cristal con el id ${id} no existe.`);
        }
        return cristal;
    },

    async crearCristal(datos) {
        if (!datos.material || datos.material.trim() === '') {
            throw Error('El material es obligatorio.');
        }
        if (!datos.tipo_lente || datos.tipo_lente.trim() === '') {
            throw Error('El tipo de lente es obligatorio.');
        }

        return await CristalRepository.crear(datos);
    },

    async actualizarCristal(id, datos) {
        await this.obtenerPorId(id);
        
        if (!datos.material || datos.material.trim() === '') {
            throw Error('El material es obligatorio.');
        }
        if (!datos.tipo_lente || datos.tipo_lente.trim() === '') {
            throw Error('El tipo de lente es obligatorio.');
        }

        return await CristalRepository.actualizar(id, datos);
    },

    async eliminarCristal(id) {
        await this.obtenerPorId(id);
        return await CristalRepository.eliminar(id);
    },

    async reemplazarTodos(cristalesNuevos) {
        // En una aplicación real usaríamos transacciones SQLite.
        // Aquí simplificamos truncando e insertando uno por uno o en batch.
        await CristalRepository.truncar();
        
        let agregados = 0;
        for (const c of cristalesNuevos) {
            await CristalRepository.crear(c);
            agregados++;
        }
        return agregados;
    }
};

export default CristalService;
