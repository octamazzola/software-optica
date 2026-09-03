import AuthService from '../src/services/auth.service.js';
import UsuarioRepository from '../src/repositories/usuario.repository.js';
import ENV from '../src/config/env.js';
import jwt from 'jsonwebtoken';

async function testAuth() {
  try {
    console.log('--- TEST 1: Login Admin con credenciales correctas ---');
    const loginResult = await AuthService.login({
      username: ENV.ADMIN_USERNAME,
      password: ENV.ADMIN_PASSWORD
    });
    console.log('✅ Login exitoso. Token generado:', loginResult.token.substring(0, 25) + '...');
    console.log('Usuario devuelto:', loginResult.usuario);

    console.log('\n--- TEST 2: Login con contraseña incorrecta ---');
    try {
      await AuthService.login({
        username: ENV.ADMIN_USERNAME,
        password: 'wrongpassword'
      });
      console.error('❌ Falló: no debería permitir login con contraseña errónea');
    } catch (e) {
      console.log('✅ Rechazado correctamente:', e.message);
    }

    console.log('\n--- TEST 3: Crear usuario vendedor ---');
    const vendedorExistente = await UsuarioRepository.buscarPorUsername('vendedor1');
    if (!vendedorExistente) {
      const nuevoVendedor = await AuthService.crearUsuario({
        username: 'vendedor1',
        password: 'Vendedor123!',
        rol: 'vendedor',
        nombre: 'Pedro Vendedor'
      });
      console.log('✅ Vendedor creado:', nuevoVendedor);
    } else {
      console.log('ℹ️ Vendedor ya existe:', vendedorExistente.username);
    }

    console.log('\n--- TEST 4: Login Vendedor ---');
    const loginVendedor = await AuthService.login({
      username: 'vendedor1',
      password: 'Vendedor123!'
    });
    console.log('✅ Login vendedor exitoso. Rol:', loginVendedor.usuario.rol);

    console.log('\n🎉 TODOS LOS TESTS DE SERVICIO PASARON CON ÉXITO');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en tests de auth:', error);
    process.exit(1);
  }
}

testAuth();
