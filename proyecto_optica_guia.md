
# Guía Completa de Reconstrucción: Óptica Visual (Gestión Integrada)

Esta documentación detalla paso a paso cómo recrear el sistema de gestión para la Óptica, dividido en un **Frontend** (React + Vite + Bootstrap) y un **Backend** (Node.js + Express + SQLite3).

---

## 1. Arquitectura General y Stack Tecnológico

El proyecto está diseñado siguiendo buenas prácticas de separación de responsabilidades:
*   **Frontend**: Aplicación de página única (SPA) creada con **React** y construida con **Vite**. Se utiliza **Bootstrap 5.3 (CSS/JS)** por medio de CDN para el diseño visual responsivo y estilizado, y **Axios** para conectar con la API del backend. Cuenta con rutas privadas y protegidas por roles.
*   **Backend**: Servidor RESTful desarrollado con **Node.js** y **Express**. Se estructura mediante una **arquitectura de capas** (Rutas -> Middlewares -> Controladores -> Servicios -> Modelos). Utiliza **SQLite3** como motor de base de datos relacional ligero (con claves foráneas activadas) y **JWT (JSON Web Tokens)** para la seguridad de sesión.

---

## 2. Estructura de Directorios

El árbol de directorios del proyecto finalizado luce de la siguiente manera:

```text
Nueva carpeta/
├── frontend/
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/
│       │   ├── axiosInstance.js
│       │   ├── auth.api.js
│       │   ├── clientes.api.js
│       │   ├── productos.api.js
│       │   ├── recetas.api.js
│       │   └── ventas.api.js
│       ├── components/
│       │   └── common/
│       │       ├── ErrorMessage.jsx
│       │       ├── Layout.jsx
│       │       ├── LoadingSpinner.jsx
│       │       ├── Navbar.jsx
│       │       └── Sidebar.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── useAuth.js
│       ├── pages/
│       │   ├── ClientesPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── NotFoundPage.jsx
│       │   ├── ProductosPage.jsx
│       │   ├── VentaFormPage.jsx
│       │   └── VentasHistorialPage.jsx
│       └── router/
│           ├── AdminRoute.jsx
│           ├── AppRouter.jsx
│           └── PrivateRoute.jsx
└── backend/
    ├── .env
    ├── package.json
    ├── database.sqlite
    └── src/
        ├── app.js
        ├── index.js
        ├── seed.js
        ├── config/
        │   ├── db.js
        │   └── env.js
        ├── controllers/
        │   ├── auth.controller.js
        │   ├── cliente.controller.js
        │   ├── producto.controller.js
        │   ├── receta.controller.js
        │   └── venta.controller.js
        ├── middlewares/
        │   ├── auth.middleware.js
        │   ├── errorHandler.middleware.js
        │   ├── roles.middleware.js
        │   └── validate.middleware.js
        ├── models/
        │   ├── cliente.model.js
        │   ├── producto.model.js
        │   ├── receta.model.js
        │   ├── usuario.model.js
        │   └── venta.model.js
        ├── routes/
        │   ├── auth.routes.js
        │   ├── cliente.routes.js
        │   ├── producto.routes.js
        │   ├── receta.routes.js
        │   └── venta.routes.js
        └── services/
            ├── auth.service.js
            ├── cliente.service.js
            ├── producto.service.js
            ├── receta.service.js
            └── venta.service.js
```

---

## 3. Fase 1: Desarrollo del Frontend (React + Vite)

El frontend se encarga de pintar las vistas, procesar la lógica de ventas (carrito, filtros avanzados de cristales) y gestionar la sesión.

### Paso 1.1: Inicializar el proyecto e instalar dependencias
Crear una carpeta `frontend` y ejecutar dentro:
```bash
npm create vite@latest . -- --template react
npm install react-router-dom axios
```

### Paso 1.2: Configurar archivos base del entorno

#### `frontend/package.json`
El archivo de dependencias debe quedar configurado de esta forma:
```json
{
  "name": "optica-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.2.11"
  }
}
```

#### `frontend/.env`
Define la URL de conexión con la API del backend:
```env
VITE_API_URL=http://localhost:3000
```

#### `frontend/vite.config.js`
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

#### `frontend/index.html`
Carga la tipografía premium **Outfit**, los estilos y scripts interactivos de **Bootstrap 5.3.3** y **Bootstrap Icons** desde CDNs:
```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👓</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Óptica Visual - Gestión Integrada</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  </head>
  <body>
    <div id="root"></div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Paso 1.3: Definición del Sistema de Diseño (Estilos personalizados)

#### `frontend/src/index.css`
Aplica variables CSS para consistencia de colores, sombras y vistas especiales como la Ficha de Laboratorio (simulando un ticket troquelado físico):
```css
:root {
  --primary-color: #1a365d;
  --secondary-color: #2b6cb0;
  --accent-color: #00b4d8;
  --bg-color: #f7fafc;
  --sidebar-width: 280px;
  --dark-blue: #0f172a;
  --soft-gray: #cbd5e1;
}

body {
  font-family: 'Outfit', sans-serif;
  background-color: var(--bg-color);
  color: #334155;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#wrapper {
  min-height: 100vh;
}

#sidebar-wrapper {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background-color: var(--dark-blue);
  color: #fff;
  transition: margin 0.25s ease-out;
  display: flex;
  flex-direction: column;
}

#sidebar-wrapper .sidebar-heading {
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid #1e293b;
}

#sidebar-wrapper .list-group-item {
  color: #94a3b8;
  background-color: transparent;
  border: none;
  padding: 0.85rem 1.25rem;
  border-radius: 0.5rem;
  margin-bottom: 0.35rem;
  transition: all 0.2s ease-in-out;
  font-weight: 500;
  cursor: pointer;
}

#sidebar-wrapper .list-group-item:hover {
  color: #fff;
  background-color: #1e293b;
}

#sidebar-wrapper .list-group-item.active {
  color: #fff;
  background-color: var(--accent-color);
  box-shadow: 0 4px 15px rgba(0, 180, 216, 0.4);
}

.text-cyan {
  color: var(--accent-color);
}

.pulse-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #22c55e;
  border-radius: 50%;
  margin-right: 6px;
  box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

#page-content-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.card {
  border-radius: 12px;
  border: 1px solid var(--soft-gray);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05) !important;
}

.bg-gradient-blue {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.bg-white-10 {
  background-color: rgba(255, 255, 255, 0.15);
}

.stat-icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.ticket-form {
  border: 2px solid #cbd5e1;
  border-radius: 16px;
  position: relative;
  background-image: radial-gradient(circle, #f8fafc 10%, transparent 11%);
  background-size: 20px 20px;
  background-color: #ffffff;
}

.ticket-form::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, var(--accent-color) 0%, var(--primary-color) 100%);
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
}

.border-dashed {
  border-top: 2px dashed var(--soft-gray) !important;
}

.header-prescription th {
  background-color: var(--primary-color) !important;
  color: white !important;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 6px;
}

.header-prescription td {
  padding: 4px;
}

.header-prescription input {
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-weight: 600;
  color: var(--primary-color);
}

.header-prescription input:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 0 0 5px rgba(0, 180, 216, 0.3);
}

.border-bottom-dark {
  border-bottom: 2px solid #475569 !important;
}

.avatar-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 991.98px) {
  #sidebar-wrapper { margin-left: -280px; }
  #wrapper.toggled #sidebar-wrapper { margin-left: 0; }
}
```

### Paso 1.4: Integración API e Instancia de Axios

#### `frontend/src/api/axiosInstance.js`
Configura los interceptores para inyectar automáticamente el Token JWT y limpiar el almacenamiento si la sesión expira (códigos HTTP 401/403):
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

#### `frontend/src/api/auth.api.js`
```javascript
import axiosInstance from './axiosInstance';

export const loginApi = async (username, password) => {
  const res = await axiosInstance.post('/api/auth/login', { username, password });
  return res.data;
};

export const getProfileApi = async () => {
  const res = await axiosInstance.get('/api/auth/profile');
  return res.data;
};
```

#### `frontend/src/api/clientes.api.js`
```javascript
import axiosInstance from './axiosInstance';

export const getClientesApi = async (buscar = '') => {
  const res = await axiosInstance.get(`/api/clientes?buscar=${buscar}`);
  return res.data;
};

export const getClienteByIdApi = async (id) => {
  const res = await axiosInstance.get(`/api/clientes/${id}`);
  return res.data;
};

export const crearClienteApi = async (datos) => {
  const res = await axiosInstance.post('/api/clientes', datos);
  return res.data;
};

export const actualizarClienteApi = async (id, datos) => {
  const res = await axiosInstance.put(`/api/clientes/${id}`, datos);
  return res.data;
};

export const eliminarClienteApi = async (id) => {
  const res = await axiosInstance.delete(`/api/clientes/${id}`);
  return res.data;
};

export const getClienteHistorialApi = async (id) => {
  const res = await axiosInstance.get(`/api/clientes/${id}/historial`);
  return res.data;
};

export const getClienteRecetasApi = async (id) => {
  const res = await axiosInstance.get(`/api/clientes/${id}/recetas`);
  return res.data;
};
```

#### `frontend/src/api/productos.api.js`
```javascript
import axiosInstance from './axiosInstance';

export const getProductosApi = async (buscar = '', tipo = '') => {
  const res = await axiosInstance.get(`/api/productos?buscar=${buscar}&tipo=${tipo}`);
  return res.data;
};

export const crearProductoApi = async (datos) => {
  const res = await axiosInstance.post('/api/productos', datos);
  return res.data;
};

export const actualizarProductoApi = async (id, datos) => {
  const res = await axiosInstance.put(`/api/productos/${id}`, datos);
  return res.data;
};

export const eliminarProductoApi = async (id) => {
  const res = await axiosInstance.delete(`/api/productos/${id}`);
  return res.data;
};
```

#### `frontend/src/api/recetas.api.js`
```javascript
import axiosInstance from './axiosInstance';

export const crearRecetaApi = async (datos) => {
  const res = await axiosInstance.post('/api/recetas', datos);
  return res.data;
};

export const getRecetaByIdApi = async (id) => {
  const res = await axiosInstance.get(`/api/recetas/${id}`);
  return res.data;
};
```

#### `frontend/src/api/ventas.api.js`
```javascript
import axiosInstance from './axiosInstance';

export const registrarVentaApi = async (datos) => {
  const res = await axiosInstance.post('/api/ventas', datos);
  return res.data;
};

export const getVentasApi = async () => {
  const res = await axiosInstance.get('/api/ventas');
  return res.data;
};

export const getDashboardStatsApi = async () => {
  const res = await axiosInstance.get('/api/ventas/dashboard/stats');
  return res.data;
};
```

### Paso 1.5: Contexto de Autenticación global

#### `frontend/src/context/AuthContext.jsx`
```javascript
import React, { createContext, useState, useEffect } from 'react';
import { loginApi } from '../api/auth.api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(username, password);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error al iniciar sesión.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        setUser(null);
        setToken(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### `frontend/src/context/useAuth.js`
```javascript
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
```

### Paso 1.6: Sistema de Rutas y Seguridad

#### `frontend/src/router/PrivateRoute.jsx`
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};
```

#### `frontend/src/router/AdminRoute.jsx`
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.rol === 'admin' ? children : <Navigate to="/" replace />;
};
```

#### `frontend/src/router/AppRouter.jsx`
```javascript
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ClientesPage } from '../pages/ClientesPage';
import { ProductosPage } from '../pages/ProductosPage';
import { VentaFormPage } from '../pages/VentaFormPage';
import { VentasHistorialPage } from '../pages/VentasHistorialPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } />
        
        <Route path="/clientes" element={
          <PrivateRoute>
            <ClientesPage />
          </PrivateRoute>
        } />
        
        <Route path="/productos" element={
          <PrivateRoute>
            <ProductosPage />
          </PrivateRoute>
        } />
        
        <Route path="/nueva-venta" element={
          <PrivateRoute>
            <VentaFormPage />
          </PrivateRoute>
        } />
        
        <Route path="/ventas" element={
          <PrivateRoute>
            <VentasHistorialPage />
          </PrivateRoute>
        } />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### Paso 1.7: Componentes Comunes de Diseño

#### `frontend/src/components/common/ErrorMessage.jsx`
```javascript
import React from 'react';

export const ErrorMessage = ({ message }) => {
  return (
    <div className="alert alert-danger d-flex align-items-center gap-2 border-0 shadow-sm" role="alert">
      <i className="bi bi-exclamation-triangle-fill"></i>
      <div>{message}</div>
    </div>
  );
};
```

#### `frontend/src/components/common/LoadingSpinner.jsx`
```javascript
import React from 'react';

export const LoadingSpinner = () => {
  return (
    <div className="d-flex align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );
};
```

#### `frontend/src/components/common/Navbar.jsx`
```javascript
import React from 'react';
import { useAuth } from '../../context/useAuth';

export const Navbar = () => {
  const { user } = useAuth();
  
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const currentDate = new Date().toLocaleDateString('es-ES', options);

  const toggleSidebar = (e) => {
    e.preventDefault();
    document.getElementById('wrapper').classList.toggle('toggled');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 py-3">
      <div className="container-fluid p-0">
        <button className="btn btn-outline-secondary d-lg-none" onClick={toggleSidebar}>
          <i className="bi bi-list"></i>
        </button>
        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="text-muted d-none d-md-inline">{currentDate}</span>
          <div className="profile-badge">
            <i className="bi bi-person-circle fs-4 text-primary"></i>
            <span className="fw-semibold ms-2">{user?.nombre || 'Usuario'}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
```

#### `frontend/src/components/common/Sidebar.jsx`
```javascript
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="border-end" id="sidebar-wrapper">
      <div className="sidebar-heading d-flex align-items-center gap-2">
        <i className="bi bi-eye-fill fs-3 text-cyan"></i>
        <div>
          <h5 className="m-0 fw-bold tracking-tight">ÓPTICA VISUAL</h5>
          <small className="text-muted">Panel de Gestión</small>
        </div>
      </div>
      
      <div className="list-group list-group-flush px-3 py-2 flex-grow-1">
        <NavLink to="/" className={({ isActive }) => `list-group-item list-group-item-action nav-btn ${isActive ? 'active' : ''}`}>
          <i className="bi bi-grid-1x2-fill me-3"></i>Dashboard
        </NavLink>
        <NavLink to="/clientes" className={({ isActive }) => `list-group-item list-group-item-action nav-btn ${isActive ? 'active' : ''}`}>
          <i className="bi bi-people-fill me-3"></i>Clientes
        </NavLink>
        <NavLink to="/productos" className={({ isActive }) => `list-group-item list-group-item-action nav-btn ${isActive ? 'active' : ''}`}>
          <i className="bi bi-box-seam-fill me-3"></i>Inventario
        </NavLink>
        <NavLink to="/nueva-venta" className={({ isActive }) => `list-group-item list-group-item-action nav-btn ${isActive ? 'active' : ''}`}>
          <i className="bi bi-cart-plus-fill me-3"></i>Nueva Venta
        </NavLink>
        <NavLink to="/ventas" className={({ isActive }) => `list-group-item list-group-item-action nav-btn ${isActive ? 'active' : ''}`}>
          <i className="bi bi-receipt-cutoff me-3"></i>Historial Ventas
        </NavLink>
      </div>

      <div className="sidebar-footer p-3 border-top bg-dark-blue">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="text-truncate" style={{ maxWidth: '160px' }}>
            <div className="fw-semibold text-white text-truncate">{user?.nombre}</div>
            <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>{user?.rol}</small>
          </div>
          <button onClick={logout} className="btn btn-sm btn-outline-danger" title="Cerrar sesión">
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
        <div className="text-center">
          <span className="badge bg-success-subtle text-success py-2 px-3 rounded-pill fw-medium w-100">
            <span className="pulse-indicator"></span> Servidor Online
          </span>
        </div>
      </div>
    </div>
  );
};
```

#### `frontend/src/components/common/Layout.jsx`
```javascript
import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout = ({ children }) => {
  return (
    <div className="d-flex" id="wrapper">
      <Sidebar />
      <div id="page-content-wrapper">
        <Navbar />
        <div className="container-fluid p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Layout;
```

### Paso 1.8: Desarrollo de las Páginas del Sistema

#### `frontend/src/pages/LoginPage.jsx`
Pantalla de acceso con un card moderno, campos validados y recordatorio de credenciales de demostración. (Ver código en `LoginPage.jsx` existente).

#### `frontend/src/pages/DashboardPage.jsx`
Página inicial que resume mediante cards: Ingresos Totales, Cantidad de Clientes, Ventas Realizadas e Inventario. Brinda accesos rápidos. (Ver código en `DashboardPage.jsx` existente).

#### `frontend/src/pages/ClientesPage.jsx`
Gestiona clientes de manera integral. Permite registrar o editar datos, buscar dinámicamente y abrir una **Ficha/Historial Clínico** en un modal. Este historial muestra las compras realizadas y la graduación de sus recetas. (Ver código en `ClientesPage.jsx` existente).

#### `frontend/src/pages/ProductosPage.jsx`
Inventario de productos. Muestra tipos (Armazón, Cristal, Lente de contacto), marcas, precios y stock disponible. Alerta en amarillo si el stock es crítico (menor o igual a 3). Sólo administradores pueden crear, modificar o eliminar. (Ver código en `ProductosPage.jsx` existente).

#### `frontend/src/pages/VentaFormPage.jsx`
La página con más lógica. Permite:
1.  Seleccionar el cliente.
2.  Filtrar productos por Categoría, Material, Tratamiento y Tipo de Lente (Stock o Laboratorio) mediante una barra de búsqueda inteligente.
3.  Agregar elementos al carrito de compra.
4.  Cargar una **Ficha de Laboratorio / Receta de Pedido** de cristales de laboratorio. Esta ficha emula un ticket físico dividida en: Lentes (Ojo Derecho e Izquierdo, Lejos y Cerca, con parámetros Esférico, Cilíndrico, Eje, Diámetro), Montaje y Centrado (Distancia Pupilares Lejos/Cerca, Altura y Prismas), Talón de Depósito (Bases y Adición) y datos de control (Nº de Pedido, Fecha de Entrega/Prometida, Tomado Por, y material seleccionado mediante botones radiales).
5.  Confirmar la venta, lo que envía la información al backend, resta el stock de los productos vendidos y vincula la receta. (Ver código completo en `VentaFormPage.jsx`).

#### `frontend/src/pages/VentasHistorialPage.jsx`
Historial cronológico de transacciones. Permite ver el ID de la venta, fecha/hora formateada localmente, cliente y el total facturado, indicando si cuenta con una receta vinculada. (Ver código en `VentasHistorialPage.jsx` existente).

#### `frontend/src/pages/NotFoundPage.jsx`
Visualización por defecto ante rutas inexistentes.

### Paso 1.9: Puntos de Entrada de la Aplicación

#### `frontend/src/App.jsx`
```javascript
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './router/AppRouter';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
```

#### `frontend/src/main.jsx`
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## 4. Fase 2: Desarrollo del Backend (Node.js + Express + SQLite3)

El backend expone endpoints protegidos para almacenar y consultar la base de datos de manera relacional.

### Paso 2.1: Inicializar proyecto backend
Crear una carpeta `backend` y ejecutar:
```bash
npm init -y
npm install express cors dotenv sqlite3 bcryptjs jsonwebtoken
```

### Paso 2.2: Configurar variables de entorno y Express

#### `backend/package.json`
```json
{
  "name": "optica-backend",
  "version": "1.0.0",
  "description": "Backend API para Óptica con Arquitectura de Capas",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "sqlite3": "^5.1.7"
  }
}
```

#### `backend/.env`
```env
PORT=3000
JWT_SECRET=secreto_de_la_optica_visual_123
NODE_ENV=development
```

#### `backend/src/config/env.js`
Carga y valida los entornos:
```javascript
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'fallbacksecretkey',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
```

### Paso 2.3: Configuración de la Base de Datos SQLite

#### `backend/src/config/db.js`
Crea una conexión con la base de datos local `database.sqlite`, activa claves foráneas mediante `PRAGMA foreign_keys = ON` y provee métodos promisificados (`run`, `get`, `all`):
```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos SQLite:', err.message);
  } else {
    db.run('PRAGMA foreign_keys = ON', (pragmaErr) => {
      if (pragmaErr) {
        console.error('Error al activar PRAGMA foreign_keys:', pragmaErr.message);
      } else {
        console.log('Conectado a SQLite. Claves foráneas activadas.');
      }
    });
  }
});

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = { db, run, get, all };
```

### Paso 2.4: Capa de Modelos (Esquemas de Tablas y Consultas SQL)

#### `backend/src/models/usuario.model.js`
```javascript
const { run, get, all } = require('../config/db');

const UsuarioModel = {
  createTable: async () => {
    return run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        rol TEXT NOT NULL DEFAULT 'vendedor',
        nombre TEXT NOT NULL
      )
    `);
  },
  findByUsername: async (username) => get('SELECT * FROM usuarios WHERE username = ?', [username]),
  findById: async (id) => get('SELECT id, username, rol, nombre FROM usuarios WHERE id = ?', [id]),
  create: async ({ username, password, rol, nombre }) => {
    return run(
      'INSERT INTO usuarios (username, password, rol, nombre) VALUES (?, ?, ?, ?)',
      [username, password, rol, nombre]
    );
  },
  findAll: async () => all('SELECT id, username, rol, nombre FROM usuarios ORDER BY nombre ASC')
};

module.exports = UsuarioModel;
```

#### `backend/src/models/cliente.model.js`
```javascript
const { run, get, all } = require('../config/db');

const ClienteModel = {
  createTable: async () => {
    return run(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT,
        email TEXT,
        direccion TEXT,
        notas TEXT,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  },
  findAll: async (search = '') => {
    let query = 'SELECT * FROM clientes';
    let params = [];
    if (search) {
      query += ' WHERE nombre LIKE ? OR telefono LIKE ? OR email LIKE ?';
      const searchTerm = `%${search}%`;
      params = [searchTerm, searchTerm, searchTerm];
    }
    query += ' ORDER BY nombre ASC';
    return all(query, params);
  },
  findById: async (id) => get('SELECT * FROM clientes WHERE id = ?', [id]),
  create: async ({ nombre, telefono, email, direccion, notas }) => {
    return run(
      'INSERT INTO clientes (nombre, telefono, email, direccion, notas) VALUES (?, ?, ?, ?, ?)',
      [nombre, telefono, email, direccion, notas]
    );
  },
  update: async (id, { nombre, telefono, email, direccion, notas }) => {
    return run(
      'UPDATE clientes SET nombre = ?, telefono = ?, email = ?, direccion = ?, notas = ? WHERE id = ?',
      [nombre, telefono, email, direccion, notas, id]
    );
  },
  delete: async (id) => run('DELETE FROM clientes WHERE id = ?', [id])
};

module.exports = ClienteModel;
```

#### `backend/src/models/producto.model.js`
```javascript
const { run, get, all } = require('../config/db');

const ProductoModel = {
  createTable: async () => {
    return run(`
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        tipo TEXT NOT NULL,
        marca TEXT,
        precio REAL NOT NULL DEFAULT 0.0,
        stock INTEGER NOT NULL DEFAULT 0,
        descripcion TEXT,
        categoria TEXT DEFAULT 'N/A',
        material TEXT DEFAULT 'N/A',
        tratamiento TEXT DEFAULT 'N/A',
        laboratorio INTEGER DEFAULT 0,
        rango_graduacion TEXT DEFAULT 'N/A'
      )
    `);
  },
  findAll: async ({ search = '', tipo = '' } = {}) => {
    let query = 'SELECT * FROM productos WHERE 1=1';
    let params = [];
    if (search) {
      query += ' AND (nombre LIKE ? OR marca LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }
    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }
    query += ' ORDER BY nombre ASC';
    return all(query, params);
  },
  findById: async (id) => get('SELECT * FROM productos WHERE id = ?', [id]),
  create: async ({ nombre, tipo, marca, precio, stock, descripcion, categoria, material, tratamiento, laboratorio, rango_graduacion }) => {
    return run(
      'INSERT INTO productos (nombre, tipo, marca, precio, stock, descripcion, categoria, material, tratamiento, laboratorio, rango_graduacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        nombre, tipo, marca || null, precio, stock || 0, descripcion || null, 
        categoria || 'N/A', material || 'N/A', tratamiento || 'N/A', 
        laboratorio !== undefined ? laboratorio : 0, rango_graduacion || 'N/A'
      ]
    );
  },
  update: async (id, { nombre, tipo, marca, precio, stock, descripcion, categoria, material, tratamiento, laboratorio, rango_graduacion }) => {
    return run(
      'UPDATE productos SET nombre = ?, tipo = ?, marca = ?, precio = ?, stock = ?, descripcion = ?, categoria = ?, material = ?, tratamiento = ?, laboratorio = ?, rango_graduacion = ? WHERE id = ?',
      [
        nombre, tipo, marca || null, precio, stock || 0, descripcion || null, 
        categoria || 'N/A', material || 'N/A', tratamiento || 'N/A', 
        laboratorio !== undefined ? laboratorio : 0, rango_graduacion || 'N/A', id
      ]
    );
  },
  updateStock: async (id, cantidad) => run('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, id]),
  delete: async (id) => run('DELETE FROM productos WHERE id = ?', [id]),
  findCriticalStock: async (limit = 3) => all('SELECT * FROM productos WHERE stock <= ? ORDER BY stock ASC', [limit])
};

module.exports = ProductoModel;
```

#### `backend/src/models/receta.model.js`
Guarda el detalle clínico de cristales (OD, OI, DP, Base, Adición, etc.) asociado al cliente:
```javascript
const { run, get, all } = require('../config/db');

const RecetaModel = {
  createTable: async () => {
    return run(`
      CREATE TABLE IF NOT EXISTS recetas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        numero_pedido TEXT,
        fecha_entrega TEXT,
        fecha_prometida TEXT,
        tomado_por TEXT,
        material TEXT,
        color TEXT,
        ar TEXT,
        calibrado TEXT,
        laca TEXT,
        dp_l TEXT,
        dp_c TEXT,
        altura TEXT,
        esf_d_l TEXT, cil_d_l TEXT, eje_d_l TEXT, diam_d_l TEXT,
        esf_d_c TEXT, cil_d_c TEXT, eje_d_c TEXT, diam_d_c TEXT,
        esf_i_l TEXT, cil_i_l TEXT, eje_i_l TEXT, diam_i_l TEXT,
        esf_i_c TEXT, cil_i_c TEXT, eje_i_c TEXT, diam_i_c TEXT,
        prisma_d TEXT, prisma_i TEXT,
        base_d TEXT, adicion_d TEXT,
        base_i TEXT, adicion_i TEXT,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
      )
    `);
  },
  findById: async (id) => get('SELECT * FROM recetas WHERE id = ?', [id]),
  findByClienteId: async (clienteId) => all('SELECT * FROM recetas WHERE cliente_id = ? ORDER BY fecha_registro DESC', [clienteId]),
  create: async (data) => {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.join(', ');
    const values = Object.values(data);
    return run(`INSERT INTO recetas (${columns}) VALUES (${placeholders})`, values);
  }
};

module.exports = RecetaModel;
```

#### `backend/src/models/venta.model.js`
Contiene la venta global y el detalle de cada producto vendido (`detalle_ventas`):
```javascript
const { run, get, all } = require('../config/db');

const VentaModel = {
  createTables: async () => {
    await run(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        receta_id INTEGER,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        total REAL NOT NULL DEFAULT 0.0,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id),
        FOREIGN KEY (receta_id) REFERENCES recetas(id)
      )
    `);
    await run(`
      CREATE TABLE IF NOT EXISTS detalle_ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venta_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 1,
        precio_unitario REAL NOT NULL,
        FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      )
    `);
  },
  findAll: async () => {
    const query = `
      SELECT v.*, c.nombre as cliente_nombre 
      FROM ventas v 
      JOIN clientes c ON v.cliente_id = c.id 
      ORDER BY v.fecha DESC
    `;
    return all(query);
  },
  findByClienteId: async (clienteId) => all('SELECT * FROM ventas WHERE cliente_id = ? ORDER BY fecha DESC', [clienteId]),
  findDetallesByVentaId: async (ventaId) => {
    const query = `
      SELECT dv.*, p.nombre as producto_nombre, p.tipo as producto_tipo, p.marca as producto_marca
      FROM detalle_ventas dv
      JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = ?
    `;
    return all(query, [ventaId]);
  },
  create: async ({ cliente_id, receta_id, total }) => {
    return run(
      'INSERT INTO ventas (cliente_id, receta_id, total) VALUES (?, ?, ?)',
      [cliente_id, receta_id || null, total]
    );
  },
  createDetalle: async ({ venta_id, producto_id, cantidad, precio_unitario }) => {
    return run(
      'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
      [venta_id, producto_id, cantidad, precio_unitario]
    );
  },
  getTotalStats: async () => get('SELECT SUM(total) as total, COUNT(*) as count FROM ventas')
};

module.exports = VentaModel;
```

### Paso 2.5: Capa de Middlewares (Filtros de Peticiones y Control de Acceso)

#### `backend/src/middlewares/auth.middleware.js`
Verifica que la cabecera contenga el token JWT válido:
```javascript
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acceso denegado. Formato de token incorrecto.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

module.exports = authMiddleware;
```

#### `backend/src/middlewares/roles.middleware.js`
Restringe accesos a roles específicos (`admin`):
```javascript
const rolesMiddleware = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Usuario no autenticado.' });
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado. No tenés permisos suficientes.' });
    }
    next();
  };
};

module.exports = rolesMiddleware;
```

#### `backend/src/middlewares/validate.middleware.js`
Valida la existencia de campos requeridos en el cuerpo del request antes de llegar al controlador:
```javascript
const validateMiddleware = (requiredFields = []) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === '');
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Faltan campos obligatorios: ${missingFields.join(', ')}` });
    }
    next();
  };
};

module.exports = validateMiddleware;
```

#### `backend/src/middlewares/errorHandler.middleware.js`
Captura errores de ejecución del servidor:
```javascript
const errorHandlerMiddleware = (err, req, res, next) => {
  console.error('Error capturado:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Ocurrió un error inesperado en el servidor.';
  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandlerMiddleware;
```

### Paso 2.6: Capa de Servicios (Lógica del Negocio)

#### `backend/src/services/auth.service.js`
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuario.model');
const { JWT_SECRET } = require('../config/env');

const AuthService = {
  registrar: async ({ username, password, rol, nombre }) => {
    const checkUser = await UsuarioModel.findByUsername(username);
    if (checkUser) throw new Error('El nombre de usuario ya existe.');

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await UsuarioModel.create({ username, password: hashedPassword, rol: rol || 'vendedor', nombre });
    return { id: result.id, username, rol, nombre };
  },
  login: async ({ username, password }) => {
    const user = await UsuarioModel.findByUsername(username);
    if (!user) throw new Error('Credenciales inválidas.');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Credenciales inválidas.');

    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol, nombre: user.nombre },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return { token, user: { id: user.id, username: user.username, rol: user.rol, nombre: user.nombre } };
  }
};

module.exports = AuthService;
```

#### `backend/src/services/cliente.service.js`
Implementa lógica para CRUD de clientes. (Ver lógica en `cliente.service.js` existente).

#### `backend/src/services/producto.service.js`
Implementa lógica para CRUD de inventario. (Ver lógica en `producto.service.js` existente).

#### `backend/src/services/receta.service.js`
Lógica de persistencia de recetas y verificación del cliente. (Ver lógica en `receta.service.js` existente).

#### `backend/src/services/venta.service.js`
Lógica transaccional para guardar la cabecera de la venta, iterar y guardar los detalles, y recolectar estadísticas para el Dashboard (Ingresos totales, cantidad de clientes, stock crítico, etc.). (Ver lógica completa en `venta.service.js`).

### Paso 2.7: Capa de Controladores (Procesamiento de Request/Response)

Los controladores capturan los requests, delegan en el servicio correspondiente y retornan los JSONs con estados HTTP apropiados (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`).

*   `auth.controller.js`
*   `cliente.controller.js`
*   `producto.controller.js`
*   `receta.controller.js`
*   `venta.controller.js`

*(Los archivos correspondientes mapean los métodos directamente a los servicios. Ver la estructura original en la carpeta `/controllers` del backend).*

### Paso 2.8: Capa de Rutas y Mapeo de Rutas en la Aplicación

#### `backend/src/routes/auth.routes.js`
```javascript
const express = require('express');
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');

const router = express.Router();
router.post('/register', validateMiddleware(['username', 'password', 'nombre']), AuthController.registrar);
router.post('/login', validateMiddleware(['username', 'password']), AuthController.login);
router.get('/profile', authMiddleware, AuthController.profile);

module.exports = router;
```

#### `backend/src/routes/cliente.routes.js`
Mapea `/` a obtener todos (con query `?buscar`), `/:id` para individual, creación, actualización y borrado. (Requieren `authMiddleware`).

#### `backend/src/routes/producto.routes.js`
Rutas de catálogo. Modificaciones (POST, PUT, DELETE) requieren rol `admin` (`rolesMiddleware(['admin'])`).

#### `backend/src/routes/receta.routes.js`
Creación e historial de recetas por ID de cliente.

#### `backend/src/routes/venta.routes.js`
Rutas de venta principal, listado total y estadísticas del dashboard (`/dashboard/stats`).

### Paso 2.9: Configuración de Datos Semilla (Catálogo Córdoba Glass de Marzo 2026)

#### `backend/src/seed.js`
Al inicializar la aplicación por primera vez, este archivo crea las tablas si no existen e inserta:
1.  **Usuarios semilla**: Administrador (`admin` / `admin123`) y Vendedor (`vendedor` / `vendedor123`).
2.  **Clientes semilla**: Ej. Juan Pérez, María Rodríguez.
3.  **Catálogo completo de cristales "Córdoba Glass"**: Lentes Monofocales, Bifocales, Multifocales Progresivos digitales de alta definición (Gold Vision y Glass 3D), Filtros Terapéuticos (amarillo/verde), tratamientos antirraya y Blue Cut en diferentes índices y materiales (Orgánico, Policarbonato, Acrílico).

*(Ver el archivo `seed.js` existente para el script completo).*

### Paso 2.10: Puntos de Entrada del Servidor

#### `backend/src/app.js`
Une las rutas y registra los middlewares base:
```javascript
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const clienteRoutes = require('./routes/cliente.routes');
const productoRoutes = require('./routes/producto.routes');
const recetaRoutes = require('./routes/receta.routes');
const ventaRoutes = require('./routes/venta.routes');
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/recetas', recetaRoutes);
app.use('/api/ventas', ventaRoutes);

app.use(errorHandler);

module.exports = app;
```

#### `backend/src/index.js`
Punto de arranque del backend. Llama a los seeders de base de datos antes de levantar el puerto:
```javascript
const app = require('./app');
const { PORT } = require('./config/env');
const seed = require('./seed');

const bootstrap = async () => {
  try {
    await seed();
    console.log('Base de datos inicializada y semilla cargada.');

    app.listen(PORT, () => {
      console.log(`Servidor de API corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error fatal al iniciar servidor:', error);
    process.exit(1);
  }
};

bootstrap();
```

---

## 5. Instrucciones de Despliegue Local

### 1. Iniciar el Backend
1.  Ingresar a la carpeta `backend/`.
2.  Instalar dependencias: `npm install`.
3.  Ejecutar el servidor en modo desarrollo: `npm run dev`.
    *   *Esto creará el archivo `database.sqlite` y cargará los usuarios semilla.*

### 2. Iniciar el Frontend
1.  Ingresar a la carpeta `frontend/`.
2.  Instalar dependencias: `npm install`.
3.  Ejecutar el cliente de desarrollo: `npm run dev`.
4.  Abrir en el navegador (usualmente en `http://localhost:5173`).
5.  Iniciar sesión con las credenciales demo:
    *   **Usuario**: `admin`
    *   **Contraseña**: `admin123`
