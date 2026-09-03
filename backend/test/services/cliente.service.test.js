import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClienteService from '../../src/services/cliente.service.js';
import ClienteRepository from '../../src/repositories/cliente.repository.js';

// Mock the repository
vi.mock('../../src/repositories/cliente.repository.js', () => ({
  default: {
    obtenerTodos: vi.fn(),
    obtenerPorId: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn()
  }
}));

describe('ClienteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('obtenerClientes', () => {
    it('debe llamar al repositorio para obtener todos los clientes', async () => {
      const mockClientes = [{ id: 1, nombre: 'Test' }];
      ClienteRepository.obtenerTodos.mockResolvedValue(mockClientes);

      const result = await ClienteService.obtenerClientes('buscar');
      
      expect(ClienteRepository.obtenerTodos).toHaveBeenCalledWith('buscar');
      expect(result).toEqual(mockClientes);
    });
  });

  describe('obtenerClientePorId', () => {
    it('debe devolver el cliente si existe', async () => {
      const mockCliente = { id: 1, nombre: 'Test' };
      ClienteRepository.obtenerPorId.mockResolvedValue(mockCliente);

      const result = await ClienteService.obtenerClientePorId(1);
      
      expect(ClienteRepository.obtenerPorId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCliente);
    });

    it('debe lanzar un error si el cliente no existe', async () => {
      ClienteRepository.obtenerPorId.mockResolvedValue(null);

      await expect(ClienteService.obtenerClientePorId(999)).rejects.toThrow('El cliente con el id 999 no existe.');
    });
  });

  describe('crearCliente', () => {
    it('debe crear un cliente si los datos son válidos', async () => {
      const nuevoCliente = { nombre: 'Juan', apellido: 'Perez', dni: '12345678', telefono: '123', email: 'juan@test.com' };
      ClienteRepository.crear.mockResolvedValue({ id: 1 });

      const result = await ClienteService.crearCliente(nuevoCliente);

      expect(ClienteRepository.crear).toHaveBeenCalledWith(nuevoCliente);
      expect(result).toEqual({ id: 1 });
    });

    it('debe lanzar error si falta el nombre', async () => {
      const clienteInvalido = { nombre: '', apellido: 'Perez', dni: '12345678' };
      await expect(ClienteService.crearCliente(clienteInvalido)).rejects.toThrow('El nombre del cliente es obligatorio.');
    });

    it('debe lanzar error si falta el apellido', async () => {
      const clienteInvalido = { nombre: 'Juan', apellido: '', dni: '12345678' };
      await expect(ClienteService.crearCliente(clienteInvalido)).rejects.toThrow('El apellido del cliente es obligatorio.');
    });

    it('debe lanzar error si falta el dni', async () => {
      const clienteInvalido = { nombre: 'Juan', apellido: 'Perez', dni: '' };
      await expect(ClienteService.crearCliente(clienteInvalido)).rejects.toThrow('El DNI del cliente es obligatorio.');
    });
  });

  describe('actualizarCliente', () => {
    it('debe actualizar un cliente si los datos son válidos y existe', async () => {
      const clienteActualizado = { nombre: 'Juan', apellido: 'Perez', dni: '12345678', telefono: '123', email: 'juan@test.com' };
      ClienteRepository.obtenerPorId.mockResolvedValue({ id: 1 }); // Simular que existe
      ClienteRepository.actualizar.mockResolvedValue({ changes: 1 });

      const result = await ClienteService.actualizarCliente(1, clienteActualizado);

      expect(ClienteRepository.actualizar).toHaveBeenCalledWith(1, clienteActualizado);
      expect(result).toEqual({ changes: 1 });
    });

    it('debe lanzar error si falta el nombre al actualizar', async () => {
      ClienteRepository.obtenerPorId.mockResolvedValue({ id: 1 });
      const clienteInvalido = { nombre: '', apellido: 'Perez', dni: '12345678' };
      await expect(ClienteService.actualizarCliente(1, clienteInvalido)).rejects.toThrow('El nombre del cliente es obligatorio para actualizarlo.');
    });
  });

  describe('eliminarCliente', () => {
    it('debe eliminar el cliente si existe', async () => {
      ClienteRepository.obtenerPorId.mockResolvedValue({ id: 1 }); // Existe
      ClienteRepository.eliminar.mockResolvedValue({ changes: 1 });

      const result = await ClienteService.eliminarCliente(1);

      expect(ClienteRepository.eliminar).toHaveBeenCalledWith(1);
      expect(result).toEqual({ changes: 1 });
    });
  });
});
