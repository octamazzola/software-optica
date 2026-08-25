import React, { useState, useEffect, useCallback } from 'react';
import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from '../api/clientes.api';

const FORM_VACIO = { nombre: '', telefono: '', email: '' };

export default function ClientesPage() {
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
    setForm({ nombre: cliente.nombre, telefono: cliente.telefono || '', email: cliente.email || '' });
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
    if (!form.nombre.trim()) return;
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
            placeholder="Buscar por nombre, email..."
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
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-500">{c.nombre}</td>
                    <td className="text-secondary">{c.telefono || <span className="text-muted">—</span>}</td>
                    <td className="text-secondary">{c.email || <span className="text-muted">—</span>}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => abrirEdicion(c)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleEliminar(c)}
                        title="Eliminar"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
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
                  <div className="mb-3">
                    <label className="form-label">Nombre *</label>
                    <input
                      name="nombre"
                      className="form-control"
                      placeholder="Nombre completo"
                      value={form.nombre}
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
