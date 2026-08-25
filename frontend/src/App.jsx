import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import ProductosPage from './pages/ProductosPage';
import NuevaVentaPage from './pages/NuevaVentaPage';
import VentasHistorialPage from './pages/VentasHistorialPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/nueva-venta" element={<NuevaVentaPage />} />
          <Route path="/ventas" element={<VentasHistorialPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
