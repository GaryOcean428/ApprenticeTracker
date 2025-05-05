# Deployment Guide

## Overview

This guide covers the deployment process for CRM7, including environment setup, build configuration, and monitoring.

## Deployment Environments

### 1. Development

- URL: `https://dev.crm7.example.com`
- Branch: `develop`
- Auto-deploy: Yes
- Environment: Development

### 2. Staging

- URL: `https://staging.crm7.example.com`
- Branch: `staging`
- Auto-deploy: On PR merge
- Environment: Staging

### 3. Production

- URL: `https://crm7.example.com`
- Branch: `main`
- Auto-deploy: Manual trigger
- Environment: Production

## Prerequisites

- Node.js ^18.17.0 (specified in .nvmrc)
- Yarn
- Vercel CLI
- Access to deployment environments
- Required environment variables

### Version Management

```bash
# Use correct Node version
nvm use

# Install dependencies with exact versions
yarn install --frozen-lockfile
```

## Environment Variables

### Environment Synchronization

We use GitHub Actions to automatically sync environment variables across different environments. The process is managed through two main components:

1. **Secret Sync Script** (`scripts/sync-github-secrets.sh`):

   - Automatically syncs environment variables from local `.env` files to GitHub Secrets
   - Handles sensitive information securely
   - Usage: `./scripts/sync-github-secrets.sh`

2. **Environment Sync Workflow** (`.github/workflows/sync-env.yml`):
   - Triggers on environment file changes
   - Syncs variables between preview and production environments
   - Maintains separate secrets for different deployment stages

### Supabase Type Generation

The project uses automated Supabase type generation through GitHub Actions:

1. **Type Generation Workflow** (`.github/workflows/supabase-types.yml`):

   - Automatically runs when migrations change
   - Generates TypeScript types from the database schema
   - Creates pull requests for type updates
   - Ensures type safety across the application

2. **Local Type Generation**:

   ```bash
   # Generate types manually
   yarn types

   # Watch for schema changes
   yarn types:watch

   # Sync with local database
   yarn types:sync
   ```

### Required Environment Variables

Create a `.env` file for each environment:

```env
# Next.js
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=

# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Authentication
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Feature Flags
NEXT_PUBLIC_FEATURE_FLAGS=
```

## Build Process

### 1. Install Dependencies

```bash
yarn install --frozen-lockfile
```

### Important Notes

- Use --frozen-lockfile flag in CI environments
- Ensure yarn version matches between local and CI environments

### 2. Type Check

```bash
yarn type-check
```

### 3. Run Tests

```bash
yarn test
```

### 4. Build Application

```bash
yarn build
```

### 5. Start Production Server

```bash
yarn start
```

## Deployment Process

### Using Vercel (Recommended)

1. Connect repository to Vercel:

   ```bash
   vercel link
   ```

2. Deploy to environment:

   ```bash
   # Development
   vercel deploy --env development

   # Staging
   vercel deploy --prod --env staging

   # Production
   vercel deploy --prod
   ```

### Manual Deployment

1. Build the application:

   ```bash
   yarn build
   ```

2. Deploy build artifacts:

   ```bash
   yarn deploy
   ```

3. Monitor deployment:

   ```bash
   yarn deploy:monitor
   ```

## Database Migrations

1. Generate migration:

   ```bash
   yarn supabase:migration:generate
   ```

2. Apply migration:

   ```bash
   yarn supabase:migration:up
   ```

3. Verify migration:

   ```bash
   yarn supabase:migration:status
   ```

## Monitoring & Logging

### 1. Sentry Integration

Monitor application errors:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENV,
  tracesSampleRate: 1.0,
});
```

### 2. Performance Monitoring

- Use Vercel Analytics
- Monitor Core Web Vitals
- Track custom metrics

### 3. Log Management

- Application logs: Vercel Logs
- Database logs: Supabase Console
- Error tracking: Sentry

## Security Measures

### 1. SSL Configuration

- Enforce HTTPS
- Configure SSL certificates
- Set up HSTS

### 2. Headers Configuration

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000',
  },
];
```

### 3. Authentication

- Configure Auth0 for each environment
- Set up proper CORS policies
- Implement rate limiting

## Rollback Procedures

### 1. Version Rollback

```bash
# Get deployment history
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-id>
```

### 2. Database Rollback

```bash
# Rollback last migration
yarn supabase:migration:down

# Rollback to specific version
yarn supabase:migration:down <version>
```

## Maintenance Mode

Enable maintenance mode when needed:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Maintenance-Mode',
            value: process.env.MAINTENANCE_MODE || 'false',
          },
        ],
      },
    ];
  },
};
```

## Performance Optimization

### 1. Build Optimization

1. Enable compression
2. Optimize images
3. Implement caching

### 2. Runtime Optimization

1. Configure serverless function regions
2. Optimize API routes
3. Set up CDN caching

## Deployment Checklist

### Pre-deployment

1. Run all tests
2. Check type definitions
3. Verify environment variables
4. Review security headers
5. Check dependencies for vulnerabilities

### Deployment

1. Deploy database migrations
2. Deploy application changes
3. Verify deployment status
4. Check monitoring systems

### Post-deployment

1. Verify application functionality
2. Monitor error rates
3. Check performance metrics
4. Update documentation

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Check Node.js version
   - Verify dependencies
   - Review build logs

2. **Database Connection Issues**

   - Verify connection strings
   - Check network access
   - Review database logs

3. **Authentication Problems**
   - Verify Auth0 configuration
   - Check callback URLs
   - Review authentication logs

## Contacts

- **DevOps Team**: <devops@crm7.example.com>
- **Security Team**: <security@crm7.example.com>
- **On-call Support**: +1-xxx-xxx-xxxx

---

Last Updated: 2025-01-22
