import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/app.js';
import ENV from '../../src/config/env.js';

describe('Clientes Routes', () => {
  let token;
  let clienteId;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: ENV.ADMIN_USERNAME,
      password: ENV.ADMIN_PASSWORD
    });
    token = res.body.token;
  });

  describe('GET /api/clientes', () => {
    it('debe devolver error 401 si no hay token', async () => {
      await request(app).get('/api/clientes').expect(401);
    });

    it('debe listar los clientes existentes', async () => {
      const res = await request(app)
        .get('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/clientes', () => {
    it('debe crear un nuevo cliente', async () => {
      const nuevoCliente = { nombre: 'Test', apellido: 'Integracion', dni: '99999999' };
      const res = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send(nuevoCliente)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.mensaje).toBe('Cliente creado correctamente');
      clienteId = res.body.id;
    });

    it('debe devolver error 400 si faltan datos obligatorios', async () => {
      const res = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Test' })
        .expect(400);

      expect(res.body.error).toContain('El apellido');
    });
  });

  describe('GET /api/clientes/:id', () => {
    it('debe devolver el cliente recién creado', async () => {
      const res = await request(app)
        .get(`/api/clientes/${clienteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.id).toBe(clienteId);
      expect(res.body.nombre).toBe('Test');
    });

    it('debe devolver 404 si el cliente no existe', async () => {
      await request(app)
        .get(`/api/clientes/99999`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PUT /api/clientes/:id', () => {
    it('debe actualizar el cliente', async () => {
      const res = await request(app)
        .put(`/api/clientes/${clienteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Test', apellido: 'Integracion', dni: '99999999', email: 'test@test.com' })
        .expect(200);

      expect(res.body.mensaje).toBe('Cliente actualizado correctamente');
    });
  });

  describe('DELETE /api/clientes/:id', () => {
    it('debe eliminar el cliente', async () => {
      const res = await request(app)
        .delete(`/api/clientes/${clienteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.mensaje).toBe('Cliente eliminado correctamente');
    });
  });
});
