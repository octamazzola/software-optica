import http from 'http';
import app from '../src/app.js';
import { inicializarBaseDeDatos } from '../src/config/db.js';
import ENV from '../src/config/env.js';

async function runHttpTests() {
  await inicializarBaseDeDatos();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(3099, resolve));
  const baseUrl = 'http://localhost:3099/api';

  try {
    console.log('\n🔍 [HTTP TEST 1] GET /api/clientes sin token -> debe ser 401');
    const resNoAuth = await fetch(`${baseUrl}/clientes`);
    console.log(`Status: ${resNoAuth.status}`);
    const bodyNoAuth = await resNoAuth.json();
    console.log('Respuesta:', bodyNoAuth);
    if (resNoAuth.status !== 401) throw new Error('Se esperaba status 401');

    console.log('\n🔍 [HTTP TEST 2] POST /api/auth/login con credenciales inválidas -> debe ser 401');
    const resBadLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'bad' })
    });
    console.log(`Status: ${resBadLogin.status}`);
    if (resBadLogin.status !== 401) throw new Error('Se esperaba status 401');

    console.log('\n🔍 [HTTP TEST 3] POST /api/auth/login con credenciales admin válidas -> debe ser 200');
    const resLoginAdmin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ENV.ADMIN_USERNAME, password: ENV.ADMIN_PASSWORD })
    });
    console.log(`Status: ${resLoginAdmin.status}`);
    const adminData = await resLoginAdmin.json();
    console.log('Admin Token recibido:', adminData.token ? 'Sí' : 'No');
    console.log('Usuario:', adminData.usuario);
    const adminToken = adminData.token;

    console.log('\n🔍 [HTTP TEST 4] GET /api/clientes con token admin -> debe ser 200');
    const resClientes = await fetch(`${baseUrl}/clientes`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Status: ${resClientes.status}`);
    const clientes = await resClientes.json();
    console.log(`Clientes encontrados: ${clientes.length}`);
    if (resClientes.status !== 200) throw new Error('Se esperaba status 200');

    console.log('\n🔍 [HTTP TEST 5] POST /api/auth/login con vendedor -> debe ser 200');
    const resLoginVendedor = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'vendedor1', password: 'Vendedor123!' })
    });
    const vendedorData = await resLoginVendedor.json();
    const vendedorToken = vendedorData.token;

    console.log('\n🔍 [HTTP TEST 6] DELETE /api/clientes/1 con rol vendedor -> debe ser 403');
    const resDeleteVendedor = await fetch(`${baseUrl}/clientes/1`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${vendedorToken}` }
    });
    console.log(`Status: ${resDeleteVendedor.status}`);
    const bodyForbidden = await resDeleteVendedor.json();
    console.log('Respuesta:', bodyForbidden);
    if (resDeleteVendedor.status !== 403) throw new Error('Se esperaba status 403');

    console.log('\n🔍 [HTTP TEST 7] GET /api/auth/me con token -> debe ser 200');
    const resMe = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Status: ${resMe.status}`);
    const meData = await resMe.json();
    console.log('Perfil obtenido:', meData.username, meData.rol);
    if (resMe.status !== 200) throw new Error('Se esperaba status 200');

    console.log('\n🎉 TODOS LOS TESTS HTTP / API PASARON PERFECTAMENTE!');
  } finally {
    server.close();
  }
}

runHttpTests().catch((err) => {
  console.error('❌ Error en pruebas HTTP:', err);
  process.exit(1);
});
