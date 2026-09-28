import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import logo from '../assets/logo-vision-urbana.png';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center gap-2 fw-semibold" to="/">
          <img src={logo} alt="Óptica Visión Urbana" height="30" />
          <span>Óptica Visión Urbana</span>
        </NavLink>

        {isAuthenticated && (
          <>
            <button
              className="navbar-toggler border-0"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav mx-auto gap-1">
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active fw-medium' : ''}`}
                    to="/"
                    end
                  >
                    <i className="bi bi-grid me-1"></i>
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active fw-medium' : ''}`}
                    to="/clientes"
                  >
                    <i className="bi bi-people me-1"></i>
                    Clientes
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active fw-medium' : ''}`}
                    to="/productos"
                  >
                    <i className="bi bi-box me-1"></i>
                    Productos
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active fw-medium' : ''}`}
                    to="/cristales"
                  >
                    <i className="bi bi-eye me-1"></i>
                    Cristales
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active fw-medium' : ''}`}
                    to="/nueva-venta"
                  >
                    <i className="bi bi-cart-plus me-1"></i>
                    Nueva Venta
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active fw-medium' : ''}`}
                    to="/ventas"
                  >
                    <i className="bi bi-receipt me-1"></i>
                    Ventas
                  </NavLink>
                </li>
                {user?.rol === 'admin' && (
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) => `nav-link ${isActive ? 'active fw-medium' : ''}`}
                      to="/usuarios"
                    >
                      <i className="bi bi-shield-lock me-1"></i>
                      Usuarios
                    </NavLink>
                  </li>
                )}
              </ul>

              <div className="d-flex align-items-center gap-3 pt-2 pt-lg-0 border-top border-lg-0">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle user-avatar d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: '34px', height: '34px', fontSize: '0.85rem' }}
                  >
                    {user?.nombre?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="d-flex flex-column text-start">
                    <span className="small fw-semibold text-truncate user-name" style={{ maxWidth: '140px' }}>
                      {user?.nombre || 'Administrador'}
                    </span>
                    <span
                      className="badge user-badge"
                      style={{ fontSize: '0.65rem', alignSelf: 'flex-start' }}
                    >
                      Modo Local (Admin)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
