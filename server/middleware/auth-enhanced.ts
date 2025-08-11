import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { env } from '../utils/env';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'NO_TOKEN',
      success: false
    });
  }

  const secret = env.JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not configured');
    return res.status(500).json({ 
      error: 'Authentication configuration error',
      code: 'JWT_CONFIG_ERROR',
      success: false
    });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.error('JWT verification failed:', err.message);
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
        success: false
      });
    }
    req.user = user;
    next();
  });
};

export const generateToken = (payload: any): string => {
  const secret = env.JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: env.JWT_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '7d'
  });
};