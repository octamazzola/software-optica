import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductoService from '../../src/services/producto.service.js';
import ProductoRepository from '../../src/repositories/producto.repository.js';

vi.mock('../../src/repositories/producto.repository.js', () => ({
  default: {
    obtenerTodos: vi.fn(),
    obtenerMasVendidos: vi.fn(),
    obtenerPorId: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn()
  }
}));

describe('ProductoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('obtenerProducto', () => {
    it('debe llamar al repositorio para obtener productos', async () => {
      ProductoRepository.obtenerTodos.mockResolvedValue([]);
      await ProductoService.obtenerProducto('buscar', 'categoria');
      expect(ProductoRepository.obtenerTodos).toHaveBeenCalledWith('buscar', 'categoria');
    });
  });

  describe('obtenerPorId', () => {
    it('debe devolver el producto si existe', async () => {
      ProductoRepository.obtenerPorId.mockResolvedValue({ id: 1 });
      const result = await ProductoService.obtenerPorId(1);
      expect(result).toEqual({ id: 1 });
    });

    it('debe lanzar error si no existe', async () => {
      ProductoRepository.obtenerPorId.mockResolvedValue(null);
      await expect(ProductoService.obtenerPorId(1)).rejects.toThrow('El producto con el id 1 no existe.');
    });
  });

  describe('crearProducto', () => {
    it('debe lanzar error si falta el codigo', async () => {
      await expect(ProductoService.crearProducto({ nombre: 'Test', precio: 10 })).rejects.toThrow('El codigo es obligatorio para crear un producto.');
    });

    it('debe lanzar error si falta el nombre', async () => {
      await expect(ProductoService.crearProducto({ codigo: 'C1', precio: 10 })).rejects.toThrow('El nombre del producto es obligatorio.');
    });

    it('debe lanzar error si el precio es invalido', async () => {
      await expect(ProductoService.crearProducto({ codigo: 'C1', nombre: 'Test', precio: -5 })).rejects.toThrow('El precio debe ser un número mayor o igual a 0.');
    });

    it('debe crear un producto valido', async () => {
      ProductoRepository.crear.mockResolvedValue({ id: 1 });
      const p = { codigo: 'C1', nombre: 'N1', precio: 100, descripcion: '', categoria: '' };
      await ProductoService.crearProducto(p);
      expect(ProductoRepository.crear).toHaveBeenCalledWith(p);
    });
  });

  describe('actualizarProducto', () => {
    it('debe lanzar error si falta el nombre al actualizar', async () => {
      ProductoRepository.obtenerPorId.mockResolvedValue({ id: 1 });
      await expect(ProductoService.actualizarProducto(1, { codigo: 'C1', precio: 10 })).rejects.toThrow('El nombre del producto es obligatorio para actualizarlo.');
    });
  });
});
