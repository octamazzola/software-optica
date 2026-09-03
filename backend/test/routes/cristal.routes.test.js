import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/app.js';
import ENV from '../../src/config/env.js';

describe('Cristal Routes', () => {
  let token;
  let cristalId;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: ENV.ADMIN_USERNAME,
      password: ENV.ADMIN_PASSWORD
    });
    token = res.body.token;
  });

  describe('GET /api/cristales', () => {
    it('debe devolver cristales', async () => {
      const res = await request(app)
        .get('/api/cristales')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/cristales', () => {
    it('debe crear un nuevo cristal', async () => {
      const c = { material: 'Policarbonato', tipo_lente: 'Bifocal', tratamiento: 'Antirreflejo' };
      const res = await request(app)
        .post('/api/cristales')
        .set('Authorization', `Bearer ${token}`)
        .send(c)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      cristalId = res.body.id;
    });
  });

  describe('PUT /api/cristales/:id', () => {
    it('debe editar un cristal', async () => {
      await request(app)
        .put(`/api/cristales/${cristalId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ material: 'Policarbonato', tipo_lente: 'Multifocal' })
        .expect(200);

      const res = await request(app)
        .get(`/api/cristales/${cristalId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.tipo_lente).toBe('Multifocal');
    });
  });

  describe('DELETE /api/cristales/:id', () => {
    it('debe eliminar el cristal', async () => {
      await request(app)
        .delete(`/api/cristales/${cristalId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
