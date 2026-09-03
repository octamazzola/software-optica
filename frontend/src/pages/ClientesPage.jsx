import React, { useState, useEffect, useCallback } from 'react';
import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from '../api/clientes.api';
import { obtenerVentas } from '../api/ventas.api';
import useAuth from '../context/useAuth';
import TablaGraduacionDetalle from '../components/TablaGraduacionDetalle';

const FORM_VACIO = { nombre: '', apellido: '', dni: '', telefono: '', email: '' };

export default function ClientesPage() {
  const { isAdmin } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  // Modal estado
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null); // null = alta, object = edición
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  // Expansión de historial de ventas
  const [clienteExpandido, setClienteExpandido] = useState(null);
  const [ventasData, setVentasData] = useState(null);
  const [cargandoVentas, setCargandoVentas] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerClientes(buscar);
      setClientes(data);
      setError(null);
    } catch {
      setError('No se pudo cargar la lista de clientes.');
    } finally {
      setCargando(false);
    }
  }, [buscar]);

  useEffect(() => {
    const timer = setTimeout(() => cargar(), 300);
    return () => clearTimeout(timer);
  }, [cargar]);

  const mostrarExito = (msg) => {
    setExito(msg);
    setTimeout(() => setExito(null), 3000);
  };

  const abrirAlta = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setModalAbierto(true);
  };

  const abrirEdicion = (cliente) => {
    setEditando(cliente);
    setForm({ 
      nombre: cliente.nombre, 
      apellido: cliente.apellido || '', 
      dni: cliente.dni || '', 
      telefono: cliente.telefono || '', 
      email: cliente.email || '' 
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setForm(FORM_VACIO);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.apellido.trim() || !form.dni.trim()) return;
    setGuardando(true);
    try {
      if (editando) {
        await actualizarCliente(editando.id, form);
        mostrarExito('Cliente actualizado correctamente.');
      } else {
        await crearCliente(form);
        mostrarExito('Cliente creado correctamente.');
      }
      cerrarModal();
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el cliente.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (cliente) => {
    if (!window.confirm(`¿Eliminár a "${cliente.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarCliente(cliente.id);
      mostrarExito('Cliente eliminado.');
      cargar();
    } catch {
      setError('No se pudo eliminar el cliente.');
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

  const toggleHistorial = async (cliente) => {
    if (clienteExpandido === cliente.id) {
      setClienteExpandido(null);
      setVentasData(null);
      return;
    }
    setClienteExpandido(cliente.id);
    setVentasData(null);
    setCargandoVentas(true);
    try {
      const data = await obtenerVentas({ cliente_id: cliente.id });
      setVentasData(data);
    } catch {
      setVentasData({ error: 'No se pudo cargar el historial.' });
    } finally {
      setCargandoVentas(false);
    }
  };

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h2><i className="bi bi-people me-2 text-primary"></i>Clientes</h2>
          <p className="text-secondary mb-0" style={{ fontSize: '0.875rem' }}>
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={abrirAlta}>
          <i className="bi bi-plus-lg"></i>
          Nuevo cliente
        </button>
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

      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-secondary"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Buscar por DNI, apellido, nombre o email..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            style={{ borderRadius: '0 8px 8px 0' }}
          />
          {buscar && (
            <button className="btn btn-outline-secondary border-start-0" onClick={() => setBuscar('')}>
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {cargando ? (
          <div className="spinner-overlay">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            <i className="bi bi-people fs-1 d-block mb-2 opacity-25"></i>
            {buscar ? 'No se encontraron clientes con ese criterio.' : 'Aún no hay clientes registrados.'}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>DNI</th>
                  <th>Apellido</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th className="text-end">Ventas</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <React.Fragment key={c.id}>
                    <tr>
                      <td className="fw-500" style={{ fontFamily: 'monospace' }}>{c.dni}</td>
                    <td className="fw-500">{c.apellido}</td>
                    <td>{c.nombre}</td>
                    <td className="text-secondary">{c.telefono || <span className="text-muted">—</span>}</td>
                    <td className="text-secondary">{c.email || <span className="text-muted">—</span>}</td>
                    <td className="text-end">
                      <button
                        className={`btn btn-sm ${clienteExpandido === c.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => toggleHistorial(c)}
                        title="Ver historial de compras"
                      >
                        <i className={`bi bi-chevron-${clienteExpandido === c.id ? 'up' : 'down'}`}></i>
                      </button>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => abrirEdicion(c)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      {isAdmin && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(c)}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                  {clienteExpandido === c.id && (
                    <tr>
                      <td colSpan={7} className="p-0 border-0">
                        <div className="detalle-venta mx-3 mb-3">
                          {cargandoVentas ? (
                            <div className="text-center py-3">
                              <div className="spinner-border spinner-border-sm text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                              </div>
                            </div>
                          ) : ventasData?.error ? (
                            <div className="text-danger">{ventasData.error}</div>
                          ) : ventasData?.length === 0 ? (
                            <div className="text-secondary text-center py-2">Sin compras registradas</div>
                          ) : (
                            <>
                              <div className="fw-500 mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#71717A' }}>
                                Historial de Compras
                              </div>
                              <table className="table table-sm mb-0" style={{ fontSize: '0.875rem' }}>
                                <thead>
                                  <tr>
                                    <th className="fw-500 border-0 ps-0">Fecha</th>
                                    <th className="fw-500 border-0 text-end pe-0">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {ventasData?.map((venta, i) => (
                                    <React.Fragment key={i}>
                                      <tr>
                                        <td className="border-0 ps-0 text-secondary">
                                          {formatearFecha(venta.fecha)}
                                          {venta.descripcion && <span className="ms-2 text-muted">({venta.descripcion})</span>}
                                        </td>
                                        <td className="border-0 text-end pe-0 fw-500">
                                          {formatearPrecio(venta.total)}
                                        </td>
                                      </tr>
                                      {venta.graduacion && (
                                        <tr>
                                          <td colSpan={2} className="border-0 p-0 pb-3">
                                            <TablaGraduacionDetalle graduacion={venta.graduacion} />
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </tbody>
                              </table>
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
        )}
      </div>

      {/* Modal alta/edición */}
      {modalAbierto && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleGuardar}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editando ? 'Editar cliente' : 'Nuevo cliente'}
                  </h5>
                  <button type="button" className="btn-close" onClick={cerrarModal}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre *</label>
                      <input
                        name="nombre"
                        className="form-control"
                        placeholder="Ej: Juan"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Apellido *</label>
                      <input
                        name="apellido"
                        className="form-control"
                        placeholder="Ej: Pérez"
                        value={form.apellido}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">DNI *</label>
                    <input
                      name="dni"
                      className="form-control"
                      placeholder="Sin puntos ni espacios"
                      value={form.dni}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      name="telefono"
                      className="form-control"
                      placeholder="Ej: 11-1234-5678"
                      value={form.telefono}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      name="email"
                      type="email"
                      className="form-control"
                      placeholder="correo@ejemplo.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={guardando}>
                    {guardando ? (
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    ) : null}
                    {editando ? 'Guardar cambios' : 'Crear cliente'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
