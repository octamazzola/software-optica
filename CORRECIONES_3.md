Seguí en la rama `ia_desarrollo`. Este es un cambio grande, así que armá un 
plan detallado antes de arrancar y mostrámelo. Fijate primero el estado 
actual de los archivos antes de asumir qué falta (puede que algunas 
correcciones anteriores ya estén aplicadas).

OBJETIVO GENERAL
Separar claramente dos catálogos que hoy están mezclados en "Productos": 
los ARMAZONES/accesorios (lo que ya hay) y los CRISTALES (el catálogo 
más importante del negocio: orgánicos, policarbonatos, monofocales, 
bifocales, multifocales, con o sin antirreflejo).

1) PRODUCTOS — categorizar armazones y accesorios
- Backend: agregá una columna `categoria` a la tabla productos, con 
  valores esperados: "Armazón de Sol", "Armazón de Vista", "Accesorio". 
  Para los productos ya cargados, no adivines la categoría por código: 
  dejalos con un valor por defecto razonable y avisame al final cuáles 
  quedaron así, para que yo los recategorice a mano desde la UI (son 
  pocos).
- Frontend: agregá el campo Categoría (select) al formulario de alta/
  edición en ProductosPage.jsx, mostralo como columna, y agregá un 
  filtro por categoría además del buscador de texto que ya existe.
- Ojo con el producto "Par de Cristales Antirreflejo" que ya está 
  cargado: es en realidad un cristal mal ubicado en Productos de cuando 
  todavía no existía el catálogo de Cristales. Señalámelo en el resumen 
  final para que yo decida si lo borro de Productos una vez que exista 
  el catálogo de Cristales.

2) CRISTALES — nuevo catálogo, tabla separada
- Backend: creá una tabla `cristales` en backend/src/config/db.js:
  - id
  - material (texto: Organico, Policarbonato, Acrilico, Mineral, Trivex)
  - tipo_lente (texto: Monofocal, Bifocal, Multifocal, Ocupacional, Stock)
  - tratamiento (texto libre: ej "Blue Cut", "Fotocromático", "Blanco", 
    "Antiage + Infrarrojo")
  - con_antirreflejo (booleano)
  - descripcion (texto completo de la línea original del PDF, para no 
    perder detalle de rango de graduación, ej "-10.00/+8.00")
  - precio_tradicional, precio_digital, precio_ar_eternal (todos 
    numéricos, todos nullable — no todos los cristales tienen los 3)
- Armazón en capas completo: repository, service, controller, routes 
  para CRUD de cristales (GET listado con filtros por material/tipo_
  lente/tratamiento, GET por id, POST, PUT, DELETE), igual que ya existe 
  para productos.
- Frontend: nueva página CristalesPage.jsx y un ítem de navbar "Cristales", 
  con listado, filtros por material/tipo/tratamiento, y alta/edición manual 
  (por si querés cargar un cristal suelto sin subir el PDF entero).

3) IMPORTAR LISTA DE PRECIOS EN PDF
Te dejo un PDF real de ejemplo (el que ya te pasé, "lista-precios-cordoba-
glass-marzo-2026.pdf") — guardalo en backend/docs/ejemplos/ y usalo para 
construir y probar el parser contra un caso real, no una descripción 
abstracta.

- Backend: usá la librería `pdf-parse` para extraer el texto del PDF. 
  Armá el parser CON REGLAS FIJAS (regex), sabiendo que el documento NO 
  es uniforme:
  - Hay páginas de marketing sin tablas — cualquier línea sin un precio 
    reconocible ($ seguido de números) se salta, no se fuerza
  - La mayoría de las filas de tabla terminan en 1, 2 o 3 valores de $ 
    (Tallado Tradicional / Tallado Digital / AR Eternal, en ese orden; 
    a veces el de AR Eternal viene precedido de "T.T." o "T.D.")
  - En la sección "ESPECIALIDADES MONOFOCALES", Tradicional y Digital 
    del mismo cristal vienen en DOS LÍNEAS separadas, no en columnas — 
    hay que agruparlas
  - Los encabezados de sección (ej "LABORATORIO MONOFOCALES BLUE CUT", 
    "MULTIFOCALES BLANCOS", "TRATAMIENTOS", "CALIBRADOS") sirven para 
    inferir tipo_lente y tratamiento de las filas que siguen; buscá 
    palabras clave como ORGANICO/POLICARBONATO/ACRILICO/MINERAL/TRIVEX 
    para el material, y "BLUE CUT"/"FOTOCROMATICO"/"C/AR" para 
    tratamiento y con_antirreflejo
  - La sección "FILTROS TERAPEUTICOS" tiene descripciones de producto 
    sin precio asociado por ítem — no importes esas líneas
  - Líneas que terminan en % (recargos como "BICONVEXO/BICONCAVO 30%") 
    no son precios de cristal, saltealas
- Endpoint POST /api/cristales/importar-pdf: recibe el PDF, lo parsea, 
  y devuelve un JSON con las filas interpretadas MÁS un listado aparte 
  de líneas que no pudo interpretar — todavía NO guarda nada en la base
- Endpoint POST /api/cristales/confirmar-importacion: recibe la lista ya 
  revisada/editada por el usuario y ahí sí reemplaza el catálogo de 
  cristales completo (borra los anteriores, inserta los nuevos)

- Frontend, en CristalesPage.jsx: botón "Subir lista de precios (PDF)" 
  que dispara el flujo: subir → mostrar una tabla editable con lo 
  interpretado (para poder corregir o borrar filas antes de confirmar) 
  → mostrar aparte cuántas líneas no se pudieron interpretar → botón 
  "Confirmar e importar" que llama al segundo endpoint

4) INTEGRAR CRISTALES EN VENTAS
- Backend: en detalle_ventas, agregá una columna `cristal_id` (nullable, 
  FK a cristales) junto al `producto_id` existente (que pasa a ser 
  nullable también) — cada línea de una venta referencia uno u otro, 
  nunca ambos. Ajustá venta.service.js para aceptar ambos tipos de ítem 
  en el payload de crear venta.
- Frontend, en NuevaVentaPage.jsx: agregá un segundo buscador (o un 
  selector Productos/Cristales) para agregar cristales al carrito. Como 
  un cristal puede tener hasta 3 precios (tradicional/digital/AR eternal), 
  al seleccionarlo pedí cuál de los que tiene cargados aplica para esa 
  venta antes de agregarlo al carrito con ese precio específico.

CÓMO TRABAJAR
- Plan primero, después ejecutá de corrido sin pedir aprobación en cada 
  archivo chico
- El parser de PDF NO tiene que ser perfecto — priorizá que la vista 
  previa antes de confirmar funcione bien, esa es la red de seguridad 
  real, no el parser en sí
- Probá la importación con el PDF de ejemplo real que te dejé y 
  mostrame una captura de la vista previa con los datos que interpretó, 
  antes de seguir con la integración en Nueva Venta
- Si algo del PDF es ambiguo y no podés resolverlo con una regla simple, 
  dejalo en la lista de "no reconocidas" en vez de adivinar
- Al final, resumime: cuántos cristales importó de prueba, cuántas 
  líneas quedaron sin reconocer, y qué productos existentes quedaron 
  pendientes de recategorizar

  Seguí en la rama `ia_desarrollo`. Plan corto antes de arrancar.

1) NOTA/DESCRIPCIÓN EN LA VENTA
- Backend: agregá una columna `descripcion` (texto, opcional) a la tabla 
  ventas en db.js — como es un simple ADD COLUMN, no hace falta recrear 
  la tabla. Actualizá venta.repository.js, venta.service.js y 
  venta.controller.js para aceptar y guardar `descripcion` al crear una 
  venta, e incluirla cuando se consulta el detalle de una venta 
  (obtenerVentaPorId).
- Frontend: en NuevaVentaPage.jsx, agregá un textarea "Nota (opcional)" 
  — algo tipo "detalles a tener en cuenta para la próxima venta" — y 
  mandalo en el payload al confirmar. Mostrá esa nota en el detalle 
  expandido de VentasHistorialPage.jsx (y en el historial de compras 
  dentro de Clientes, ya que reusa el mismo detalle).

2) PRECIO FINAL EDITABLE POR ÍTEM
Hoy el backend calcula el precio_unitario solo, a partir del precio 
actual del catálogo, ignorando lo que mande el frontend. Cambiá eso: 
como esta es una app de un solo local sin login de por medio, no hay 
riesgo de que alguien de afuera manipule precios vía la API — así que 
está bien confiar en lo que mande el frontend.
- Backend: en crearVenta, cada ítem (producto o cristal) ahora puede 
  traer un `precio_unitario` opcional. Si viene, usalo tal cual sin 
  recalcularlo. Si no viene, calculalo del precio de catálogo como hace 
  hoy (para no romper nada si en algún caso no se manda). Validá que no 
  sea negativo ni cero, nada más.
- Frontend: en el carrito de NuevaVentaPage.jsx, agregá un input 
  editable de precio unitario en cada línea, precargado con el precio 
  de catálogo (o el tallado elegido, si es un cristal). Al editarlo, 
  recalculá el subtotal de esa línea y el total general en tiempo real, 
  y mandá ese precio_unitario (modificado o no) en el payload al 
  confirmar la venta.

CÓMO TRABAJAR
- Plan primero, después ejecutá de corrido
- Probá los dos casos al confirmar: una venta con precios de catálogo 
  sin tocar, y otra editando el precio de al menos un ítem — mostrame 
  una captura del carrito con un precio modificado y otra del historial 
  mostrando esa venta con el total correcto y la nota visible
- Al final, resumime qué quedó hecho