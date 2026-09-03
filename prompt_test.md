Seguí en la rama `ia_desarrollo`. Plan corto antes de arrancar. Esto es 
más grande que la vez anterior, así que tomate el tiempo de listar todo 
antes de escribir el primer test.

BASE DE DATOS DE PRUEBA — hacé esto primero
Los tests NO pueden tocar backend/database.sqlite (ahí está la 
información real del negocio). Configurá que, al correr los tests, se 
use un archivo de base de datos separado (ej: database.test.sqlite), 
que se crea limpio antes de cada corrida y se borra después. Verificá 
esto ANTES de escribir el resto de los tests — si esto falla, todo lo 
demás es peligroso.

BACKEND — cobertura completa
- Instalá vitest, supertest y @vitest/coverage-v8
- Para CADA recurso (clientes, productos, cristales, ventas, 
  planes_financiacion, graduaciones): tests de integración (supertest) 
  que cubran cada endpoint de su archivo de rutas — creación válida, 
  creación con datos inválidos (que devuelva error, no que rompa el 
  servidor), edición, eliminación, búsqueda/filtros, y los casos 
  puntuales que ya sabemos que son delicados:
  - Productos: mismo código en dos productos, editar/borrar cada uno 
    por separado sin afectar al otro
  - Ventas: precio_unitario modificado a mano se respeta; exactamente 
    un tipo de ítem (producto o cristal) por línea, nunca ambos ni 
    ninguno; venta con graduación se guarda y se puede recuperar 
    completa
  - Clientes: búsqueda por dni, nombre y apellido por separado, y 
    combinados
- Tests unitarios para cada `service.js`, probando la lógica sin pasar 
  por HTTP (cálculos, validaciones)
- Corré con cobertura y guardá el reporte

FRONTEND — cobertura completa
- Instalá vitest, @testing-library/react, @testing-library/jest-dom, 
  @vitest/coverage-v8
- Para cada página (Dashboard, Clientes, Productos, Cristales, 
  NuevaVenta, VentasHistorial, PlanesFinanciacion): tests de componente 
  que cubran renderizado inicial, búsqueda/filtros, alta, edición y 
  eliminación desde la UI (simulando el click, no solo la función)
- Mockeá la capa de api (src/api/*.js) en todos los tests de frontend — 
  no tienen que depender de que el backend esté corriendo
- Testeá especialmente el carrito de NuevaVentaPage.jsx: agregar 
  productos y cristales, elegir tallado de un cristal con varios 
  precios, editar precio a mano, y que el total se recalcule bien en 
  cada caso
- Corré con cobertura y guardá el reporte

REPORTE FINAL
- Actualizá README-TESTING.md con los comandos para correr los tests 
  CON cobertura (no solo correrlos)
- Al final, decime el % de cobertura real de backend y de frontend por 
  separado, y listame específicamente qué quedó sin cubrir y por qué 
  (ej: "el formulario de X no se testeó porque..."), en vez de decir 
  simplemente "quedó todo cubierto"

CÓMO TRABAJAR
- Plan primero, después ejecutá de corrido
- Si algún test falla, arreglalo antes de seguir — no me entregues la 
  suite con tests en rojo
- Cuando termines, hacé commit y push a ia_desarrollo