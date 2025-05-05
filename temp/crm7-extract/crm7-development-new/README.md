# CRM7

A modern, comprehensive CRM system built with Next.js, focusing on training, safety, payroll, and HR management.

## Project Status

**Current Status**: Beta Development (75% Complete)
[View Full Technical Assessment](docs/TECHNICAL_ASSESSMENT.md)

[![GitHub Super-Linter](https://github.com/Arcane-Fly/crm7/actions/workflows/super-linter.yml/badge.svg)](https://github.com/marketplace/actions/super-linter)

> Maintaining high code quality with automated linting and formatting checks

## Project Overview

CRM7 is a unified platform that combines the best features from multiple CRM systems into a single, cohesive application. It provides a robust solution for managing client relationships, employee training, safety compliance, and HR operations.

## Getting Started

### Prerequisites

- Node.js ^18.17.0
- Yarn
- Supabase Account
- Auth0 Account

### Installation

```bash
# Clone the repository
git clone https://github.com/Arcane-Fly/crm7.git

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local

# Start development server
yarn dev
```

## Key Features

- **Modern Dashboard**: Real-time analytics and activity monitoring
- **Training & Development**: Course management and skill tracking
- **Safety & Compliance**: Incident reporting and compliance monitoring
- **Payroll & HR**: Award interpretation and employee management
- **Client Management**: Project tracking and communication tools

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: Zustand
- **Database**: Supabase
- **Testing**: Vitest, React Testing Library
- **API**: REST with planned GraphQL support

## Project Structure

```tree
crm7/
├── components/        # React components
├── lib/              # Core libraries and utilities
├── pages/            # Next.js pages
├── public/           # Static assets
├── styles/           # Global styles
└── tests/            # Test suites
```

## Documentation

### Development

- [Getting Started Guide](docs/GETTING_STARTED.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)
- [Code Style Guide](docs/CODE_STYLE.md)
- [Testing Guide](docs/TESTING.md)

### Architecture & Design

- [Technical Assessment](docs/TECHNICAL_ASSESSMENT.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [UI/UX Guidelines](docs/UI_UX_GUIDELINES.md)
- [Data Models](docs/DATA_MODELS.md)
- [API Documentation](docs/API.md)

### Deployment

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Environment Setup](docs/ENVIRONMENT.md)
- [Production Checklist](docs/PRODUCTION_CHECKLIST.md)

## Deployment Environments

The project uses three environments for deployment:

### Development Environment

- Branch: `development`
- Purpose: Active development and testing
- URL: [development.crm7.vercel.app](https://development.crm7.vercel.app)
- Auto-deploys: All commits to `development` branch

### Preview Environment

- Branch: `preview`
- Purpose: Testing and reviewing changes before production
- URL: Unique URL per pull request
- Auto-deploys: All pull requests

### Production Environment

- Branch: `master`
- Purpose: Live production environment
- URL: [crm7.vercel.app](https://crm7.vercel.app)
- Auto-deploys: Merged PRs to `master` after review
- Protection: Requires review and 5-minute wait

## Development Workflow

1. Create a feature branch from `development`
2. Make your changes and push to the feature branch
3. Create a PR to merge into `development`
4. After testing in development, create a PR to `preview`
5. Once approved, create a PR to `master` for production deployment

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details on how to get started.

## Testing

```bash
# Run unit tests
yarn test

# Run tests with UI
yarn test:ui

# Run tests with coverage
yarn test:coverage

# Run E2E tests
yarn test:e2e
```

## License

This project is private and confidential. All rights reserved.

## Support

For support, please:

1. Check our [Documentation](docs/)
1. Open an issue
1. Contact the development team

---

Built with ❤️ by the CRM7 Team
