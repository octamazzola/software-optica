A partir de ahora vamos a vibecodear el resto del frontend: mi cliente ya 
no tiene tiempo, así que de acá en adelante VOS terminás de implementar 
todo lo que falta, de forma autónoma. No hace falta que me guíes paso a 
paso ni que esperes a que yo escriba código.

RAMA — MUY IMPORTANTE
Trabajá exclusivamente sobre la rama `ia_desarrollo`. Antes de tocar 
cualquier archivo, confirmá en qué rama estás parado (git branch 
--show-current) y si no es `ia_desarrollo`, cambiate a esa rama primero. 
NO toques ni mergees nada en la rama `desarrollo_propio` bajo ningún 
concepto — esa la dejo intacta porque sigo practicando por mi cuenta ahí.

PASO 0 — Bug a corregir primero
En backend/src/routes/venta.routes.js la línea que registra GET /:id 
está mal escrita (falta el paréntesis de la llamada: 
`router.get / '/:id', ...` en vez de `router.get('/:id', ...)`), por lo 
que esa ruta nunca se activa. Corregila y probá que responda bien antes 
de seguir.

CONTEXTO DEL PROYECTO (Óptica Visual)
- Backend Node.js/Express + SQLite, arquitectura en capas 
  (routes -> controllers -> services -> repositories -> db). Endpoints:
  - /api/clientes → GET, GET/:id, POST, PUT/:id, DELETE/:id
  - /api/productos → GET, GET/:codigo, POST, PUT/:codigo, DELETE/:codigo
  - /api/ventas → GET, GET/:id (recién corregida), POST
- Modelo de datos real:
  - clientes: nombre, telefono, email
  - productos: codigo (único), nombre, descripcion, precio (NO tiene stock)
  - ventas: cliente_id, fecha, total → con detalle (producto_id, 
    cantidad, precio_unitario) por renglón
  - Para crear una venta, el POST espera exactamente: 
    { cliente_id, items: [{ producto_id, cantidad }] } 
    — el precio_unitario y el total los calcula el backend solo
- Frontend: React (Vite) + Bootstrap 5.3.3 vía CDN + Bootstrap Icons. 
  react-router-dom ya está instalado.
- src/api/ ya existe con clientes.api.js, productos.api.js, ventas.api.js. 
  USÁ esas funciones como base y completalas vos mismo donde falten:
  - clientes.api.js: tiene obtenerClientes, crearCliente, eliminarCliente 
    → agregá actualizarCliente (el backend soporta PUT/:id)
  - productos.api.js: tiene obtenerProducto, crearProducto, eliminarProducto 
    → agregá actualizarProducto (el backend soporta PUT/:codigo)
  - ventas.api.js: tiene obtenerVentas, crearVenta 
    → agregá obtenerVentaPorId (una vez arreglado el paso 0)
- src/pages/ tiene ClientePage.jsx, ProductosPage.jsx, NuevaVentaPage.jsx, 
  VentasHistorialPage.jsx — vacíos. Resolvé vos la inconsistencia de 
  nombre (ClientePage vs "Clientes") de la forma que sea más prolija.
  Falta crear la página de Inicio/Dashboard.

OBJETIVO — dejar el frontend completo y funcional
1. react-router-dom en App.jsx: / (Dashboard), /clientes, /productos, 
   /nueva-venta, /ventas
2. Navbar fijo de Bootstrap con esas 5 secciones, resaltando la activa
3. Dashboard: total de clientes, total de productos, cantidad de ventas 
   y monto total facturado, con datos reales de la API
4. Clientes: listado con buscador, alta, edición y eliminación
5. Productos: listado con buscador, alta, edición y eliminación 
   (código, nombre, descripción, precio)
6. Nueva Venta: elegir cliente, agregar productos con cantidad tipo 
   carrito, mostrar el total calculado antes de confirmar, enviar 
   { cliente_id, items } al backend
7. Historial de Ventas: tabla con fecha, cliente y total, con opción 
   de expandir y ver el detalle de productos de esa venta

ESTILO VISUAL — minimalista, mucho blanco, sobre Bootstrap 5
En src/index.css (ya existe, vacío, importado en main.jsx) sobreescribí:
- --bs-body-bg: #FFFFFF
- --bs-secondary-bg: #FAFAFA
- --bs-border-color: #E4E4E7
- --bs-body-color: #18181B
- --bs-secondary-color: #71717A
- --bs-primary: #4F46E5 (único acento)
- --bs-border-radius: 10px / --bs-border-radius-lg: 14px
Spacing generoso (my-4, py-5, gap-3), cards con shadow-sm nomás, iconos 
de Bootstrap Icons estilo lineal.

CÓMO TRABAJAR
- Armá primero un plan corto y mostrámelo antes de arrancar
- No esperes mi aprobación en cada archivo chico — andá de corrido
- Al terminar cada página, sacá una captura de pantalla y mostrámela 
  antes de pasar a la siguiente, para detectar errores rápido
- Si encontrás algo roto o ambiguo en el camino (como el bug del paso 0), 
  solucionalo o preguntame si afecta una decisión de negocio, pero no 
  frenes todo el flujo por dudas menores
- Al final, hacé un resumen breve de todo lo que quedó armado