# MASTER QA — TESTING CONTINUO

## OBJETIVO

Quiero que conviertas este proyecto en un sistema con testing continuo.

Tu responsabilidad no es solamente crear tests una vez.

Debés mantener una suite de pruebas que permita verificar que:

1. Las funcionalidades actuales funcionan correctamente.
2. Las nuevas funcionalidades funcionan correctamente.
3. Los cambios sobre funcionalidades existentes no rompen nada.
4. Los errores y casos límite están contemplados.
5. Frontend y backend funcionan correctamente en conjunto.
6. La base de datos mantiene la integridad de los datos.

A partir de ahora, cada vez que agregues, elimines o modifiques código funcional, debés considerar automáticamente qué pruebas pueden verse afectadas y ejecutarlas nuevamente.

---

# REGLA PRINCIPAL

NINGÚN CAMBIO FUNCIONAL SE CONSIDERA TERMINADO HASTA QUE:

1. El código haya sido implementado.
2. Se hayan ejecutado las pruebas correspondientes.
3. Se hayan ejecutado nuevamente las pruebas de regresión necesarias.
4. Todas las pruebas relevantes pasen.
5. Los errores encontrados hayan sido corregidos.
6. Las pruebas se vuelvan a ejecutar después de las correcciones.
7. Se verifique que no se haya roto otra funcionalidad.

No quiero que simplemente me informes:

> "Los tests deberían funcionar."

Quiero que los EJECUTES.

---

# COMPORTAMIENTO AUTÓNOMO

No me pidas permiso para:

* Crear archivos de tests.
* Crear carpetas de tests.
* Crear datos de prueba.
* Modificar tests necesarios.
* Ejecutar tests.
* Corregir errores encontrados por los tests.
* Volver a ejecutar los tests.
* Agregar casos límite razonables.
* Ejecutar pruebas de regresión.

Tomá las decisiones técnicas necesarias de manera autónoma.

Solamente detenete si existe una decisión que requiera explícitamente una decisión del usuario o que pueda destruir datos reales.

---

# 1. PRIMERA ETAPA — AUDITORÍA

Antes de crear nuevos tests:

1. Inspeccioná todo el proyecto.
2. Identificá frontend y backend.
3. Identificá todas las rutas de API.
4. Identificá controllers.
5. Identificá services.
6. Identificá repositories.
7. Identificá modelos y estructuras de datos.
8. Identificá componentes principales del frontend.
9. Identificá formularios.
10. Identificá validaciones existentes.
11. Identificá operaciones CRUD.
12. Identificá operaciones que modifiquen stock.
13. Identificá operaciones relacionadas con ventas.
14. Identificá reglas de negocio.
15. Identificá dependencias y herramientas de testing existentes.

No supongas cómo funciona una parte del sistema.

Inspeccioná el código real antes de escribir el test.

---

# 2. ESTRUCTURA DE TESTING

Organizá los tests de forma clara.

Como mínimo contemplá:

```text
tests/
├── unit/
├── integration/
├── api/
├── e2e/
├── fixtures/
└── helpers/
```

Si la tecnología o estructura actual del proyecto requiere una organización diferente, adaptala.

No agregues dependencias innecesarias si las herramientas existentes permiten realizar las pruebas.

---

# 3. TESTING UNITARIO

Crear pruebas unitarias para las partes que contengan lógica de negocio.

Probar especialmente:

* Validaciones.
* Cálculos.
* Reglas de negocio.
* Conversión de datos.
* Manejo de errores.
* Funciones relacionadas con ventas.
* Cálculo de subtotales.
* Cálculo de totales.
* Cantidades.
* Precios.
* Stock.
* Validaciones de clientes.
* Validaciones de productos.

Cada función importante debe tener:

### Caso normal

Datos válidos.

### Caso límite

Valores mínimos y máximos razonables.

### Caso inválido

Datos incorrectos.

### Caso inesperado

Datos que podrían romper la lógica.

---

# 4. TESTING DE CLIENTES

Crear pruebas para:

## Crear

* Cliente válido.
* Nombre vacío.
* Campos obligatorios faltantes.
* Email inválido.
* Teléfono inválido.
* Datos excesivamente largos.
* Caracteres especiales.
* Tildes.
* Ñ.
* Apóstrofes.
* Cliente duplicado si corresponde.

## Leer

* Listar clientes.
* Buscar cliente existente.
* Buscar cliente inexistente.
* Lista vacía.

## Modificar

* Modificación válida.
* Modificación inválida.
* ID inexistente.

## Eliminar

* Eliminar cliente existente.
* Eliminar cliente inexistente.
* Verificar comportamiento cuando existen relaciones con ventas.

---

# 5. TESTING DE PRODUCTOS

Probar:

* Crear producto válido.
* Nombre vacío.
* Código duplicado.
* Precio válido.
* Precio igual a cero.
* Precio negativo.
* Stock válido.
* Stock igual a cero.
* Stock negativo.
* Producto inexistente.
* Buscar producto.
* Modificar producto.
* Eliminar producto.
* Datos excesivamente largos.
* Caracteres especiales.

---

# 6. TESTING DE VENTAS

Esta es una de las áreas más importantes.

Probar:

### Venta válida

```text
Cliente válido
+
Producto válido
+
Cantidad válida
=
Venta creada correctamente
```

### Cálculos

Verificar:

```text
subtotal = precio × cantidad
```

y que:

```text
total = suma de subtotales
```

### Stock

Ejemplo:

```text
Stock inicial: 10
Venta: 3

Stock final esperado: 7
```

Probar también:

```text
Stock inicial: 3
Venta: 3

Stock final esperado: 0
```

Y:

```text
Stock inicial: 3
Venta: 4

La venta debe ser rechazada.
El stock debe continuar siendo 3.
```

### Casos adicionales

Probar:

* Cliente inexistente.
* Producto inexistente.
* Cantidad cero.
* Cantidad negativa.
* Precio inválido.
* Venta sin productos.
* Venta con múltiples productos.
* Venta con cantidades diferentes.
* Venta con stock insuficiente.
* Datos incompletos.

---

# 7. INTEGRIDAD Y TRANSACCIONES

Toda operación que modifique varias entidades debe comprobar su integridad.

Especialmente:

```text
Registrar venta
      ↓
Registrar detalle
      ↓
Actualizar stock
```

Verificar que si una operación falla:

```text
NO quede:

Venta registrada
+
Stock sin actualizar
```

o:

```text
Stock actualizado
+
Venta inexistente
```

Cuando corresponda utilizar transacciones, verificar:

```text
BEGIN
   operación
   operación
   operación
COMMIT
```

y ante un error:

```text
ROLLBACK
```

Crear tests específicos para estos casos.

---

# 8. TESTING DE API

Crear pruebas para TODOS los endpoints existentes.

Para cada endpoint comprobar:

### Éxito

* Status HTTP correcto.
* Respuesta correcta.
* Datos correctos.

### Error

* Datos inválidos.
* Campos faltantes.
* ID inexistente.
* JSON inválido.
* Método HTTP incorrecto.
* Recursos inexistentes.

### Seguridad básica

Verificar que:

* No se pueda modificar un recurso inexistente.
* No se acepten valores inválidos.
* No se puedan introducir datos que generen consultas SQL inseguras.
* Las consultas utilicen parámetros.
* Los errores internos no expongan información innecesaria.

---

# 9. TESTING DEL FRONTEND

Probar las pantallas principales.

Para cada pantalla comprobar:

* Renderizado.
* Carga de datos.
* Estados vacíos.
* Estados de carga.
* Errores.
* Formularios.
* Validaciones.
* Botones.
* Modales.
* Búsqueda.
* Filtros.
* Paginación si existe.
* Actualización después de guardar.
* Actualización después de eliminar.

---

# 10. TESTING DE FLUJOS COMPLETOS

Crear pruebas E2E para los flujos principales.

### Flujo cliente

```text
Abrir Clientes
↓
Crear cliente
↓
Guardar
↓
Verificar mensaje de éxito
↓
Verificar que aparece en la lista
↓
Editar
↓
Verificar modificación
↓
Eliminar
↓
Verificar eliminación
```

### Flujo producto

```text
Abrir Productos
↓
Crear producto
↓
Verificar aparición
↓
Editar
↓
Verificar modificación
↓
Eliminar
```

### Flujo venta

```text
Crear/seleccionar cliente
↓
Seleccionar producto
↓
Agregar cantidad
↓
Verificar subtotal
↓
Confirmar venta
↓
Verificar total
↓
Verificar venta registrada
↓
Verificar actualización del stock
```

---

# 11. TESTING DE ERRORES DE RED

Simular:

* Backend apagado.
* Endpoint inexistente.
* Error 400.
* Error 404.
* Error 500.
* Respuesta lenta.
* Respuesta inválida.

El frontend no debe romperse.

Debe mostrar mensajes comprensibles para el usuario.

Nunca mostrar directamente errores técnicos innecesarios como:

```text
AxiosError
SQLITE_ERROR
TypeError
stack trace
```

al usuario final.

---

# 12. TESTING DE DATOS EXTREMOS

Probar datos razonablemente grandes.

Por ejemplo:

```text
100 clientes
500 clientes
1000 clientes

100 productos
500 productos
1000 productos
```

Comprobar:

* Tiempo de carga razonable.
* Búsqueda.
* Tablas.
* Paginación.
* Filtros.
* No bloquear la interfaz.

No realizar pruebas de carga masiva o distribuida innecesarias para este proyecto.

---

# 13. TESTING DE INTERFAZ

Comprobar:

### Resoluciones

* 1920×1080
* 1366×768
* 1280×720
* Tablet
* Ventana reducida

### Datos largos

Probar:

* Nombres largos.
* Direcciones largas.
* Emails largos.
* Nombres de productos largos.
* Tablas con muchos registros.

Verificar:

* Que no haya overflow.
* Que no se rompan las tablas.
* Que los botones sigan siendo accesibles.
* Que el texto siga siendo legible.
* Que los formularios no se desborden.

---

# 14. REGRESIÓN AUTOMÁTICA

Esta es una regla FUNDAMENTAL.

Cada vez que modifiques:

* Backend.
* Frontend.
* API.
* Base de datos.
* Service.
* Repository.
* Controller.
* Componente.
* Formulario.
* Validación.
* Regla de negocio.

Debés identificar qué tests pueden verse afectados.

Después ejecutar:

```text
1. Tests directamente relacionados
2. Tests de integración relacionados
3. Tests E2E relacionados
4. Suite completa de regresión
```

No asumir que una modificación pequeña no puede romper otra cosa.

---

# 15. NUEVAS FUNCIONALIDADES

Cada vez que se agregue una funcionalidad nueva:

### Paso 1

Implementar la funcionalidad.

### Paso 2

Crear tests específicos.

### Paso 3

Ejecutar los nuevos tests.

### Paso 4

Ejecutar tests relacionados.

### Paso 5

Ejecutar regresión completa.

### Paso 6

Corregir cualquier fallo.

### Paso 7

Volver a ejecutar todo.

### Paso 8

Actualizar la documentación de testing.

Una funcionalidad nueva sin tests no debe considerarse terminada.

---

# 16. BUGS

Cuando encuentres un bug:

NO hagas simplemente:

```text
corregir bug
```

Seguí este proceso:

```text
1. Reproducir bug
        ↓
2. Crear test que reproduzca el bug
        ↓
3. Confirmar que el test falla
        ↓
4. Corregir código
        ↓
5. Ejecutar test
        ↓
6. Confirmar que pasa
        ↓
7. Ejecutar regresión
```

De esta manera, el mismo bug no debería volver a aparecer sin que los tests lo detecten.

---

# 17. DATOS DE TEST

Los tests deben utilizar datos de prueba aislados.

No utilizar datos reales de producción.

Los tests deben poder ejecutarse repetidamente sin generar contaminación permanente de datos.

Si es necesario:

* Crear base de datos de testing.
* Crear fixtures.
* Crear datos temporales.
* Resetear datos después de cada prueba o conjunto de pruebas.

---

# 18. CRITERIO DE ÉXITO

No quiero que simplemente haya muchos tests.

Quiero que los tests sean útiles.

Cada test debe responder:

> "¿Qué comportamiento estoy verificando?"

Evitar tests redundantes que solamente comprueben detalles internos que no importan al comportamiento del sistema.

Priorizar:

```text
Comportamiento
Integridad de datos
Reglas de negocio
API
Flujos reales del usuario
Regresiones
```

---

# 19. INFORME DE TESTING

Después de cada ejecución importante generá un resumen similar a:

```text
========================================
TESTING REPORT
========================================

Unit Tests:        32/32 ✓
API Tests:         24/24 ✓
Integration:       18/18 ✓
E2E:               12/12 ✓
Regression:        86/86 ✓

TOTAL:             172/172 ✓

Failed:             0
Skipped:            0

Estado: PASSED
========================================
```

Si existen errores:

```text
========================================
TESTING REPORT
========================================

Total:              172
Passed:             168
Failed:               4

FAILED TESTS:

1. Crear venta sin stock
2. Eliminar producto utilizado
3. ...
4. ...

Estado: FAILED
========================================
```

No ocultes fallos.

---

# 20. NO DAR POR PASADO UN TEST SIN EJECUTARLO

Está prohibido afirmar:

> "Los tests pasan"

si no fueron ejecutados realmente.

También está prohibido asumir que un test funciona solamente porque el código parece correcto.

La evidencia debe provenir de la ejecución real.

---

# 21. CUANDO TERMINE CADA TAREA

Antes de considerar terminada cualquier tarea:

```text
[ ] Código implementado
[ ] Tests creados/actualizados
[ ] Tests específicos ejecutados
[ ] Tests relacionados ejecutados
[ ] Regresión ejecutada
[ ] Errores corregidos
[ ] Tests ejecutados nuevamente
[ ] Sin regresiones
```

Si alguna casilla no se puede completar, indicarlo claramente.

---

# 22. REGLA FINAL

Quiero que actúes como un QA permanente del proyecto.

No quiero un conjunto de tests que se crea una sola vez y después se abandona.

Quiero que los tests evolucionen junto con el sistema.

La relación debe ser:

```text
NUEVA FUNCIONALIDAD
        ↓
IMPLEMENTACIÓN
        ↓
TESTS
        ↓
TEST ESPECÍFICO
        ↓
REGRESIÓN
        ↓
CORRECCIONES
        ↓
REGRESIÓN NUEVAMENTE
        ↓
FUNCIONALIDAD TERMINADA
```

Cada cambio debe proteger las funcionalidades anteriores.

El objetivo final es que, a medida que el sistema crezca, aumente también la confianza de que una modificación nueva no rompe algo que ya funcionaba.
