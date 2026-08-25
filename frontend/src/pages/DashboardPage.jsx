import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerClientes } from '../api/clientes.api';
import { obtenerProductos } from '../api/productos.api';
import { obtenerVentas } from '../api/ventas.api';

export default function DashboardPage() {
  const [metricas, setMetricas] = useState({
    totalClientes: 0,
    totalProductos: 0,
    cantidadVentas: 0,
    montoFacturado: 0,
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        const [clientes, productos, ventas] = await Promise.all([
          obtenerClientes(),
          obtenerProductos(),
          obtenerVentas(),
        ]);

        const montoTotal = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);

        setMetricas({
          totalClientes: clientes.length,
          totalProductos: productos.length,
          cantidadVentas: ventas.length,
          montoFacturado: montoTotal,
        });
      } catch (err) {
        setError('No se pudo conectar con el servidor. Verificá que el backend esté corriendo.');
      } finally {
        setCargando(false);
      }
    };

    cargarMetricas();
  }, []);

  const formatearMonto = (monto) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

  if (cargando) {
    return (
      <div className="spinner-overlay">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2 mt-4" role="alert">
        <i className="bi bi-exclamation-triangle-fill"></i>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h2>Dashboard</h2>
          <p className="text-secondary mb-0" style={{ fontSize: '0.875rem' }}>
            Resumen del sistema de gestión
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="metric-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <span className="metric-icon"><i className="bi bi-people"></i></span>
            </div>
            <div className="metric-value">{metricas.totalClientes}</div>
            <div className="metric-label">Clientes registrados</div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="metric-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <span className="metric-icon"><i className="bi bi-box"></i></span>
            </div>
            <div className="metric-value">{metricas.totalProductos}</div>
            <div className="metric-label">Productos en catálogo</div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="metric-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <span className="metric-icon"><i className="bi bi-receipt"></i></span>
            </div>
            <div className="metric-value">{metricas.cantidadVentas}</div>
            <div className="metric-label">Ventas realizadas</div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="metric-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <span className="metric-icon"><i className="bi bi-currency-dollar"></i></span>
            </div>
            <div className="metric-value" style={{ fontSize: '1.4rem' }}>
              {formatearMonto(metricas.montoFacturado)}
            </div>
            <div className="metric-label">Total facturado</div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <Link to="/clientes" className="text-decoration-none">
            <div className="card h-100 border" style={{ transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div className="card-body d-flex align-items-center gap-3 py-4">
                <div className="rounded-3 p-3" style={{ background: 'rgba(79,70,229,0.08)' }}>
                  <i className="bi bi-people-fill text-primary fs-4"></i>
                </div>
                <div>
                  <div className="fw-600 text-dark">Gestionar Clientes</div>
                  <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Alta, edición y eliminación</div>
                </div>
                <i className="bi bi-chevron-right text-secondary ms-auto"></i>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4">
          <Link to="/productos" className="text-decoration-none">
            <div className="card h-100 border" style={{ transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div className="card-body d-flex align-items-center gap-3 py-4">
                <div className="rounded-3 p-3" style={{ background: 'rgba(79,70,229,0.08)' }}>
                  <i className="bi bi-box-fill text-primary fs-4"></i>
                </div>
                <div>
                  <div className="fw-600 text-dark">Gestionar Productos</div>
                  <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Alta, edición y eliminación</div>
                </div>
                <i className="bi bi-chevron-right text-secondary ms-auto"></i>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4">
          <Link to="/nueva-venta" className="text-decoration-none">
            <div className="card h-100 border" style={{ transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div className="card-body d-flex align-items-center gap-3 py-4">
                <div className="rounded-3 p-3" style={{ background: 'rgba(79,70,229,0.08)' }}>
                  <i className="bi bi-cart-plus-fill text-primary fs-4"></i>
                </div>
                <div>
                  <div className="fw-600 text-dark">Registrar Venta</div>
                  <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Seleccionar cliente y productos</div>
                </div>
                <i className="bi bi-chevron-right text-secondary ms-auto"></i>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
