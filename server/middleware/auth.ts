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
        role: 'admin'
      };
      return next();
    }
    
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
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