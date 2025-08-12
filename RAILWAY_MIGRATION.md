# Railway Railpack Migration Guide

## Overview
This repository has been configured for Railway's modern Railpack builder to replace the legacy Nixpacks configuration. The migration maintains the existing PNPM package manager and optimizes caching strategies.

## Configuration Files Added

### `railpack.json`
- **Schema**: Uses Railway's official schema `https://schema.railpack.com`
- **Package Manager**: PNPM 10.5.2 (maintains existing pnpm-lock.yaml)
- **Node.js Runtime**: 22 (as specified in requirements)
- **Caching Strategy**: Optimized for PNPM store, Vite cache, and build artifacts
- **Health Check**: Configured for `/api/health` endpoint with proper intervals

## Railway Service Configuration Steps

### 1. Update Builder Configuration
In Railway dashboard:
1. Go to your ApprenticeTracker service settings
2. Navigate to "Build" section
3. Change "Builder" from "NIXPACKS" to "RAILPACK"

### 2. Remove Legacy Environment Variables
Remove these obsolete environment variables:
- `NIXPACKS_PACKAGE_MANAGER=pnpm`
- `NIXPACKS_PNPM_VERSION=9.15.4` (or any version)

### 3. Verify Start Command
Ensure the start command is set to:
```
pnpm start
```
(This should be automatically detected from package.json)

### 4. Deploy and Monitor
1. Trigger a new deployment
2. Monitor the build logs for PNPM cache utilization
3. Verify health endpoint responds at `https://your-domain.railway.app/api/health`

## Health Check Verification

The application provides health endpoints at:
- `/api/health` - JSON response with system status
- `/health-check` - Simple "OK" response

Expected `/api/health` response:
```json
{
  "status": "ok",
  "timestamp": "2024-08-12T05:39:00.000Z",
  "service": "apprentice-tracker",
  "environment": "production",
  "fairwork_api": {
    "url_configured": true,
    "key_configured": true
  }
}
```

## Benefits of Railpack Migration

1. **Native PNPM Detection**: Automatic package manager detection via pnpm-lock.yaml
2. **Optimized Caching**: Multi-layer caching for dependencies and build artifacts
3. **Better Framework Support**: Enhanced support for Vite and Express applications
4. **Improved Build Times**: More efficient caching strategies reduce rebuild times
5. **Modern Architecture**: Latest Railway builder technology with ongoing support

## Rollback Plan

If issues occur, you can temporarily revert by:
1. Setting builder back to "NIXPACKS"
2. Re-adding the environment variables:
   - `NIXPACKS_PACKAGE_MANAGER=pnpm`
   - `NIXPACKS_PNPM_VERSION=10.5.2`
3. The railpack.json file can remain (it won't interfere with Nixpacks)

## Troubleshooting

### Common Issues
- **Build failures**: Check that all dependencies in package.json are installed
- **Start command not found**: Verify `pnpm start` script exists in package.json
- **Health check failures**: Ensure `/api/health` endpoint is accessible

### Build Logs to Monitor
- PNPM cache hits/misses
- Build artifact caching effectiveness
- Server startup time and memory usage

## Support
For Railway-specific issues, consult:
- Railway Documentation: https://docs.railway.app/
- Railway Discord: https://railway.app/discord
- Railpack Schema: https://schema.railpack.com