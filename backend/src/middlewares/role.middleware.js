export const requireRole = (...rolesPermitidos) => (req, res, next) => {
  if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
    return res.status(403).json({
      error: 'Acceso denegado. No tenés permisos suficientes para realizar esta acción.'
    });
  }
  next();
};

export default requireRole;
