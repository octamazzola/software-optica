# Conversión a aplicación de escritorio (Electron + Linux)

Convertí este proyecto web en una aplicación de escritorio nativa para **Linux**
(Linux Mint y cualquier distro basada en Debian/Ubuntu), usando Electron.
Mantené **TODO** lo que ya existe: backend Express, SQLite, frontend React + Bootstrap.

---

## RAMA — MUY IMPORTANTE

Trabajá exclusivamente sobre la rama `ia_desarrollo`.

Antes de tocar cualquier archivo:
1. Verificá la rama actual: `git branch --show-current`
2. Si no estás en `ia_desarrollo`, cambiate: `git checkout ia_desarrollo`
3. **NO** toques, mergees ni commitees nada en `desarrollo_propio`

---

## OBJETIVO

Que la app se abra como un programa de escritorio en Linux:
- Ventana nativa con ícono en el menú/lanzador
- Instalable sin que el usuario ejecute comandos manualmente
- Sin depender de un navegador externo
- Funcionando **sin conexión a internet** una vez instalada

**Nombre de la aplicación:** `Óptica Visual`  
**ID del paquete (appId):** `com.optica.visual` (o similar, en minúsculas sin espacios)

---

## CONTEXTO DEL PROYECTO (no reescribir lógica de negocio)

### Backend
- Node.js / Express en `backend/`
- Puerto por defecto: `3000` (`process.env.PORT`)
- SQLite en `backend/database.sqlite`
- Path actual en `backend/src/config/db.js`:
  `path.resolve(_dirname, '../../database.sqlite')`
- Arquitectura en capas: routes → controllers → services → repositories → db
- Endpoints bajo `/api/`: clientes, productos, cristales, ventas, health

### Frontend
- React + Vite en `frontend/`
- Bootstrap 5.3.3 e íconos cargados **por CDN** en `frontend/index.html`
- API base hardcodeada en `frontend/src/api/axiosInstance.js`:
  `http://localhost:3000/api`
- Dev server de Vite: `http://localhost:5173`

### Estructura actual
- No existe carpeta `electron/` ni `package.json` en la raíz
- Hay `package.json` separados en `backend/` y `frontend/`
- `sqlite3` es dependencia nativa en `backend/package.json`

---

## PLATAFORMA OBJETIVO

| Entorno | Detalle |
|---|---|
| SO destino | Linux Mint, Ubuntu, Debian y derivados |
| Build | **Compilar en Linux** (misma arquitectura que el destino: x64) |
| Instalador principal | `.deb` (integración con menú del sistema) |
| Instalador alternativo | `.AppImage` (portable, sin instalar) |
| **NO usar** | NSIS, `.exe`, `.msi` ni targets de Windows |

### Dependencias del sistema (documentar al final)
En la máquina de build hace falta:
```bash
sudo apt update
sudo apt install -y build-essential python3 libsqlite3-dev
```
Node.js LTS (18 o 20) y npm deben estar instalados.

---

## QUÉ HAY QUE HACER

### 1. Crear `package.json` en la raíz del proyecto

Unificar scripts de desarrollo y empaquetado. Instalar aquí (como devDependencies):
- `electron`
- `electron-builder`
- `@electron/rebuild`
- `concurrently` (o `npm-run-all`) para levantar todo en dev
- `wait-on` (esperar a que Vite y el backend estén listos antes de abrir Electron)

Scripts mínimos esperados:
- `dev` → levanta frontend (Vite) + backend + Electron en paralelo
- `build:frontend` → `vite build` en `frontend/`
- `build` → compila frontend y empaqueta con electron-builder
- `rebuild` → `@electron/rebuild` para `sqlite3` contra el runtime de Electron
- `postinstall` → ejecutar `rebuild` automáticamente

---

### 2. Crear carpeta `electron/` con el proceso principal

Archivo principal: `electron/main.js` (o `main.cjs` si hace falta por compatibilidad ESM).

#### Responsabilidades del main process

**En desarrollo (`app.isPackaged === false`):**
1. Arrancar el backend como proceso hijo: `node backend/src/index.js`
2. Esperar a que responda `http://localhost:3000/api/health`
3. Abrir `BrowserWindow` apuntando a `http://localhost:5173` (Vite)
4. Al cerrar la app, matar el proceso hijo del backend

**En producción (`app.isPackaged === true`):**
1. Arrancar el backend embebido (mismo `index.js`, empaquetado dentro de `resources/`)
2. Abrir `BrowserWindow` cargando `frontend/dist/index.html` con `loadFile()`
   — **no** usar el servidor de Vite
3. Al cerrar la app, matar el proceso hijo del backend

#### Configuración de seguridad de Electron (obligatorio)
- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true` (si no rompe nada; si rompe, documentar por qué se desactiva)

#### Ventana
- Título: `Óptica Visual`
- Tamaño inicial razonable (ej. 1280×800)
- Ícono de la app desde `frontend/public/` o `electron/assets/`

---

### 3. Base de datos SQLite — path dinámico

**Problema:** en la app empaquetada, `backend/` vive dentro de un directorio de solo lectura (`app.asar` o equivalente). No se puede escribir `database.sqlite` ahí.

**Solución:**

| Modo | Path de la base |
|---|---|
| Desarrollo | Mantener el actual: `backend/database.sqlite` |
| Producción (empaquetado) | `app.getPath('userData')/database.sqlite` |

**Implementación recomendada:**
1. En `electron/main.js`, antes de arrancar el backend, definir la variable de entorno:
   `DATABASE_PATH=<ruta absoluta>`
2. En `backend/src/config/db.js`, leer:
   `process.env.DATABASE_PATH` si existe; si no, usar la ruta relativa actual
3. **Primera ejecución en producción:** si no existe el archivo en `userData`,
   copiar `database.sqlite` de ejemplo (vacío con esquema) o crear la DB con
   `inicializarBaseDeDatos()` — la app ya lo hace al arrancar

**Migración de datos existentes:** si hay datos en `backend/database.sqlite` durante
desarrollo, documentar cómo copiarlos manualmente a `~/.config/Óptica Visual/`
(o el path real de `userData`) antes de probar el empaquetado.

---

### 4. Módulo nativo `sqlite3` — rebuild obligatorio

`sqlite3` debe recompilarse para el ABI de Node que usa Electron, no el de Node del sistema.

1. Configurar `@electron/rebuild` en el `postinstall` del `package.json` raíz
2. Target: el módulo `sqlite3` dentro de `backend/node_modules/`
3. Si falla el rebuild, verificar que `build-essential`, `python3` y `libsqlite3-dev`
   estén instalados en Linux
4. Probar que la app abre la base sin crashear antes de seguir con el empaquetado

**No cambiar a otro driver** (`better-sqlite3`, `sql.js`, etc.) salvo que el rebuild
falle de forma irrecuperable — intentá resolverlo primero.

---

### 5. Frontend — ajustes para empaquetado

#### 5.1 Rutas relativas en Vite
En `frontend/vite.config.js`, agregar:
```js
base: './'
```
Sin esto, los assets (`/assets/...`) se rompen al cargar desde `file://` en Electron.

#### 5.2 Bootstrap sin internet
Hoy Bootstrap e íconos vienen de CDN en `frontend/index.html`. En una app de escritorio
**no puede depender de internet**.

Opciones (elegí una y aplicála):
- **Recomendada:** instalar `bootstrap` y `bootstrap-icons` vía npm en `frontend/`
  e importarlos en `main.jsx` o `index.css`
- Alternativa: copiar los archivos estáticos a `frontend/public/`

Eliminá los `<link>` y `<script>` de CDN del `index.html` una vez empaquetado localmente.

#### 5.3 API URL
Mantener `http://localhost:3000/api` en `axiosInstance.js` — es correcto porque el
backend corre localmente en la misma máquina. No hace falta cambiarlo si el backend
siempre escucha en ese puerto.

---

### 6. `electron-builder` — empaquetado para Linux

Configurar en el `package.json` raíz (sección `"build"`):

```json
{
  "appId": "com.optica.visual",
  "productName": "Óptica Visual",
  "directories": {
    "output": "dist-electron"
  },
  "files": [
    "electron/**/*",
    "backend/**/*",
    "!backend/node_modules/**/*",
    "frontend/dist/**/*"
  ],
  "extraResources": [
    {
      "from": "backend/node_modules",
      "to": "backend/node_modules",
      "filter": ["**/*"]
    }
  ],
  "linux": {
    "target": ["deb", "AppImage"],
    "category": "Office",
    "icon": "electron/assets/icon.png"
  }
}
```

Ajustá `files` y `extraResources` según la estructura real — lo importante es que
`backend/` (con `node_modules` incluyendo `sqlite3` recompilado) y `frontend/dist/`
queden dentro del paquete.

#### Ícono
- Formato: `.png` de 512×512 px (Linux no usa `.ico`)
- Ubicación sugerida: `electron/assets/icon.png`
- Reutilizá `frontend/public/favicon-vision-urbana.png` escalado si hace falta

#### Targets de salida
| Formato | Uso |
|---|---|
| `.deb` | Instalación en Mint/Ubuntu/Debian (`sudo dpkg -i ...`) |
| `.AppImage` | Ejecutable portable sin instalar |

Generar ambos. El `.deb` es el instalador principal para la óptica.

---

### 7. Flujo de arranque esperado (referencia)

```
Usuario abre "Óptica Visual"
        ↓
electron/main.js
        ↓
Define DATABASE_PATH (si empaquetado)
        ↓
Spawn: node backend/src/index.js
        ↓
Espera GET http://localhost:3000/api/health
        ↓
Abre BrowserWindow
        ↓
  Dev  → http://localhost:5173
  Prod → loadFile(frontend/dist/index.html)
        ↓
React llama a http://localhost:3000/api/...
        ↓
SQLite en userData (prod) o backend/ (dev)
```

---

## CÓMO TRABAJAR (instrucciones para la IA)

### Antes de codear
1. Confirmá rama `ia_desarrollo`
2. Leé `backend/src/config/db.js`, `frontend/vite.config.js`,
   `frontend/src/api/axiosInstance.js` y `frontend/index.html`
3. Armá un **plan corto** (5–8 pasos) y mostrámelo antes de empezar

### Durante la implementación
- Ejecutá de corrido; no pidas aprobación en cada archivo chico
- Si aparece un error típico de packaging (rutas rotas, módulo nativo, `file://`),
  resolvelo vos antes de preguntarme
- No reescribas lógica de negocio del backend ni las páginas React existentes
  salvo los ajustes mínimos indicados arriba (Bootstrap local, `base: './'`)

### Pruebas obligatorias antes de dar por terminado
1. `npm run dev` → la ventana de Electron abre y la app funciona
2. Crear un cliente desde la ventana de Electron
3. Cerrar la app completamente
4. Volver a abrir → el cliente sigue ahí (persistencia de SQLite)
5. `npm run build` → genera `.deb` y `.AppImage` sin errores
6. Instalar el `.deb` o ejecutar el `.AppImage` y repetir el test de persistencia

### Entregables al finalizar
1. Captura de pantalla de la app funcionando en la ventana de Electron
2. Captura o confirmación del test de persistencia (crear → cerrar → reabrir)
3. Comandos exactos para:
   - Instalar dependencias del sistema en Linux Mint
   - Correr en modo desarrollo
   - Generar el instalador
   - Instalar el `.deb` en Mint
   - Ejecutar el `.AppImage`
4. Ruta donde quedan los artefactos generados (`dist-electron/`)
5. Ruta de la base de datos en producción (`userData`)

---

## PROBLEMAS CONOCIDOS — resolver sin preguntar primero

| Problema | Solución esperada |
|---|---|
| `sqlite3` crashea al abrir | `@electron/rebuild` + deps de compilación Linux |
| Pantalla en blanco en prod | `base: './'` en Vite + verificar `loadFile` path |
| Estilos rotos sin internet | Bootstrap empaquetado localmente, no CDN |
| Backend no arranca empaquetado | Verificar path a `index.js` con `process.resourcesPath` |
| DB no persiste | Verificar `DATABASE_PATH` apunta a `userData`, no a `app.asar` |
| AppImage no ejecuta en Mint 21+ | Puede faltar `libfuse2`: `sudo apt install libfuse2` |
| Puerto 3000 ocupado | Documentar o usar variable `PORT` en el spawn del backend |

---

## LO QUE NO HACER

- No crear targets de Windows (NSIS, `.exe`)
- No tocar la rama `desarrollo_propio`
- No cambiar endpoints ni esquema de la base de datos
- No reemplazar `sqlite3` por otro driver sin intentar rebuild primero
- No dejar Bootstrap dependiendo del CDN en la versión empaquetada
- No pedir al usuario final que corra `npm`, `node` ni comandos de desarrollo

---

## COMANDOS DE REFERENCIA (completar con los reales al terminar)

```bash
# Dependencias del sistema (Linux Mint / Debian / Ubuntu)
sudo apt update && sudo apt install -y build-essential python3 libsqlite3-dev

# Instalar dependencias del proyecto (desde la raíz)
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Desarrollo (frontend + backend + Electron)
npm run dev

# Build de producción + empaquetado
npm run build

# Instalar el .deb generado
sudo dpkg -i dist-electron/optica-visual_*.deb

# O ejecutar el AppImage
chmod +x dist-electron/Óptica\ Visual-*.AppImage
./dist-electron/Óptica\ Visual-*.AppImage
```

Reemplazá los nombres de archivo exactos por los que genere `electron-builder` al finalizar.
