import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerClientes } from '../api/clientes.api';
import { obtenerProductos } from '../api/productos.api';
import { crearVenta } from '../api/ventas.api';

export default function NuevaVentaPage() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Selecciones del formulario
  const [clienteId, setClienteId] = useState('');
  const [productoBuscar, setProductoBuscar] = useState('');
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const [c, p] = await Promise.all([obtenerClientes(), obtenerProductos()]);
        setClientes(c);
        setProductos(p);
      } catch {
        setError('No se pudo cargar clientes/productos del servidor.');
      } finally {
        setCargando(false);
      }
    };
    init();
  }, []);

  const productosFiltrados = productos.filter(
    (p) =>
      !carrito.some((item) => item.producto_id === p.id) &&
      (p.nombre.toLowerCase().includes(productoBuscar.toLowerCase()) ||
        p.codigo.toLowerCase().includes(productoBuscar.toLowerCase()))
  );

  const agregarAlCarrito = (producto) => {
    setCarrito([
      ...carrito,
      { producto_id: producto.id, codigo: producto.codigo, nombre: producto.nombre, precio: producto.precio, cantidad: 1 },
    ]);
    setProductoBuscar('');
  };

  const cambiarCantidad = (producto_id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setCarrito(carrito.map((item) =>
      item.producto_id === producto_id ? { ...item, cantidad: nuevaCantidad } : item
    ));
  };

  const quitarDelCarrito = (producto_id) => {
    setCarrito(carrito.filter((item) => item.producto_id !== producto_id));
  };

  const totalCarrito = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const formatearPrecio = (p) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p);

  const handleConfirmar = async () => {
    if (!clienteId) { setError('Seleccioná un cliente.'); return; }
    if (carrito.length === 0) { setError('Agregá al menos un producto al carrito.'); return; }
    setError(null);
    setGuardando(true);
    try {
      const payload = {
        cliente_id: parseInt(clienteId),
        items: carrito.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })),
      };
      await crearVenta(payload);
      navigate('/ventas');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo registrar la venta.');
    } finally {
      setGuardando(false);
    }
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
      <div className="page-header">
        <h2><i className="bi bi-cart-plus me-2 text-primary"></i>Nueva Venta</h2>
        <p className="text-secondary mb-0" style={{ fontSize: '0.875rem' }}>
          Seleccioná el cliente y los productos para registrar la venta
        </p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {error}
          <button className="btn-close ms-auto" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Panel izquierdo */}
        <div className="col-lg-7">
          {/* Selección de cliente */}
          <div className="card mb-3">
            <div className="card-header d-flex align-items-center gap-2">
              <i className="bi bi-person-check text-primary"></i>
              Cliente
            </div>
            <div className="card-body">
              <select
                className="form-select"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
              >
                <option value="">— Seleccioná un cliente —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.email ? `(${c.email})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buscador de productos */}
          <div className="card">
            <div className="card-header d-flex align-items-center gap-2">
              <i className="bi bi-box text-primary"></i>
              Agregar productos
            </div>
            <div className="card-body">
              <div className="input-group mb-3">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-secondary"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Buscar producto por nombre o código..."
                  value={productoBuscar}
                  onChange={(e) => setProductoBuscar(e.target.value)}
                />
              </div>

              {productoBuscar && (
                <div className="border rounded-3 overflow-hidden" style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {productosFiltrados.length === 0 ? (
                    <div className="text-secondary text-center py-3" style={{ fontSize: '0.875rem' }}>
                      No hay productos disponibles con ese criterio.
                    </div>
                  ) : (
                    productosFiltrados.map((p) => (
                      <button
                        key={p.codigo}
                        type="button"
                        className="w-100 text-start px-3 py-2 border-0 border-bottom bg-white"
                        style={{ transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                        onClick={() => agregarAlCarrito(p)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className="fw-500">{p.nombre}</span>
                            <span className="badge bg-light text-dark border ms-2" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                              {p.codigo}
                            </span>
                          </div>
                          <span className="text-primary fw-500">{formatearPrecio(p.precio)}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel derecho — Carrito */}
        <div className="col-lg-5">
          <div className="card" style={{ position: 'sticky', top: '80px' }}>
            <div className="card-header d-flex align-items-center gap-2">
              <i className="bi bi-cart3 text-primary"></i>
              Carrito
              {carrito.length > 0 && (
                <span className="badge bg-primary ms-auto">{carrito.length}</span>
              )}
            </div>
            <div className="card-body p-3">
              {carrito.length === 0 ? (
                <div className="text-center text-secondary py-4">
                  <i className="bi bi-cart3 fs-1 d-block mb-2 opacity-25"></i>
                  <div style={{ fontSize: '0.875rem' }}>El carrito está vacío.</div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {carrito.map((item) => (
                    <div key={item.producto_id} className="carrito-item">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div className="fw-500" style={{ fontSize: '0.875rem' }}>{item.nombre}</div>
                        <button
                          className="btn btn-sm border-0 text-danger p-0 ms-2"
                          onClick={() => quitarDelCarrito(item.producto_id)}
                          title="Quitar"
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            style={{ width: 28, height: 28, padding: 0, lineHeight: 1 }}
                            onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                          >−</button>
                          <span className="fw-500 px-1">{item.cantidad}</span>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            style={{ width: 28, height: 28, padding: 0, lineHeight: 1 }}
                            onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                          >+</button>
                        </div>
                        <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                          {formatearPrecio(item.precio * item.cantidad)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {carrito.length > 0 && (
              <div className="card-footer">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-500">Total</span>
                  <span className="fw-700 fs-5 text-primary">{formatearPrecio(totalCarrito)}</span>
                </div>
                <button
                  className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleConfirmar}
                  disabled={guardando || !clienteId}
                >
                  {guardando ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <i className="bi bi-check-circle"></i>
                  )}
                  {guardando ? 'Registrando...' : 'Confirmar venta'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
