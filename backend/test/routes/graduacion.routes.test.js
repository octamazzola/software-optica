import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/app.js';
import ENV from '../../src/config/env.js';
import { dbRun, dbQuery } from '../../src/config/db.js';

describe('Graduacion Routes', () => {
  let token;
  let ventaId;

  beforeAll(async () => {
    const resAuth = await request(app).post('/api/auth/login').send({
      username: ENV.ADMIN_USERNAME,
      password: ENV.ADMIN_PASSWORD
    });
    token = resAuth.body.token;

    const clientes = await dbQuery('SELECT id FROM clientes LIMIT 1');
    const resVenta = await dbRun('INSERT INTO ventas (cliente_id, total) VALUES (?, ?)', [clientes[0].id, 1000]);
    ventaId = resVenta.id;
    
    // Generar graduacion semilla para probar get
    await dbRun("INSERT INTO graduaciones (venta_id, material) VALUES (?, 'Prueba')", [ventaId]);
  });

  describe('GET /api/graduaciones/venta/:ventaId', () => {
    it('debe devolver la graduacion de una venta', async () => {
      const res = await request(app)
        .get(`/api/graduaciones/venta/${ventaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.material).toBe('Prueba');
    });

    it('debe devolver null si no existe', async () => {
      const res = await request(app)
        .get(`/api/graduaciones/venta/9999`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toBe(null);
    });
  });
});
