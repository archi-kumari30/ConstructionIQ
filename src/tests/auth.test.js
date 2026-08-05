const request = require('supertest');
const app = require('../app');
const userRepository = require('../repositories/userRepository');
const mailService = require('../services/mailService');
const auditLogService = require('../services/auditLogService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

// Mock dependencies
jest.mock('../repositories/userRepository');
jest.mock('../services/mailService');
jest.mock('../services/auditLogService');

describe('Auth Endpoints API tests', () => {
  const mockUser = {
    _id: '60d0fe4f5311236168a109ca',
    name: 'Test Engineer',
    email: 'test@constructioniq.com',
    passwordHash: '$2a$10$hashedpasswordhere...',
    role: 'site_engineer',
    isActive: true,
    isEmailVerified: false,
    save: jest.fn().mockImplementation(function() { return this; }),
    comparePassword: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    const registerPayload = {
      name: 'Test Engineer',
      email: 'test@constructioniq.com',
      password: 'password123',
      role: 'site_engineer'
    };

    it('should successfully register a new user', async () => {
      userRepository.findByEmailLean.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        ...mockUser,
        passwordHash: 'hashedpassword...'
      });
      mailService.sendVerificationEmail.mockResolvedValue({ success: true });
      auditLogService.logAction.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(registerPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(registerPayload.name);
      expect(res.body.data.email).toBe(registerPayload.email);
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should fail registration if email exists', async () => {
      userRepository.findByEmailLean.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(registerPayload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exists');
    });

    it('should fail registration if fields are missing or invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'bad-email' }); // missing password and name

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const loginPayload = {
      email: 'test@constructioniq.com',
      password: 'password123'
    };

    it('should authenticate user and return access token', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(true);
      auditLogService.logAction.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(loginPayload.email);
    });

    it('should block inactive accounts', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      userRepository.findByEmail.mockResolvedValue(inactiveUser);
      inactiveUser.comparePassword = jest.fn().mockResolvedValue(true);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginPayload);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('deactivated');
    });

    it('should reject wrong password', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginPayload);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    it('should generate a new access token for valid refresh token', async () => {
      const validRefreshToken = jwt.sign({ id: mockUser._id }, jwtConfig.refreshSecret);
      const userWithToken = { ...mockUser, refreshToken: validRefreshToken };
      userRepository.findById.mockResolvedValue(userWithToken);

      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: validRefreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid or expired refresh tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'invalid-token-string' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
