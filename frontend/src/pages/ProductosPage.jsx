import React, { useState, useEffect, useCallback } from 'react';
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '../api/productos.api';
import useAuth from '../context/useAuth';

const FORM_VACIO = { codigo: '', nombre: '', descripcion: '', precio: '', categoria: 'Armazón de Vista' };

export default function ProductosPage() {
  const { isAdmin } = useAuth();
  const [productos, setProductos] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerProductos(buscar, categoriaFilter);
      setProductos(data);
      setError(null);
    } catch {
      setError('No se pudo cargar la lista de productos.');
    } finally {
      setCargando(false);
    }
  }, [buscar, categoriaFilter]);

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

  const abrirEdicion = (producto) => {
    setEditando(producto);
    setForm({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      categoria: producto.categoria || 'Armazón de Vista',
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
    if (!form.nombre.trim() || !form.codigo.trim()) return;
    setGuardando(true);
    try {
      const payload = {
        ...form,
        precio: parseFloat(form.precio) || 0,
      };
      if (editando) {
        const datosActualizar = payload;
        await actualizarProducto(editando.id, datosActualizar);
        mostrarExito('Producto actualizado correctamente.');
      } else {
        await crearProducto(payload);
        mostrarExito('Producto creado correctamente.');
      }
      cerrarModal();
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (producto) => {
    if (!window.confirm(`¿Eliminár "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarProducto(producto.id);
      mostrarExito('Producto eliminado.');
      cargar();
    } catch {
      setError('No se pudo eliminar el producto.');
    }
  };

  const formatearPrecio = (p) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p);

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h2><i className="bi bi-box me-2 text-primary"></i>Productos</h2>
          <p className="text-secondary mb-0" style={{ fontSize: '0.875rem' }}>
            {productos.length} producto{productos.length !== 1 ? 's' : ''} en catálogo
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={abrirAlta}>
            <i className="bi bi-plus-lg"></i>
            Nuevo producto
          </button>
        )}
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

      <div className="mb-3 d-flex gap-2">
        <div className="input-group" style={{ flex: 1 }}>
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-secondary"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Buscar por nombre o código..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          {buscar && (
            <button className="btn btn-outline-secondary" onClick={() => setBuscar('')}>
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
        <select 
          className="form-select" 
          style={{ width: '200px' }}
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          <option value="Armazón de Vista">Armazón de Vista</option>
          <option value="Armazón de Sol">Armazón de Sol</option>
          <option value="Accesorio">Accesorio</option>
        </select>
      </div>

      <div className="card">
        {cargando ? (
          <div className="spinner-overlay">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            <i className="bi bi-box fs-1 d-block mb-2 opacity-25"></i>
            {buscar ? 'No se encontraron productos con ese criterio.' : 'Aún no hay productos registrados.'}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th className="text-end">Precio</th>
                  {isAdmin && <th className="text-end">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="badge bg-light text-dark border" style={{ fontFamily: 'monospace' }}>
                        {p.codigo}
                      </span>
                    </td>
                    <td className="fw-500">{p.nombre}</td>
                    <td>
                      <span className={`badge ${p.categoria === 'Accesorio' ? 'bg-secondary' : 'bg-info'}`}>
                        {p.categoria || 'Armazón de Vista'}
                      </span>
                    </td>
                    <td className="text-secondary" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.descripcion || <span className="text-muted">—</span>}
                    </td>
                    <td className="text-end fw-500">{formatearPrecio(p.precio)}</td>
                    {isAdmin && (
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-secondary me-1"
                          onClick={() => abrirEdicion(p)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(p)}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    )}
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
                    {editando ? 'Editar producto' : 'Nuevo producto'}
                  </h5>
                  <button type="button" className="btn-close" onClick={cerrarModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Código *</label>
                    <input
                      name="codigo"
                      className="form-control"
                      placeholder="Ej: ARM-001"
                      value={form.codigo}
                      onChange={handleChange}
                      required
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nombre *</label>
                    <input
                      name="nombre"
                      className="form-control"
                      placeholder="Nombre del producto"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Categoría *</label>
                    <select
                      name="categoria"
                      className="form-select"
                      value={form.categoria}
                      onChange={handleChange}
                      required
                    >
                      <option value="Armazón de Vista">Armazón de Vista</option>
                      <option value="Armazón de Sol">Armazón de Sol</option>
                      <option value="Accesorio">Accesorio</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      name="descripcion"
                      className="form-control"
                      placeholder="Descripción opcional"
                      rows={2}
                      value={form.descripcion}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Precio *</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        name="precio"
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        placeholder="0.00"
                        value={form.precio}
                        onChange={handleChange}
                        required
                      />
                    </div>
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
                    {editando ? 'Guardar cambios' : 'Crear producto'}
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
