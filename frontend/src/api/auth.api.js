import axiosInstancia from './axiosInstance';

export const loginApi = async (credenciales) => {
  const respuesta = await axiosInstancia.post('/auth/login', credenciales);
  return respuesta.data;
};

export const getPerfilApi = async () => {
  const respuesta = await axiosInstancia.get('/auth/me');
  return respuesta.data;
};

export const listarUsuariosApi = async () => {
  const respuesta = await axiosInstancia.get('/auth/usuarios');
  return respuesta.data;
};

export const crearUsuarioApi = async (datosUsuario) => {
  const respuesta = await axiosInstancia.post('/auth/usuarios', datosUsuario);
  return respuesta.data;
};
