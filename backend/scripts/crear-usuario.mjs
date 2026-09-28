import bcrypt from 'bcryptjs';
import { dbQuery, dbRun } from '../src/config/db.js';
import ENV from '../src/config/env.js';

const [,, username, password, rol = 'vendedor', nombre = 'Usuario'] = process.argv;

if (!username || !password) {
  console.log('ℹ️ Uso: node scripts/crear-usuario.mjs <username> <password> [rol: admin|vendedor] [nombre]');
  console.log('Ejemplo: node scripts/crear-usuario.mjs maria Clave123! vendedor "Maria Gomez"');
  process.exit(1);
}

if (!['admin', 'vendedor'].includes(rol)) {
  console.error("❌ El rol debe ser 'admin' o 'vendedor'.");
  process.exit(1);
}

async function crearUsuario() {
  try {
    const existentes = await dbQuery('SELECT id FROM usuarios WHERE username = ?', [username]);
    if (existentes.length > 0) {
      console.error(`❌ El usuario '${username}' ya existe.`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, ENV.BCRYPT_ROUNDS);
    await dbRun(
      'INSERT INTO usuarios (username, password, rol, nombre, activo) VALUES (?, ?, ?, ?, 1)',
      [username, hashedPassword, rol, nombre]
    );

    console.log(`✅ Usuario '${username}' creado con éxito con rol '${rol}'.`);
    process.exit(0);
  } catch (error) {
    console.error('Error al crear usuario:', error.message);
    process.exit(1);
  }
}

crearUsuario();
