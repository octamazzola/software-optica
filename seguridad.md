# Seguridad — Sistema de Gestión Óptica (Visión Urbana)

> **Propósito de este documento:** Guía completa para que una IA (o desarrollador) implemente la seguridad necesaria antes y después de poner la aplicación en producción en internet.
>
> **Última actualización:** Agosto 2026  
> **Rama de trabajo:** `ia_desarrollo`

---

## 1. Contexto del proyecto

### Stack actual

| Capa | Tecnología | Ubicación |
|------|------------|-----------|
| Frontend | React 19 + Vite 8 + React Router | `frontend/` |
| Backend | Node.js + Express 5 (ES Modules) | `backend/` |
| Base de datos | SQLite3 (`backend/database.sqlite`) | `backend/src/config/db.js` |
| HTTP client | Axios | `frontend/src/api/axiosInstance.js` |

### Endpoints expuestos (sin protección hoy)

```
GET/POST/PUT/DELETE  /api/clientes
GET/POST/PUT/DELETE  /api/productos
GET/POST/PUT/DELETE  /api/cristales
GET/POST             /api/ventas
GET                  /api/health
```

### Estado de seguridad actual — CRÍTICO

| Aspecto | Estado actual | Riesgo |
|---------|---------------|--------|
| Autenticación | ❌ No implementada | Cualquiera con la URL puede acceder |
| Autorización (roles) | ❌ No implementada | Sin control de quién hace qué |
| CORS | ❌ Abierto (`cors()` sin restricciones) | Cualquier sitio web puede llamar la API |
| HTTPS | ❌ Solo HTTP local | Datos en texto plano en tránsito |
| Variables de entorno | ⚠️ Parcial (`PORT`, sin `JWT_SECRET`) | Secretos podrían filtrarse |
| Validación de entrada | ⚠️ Básica en controllers | Riesgo de datos corruptos |
| Rate limiting | ❌ No existe | Vulnerable a abuso/DoS |
| Headers de seguridad | ❌ No configurados | XSS, clickjacking, etc. |
| Backups | ❌ Manuales/inexistentes | Pérdida total de datos |
| Logs de auditoría | ❌ No existen | Sin trazabilidad de cambios |

> **Conclusión:** La aplicación es segura para uso local en una PC de la óptica. **NO es segura para publicar en internet sin implementar las medidas de este documento.**

---

## 2. Datos sensibles que maneja la aplicación

La óptica almacena información que debe protegerse:

### Datos personales de clientes
- Nombre completo
- Teléfono
- Email
- Historial de compras (ventas vinculadas)

### Datos comerciales
- Precios de productos y cristales
- Registro de ventas y totales
- Stock e inventario

### Implicaciones legales (Argentina / LATAM)
- Los datos personales están protegidos por la **Ley 25.326 de Protección de Datos Personales** (Argentina).
- El responsable del tratamiento (dueño de la óptica) debe garantizar confidencialidad, integridad y disponibilidad.
- No se deben exponer datos de clientes sin consentimiento ni medidas de seguridad adecuadas.
- Implementar medidas técnicas razonables: acceso restringido, cifrado en tránsito (HTTPS), backups.

---

## 3. Autenticación — Implementación obligatoria

### 3.1 Estrategia recomendada: JWT (JSON Web Tokens)

El archivo `proyecto_optica_guia.md` ya describe esta arquitectura. Debe implementarse en el código real.

#### Backend — Dependencias a instalar

```bash
cd backend
npm install bcryptjs jsonwebtoken
```

#### Backend — Tabla de usuarios

Crear en `backend/src/config/db.js` dentro de `inicializarBaseDeDatos()`:

```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,          -- hash bcrypt, NUNCA texto plano
  rol TEXT NOT NULL DEFAULT 'vendedor',  -- 'admin' | 'vendedor'
  nombre TEXT NOT NULL,
  activo INTEGER DEFAULT 1,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### Backend — Roles sugeridos

| Rol | Permisos |
|-----|----------|
| `admin` | Todo: CRUD completo, gestión de usuarios, ver reportes |
| `vendedor` | Crear ventas, ver clientes/productos/cristales, no eliminar registros críticos |

#### Backend — Archivos a crear

```
backend/src/
├── config/env.js              # Centralizar variables de entorno
├── middlewares/auth.middleware.js
├── controllers/auth.controller.js
├── services/auth.service.js
├── repositories/usuario.repository.js
└── routes/auth.routes.js
```

#### Backend — Variables de entorno requeridas

```env
# backend/.env (NUNCA commitear)
PORT=3000
NODE_ENV=development
JWT_SECRET=<string-aleatorio-minimo-64-caracteres>
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=12
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Backend — Reglas de contraseñas

- Mínimo 8 caracteres
- Al menos una mayúscula, una minúscula y un número
- Hashear con `bcrypt` (mínimo 12 rounds en producción)
- Nunca loguear contraseñas ni tokens
- Nunca devolver el hash de contraseña en respuestas API

#### Backend — Proteger todas las rutas existentes

En `backend/src/app.js`, aplicar `authMiddleware` a todas las rutas excepto `/api/auth/login` y `/api/health`:

```javascript
import authMiddleware from './middlewares/auth.middleware.js';

// Rutas públicas
app.use('/api/auth', authRoutes);
app.get('/api/health', ...);

// Rutas protegidas — requieren token JWT válido
app.use('/api/clientes', authMiddleware, clientesRoutes);
app.use('/api/productos', authMiddleware, productoRoutes);
app.use('/api/cristales', authMiddleware, cristalRoutes);
app.use('/api/ventas', authMiddleware, ventaRoutes);
```

#### Frontend — Archivos a crear/modificar

```
frontend/src/
├── api/auth.api.js
├── context/AuthContext.jsx
├── context/useAuth.js
├── components/ProtectedRoute.jsx
└── pages/LoginPage.jsx
```

Modificar `frontend/src/App.jsx` para envolver rutas con `AuthProvider` y `ProtectedRoute`.

Modificar `frontend/src/api/axiosInstance.js` para inyectar el token:

```javascript
axiosInstancia.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

axiosInstancia.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### Usuario admin inicial

Crear un script de seed (`backend/scripts/crear-admin.mjs`) que se ejecute una sola vez en el primer deploy. **No hardcodear credenciales en el código fuente.** Usar variables de entorno:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<contraseña-segura-generada>
ADMIN_NOMBRE=Administrador
```

---

## 4. Autorización — Control de acceso por rol

### Middleware de roles

Crear `backend/src/middlewares/role.middleware.js`:

```javascript
export const requireRole = (...rolesPermitidos) => (req, res, next) => {
  if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
    return res.status(403).json({ error: 'No tenés permisos para esta acción.' });
  }
  next();
};
```

### Matriz de permisos sugerida

| Acción | admin | vendedor |
|--------|-------|----------|
| Ver clientes | ✅ | ✅ |
| Crear/editar clientes | ✅ | ✅ |
| Eliminar clientes | ✅ | ❌ |
| Ver productos/cristales | ✅ | ✅ |
| Crear/editar productos/cristales | ✅ | ❌ |
| Eliminar productos/cristales | ✅ | ❌ |
| Crear ventas | ✅ | ✅ |
| Ver historial de ventas | ✅ | ✅ |
| Eliminar ventas | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ |

---

## 5. HTTPS — Cifrado en tránsito

### Regla absoluta
**Nunca exponer la API en HTTP en producción.** Todos los datos (tokens, datos de clientes) viajan en cada request.

### Cómo se obtiene HTTPS
- **Hosting gestionado** (Render, Fly.io, Vercel): HTTPS automático con certificado Let's Encrypt.
- **VPS propio**: Configurar Nginx como reverse proxy + Certbot.
- **Cloudflare** (gratis): Proxy SSL delante del servidor.

### Frontend
- La `baseURL` de Axios debe ser `https://`, nunca `http://`.
- Configurar `VITE_API_URL=https://api.tu-dominio.com/api` en el build de producción.

### HSTS (HTTP Strict Transport Security)
Si se usa Nginx, agregar header:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 6. CORS — Restricción de orígenes

### Estado actual (inseguro)
```javascript
app.use(cors()); // Permite cualquier origen
```

### Configuración de producción

```javascript
import cors from 'cors';

const allowedOrigins = [
  process.env.FRONTEND_URL,           // https://tu-app.vercel.app
  'http://localhost:5173',          // Solo en desarrollo
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, health checks internos)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para origen: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

Variable de entorno:
```env
FRONTEND_URL=https://tu-app.vercel.app
```

---

## 7. Headers de seguridad HTTP

Instalar y configurar **Helmet** en el backend:

```bash
npm install helmet
```

```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: false, // CSP se configura en el frontend/nginx
  crossOriginEmbedderPolicy: false,
}));
```

Headers que Helmet agrega automáticamente:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN` (anti-clickjacking)
- `X-XSS-Protection: 0` (deprecado pero seguro con CSP)
- `Referrer-Policy: no-referrer`

---

## 8. Validación y sanitización de entrada

### Estado actual
Los repositories usan consultas parametrizadas (`?` placeholders), lo cual **previene SQL injection**. Mantener siempre este patrón.

### Reglas obligatorias

1. **Nunca concatenar input del usuario en SQL.**
   ```javascript
   // ❌ MAL
   dbQuery(`SELECT * FROM clientes WHERE nombre = '${nombre}'`);
   
   // ✅ BIEN
   dbQuery('SELECT * FROM clientes WHERE nombre = ?', [nombre]);
   ```

2. **Validar tipos y rangos en controllers/services:**
   - `precio`: número positivo, máximo razonable
   - `cantidad`: entero positivo
   - `email`: formato válido (regex básico)
   - `telefono`: solo dígitos, guiones y espacios
   - IDs: enteros positivos

3. **Limitar longitud de strings:**
   - `nombre`: máx 100 caracteres
   - `descripcion`: máx 500 caracteres
   - `codigo` producto: máx 50 caracteres

4. **Crear middleware de validación reutilizable** (`backend/src/middlewares/validate.middleware.js`):
   ```javascript
   export const validateBody = (schema) => (req, res, next) => {
     const errors = schema(req.body);
     if (errors.length > 0) {
       return res.status(400).json({ error: 'Datos inválidos', detalles: errors });
     }
     next();
   };
   ```

5. **No confiar en validación del frontend.** El frontend valida UX; el backend valida seguridad.

---

## 9. Rate limiting — Protección contra abuso

Instalar:
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

// Límite general para toda la API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  message: { error: 'Demasiadas solicitudes. Intentá de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite estricto para login (anti brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 intentos cada 15 minutos por IP
  message: { error: 'Demasiados intentos de login. Esperá 15 minutos.' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);
```

---

## 10. Manejo seguro de errores

### Reglas

1. **En producción (`NODE_ENV=production`):** No exponer stack traces ni detalles internos al cliente.
2. **En desarrollo:** Mostrar detalles completos para debugging.
3. **Siempre loguear errores completos en el servidor** (sin datos sensibles).

### Modificar `backend/src/moddlewares/errorHandler.js`:

```javascript
export default (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  
  const status = err.status || 500;
  const response = {
    error: status === 500 ? 'Error interno del servidor' : err.message,
  };
  
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
    response.detalle = err.message;
  }
  
  res.status(status).json(response);
};
```

---

## 11. Variables de entorno y secretos

### Archivo `.env.example` (SÍ commitear, sin valores reales)

Crear `backend/.env.example`:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=12
FRONTEND_URL=http://localhost:5173
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_NOMBRE=
```

Crear `frontend/.env.example`:
```env
VITE_API_URL=http://localhost:3000/api
```

### Reglas de secretos

| Regla | Detalle |
|-------|---------|
| Nunca commitear `.env` | Ya está en `.gitignore` — verificar que siga ahí |
| Rotar `JWT_SECRET` si se filtra | Invalida todos los tokens activos |
| Secretos distintos por entorno | dev ≠ staging ≠ production |
| No hardcodear secretos en código | Ni siquiera como fallback en producción |
| Usar panel del hosting para prod | Render/Fly.io tienen sección "Environment Variables" |

---

## 12. Seguridad del frontend

### Almacenamiento del token

| Opción | Seguridad | Recomendación |
|--------|-----------|---------------|
| `localStorage` | Vulnerable a XSS | Aceptable para app interna de óptica con CSP |
| `sessionStorage` | Se borra al cerrar pestaña | Buena para sesiones cortas |
| Cookie `httpOnly` | Más seguro (no accesible desde JS) | Ideal pero requiere más configuración |

Para este proyecto (app interna, pocos usuarios): `localStorage` + CSP es suficiente.

### Content Security Policy (CSP)

En `frontend/index.html` o via Helmet/Nginx en producción:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline'; 
               connect-src 'self' https://api.tu-dominio.com;">
```

> **Nota:** Si Bootstrap se carga por CDN, agregar esos dominios a `style-src` y `script-src`, o mejor: instalar Bootstrap como dependencia npm y eliminar el CDN.

### No exponer información sensible en el frontend

- No incluir secretos en variables `VITE_*` que no deban ser públicas (todas las `VITE_*` son visibles en el bundle).
- `VITE_API_URL` es pública por naturaleza — está bien.

---

## 13. Seguridad de la base de datos

### SQLite en producción

| Riesgo | Mitigación |
|--------|------------|
| Archivo accesible si el servidor se compromete | Permisos de archivo restrictivos (`chmod 600`) |
| Sin cifrado en reposo | Considerar SQLCipher o migrar a PostgreSQL |
| Disco efímero en hosting gratuito | Usar volumen persistente o PostgreSQL |
| Sin conexiones concurrentes robustas | Suficiente para 1-5 usuarios simultáneos |

### Backups — OBLIGATORIO

```bash
# Script de backup diario (cron job en servidor)
#!/bin/bash
FECHA=$(date +%Y%m%d_%H%M%S)
cp /ruta/backend/database.sqlite /ruta/backups/db_$FECHA.sqlite
# Mantener solo los últimos 30 días
find /ruta/backups -name "db_*.sqlite" -mtime +30 -delete
```

Frecuencia mínima recomendada: **diaria**, con al menos 7 copias rotativas.

### Permisos del archivo de base de datos

```bash
chmod 600 backend/database.sqlite
chown node:node backend/database.sqlite
```

---

## 14. Logs y auditoría

### Qué loguear

- Intentos de login (éxito y fallo) con timestamp e IP
- Creación/edición/eliminación de registros críticos (ventas, clientes)
- Errores del servidor
- Requests con status 401/403

### Qué NO loguear

- Contraseñas (ni en texto plano ni hasheadas)
- Tokens JWT completos
- Datos personales completos de clientes en logs

### Tabla de auditoría (opcional pero recomendada)

```sql
CREATE TABLE IF NOT EXISTS auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  accion TEXT NOT NULL,        -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
  tabla TEXT,
  registro_id INTEGER,
  detalle TEXT,
  ip TEXT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 15. Dependencias — Mantenimiento de seguridad

### Auditoría periódica

```bash
# En backend y frontend
npm audit
npm audit fix
```

### Reglas

- Ejecutar `npm audit` antes de cada deploy a producción.
- Mantener dependencias actualizadas (especialmente `express`, `jsonwebtoken`, `bcryptjs`).
- Revisar advisories en: https://github.com/advisories
- Fijar versiones en `package.json` para builds reproducibles.

---

## 16. Seguridad de red y acceso

### Escenarios de despliegue

| Escenario | Nivel de exposición | Medidas mínimas |
|-----------|--------------------|--------------------|
| Solo en la óptica (LAN) | Bajo | Auth básica, firewall local |
| Internet con URL pública | Alto | Todo este documento |
| Internet con dominio propio | Alto | Todo + WAF (Cloudflare gratis) |

### Opciones de restricción adicional

1. **Cloudflare Access** (gratis hasta 50 usuarios): Login antes de llegar a la app.
2. **IP whitelist** en Nginx: Solo IPs de la óptica.
3. **VPN** (WireGuard/Tailscale): Acceso solo para dispositivos autorizados.

---

## 17. Checklist de seguridad pre-producción

Usar esta lista antes de publicar. **Todos los ítems marcados como CRÍTICO deben estar completos.**

### Autenticación y acceso
- [ ] **CRÍTICO** — Login implementado con JWT
- [ ] **CRÍTICO** — Todas las rutas `/api/*` protegidas (excepto login y health)
- [ ] **CRÍTICO** — Contraseñas hasheadas con bcrypt (12+ rounds)
- [ ] **CRÍTICO** — `JWT_SECRET` fuerte y en variable de entorno
- [ ] Roles implementados (admin/vendedor)
- [ ] Rate limiting en login (anti brute-force)
- [ ] Usuario admin creado via script/env, no hardcodeado

### Comunicación
- [ ] **CRÍTICO** — HTTPS activo en frontend y backend
- [ ] **CRÍTICO** — CORS restringido al dominio del frontend
- [ ] Helmet configurado (headers de seguridad)

### Datos
- [ ] **CRÍTICO** — Backups automáticos configurados
- [ ] Consultas SQL siempre parametrizadas (verificar todos los repositories)
- [ ] Validación de entrada en todos los endpoints
- [ ] `.env` en `.gitignore` (verificar)
- [ ] `.env.example` creado sin secretos reales

### Frontend
- [ ] Rutas protegidas con `ProtectedRoute`
- [ ] Token inyectado en Axios interceptor
- [ ] Redirect a `/login` en 401/403
- [ ] `VITE_API_URL` apunta a HTTPS en producción

### Operaciones
- [ ] `NODE_ENV=production` en el servidor
- [ ] Errores no exponen stack traces al cliente
- [ ] `npm audit` sin vulnerabilidades críticas
- [ ] Logs de auditoría activos
- [ ] Plan de respuesta ante incidentes documentado

---

## 18. Plan de respuesta ante incidentes

### Si se filtra el JWT_SECRET
1. Rotar `JWT_SECRET` inmediatamente en el hosting.
2. Todos los usuarios deberán volver a loguearse.
3. Revisar logs de acceso sospechoso.

### Si se compromete la base de datos
1. Tomar la app offline (detener el servicio).
2. Restaurar desde el backup más reciente limpio.
3. Rotar todas las contraseñas de usuarios.
4. Investigar vector de ataque y parchear.

### Si hay acceso no autorizado
1. Revisar tabla de auditoría y logs del servidor.
2. Cambiar credenciales de admin.
3. Verificar integridad de datos (ventas, clientes).
4. Notificar al responsable de la óptica.

---

## 19. Orden de implementación sugerido para la IA

Implementar en este orden para minimizar riesgo:

```
Fase 1 — Fundamentos (bloqueante para producción)
  1. Crear config/env.js y .env.example
  2. Implementar auth completo (tabla usuarios, JWT, login)
  3. Proteger todas las rutas con authMiddleware
  4. Crear LoginPage y ProtectedRoute en frontend
  5. Configurar Axios interceptors

Fase 2 — Endurecimiento
  6. Configurar CORS restrictivo
  7. Instalar y configurar Helmet
  8. Implementar rate limiting
  9. Mejorar validación de entrada
  10. Mejorar errorHandler para producción

Fase 3 — Operaciones
  11. Script de backup de SQLite
  12. Tabla y middleware de auditoría
  13. Script crear-admin.mjs
  14. npm audit y actualización de dependencias

Fase 4 — Roles (puede ser posterior al primer deploy)
  15. Implementar role.middleware.js
  16. Aplicar permisos por endpoint según matriz
```

---

## 20. Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices (RFC 8725)](https://datatracker.ietf.org/doc/html/rfc8725)
- [Ley 25.326 — Protección de Datos Personales (Argentina)](https://www.argentina.gob.ar/normativa/nacional/ley-25326-647)
