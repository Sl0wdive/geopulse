import { use, expect } from 'chai'
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../../models/user.js';
import app from '../../server.js';
import { validationResult } from 'express-validator';

const chai = use(chaiHttp)

chai.request()

describe('Auth Controller', () => {
  describe('register', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        fullName: 'Test User',
        username: 'testuser',
        password: 'password123'
      };

      // Mock validationResult to return no errors
      sandbox.stub(validationResult, 'withDefaults').returns(() => ({
        isEmpty: () => true,
        array: () => []
      }));

      // Mock bcrypt methods
      sandbox.stub(bcrypt, 'genSalt').resolves('salt');
      sandbox.stub(bcrypt, 'hash').resolves('hashedPassword');

      // Mock UserModel save method
      const mockSave = sandbox.stub(UserModel.prototype, 'save').resolves({
        _id: 'userId',
        email: userData.email,
        fullName: userData.fullName,
        username: userData.username,
        passwordHash: 'hashedPassword',
        _doc: {
          email: userData.email,
          fullName: userData.fullName,
          username: userData.username,
          passwordHash: 'hashedPassword'
        }
      });

      // Mock jwt sign method
      sandbox.stub(jwt, 'sign').returns('token');

      const res = await chai.request(app).post('/api/auth/register').send(userData);

      // Assertions
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('token', 'token');
      expect(res.body).to.have.property('email', userData.email);
      expect(res.body).to.have.property('fullName', userData.fullName);
      expect(res.body).to.have.property('username', userData.username);

      // Restore stubs
      validationResult.withDefaults.restore();
      bcrypt.genSalt.restore();
      bcrypt.hash.restore();
      mockSave.restore();
      jwt.sign.restore();
    });
  });
});
