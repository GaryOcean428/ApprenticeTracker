# Auth0 Deploy CLI Tool Documentation

The Auth0 Deploy CLI tool enables you to manage Auth0 tenants through infrastructure as code. This allows you to version and automate the deployment of Auth0 configurations across different environments.

## Installation

```bash
npm install -g auth0-deploy-cli
```

## Configuration

### Authentication

The CLI requires credentials to access your Auth0 tenant. You can provide these in two ways:

1. Environment variables:

```bash
export AUTH0_DOMAIN=your-tenant.auth0.com
export AUTH0_CLIENT_ID=your-client-id
export AUTH0_CLIENT_SECRET=your-client-secret
```

2. Configuration file (auth0-deploy-cli.json):

```json
{
  "AUTH0_DOMAIN": "your-tenant.auth0.com",
  "AUTH0_CLIENT_ID": "your-client-id",
  "AUTH0_CLIENT_SECRET": "your-client-secret"
}
```

### Directory Structure

The CLI expects your Auth0 configuration files to be organized in a specific structure:

```
tenant/
├── tenant.yaml          # Tenant settings
├── clients/            # Client (application) configurations
├── databases/          # Database connections
├── emails/            # Email templates and providers
├── grants/            # Client grants
├── pages/             # Custom hosted pages
├── resource-servers/  # APIs (resource servers)
├── roles/             # Custom roles
├── rules/             # Rules
└── connections/       # Social, enterprise connections
```

## Basic Commands

### Export Existing Configuration

Export your current Auth0 tenant configuration:

```bash
a0deploy export --config_file config.json --format yaml --output_folder ./tenant
```

### Deploy Configuration

Deploy configuration to your Auth0 tenant:

```bash
a0deploy import --config_file config.json --input_file ./tenant
```

### Dump Configuration

View the current tenant configuration:

```bash
a0deploy dump --config_file config.json
```

## Configuration Files

### tenant.yaml Example

```yaml
rules: []
pages: []
databases:
  - name: Username-Password-Authentication
    strategy: auth0
    enabled_clients:
      - My Application
resourceServers:
  - name: My API
    identifier: https://api.example.com
    scopes:
      - value: read:users
        description: Read users
clients:
  - name: My Application
    callbacks:
      - http://localhost:4200/callback
```

## Best Practices

1. **Version Control**: Keep your Auth0 configuration in version control
2. **Environment Variables**: Use environment variables for sensitive values
3. **CI/CD Integration**: Automate deployments through your CI/CD pipeline
4. **Review Changes**: Always review the planned changes before deployment
5. **Backup**: Export and backup your configuration regularly

## Common Use Cases

### Managing Multiple Environments

```bash
# Export production config
a0deploy export --config_file prod-config.json --output_folder ./tenant-prod

# Import to staging environment
a0deploy import --config_file staging-config.json --input_file ./tenant-prod
```

### Automated Deployments

Example GitHub Actions workflow:

```yaml
name: Deploy Auth0

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Auth0
        run: |
          npm install -g auth0-deploy-cli
          a0deploy import --config_file auth0-deploy-cli.json --input_file ./tenant
        env:
          AUTH0_DOMAIN: ${{ secrets.AUTH0_DOMAIN }}
          AUTH0_CLIENT_ID: ${{ secrets.AUTH0_CLIENT_ID }}
          AUTH0_CLIENT_SECRET: ${{ secrets.AUTH0_CLIENT_SECRET }}
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**

   - Verify your credentials are correct
   - Ensure the client has all required scopes

2. **Rate Limiting**

   - Implement exponential backoff
   - Reduce concurrent operations

3. **Configuration Conflicts**
   - Export current configuration before importing
   - Review changes before deployment

### Debug Mode

Enable debug logging:

```bash
DEBUG=auth0-deploy-cli* a0deploy import --config_file config.json --input_file ./tenant
```

## Security Considerations

1. **Credentials Management**

   - Use environment variables for secrets
   - Rotate client secrets regularly
   - Use restricted clients for deployment

2. **Access Control**
   - Create dedicated deployment clients
   - Limit client scopes to required permissions
   - Use separate clients for different environments

## Additional Resources

- [Auth0 Deploy CLI GitHub Repository](https://github.com/auth0/auth0-deploy-cli)
- [Auth0 Deploy CLI NPM Package](https://www.npmjs.com/package/auth0-deploy-cli)
- [Auth0 Management API Documentation](https://auth0.com/docs/api/management/v2)
