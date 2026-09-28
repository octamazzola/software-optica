import VentaController from '../controllers/venta.controller.js';
import { Router } from 'express';
import requireRole from '../middlewares/role.middleware.js';

const router = Router();

router.get('/', VentaController.obtenerVentas);
router.get('/:id', VentaController.obtenerVentaPorId);
router.post('/', VentaController.crearVenta);
router.delete('/:id', requireRole('admin'), VentaController.eliminarVenta);

export default router;