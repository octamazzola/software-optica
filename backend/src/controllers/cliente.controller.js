import ClienteService from "../services/cliente.service.js";

const ClienteController = {
    async obtenerClientes(req, res) {
        const { buscar } = req.query;
        const clientes = await ClienteService.obtenerClientes(buscar);
        res.json(clientes);
    },

    async obtenerClientePorId(req, res) {
        const { id } = req.params;
        const cliente = await ClienteService.obtenerClientePorId(id);
        res.json(cliente);
    },

    async crearCliente(req, res) {
        const { nombre, apellido, dni, telefono, email } = req.body;
        const nuevoId = await ClienteService.crearCliente({ nombre, apellido, dni, telefono, email });
        res.status(201).json({ id: nuevoId, message: 'Cliente registrado con éxito.' });
    },

    async actualizarCliente(req, res) {
        const { id } = req.params;
        const { nombre, apellido, dni, telefono, email } = req.body;
        await ClienteService.actualizarCliente(id, { nombre, apellido, dni, telefono, email });
        res.json({ message: 'Cliente actualizado correctamente.' });
    },

    async eliminarCliente(req, res) {
        const { id } = req.params;
        await ClienteService.eliminarCliente(id);
        res.json({ message: 'Cliente eliminado correctamente.' });
    }
};

export default ClienteController;