import { dbRun, inicializarBaseDeDatos } from '../src/config/db.js'
import { beforeAll } from 'vitest'

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    
    try {
        await dbRun('DROP TABLE IF EXISTS auditoria');
        await dbRun('DROP TABLE IF EXISTS graduaciones');
        await dbRun('DROP TABLE IF EXISTS detalle_ventas');
        await dbRun('DROP TABLE IF EXISTS ventas');
        await dbRun('DROP TABLE IF EXISTS cristales');
        await dbRun('DROP TABLE IF EXISTS productos');
        await dbRun('DROP TABLE IF EXISTS clientes');
        await dbRun('DROP TABLE IF EXISTS usuarios');
        await dbRun('DROP TABLE IF EXISTS configuracion');
    } catch (e) {
        // ignorar
    }
    
    // Esto creará las tablas y datos semilla
    await inicializarBaseDeDatos()
})
