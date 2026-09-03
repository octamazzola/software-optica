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

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Demasiadas solicitudes. Intentá de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de login. Esperá 15 minutos.' },
});

app.use(express.json());
app.use('/api', apiLimiter);

// Rutas públicas
app.use('/api/auth/login', loginLimiter);
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