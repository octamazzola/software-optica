import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../context/useAuth';
import logo from '../assets/logo-vision-urbana.png';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingresá tu usuario y contraseña.');
      return;
    }

    try {
      setCargando(true);
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Error en login:', err);
      const mensaje =
        err.response?.data?.error ||
        'Error al iniciar sesión. Verificá tus credenciales.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '85vh', backgroundColor: 'var(--bs-secondary-bg, #FAFAFA)' }}
    >
      <div className="card shadow-sm border p-4 p-md-5" style={{ maxWidth: '420px', width: '100%', borderRadius: '14px' }}>
        <div className="text-center mb-4">
          <img src={logo} alt="Óptica Visión Urbana" height="48" className="mb-3" />
          <h3 className="fw-bold mb-1" style={{ color: 'var(--bs-body-color, #18181B)' }}>
            Iniciar Sesión
          </h3>
          <p className="text-secondary small">
            Sistema de Gestión — Óptica Visión Urbana
          </p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 small" role="alert">
            <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-medium" htmlFor="username">
              Usuario
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-secondary">
                <i className="bi bi-person"></i>
              </span>
              <input
                id="username"
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Ingresá tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                disabled={cargando}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-medium" htmlFor="password">
              Contraseña
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-secondary">
                <i className="bi bi-lock"></i>
              </span>
              <input
                id="password"
                type="password"
                className="form-control border-start-0 ps-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={cargando}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-medium d-flex align-items-center justify-content-center gap-2"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Iniciando sesión...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                Ingresar al Sistema
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-2 border-top">
          <small className="text-secondary" style={{ fontSize: '0.8rem' }}>
            Acceso protegido con autenticación JWT y roles RBAC
          </small>
        </div>
      </div>
    </div>
  );
}
