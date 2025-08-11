import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../utils/env';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Enhanced request interface with user and audit info
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
    roleId?: number;
    organizationId?: number;
    permissions?: string[];
  };
  auditContext?: {
    timestamp: Date;
    userAgent?: string;
    ipAddress: string;
    rateLimitInfo?: {
      limit: number;
      remaining: number;
      resetTime?: Date;
    };
  };
}

// Standardized error response interface
interface AuthErrorResponse {
  success: false;
  code: string;
  message: string;
  timestamp: string;
  requestId?: string;
}

// JWT configuration
const JWT_CONFIG = {
  secret: env.JWT_SECRET || process.env.JWT_SECRET || 'dev-fallback-secret',
  expiresIn: env.JWT_EXPIRES_IN || '7d',
  algorithm: 'HS256' as const,
  issuer: 'apprentice-tracker',
  audience: 'apprentice-tracker-app',
};

// Rate limiting configurations
export const authRateLimiters = {
  // Strict rate limiting for login attempts
  login: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: {
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again in 15 minutes.',
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      auditLog('RATE_LIMIT_EXCEEDED', req, { endpoint: 'login' });
      res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts. Please try again in 15 minutes.',
        timestamp: new Date().toISOString(),
      });
    },
  }),

  // Moderate rate limiting for registration
  register: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 registration attempts per hour
    message: {
      success: false,
      code: 'REGISTRATION_RATE_LIMIT',
      message: 'Too many registration attempts. Please try again in 1 hour.',
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // General auth endpoint rate limiting
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 auth requests per windowMs
    message: {
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
};

// Audit logging function
export function auditLog(
  event: string,
  req: Request,
  details?: Record<string, any>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
    ...details,
  };

  // In production, this should go to a proper logging service
  console.log('[AUTH_AUDIT]', JSON.stringify(logEntry));
}

// Enhanced error response helper
function createAuthError(
  code: string,
  message: string,
  statusCode: number = 401,
  req?: Request
): AuthErrorResponse {
  const error: AuthErrorResponse = {
    success: false,
    code,
    message,
    timestamp: new Date().toISOString(),
  };

  if (req) {
    auditLog('AUTH_ERROR', req, { code, statusCode });
  }

  return error;
}

// Enhanced JWT token generation with additional claims
export function generateToken(payload: any): string {
  if (!JWT_CONFIG.secret) {
    throw new Error('JWT_SECRET not configured');
  }

  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    iss: JWT_CONFIG.issuer,
    aud: JWT_CONFIG.audience,
  };

  return jwt.sign(tokenPayload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
    algorithm: JWT_CONFIG.algorithm,
  });
}

// Enhanced token verification with additional security checks
export function verifyToken(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!JWT_CONFIG.secret) {
      reject(new Error('JWT_SECRET not configured'));
      return;
    }

    jwt.verify(token, JWT_CONFIG.secret, {
      algorithms: [JWT_CONFIG.algorithm],
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    }, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

// Main authentication middleware
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Add audit context
    req.auditContext = {
      timestamp: new Date(),
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    };

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      auditLog('AUTH_MISSING_TOKEN', req);
      const error = createAuthError('NO_TOKEN', 'Access token required', 401, req);
      res.status(401).json(error);
      return;
    }

    try {
      const decoded = await verifyToken(token);
      
      // Additional validation for token claims
      if (!decoded.id || !decoded.email) {
        auditLog('AUTH_INVALID_CLAIMS', req, { tokenClaims: Object.keys(decoded) });
        const error = createAuthError('INVALID_TOKEN_CLAIMS', 'Invalid token claims', 401, req);
        res.status(401).json(error);
        return;
      }

      // Set user info from token
      req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        roleId: decoded.roleId,
        organizationId: decoded.organizationId,
        permissions: decoded.permissions || [],
      };

      // Optional: Verify user still exists and is active (with caching)
      if (process.env.NODE_ENV === 'production' && db) {
        try {
          const [user] = await db
            .select({ id: users.id, isActive: users.isActive })
            .from(users)
            .where(eq(users.id, decoded.id));

          if (!user || !user.isActive) {
            auditLog('AUTH_USER_INACTIVE', req, { userId: decoded.id });
            const error = createAuthError('USER_INACTIVE', 'User account is inactive', 401, req);
            res.status(401).json(error);
            return;
          }
        } catch (dbError) {
          console.warn('Database check failed during token verification:', dbError);
          // Continue with token-based auth if DB is unavailable
        }
      }

      auditLog('AUTH_SUCCESS', req, { userId: req.user.id, role: req.user.role });
      next();
    } catch (tokenError) {
      auditLog('AUTH_TOKEN_INVALID', req, { error: tokenError.message });
      
      let errorCode = 'INVALID_TOKEN';
      let errorMessage = 'Invalid or expired token';
      
      if (tokenError.name === 'TokenExpiredError') {
        errorCode = 'TOKEN_EXPIRED';
        errorMessage = 'Token has expired';
      } else if (tokenError.name === 'JsonWebTokenError') {
        errorCode = 'TOKEN_MALFORMED';
        errorMessage = 'Token is malformed';
      }

      const error = createAuthError(errorCode, errorMessage, 401, req);
      res.status(401).json(error);
      return;
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    auditLog('AUTH_MIDDLEWARE_ERROR', req, { error: error.message });
    
    const authError = createAuthError(
      'AUTH_SERVICE_ERROR',
      'Authentication service temporarily unavailable',
      503,
      req
    );
    res.status(503).json(authError);
    return;
  }
};

// Role-based access control middleware
export function requireRole(role: string | string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      const error = createAuthError('NOT_AUTHENTICATED', 'Authentication required', 401, req);
      res.status(401).json(error);
      return;
    }

    const requiredRoles = Array.isArray(role) ? role : [role];
    
    if (!requiredRoles.includes(req.user.role)) {
      auditLog('AUTH_INSUFFICIENT_ROLE', req, { 
        userRole: req.user.role, 
        requiredRoles,
        userId: req.user.id 
      });
      
      const error = createAuthError('INSUFFICIENT_ROLE', 'Insufficient role permissions', 403, req);
      res.status(403).json(error);
      return;
    }

    next();
  };
}

// Permission-based access control middleware
export function requirePermission(permission: string | string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      const error = createAuthError('NOT_AUTHENTICATED', 'Authentication required', 401, req);
      res.status(401).json(error);
      return;
    }

    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    const userPermissions = req.user.permissions || [];
    
    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some(perm => 
      userPermissions.includes(perm) || 
      (process.env.NODE_ENV === 'development' && ['admin', 'developer'].includes(req.user!.role))
    );

    if (!hasPermission) {
      auditLog('AUTH_INSUFFICIENT_PERMISSIONS', req, { 
        userPermissions, 
        requiredPermissions,
        userId: req.user.id 
      });
      
      const error = createAuthError('INSUFFICIENT_PERMISSIONS', 'Insufficient permissions', 403, req);
      res.status(403).json(error);
      return;
    }

    next();
  };
}

// Organization-based access control middleware
export function requireSameOrganization(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    const error = createAuthError('NOT_AUTHENTICATED', 'Authentication required', 401, req);
    res.status(401).json(error);
    return;
  }

  // Skip organization check for super admins
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Check if user belongs to the same organization as the resource they're accessing
  // This would need to be customized based on the specific endpoint
  const resourceOrgId = req.params.organizationId || req.body.organizationId;
  
  if (resourceOrgId && req.user.organizationId !== parseInt(resourceOrgId)) {
    auditLog('AUTH_ORG_ACCESS_DENIED', req, { 
      userOrgId: req.user.organizationId, 
      requestedOrgId: resourceOrgId,
      userId: req.user.id 
    });
    
    const error = createAuthError('ORGANIZATION_ACCESS_DENIED', 'Access denied for this organization', 403, req);
    res.status(403).json(error);
    return;
  }

  next();
}

// Security headers middleware
export function addSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent XSS attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Ensure HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy for auth endpoints
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'none'; object-src 'none'");
  
  next();
}

// Health check for auth system
export function getAuthSystemHealth(): Record<string, any> {
  return {
    status: 'ok',
    jwt: {
      configured: !!JWT_CONFIG.secret,
      algorithm: JWT_CONFIG.algorithm,
      expiresIn: JWT_CONFIG.expiresIn,
    },
    database: {
      available: !!db,
      environment: process.env.NODE_ENV,
    },
    rateLimit: {
      enabled: true,
      loginLimit: authRateLimiters.login.options.max,
      registerLimit: authRateLimiters.register.options.max,
    },
    timestamp: new Date().toISOString(),
  };
}