Necesito que revises y corrijas detalles visuales (CSS/UI) en la pantalla de "Nueva venta / Nota de pedido". Los problemas están en las tres secciones visibles: "Cliente", "Armazones / Accesorios" (con la pestaña "Cristales") y "Graduación de Lentes (Nota de Pedido)". Trabajá con los estilos existentes del proyecto y no cambies la lógica ni la funcionalidad.

## Problemas a corregir

### 1. Buscadores mal cerrados (aplica a TODOS los buscadores del sistema)
En el buscador de Cliente, cuando el input tiene foco, el borde de color (azul) NO cierra bien del lado izquierdo: el ícono de lupa está en un contenedor separado con su propio borde y el input tiene otro borde/outline distinto, por lo que se ve un corte o desalineación entre ambos.

Lo mismo pasa con el buscador de "Buscar producto por nombre o código..." y cualquier otro buscador del sistema.

Solución esperada:
- Unificar el componente: un único contenedor con borde, border-radius y fondo compartidos, que contenga el ícono de lupa + el input.
- El input debe ser sin borde ni outline propio (border: none; outline: none; background: transparent).
- Usar `:focus-within` en el contenedor para aplicar el borde de color y el box-shadow/anillo de foco, de modo que el borde rodee todo el conjunto (lupa + input) de forma continua, con las esquinas redondeadas parejas en ambos lados.
- Asegurar que el borde izquierdo, derecho, superior e inferior tengan el mismo grosor y color, sin cortes ni saltos de píxeles.
- Crear (o reutilizar) una clase/componente reutilizable para buscadores y aplicarlo en TODOS los buscadores de la app para mantener consistencia.

### 2. Pestaña "Cristales" casi ilegible
La pestaña "Cristales" (inactiva) tiene un color de texto e ícono demasiado claro, casi se pierde contra el fondo, y no se distingue como un elemento clickeable.

Solución esperada:
- Subir el contraste del texto e ícono inactivo a un gris/azul grisáceo más oscuro (mínimo contraste WCAG AA 4.5:1 contra el fondo).
- Mantener clara la diferencia entre pestaña activa (fondo azul con texto blanco) e inactiva (sin fondo, texto legible).
- Agregar estado hover (fondo suave y texto más oscuro) y cursor: pointer.
- Agregar estado focus visible para accesibilidad.
- Verificar que no esté aplicado un `opacity` o `disabled` que la haga ver deshabilitada cuando en realidad es clickeable.

### 3. Revisión general de detalles estáticos
Además de lo anterior, revisá toda la pantalla y corregí cualquier inconsistencia visual que encuentres, por ejemplo:
- Alineación vertical del ícono, texto y botones dentro de los headers de cada tarjeta (Cliente, Armazones / Accesorios, Graduación de Lentes).
- Espaciados (padding y margin) inconsistentes entre tarjetas y dentro de ellas: el espacio entre el buscador y el borde inferior de la tarjeta se ve más grande que el superior.
- Bordes, radios y sombras: que todas las tarjetas usen los mismos valores.
- Tamaños y pesos de fuente consistentes en los títulos de las secciones.
- Color y tamaño de los íconos de los headers (que sean coherentes entre sí).
- Color del placeholder de los inputs: que sea legible pero diferenciable del texto ingresado.
- Que la tarjeta lateral derecha (cortada en el borde) y la tarjeta de "Graduación de Lentes" respeten el mismo ancho, márgenes y alineación con el resto del layout.
- Responsividad: verificar que nada se rompa al achicar la ventana.

## Instrucciones de trabajo
1. Primero listame los problemas que detectes (los indicados y los que encuentres extra) antes de modificar.
2. Aplicá los cambios usando variables/clases reutilizables en lugar de estilos repetidos o inline.
3. No modifiques la lógica, los eventos ni las llamadas a datos.
4. Al terminar, resumime qué archivos tocaste y qué cambió en cada uno.
5. Verificá visualmente el resultado en el navegador (foco en buscadores, estado activo/inactivo de las pestañas y hover) antes de darlo por terminado.