import VentaRepository from '../repositories/venta.repository.js';
import ClienteRepository from '../repositories/cliente.repository.js';
import ProductoRepository from '../repositories/producto.repository.js';
import { dbRun } from '../config/db.js';

const VentaService = {

    async obtenerVentas() {
        return await VentaRepository.obtenerTodas();
    },

    async obtenerVentaPorId(ventaId) {
        const venta = await VentaRepository.obtenerPorId(ventaId);
        if (!venta) {
            throw new Error(`La venta con ID ${ventaId} no existe.`);
        }

        const detalles = await VentaRepository.obtenerDetallePorVentaId(ventaId);
        return {
            ...venta,
            productos: detalles
        };
    },

    async crearVenta({ cliente_id, items }) {
        const cliente = await ClienteRepository.obtenerPorId(cliente_id);
        if (!cliente) {
            throw new Error(`El cliente con ID ${cliente_id} no existe.`);
        }

        if (!items || items.length === 0) {
            throw new Error('Debe incluir al menos un producto para registrar la venta.');
        }

        let totalCalculado = 0;

        for (const item of items) {
            const producto = await ProductoRepository.obtenerPorId(item.producto_id);
            if (!producto) {
                throw new Error(`El producto con ID ${item.producto_id} no existe.`);
            }
            if (item.cantidad <= 0) {
                throw new Error(`La cantidad para el producto ${producto.nombre} debe ser mayor a 0.`);
            }

            totalCalculado += producto.precio * item.cantidad;
        }

        try {
            await dbRun('BEGIN TRANSACTION');

            const ventaId = await VentaRepository.crearVenta({
                cliente_id,
                total: totalCalculado
            });

            for (const item of items) {
                const producto = await ProductoRepository.obtenerPorId(item.producto_id);

                await VentaRepository.crearDetalleVenta({
                    venta_id: ventaId,
                    producto_id: item.producto_id,
                    cantidad: item.cantidad,
                    precio_unitario: producto.precio
                });
            }

            await dbRun('COMMIT');

            return ventaId;

        } catch (error) {
            await dbRun('ROLLBACK');
            throw new Error(`Error al registrar la venta: ${error.message}`);
        }
    }
};

export default VentaService;
