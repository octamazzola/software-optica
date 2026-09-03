import React, { useState, useEffect, useCallback } from 'react';
import {
  obtenerCristales,
  crearCristal,
  actualizarCristal,
  eliminarCristal
} from '../api/cristales.api';
import useAuth from '../context/useAuth';

const FORM_VACIO = { 
    material: 'Organico', 
    tipo_lente: 'Monofocal', 
    tratamiento: '', 
    con_antirreflejo: false,
    con_blue_cut: false,
    con_fotocromatico: false,
    descripcion: '', 
    precio_tradicional: '', 
    precio_digital: '', 
    precio_ar_eternal: '' 
};

export default function CristalesPage() {
  const { isAdmin } = useAuth();
  const [cristales, setCristales] = useState([]);
  const [filtros, setFiltros] = useState({ material: '', tipo_lente: '', tratamiento: '' });
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
      const data = await obtenerCristales(filtros);
      setCristales(data);
      setError(null);
    } catch {
      setError('No se pudo cargar el catálogo de cristales.');
    } finally {
      setCargando(false);
    }
  }, [filtros]);

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

  const abrirEdicion = (cristal) => {
    setEditando(cristal);
    setForm({
      material: cristal.material,
      tipo_lente: cristal.tipo_lente,
      tratamiento: cristal.tratamiento || '',
      con_antirreflejo: cristal.con_antirreflejo === 1,
      con_blue_cut: cristal.con_blue_cut === 1,
      con_fotocromatico: cristal.con_fotocromatico === 1,
      descripcion: cristal.descripcion || '',
      precio_tradicional: cristal.precio_tradicional || '',
      precio_digital: cristal.precio_digital || '',
      precio_ar_eternal: cristal.precio_ar_eternal || '',
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setForm(FORM_VACIO);
  };

  const handleToggleChange = (name, checked) => {
    let nuevosToggles = { ...form, [name]: checked };
    
    if (name === 'blanco' && checked) {
        nuevosToggles.con_blue_cut = false;
        nuevosToggles.con_fotocromatico = false;
    } else if ((name === 'con_blue_cut' || name === 'con_fotocromatico') && checked) {
        // If they click blue cut or fotocromatico, "blanco" is implicitly false, 
        // we just update the specific toggle which we did in `nuevosToggles`
    }
    
    setForm(nuevosToggles);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
        if (name === 'con_antirreflejo') {
            setForm({ ...form, [name]: checked });
        } else {
            handleToggleChange(name, checked);
        }
    } else {
        setForm({ ...form, [name]: value });
    }
  };
  
  const handleFiltroChange = (e) => {
      setFiltros({ ...filtros, [e.target.name]: e.target.value });
  }

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.material.trim() || !form.tipo_lente.trim()) return;
    setGuardando(true);
    try {
      const payload = {
        ...form,
        precio_tradicional: form.precio_tradicional ? parseFloat(form.precio_tradicional) : null,
        precio_digital: form.precio_digital ? parseFloat(form.precio_digital) : null,
        precio_ar_eternal: form.precio_ar_eternal ? parseFloat(form.precio_ar_eternal) : null,
      };
      
      if (editando) {
        await actualizarCristal(editando.id, payload);
        mostrarExito('Cristal actualizado correctamente.');
      } else {
        await crearCristal(payload);
        mostrarExito('Cristal creado correctamente.');
      }
      cerrarModal();
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el cristal.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (cristal) => {
    if (!window.confirm(`¿Eliminar cristal "${cristal.descripcion || cristal.material}"?`)) return;
    try {
      await eliminarCristal(cristal.id);
      mostrarExito('Cristal eliminado.');
      cargar();
    } catch {
      setError('No se pudo eliminar el cristal.');
    }
  };

  const formatearPrecio = (p) => {
    if (p === null || p === undefined) return '—';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p);
  }

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h2><i className="bi bi-eye me-2 text-primary"></i>Catálogo de Cristales</h2>
          <p className="text-secondary mb-0" style={{ fontSize: '0.875rem' }}>
            {cristales.length} cristal{cristales.length !== 1 ? 'es' : ''} registrados
          </p>
        </div>
        {isAdmin && (
          <div className="d-flex gap-2">
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={abrirAlta}>
              <i className="bi bi-plus-lg"></i>
              Nuevo Cristal
            </button>
          </div>
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

      <div className="mb-3 d-flex gap-2 flex-wrap">
        <select name="material" className="form-select" style={{ width: '180px' }} value={filtros.material} onChange={handleFiltroChange}>
          <option value="">Todo Material</option>
          <option value="Organico">Orgánico</option>
          <option value="Policarbonato">Policarbonato</option>
          <option value="Acrilico">Acrílico</option>
          <option value="Mineral">Mineral</option>
          <option value="Trivex">Trivex</option>
        </select>
        <select name="tipo_lente" className="form-select" style={{ width: '180px' }} value={filtros.tipo_lente} onChange={handleFiltroChange}>
          <option value="">Todo Tipo</option>
          <option value="Monofocal">Monofocal</option>
          <option value="Bifocal">Bifocal</option>
          <option value="Multifocal">Multifocal</option>
          <option value="Ocupacional">Ocupacional</option>
          <option value="Stock">Stock</option>
        </select>
        <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-secondary"></i>
          </span>
          <input
            type="text"
            name="tratamiento"
            className="form-control border-start-0"
            placeholder="Buscar por tratamiento o descripción..."
            value={filtros.tratamiento}
            onChange={handleFiltroChange}
          />
          {filtros.tratamiento && (
            <button className="btn btn-outline-secondary" onClick={() => setFiltros({...filtros, tratamiento: ''})}>
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
        ) : cristales.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            <i className="bi bi-eye fs-1 d-block mb-2 opacity-25"></i>
            {filtros.material || filtros.tipo_lente || filtros.tratamiento 
                ? 'No se encontraron cristales con ese criterio.' 
                : 'Aún no hay cristales registrados.'}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Tipo</th>
                  <th>Tratamiento</th>
                  <th>Descripción</th>
                  <th className="text-end">Tradicional</th>
                  <th className="text-end">Digital</th>
                  <th className="text-end">AR Eternal</th>
                  {isAdmin && <th className="text-end">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {cristales.map((c) => {
                  const esBlanco = c.con_blue_cut === 0 && c.con_fotocromatico === 0;
                  return (
                    <tr key={c.id}>
                      <td className="fw-500">{c.material}</td>
                      <td>{c.tipo_lente}</td>
                      <td>
                        {esBlanco && <span className="badge bg-light text-dark border me-1">Blanco</span>}
                        {c.con_blue_cut === 1 && <span className="badge bg-primary bg-opacity-75 me-1">Blue Cut</span>}
                        {c.con_fotocromatico === 1 && <span className="badge bg-secondary me-1">Fotocromático</span>}
                        {c.con_antirreflejo === 1 && <span className="badge bg-success me-1">AR</span>}
                        {c.tratamiento && <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>{c.tratamiento}</span>}
                      </td>
                      <td className="text-secondary text-wrap" style={{ maxWidth: 200 }}>
                        {c.descripcion || '—'}
                      </td>
                      <td className="text-end fw-500">{formatearPrecio(c.precio_tradicional)}</td>
                      <td className="text-end fw-500">{formatearPrecio(c.precio_digital)}</td>
                      <td className="text-end fw-500">{formatearPrecio(c.precio_ar_eternal)}</td>
                      {isAdmin && (
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
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal alta/edición */}
      {modalAbierto && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <form onSubmit={handleGuardar}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editando ? 'Editar Cristal' : 'Nuevo Cristal'}
                  </h5>
                  <button type="button" className="btn-close" onClick={cerrarModal}></button>
                </div>
                <div className="modal-body row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Material *</label>
                    <select name="material" className="form-select" value={form.material} onChange={handleChange} required>
                      <option value="Organico">Orgánico</option>
                      <option value="Policarbonato">Policarbonato</option>
                      <option value="Acrilico">Acrílico</option>
                      <option value="Mineral">Mineral</option>
                      <option value="Trivex">Trivex</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tipo de Lente *</label>
                    <select name="tipo_lente" className="form-select" value={form.tipo_lente} onChange={handleChange} required>
                      <option value="Monofocal">Monofocal</option>
                      <option value="Bifocal">Bifocal</option>
                      <option value="Multifocal">Multifocal</option>
                      <option value="Ocupacional">Ocupacional</option>
                      <option value="Stock">Stock</option>
                    </select>
                  </div>
                  
                  {/* Toggles de Tratamientos */}
                  <div className="col-12 mt-4">
                      <h6 className="mb-3 text-secondary">Tratamientos Básicos</h6>
                      <div className="d-flex flex-wrap gap-4 mb-2 p-3 bg-light rounded border">
                          <div className="form-check form-switch">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                name="blanco" 
                                id="blancoSwitch" 
                                checked={!form.con_blue_cut && !form.con_fotocromatico} 
                                onChange={handleChange} 
                            />
                            <label className="form-check-label" htmlFor="blancoSwitch">Blanco</label>
                          </div>
                          
                          <div className="form-check form-switch">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                name="con_blue_cut" 
                                id="bcSwitch" 
                                checked={form.con_blue_cut} 
                                onChange={handleChange} 
                            />
                            <label className="form-check-label text-primary" htmlFor="bcSwitch">Blue Cut</label>
                          </div>

                          <div className="form-check form-switch">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                name="con_fotocromatico" 
                                id="fotoSwitch" 
                                checked={form.con_fotocromatico} 
                                onChange={handleChange} 
                            />
                            <label className="form-check-label text-secondary" htmlFor="fotoSwitch">Fotocromático</label>
                          </div>
                          
                          <div className="form-check form-switch border-start ps-4 ms-2">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                name="con_antirreflejo" 
                                id="arSwitch" 
                                checked={form.con_antirreflejo} 
                                onChange={handleChange} 
                            />
                            <label className="form-check-label text-success" htmlFor="arSwitch">Con Antirreflejo</label>
                          </div>
                      </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label text-secondary">Otro tratamiento <span style={{fontSize: '0.75rem'}}>(opcional)</span></label>
                    <input name="tratamiento" className="form-control" placeholder="Ej: Antiage + Infrarrojo" value={form.tratamiento} onChange={handleChange} />
                  </div>

                  <div className="col-12 mt-4">
                    <h6 className="mb-2 text-secondary">Detalles y Precios</h6>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Descripción</label>
                    <textarea name="descripcion" className="form-control" rows={2} placeholder="Descripción completa o rango (ej: -10.00/+8.00)" value={form.descripcion} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Precio Tradicional</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input name="precio_tradicional" type="number" min="0" step="0.01" className="form-control" value={form.precio_tradicional} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Precio Digital</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input name="precio_digital" type="number" min="0" step="0.01" className="form-control" value={form.precio_digital} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Precio AR Eternal</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input name="precio_ar_eternal" type="number" min="0" step="0.01" className="form-control" value={form.precio_ar_eternal} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer mt-4">
                  <button type="button" className="btn btn-outline-secondary" onClick={cerrarModal}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={guardando}>
                    {guardando && <span className="spinner-border spinner-border-sm me-1" role="status"></span>}
                    {editando ? 'Guardar cambios' : 'Crear cristal'}
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
