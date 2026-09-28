Quiero hacer un ajuste visual a la interfaz actual del sistema.

Analicé visualmente el dashboard y las pantallas de Clientes, Productos y Ventas.

La paleta actual en general me gusta, especialmente el verde/azul de los estados, botones y elementos destacados.

NO quiero cambiar completamente la identidad visual.

El problema principal es que el FONDO GENERAL de la aplicación sigue siendo demasiado claro y hace que toda la interfaz se perciba excesivamente blanca.

Quiero mantener las tarjetas y componentes claros, pero generar una separación visual más marcada entre:

FONDO GENERAL
↓
SUPERFICIES
↓
TARJETAS
↓
CONTENIDO

### NUEVA PALETA

Utilizá como referencia:

--background: #D9E2E7;
--surface: #F8FAFB;
--card: #FFFFFF;

--sidebar: #263238;

--text-primary: #263238;
--text-secondary: #66727C;

--border: #C8D3D9;

--primary: #547A9E;
--primary-hover: #456985;

No reemplaces los colores de estado actuales si ya funcionan correctamente. Los colores verdes y demás estados me gustan y quiero conservarlos salvo que sea necesario ajustar ligeramente su intensidad.

### OBJETIVO VISUAL

Quiero conseguir una apariencia:

- Profesional.
- Moderna.
- Empresarial.
- Clara.
- Cómoda para utilizar durante muchas horas.
- Menos blanca.
- Sin llegar a ser un tema oscuro.
- Con buena separación entre las diferentes superficies.

### IMPORTANTE

NO quiero que simplemente cambies todos los blancos por grises.

Quiero mantener:

- Tarjetas claras.
- Formularios claros.
- Inputs claros.
- Tablas claras.
- Botones con sus colores actuales.
- Sidebar oscuro.
- Texto oscuro.

El cambio principal debe estar en el FONDO GENERAL.

### JERARQUÍA VISUAL

Quiero aproximadamente esta jerarquía:

Fondo:
#D9E2E7

Superficies:
#F8FAFB

Tarjetas:
#FFFFFF

Texto:
#263238

Bordes:
#C8D3D9

De esta manera las tarjetas blancas deben destacarse naturalmente sobre el fondo gris azulado.

### NO HACER

No:

- Oscurecer toda la aplicación.
- Convertirla en dark mode.
- Utilizar negro como fondo.
- Utilizar blanco puro en todo.
- Agregar sombras fuertes.
- Agregar gradientes innecesarios.
- Cambiar la estructura de las pantallas.
- Cambiar la navegación.
- Cambiar la funcionalidad.
- Cambiar la lógica del sistema.
- Cambiar los colores de estado sin necesidad.

### SOMBRAS

Utilizar sombras muy sutiles.

No quiero tarjetas con sombras grandes o muy marcadas.

La separación visual debe provenir principalmente del contraste entre el fondo y las superficies.

### DASHBOARD

En particular, revisar el Dashboard.

Actualmente tiene mucho espacio libre alrededor de las tarjetas y ese espacio se percibe demasiado blanco.

El resultado buscado es que:

- El fondo se perciba ligeramente más oscuro.
- Las tarjetas blancas destaquen.
- Los bloques de estadísticas tengan una separación clara.
- Los botones de acceso rápido mantengan su apariencia actual.
- El contenido siga siendo muy legible.

### VENTAS, CLIENTES Y PRODUCTOS

Aplicar la misma jerarquía visual a todas las pantallas.

No quiero que cada pantalla tenga una paleta diferente.

Toda la aplicación debe sentirse como un único sistema.

### RESPONSIVE

Verificar que el cambio funcione correctamente en:

- 1920x1080
- 1366x768
- 1280x720
- Tablet
- Pantallas pequeñas

### IMPLEMENTACIÓN

Antes de modificar estilos, inspeccioná cómo está implementado actualmente el sistema de estilos.

Si existen variables CSS o tokens de diseño, modificá esas variables en lugar de agregar colores nuevos por toda la aplicación.

Centralizá los colores.

Después de realizar el cambio:

1. Ejecutá la aplicación.
2. Revisá Dashboard.
3. Revisá Clientes.
4. Revisá Productos.
5. Revisá Cristales.
6. Revisá Nueva Venta.
7. Revisá Ventas.
8. Revisá Usuarios.
9. Verificá contraste y legibilidad.
10. Verificá que no hayan quedado fondos blancos innecesarios.
11. Verificá que los estados y botones sigan siendo claramente distinguibles.

El objetivo NO es hacer la aplicación más oscura.

El objetivo es reducir la sensación de "pantalla blanca" manteniendo una interfaz clara y profesional.