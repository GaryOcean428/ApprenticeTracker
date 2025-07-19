/**
 * Authentication middleware
 *
 * This middleware handles user authentication for protected API routes.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

// Extended Request interface with user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to verify the user is authenticated
 *
 * This middleware checks if the request has a valid
 * authentication token and adds the user to the request.
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    // For development purposes, skip authentication
    // In a production environment, this would verify tokens
    if (process.env.NODE_ENV === 'development') {
      // Set a default development user
      req.user = {
        id: 1,
        username: 'dev-user',
        role: 'admin',
      };
      return next();
    }

    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    // Handle both "Bearer token" and just "token" formats
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }

    // Verify the token
    const secretKey = process.env.JWT_SECRET || 'default-dev-secret';
    const decoded = jwt.verify(token, secretKey);

    // Add the user info to the request
    req.user = decoded;

    next();
  } catch (error) {
    logger.error('Authentication error', { error });
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
}

/**
 * Middleware to check if the user has the required role
 *
 * @param role The role required to access the route
 */
export function hasRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Not authenticated' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }

    next();
  };
}

/**
 * Middleware to check if the user has one of the required roles
 *
 * @param roles An array of roles that can access the route
 */
export function hasAnyRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }

    next();
  };
}

/**
 * Middleware to check if the user has the required permission
 *
 * @param permission The specific permission required to access the route
 */
export function hasPermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Not authenticated' });
    }

    // For development purposes, assume admin and developer roles have all permissions
    if (process.env.NODE_ENV === 'development' && ['admin', 'developer'].includes(req.user.role)) {
      return next();
    }

    // Check if user has the required permission
    // In a real implementation, this would check against a permissions array in the user object
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }

    next();
  };
}

/**
 * Middleware to check if the user has any of the required permissions
 *
 * @param permissions An array of permissions where having any one is sufficient
 */
export function hasAnyPermission(permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Not authenticated' });
    }

    // For development purposes, assume admin and developer roles have all permissions
    if (process.env.NODE_ENV === 'development' && ['admin', 'developer'].includes(req.user.role)) {
      return next();
    }

    // Check if user has any of the required permissions
    if (!req.user.permissions || !permissions.some(p => req.user.permissions.includes(p))) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }

    next();
  };
}
