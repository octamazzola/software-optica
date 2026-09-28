import React, { useState, useEffect } from 'react';
import { listarUsuariosApi, crearUsuarioApi } from '../api/auth.api';
import useAuth from '../context/useAuth';

export default function UsuariosPage() {
  const { user: currentUser } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Modal / Formulario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('vendedor');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [verPassword, setVerPassword] = useState(false);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError('');
      const data = await listarUsuariosApi();
      setUsuarios(data);
    } catch (err) {
      console.error('Error al listar usuarios:', err);
      setError('No se pudo cargar la lista de usuarios. Verificá que tengas permisos de administrador.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Validaciones de contraseña
  const validaciones = {
    longitud: password.length >= 8,
    mayuscula: /[A-Z]/.test(password),
    minuscula: /[a-z]/.test(password),
    numero: /[0-9]/.test(password),
  };
  const passwordValida = Object.values(validaciones).every(Boolean);

  const abrirModal = () => {
    setNombre('');
    setUsername('');
    setPassword('');
    setRol('vendedor');
    setErrorForm('');
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setErrorForm('');
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    setErrorForm('');

    if (!nombre.trim() || nombre.trim().length < 2) {
      setErrorForm('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    if (!username.trim() || username.trim().length < 3) {
      setErrorForm('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }

    if (!passwordValida) {
      setErrorForm('La contraseña no cumple con todos los requisitos de seguridad.');
      return;
    }

    try {
      setGuardando(true);
      await crearUsuarioApi({
        nombre: nombre.trim(),
        username: username.trim().toLowerCase(),
        password,
        rol,
      });

      setMensajeExito(`¡Usuario "${username.trim()}" creado exitosamente con rol de ${rol === 'admin' ? 'Administrador' : 'Vendedor'}!`);
      setTimeout(() => setMensajeExito(''), 5000);
      cerrarModal();
      await cargarUsuarios();
    } catch (err) {
      console.error('Error al crear usuario:', err);
      setErrorForm(err.response?.data?.error || 'Error al crear el usuario. Verificá los datos.');
    } finally {
      setGuardando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      u.username?.toLowerCase().includes(q) ||
      u.nombre?.toLowerCase().includes(q) ||
      u.rol?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Encabezado de página */}
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2>Gestión de Usuarios</h2>
            <span className="badge bg-secondary-subtle text-secondary">
              {usuarios.length} {usuarios.length === 1 ? 'usuario' : 'usuarios'}
            </span>
          </div>
          <p className="text-secondary small mb-0 mt-1">
            Administrá el acceso, roles y credenciales para el personal de la óptica
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModal}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <i className="bi bi-person-plus-fill"></i>
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Alertas globales */}
      {mensajeExito && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-check-circle-fill flex-shrink-0"></i>
          <div>{mensajeExito}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="card border mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="search-box">
                <i className="bi bi-search search-icon"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar por usuario, nombre o rol..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => setBusqueda('')}
                    className="search-clear-btn"
                    title="Limpiar búsqueda"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="card border">
        <div className="card-body p-0">
          {cargando ? (
            <div className="spinner-overlay py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando usuarios...</span>
              </div>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <i className="bi bi-people" style={{ fontSize: '2.5rem' }}></i>
              <p className="mt-2 mb-0">No se encontraron usuarios {busqueda ? 'con ese criterio' : 'registrados'}.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Nombre Completo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Fecha de Alta</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u) => {
                    const esActual = currentUser?.username === u.username;
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                              style={{
                                width: '32px',
                                height: '32px',
                                fontSize: '0.8rem',
                                backgroundColor: u.rol === 'admin' ? 'rgba(84, 122, 158, 0.18)' : '#ECEFF1',
                                color: u.rol === 'admin' ? 'var(--color-primary)' : 'var(--text-secondary)',
                              }}
                            >
                              {u.username?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <span className="fw-semibold">{u.username}</span>
                              {esActual && (
                                <span className="badge bg-secondary-subtle text-secondary ms-2" style={{ fontSize: '0.68rem' }}>
                                  Tú
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{u.nombre}</td>
                        <td>
                          <span
                            className={`badge ${
                              u.rol === 'admin' ? 'bg-primary-subtle' : 'bg-secondary-subtle text-secondary'
                            }`}
                          >
                            {u.rol === 'admin' ? (
                              <>
                                <i className="bi bi-shield-lock-fill me-1"></i>
                                Administrador
                              </>
                            ) : (
                              <>
                                <i className="bi bi-person me-1"></i>
                                Vendedor
                              </>
                            )}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success-subtle d-inline-flex align-items-center gap-1">
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-success)',
                              }}
                            ></span>
                            Activo
                          </span>
                        </td>
                        <td className="text-secondary small">
                          {u.creado_en ? new Date(u.creado_en).toLocaleDateString('es-AR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Crear Nuevo Usuario */}
      {mostrarModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(38, 50, 56, 0.55)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom py-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-primary"
                    style={{ width: '34px', height: '34px', backgroundColor: 'rgba(84, 122, 158, 0.14)' }}
                  >
                    <i className="bi bi-person-plus-fill"></i>
                  </div>
                  <h5 className="modal-title fw-bold mb-0" style={{ fontSize: '1.1rem' }}>
                    Nuevo Usuario
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cerrarModal}
                  aria-label="Cerrar"
                ></button>
              </div>

              <form onSubmit={handleCrearUsuario}>
                <div className="modal-body p-4">
                  {errorForm && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 small" role="alert">
                      <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                      <div>{errorForm}</div>
                    </div>
                  )}

                  {/* Nombre Completo */}
                  <div className="mb-3">
                    <label className="form-label">Nombre Completo <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Octavio Mazzola"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>

                  {/* Nombre de Usuario */}
                  <div className="mb-3">
                    <label className="form-label">Nombre de Usuario (Login) <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-secondary">@</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: octavio"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-text text-secondary small">
                      Solo letras y números, mínimo 3 caracteres.
                    </div>
                  </div>

                  {/* Rol */}
                  <div className="mb-3">
                    <label className="form-label">Rol y Permisos <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={rol}
                      onChange={(e) => setRol(e.target.value)}
                    >
                      <option value="vendedor">Vendedor (Ventas, Clientes, Catálogo)</option>
                      <option value="admin">Administrador (Control total y gestión de usuarios)</option>
                    </select>
                  </div>

                  {/* Contraseña */}
                  <div className="mb-3">
                    <label className="form-label">Contraseña <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <input
                        type={verPassword ? 'text' : 'password'}
                        className="form-control border-end-0"
                        placeholder="Contraseña segura"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0"
                        onClick={() => setVerPassword(!verPassword)}
                        tabIndex="-1"
                      >
                        <i className={`bi ${verPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>

                    {/* Checklist interactivo de seguridad de contraseña */}
                    <div className="mt-2 p-2 rounded bg-light border" style={{ fontSize: '0.78rem' }}>
                      <span className="fw-semibold text-secondary d-block mb-1">Requisitos de contraseña:</span>
                      <div className="d-flex flex-column gap-1">
                        <span className={validaciones.longitud ? 'text-success' : 'text-secondary'}>
                          <i className={`bi ${validaciones.longitud ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                          Al menos 8 caracteres
                        </span>
                        <span className={validaciones.mayuscula ? 'text-success' : 'text-secondary'}>
                          <i className={`bi ${validaciones.mayuscula ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                          Al menos una mayúscula (A-Z)
                        </span>
                        <span className={validaciones.minuscula ? 'text-success' : 'text-secondary'}>
                          <i className={`bi ${validaciones.minuscula ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                          Al menos una minúscula (a-z)
                        </span>
                        <span className={validaciones.numero ? 'text-success' : 'text-secondary'}>
                          <i className={`bi ${validaciones.numero ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                          Al menos un número (0-9)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light py-2 px-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cerrarModal}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={guardando || !passwordValida}
                  >
                    {guardando && (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    )}
                    <span>Crear Usuario</span>
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
