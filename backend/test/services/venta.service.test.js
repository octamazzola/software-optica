import { describe, it, expect, vi, beforeEach } from 'vitest';
import VentaService from '../../src/services/venta.service.js';
import VentaRepository from '../../src/repositories/venta.repository.js';
import ClienteRepository from '../../src/repositories/cliente.repository.js';
import ProductoRepository from '../../src/repositories/producto.repository.js';
import CristalRepository from '../../src/repositories/cristal.repository.js';
import GraduacionRepository from '../../src/repositories/graduacion.repository.js';
import { dbRun } from '../../src/config/db.js';

vi.mock('../../src/repositories/venta.repository.js');
vi.mock('../../src/repositories/cliente.repository.js');
vi.mock('../../src/repositories/producto.repository.js');
vi.mock('../../src/repositories/cristal.repository.js');
vi.mock('../../src/repositories/graduacion.repository.js');
vi.mock('../../src/config/db.js', () => ({
  dbRun: vi.fn()
}));

describe('VentaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('crearVenta', () => {
    it('debe lanzar error si el cliente no existe', async () => {
      ClienteRepository.obtenerPorId.mockResolvedValue(null);
      await expect(VentaService.crearVenta({ cliente_id: 1, items: [{}] })).rejects.toThrow('El cliente con ID 1 no existe.');
    });

    it('debe lanzar error si no hay items', async () => {
      ClienteRepository.obtenerPorId.mockResolvedValue({ id: 1 });
      await expect(VentaService.crearVenta({ cliente_id: 1, items: [] })).rejects.toThrow('Debe incluir al menos un ítem para registrar la venta.');
    });

    it('debe lanzar error si un item tiene tanto producto_id como cristal_id (XOR)', async () => {
      ClienteRepository.obtenerPorId.mockResolvedValue({ id: 1 });
      const itemsInvaidos = [{ producto_id: 1, cristal_id: 2, cantidad: 1, precio_unitario: 100 }];
      await expect(VentaService.crearVenta({ cliente_id: 1, items: itemsInvaidos }))
        .rejects.toThrow('Cada detalle de venta debe tener EXACTAMENTE un producto o un cristal, no ambos ni ninguno.');
    });

    it('debe lanzar error si un item NO tiene ni producto_id ni cristal_id (XOR)', async () => {
      ClienteRepository.obtenerPorId.mockResolvedValue({ id: 1 });
      const itemsInvaidos = [{ cantidad: 1, precio_unitario: 100 }];
      await expect(VentaService.crearVenta({ cliente_id: 1, items: itemsInvaidos }))
        .rejects.toThrow('Cada detalle de venta debe tener EXACTAMENTE un producto o un cristal, no ambos ni ninguno.');
    });

    it('debe lanzar error si la cantidad es invalida', async () => {
      ClienteRepository.obtenerPorId.mockResolvedValue({ id: 1 });
      ProductoRepository.obtenerPorId.mockResolvedValue({ id: 1 });
      const itemsInvaidos = [{ producto_id: 1, cantidad: 0, precio_unitario: 100 }];
      await expect(VentaService.crearVenta({ cliente_id: 1, items: itemsInvaidos }))
        .rejects.toThrow('La cantidad debe ser mayor a 0.');
    });

    it('debe lanzar error si el producto no existe', async () => {
      ClienteRepository.obtenerPorId.mockResolvedValue({ id: 1 });
      ProductoRepository.obtenerPorId.mockResolvedValue(null);
      const items = [{ producto_id: 1, cantidad: 1, precio_unitario: 100 }];
      await expect(VentaService.crearVenta({ cliente_id: 1, items })).rejects.toThrow('El producto con ID 1 no existe.');
    });

    it('debe registrar una venta exitosamente con graduacion', async () => {
      ClienteRepository.obtenerPorId.mockResolvedValue({ id: 1 });
      CristalRepository.obtenerPorId.mockResolvedValue({ id: 1 });
      VentaRepository.crearVenta.mockResolvedValue(99);
      dbRun.mockResolvedValue();

      const items = [{ cristal_id: 1, cantidad: 2, precio_unitario: 500 }];
      const graduacion = { material: 'Organico' };

      const result = await VentaService.crearVenta({ cliente_id: 1, items, graduacion });

      expect(dbRun).toHaveBeenCalledWith('BEGIN TRANSACTION');
      expect(VentaRepository.crearVenta).toHaveBeenCalledWith({ cliente_id: 1, total: 1000, descripcion: undefined });
      expect(VentaRepository.crearDetalleVenta).toHaveBeenCalledWith({
        venta_id: 99,
        producto_id: null,
        cristal_id: 1,
        cantidad: 2,
        precio_unitario: 500
      });
      expect(GraduacionRepository.crear).toHaveBeenCalledWith({ material: 'Organico', venta_id: 99 });
      expect(dbRun).toHaveBeenCalledWith('COMMIT');
      expect(result).toBe(99);
    });

    it('debe hacer rollback si algo falla al guardar en BD', async () => {
      ClienteRepository.obtenerPorId.mockResolvedValue({ id: 1 });
      CristalRepository.obtenerPorId.mockResolvedValue({ id: 1 });
      VentaRepository.crearVenta.mockRejectedValue(new Error('Fallo simulado DB'));
      dbRun.mockResolvedValue();

      const items = [{ cristal_id: 1, cantidad: 2, precio_unitario: 500 }];

      await expect(VentaService.crearVenta({ cliente_id: 1, items }))
        .rejects.toThrow('Error al registrar la venta: Fallo simulado DB');
      
      expect(dbRun).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('obtenerVentaPorId', () => {
    it('debe devolver la venta completa con detalles y graduacion', async () => {
      VentaRepository.obtenerPorId.mockResolvedValue({ id: 99, total: 1000 });
      VentaRepository.obtenerDetallePorVentaId.mockResolvedValue([{ cristal_id: 1 }]);
      GraduacionRepository.obtenerPorVentaId.mockResolvedValue({ material: 'Org' });

      const result = await VentaService.obtenerVentaPorId(99);

      expect(result.id).toBe(99);
      expect(result.productos.length).toBe(1);
      expect(result.graduacion.material).toBe('Org');
    });
  });
});
