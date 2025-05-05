## Security and Type Safety Guidelines

- All secrets are managed via GitHub Actions. Do not expose local .env files.
- Use the preconfigured GitHub workflows to ensure that environment variables and secrets are in sync.
- Type safety is enforced via strict TypeScript settings. Do not use “any” unless absolutely necessary.
- Ensure that component and plugin integrations follow the documented interfaces in `/lib/types`.
