import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuth from '../context/useAuth';

export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Cargando sesión...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.rol)) {
    return (
      <div className="container py-5 text-center">
        <div className="card shadow-sm border-0 p-4 mx-auto" style={{ maxWidth: '500px' }}>
          <div className="text-danger mb-3">
            <i className="bi bi-shield-lock" style={{ fontSize: '3rem' }}></i>
          </div>
          <h4 className="fw-bold mb-2">Acceso restringido</h4>
          <p className="text-secondary mb-4">
            No tenés los permisos requeridos (rol: <strong>{user?.rol}</strong>) para acceder a esta sección.
          </p>
          <div>
            <a href="/" className="btn btn-primary px-4">
              Volver al Inicio
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
}
