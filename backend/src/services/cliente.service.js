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

  async crearCliente({ nombre, apellido, dni, telefono, email }) {
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre del cliente es obligatorio.');
    }
    if (!apellido || apellido.trim() === '') {
      throw new Error('El apellido del cliente es obligatorio.');
    }
    if (!dni || dni.trim() === '') {
      throw new Error('El DNI del cliente es obligatorio.');
    }
    return await ClienteRepository.crear({ nombre, apellido, dni, telefono, email });
  },

  async actualizarCliente(id, { nombre, apellido, dni, telefono, email }) {

    await this.obtenerClientePorId(id);

    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre del cliente es obligatorio para actualizarlo.');
    }
    if (!apellido || apellido.trim() === '') {
      throw new Error('El apellido del cliente es obligatorio para actualizarlo.');
    }
    if (!dni || dni.trim() === '') {
      throw new Error('El DNI del cliente es obligatorio para actualizarlo.');
    }
    return await ClienteRepository.actualizar(id, { nombre, apellido, dni, telefono, email });
  },

  async eliminarCliente(id) {
    await this.obtenerClientePorId(id);
    return await ClienteRepository.eliminar(id);
  }
};

export default ClienteService;