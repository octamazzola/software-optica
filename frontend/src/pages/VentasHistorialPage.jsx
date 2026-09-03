import React, { useState, useEffect } from 'react';
import { obtenerVentas, obtenerVentaPorId } from '../api/ventas.api';
import { Link } from 'react-router-dom';
import TablaGraduacionDetalle from '../components/TablaGraduacionDetalle';

export default function VentasHistorialPage() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [dniBuscar, setDniBuscar] = useState('');
  const [ventaExpandida, setVentaExpandida] = useState(null);
  const [detalleData, setDetalleData] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerVentas(dniBuscar);
        setVentas(data);
      } catch {
        setError('No se pudo cargar el historial de ventas.');
      } finally {
        setCargando(false);
      }
    };
    
    const timer = setTimeout(() => cargar(), 300);
    return () => clearTimeout(timer);
  }, [dniBuscar]);

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
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h2><i className="bi bi-receipt me-2 text-primary"></i>Historial de Ventas</h2>
          <p className="text-secondary mb-0" style={{ fontSize: '0.875rem' }}>
            {ventas.length} venta{ventas.length !== 1 ? 's' : ''} registrada{ventas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/nueva-venta" className="btn btn-primary d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i>
          Nueva venta
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {error}
        </div>
      )}

      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-secondary"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Buscar ventas por DNI del cliente..."
            value={dniBuscar}
            onChange={(e) => setDniBuscar(e.target.value)}
            style={{ borderRadius: '0 8px 8px 0' }}
          />
          {dniBuscar && (
            <button className="btn btn-outline-secondary border-start-0" onClick={() => setDniBuscar('')}>
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
      </div>

      {ventas.length === 0 && !error ? (
        <div className="card">
          <div className="text-center py-5 text-secondary">
            <i className="bi bi-receipt fs-1 d-block mb-2 opacity-25"></i>
            <div>Aún no hay ventas registradas.</div>
            <Link to="/nueva-venta" className="btn btn-primary btn-sm mt-3">
              Registrar primera venta
            </Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th className="text-end">Total</th>
                  <th className="text-end">Detalle</th>
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
                          className={`btn btn-sm ${ventaExpandida === v.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => toggleDetalle(v)}
                          title="Ver detalle"
                        >
                          <i className={`bi bi-chevron-${ventaExpandida === v.id ? 'up' : 'down'}`}></i>
                        </button>
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
