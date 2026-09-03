import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { inicializarBaseDeDatos } from '../src/config/db.js'
import { beforeAll } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

beforeAll(async () => {
    // Asegurar que estamos en entorno de prueba
    process.env.NODE_ENV = 'test';
    
    const dbPath = path.resolve(__dirname, '../../database.test.sqlite')
    // Borramos la BD de test si existe para arrancar limpio
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath)
    }
    
    // Esto creará las tablas y datos semilla
    await inicializarBaseDeDatos()
})
