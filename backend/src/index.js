import 'dotenv/config';
import app from './app.js';
import { inicializarBaseDeDatos } from './config/db.js'

const PORT = process.env.PORT || 3000;


async function startServer() {
    try {
        await inicializarBaseDeDatos();
        app.listen(PORT, () => {
            console.log(`=============================================`);
            console.log(`🚀 Servidor de la óptica encendido con éxito`);
            console.log(`👉 Ejecutándose en: http://localhost:${PORT}`);
            console.log(`👉 Prueba la salud del servidor en: http://localhost:${PORT}/api/health`);
            console.log(`=============================================`);
        });
    } catch (error) {
        console.log(' Error critico al arrancar el servidor', error.message)
        process.exit(1);
    }
}

startServer()





// Iniciamos la escucha del servidor en el puerto indicado

