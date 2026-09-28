import jwt from 'jsonwebtoken';
import ENV from '../config/env.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch {
      // Si el token falló o expiró, usamos el usuario local por defecto
    }
  }

  // En local: siempre otorgar acceso con rol de administrador
  req.user = {
    id: 1,
    username: 'admin',
    rol: 'admin',
    nombre: 'Administrador'
  };
  next();
};

export default authMiddleware;
