import ClienteRepository from '../repositories/cliente.repository.js';

const ClienteService = {

  async obtenerClientes(buscar = '') {
    return await ClienteRepository.obtenerTodos(buscar);
  },

  async obtenerClientePorId(id) {
    const cliente = await ClienteRepository.obtenerPorId(id);


    if (!cliente) {
      throw new Error(`El cliente con el id ${id} no existe.`);
    }

    return cliente;
  },

  async crearCliente({ nombre, telefono, email }) {
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre del cliente es obligatorio.');
    }
    return await ClienteRepository.crear({ nombre, telefono, email });
  },

  async actualizarCliente(id, { nombre, telefono, email }) {

    await this.obtenerClientePorId(id);

    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre del cliente es obligatorio para actualizarlo.');
    }
    return await ClienteRepository.actualizar(id, { nombre, telefono, email });
  },

  async eliminarCliente(id) {
    await this.obtenerClientePorId(id);
    return await ClienteRepository.eliminar(id);
  }
};

export default ClienteService;