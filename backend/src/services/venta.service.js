import VentaRepository from '../repositories/venta.repository.js';
import ClienteRepository from '../repositories/cliente.repository.js';
import ProductoRepository from '../repositories/producto.repository.js';
import CristalRepository from '../repositories/cristal.repository.js';
import GraduacionRepository from '../repositories/graduacion.repository.js';
import { dbRun } from '../config/db.js';

const VentaService = {

    async obtenerVentas(dni = '', cliente_id = null) {
        const ventas = await VentaRepository.obtenerTodas(dni, cliente_id);
        if (ventas.length === 0) return [];
        
        const ventaIds = ventas.map(v => v.id);
        const graduaciones = await GraduacionRepository.obtenerPorVentaIds(ventaIds);
        
        // Mapear graduaciones a sus ventas correspondientes
        const graduacionesPorVenta = graduaciones.reduce((acc, grad) => {
            acc[grad.venta_id] = grad;
            return acc;
        }, {});

        for (const v of ventas) {
            if (graduacionesPorVenta[v.id]) {
                v.graduacion = graduacionesPorVenta[v.id];
            }
        }
        return ventas;
    },

    async obtenerVentaPorId(ventaId) {
        const venta = await VentaRepository.obtenerPorId(ventaId);
        if (!venta) {
            throw new Error(`La venta con ID ${ventaId} no existe.`);
        }

        const detalles = await VentaRepository.obtenerDetallePorVentaId(ventaId);
        const graduacion = await GraduacionRepository.obtenerPorVentaId(ventaId);

        return {
            ...venta,
            productos: detalles,
            graduacion: graduacion || null
        };
    },

    async crearVenta({ cliente_id, items, descripcion, graduacion }) {
        const cliente = await ClienteRepository.obtenerPorId(cliente_id);
        if (!cliente) {
            throw new Error(`El cliente con ID ${cliente_id} no existe.`);
        }

        if (!items || items.length === 0) {
            throw new Error('Debe incluir al menos un ítem para registrar la venta.');
        }

        let totalCalculado = 0;

        for (const item of items) {
            // Validación XOR
            const tieneProducto = !!item.producto_id;
            const tieneCristal = !!item.cristal_id;

            if (tieneProducto === tieneCristal) {
                throw new Error('Cada detalle de venta debe tener EXACTAMENTE un producto o un cristal, no ambos ni ninguno.');
            }

            if (tieneProducto) {
                const producto = await ProductoRepository.obtenerPorId(item.producto_id);
                if (!producto) throw new Error(`El producto con ID ${item.producto_id} no existe.`);
            } else {
                const cristal = await CristalRepository.obtenerPorId(item.cristal_id);
                if (!cristal) throw new Error(`El cristal con ID ${item.cristal_id} no existe.`);
            }
            
            if (item.cantidad <= 0) {
                throw new Error('La cantidad debe ser mayor a 0.');
            }
            
            if (item.precio_unitario === undefined || item.precio_unitario < 0) {
                throw new Error('Debe proveer un precio unitario válido.');
            }

            totalCalculado += item.precio_unitario * item.cantidad;
        }

        try {
            await dbRun('BEGIN TRANSACTION');

            const ventaId = await VentaRepository.crearVenta({
                cliente_id,
                total: totalCalculado,
                descripcion
            });

            for (const item of items) {
                await VentaRepository.crearDetalleVenta({
                    venta_id: ventaId,
                    producto_id: item.producto_id || null,
                    cristal_id: item.cristal_id || null,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario
                });
            }

            if (graduacion && typeof graduacion === 'object') {
                await GraduacionRepository.crear({
                    ...graduacion,
                    venta_id: ventaId
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
