import axios from 'axios';

const [,, username, password, nombre = 'Administrador', apiUrl = 'https://software-optica.onrender.com/api'] = process.argv;

if (!username || !password) {
  console.log('\nℹ️ Uso: node scripts/crear-admin-remoto.mjs <nuevo_usuario> <nueva_contraseña> [nombre_completo] [api_url]');
  console.log('Ejemplo: node scripts/crear-admin-remoto.mjs octavio MiClave123! "Octavio Mazzola"\n');
  console.log('Requisitos de la contraseña:');
  console.log('- Al menos 8 caracteres');
  console.log('- Al menos 1 mayúscula (A-Z)');
  console.log('- Al menos 1 minúscula (a-z)');
  console.log('- Al menos 1 número (0-9)\n');
  process.exit(1);
}

async function crearAdminRemoto() {
  try {
    console.log(`\n⏳ 1. Iniciando sesión como admin en ${apiUrl}...`);
    const loginRes = await axios.post(`${apiUrl}/auth/login`, {
      username: 'admin',
      password: 'Admin123!'
    });

    const token = loginRes.data.token;
    console.log('✅ Sesión iniciada como admin.');

    console.log(`⏳ 2. Creando nuevo usuario administrador '${username}'...`);
    const res = await axios.post(
      `${apiUrl}/auth/usuarios`,
      {
        username,
        password,
        rol: 'admin',
        nombre
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log(`\n🎉 ¡Usuario administrador creado con éxito!`);
    console.log(`- Usuario:    ${res.data.usuario.username}`);
    console.log(`- Nombre:     ${res.data.usuario.nombre}`);
    console.log(`- Rol:        ${res.data.usuario.rol}`);
    console.log(`- ID:         ${res.data.usuario.id}`);
    console.log('\nYa podés ingresar a la página con estas credenciales.\n');
  } catch (error) {
    console.error('\n❌ Error al crear usuario:', error.response?.data?.error || error.message);
  }
}

crearAdminRemoto();
