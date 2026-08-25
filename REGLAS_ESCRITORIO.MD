Ahora quiero convertir este proyecto de web a aplicación de escritorio 
usando Electron, manteniendo TODO lo que ya armamos (backend Express, 
SQLite, frontend React+Bootstrap). Seguí trabajando en la rama 
`ia_desarrollo` únicamente — no toques `desarrollo_propio`. Armá un plan 
corto antes de empezar y mostrámelo.

OBJETIVO
Que la app se abra como un programa de escritorio en Windows (ventana 
nativa, ícono, ejecutable/instalador), sin depender de un navegador ni 
de que el usuario corra comandos manualmente.

QUÉ HAY QUE CAMBIAR
1. Agregar una carpeta electron/ en la raíz con el proceso principal 
   (main.js):
   - En desarrollo: levanta el backend (backend/src/index.js) y abre 
     una BrowserWindow apuntando al servidor de Vite (localhost:5173)
   - En producción: levanta el backend embebido, y la BrowserWindow 
     carga los archivos ya compilados de frontend/dist en vez de un 
     servidor de desarrollo
2. Base de datos: el path de SQLite hoy es 
   path.resolve(_dirname, '../../database.sqlite'), fijo dentro de 
   backend/. Cuando la app esté empaquetada esa carpeta es de solo 
   lectura, así que el path tiene que usar app.getPath('userData') si 
   Electron está empaquetado, y seguir usando la ruta actual en 
   desarrollo
3. sqlite3 es un módulo nativo: configurá @electron/rebuild para que se 
   recompile para el runtime de Electron, si no la app crashea al abrir 
   la base
4. Agregá electron-builder para generar el instalador de Windows 
   (NSIS/.exe), con ícono y nombre de app ("Óptica Visual")
5. Scripts nuevos de package.json: uno para correr todo junto en modo 
   desarrollo (frontend + backend + electron) y otro para generar el 
   build final empaquetado

CÓMO TRABAJAR
- Plan primero, después ejecutá de corrido sin pedir aprobación en cada 
  archivo chico
- Cuando la ventana de Electron abra la app y funcione (crear un 
  cliente, cerrar y volver a abrir para confirmar que la base persiste), 
  sacá una captura y mostrámela
- Si aparece un problema típico de packaging (rutas relativas rotas, 
  módulo nativo, etc.), intentá resolverlo vos antes de preguntarme
- Al final, decime los comandos exactos para generar el instalador y 
  cómo probarlo en mi máquina