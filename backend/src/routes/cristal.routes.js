import { Router } from "express";
import CristalController from "../controllers/cristal.controller.js";
import requireRole from "../middlewares/role.middleware.js";

const router = Router();

router.get('/', CristalController.obtenerCristales);
router.get('/:id', CristalController.obtenerPorId);
router.post('/', requireRole('admin'), CristalController.crearCristal);
router.put('/:id', requireRole('admin'), CristalController.actualizarCristal);
router.delete('/:id', requireRole('admin'), CristalController.eliminarCristal);

export default router;
