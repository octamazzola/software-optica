import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/app.js';
import ENV from '../../src/config/env.js';

describe('Producto Routes', () => {
  let token;
  let productoId;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: ENV.ADMIN_USERNAME,
      password: ENV.ADMIN_PASSWORD
    });
    token = res.body.token;
  });

  describe('GET /api/productos', () => {
    it('debe devolver productos semilla', async () => {
      const res = await request(app)
        .get('/api/productos')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/productos', () => {
    it('debe crear un nuevo producto', async () => {
      const p = { codigo: 'TEST-01', nombre: 'Test Prod', precio: 1000, categoria: 'Test' };
      const res = await request(app)
        .post('/api/productos')
        .set('Authorization', `Bearer ${token}`)
        .send(p)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      productoId = res.body.id;
    });

    it('dos productos pueden tener el mismo código sin problemas', async () => {
      const p2 = { codigo: 'TEST-01', nombre: 'Test Prod 2', precio: 2000, categoria: 'Test' };
      const res = await request(app)
        .post('/api/productos')
        .set('Authorization', `Bearer ${token}`)
        .send(p2)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.id).not.toBe(productoId);
    });
  });

  describe('PUT /api/productos/:id', () => {
    it('editar un producto no debe afectar al otro con mismo codigo', async () => {
      await request(app)
        .put(`/api/productos/${productoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ codigo: 'TEST-01', nombre: 'Test Prod Modificado', precio: 1500, categoria: 'Test' })
        .expect(200);

      const res = await request(app)
        .get(`/api/productos/${productoId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.nombre).toBe('Test Prod Modificado');
    });
  });

  describe('DELETE /api/productos/:id', () => {
    it('debe eliminar el producto correctamente', async () => {
      await request(app)
        .delete(`/api/productos/${productoId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
