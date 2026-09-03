import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/usuario.repository.js';
import ENV from '../config/env.js';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const AuthService = {
  async login({ username, password }) {
    if (!username || !password) {
      const error = new Error('Usuario y contraseña son requeridos.');
      error.status = 400;
      throw error;
    }

    const usuario = await UsuarioRepository.buscarPorUsername(username.trim());
    if (!usuario) {
      const error = new Error('Credenciales inválidas.');
      error.status = 401;
      throw error;
    }

    if (!usuario.activo) {
      const error = new Error('El usuario se encuentra inactivo.');
      error.status = 403;
      throw error;
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      const error = new Error('Credenciales inválidas.');
      error.status = 401;
      throw error;
    }

    const payload = {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      nombre: usuario.nombre
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN
    });

    return {
      token,
      usuario: payload
    };
  },

  async obtenerPerfil(id) {
    const usuario = await UsuarioRepository.buscarPorId(id);
    if (!usuario) {
      const error = new Error('Usuario no encontrado.');
      error.status = 404;
      throw error;
    }
    return usuario;
  },

  async crearUsuario({ username, password, rol = 'vendedor', nombre }) {
    if (!username || username.trim().length < 3) {
      const error = new Error('El nombre de usuario debe tener al menos 3 caracteres.');
      error.status = 400;
      throw error;
    }

    if (!nombre || nombre.trim().length < 2) {
      const error = new Error('El nombre es obligatorio.');
      error.status = 400;
      throw error;
    }

    if (!password || !PASSWORD_REGEX.test(password)) {
      const error = new Error(
        'La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.'
      );
      error.status = 400;
      throw error;
    }

    const rolValido = ['admin', 'vendedor'].includes(rol);
    if (!rolValido) {
      const error = new Error("El rol debe ser 'admin' o 'vendedor'.");
      error.status = 400;
      throw error;
    }

    const existente = await UsuarioRepository.buscarPorUsername(username.trim());
    if (existente) {
      const error = new Error('El nombre de usuario ya está registrado.');
      error.status = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, ENV.BCRYPT_ROUNDS);
    const nuevoId = await UsuarioRepository.crear({
      username: username.trim(),
      password: hashedPassword,
      rol,
      nombre: nombre.trim()
    });

    return await this.obtenerPerfil(nuevoId);
  },

  async listarUsuarios() {
    return await UsuarioRepository.listar();
  }
};

export default AuthService;
