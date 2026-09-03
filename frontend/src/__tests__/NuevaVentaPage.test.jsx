import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NuevaVentaPage from '../pages/NuevaVentaPage.jsx';

// Mock de APIs
vi.mock('../api/clientes.api', () => ({
  obtenerClientes: vi.fn()
}));
vi.mock('../api/productos.api', () => ({
  obtenerProductos: vi.fn(),
  obtenerMasVendidos: vi.fn()
}));
vi.mock('../api/cristales.api', () => ({
  obtenerCristales: vi.fn()
}));
vi.mock('../api/ventas.api', () => ({
  crearVenta: vi.fn()
}));

import { obtenerClientes } from '../api/clientes.api';
import { obtenerProductos, obtenerMasVendidos } from '../api/productos.api';
import { obtenerCristales } from '../api/cristales.api';
import { crearVenta } from '../api/ventas.api';

describe('NuevaVentaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    obtenerClientes.mockResolvedValue([
      { id: 1, nombre: 'Juan', apellido: 'Perez', dni: '12345678' }
    ]);
    
    obtenerProductos.mockResolvedValue([
      { id: 1, codigo: 'ARM-01', nombre: 'Armazon RayBan', precio: 10000, categoria: 'Armazón de Sol' }
    ]);
    
    obtenerMasVendidos.mockResolvedValue([
      { id: 1, codigo: 'ARM-01', nombre: 'Armazon RayBan', precio: 10000, categoria: 'Armazón de Sol' }
    ]);
    
    obtenerCristales.mockResolvedValue([
      { 
        id: 1, 
        material: 'Organico', 
        tipo_lente: 'Monofocal', 
        con_blue_cut: 0, 
        con_fotocromatico: 0, 
        con_antirreflejo: 1, 
        precio_tradicional: 5000, 
        precio_digital: null, 
        precio_ar_eternal: null 
      },
      { 
        id: 2, 
        material: 'Policarbonato', 
        tipo_lente: 'Bifocal', 
        con_blue_cut: 1, 
        con_fotocromatico: 0, 
        con_antirreflejo: 0,
        precio_tradicional: null, 
        precio_digital: null, 
        precio_ar_eternal: null // Requiere precio manual
      }
    ]);
  });

  const renderComponent = () => render(
    <BrowserRouter>
      <NuevaVentaPage />
    </BrowserRouter>
  );

  it('debe renderizar correctamente luego de cargar', async () => {
    renderComponent();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/Resumen de Venta/i)).toBeInTheDocument();
    });
  });

  it('flujo completo: seleccionar cliente, producto, cristal, editar precio y confirmar', async () => {
    crearVenta.mockResolvedValue({ id: 99 });
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Cliente')).toBeInTheDocument();
    });

    // 1. Seleccionar cliente buscando
    const searchCliente = screen.getByPlaceholderText(/Buscar cliente por DNI/i);
    fireEvent.change(searchCliente, { target: { value: '1234' } });
    
    const botonCliente = await screen.findByText('Juan Perez');
    fireEvent.click(botonCliente);
    
    // Validar que el cliente está seleccionado
    expect(screen.getByText('DNI: 12345678')).toBeInTheDocument();

    // 2. Agregar Producto
    const inputProducto = screen.getByPlaceholderText(/Buscar producto por nombre o código/i);
    fireEvent.change(inputProducto, { target: { value: 'RayBan' } });
    
    const botonProducto = await screen.findByText('Armazon RayBan');
    fireEvent.click(botonProducto);
    
    // 3. Cambiar tab a Cristales
    fireEvent.click(screen.getByText(/Cristales/i));
    
    // Buscar y agregar cristal tradicional (con precio definido)
    const inputCristal = screen.getByPlaceholderText(/Buscar por material, tratamiento o descripción/i);
    fireEvent.change(inputCristal, { target: { value: 'Organico' } });
    
    // Hay un boton de 'Trad. $ 5.000,00'
    const btnTradicional = await screen.findByText(/Trad./i);
    fireEvent.click(btnTradicional);

    // Buscar cristal manual
    fireEvent.change(inputCristal, { target: { value: 'Policarbonato' } });
    const btnManual = await screen.findByText(/Agregar \(Precio manual\)/i);
    fireEvent.click(btnManual);

    // 4. Validar que esten en el carrito y editar precio manual
    // Hay 3 items en el carrito. El ultimo tiene precio_unitario 0.
    const inputsPrecios = screen.getAllByRole('spinbutton');
    // inputsPrecios tiene cantidad y precio por cada item. (2 inputs por item).
    // Array: [cant1, precio1, cant2, precio2, cant3, precio3] (depende si cantidad usa input number o no)
    // Mirando el codigo, cantidad no es input, es span. Y el precio_unitario si es input[type=number].
    // Asi que habria 3 inputs.
    
    expect(inputsPrecios.length).toBe(3);
    
    // Cambiar precio del 3er item
    fireEvent.change(inputsPrecios[2], { target: { value: '3000' } });

    // 5. Checkear graduacion
    const checkGraduacion = screen.getByLabelText(/Esta venta incluye graduación de lentes/i);
    fireEvent.click(checkGraduacion);
    
    const inputOjoLejos = await screen.findByPlaceholderText('0.00'); // Hay varios, el primero es esf_od_lejos
    // Para simplificar, buscamos los primeros
    const inputsNumber = screen.getAllByPlaceholderText('0.00');
    fireEvent.change(inputsNumber[0], { target: { value: '-1.50' } });

    // 6. Confirmar Venta
    const btnConfirmar = screen.getByText('Confirmar venta');
    fireEvent.click(btnConfirmar);

    await waitFor(() => {
      expect(crearVenta).toHaveBeenCalled();
    });

    const payloadEnviado = crearVenta.mock.calls[0][0];
    expect(payloadEnviado.cliente_id).toBe(1);
    expect(payloadEnviado.items.length).toBe(3);
    // Verificar que el tercer item tiene el precio manual
    expect(payloadEnviado.items[2].precio_unitario).toBe(3000);
    // Verificar que se incluyo graduacion
    expect(payloadEnviado.graduacion.esf_od_lejos).toBe(-1.5);
  });
});
