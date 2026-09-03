import 'dotenv/config';
import app from './app.js';
import { inicializarBaseDeDatos } from './config/db.js';
import ENV from './config/env.js';

const PORT = ENV.PORT || 3000;

async function startServer() {
    try {
        await inicializarBaseDeDatos();
        const server = app.listen(PORT, () => {
            console.log(`=============================================`);
            console.log(`🚀 Servidor de la óptica encendido con éxito`);
            console.log(`👉 Ejecutándose en: http://localhost:${PORT}`);
            console.log(`👉 Prueba la salud del servidor en: http://localhost:${PORT}/api/health`);
            console.log(`=============================================`);
        });

        server.on('error', (err) => {
            console.error('❌ Error en el servidor HTTP:', err.message);
        });
    } catch (error) {
        console.error('❌ Error crítico al arrancar el servidor:', error.message);
        process.exit(1);
    }
}

startServer();
