import React, { createContext, useState, useEffect } from 'react';
import { loginApi, getPerfilApi } from '../api/auth.api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('usuario');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verificarSesion() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const perfil = await getPerfilApi();
          setUser(perfil);
          localStorage.setItem('usuario', JSON.stringify(perfil));
        } catch {
          // Si el token es inválido o expiró, limpiamos la sesión
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }

    verificarSesion();
  }, []);

  const login = async (username, password) => {
    const data = await loginApi({ username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setToken(data.token);
    setUser(data.usuario);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.rol === 'admin',
    isVendedor: user?.rol === 'vendedor',
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
