import React, { useState, useEffect, useMemo } from 'react';
import { obtenerVentas, obtenerVentaPorId, eliminarVenta } from '../api/ventas.api';
import { Link } from 'react-router-dom';
import TablaGraduacionDetalle from '../components/TablaGraduacionDetalle';
import useAuth from '../context/useAuth';

export default function VentasHistorialPage() {
  const { isAdmin } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [terminoBuscar, setTerminoBuscar] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [ventaExpandida, setVentaExpandida] = useState(null);
  const [detalleData, setDetalleData] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const mostrarExito = (msg) => {
    setExito(msg);
    setTimeout(() => setExito(null), 3500);
  };

  const handleEliminarVenta = async (venta) => {
    const nombreCliente = venta.cliente_nombre ? ` del cliente "${venta.cliente_nombre} ${venta.cliente_apellido || ''}".trim()` : '';
    if (!window.confirm(`¿Eliminar la venta #${venta.id}${nombreCliente}? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarVenta(venta.id);
      mostrarExito(`Venta #${venta.id} eliminada correctamente.`);
      setVentas((prev) => prev.filter((item) => item.id !== venta.id));
      if (ventaExpandida === venta.id) {
        setVentaExpandida(null);
        setDetalleData(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar la venta.');
    }
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerVentas({
          buscar: terminoBuscar.trim(),
          fechaDesde: fechaDesde || undefined,
          fechaHasta: fechaHasta || undefined
        });
        setVentas(data);
      } catch {
        setError('No se pudo cargar el historial de ventas.');
      } finally {
        setCargando(false);
      }
    };
    
    const timer = setTimeout(() => cargar(), 300);
    return () => clearTimeout(timer);
  }, [terminoBuscar, fechaDesde, fechaHasta]);

  const toggleDetalle = async (venta) => {
    if (ventaExpandida === venta.id) {
      setVentaExpandida(null);
      setDetalleData(null);
      return;
    }
    setVentaExpandida(venta.id);
    setDetalleData(null);
    setCargandoDetalle(true);
    try {
      const data = await obtenerVentaPorId(venta.id);
      setDetalleData(data);
    } catch {
      setDetalleData({ error: 'No se pudo cargar el detalle de esta venta.' });
    } finally {
      setCargandoDetalle(false);
    }
  };

  const formatearPrecio = (p) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p);

  const formatearFecha = (f) => {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatearFechaISO = (d) => {
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  };

  const setRangoHoy = () => {
    const hoy = formatearFechaISO(new Date());
    setFechaDesde(hoy);
    setFechaHasta(hoy);
  };

  const setRangoEsteMes = () => {
    const ahora = new Date();
    const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const ultimoDia = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
    setFechaDesde(formatearFechaISO(primerDia));
    setFechaHasta(formatearFechaISO(ultimoDia));
  };

  const setRangoMesPasado = () => {
    const ahora = new Date();
    const primerDia = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const ultimoDia = new Date(ahora.getFullYear(), ahora.getMonth(), 0);
    setFechaDesde(formatearFechaISO(primerDia));
    setFechaHasta(formatearFechaISO(ultimoDia));
  };

  const limpiarFiltros = () => {
    setTerminoBuscar('');
    setFechaDesde('');
    setFechaHasta('');
  };

  const totalMonto = useMemo(() => {
    return ventas.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
  }, [ventas]);

  const hayFiltrosActivos = Boolean(terminoBuscar || fechaDesde || fechaHasta);

  if (cargando) {
    return (
      <div className="spinner-overlay">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="mb-1"><i className="bi bi-receipt me-2 text-primary"></i>Historial de Ventas</h2>
          <p className="text-secondary mb-0" style={{ fontSize: '0.875rem' }}>
            {ventas.length} venta{ventas.length !== 1 ? 's' : ''} encontrada{ventas.length !== 1 ? 's' : ''}
            {hayFiltrosActivos && <span className="badge bg-secondary ms-2">Filtros aplicados</span>}
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="text-end d-none d-sm-block bg-white px-3 py-2 rounded shadow-sm border">
            <div className="small text-secondary" style={{ fontSize: '0.75rem' }}>Total facturado</div>
            <div className="fw-bold text-primary" style={{ fontSize: '1.2rem' }}>{formatearPrecio(totalMonto)}</div>
          </div>
          <Link to="/nueva-venta" className="btn btn-primary d-flex align-items-center gap-2">
            <i className="bi bi-plus-lg"></i>
            Nueva venta
          </Link>
        </div>
      </div>

      {exito && (
        <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
          <i className="bi bi-check-circle-fill"></i>
          {exito}
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {error}
          <button className="btn-close ms-auto" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Tarjeta de Búsqueda y Filtros de Fecha */}
      <div className="card shadow-sm border-0 mb-4 p-3" style={{ backgroundColor: '#ffffff' }}>
        <div className="row g-3 align-items-end">
          {/* Búsqueda por cliente */}
          <div className="col-12 col-lg-5">
            <label className="form-label small fw-semibold text-secondary mb-1">
              <i className="bi bi-person-search me-1"></i>Cliente (Nombre, Apellido o DNI)
            </label>
            <div className="search-box">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por cliente o DNI..."
                value={terminoBuscar}
                onChange={(e) => setTerminoBuscar(e.target.value)}
              />
              {terminoBuscar && (
                <button
                  className="search-clear-btn"
                  type="button"
                  onClick={() => setTerminoBuscar('')}
                  title="Borrar texto"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          {/* Rango Desde */}
          <div className="col-6 col-sm-6 col-lg-3">
            <label className="form-label small fw-semibold text-secondary mb-1">
              <i className="bi bi-calendar-event me-1"></i>Fecha Desde
            </label>
            <input
              type="date"
              className="form-control"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>

          {/* Rango Hasta */}
          <div className="col-6 col-sm-6 col-lg-3">
            <label className="form-label small fw-semibold text-secondary mb-1">
              <i className="bi bi-calendar-event me-1"></i>Fecha Hasta
            </label>
            <input
              type="date"
              className="form-control"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>

          {/* Botón reset en columna */}
          <div className="col-12 col-lg-1 d-flex">
            {hayFiltrosActivos ? (
              <button
                className="btn btn-outline-danger w-100"
                onClick={limpiarFiltros}
                title="Limpiar filtros"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            ) : (
              <button
                className="btn btn-outline-secondary w-100 disabled opacity-25"
                disabled
              >
                <i className="bi bi-filter"></i>
              </button>
            )}
          </div>
        </div>

        {/* Atajos rápidos de fecha */}
        <div className="d-flex flex-wrap align-items-center gap-2 mt-3 pt-2 border-top">
          <span className="small text-secondary fw-semibold me-1">
            <i className="bi bi-lightning-charge me-1"></i>Atajos de fecha:
          </span>
          <button
            type="button"
            className={`btn btn-sm py-0 px-2 ${fechaDesde === formatearFechaISO(new Date()) && fechaHasta === formatearFechaISO(new Date()) ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ fontSize: '0.78rem' }}
            onClick={setRangoHoy}
          >
            Hoy
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary py-0 px-2"
            style={{ fontSize: '0.78rem' }}
            onClick={setRangoEsteMes}
          >
            Este mes
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary py-0 px-2"
            style={{ fontSize: '0.78rem' }}
            onClick={setRangoMesPasado}
          >
            Mes pasado
          </button>
          {hayFiltrosActivos && (
            <button
              type="button"
              className="btn btn-sm btn-link text-decoration-none text-danger py-0 px-1 ms-auto"
              style={{ fontSize: '0.78rem' }}
              onClick={limpiarFiltros}
            >
              <i className="bi bi-x-circle me-1"></i>Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {ventas.length === 0 && !error ? (
        <div className="card overflow-hidden">
          <div className="text-center py-5 text-secondary">
            {hayFiltrosActivos ? (
              <>
                <i className="bi bi-search fs-1 d-block mb-2 opacity-25"></i>
                <div className="fw-semibold">No se encontraron ventas con los filtros aplicados.</div>
                <div className="small text-muted mt-1">Probá cambiando el nombre, DNI o el rango de fechas.</div>
                <button className="btn btn-outline-primary btn-sm mt-3" onClick={limpiarFiltros}>
                  Limpiar filtros
                </button>
              </>
            ) : (
              <>
                <i className="bi bi-receipt fs-1 d-block mb-2 opacity-25"></i>
                <div>Aún no hay ventas registradas.</div>
                <Link to="/nueva-venta" className="btn btn-primary btn-sm mt-3">
                  Registrar primera venta
                </Link>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th className="text-end">Total</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <React.Fragment key={v.id}>
                    <tr>
                      <td className="text-secondary" style={{ fontFamily: 'monospace' }}>#{v.id}</td>
                      <td className="text-secondary">{formatearFecha(v.fecha)}</td>
                      <td className="fw-500">
                        {v.cliente_nombre ? `${v.cliente_nombre} ${v.cliente_apellido || ''}` : '—'}
                        {v.cliente_dni && <div className="text-secondary small fw-normal">DNI: {v.cliente_dni}</div>}
                      </td>
                      <td className="text-end fw-500">{formatearPrecio(v.total)}</td>
                      <td className="text-end">
                        <button
                          className={`btn btn-sm me-1 ${ventaExpandida === v.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => toggleDetalle(v)}
                          title="Ver detalle"
                        >
                          <i className={`bi bi-chevron-${ventaExpandida === v.id ? 'up' : 'down'}`}></i>
                        </button>
                        {isAdmin && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleEliminarVenta(v)}
                            title="Eliminar venta"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                    {ventaExpandida === v.id && (
                      <tr>
                        <td colSpan={5} className="p-0 border-0">
                          <div className="detalle-venta mx-3 mb-3">
                            {cargandoDetalle ? (
                              <div className="text-center py-3">
                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                  <span className="visually-hidden">Cargando...</span>
                                </div>
                              </div>
                            ) : detalleData?.error ? (
                              <div className="text-danger">{detalleData.error}</div>
                            ) : detalleData?.productos?.length === 0 ? (
                              <div className="text-secondary">Esta venta no tiene productos detallados.</div>
                            ) : (
                              <>
                                <div className="fw-500 mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#71717A' }}>
                                  Productos
                                </div>
                                <table className="table table-sm mb-0" style={{ fontSize: '0.875rem' }}>
                                  <thead>
                                    <tr>
                                      <th className="fw-500 border-0 ps-0">Producto</th>
                                      <th className="fw-500 border-0 text-center">Cant.</th>
                                      <th className="fw-500 border-0 text-end">Precio unit.</th>
                                      <th className="fw-500 border-0 text-end pe-0">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detalleData?.productos?.map((item, i) => (
                                      <tr key={i}>
                                        <td className="border-0 ps-0">
                                            {item.producto_nombre && <><i className="bi bi-box text-secondary me-1"></i> {item.producto_nombre}</>}
                                            {!item.producto_nombre && item.cristal_material && <><i className="bi bi-eye text-secondary me-1"></i> {item.cristal_material} {item.cristal_descripcion}</>}
                                            {!item.producto_nombre && !item.cristal_material && (item.nombre || '—')}
                                        </td>
                                        <td className="border-0 text-center">{item.cantidad}</td>
                                        <td className="border-0 text-end text-secondary">{formatearPrecio(item.precio_unitario)}</td>
                                        <td className="border-0 text-end pe-0 fw-500">
                                          {formatearPrecio(item.precio_unitario * item.cantidad)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {detalleData.descripcion && (
                                    <div className="mt-3 p-2 bg-light border rounded text-secondary" style={{ fontSize: '0.875rem' }}>
                                        <strong>Nota:</strong> {detalleData.descripcion}
                                    </div>
                                )}
                                {detalleData.graduacion && (
                                    <TablaGraduacionDetalle graduacion={detalleData.graduacion} />
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
