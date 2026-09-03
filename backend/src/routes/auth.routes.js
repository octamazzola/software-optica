import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import requireRole from '../middlewares/role.middleware.js';

const router = Router();

// Ruta pública de inicio de sesión
router.post('/login', AuthController.login);

// Rutas protegidas
router.get('/me', authMiddleware, AuthController.me);

// Gestión de usuarios (Solo Admin)
router.get('/usuarios', authMiddleware, requireRole('admin'), AuthController.listarUsuarios);
router.post('/usuarios', authMiddleware, requireRole('admin'), AuthController.crearUsuario);

export default router;
