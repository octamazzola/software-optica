import { Router } from 'express';
import ProductoController from '../controllers/producto.controller.js';

const router = Router();

router.get('/', ProductoController.obtenerProductos)
router.get('/:codigo', ProductoController.obtenerPorCodigo)
router.post('/', ProductoController.crearProducto)
router.put('/:codigo', ProductoController.actualizarProducto)
router.delete('/:codigo', ProductoController.eliminarProducto)

export default router;