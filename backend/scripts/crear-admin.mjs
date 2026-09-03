import bcrypt from 'bcryptjs';
import { inicializarBaseDeDatos, dbQuery, dbRun } from '../src/config/db.js';
import ENV from '../src/config/env.js';

async function seedAdmin() {
  try {
    await inicializarBaseDeDatos();
    console.log('Verificando usuario administrador...');
    const users = await dbQuery('SELECT id, username, rol FROM usuarios WHERE username = ?', [ENV.ADMIN_USERNAME]);

    if (users.length > 0) {
      console.log(`ℹ️ El usuario administrador '${ENV.ADMIN_USERNAME}' ya existe (ID: ${users[0].id}, Rol: ${users[0].rol}).`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ENV.ADMIN_PASSWORD, ENV.BCRYPT_ROUNDS);
    const result = await dbRun(
      'INSERT INTO usuarios (username, password, rol, nombre, activo) VALUES (?, ?, ?, ?, 1)',
      [ENV.ADMIN_USERNAME, hashedPassword, 'admin', ENV.ADMIN_NOMBRE]
    );

    console.log(`✅ Usuario administrador creado con éxito (ID: ${result.id}, Username: ${ENV.ADMIN_USERNAME}).`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando el usuario administrador:', error.message);
    process.exit(1);
  }
}

seedAdmin();
