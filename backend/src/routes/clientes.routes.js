import { Router } from 'express';
import ClienteController from '../controllers/cliente.controller.js';
import requireRole from '../middlewares/role.middleware.js';

const router = Router();

router.get('/', ClienteController.obtenerClientes);
router.get('/:id', ClienteController.obtenerClientePorId);
router.post('/', ClienteController.crearCliente);
router.put('/:id', ClienteController.actualizarCliente);
router.delete('/:id', requireRole('admin'), ClienteController.eliminarCliente);

export default router;

