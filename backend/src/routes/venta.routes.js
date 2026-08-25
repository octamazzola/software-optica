import VentaController from '../controllers/venta.controller.js';
import { Router } from 'express';

const router = Router();

router.get('/', VentaController.obtenerVentas);
router.get('/:id', VentaController.obtenerVentaPorId);
router.post('/', VentaController.crearVenta);

export default router;