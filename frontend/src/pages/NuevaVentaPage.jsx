import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerClientes } from '../api/clientes.api';
import { obtenerProductos, obtenerMasVendidos } from '../api/productos.api';
import { obtenerCristales } from '../api/cristales.api';
import { crearVenta } from '../api/ventas.api';

const INITIAL_GRADUACION = {
  material: 'Organico',
  con_antirreflejo: false,
  color: '',
  laca: '',
  calibrado: '',
  dp_derecho: '',
  dp_izquierdo: '',
  altura_derecho: '',
  altura_izquierdo: '',
  esf_od_lejos: '', cil_od_lejos: '', eje_od_lejos: '', diametro_od_lejos: '',
  esf_od_cerca: '', cil_od_cerca: '', eje_od_cerca: '', diametro_od_cerca: '',
  esf_oi_lejos: '', cil_oi_lejos: '', eje_oi_lejos: '', diametro_oi_lejos: '',
  esf_oi_cerca: '', cil_oi_cerca: '', eje_oi_cerca: '', diametro_oi_cerca: ''
};

export default function NuevaVentaPage() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cristales, setCristales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [clienteBuscar, setClienteBuscar] = useState('');
  
  const [productoBuscar, setProductoBuscar] = useState('');
  const [cristalBuscar, setCristalBuscar] = useState('');
  
  const [carrito, setCarrito] = useState([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  
  const [descripcionVenta, setDescripcionVenta] = useState('');
  const [tabActivo, setTabActivo] = useState('productos');

  // Estado para la sección de Graduación de Lentes
  const [incluyeGraduacion, setIncluyeGraduacion] = useState(false);
  const [graduacion, setGraduacion] = useState(INITIAL_GRADUACION);

  const handleGraduacionChange = (field, value) => {
    setGraduacion((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [c, p, pm, cris] = await Promise.all([
          obtenerClientes(), 
          obtenerProductos(), 
          obtenerMasVendidos(),
          obtenerCristales()
        ]);
        setClientes(c);
        setProductos(p);
        setProductosMasVendidos(pm);
        setCristales(cris);
      } catch {
        setError('No se pudo cargar la información del servidor.');
      } finally {
        setCargando(false);
      }
    };
    init();
  }, []);

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(clienteBuscar.toLowerCase()) ||
      c.apellido?.toLowerCase().includes(clienteBuscar.toLowerCase()) ||
      c.dni?.includes(clienteBuscar)
  );

  const productosFiltrados = productos.filter(
    (p) =>
      !carrito.some((item) => item.producto_id === p.id) &&
      (p.nombre.toLowerCase().includes(productoBuscar.toLowerCase()) ||
        p.codigo.toLowerCase().includes(productoBuscar.toLowerCase()))
  );
  
  const cristalesFiltrados = cristales.filter(
      (c) => 
        !carrito.some(item => item.cristal_id === c.id) &&
        (c.descripcion?.toLowerCase().includes(cristalBuscar.toLowerCase()) || 
         c.material.toLowerCase().includes(cristalBuscar.toLowerCase()) ||
         c.tratamiento?.toLowerCase().includes(cristalBuscar.toLowerCase()) ||
         (c.con_blue_cut === 1 && 'blue cut'.includes(cristalBuscar.toLowerCase())) ||
         (c.con_fotocromatico === 1 && 'fotocromático fotocromatico'.includes(cristalBuscar.toLowerCase())) ||
         (c.con_blue_cut === 0 && c.con_fotocromatico === 0 && 'blanco'.includes(cristalBuscar.toLowerCase())))
  );

  const agregarAlCarrito = (item, tipo, precioDefecto) => {
    setCarrito([
      ...carrito,
      { 
          producto_id: tipo === 'producto' ? item.id : null, 
          cristal_id: tipo === 'cristal' ? item.id : null,
          codigo: item.codigo || '', 
          nombre: tipo === 'producto' 
            ? item.nombre 
            : `${item.material} ${item.tipo_lente} ${item.con_blue_cut ? 'Blue Cut ' : ''}${item.con_fotocromatico ? 'Fotocromático ' : ''}${(!item.con_blue_cut && !item.con_fotocromatico) ? 'Blanco ' : ''}${item.tratamiento ? `(${item.tratamiento}) ` : ''}${item.con_antirreflejo ? 'AR' : ''}`.trim(),
          descripcion: item.descripcion || '',
          precio_unitario: precioDefecto || 0,
          cantidad: 1 
      },
    ]);
    if (tipo === 'producto') setProductoBuscar('');
    if (tipo === 'cristal') setCristalBuscar('');
  };

  const cambiarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    const nuevoCarrito = [...carrito];
    nuevoCarrito[index].cantidad = nuevaCantidad;
    setCarrito(nuevoCarrito);
  };
  
  const cambiarPrecio = (index, nuevoPrecio) => {
      const p = parseFloat(nuevoPrecio);
      const nuevoCarrito = [...carrito];
      nuevoCarrito[index].precio_unitario = isNaN(p) ? 0 : p;
      setCarrito(nuevoCarrito);
  };

  const quitarDelCarrito = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const totalCarrito = carrito.reduce((acc, item) => acc + item.precio_unitario * item.cantidad, 0);

  const formatearPrecio = (p) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p);

  const parseNum = (val) => (val !== '' && val !== null && !isNaN(val) ? parseFloat(val) : null);

  const handleConfirmar = async () => {
    if (!clienteSeleccionado) { setError('Seleccioná un cliente.'); return; }
    if (carrito.length === 0) { setError('Agregá al menos un ítem al carrito.'); return; }
    setError(null);
    setGuardando(true);
    try {
      const payload = {
        cliente_id: clienteSeleccionado.id,
        descripcion: descripcionVenta,
        items: carrito.map(({ producto_id, cristal_id, cantidad, precio_unitario }) => ({ 
            producto_id, 
            cristal_id, 
            cantidad, 
            precio_unitario 
        })),
        graduacion: incluyeGraduacion ? {
          material: graduacion.material,
          con_antirreflejo: graduacion.con_antirreflejo ? 1 : 0,
          color: graduacion.color || null,
          laca: graduacion.laca || null,
          calibrado: graduacion.calibrado || null,
          dp_derecho: parseNum(graduacion.dp_derecho),
          dp_izquierdo: parseNum(graduacion.dp_izquierdo),
          altura_derecho: parseNum(graduacion.altura_derecho),
          altura_izquierdo: parseNum(graduacion.altura_izquierdo),
          esf_od_lejos: parseNum(graduacion.esf_od_lejos),
          cil_od_lejos: parseNum(graduacion.cil_od_lejos),
          eje_od_lejos: parseNum(graduacion.eje_od_lejos),
          diametro_od_lejos: parseNum(graduacion.diametro_od_lejos),
          esf_od_cerca: parseNum(graduacion.esf_od_cerca),
          cil_od_cerca: parseNum(graduacion.cil_od_cerca),
          eje_od_cerca: parseNum(graduacion.eje_od_cerca),
          diametro_od_cerca: parseNum(graduacion.diametro_od_cerca),
          esf_oi_lejos: parseNum(graduacion.esf_oi_lejos),
          cil_oi_lejos: parseNum(graduacion.cil_oi_lejos),
          eje_oi_lejos: parseNum(graduacion.eje_oi_lejos),
          diametro_oi_lejos: parseNum(graduacion.diametro_oi_lejos),
          esf_oi_cerca: parseNum(graduacion.esf_oi_cerca),
          cil_oi_cerca: parseNum(graduacion.cil_oi_cerca),
          eje_oi_cerca: parseNum(graduacion.eje_oi_cerca),
          diametro_oi_cerca: parseNum(graduacion.diametro_oi_cerca),
        } : null
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
          Seleccioná el cliente, armazones/cristales y opcionalmente la receta de graduación
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
              {clienteSeleccionado ? (
                <div className="d-flex align-items-center justify-content-between p-3 border rounded-3 bg-light">
                  <div>
                    <div className="fw-bold">{clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</div>
                    <div className="text-secondary small">DNI: {clienteSeleccionado.dni}</div>
                  </div>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => { setClienteSeleccionado(null); setClienteBuscar(''); }}
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <>
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-search text-secondary"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Buscar cliente por DNI, nombre o apellido..."
                      value={clienteBuscar}
                      onChange={(e) => setClienteBuscar(e.target.value)}
                    />
                  </div>
                  {clienteBuscar && (
                    <div className="border rounded-3 overflow-hidden mb-3" style={{ maxHeight: 200, overflowY: 'auto' }}>
                      {clientesFiltrados.length === 0 ? (
                        <div className="text-secondary text-center py-3" style={{ fontSize: '0.875rem' }}>
                          No se encontraron clientes.
                        </div>
                      ) : (
                        clientesFiltrados.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="w-100 text-start px-3 py-2 border-0 border-bottom bg-white"
                            style={{ transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                            onClick={() => setClienteSeleccionado(c)}
                          >
                            <div className="fw-500">{c.nombre} {c.apellido}</div>
                            <div className="text-secondary small">DNI: {c.dni}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Catálogo mixto */}
          <div className="card">
            <div className="card-header p-0">
                <ul className="nav nav-tabs card-header-tabs m-0 p-2 border-bottom-0">
                    <li className="nav-item">
                        <button className={`nav-link ${tabActivo === 'productos' ? 'active' : ''}`} onClick={() => setTabActivo('productos')}>
                            <i className="bi bi-box me-1"></i> Armazones / Accesorios
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${tabActivo === 'cristales' ? 'active' : ''}`} onClick={() => setTabActivo('cristales')}>
                            <i className="bi bi-eye me-1"></i> Cristales
                        </button>
                    </li>
                </ul>
            </div>
            <div className="card-body">
                {tabActivo === 'productos' ? (
                    <>
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
                              No hay productos disponibles.
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
                                onClick={() => agregarAlCarrito(p, 'producto', p.precio)}
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

                      {!productoBuscar && productosMasVendidos.length > 0 && (
                        <div className="mt-4">
                          <h6 className="text-secondary mb-3" style={{ fontSize: '0.875rem' }}>
                            <i className="bi bi-star-fill text-warning me-2"></i>
                            Más vendidos
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {productosMasVendidos.map((pm) => (
                              <button
                                key={pm.id}
                                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 rounded-pill"
                                onClick={() => agregarAlCarrito(pm, 'producto', pm.precio)}
                                disabled={carrito.some(item => item.producto_id === pm.id)}
                              >
                                <i className="bi bi-plus"></i>
                                {pm.nombre}
                                <span className="badge bg-light text-dark border">{formatearPrecio(pm.precio)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                ) : (
                    <>
                        <div className="input-group mb-3">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-search text-secondary"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Buscar por material, tratamiento o descripción..."
                                value={cristalBuscar}
                                onChange={(e) => setCristalBuscar(e.target.value)}
                            />
                        </div>
                        
                        <div className="border rounded-3 overflow-hidden" style={{ maxHeight: 350, overflowY: 'auto' }}>
                          {cristalBuscar && cristalesFiltrados.length === 0 ? (
                            <div className="text-secondary text-center py-3" style={{ fontSize: '0.875rem' }}>
                              No hay cristales disponibles con ese criterio.
                            </div>
                          ) : (
                            cristalesFiltrados.slice(0, 50).map((c) => (
                                <div key={c.id} className="d-flex flex-column px-3 py-2 border-bottom bg-white">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <span className="fw-500">{c.material} {c.tipo_lente}</span>
                                            <div className="mt-1">
                                                {(c.con_blue_cut === 0 && c.con_fotocromatico === 0) && <span className="badge bg-light text-dark border me-1">Blanco</span>}
                                                {c.con_blue_cut === 1 && <span className="badge bg-primary bg-opacity-75 me-1">Blue Cut</span>}
                                                {c.con_fotocromatico === 1 && <span className="badge bg-secondary me-1">Fotocromático</span>}
                                                {c.con_antirreflejo === 1 && <span className="badge bg-success me-1">AR</span>}
                                                {c.tratamiento && <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>{c.tratamiento}</span>}
                                            </div>
                                        </div>
                                        <div className="text-secondary small text-end" style={{ maxWidth: 200, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                            {c.descripcion}
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2 justify-content-end">
                                        {c.precio_tradicional !== null && (
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => agregarAlCarrito(c, 'cristal', c.precio_tradicional)}>
                                                Trad. {formatearPrecio(c.precio_tradicional)}
                                            </button>
                                        )}
                                        {c.precio_digital !== null && (
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => agregarAlCarrito(c, 'cristal', c.precio_digital)}>
                                                Dig. {formatearPrecio(c.precio_digital)}
                                            </button>
                                        )}
                                        {c.precio_ar_eternal !== null && (
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => agregarAlCarrito(c, 'cristal', c.precio_ar_eternal)}>
                                                AR E. {formatearPrecio(c.precio_ar_eternal)}
                                            </button>
                                        )}
                                        {!c.precio_tradicional && !c.precio_digital && !c.precio_ar_eternal && (
                                            <button className="btn btn-sm btn-outline-secondary" onClick={() => agregarAlCarrito(c, 'cristal', 0)}>
                                                Agregar (Precio manual)
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                          )}
                          {!cristalBuscar && (
                              <div className="text-secondary text-center py-3" style={{ fontSize: '0.875rem' }}>
                                Busque un cristal para agregarlo a la venta.
                              </div>
                          )}
                        </div>
                    </>
                )}
            </div>
          </div>
        </div>

        {/* Panel derecho — Carrito */}
        <div className="col-lg-5">
          <div className="card" style={{ position: 'sticky', top: '80px' }}>
            <div className="card-header d-flex align-items-center gap-2">
              <i className="bi bi-cart3 text-primary"></i>
              Resumen de Venta
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
                <div className="d-flex flex-column gap-3">
                  {carrito.map((item, index) => (
                    <div key={index} className="carrito-item border-bottom pb-2">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <div className="fw-500" style={{ fontSize: '0.875rem' }}>
                                {item.producto_id && <i className="bi bi-box me-1 text-secondary"></i>}
                                {item.cristal_id && <i className="bi bi-eye me-1 text-secondary"></i>}
                                {item.nombre}
                            </div>
                            {item.descripcion && <div className="text-secondary small">{item.descripcion}</div>}
                        </div>
                        <button
                          className="btn btn-sm border-0 text-danger p-0 ms-2"
                          onClick={() => quitarDelCarrito(index)}
                          title="Quitar"
                        >
                          <i className="bi bi-x-circle fs-5"></i>
                        </button>
                      </div>
                      
                      <div className="d-flex align-items-center gap-2">
                        <div className="d-flex align-items-center gap-1 bg-light border rounded px-1">
                          <button
                            className="btn btn-sm text-secondary"
                            style={{ padding: '0 4px', fontSize: '1rem' }}
                            onClick={() => cambiarCantidad(index, item.cantidad - 1)}
                          >−</button>
                          <span className="fw-500 text-center" style={{ width: '24px' }}>{item.cantidad}</span>
                          <button
                            className="btn btn-sm text-secondary"
                            style={{ padding: '0 4px', fontSize: '1rem' }}
                            onClick={() => cambiarCantidad(index, item.cantidad + 1)}
                          >+</button>
                        </div>
                        <span className="text-secondary px-1">x</span>
                        <div className="input-group input-group-sm flex-nowrap" style={{ width: '120px' }}>
                            <span className="input-group-text bg-white">$</span>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={item.precio_unitario} 
                                onChange={(e) => cambiarPrecio(index, e.target.value)}
                                min="0" step="100"
                            />
                        </div>
                        <span className="fw-500 ms-auto">
                          {formatearPrecio(item.precio_unitario * item.cantidad)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-2">
                      <label className="form-label small fw-500 text-secondary mb-1">Nota / Descripción de venta (opcional)</label>
                      <textarea 
                          className="form-control form-control-sm" 
                          rows="2" 
                          placeholder="Ej: Se deja seña de $5000. Receta Dr. Pérez."
                          value={descripcionVenta}
                          onChange={(e) => setDescripcionVenta(e.target.value)}
                      ></textarea>
                  </div>
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
                  disabled={guardando || !clienteSeleccionado}
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

      {/* Tercer Bloque: Graduación de Lentes (Nota de Pedido) a todo lo ancho */}
      <div className="card mt-4">
        <div className="card-header d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-file-earmark-medical text-primary fs-5"></i>
            <span className="fw-bold">Graduación de Lentes (Nota de Pedido)</span>
          </div>
          <div className="form-check form-switch m-0">
            <input
              className="form-check-input"
              type="checkbox"
              id="checkGraduacion"
              checked={incluyeGraduacion}
              onChange={(e) => setIncluyeGraduacion(e.target.checked)}
              style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
            />
            <label className="form-check-label fw-500 ms-2 text-dark" htmlFor="checkGraduacion" style={{ cursor: 'pointer' }}>
              Esta venta incluye graduación de lentes
            </label>
          </div>
        </div>

        {incluyeGraduacion && (
          <div className="card-body">
            {/* Opciones de Material y Antirreflejo */}
            <div className="row g-3 mb-4 align-items-center">
              <div className="col-md-7">
                <label className="form-label fw-500 text-secondary small mb-1 d-block">Material</label>
                <div className="d-flex gap-2">
                  {[
                    { id: 'Organico', label: 'Orgánico' },
                    { id: 'Policarbonato', label: 'Policarbonato' },
                    { id: 'Mineral', label: 'Mineral' },
                    { id: 'Acrilico', label: 'Acrílico' }
                  ].map((mat) => (
                    <button
                      key={mat.id}
                      type="button"
                      className={`btn btn-sm ${graduacion.material === mat.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => handleGraduacionChange('material', mat.id)}
                    >
                      {mat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-md-5">
                <label className="form-label fw-500 text-secondary small mb-1 d-block">Tratamiento Adicional</label>
                <div className="form-check form-switch mt-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="checkAntirreflejo"
                    checked={graduacion.con_antirreflejo}
                    onChange={(e) => handleGraduacionChange('con_antirreflejo', e.target.checked)}
                  />
                  <label className="form-check-label fw-500" htmlFor="checkAntirreflejo">
                    Con Antirreflejo
                  </label>
                </div>
              </div>
            </div>

            {/* Inputs Opcionales: Color, Laca, Calibrado */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label small text-secondary fw-500">Color (opcional)</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ej: Gris 75%, Marrón"
                  value={graduacion.color}
                  onChange={(e) => handleGraduacionChange('color', e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small text-secondary fw-500">Laca (opcional)</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ej: Antirrayas"
                  value={graduacion.laca}
                  onChange={(e) => handleGraduacionChange('laca', e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small text-secondary fw-500">Calibrado (opcional)</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ej: Ranurado, Perforado"
                  value={graduacion.calibrado}
                  onChange={(e) => handleGraduacionChange('calibrado', e.target.value)}
                />
              </div>
            </div>

            {/* DP y Altura por ojo */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <label className="form-label small text-secondary fw-500">DP Derecho (mm)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control form-control-sm"
                  placeholder="Ej: 31.5"
                  value={graduacion.dp_derecho}
                  onChange={(e) => handleGraduacionChange('dp_derecho', e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small text-secondary fw-500">DP Izquierdo (mm)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control form-control-sm"
                  placeholder="Ej: 32"
                  value={graduacion.dp_izquierdo}
                  onChange={(e) => handleGraduacionChange('dp_izquierdo', e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small text-secondary fw-500">Altura Derecho (mm)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control form-control-sm"
                  placeholder="Ej: 18"
                  value={graduacion.altura_derecho}
                  onChange={(e) => handleGraduacionChange('altura_derecho', e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small text-secondary fw-500">Altura Izquierdo (mm)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control form-control-sm"
                  placeholder="Ej: 18"
                  value={graduacion.altura_izquierdo}
                  onChange={(e) => handleGraduacionChange('altura_izquierdo', e.target.value)}
                />
              </div>
            </div>

            {/* Tabla Estilo Nota de Pedido en Papel */}
            <div className="table-responsive">
              <table className="table table-bordered align-middle text-center mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '160px' }} className="text-start ps-3">Ojo</th>
                    <th style={{ width: '100px' }}>Enfoque</th>
                    <th>ESF</th>
                    <th>CIL</th>
                    <th>EJE</th>
                    <th>Ø (Diámetro)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* OD Lejos */}
                  <tr>
                    <td rowSpan={2} className="fw-bold text-primary align-middle text-start ps-3">
                      Ojo Derecho (OD)
                    </td>
                    <td className="bg-light text-secondary small fw-500">Lejos</td>
                    <td>
                      <input type="number" step="0.25" className="form-control form-control-sm text-center" value={graduacion.esf_od_lejos} onChange={(e) => handleGraduacionChange('esf_od_lejos', e.target.value)} placeholder="0.00" />
                    </td>
                    <td>
                      <input type="number" step="0.25" className="form-control form-control-sm text-center" value={graduacion.cil_od_lejos} onChange={(e) => handleGraduacionChange('cil_od_lejos', e.target.value)} placeholder="0.00" />
                    </td>
                    <td>
                      <input type="number" step="1" className="form-control form-control-sm text-center" value={graduacion.eje_od_lejos} onChange={(e) => handleGraduacionChange('eje_od_lejos', e.target.value)} placeholder="0°" />
                    </td>
                    <td>
                      <input type="number" step="1" className="form-control form-control-sm text-center" value={graduacion.diametro_od_lejos} onChange={(e) => handleGraduacionChange('diametro_od_lejos', e.target.value)} placeholder="mm" />
                    </td>
                  </tr>
                  {/* OD Cerca */}
                  <tr>
                    <td className="bg-light text-secondary small fw-500">Cerca</td>
                    <td>
                      <input type="number" step="0.25" className="form-control form-control-sm text-center" value={graduacion.esf_od_cerca} onChange={(e) => handleGraduacionChange('esf_od_cerca', e.target.value)} placeholder="0.00" />
                    </td>
                    <td>
                      <input type="number" step="0.25" className="form-control form-control-sm text-center" value={graduacion.cil_od_cerca} onChange={(e) => handleGraduacionChange('cil_od_cerca', e.target.value)} placeholder="0.00" />
                    </td>
                    <td>
                      <input type="number" step="1" className="form-control form-control-sm text-center" value={graduacion.eje_od_cerca} onChange={(e) => handleGraduacionChange('eje_od_cerca', e.target.value)} placeholder="0°" />
                    </td>
                    <td>
                      <input type="number" step="1" className="form-control form-control-sm text-center" value={graduacion.diametro_od_cerca} onChange={(e) => handleGraduacionChange('diametro_od_cerca', e.target.value)} placeholder="mm" />
                    </td>
                  </tr>
                  {/* OI Lejos */}
                  <tr>
                    <td rowSpan={2} className="fw-bold text-primary align-middle text-start ps-3">
                      Ojo Izquierdo (OI)
                    </td>
                    <td className="bg-light text-secondary small fw-500">Lejos</td>
                    <td>
                      <input type="number" step="0.25" className="form-control form-control-sm text-center" value={graduacion.esf_oi_lejos} onChange={(e) => handleGraduacionChange('esf_oi_lejos', e.target.value)} placeholder="0.00" />
                    </td>
                    <td>
                      <input type="number" step="0.25" className="form-control form-control-sm text-center" value={graduacion.cil_oi_lejos} onChange={(e) => handleGraduacionChange('cil_oi_lejos', e.target.value)} placeholder="0.00" />
                    </td>
                    <td>
                      <input type="number" step="1" className="form-control form-control-sm text-center" value={graduacion.eje_oi_lejos} onChange={(e) => handleGraduacionChange('eje_oi_lejos', e.target.value)} placeholder="0°" />
                    </td>
                    <td>
                      <input type="number" step="1" className="form-control form-control-sm text-center" value={graduacion.diametro_oi_lejos} onChange={(e) => handleGraduacionChange('diametro_oi_lejos', e.target.value)} placeholder="mm" />
                    </td>
                  </tr>
                  {/* OI Cerca */}
                  <tr>
                    <td className="bg-light text-secondary small fw-500">Cerca</td>
                    <td>
                      <input type="number" step="0.25" className="form-control form-control-sm text-center" value={graduacion.esf_oi_cerca} onChange={(e) => handleGraduacionChange('esf_oi_cerca', e.target.value)} placeholder="0.00" />
                    </td>
                    <td>
                      <input type="number" step="0.25" className="form-control form-control-sm text-center" value={graduacion.cil_oi_cerca} onChange={(e) => handleGraduacionChange('cil_oi_cerca', e.target.value)} placeholder="0.00" />
                    </td>
                    <td>
                      <input type="number" step="1" className="form-control form-control-sm text-center" value={graduacion.eje_oi_cerca} onChange={(e) => handleGraduacionChange('eje_oi_cerca', e.target.value)} placeholder="0°" />
                    </td>
                    <td>
                      <input type="number" step="1" className="form-control form-control-sm text-center" value={graduacion.diametro_oi_cerca} onChange={(e) => handleGraduacionChange('diametro_oi_cerca', e.target.value)} placeholder="mm" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
