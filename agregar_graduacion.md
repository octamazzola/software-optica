Seguí en la rama `ia_desarrollo`. Plan corto antes de arrancar.

GRADUACIÓN DE LENTES EN NUEVA VENTA

- Backend: creá una tabla `graduaciones` en db.js:
  - id
  - venta_id (FK a ventas)
  - material (texto: Organico, Policarbonato, Mineral, Acrilico)
  - con_antirreflejo (booleano)
  - color (texto opcional)
  - laca (texto opcional)
  - calibrado (texto opcional)
  - dp_derecho, dp_izquierdo (numéricos, distancia pupilar por ojo)
  - altura_derecho, altura_izquierdo (numéricos, para multifocales)
  - esf_od_lejos, cil_od_lejos, eje_od_lejos, diametro_od_lejos
  - esf_od_cerca, cil_od_cerca, eje_od_cerca, diametro_od_cerca
  - esf_oi_lejos, cil_oi_lejos, eje_oi_lejos, diametro_oi_lejos
  - esf_oi_cerca, cil_oi_cerca, eje_oi_cerca, diametro_oi_cerca
  Todos los campos de graduación son numéricos y nullable (no todas las 
  ventas usan Cerca, por ejemplo — solo las multifocales/bifocales).
- Armado en capas completo: repository, service, controller, routes 
  para CRUD de graduaciones, asociado siempre a una venta.
- Al crear una venta (POST /api/ventas), aceptá un objeto `graduacion` 
  opcional en el payload; si viene, guardalo asociado al id de la venta 
  recién creada. Al consultar una venta por id (obtenerVentaPorId), 
  incluí la graduación si tiene una asociada.

- Frontend, en NuevaVentaPage.jsx: agregá un checkbox "Esta venta 
  incluye graduación de lentes" que al marcarse despliega una sección 
  con:
  - Material: 4 opciones excluyentes (Orgánico, Policarbonato, Mineral, 
    Acrílico), mismo estilo que los toggles que ya armamos en Cristales
  - Con Antirreflejo (toggle)
  - Color, Laca, Calibrado (inputs de texto, opcionales)
  - DP y Altura, un campo por ojo (Derecho/Izquierdo)
  - Una tabla con 2 filas por ojo (Lejos y Cerca) y columnas ESF, CIL, 
    EJE, Ø — igual a la estructura de la hoja de pedido en papel que 
    ya usan, para que sea reconocible de un vistazo
  Si el checkbox no está marcado, no se manda nada de graduación en el 
  payload.

- Mostrá la graduación (cuando exista) en el detalle expandido de 
  VentasHistorialPage.jsx y en el historial de compras dentro de 
  ClientesPage.jsx, con el mismo formato de tabla, para poder consultarla 
  rápido si el cliente vuelve a pedir el mismo armado.

CÓMO TRABAJAR
- Plan primero, después ejecutá de corrido
- Probá una venta con graduación cargada (ambos ojos, Lejos y Cerca) y 
  sacá una captura del formulario cargado y otra del detalle mostrando 
  esa graduación guardada
- Al final, resumime qué quedó hecho
Seguí en la rama `ia_desarrollo`. Plan corto antes de arrancar.

UBICACIÓN DE LA GRADUACIÓN EN NUEVA VENTA

La sección de graduación de lentes que armamos (checkbox "Esta venta 
incluye graduación de lentes" + la tabla estilo Nota de Pedido) tiene 
que aparecer como un tercer bloque, con el mismo estilo de card que ya 
usan "Cliente" y "Armazones/Accesorios / Cristales" (mismo ancho 
completo, mismo header con ícono).

Ubicalo debajo del bloque de "Armazones/Accesorios / Cristales" y 
"Resumen de Venta" (o sea, ocupando todo el ancho debajo de esos dos), 
y antes del botón de confirmar la venta — tiene que estar visible y 
completable en la misma pantalla, en el mismo momento en que se arma 
el carrito, no en un paso aparte ni en un modal.

Si el checkbox "Esta venta incluye graduación de lentes" no está 
marcado, el bloque se mantiene colapsado mostrando solo esa opción, 
para no saturar la pantalla en las ventas que no la necesitan (la 
mayoría, según lo que vimos, son solo armazones o accesorios sueltos).

CÓMO TRABAJAR
- Plan primero, después ejecutá de corrido
- Sacá una captura de la pantalla completa de Nueva Venta con el 
  checkbox de graduación tildado y el bloque desplegado, para confirmar 
  que quedó en el lugar correcto
- Al final, resumime qué quedó hecho