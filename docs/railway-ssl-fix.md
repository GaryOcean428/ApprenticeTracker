# Railway PostgreSQL SSL Fix

## Issue
The application was failing to start on Railway with the error:
```
Database connection error: Error: self-signed certificate in certificate chain
```

## Root Cause
Railway PostgreSQL uses SSL certificates that may be self-signed or not properly trusted by default Node.js SSL verification. The application was also experiencing a race condition where database migrations ran before the connection was fully established.

## Solution
### 1. Enhanced SSL Configuration
Updated `server/db.ts` with Railway-compatible SSL settings:

```typescript
ssl: process.env.NODE_ENV === 'production' 
  ? { 
      rejectUnauthorized: false,        // Accept self-signed certificates
      requestCert: false,               // Don't request client certificate
      checkServerIdentity: () => undefined, // Disable hostname verification
    } 
  : false
```

### 2. Connection Initialization with Retry Logic
- Added `initializeDatabase()` function with retry logic (3 attempts, 2-second delays)
- Made database connection synchronous to ensure it's established before migrations
- Added proper connection timeout (10 seconds)

### 3. Migration Safety Checks
- Added database availability checks in migration functions
- Graceful degradation when database is not available in development
- Proper error handling to prevent cascading failures

## Files Modified
- `server/db.ts` - Enhanced SSL configuration and retry logic
- `server/index.ts` - Added database initialization before migrations
- `server/migrate-roles.ts` - Added database availability check
- `server/migrate-db.ts` - Added database availability check
- `server/seed-db.ts` - Added database availability check

## Testing
Run the Railway deployment test:
```bash
./scripts/railway-test.sh
```

## Railway Environment Variables
Ensure these are set in Railway:
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
NODE_ENV=production
FAIRWORK_API_KEY=your-api-key
FAIRWORK_API_URL=https://api.fairwork.gov.au
```

## Expected Behavior
After deployment, Railway logs should show:
- `✅ Database connected successfully` message
- Successful schema migrations
- No SSL certificate errors

## Troubleshooting
If issues persist:
1. Verify DATABASE_URL format includes `?sslmode=require`
2. Check Railway PostgreSQL SSL configuration
3. Review application startup logs for connection attempts
4. Ensure NODE_ENV=production is set in Railway