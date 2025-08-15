# Railway Deployment Guide

## Environment Variables

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string (required in production)
- `JWT_SECRET` - At least 32 characters for security (required in production)
- `FAIRWORK_API_URL` - Fair Work API endpoint (required in production)
- `FAIRWORK_API_KEY` - Fair Work API authentication key (required in production)

### Optional Variables with Defaults
- `UPLOAD_DIR` - Directory for file uploads (default: `uploads/`)
  - **Production Recommended**: `/data/uploads` with persistent volume
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
1. All required variables are set in Railway dashboard
2. Database URL is properly configured
3. API keys are valid and not expired

### File Upload Issues
If uploads fail or disappear after redeploy:
1. Verify UPLOAD_DIR points to mounted volume
2. Check volume is attached: `railway volume list`
3. Ensure write permissions on the directory

### Health Check Failures
If health checks fail:
1. Verify app is listening on `0.0.0.0:$PORT`
2. Check `/api/health` endpoint returns 200
3. Review logs for startup errors: `railway logs`
