import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg sticky-top shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/">
          <i className="bi bi-eyeglasses fs-5 text-primary"></i>
          Óptica Visual
        </NavLink>

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
          <ul className="navbar-nav ms-auto gap-1">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                to="/"
                end
              >
                <i className="bi bi-grid me-1"></i>
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                to="/clientes"
              >
                <i className="bi bi-people me-1"></i>
                Clientes
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                to="/productos"
              >
                <i className="bi bi-box me-1"></i>
                Productos
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                to="/nueva-venta"
              >
                <i className="bi bi-cart-plus me-1"></i>
                Nueva Venta
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                to="/ventas"
              >
                <i className="bi bi-receipt me-1"></i>
                Ventas
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
