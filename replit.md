# Australian Apprentice Management Platform (CRM7) - Replit Guide

## Overview

CRM7 is a comprehensive enterprise workforce management platform designed specifically for Australian Group Training Organizations (GTOs). It provides end-to-end management of apprentices, host employers, compliance tracking, and payroll processing with built-in integrations to Australian government systems including Fair Work and Training.gov.au.

## System Architecture

### Frontend Architecture
- **Framework**: React 19.0.0 with Vite bundler
- **Styling**: TailwindCSS with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: File-based routing using client-side React Router
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication system
- **API Design**: RESTful endpoints with standardized error handling
- **File Storage**: Local file system with structured upload directory

### Database Architecture
- **ORM**: Drizzle with TypeScript schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon Database (PostgreSQL-compatible)
- **Schema**: Shared schema definitions in `/shared/schema.ts`

## Key Components

### Authentication System
- JWT token-based authentication
- Role-based access control (RBAC)
- Protected routes with middleware validation
- Session management with automatic token refresh

### Core Modules
1. **Apprentice Management**: Complete lifecycle tracking from recruitment to completion
2. **Host Employer Management**: Onboarding, compliance, and placement coordination
3. **WHS (Work Health & Safety)**: Incident reporting, risk assessments, and compliance tracking
4. **Payroll Processing**: Award rate calculations with Fair Work API integration
5. **Document Management**: Secure file upload and storage system
6. **Compliance Tracking**: Australian GTO standards and Fair Work requirements

### External Integrations
- **Fair Work API**: Real-time award rate data and calculations
- **Training.gov.au**: Qualification and unit competency information
- **SendGrid**: Email notifications and communications
- **Stripe**: Payment processing (planned)

## Data Flow

### Client-Server Communication
1. React frontend makes API calls to Express backend
2. Backend validates JWT tokens for authentication
3. Database operations performed through Drizzle ORM
4. Responses formatted with standardized error handling
5. Real-time updates managed through React Query caching

### File Upload Process
1. Files uploaded to `/uploads` directory via Express middleware
2. File metadata stored in database with security validation
3. Access controlled through authentication middleware
4. Structured storage with organizational separation

### External API Integration
1. Fair Work API calls cached and rate-limited
2. Training.gov.au data synchronized for qualifications
3. Email notifications sent through SendGrid service
4. Error handling with graceful fallbacks

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **@sendgrid/mail**: Email service integration
- **jsonwebtoken**: JWT authentication
- **bcrypt**: Password hashing

### Development Dependencies
- **@types/node**: Node.js type definitions
- **@typescript-eslint/parser**: TypeScript linting
- **prettier**: Code formatting
- **tsx**: TypeScript execution for development

### Build Tools
- **Vite**: Frontend build tool and development server
- **esbuild**: Server-side bundling for production
- **TypeScript**: Type checking and compilation

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Ports**: 5000 (backend), 5001 (frontend)
- **Hot Reload**: Enabled for both client and server
- **Database**: Uses DATABASE_URL environment variable

### Production Build
- **Build Process**: 
  1. Vite builds client-side assets to `/dist/public`
  2. esbuild bundles server code to `/dist`
  3. Static files served from compiled output
- **Server**: `production-server.js` serves compiled application
- **Health Checks**: `/health` and `/health-check` endpoints

### Replit Configuration
- **Platform**: Node.js 20 with PostgreSQL 16
- **Auto-scaling**: Configured for production deployment
- **Port Mapping**: 5000 → 80, 5001 → 3000
- **Environment**: Production variables managed through Replit secrets

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Production start
npm run start:prod
```

## Changelog

- June 25, 2025. Initial setup
- June 25, 2025. Fixed deployment syntax error in use-auth.tsx and corrected production server configuration
- June 25, 2025. Resolved deployment issues: Fixed 401 Fair Work API errors and styling problems in production
- June 25, 2025. Successfully removed authentication middleware from Fair Work award-updates endpoint, resolving 401 errors
- June 25, 2025. Fixed favicon 500 error by adding proper favicon handling and copying favicon assets
- June 25, 2025. Added favicon handling to production servers and ensured favicon is included in build output
- June 25, 2025. Fixed production server configuration for proper asset serving and API route registration

## User Preferences

Preferred communication style: Simple, everyday language.