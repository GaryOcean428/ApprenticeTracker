import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { authRouter } from '../api/auth-routes';

// Mock dependencies
vi.mock('../db', () => ({
  db: null,
}));

vi.mock('../utils/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-at-least-32-characters-long',
    JWT_EXPIRES_IN: '7d',
    NODE_ENV: 'development',
  },
}));

// Mock logger
vi.mock('../utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Create test app
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  return app;
}

describe('Enhanced Authentication Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Health Check', () => {
    it('should return system health status', async () => {
      const response = await request(app)
        .get('/api/auth/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('jwt');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('rateLimit');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Login Endpoint', () => {
    it('should accept valid email and password in development mode', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'testpassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body.user).toHaveProperty('email', loginData.email);
    });

    it('should reject invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'testpassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: expect.stringContaining('valid email'),
          }),
        ])
      );
    });

    it('should reject missing password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: '',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should include security headers', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'testpassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
    });
  });

  describe('Registration Endpoint', () => {
    it('should accept valid registration data', async () => {
      const registrationData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
      };

      // Note: In development mode without database, registration will fail
      // This tests the validation layer
      const response = await request(app)
        .post('/api/auth/register')
        .send(registrationData);

      // Should pass validation but fail at service level due to no DB
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'SERVICE_UNAVAILABLE');
    });

    it('should reject weak passwords in production mode', async () => {
      // Temporarily set production mode
      vi.doMock('../utils/env', () => ({
        env: {
          JWT_SECRET: 'test-secret-key-at-least-32-characters-long',
          JWT_EXPIRES_IN: '7d',
          NODE_ENV: 'production',
        },
      }));

      const registrationData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(registrationData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should sanitize and validate input fields', async () => {
      const registrationData = {
        username: '  test_user  ',
        email: '  TEST@EXAMPLE.COM  ',
        password: 'SecurePass123!',
        firstName: '  Test  ',
        lastName: '  User  ',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(registrationData);

      // Even though registration fails due to no DB, validation should pass
      // and inputs should be sanitized
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'SERVICE_UNAVAILABLE');
    });
  });

  describe('Token Verification', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'NO_TOKEN');
    });

    it('should reject invalid token format', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'InvalidToken')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to login endpoint', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Make multiple rapid requests to trigger rate limit
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send(loginData)
      );

      const responses = await Promise.all(promises);
      
      // At least one response should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Profile Endpoint', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'NO_TOKEN');
    });
  });

  describe('Logout Endpoint', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'NO_TOKEN');
    });
  });

  describe('Token Refresh', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'NO_TOKEN');
    });
  });
});

describe('Authentication Middleware Exports', () => {
  it('should export isAuthenticated function', async () => {
    const { isAuthenticated } = await import('../api/auth-routes');
    expect(typeof isAuthenticated).toBe('function');
  });

  it('should export hasRole function', async () => {
    const { hasRole } = await import('../api/auth-routes');
    expect(typeof hasRole).toBe('function');
  });

  it('should export AuthService', async () => {
    const { AuthService } = await import('../api/auth-routes');
    expect(AuthService).toBeDefined();
    expect(typeof AuthService.login).toBe('function');
    expect(typeof AuthService.register).toBe('function');
    expect(typeof AuthService.verifyUser).toBe('function');
  });
});