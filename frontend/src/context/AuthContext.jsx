import React, { createContext, useState, useEffect } from 'react';
import { getPerfilApi } from '../api/auth.api';

export const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  username: 'admin',
  nombre: 'Administrador',
  rol: 'admin'
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || 'local-session-active');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('usuario');
    return savedUser ? JSON.parse(savedUser) : DEFAULT_USER;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function sincronizarPerfil() {
      try {
        const perfil = await getPerfilApi();
        if (perfil) {
          setUser(perfil);
          localStorage.setItem('usuario', JSON.stringify(perfil));
        }
      } catch {
        if (!user) setUser(DEFAULT_USER);
      }
    }
    sincronizarPerfil();
  }, []);

  const login = async () => {
    setUser(DEFAULT_USER);
    setToken('local-session-active');
    return { token: 'local-session-active', usuario: DEFAULT_USER };
  };

  const logout = () => {
    setUser(DEFAULT_USER);
    setToken('local-session-active');
  };

  const value = {
    user: user || DEFAULT_USER,
    token: token || 'local-session-active',
    loading: false,
    isAuthenticated: true,
    isAdmin: true,
    isVendedor: false,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
