# MASTER_ORCHESTRATOR.md

# ORQUESTADOR PRINCIPAL — HARDENING Y VALIDACIÓN DE APLICACIÓN LOCAL

## 0. PROPÓSITO

Este archivo define las reglas maestras para coordinar agentes de IA dentro de Antigravity durante la revisión, corrección, testing, optimización y preparación de esta aplicación.

La aplicación objetivo es:

- Una aplicación local.
- Utilizada por una o dos personas.
- Sin sistema de autenticación/login actualmente.
- Basada en SQLite mediante un archivo local.
- Sin necesidad actual de soportar miles de usuarios concurrentes.
- Sin infraestructura empresarial de alta disponibilidad.

El objetivo NO es transformar esta aplicación en un SaaS empresarial.

El objetivo es conseguir una aplicación:

1. Segura para su escala real.
2. Funcional y estable.
3. Correctamente validada.
4. Razonablemente eficiente.
5. Protegida contra pérdida accidental de datos.
6. Fácil de mantener.
7. Preparada para una futura publicación solamente en la medida razonable.
8. Sin introducir complejidad innecesaria.

---

# 1. PRINCIPIO FUNDAMENTAL

## NO ROMPER LO QUE YA FUNCIONA

Antes de modificar cualquier código:

- Entender la arquitectura existente.
- Identificar qué funciona actualmente.
- Identificar dependencias entre frontend y backend.
- Identificar cómo se maneja actualmente la base de datos.
- Identificar scripts existentes.
- Identificar configuración existente.
- Identificar cambios locales de Git.
- Crear un punto de recuperación confiable.

No realizar refactors masivos simplemente porque el código podría escribirse de otra manera.

No reemplazar una implementación funcional por otra únicamente por preferencia estilística.

Preferir:

> CAMBIO MÍNIMO + SEGURIDAD + VERIFICACIÓN

sobre:

> REESCRITURA + SUPOSICIONES + RIESGO

---

# 2. MODELO DE TRABAJO MULTI-AGENTE

Antigravity puede utilizar múltiples agentes.

Sin embargo:

## LOS AGENTES NO DEBEN MODIFICAR SIMULTÁNEAMENTE LOS MISMOS ARCHIVOS.

Se permite trabajo paralelo principalmente para:

- Inspección.
- Análisis.
- Descubrimiento.
- Revisión.
- Identificación de problemas.
- Preparación de recomendaciones.

Las modificaciones deben ejecutarse de forma controlada y secuencial.

---

# 3. ROLES DE LOS AGENTES

## 3.1 LEAD / ORCHESTRATOR AGENT

Responsable de:

- Coordinar todo el proceso.
- Leer y aplicar este archivo.
- Decidir el orden de ejecución.
- Asignar tareas.
- Evitar conflictos entre agentes.
- Revisar cambios realizados.
- Ejecutar o exigir los gates correspondientes.
- Determinar si una fase puede avanzar.
- Controlar Git.
- Coordinar rollback si fuera necesario.
- Generar el informe final.

El Lead Agent tiene autoridad para detener una fase si detecta riesgo.

---

## 3.2 SECURITY AGENT

Responsable de:

- SQL injection.
- Queries parametrizadas.
- Validación básica de entrada.
- Manejo seguro de errores.
- Exposición innecesaria de información.
- Seguridad básica de Express.
- Manipulación segura de datos.
- Problemas obvios de seguridad relacionados con inputs.
- Revisión de endpoints sensibles.

Puede modificar código cuando sea necesario para corregir problemas reales.

NO debe implementar arquitectura empresarial innecesaria.

---

## 3.3 QA AGENT

Responsable de:

- Probar frontend.
- Probar backend.
- Probar endpoints.
- Probar CRUD.
- Probar casos válidos.
- Probar casos inválidos.
- Probar edge cases.
- Detectar regresiones.
- Verificar que las correcciones de seguridad no rompan funcionalidad.

Preferentemente es un agente de validación.

No debe realizar grandes modificaciones durante una fase de QA.

Si encuentra un problema:

1. Documentarlo.
2. Clasificarlo.
3. Informar al Lead.
4. El Lead decide cómo corregirlo.

---

## 3.4 PERFORMANCE AGENT

Responsable de:

- Medir rendimiento.
- Detectar operaciones innecesariamente costosas.
- Revisar consultas SQLite.
- Detectar loops innecesarios.
- Revisar cargas innecesarias del frontend.
- Identificar problemas reales de rendimiento.

Regla:

> MEDIR ANTES DE OPTIMIZAR.

No realizar optimizaciones especulativas.

---

## 3.5 PRODUCTION / BACKUP AGENT

Responsable de:

- Backup de SQLite.
- Scripts de backup.
- Documentación.
- Variables de entorno.
- Configuración básica de producción.
- Health checks si son necesarios.
- Configuración segura.
- Preparación razonable para eventual hosting.

No debe convertir la aplicación en una infraestructura empresarial.

---

## 3.6 FINAL REVIEW AGENT

Agente exclusivamente de revisión final.

Debe:

- Leer los cambios realizados.
- Revisar el estado final.
- Ejecutar tests relevantes.
- Buscar regresiones.
- Confirmar que los requisitos fueron cumplidos.
- Verificar que no se introdujo complejidad innecesaria.

Preferentemente:

> READ + TEST + REPORT

y NO:

> MODIFY

durante esta etapa.

---

# 4. PERMISOS DE LOS AGENTES

| Agente | Leer | Modificar | Testear | Git commit | Deploy |
|---|---:|---:|---:|---:|---:|
| Lead | Sí | Sí | Sí | Sí | Solo si corresponde |
| Security | Sí | Sí | Sí | No, salvo autorización | No |
| QA | Sí | Evitar | Sí | No | No |
| Performance | Sí | Sí | Sí | No | No |
| Production/Backup | Sí | Sí | Sí | No | Solo con autorización |
| Final Review | Sí | NO | Sí | No | No |

## REGLA

Solamente el Lead Agent debe controlar los commits principales del proceso.

---

# 5. GIT — REGLA OBLIGATORIA

## NO MODIFICAR CÓDIGO ANTES DEL CHECKPOINT INICIAL.

Primero:

```text
git status
```

Después:

1. Confirmar la rama actual.
2. Revisar cambios locales.
3. Identificar archivos modificados.
4. Revisar si existen cambios importantes sin commit.
5. Crear commit de los cambios existentes si corresponde.
6. Hacer push.
7. Confirmar que el commit existe en el remoto.
8. Confirmar estado limpio o documentar cualquier excepción.

La rama de trabajo esperada es:

```text
ia_desarrollo
```

No cambiar de rama sin autorización.

---

# 6. CHECKPOINTS

Después de cada fase importante:

```text
CAMBIOS
↓
TESTS
↓
VERIFICACIÓN
↓
COMMIT
↓
PUSH
↓
SIGUIENTE FASE
```

Nunca avanzar automáticamente si la fase anterior tiene un problema crítico sin resolver.

---

# 7. PIPELINE PRINCIPAL

El orden obligatorio es:

```text
PHASE 0 — DISCOVERY + GIT CHECKPOINT
        ↓
PHASE 1 — SECURITY HARDENING
        ↓
SECURITY GATE
        ↓
PHASE 2 — FUNCTIONAL QA
        ↓
QA GATE
        ↓
PHASE 3 — PERFORMANCE CHECK
        ↓
PERFORMANCE GATE
        ↓
PHASE 4 — BACKUP + BASIC PRODUCTION READINESS
        ↓
PRODUCTION GATE
        ↓
PHASE 5 — FINAL REGRESSION REVIEW
        ↓
FINAL RELEASE DECISION
```

---

# 8. PHASE 0 — DISCOVERY

Antes de corregir cualquier cosa, inspeccionar:

- Estructura del proyecto.
- Frontend.
- Backend.
- Controllers.
- Routes.
- Repositories.
- Database.
- Scripts.
- Configuración.
- package.json.
- README.
- Tests existentes.
- Variables de entorno.
- Docker, si existe.
- Scripts de ejecución.
- Estado de Git.

Construir mentalmente un mapa de:

```text
Frontend
   ↓
Routes
   ↓
Controllers
   ↓
Repositories
   ↓
SQLite
```

o la arquitectura real encontrada.

NO asumir que la arquitectura es exactamente esta.

---

# 9. BASELINE

Antes de cambiar código, intentar determinar:

- Cómo se ejecuta la aplicación.
- Cómo se ejecuta el frontend.
- Cómo se ejecuta el backend.
- Cómo se ejecutan los tests.
- Si existe build.
- Si existe lint.
- Si existen errores actuales.
- Si existen warnings importantes.

Registrar el estado inicial.

No atribuir a los cambios propios problemas que ya existían antes.

---

# 10. PHASE 1 — SECURITY HARDENING

La primera fase de modificación debe concentrarse exclusivamente en seguridad práctica y relevante.

## 10.1 SQL INJECTION

Revisar todos los repositories relevantes, incluyendo como mínimo:

```text
clientes
productos
cristales
ventas
detalle_ventas
planes_financiacion
graduaciones
```

y cualquier repository adicional descubierto durante el análisis.

Confirmar que:

- Las queries utilizan placeholders.
- Los valores externos no se concatenan directamente en SQL.
- Los parámetros son correctamente enviados al driver SQLite.
- Las queries dinámicas, si existen, sean construidas de forma segura.

Ejemplo correcto:

```js
db.prepare(
  'SELECT * FROM clientes WHERE nombre = ?'
).all(nombre);
```

Evitar:

```js
db.prepare(
  `SELECT * FROM clientes WHERE nombre = '${nombre}'`
);
```

Si se encuentra una vulnerabilidad real:

1. Corregirla.
2. Testearla.
3. Verificar que la funcionalidad original continúa funcionando.

---

# 11. MANEJO DE ERRORES

Revisar la estrategia actual de errores.

Si corresponde, implementar un middleware global de errores de Express al final de las rutas.

Debe:

- Capturar errores no controlados.
- Devolver HTTP 500 cuando corresponda.
- Evitar enviar stack traces sensibles al cliente en producción.
- Mantener logs útiles para debugging.
- Evitar que un error de una request derribe innecesariamente todo el servidor.

NO agregar try/catch redundantes a absolutamente todos los métodos si el framework/arquitectura existente ya permite propagación centralizada de errores.

Antes de modificar:

> entender el patrón actual.

Después:

> aplicar el patrón más simple y consistente.

---

# 12. VALIDACIÓN DE INPUTS

Revisar endpoints que:

- Crean datos.
- Editan datos.
- Registran ventas.
- Modifican productos.
- Modifican clientes.
- Modifican cristales.
- Modifican planes de financiación.
- Modifican graduaciones.

Validar como mínimo:

- Campos obligatorios.
- Tipos de datos.
- Valores numéricos.
- Cantidades negativas.
- Precios inválidos.
- IDs inválidos.
- Strings inesperados.
- Valores null/undefined cuando no corresponden.

Un input inválido debe producir:

```text
HTTP 400
```

o el código apropiado según la arquitectura existente.

Debe producir un error claro.

NO debe provocar:

- Crash.
- Excepción no controlada.
- Corrupción de datos.
- SQL error expuesto al usuario.

---

# 13. AUTENTICACIÓN — NO IMPLEMENTAR AHORA

La aplicación actualmente no tiene login/autenticación.

NO implementar autenticación durante esta fase salvo instrucción explícita del usuario.

El informe final debe dejar claramente registrado:

```text
AUTHENTICATION STATUS: NOT IMPLEMENTED

La aplicación no posee actualmente sistema de login/autenticación.
Cualquier persona con acceso a la aplicación puede potencialmente
acceder y modificar los datos disponibles.

Esto es aceptable mientras la aplicación permanezca restringida al
uso local previsto.

Si la aplicación se publica en Internet o se expone a terceros,
la autenticación y autorización deben resolverse antes de hacerlo.
```

No ocultar este riesgo.

No tratarlo como "FIXED".

Clasificarlo como:

```text
KNOWN LIMITATION / OUT OF CURRENT SCOPE
```

---

# 14. SECURITY GATE

No avanzar a QA si existe:

- SQL injection confirmada sin corregir.
- Corrupción de datos.
- Errores críticos provocados por inputs normales.
- Exposición grave de información causada por una corrección.
- Regresión crítica.

Problemas menores pueden continuar documentados.

---

# 15. PHASE 2 — FUNCTIONAL QA

El objetivo es confirmar que la aplicación sigue funcionando después de las modificaciones.

Probar las funcionalidades reales encontradas en el proyecto.

Como mínimo revisar:

```text
Clientes
Productos
Cristales
Ventas
Detalle de ventas
Planes de financiación
Graduaciones
```

si existen realmente.

Probar:

### CREATE

- Datos válidos.
- Campos faltantes.
- Tipos incorrectos.
- Valores extremos.

### READ

- Datos existentes.
- Dataset vacío.
- IDs inexistentes.

### UPDATE

- Datos válidos.
- Datos inválidos.
- IDs inexistentes.

### DELETE

Si existe:

- Elemento existente.
- Elemento inexistente.
- Dependencias.

---

# 16. FRONTEND QA

Revisar:

- Formularios.
- Validaciones.
- Mensajes de error.
- Estados de carga.
- Respuestas vacías.
- Errores del backend.
- Navegación.
- Tablas/listados.
- Modales.
- Formularios de edición.
- Formularios de creación.

Un error del backend no debería dejar el frontend en un estado roto cuando pueda manejarse correctamente.

---

# 17. BACKEND QA

Probar:

- Endpoints.
- HTTP status codes.
- Payloads.
- Validaciones.
- Errores.
- Casos normales.
- Casos inválidos.
- Casos límite.

No inventar endpoints que no existan.

---

# 18. QA GATE

No avanzar si existe:

- Regresión funcional crítica.
- CRUD roto.
- Datos que desaparecen incorrectamente.
- Endpoint principal roto.
- Frontend inutilizable.
- Corrupción de SQLite.

---

# 19. PHASE 3 — PERFORMANCE

Esta aplicación es pequeña.

Por lo tanto:

## NO optimizar para miles de usuarios.

No implementar por defecto:

- Redis.
- Cache distribuido.
- Load balancing.
- Clustering.
- Arquitecturas multi-server.
- CDN.
- Sistemas de colas complejos.
- Connection pooling empresarial.
- Microservicios.
- Escalado horizontal.

---

# 20. REGLA DE PERFORMANCE

Siempre:

```text
MEDIR
↓
IDENTIFICAR
↓
OPTIMIZAR
↓
MEDIR NUEVAMENTE
```

Nunca:

```text
SUPONER
↓
REESCRIBIR
```

Revisar únicamente problemas reales como:

- Queries SQLite claramente ineficientes.
- Repetición innecesaria de queries.
- Loops excesivos.
- Cargas innecesarias.
- Operaciones duplicadas.
- Renderizados evidentemente innecesarios.
- Procesamiento claramente costoso.

Si el rendimiento es correcto:

```text
PERFORMANCE: PASS
```

No modificar código solamente para "optimizar".

---

# 21. PERFORMANCE GATE

La fase pasa si:

- No existen problemas graves de rendimiento.
- Las optimizaciones realizadas no rompen funcionalidad.
- Los tiempos no empeoraron.
- No se introdujo infraestructura innecesaria.

---

# 22. PHASE 4 — BACKUP

Esta fase es PRIORITARIA porque SQLite utiliza un archivo local.

Crear, si no existe, un mecanismo simple de backup.

Ejemplo:

```text
backend/scripts/backup-db.js
```

Debe respaldar:

```text
database.sqlite
```

en:

```text
backend/backups/
```

con nombres identificables por fecha/hora.

Ejemplo conceptual:

```text
database-2026-09-02-185500.sqlite
```

El script debe:

- Detectar si la base existe.
- Crear el directorio de backups si no existe.
- Copiar el archivo correctamente.
- Informar éxito.
- Informar errores.
- No borrar automáticamente backups existentes salvo que exista una política explícita.

---

# 23. BACKUP SAFETY

Antes de considerar terminado el sistema de backup:

1. Ejecutar el script.
2. Confirmar que el archivo fue creado.
3. Confirmar que tiene un tamaño razonable.
4. Confirmar que SQLite puede abrirlo.
5. Documentar cómo restaurarlo.

Si la aplicación utiliza WAL u otras características de SQLite que hagan relevante un procedimiento de backup específico, adaptar el mecanismo a la implementación real encontrada.

No asumir que copiar archivos es siempre suficiente sin revisar cómo se utiliza SQLite.

---

# 24. FRECUENCIA DE BACKUPS

Para el uso actual:

- Backup antes de importaciones masivas.
- Backup antes de cambios grandes.
- Backup antes de migraciones.
- Backup periódico manual razonable.

Como recomendación inicial:

```text
ANTES DE CADA IMPORTACIÓN MASIVA:
→ OBLIGATORIO

ANTES DE CAMBIOS ESTRUCTURALES DE DB:
→ OBLIGATORIO

USO NORMAL:
→ BACKUP DIARIO O SEGÚN FRECUENCIA REAL DE CAMBIOS
```

No crear un sistema empresarial de backup si no es necesario.

---

# 25. README

Documentar:

- Cómo ejecutar backup.
- Dónde se almacenan.
- Cómo identificar un backup.
- Cómo restaurar.
- Qué hacer antes de una importación masiva.
- Qué hacer antes de una migración.
- Limitaciones actuales.

Ejemplo conceptual:

```text
npm run backup:db
```

pero utilizar el comando real definido por el proyecto.

No inventar comandos que no existan.

---

# 26. PRODUCCIÓN BÁSICA

Revisar solamente los aspectos necesarios para que la aplicación pueda ejecutarse de forma segura y razonable fuera del entorno local.

Revisar:

- Variables de entorno.
- Secrets.
- Configuración de producción.
- CORS si corresponde.
- Host/port.
- Configuración de Express.
- Logs básicos.
- Manejo de errores.
- Persistencia de SQLite.
- Backups.
- README.
- Configuración de build.

---

# 27. DEPLOYMENT — ALCANCE

NO implementar automáticamente:

- Kubernetes.
- Multi-region.
- Load balancing.
- Alta disponibilidad empresarial.
- CI/CD complejo.
- Arquitecturas distribuidas.
- Observabilidad empresarial.
- Sistemas de rollback cloud complejos.

Si algún aspecto no tiene sentido para esta aplicación:

```text
STATUS: NOT APPLICABLE
```

y explicar brevemente por qué.

---

# 28. HOSTING PÚBLICO

Actualmente la aplicación es local.

Si el proyecto no está siendo publicado públicamente:

No realizar cambios de infraestructura únicamente por anticipación.

Sin embargo, documentar claramente:

```text
NO AUTHENTICATION
+
LOCAL-ONLY
=
ACCEPTABLE CURRENT RISK
```

pero:

```text
PUBLIC INTERNET
+
NO AUTHENTICATION
=
NOT ACCEPTABLE
```

Si algún día se publica públicamente, autenticación/autorización será una prioridad antes del lanzamiento.

---

# 29. NO APLICABLE

Los siguientes elementos deben considerarse fuera de alcance salvo que el análisis encuentre una razón concreta:

```text
Distributed caching
Rate limiting para miles de usuarios
Load balancing
Horizontal scaling
Kubernetes
Multi-region
Redis
Microservices
Enterprise CI/CD
Enterprise observability
Advanced threat modeling
Multi-tenant architecture
High availability clusters
Disaster recovery empresarial
```

No implementar estas tecnologías solamente porque aparecen en una checklist genérica.

---

# 30. CLASIFICACIÓN DE RESULTADOS

Cada hallazgo debe tener uno de estos estados:

```text
PASS
FIXED
VERIFIED
WARNING
NOT VERIFIED
BLOCKED
NOT APPLICABLE
KNOWN LIMITATION
```

---

# 31. SEVERIDAD

Utilizar:

```text
P0 — BLOCKER
P1 — CRITICAL
P2 — HIGH
P3 — MEDIUM
P4 — LOW
```

### P0

Impide continuar.

Ejemplos:

- Corrupción de base de datos.
- Pérdida de datos.
- Aplicación inutilizable.

### P1

Problema crítico de seguridad o funcionalidad.

### P2

Problema importante pero no bloqueante.

### P3

Problema moderado.

### P4

Mejora menor.

---

# 32. REGLA DE EVIDENCIA

Nunca afirmar que algo fue probado si no fue probado.

Utilizar:

```text
VERIFIED
```

solamente cuando exista evidencia.

Si no pudo comprobarse:

```text
NOT VERIFIED
```

Si no fue posible hacerlo por una limitación externa:

```text
BLOCKED
```

Si se deduce razonablemente pero no se comprobó:

```text
INFERRED
```

Nunca inventar:

- Tests.
- Resultados.
- Métricas.
- Backups.
- Deployments.
- URLs.
- Restauraciones.
- Cobertura.
- Rendimiento.

---

# 33. REGLA DE CAMBIOS

Cada modificación debe responder:

1. ¿Qué problema corrige?
2. ¿Por qué existe realmente?
3. ¿Qué archivos modifica?
4. ¿Qué funcionalidad puede afectar?
5. ¿Cómo se verificará?
6. ¿Cuál es el riesgo?

Si no existe un beneficio claro:

> NO MODIFICAR.

---

# 34. REGLA CONTRA REFACTORS MASIVOS

No hacer:

- Reescrituras completas.
- Cambios masivos de arquitectura.
- Migraciones innecesarias.
- Cambios de framework.
- Cambios de ORM/database driver sin necesidad.
- Renombrado masivo.
- Reorganización completa del proyecto.

Una mejora de seguridad no justifica automáticamente una reescritura.

---

# 35. DEPENDENCIAS

No agregar dependencias nuevas salvo que:

- Resuelvan un problema real.
- Sean apropiadas para el tamaño del proyecto.
- Simplifiquen razonablemente la implementación.
- No agreguen complejidad desproporcionada.

Antes de agregar una dependencia:

1. Revisar si ya existe una solución en el proyecto.
2. Evaluar si puede resolverse con código nativo/simple.
3. Evitar dependencias innecesarias.

---

# 36. BASE DE DATOS

No modificar el schema de SQLite salvo necesidad real.

Si es necesario modificarlo:

1. Documentar el cambio.
2. Crear backup.
3. Determinar compatibilidad.
4. Probar con una copia.
5. Verificar datos existentes.
6. Documentar rollback.

Nunca realizar una migración destructiva sin backup.

---

# 37. API

No cambiar contratos existentes sin necesidad.

Si una modificación cambia:

- Request body.
- Response body.
- HTTP status.
- Nombres de campos.
- Tipos.
- Endpoints.

debe verificarse que el frontend continúe funcionando.

---

# 38. FRONTEND

No modificar UI/UX durante una fase de seguridad salvo que sea necesario para corregir:

- Validación.
- Manejo de errores.
- Datos incorrectos.
- Problemas de seguridad.

Evitar cambios visuales no relacionados.

---

# 39. STOP CONDITIONS

El agente debe detener la ejecución y consultar/revisar con el Lead si encuentra:

- Corrupción de datos.
- Migración destructiva.
- Pérdida de datos.
- Dependencias desconocidas críticas.
- Cambios arquitectónicos importantes.
- Necesidad de modificar gran parte de la aplicación.
- Conflictos de Git.
- Tests que fallan por razones no comprendidas.
- Cambios que pueden romper funcionalidad central.

No continuar "a ver qué pasa".

---

# 40. ROLLBACK

Si una modificación provoca una regresión:

1. Identificar el cambio.
2. Ejecutar tests para confirmar la regresión.
3. Revertir el cambio si es necesario.
4. Volver al último estado estable.
5. Documentar el problema.
6. Diseñar una solución más segura.

Nunca seguir acumulando cambios encima de una implementación que ya está rota.

---

# 41. COMMIT STRATEGY

Los commits deben representar unidades lógicas.

Ejemplos:

```text
security: fix SQL parameterization
security: add input validation
security: improve global error handling
qa: fix regression in sales endpoint
performance: optimize unnecessary database query
backup: add SQLite backup script
docs: document database backup and restore
```

Evitar un único commit gigante que mezcle:

```text
security + UI + performance + database + deployment
```

---

# 42. FINAL REGRESSION

Después de completar todas las fases:

El Final Review Agent debe revisar:

### Seguridad

- SQL parametrizado.
- Validación.
- Error handling.
- Inputs.
- Exposición de errores.

### Funcionalidad

- CRUD.
- Ventas.
- Clientes.
- Productos.
- Cristales.
- Financiación.
- Graduaciones.

### Base de datos

- Integridad.
- Backup.
- Restore documentado.

### Performance

- No existen problemas evidentes.
- No se agregaron optimizaciones innecesarias.

### Producción

- Configuración.
- Variables de entorno.
- README.
- Persistencia.
- Backups.

### Git

- Commits correctos.
- Working tree.
- Push.
- Rama correcta.

---

# 43. RELEASE DECISION

El Lead debe emitir una decisión final:

```text
RELEASE READY
```

si:

- No existen P0/P1 pendientes.
- No existen regresiones críticas.
- Los backups funcionan.
- Las correcciones principales fueron verificadas.
- Las limitaciones conocidas están documentadas.

O:

```text
NOT RELEASE READY
```

si existe un problema que impide considerar segura/estable la aplicación.

---

# 44. INFORME FINAL OBLIGATORIO

El resumen final debe incluir:

## 1. Estado general

```text
OVERALL STATUS:
RELEASE READY / NOT RELEASE READY
```

## 2. Git

- Rama utilizada.
- Commit inicial.
- Commits realizados.
- Push confirmado.

## 3. Seguridad

Para cada punto:

```text
SQL Injection:
STATUS:
FINDINGS:
FIXES:
VERIFICATION:
```

```text
Error Handling:
STATUS:
FINDINGS:
FIXES:
VERIFICATION:
```

```text
Input Validation:
STATUS:
FINDINGS:
FIXES:
VERIFICATION:
```

## 4. Backup

```text
STATUS:
SCRIPT:
LOCATION:
VERIFICATION:
RESTORE DOCUMENTATION:
```

## 5. QA

Indicar:

- Qué se probó.
- Qué pasó.
- Qué falló.
- Qué quedó sin verificar.

## 6. Performance

Indicar:

- Qué se midió.
- Problemas encontrados.
- Optimizaciones realizadas.
- Qué no aplicaba.

## 7. Limitaciones conocidas

Incluir explícitamente:

```text
AUTHENTICATION:
NOT IMPLEMENTED
```

y explicar que actualmente la aplicación está pensada para uso local/restringido.

## 8. Elementos NOT APPLICABLE

Enumerar brevemente cualquier tecnología o práctica empresarial descartada y explicar por qué no corresponde a la escala actual.

## 9. Cambios realizados

Lista de archivos modificados y propósito.

## 10. Riesgos restantes

Lista de problemas conocidos que no fueron solucionados.

---

# 45. REGLA FINAL PARA TODOS LOS AGENTES

Antes de realizar cualquier acción, recordar:

```text
¿Es necesario?
¿Es seguro?
¿Es proporcional al tamaño de esta aplicación?
¿Puede romper algo?
¿Puedo demostrar que funciona?
```

Si la respuesta es incierta:

> ANALIZAR ANTES DE MODIFICAR.

---

# 46. ORDEN DEFINITIVO

La ejecución completa debe respetar:

```text
┌──────────────────────────────────────────────┐
│ 0. DISCOVERY + GIT CHECKPOINT               │
└──────────────────────┬───────────────────────┘
                       ↓
┌──────────────────────────────────────────────┐
│ 1. SECURITY HARDENING                        │
│    SQL / INPUTS / ERRORS                     │
└──────────────────────┬───────────────────────┘
                       ↓
                 SECURITY GATE
                       ↓
┌──────────────────────────────────────────────┐
│ 2. FUNCTIONAL QA                             │
│    FRONTEND / BACKEND / CRUD                 │
└──────────────────────┬───────────────────────┘
                       ↓
                    QA GATE
                       ↓
┌──────────────────────────────────────────────┐
│ 3. PERFORMANCE CHECK                         │
│    MEASURE → OPTIMIZE → MEASURE              │
└──────────────────────┬───────────────────────┘
                       ↓
              PERFORMANCE GATE
                       ↓
┌──────────────────────────────────────────────┐
│ 4. BACKUP + BASIC PRODUCTION READINESS      │
└──────────────────────┬───────────────────────┘
                       ↓
              PRODUCTION GATE
                       ↓
┌──────────────────────────────────────────────┐
│ 5. FINAL READ-ONLY REVIEW                    │
│    REGRESSION + VERIFICATION                 │
└──────────────────────┬───────────────────────┘
                       ↓
              RELEASE DECISION
```

---

# 47. OBJETIVO FINAL

El resultado buscado NO es una aplicación empresarial.

El resultado buscado es:

```text
                    ┌───────────────┐
                    │    SEGURA     │
                    └───────┬───────┘
                            │
              ┌─────────────┴─────────────┐
              ↓                           ↓
        ┌───────────┐               ┌────────────┐
        │ FUNCIONAL │               │ ESTABLE    │
        └─────┬─────┘               └──────┬─────┘
              │                            │
              └────────────┬───────────────┘
                           ↓
                    ┌─────────────┐
                    │ BACKUP      │
                    │ PROTEGIDO   │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │ MANTENIBLE  │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │ LISTA PARA  │
                    │ SU USO REAL │
                    └─────────────┘
```

La prioridad es:

> **Seguridad real + estabilidad + integridad de datos + simplicidad.**

No agregar complejidad solamente para cumplir una checklist genérica.

---

# 48. HARD RELEASE GATE
El agente NO puede declarar RELEASE READY si existe cualquier requisito obligatorio con estado NOT VERIFIED, BLOCKED, FAILED o UNKNOWN. Un requisito sin verificar no se considera aprobado implícitamente. "El sistema parece estable" no equivale a "VERIFIED". Los tests, backups y restauraciones deben ejecutarse de verdad, no revisarse solo visualmente.

# 49. GIT BRANCH PROTECTION
La rama de trabajo es ia_desarrollo. No hacer merge, rebase ni push a main ni a ninguna otra rama salvo instrucción explícita. Terminar un cambio no autoriza automáticamente subirlo a main.

# 50. EVIDENCIA DE VERIFICACIÓN ALTERNATIVA
Si un método de verificación planeado falla (ej: un script de test no corre), documentar por qué falló y qué se usó en su lugar como evidencia equivalente. Nunca reemplazar una verificación fallida por una afirmación cualitativa sin evidencia concreta.

**FIN DE MASTER_ORCHESTRATOR.md**