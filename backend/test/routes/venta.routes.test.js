import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/app.js';
import ENV from '../../src/config/env.js';
import { dbRun, dbQuery } from '../../src/config/db.js';

describe('Venta Routes', () => {
  let token;
  let clienteId;
  let productoId;
  let cristalId;

  beforeAll(async () => {
    const resAuth = await request(app).post('/api/auth/login').send({
      username: ENV.ADMIN_USERNAME,
      password: ENV.ADMIN_PASSWORD
    });
    token = resAuth.body.token;

    // Obtener un cliente de la bd (ya hay semilla)
    const clientes = await dbQuery('SELECT id FROM clientes LIMIT 1');
    clienteId = clientes[0].id;

    // Obtener un producto de la bd
    const productos = await dbQuery('SELECT id FROM productos LIMIT 1');
    productoId = productos[0].id;

    // Crear un cristal para probar
    const resCristal = await dbRun("INSERT INTO cristales (material, tipo_lente) VALUES ('Organico', 'Monofocal')");
    cristalId = resCristal.id;
  });

  describe('POST /api/ventas', () => {
    it('debe registrar una venta con graduación correctamente', async () => {
      const nuevaVenta = {
        cliente_id: clienteId,
        items: [
          { producto_id: productoId, cantidad: 1, precio_unitario: 1000 },
          { cristal_id: cristalId, cantidad: 2, precio_unitario: 500 }
        ],
        descripcion: 'Venta de prueba',
        graduacion: { material: 'Policarbonato' }
      };

      const res = await request(app)
        .post('/api/ventas')
        .set('Authorization', `Bearer ${token}`)
        .send(nuevaVenta)
        .expect(201);

      expect(res.body).toHaveProperty('ventaId');
      
      // Verificar que se recupera completa
      const resVenta = await request(app)
        .get(`/api/ventas/${res.body.ventaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
        
      expect(resVenta.body.productos.length).toBe(2);
      expect(resVenta.body.graduacion.material).toBe('Policarbonato');
    });

    it('precio_unitario modificado a mano se respeta (el total se calcula con el enviado)', async () => {
      const nuevaVenta = {
        cliente_id: clienteId,
        items: [
          { producto_id: productoId, cantidad: 1, precio_unitario: 9999 } // Precio super modificado
        ]
      };

      const res = await request(app)
        .post('/api/ventas')
        .set('Authorization', `Bearer ${token}`)
        .send(nuevaVenta)
        .expect(201);

      const resVenta = await request(app)
        .get(`/api/ventas/${res.body.ventaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(resVenta.body.total).toBe(9999);
    });

    it('falla si un item tiene ambos (producto y cristal)', async () => {
      const nuevaVenta = {
        cliente_id: clienteId,
        items: [
          { producto_id: productoId, cristal_id: cristalId, cantidad: 1, precio_unitario: 1000 }
        ]
      };

      const res = await request(app)
        .post('/api/ventas')
        .set('Authorization', `Bearer ${token}`)
        .send(nuevaVenta)
        .expect(400);

      expect(res.body.error).toContain('no ambos ni ninguno');
    });
  });

  describe('GET /api/ventas', () => {
    it('debe devolver la lista de ventas', async () => {
      const res = await request(app)
        .get('/api/ventas')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
