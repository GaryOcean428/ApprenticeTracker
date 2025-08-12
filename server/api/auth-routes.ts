import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { 
  authenticateToken, 
  AuthRequest,
  authRateLimiters,
  addSecurityHeaders,
  getAuthSystemHealth,
  auditLog,
  generateToken
} from '../middleware/auth-unified';
import { AuthService, validateEmail, validatePassword } from '../services/auth-service';

export const authRouter = Router();

// Apply security headers to all auth routes
authRouter.use(addSecurityHeaders);

// Apply general rate limiting to all auth routes
authRouter.use(authRateLimiters.general);

// Enhanced health check endpoint with detailed system status
authRouter.get('/health', (req: Request, res: Response) => {
  try {
    const healthStatus = getAuthSystemHealth();
    auditLog('HEALTH_CHECK', req, { status: healthStatus.status });
    res.json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Enhanced Zod schemas for validation with better error messages
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(1, 'Password is required')
    .max(255, 'Password is too long'),
});

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .transform(val => val.trim()),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password is too long'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .transform(val => val.toLowerCase().trim()),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(100, 'First name is too long')
    .transform(val => val.trim()),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name is too long')
    .transform(val => val.trim()),
  role: z.string()
    .optional()
    .default('user')
    .transform(val => val?.trim() || 'user'),
  roleId: z.number().int().positive().optional(),
  organizationId: z.number().int().positive().optional(),
});

/**
 * Enhanced middleware to validate request body against a Zod schema
 */
function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.received || req.body[err.path[0]],
        }));

        auditLog('VALIDATION_ERROR', req, { 
          errors: formattedErrors,
          endpoint: req.path 
        });

        return res.status(400).json({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Please check your input and try again',
          errors: formattedErrors,
          timestamp: new Date().toISOString(),
        });
      }
      return res.status(400).json({
        success: false,
        code: 'INVALID_REQUEST',
        message: 'Invalid request format',
        timestamp: new Date().toISOString(),
      });
    }
  };
}

/**
 * Enhanced Login endpoint with rate limiting and comprehensive security
 */
authRouter.post('/login', 
  authRateLimiters.login,
  validateBody(loginSchema),
  async (req: Request, res: Response) => {
    try {
      // Ensure JSON response
      res.setHeader('Content-Type', 'application/json');

      const { email, password } = req.body;

      // Use the enhanced auth service
      const result = await AuthService.login({ email, password }, req);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          code: result.error!.code,
          message: result.error!.message,
          timestamp: new Date().toISOString(),
        });
      }

      const { token, user, expiresAt } = result.data!;

      return res.status(200).json({
        success: true,
        token,
        user,
        expiresAt: expiresAt.toISOString(),
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Login endpoint error:', error);
      auditLog('LOGIN_ENDPOINT_ERROR', req, { error: error.message });
      
      return res.status(500).json({
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'Authentication service temporarily unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Enhanced Register endpoint with comprehensive validation and security
 */
authRouter.post('/register', 
  authRateLimiters.register,
  validateBody(registerSchema),
  async (req: Request, res: Response) => {
    try {
      // Ensure JSON response
      res.setHeader('Content-Type', 'application/json');

      const { username, password, email, firstName, lastName, role, roleId, organizationId } = req.body;

      // Use the enhanced auth service
      const result = await AuthService.register({
        username,
        password,
        email,
        firstName,
        lastName,
        role,
        roleId,
        organizationId,
      }, req);

      if (!result.success) {
        const statusCode = result.error!.code === 'SERVICE_UNAVAILABLE' ? 503 : 
                          result.error!.code.includes('EXISTS') ? 409 : 400;
        
        return res.status(statusCode).json({
          success: false,
          code: result.error!.code,
          message: result.error!.message,
          timestamp: new Date().toISOString(),
        });
      }

      const { user, message } = result.data!;

      return res.status(201).json({
        success: true,
        message,
        user,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Registration endpoint error:', error);
      auditLog('REGISTER_ENDPOINT_ERROR', req, { error: error.message });
      
      return res.status(500).json({
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'Registration service temporarily unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Enhanced Verify token endpoint with comprehensive security checks
 */
authRouter.get('/verify', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Ensure JSON response
    res.setHeader('Content-Type', 'application/json');

    // Token is already verified by middleware, req.user is populated
    const userId = req.user!.id;

    // Use the enhanced auth service
    const result = await AuthService.verifyUser(userId, req);

    if (!result.success) {
      const statusCode = result.error!.code === 'USER_NOT_FOUND' ? 404 :
                        result.error!.code === 'USER_INACTIVE' ? 401 : 503;
      
      return res.status(statusCode).json({
        success: false,
        code: result.error!.code,
        message: result.error!.message,
        timestamp: new Date().toISOString(),
      });
    }

    const { user } = result.data!;

    return res.status(200).json({
      success: true,
      user,
      timestamp: new Date().toISOString(),
      // Include audit context in response
      auditContext: req.auditContext,
    });

  } catch (error) {
    console.error('Token verification endpoint error:', error);
    auditLog('VERIFY_ENDPOINT_ERROR', req, { error: error.message });
    
    return res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Verification service temporarily unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Token refresh endpoint - generates new token for authenticated users
 */
authRouter.post('/refresh', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Ensure JSON response
    res.setHeader('Content-Type', 'application/json');

    const user = req.user!;

    // Verify user is still active
    const verifyResult = await AuthService.verifyUser(user.id, req);
    if (!verifyResult.success) {
      return res.status(401).json({
        success: false,
        code: verifyResult.error!.code,
        message: verifyResult.error!.message,
        timestamp: new Date().toISOString(),
      });
    }

    // Generate new token with updated user data
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      roleId: user.roleId,
      organizationId: user.organizationId,
    };

    const newToken = generateToken(tokenPayload);
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days

    auditLog('TOKEN_REFRESH_SUCCESS', req, { userId: user.id });

    return res.status(200).json({
      success: true,
      token: newToken,
      expiresAt: expiresAt.toISOString(),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    auditLog('TOKEN_REFRESH_ERROR', req, { error: error.message });
    
    return res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Token refresh service temporarily unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Logout endpoint - invalidates current session
 */
authRouter.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Ensure JSON response
    res.setHeader('Content-Type', 'application/json');

    const user = req.user!;

    // Clear user cache
    AuthService.clearUserCache(user.id, user.email);

    auditLog('LOGOUT_SUCCESS', req, { userId: user.id });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Logout error:', error);
    auditLog('LOGOUT_ERROR', req, { error: error.message });
    
    return res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Logout service temporarily unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Profile endpoint - get current user's profile
 */
authRouter.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Ensure JSON response
    res.setHeader('Content-Type', 'application/json');

    const userId = req.user!.id;

    // Get fresh user data
    const result = await AuthService.verifyUser(userId, req);

    if (!result.success) {
      const statusCode = result.error!.code === 'USER_NOT_FOUND' ? 404 :
                        result.error!.code === 'USER_INACTIVE' ? 401 : 503;
      
      return res.status(statusCode).json({
        success: false,
        code: result.error!.code,
        message: result.error!.message,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      profile: result.data!.user,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    auditLog('PROFILE_ERROR', req, { error: error.message });
    
    return res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Profile service temporarily unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Middleware exports for backward compatibility and external use
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  return authenticateToken(req as AuthRequest, res, next);
}

export function hasRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    isAuthenticated(req, res, () => {
      const user = (req as AuthRequest).user;

      if (!user || user.role !== role) {
        return res.status(403).json({
          success: false,
          code: 'INSUFFICIENT_ROLE',
          message: 'Insufficient permissions',
          timestamp: new Date().toISOString(),
        });
      }

      next();
    });
  };
}

// Export enhanced middleware functions
export { 
  authenticateToken as enhancedAuthenticateToken,
  authRateLimiters,
  addSecurityHeaders
} from '../middleware/auth-unified';

// Export auth service
export { AuthService } from '../services/auth-service';
