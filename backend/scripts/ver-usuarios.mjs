import { dbQuery } from '../src/config/db.js';

async function verUsuarios() {
  try {
    const usuarios = await dbQuery('SELECT id, username, rol, nombre, activo, creado_en FROM usuarios');
    console.log('\n📋 LISTADO DE USUARIOS REGISTRADOS:');
    console.table(usuarios);
    process.exit(0);
  } catch (error) {
    console.error('Error al consultar usuarios:', error.message);
    process.exit(1);
  }
}

verUsuarios();
