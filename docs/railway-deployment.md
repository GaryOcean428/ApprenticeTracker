# Railway Deployment Guide

## ✅ UPLOAD_DIR Issue Resolution

**Status: RESOLVED** - The UPLOAD_DIR environment variable issue that was blocking Railway deployments has been fixed:

- ✅ **UPLOAD_DIR removed from required variables** - No longer causes deployment failures
- ✅ **Zod schema default** - Defaults to `'uploads'` when not set
- ✅ **Graceful fallback** - Application starts successfully without explicit UPLOAD_DIR
- ✅ **Production optimization** - Recommended to use `/data/uploads` with persistent volume

## Configuration Type: Railpack

This application uses **Railway's Railpack** builder (not nixpacks). Configuration is managed via `railpack.json`.

## Environment Variables

### Required Variables (Production Only)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - At least 32 characters for security
- `FAIRWORK_API_URL` - Fair Work API endpoint
- `FAIRWORK_API_KEY` - Fair Work API authentication key

### Optional Variables with Defaults
- `UPLOAD_DIR` - Directory for file uploads
  - **Default**: `uploads/` (relative to project root)
  - **Production Recommended**: `/data/uploads` with persistent volume
  - **Note**: Application works without setting this variable
- `PORT` - Application port (default: 5000, auto-assigned by Railway)
- `NODE_ENV` - Environment mode (default: development)
- `JWT_EXPIRES_IN` - JWT token expiration (default: 7d)

## Persistent Storage Configuration

For production deployments, configure persistent storage to prevent data loss:

```bash
# Set upload directory to volume mount path
railway variables set UPLOAD_DIR=/data/uploads

# Create and attach volume
railway volume create --name uploads --mount /data/uploads
```

**Note**: The application will work without setting UPLOAD_DIR (it defaults to `uploads/`), but for production you should use persistent volumes to prevent data loss during redeployments.

## Deployment Validation

Use the deployment validation script to check configuration:

```bash
# Validate local configuration
./scripts/railway-deployment-check.sh

# Validate deployed application (replace with your domain)
./scripts/railway-deployment-check.sh your-app.up.railway.app
```

## Quick Deploy Commands

```bash
# Deploy from main branch
railway up

# Force rebuild and deploy
railway up --force

# Check deployment status
railway status

# View logs
railway logs
```

## Troubleshooting

### Missing Environment Variables Error
If you see `Missing required environment variables`, check:
1. Required production variables: `DATABASE_URL`, `JWT_SECRET`, `FAIRWORK_API_URL`, `FAIRWORK_API_KEY`
2. **Note**: `UPLOAD_DIR` is NOT required - it has a default value
3. All variables are properly set in Railway dashboard
4. API keys are valid and not expired

### File Upload Issues
If uploads fail or disappear after redeploy:
1. Verify UPLOAD_DIR points to mounted volume (e.g., `/data/uploads`)
2. Check volume is attached: `railway volume list`
3. Ensure write permissions on the directory
4. **Note**: Without persistent volume, uploads use ephemeral storage

### Health Check Failures
If health checks fail:
1. Verify app is listening on `0.0.0.0:$PORT`
2. Check `/healthz` endpoint returns 200 (Railway uses this)
3. Alternative health endpoints: `/api/health`, `/health-check`
4. Review logs for startup errors: `railway logs`

### Build Issues
If builds fail:
1. Ensure `railpack.json` is valid JSON
2. Check PNPM version compatibility (configured: 10.5.2)
3. Verify Node.js version (configured: 22)
4. Run `pnpm build` locally to test

### Environment Variable Best Practices
1. **Never hardcode sensitive values** in source code
2. **Use Railway's built-in variables** when available (e.g., `${{POSTGRES.DATABASE_URL}}`)
3. **Test locally** with production-like environment variables
4. **Document all variables** in `.env.example`
