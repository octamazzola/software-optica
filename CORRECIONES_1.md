Seguí trabajando en la rama `ia_desarrollo` únicamente, tal como veníamos 
haciendo. Armá un plan corto antes de arrancar y mostrámelo.

1) LÍNEAS DIVISORIAS MÁS OSCURAS Y GRUESAS
En frontend/src/index.css, la variable --bs-border-color (#E4E4E7) es la 
que define todas las divisiones (navbar, cards, tablas, page-header, 
carrito-item). Oscurecela a un tono más visible (ej: #C7CBD1 o similar, 
mantené la coherencia con la paleta) y aumentá el grosor de los 
`border: 1px solid var(--bs-border-color)` / `border-bottom: 1px solid...` 
a 1.5px o 2px en esos mismos selectores, para que la separación entre 
secciones se note más sin perder el estilo minimalista.

2) CLIENTES — registrar y buscar por apellido y DNI
- Backend: agregá las columnas `apellido` y `dni` (dni único) a la tabla 
  clientes. Como ya hay datos semilla cargados, hacé la migración con 
  ALTER TABLE (no borres la tabla), y actualizá también los datos semilla 
  para que tengan apellido y dni de ejemplo.
- Actualizá repository/service/controller de clientes: crear y actualizar 
  ahora reciben apellido y dni también, y el buscar (que hoy solo filtra 
  por nombre/email con LIKE) tiene que incluir también dni y apellido.
- Frontend: agregá los campos Apellido y DNI al formulario de alta/edición 
  en ClientesPage.jsx, y mostrá la columna DNI en la tabla. El buscador 
  que ya existe no necesita cambios de UI, solo va a empezar a encontrar 
  por dni/apellido en cuanto el backend lo soporte.

3) NUEVA VENTA — buscar cliente por DNI + productos más vendidos
- Reemplazá el <select> de cliente actual (en NuevaVentaPage.jsx) por un 
  campo de búsqueda que filtre la lista de clientes ya cargada por DNI 
  y/o nombre/apellido, usando el mismo patrón que ya está implementado 
  para buscar productos en esa misma página (productoBuscar + filtrado 
  en memoria) — mantené la consistencia de UX entre ambos buscadores.
- Backend: agregá un endpoint nuevo, por ejemplo GET /api/productos/mas-vendidos, 
  que agregue detalle_ventas por producto_id (SUM(cantidad)), ordene 
  descendente y devuelva el top 5.
- Frontend: agregá la función correspondiente en productos.api.js, y en 
  NuevaVentaPage.jsx mostrá esos productos en un desplegable o lista 
  rápida para agregarlos al carrito con un clic, sin reemplazar el 
  buscador que ya existe — son dos formas complementarias de agregar 
  productos.

4) HISTORIAL DE VENTAS — buscar por DNI del cliente
- Backend: agregá soporte de un query param (ej. ?dni=) en GET /api/ventas, 
  uniendo con clientes y filtrando por dni con LIKE, en 
  repository/service/controller/routes.
- Frontend: agregá un campo de búsqueda en VentasHistorialPage.jsx que 
  llame a obtenerVentas(dni) y muestre el listado filtrado.

CÓMO TRABAJAR
- Plan primero, después ejecutá de corrido sin pedir aprobación en cada 
  archivo chico
- Anda en el orden 1 → 2 → 3 → 4, ya que el punto 3 y 4 dependen de que 
  el DNI ya exista en clientes (punto 2)
- Después de cada punto, sacá una captura mostrando que funciona (probá 
  buscar un cliente por DNI de verdad, no solo que compile) antes de 
  seguir con el siguiente
- Si encontrás algo ambiguo (ej: cuántos productos mostrar en "más 
  vendidos", o si dni debe ser obligatorio), resolvelo con el criterio 
  más simple y razonable, y contámelo al final en vez de frenar todo
- Al final, resumime qué quedó armado y qué endpoints nuevos agregaste