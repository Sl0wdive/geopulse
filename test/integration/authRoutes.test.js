import request from 'supertest';
import { expect } from 'chai';
import app from '../../server.js';

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          fullName: 'Test User',
          username: 'testuser',
          password: 'password123'
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });
  });

});
