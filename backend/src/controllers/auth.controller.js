import AuthService from '../services/auth.service.js';

const AuthController = {
  async login(req, res) {
    const { username, password } = req.body;
    const resultado = await AuthService.login({ username, password });
    res.json(resultado);
  },

  async me(req, res) {
    const perfil = await AuthService.obtenerPerfil(req.user.id);
    res.json(perfil);
  },

  async crearUsuario(req, res) {
    const { username, password, rol, nombre } = req.body;
    const nuevoUsuario = await AuthService.crearUsuario({ username, password, rol, nombre });
    res.status(201).json({
      message: 'Usuario registrado con éxito.',
      usuario: nuevoUsuario
    });
  },

  async listarUsuarios(req, res) {
    const usuarios = await AuthService.listarUsuarios();
    res.json(usuarios);
  }
};

export default AuthController;
