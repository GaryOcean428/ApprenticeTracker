# Authentication & Database Connectivity Fix

This document outlines the changes made to fix the authentication 401 (Unauthorized) and 503 (Service Unavailable) errors in the ApprenticeTracker application.

## Issues Addressed

1. **401 (Unauthorized) Errors**: JWT token validation failures due to missing or incorrect JWT_SECRET environment variable
2. **503 (Service Unavailable) Errors**: Database connectivity issues preventing user registration and authentication
3. **Username vs Email Inconsistency**: Authentication system using username field instead of email as primary identifier

## Key Changes Made

### 1. Environment Variable Updates

**File**: `server/utils/env.ts`
- Added JWT_SECRET validation (minimum 32 characters required)
- Added JWT_EXPIRES_IN configuration (default: 7d)
- Fixed FAIRWORK_API_URL validation to handle empty strings
- Enhanced production environment validation

```typescript
JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').optional(),
JWT_EXPIRES_IN: z.string().default('7d'),
```

### 2. Database Connection Enhancements  

**File**: `server/db.ts`
- Added support for both Neon Serverless and standard PostgreSQL connections
- Implemented SSL support for Railway PostgreSQL deployments
- Added graceful handling when DATABASE_URL is not set in development
- Enhanced connection error handling and logging

```typescript
ssl: process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false } 
  : false
```

### 3. Authentication Route Updates

**File**: `server/api/auth-routes.ts`
- **Login endpoint** now uses email instead of username as primary identifier
- Added case-insensitive email queries using `LOWER(email)`
- Enhanced error messages and proper HTTP status codes
- Added comprehensive JWT token generation and validation
- Improved development fallback authentication

Key changes:
```typescript
// Login schema now requires email
const loginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

// Case-insensitive email lookup
const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
```

### 4. Frontend Authentication Updates

**Files**: 
- `client/src/pages/auth/login.tsx`
- `client/src/hooks/use-auth.tsx`

- Updated login form to use email field instead of username
- Modified authentication hooks to send email in login requests
- Enhanced form validation with email format checking

```typescript
interface LoginCredentials {
  email: string;  // Changed from username
  password: string;
}
```

### 5. Enhanced JWT Middleware

**File**: `server/middleware/auth-enhanced.ts`
- Created dedicated JWT middleware with proper error handling
- Standardized token generation and validation
- Added comprehensive error codes and messages

```typescript
export const generateToken = (payload: any): string => {
  const secret = env.JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: env.JWT_EXPIRES_IN || '7d'
  });
};
```

### 6. CORS Configuration Updates

**File**: `server/index.ts`
- Added Railway domain support
- Enhanced origin validation with logging
- Added support for Railway environment variables

```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000', 
  process.env.RAILWAY_PUBLIC_DOMAIN && `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`,
  'https://crm7.up.railway.app'
].filter(Boolean);
```

### 7. Health Check Endpoints

**File**: `server/api/auth-routes.ts`
- Added `/api/auth/health` endpoint for monitoring
- Returns system status including database and JWT configuration
- Useful for debugging deployment issues

```typescript
authRouter.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    environment: process.env.NODE_ENV,
    hasDB: !!process.env.DATABASE_URL,
    hasJWT: !!JWT_SECRET,
    timestamp: new Date().toISOString()
  });
});
```

## Database Migration

**File**: `server/migrations/001_email_auth_setup.sql`
- Added case-insensitive email index for better performance
- Updated users table schema documentation
- Added trigger for automatic timestamp updates

## Testing and Deployment

### Environment Variables Required

For Railway deployment, ensure these environment variables are set:

```bash
# Required
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Optional
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### Generate Secure JWT Secret

```bash
openssl rand -base64 32
```

### Testing Authentication

Use the provided test script:

```bash
# Test locally
./scripts/test-auth-endpoints.sh http://localhost:5000

# Test Railway deployment  
./scripts/test-auth-endpoints.sh https://crm7.up.railway.app
```

### Setup Development Environment

```bash
# Run setup script to create .env file
./scripts/setup-env.sh

# Install dependencies
npm install

# Build application
npm run build

# Start development server
npm run dev
```

## Expected Behavior

### Successful Login Response (200)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "user"
  }
}
```

### Error Responses

#### 401 - Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### 503 - Database Unavailable
```json
{
  "success": false,
  "message": "Registration service unavailable"
}
```

## Troubleshooting

### Common Issues

1. **401 Errors**: Check JWT_SECRET is set and at least 32 characters
2. **503 Errors**: Verify DATABASE_URL is correct and database is accessible
3. **CORS Errors**: Ensure frontend domain is in allowedOrigins list
4. **Email Login Fails**: Verify email exists in database and password is correct

### Debug Health Endpoints

```bash
# Check authentication service health
curl https://crm7.up.railway.app/api/auth/health

# Check main application health  
curl https://crm7.up.railway.app/api/health
```

This comprehensive fix addresses all the authentication and database connectivity issues mentioned in issue #35, providing a robust email-based authentication system with proper error handling and Railway deployment support.