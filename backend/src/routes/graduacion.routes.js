import { Router } from 'express';
import GraduacionController from '../controllers/graduacion.controller.js';

const router = Router();

router.get('/venta/:ventaId', GraduacionController.obtenerPorVentaId);

export default router;
