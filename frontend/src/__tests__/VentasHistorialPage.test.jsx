import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import VentasHistorialPage from '../pages/VentasHistorialPage';
import { BrowserRouter } from 'react-router-dom';

global.fetch = vi.fn();

describe('VentasHistorialPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('debe mostrar las ventas en el historial', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ([
                {
                    id: 1,
                    fecha: '2026-09-02T12:00:00Z',
                    total: 150000,
                    descripcion: 'Lentes de prueba',
                    cliente: {
                        nombre: 'Juan',
                        apellido: 'Perez',
                        dni: '12345678'
                    }
                }
            ])
        });

        render(
            <BrowserRouter>
                <VentasHistorialPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Historial de Ventas')).toBeInTheDocument();
            expect(screen.getByText('Juan Perez')).toBeInTheDocument();
            expect(screen.getByText('12345678')).toBeInTheDocument();
            expect(screen.getByText('$150,000.00')).toBeInTheDocument();
        });
    });

    it('debe mostrar mensaje si no hay ventas', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        render(
            <BrowserRouter>
                <VentasHistorialPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/No se encontraron ventas/i)).toBeInTheDocument();
        });
    });
});
