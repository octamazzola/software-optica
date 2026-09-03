import { Router } from 'express';
import ProductoController from '../controllers/producto.controller.js';
import requireRole from '../middlewares/role.middleware.js';

const router = Router();

router.get('/', ProductoController.obtenerProductos);
router.get('/mas-vendidos', ProductoController.obtenerMasVendidos);
router.get('/:codigo', ProductoController.obtenerPorCodigo);
router.post('/', requireRole('admin'), ProductoController.crearProducto);
router.put('/:id', requireRole('admin'), ProductoController.actualizarProducto);
router.delete('/:id', requireRole('admin'), ProductoController.eliminarProducto);

export default router;