import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../pages/DashboardPage';
import { BrowserRouter } from 'react-router-dom';

global.fetch = vi.fn();

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('debe mostrar las métricas correctamente', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                ventas_hoy: 5,
                ingresos_hoy: 50000,
                ventas_mes: 25,
                ingresos_mes: 250000,
                productos_bajo_stock: 3
            })
        });

        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('5')).toBeInTheDocument();
            expect(screen.getByText('$50,000.00')).toBeInTheDocument();
            expect(screen.getByText('25')).toBeInTheDocument();
            expect(screen.getByText('$250,000.00')).toBeInTheDocument();
            expect(screen.getByText('3')).toBeInTheDocument();
        });
    });

    it('debe manejar error al cargar el dashboard', async () => {
        fetch.mockResolvedValueOnce({
            ok: false
        });

        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Error al cargar/i)).toBeInTheDocument();
        });
    });
});
