import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { compare, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateToken } from '../middleware/auth-enhanced';

export const authRouter = Router();

// Secret for JWT signing - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set.');
}

// Health check endpoint
authRouter.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    environment: process.env.NODE_ENV,
    hasDB: !!process.env.DATABASE_URL,
    hasJWT: !!JWT_SECRET,
    timestamp: new Date().toISOString()
  });
});

// Zod schemas for validation
const loginSchema = z.object({
  email: z.string().email('Valid email address is required').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.string().optional().default('user'),
  roleId: z.number().optional(),
  organizationId: z.number().optional(),
});

/**
 * Middleware to validate request body against a Zod schema
 */
function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: Function) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid request',
      });
    }
  };
}

/**
 * Login endpoint - authenticates user with email and returns JWT
 */
authRouter.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    // Ensure we always return JSON
    res.setHeader('Content-Type', 'application/json');

    const { email, password } = req.body;

    // Development fallback - when database is not available
    if (process.env.NODE_ENV === 'development') {
      try {
        if (db) {
          // Try database first - query using email field with case-insensitive search
          const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
          
          if (user) {
            // Database user found, proceed with normal auth
            if (!user.isActive) {
              return res.status(401).json({
                success: false,
                message: 'Account is inactive. Please contact an administrator.',
              });
            }

            // Verify password
            let isPasswordValid = false;
            if (password === user.password) {
              isPasswordValid = true;
            } else if (user.password.startsWith('$2')) {
              try {
                isPasswordValid = await compare(password, user.password);
              } catch (error) {
                console.error('Password comparison error:', error);
              }
            }

            if (!isPasswordValid) {
              return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
              });
            }

            // Create JWT payload using email as identifier
            const payload = {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
              roleId: user.roleId,
              organizationId: user.organizationId,
            };

            // Sign token using the enhanced auth function
            const token = generateToken(payload);

            // Try to update last login time (don't fail if this errors)
            try {
              await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));
            } catch (updateError) {
              console.warn('Failed to update last login time:', updateError);
            }

            return res.status(200).json({
              success: true,
              token: token,
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                roleId: user.roleId,
                organizationId: user.organizationId,
                profileImage: user.profileImage,
              },
            });
          }
        }
      } catch (dbError) {
        console.warn('Database unavailable, using development fallback auth:', dbError);
      }

      // Development fallback - create a mock user for any email/password
      console.log('Using development fallback authentication for email:', email);
      
      const mockUser = {
        id: 1,
        username: email.split('@')[0],
        email: email,
        firstName: 'Dev',
        lastName: 'User',
        role: 'admin',
        roleId: 1,
        organizationId: 1,
        profileImage: null,
      };

      const payload = {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
        roleId: mockUser.roleId,
        organizationId: mockUser.organizationId,
      };

      const token = generateToken(payload);

      return res.status(200).json({
        success: true,
        token: token,
        user: mockUser,
      });
    }

    // Production mode - require database
    if (!db) {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable',
      });
    }
    
    // Query using email field with case-insensitive search
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

    if (!user) {
      console.log(`Login attempt failed: email ${email} not found`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact an administrator.',
      });
    }

    // Verify password - check if plain text match or hashed password
    let isPasswordValid = false;

    // First check if it's a plain text match (for development/seeded accounts)
    if (password === user.password) {
      isPasswordValid = true;
    } else {
      // If not a plain match, try bcrypt compare (for properly hashed passwords)
      try {
        // Only try to compare if the password appears to be hashed (starts with $2a$, $2b$, etc.)
        if (user.password.startsWith('$2')) {
          isPasswordValid = await compare(password, user.password);
        }
      } catch (error) {
        console.error('Password comparison error:', error);
        // Continue with isPasswordValid = false
      }
    }

    if (!isPasswordValid) {
      console.log(`Login attempt failed: incorrect password for ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Create JWT payload using email as identifier
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      roleId: user.roleId,
      organizationId: user.organizationId,
    };

    // Sign token using the enhanced auth function
    const token = generateToken(payload);

    // Update last login time
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));

    console.log(`Login successful for email: ${user.email}`);

    // Return token and user info
    return res.status(200).json({
      success: true,
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        roleId: user.roleId,
        organizationId: user.organizationId,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication service error',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

/**
 * Register endpoint - creates a new user with email validation
 */
authRouter.post('/register', validateBody(registerSchema), async (req: Request, res: Response) => {
  try {
    // Ensure we always return JSON
    res.setHeader('Content-Type', 'application/json');

    const { username, password, email, firstName, lastName, role, roleId, organizationId } =
      req.body;

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase();

    if (!db) {
      return res.status(503).json({
        success: false,
        message: 'Registration service unavailable - database not connected',
      });
    }

    // Check if username already exists
    const [existingUsername] = await db.select().from(users).where(eq(users.username, username));

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken',
      });
    }

    // Check if email already exists (case-insensitive)
    const [existingEmail] = await db.select().from(users).where(eq(users.email, normalizedEmail));

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    let hashedPassword = password; // Default to plain text for dev
    if (process.env.NODE_ENV === 'production') {
      try {
        hashedPassword = await hash(password, 10);
      } catch (hashError) {
        console.error('Password hashing error:', hashError);
        return res.status(500).json({
          success: false,
          message: 'Error creating user account',
        });
      }
    }

    // Create new user with normalized email
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        email: normalizedEmail,
        firstName,
        lastName,
        role: role || 'user',
        roleId,
        organizationId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        roleId: users.roleId,
        organizationId: users.organizationId,
      });

    console.log(`Registration successful for email: ${normalizedEmail}`);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(503).json({
      success: false,
      message: 'Registration service unavailable',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

/**
 * Verify token endpoint - validates JWT and returns user info
 */
authRouter.get('/verify', async (req: Request, res: Response) => {
  try {
    // Ensure we always return JSON
    res.setHeader('Content-Type', 'application/json');

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token using JWT_SECRET
      const decoded = jwt.verify(token, JWT_SECRET) as { 
        id: number; 
        username: string;
        email: string;
        role: string;
        roleId?: number;
        organizationId?: number;
      };

      // Development fallback - when database is not available
      if (process.env.NODE_ENV === 'development') {
        try {
          if (db) {
            // Try database first
            const [user] = await db.select().from(users).where(eq(users.id, decoded.id));

            if (user) {
              // Database user found, proceed with normal verification
              if (!user.isActive) {
                return res.status(401).json({
                  success: false,
                  message: 'Account is inactive',
                });
              }

              return res.status(200).json({
                success: true,
                user: {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  role: user.role,
                  roleId: user.roleId,
                  organizationId: user.organizationId,
                  profileImage: user.profileImage,
                },
              });
            }
          }
        } catch (dbError) {
          console.warn('Database unavailable, using token data for verification:', dbError);
        }

        // Development fallback - use token data
        console.log('Using development fallback verification for user:', decoded.email);
        
        return res.status(200).json({
          success: true,
          user: {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            firstName: 'Dev',
            lastName: 'User',
            role: decoded.role,
            roleId: decoded.roleId || 1,
            organizationId: decoded.organizationId || 1,
            profileImage: null,
          },
        });
      }

      // Production mode - require database
      if (!db) {
        return res.status(503).json({
          success: false,
          message: 'Database service unavailable',
        });
      }
      
      const [user] = await db.select().from(users).where(eq(users.id, decoded.id));

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive',
        });
      }

      // Return user info
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          roleId: user.roleId,
          organizationId: user.organizationId,
          profileImage: user.profileImage,
        },
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Middleware to check if the user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: Function) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number;
        username: string;
        role: string;
        roleId?: number;
        organizationId?: number;
      };

      // Attach user info to request object
      (req as any).user = decoded;

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Middleware to check if the user has a specific role
 */
export function hasRole(role: string) {
  return (req: Request, res: Response, next: Function) => {
    // First check if the user is authenticated
    isAuthenticated(req, res, () => {
      // User is authenticated, check role
      const user = (req as any).user;

      if (user.role !== role) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      next();
    });
  };
}
