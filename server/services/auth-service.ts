import { compare, hash } from 'bcrypt';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq, sql, and } from 'drizzle-orm';
import { generateToken, auditLog } from '../middleware/auth-unified';
import { Request } from 'express';

// User cache for improved performance
const userCache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Validation schemas
export const ValidationRules = {
  email: {
    regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: 'Please enter a valid email address',
  },
  password: {
    minLength: 8,
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
  },
  username: {
    minLength: 3,
    maxLength: 50,
    regex: /^[a-zA-Z0-9_-]+$/,
    message: 'Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens',
  },
};

// Standardized service response interface
interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// User data interface
interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleId?: number;
  organizationId?: number;
  isActive: boolean;
  profileImage?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Login credentials interface
interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data interface
interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  roleId?: number;
  organizationId?: number;
}

// Enhanced input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\w\s@.-]/g, '') // Remove special characters except common ones
    .slice(0, 255); // Limit length
}

// Enhanced email validation
export function validateEmail(email: string): { isValid: boolean; message?: string } {
  const sanitized = sanitizeInput(email.toLowerCase());
  
  if (!sanitized) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!ValidationRules.email.regex.test(sanitized)) {
    return { isValid: false, message: ValidationRules.email.message };
  }
  
  return { isValid: true };
}

// Enhanced password validation
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < ValidationRules.password.minLength) {
    return { 
      isValid: false, 
      message: `Password must be at least ${ValidationRules.password.minLength} characters long` 
    };
  }
  
  // In production, enforce strong password requirements
  if (process.env.NODE_ENV === 'production' && !ValidationRules.password.regex.test(password)) {
    return { isValid: false, message: ValidationRules.password.message };
  }
  
  return { isValid: true };
}

// Cache management functions
function getCachedUser(key: string): any | null {
  const cached = userCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  userCache.delete(key);
  return null;
}

function setCachedUser(key: string, data: any): void {
  userCache.set(key, {
    data,
    expires: Date.now() + CACHE_TTL,
  });
}

// Enhanced user lookup with caching
async function findUserByEmail(email: string, useCache: boolean = true): Promise<UserData | null> {
  const cacheKey = `user:email:${email.toLowerCase()}`;
  
  if (useCache) {
    const cached = getCachedUser(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  try {
    if (!db) {
      throw new Error('Database not available');
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(sql`LOWER(${users.email})`, email.toLowerCase()));
    
    if (user && useCache) {
      setCachedUser(cacheKey, user);
    }
    
    return user || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw new Error('Database query failed');
  }
}

// Enhanced user lookup by ID with caching
async function findUserById(id: number, useCache: boolean = true): Promise<UserData | null> {
  const cacheKey = `user:id:${id}`;
  
  if (useCache) {
    const cached = getCachedUser(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  try {
    if (!db) {
      throw new Error('Database not available');
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    
    if (user && useCache) {
      setCachedUser(cacheKey, user);
    }
    
    return user || null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw new Error('Database query failed');
  }
}

// Enhanced password verification
async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    // Check for plain text password (development/seeded accounts)
    if (plainPassword === hashedPassword) {
      return true;
    }
    
    // Check for bcrypt hashed password
    if (hashedPassword.startsWith('$2')) {
      return await compare(plainPassword, hashedPassword);
    }
    
    return false;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// Enhanced password hashing
async function hashPassword(password: string): Promise<string> {
  try {
    // Use plain text in development for easier debugging
    if (process.env.NODE_ENV === 'development') {
      return password;
    }
    
    return await hash(password, 12); // Increased salt rounds for better security
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

// Authentication service class
export class AuthService {
  // Enhanced login service
  static async login(credentials: LoginCredentials, req?: Request): Promise<ServiceResponse<{
    token: string;
    user: Partial<UserData>;
    expiresAt: Date;
  }>> {
    try {
      const { email, password } = credentials;
      
      // Validate input
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        auditLog('LOGIN_INVALID_EMAIL', req!, { email, error: emailValidation.message });
        return {
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: emailValidation.message!,
          },
        };
      }
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        auditLog('LOGIN_WEAK_PASSWORD', req!, { email });
        return {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: passwordValidation.message!,
          },
        };
      }
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        try {
          const user = await findUserByEmail(email);
          if (user) {
            // Database user found - proceed with normal authentication
            return await this.authenticateUser(user, password, req);
          }
        } catch (dbError) {
          console.warn('Database unavailable, using development fallback:', dbError);
        }
        
        // Development fallback - create mock user
        auditLog('LOGIN_DEV_FALLBACK', req!, { email });
        return await this.createDevFallbackLogin(email, req);
      }
      
      // Production authentication
      if (!db) {
        auditLog('LOGIN_DB_UNAVAILABLE', req!, { email });
        return {
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Authentication service temporarily unavailable',
          },
        };
      }
      
      const user = await findUserByEmail(email);
      if (!user) {
        auditLog('LOGIN_USER_NOT_FOUND', req!, { email });
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        };
      }
      
      return await this.authenticateUser(user, password, req);
      
    } catch (error) {
      console.error('Login service error:', error);
      auditLog('LOGIN_SERVICE_ERROR', req!, { error: error.message });
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: 'Authentication service error',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
      };
    }
  }
  
  // User authentication logic
  private static async authenticateUser(user: UserData, password: string, req?: Request): Promise<ServiceResponse<{
    token: string;
    user: Partial<UserData>;
    expiresAt: Date;
  }>> {
    // Check if user is active
    if (!user.isActive) {
      auditLog('LOGIN_USER_INACTIVE', req!, { userId: user.id, email: user.email });
      return {
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'Account is inactive. Please contact an administrator.',
        },
      };
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      auditLog('LOGIN_INVALID_PASSWORD', req!, { userId: user.id, email: user.email });
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      };
    }
    
    // Create JWT payload
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      roleId: user.roleId,
      organizationId: user.organizationId,
    };
    
    // Generate token
    const token = generateToken(tokenPayload);
    
    // Calculate expiration date
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days
    
    // Update last login time (non-blocking)
    this.updateLastLogin(user.id).catch(error => 
      console.warn('Failed to update last login time:', error)
    );
    
    // Clear cached user data to ensure fresh data on next request
    userCache.delete(`user:id:${user.id}`);
    userCache.delete(`user:email:${user.email.toLowerCase()}`);
    
    auditLog('LOGIN_SUCCESS', req!, { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });
    
    return {
      success: true,
      data: {
        token,
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
        expiresAt,
      },
    };
  }
  
  // Development fallback login
  private static async createDevFallbackLogin(email: string, req?: Request): Promise<ServiceResponse<{
    token: string;
    user: Partial<UserData>;
    expiresAt: Date;
  }>> {
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
    
    const token = generateToken(mockUser);
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
    
    return {
      success: true,
      data: {
        token,
        user: mockUser,
        expiresAt,
      },
    };
  }
  
  // Enhanced registration service
  static async register(userData: RegisterData, req?: Request): Promise<ServiceResponse<{
    user: Partial<UserData>;
    message: string;
  }>> {
    try {
      const { username, email, password, firstName, lastName, role, roleId, organizationId } = userData;
      
      // Validate inputs
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: emailValidation.message!,
          },
        };
      }
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: passwordValidation.message!,
          },
        };
      }
      
      // Sanitize inputs
      const sanitizedData = {
        username: sanitizeInput(username),
        email: sanitizeInput(email.toLowerCase()),
        firstName: sanitizeInput(firstName),
        lastName: sanitizeInput(lastName),
        role: role || 'user',
      };
      
      if (!db) {
        auditLog('REGISTER_DB_UNAVAILABLE', req!, { email: sanitizedData.email });
        return {
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Registration service temporarily unavailable',
          },
        };
      }
      
      // Check for existing username
      const existingUsername = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, sanitizedData.username));
      
      if (existingUsername.length > 0) {
        auditLog('REGISTER_USERNAME_EXISTS', req!, { 
          email: sanitizedData.email, 
          username: sanitizedData.username 
        });
        return {
          success: false,
          error: {
            code: 'USERNAME_EXISTS',
            message: 'Username already taken',
          },
        };
      }
      
      // Check for existing email
      const existingEmail = await findUserByEmail(sanitizedData.email, false);
      if (existingEmail) {
        auditLog('REGISTER_EMAIL_EXISTS', req!, { email: sanitizedData.email });
        return {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already registered',
          },
        };
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          username: sanitizedData.username,
          password: hashedPassword,
          email: sanitizedData.email,
          firstName: sanitizedData.firstName,
          lastName: sanitizedData.lastName,
          role: sanitizedData.role,
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
      
      auditLog('REGISTER_SUCCESS', req!, { 
        userId: newUser.id, 
        email: sanitizedData.email,
        role: sanitizedData.role 
      });
      
      return {
        success: true,
        data: {
          user: newUser,
          message: 'User registered successfully',
        },
      };
      
    } catch (error) {
      console.error('Registration service error:', error);
      auditLog('REGISTER_SERVICE_ERROR', req!, { error: error.message });
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: 'Registration service error',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
      };
    }
  }
  
  // Enhanced user verification service
  static async verifyUser(userId: number, req?: Request): Promise<ServiceResponse<{
    user: Partial<UserData>;
  }>> {
    try {
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        try {
          if (db) {
            const user = await findUserById(userId);
            if (user) {
              return await this.createUserVerificationResponse(user, req);
            }
          }
        } catch (dbError) {
          console.warn('Database unavailable, using token data for verification:', dbError);
        }
        
        // Development fallback - use token data
        auditLog('VERIFY_DEV_FALLBACK', req!, { userId });
        return {
          success: true,
          data: {
            user: {
              id: userId,
              username: 'dev-user',
              email: 'dev@example.com',
              firstName: 'Dev',
              lastName: 'User',
              role: 'admin',
              roleId: 1,
              organizationId: 1,
              profileImage: null,
            },
          },
        };
      }
      
      // Production verification
      if (!db) {
        return {
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Verification service temporarily unavailable',
          },
        };
      }
      
      const user = await findUserById(userId);
      if (!user) {
        auditLog('VERIFY_USER_NOT_FOUND', req!, { userId });
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        };
      }
      
      return await this.createUserVerificationResponse(user, req);
      
    } catch (error) {
      console.error('User verification error:', error);
      auditLog('VERIFY_SERVICE_ERROR', req!, { userId, error: error.message });
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: 'Verification service error',
        },
      };
    }
  }
  
  // User verification response
  private static async createUserVerificationResponse(user: UserData, req?: Request): Promise<ServiceResponse<{
    user: Partial<UserData>;
  }>> {
    if (!user.isActive) {
      auditLog('VERIFY_USER_INACTIVE', req!, { userId: user.id });
      return {
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'Account is inactive',
        },
      };
    }
    
    auditLog('VERIFY_SUCCESS', req!, { userId: user.id, role: user.role });
    
    return {
      success: true,
      data: {
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
      },
    };
  }
  
  // Update last login time
  private static async updateLastLogin(userId: number): Promise<void> {
    try {
      if (db) {
        await db
          .update(users)
          .set({ lastLogin: new Date() })
          .where(eq(users.id, userId));
      }
    } catch (error) {
      console.warn('Failed to update last login time:', error);
    }
  }
  
  // Clear user cache
  static clearUserCache(userId?: number, email?: string): void {
    if (userId) {
      userCache.delete(`user:id:${userId}`);
    }
    if (email) {
      userCache.delete(`user:email:${email.toLowerCase()}`);
    }
    if (!userId && !email) {
      userCache.clear();
    }
  }
  
  // Get cache statistics
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: userCache.size,
      keys: Array.from(userCache.keys()),
    };
  }
}