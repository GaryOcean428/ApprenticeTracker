# Deployment Guide

...

## Type Generation and CI/CD Integration

Our project now automatically generates and updates Supabase TypeScript definitions. When changes are made to migration files, the GitHub Actions workflow (supabase-types.yml) regenerates types by running:

  pnpm types

If any changes are detected, an automated pull request is created. For local development, run:

  pnpm types  
  pnpm types:watch

Review the generated types in `lib/types/database.ts` and ensure your changes are type-safe.

## Environment Variable Management

Environment variables are securely synced using our sync-env.yml workflow and the sync-github-secrets.sh script. See guidelines below for all necessary tokens and keys.
