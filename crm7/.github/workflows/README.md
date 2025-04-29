# GitHub Actions Workflows

## Deploy Workflow

The deploy workflow handles building, testing and deploying the CRM application through multiple environments.

### Environment Variables

- `NODE_VERSION`: Version of Node.js used across jobs
- `NEXT_PUBLIC_API_URL`: Public API URL (set via repository variables)

### Secrets Used

The following secrets should be configured in the repository:

- `DATABASE_URL`: Database connection string
- `BLOB_READ_WRITE_TOKEN`: Token for blob storage access
- `POSTGRES_PRISMA_URL`: Prisma database connection URL

### Environments

- **Staging**: Pre-production environment for testing
- **Production**: Live production environment

### Job Flow

1. `build`: Builds the application and caches dependencies
2. `test`: Runs test suite (depends on build)
3. `deploy-staging`: Deploys to staging (depends on build and test)
4. `deploy-production`: Deploys to production (depends on deploy-staging)
