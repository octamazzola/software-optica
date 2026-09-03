import CristalService from "../services/cristal.service.js";


const CristalController = {
    async obtenerCristales(req, res) {
        const filtros = {
            material: req.query.material,
            tipo_lente: req.query.tipo_lente,
            tratamiento: req.query.tratamiento
        };
        const cristales = await CristalService.obtenerCristales(filtros);
        res.json(cristales);
    },

    async obtenerPorId(req, res) {
        const { id } = req.params;
        const cristal = await CristalService.obtenerPorId(id);
        res.json(cristal);
    },

    async crearCristal(req, res) {
        const datos = req.body;
        const nuevoId = await CristalService.crearCristal(datos);
        res.status(201).json({ message: "Cristal agregado correctamente.", id: nuevoId });
    },

    async actualizarCristal(req, res) {
        const { id } = req.params;
        const datos = req.body;
        await CristalService.actualizarCristal(id, datos);
        res.status(200).json({ message: "Cristal actualizado correctamente." });
    },

    async eliminarCristal(req, res) {
        const { id } = req.params;
        await CristalService.eliminarCristal(id);
        res.status(200).json({ message: "Cristal eliminado correctamente." });
    }
};

export default CristalController;
