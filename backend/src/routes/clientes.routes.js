import { Router } from 'express';
import ClienteController from '../controllers/cliente.controller.js';

const router = Router();

router.get('/', ClienteController.obtenerClientes);
router.get('/:id', ClienteController.obtenerClientePorId);
router.post('/', ClienteController.crearCliente);
router.put('/:id', ClienteController.actualizarCliente);
router.delete('/:id', ClienteController.eliminarCliente);

export default router;

