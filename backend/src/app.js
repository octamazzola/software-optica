import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import clientesRoutes from './routes/clientes.routes.js';
import productoRoutes from './routes/producto.routes.js';
import cristalRoutes from './routes/cristal.routes.js';
import ventaRoutes from './routes/venta.routes.js';
import graduacionRoutes from './routes/graduacion.routes.js';
import authRoutes from './routes/auth.routes.js';
import authMiddleware from './middlewares/auth.middleware.js';
import auditMiddleware from './middlewares/audit.middleware.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json());

// Rutas de autenticación y gestión de usuarios
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'El servidor de la Óptica está funcionando correctamente.'
  });
});

// Rutas protegidas — requieren token JWT válido
app.use('/api/clientes', authMiddleware, auditMiddleware, clientesRoutes);
app.use('/api/productos', authMiddleware, auditMiddleware, productoRoutes);
app.use('/api/cristales', authMiddleware, auditMiddleware, cristalRoutes);
app.use('/api/ventas', authMiddleware, auditMiddleware, ventaRoutes);
app.use('/api/graduaciones', authMiddleware, auditMiddleware, graduacionRoutes);

app.use(errorHandler);

export default app;