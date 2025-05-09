# Architecture Overview

## 1. Overview

CRM7 is an enterprise workforce management platform designed for Australian Group Training Organizations (GTOs) to manage apprentices and host employers. It follows a microservices architecture pattern with named services like identity management, document storage, notification, compliance tracking, training management, and apprentice placement coordination.

## 2. System Architecture

### 2.1 Application Structure

The application follows a modern full-stack architecture with separate client and server components:

```
/
├── client/           # Frontend React application
├── server/           # Node.js Express backend
├── shared/           # Shared types and utilities
├── migrations/       # Database migration files
└── uploads/          # File upload directory
```

### 2.2 Tech Stack

- **Frontend**: React with TypeScript, running on Vite
- **Backend**: Node.js with Express
- **Database**: PostgreSQL via Supabase (as indicated by Supabase references)
- **ORM**: Drizzle for database schema management
- **Authentication**: JWT token-based authentication with Supabase Auth
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: TailwindCSS

### 2.3 Architecture Pattern

The application implements a hybrid architecture combining elements of:

1. **Microservices Pattern** - Multiple specialized services as mentioned in the README
2. **Client-Server Architecture** - Clear separation between frontend and backend
3. **REST API** - Backend exposes RESTful endpoints consumed by the frontend

## 3. Key Components

### 3.1 Frontend Components

The frontend is built using React with TypeScript, leveraging:

- **Vite**: For fast development and optimized builds
- **TailwindCSS**: For utility-first styling
- **shadcn/ui**: Component library built on Radix UI primitives
- **React Hook Form**: For form handling and validation
- **TanStack React Query**: For data fetching and state management

The client application uses a component-driven development approach with reusable atomic components.

### 3.2 Backend Services

The backend consists of several microservices, including:

- **crm7r-identity**: Authentication and identity management
- **crm7r-docs**: Document storage and management
- **crm7r-notify**: Notification and messaging service
- **crm7r-compliance**: Compliance tracking and reporting
- **crm7r-training**: Training and qualification management
- **crm7r-placement**: Apprentice placement coordination

Each service is responsible for a specific domain of functionality, following the Single Responsibility Principle.

### 3.3 Database Schema

The database uses PostgreSQL, managed through Supabase, with schema defined and managed using Drizzle ORM. Key tables include:

- User management tables
- Rate templates and calculations
- Document management
- Training and qualification tracking
- Placement and host employer data

Row Level Security (RLS) is implemented at the database level to enforce permissions.

### 3.4 Authentication and Authorization

The application uses Supabase Auth with JWT token handling for authentication. The system implements:

- Route protection for authenticated routes
- Role-based authorization
- Comprehensive permissions system with client and server-side components

### 3.5 API Structure

The backend exposes a RESTful API through Express. API endpoints are organized by domain:

- `/api/fairwork/` - Integration with Fair Work requirements
- `/api/payroll/` - Payroll and charge rate functionality
- Additional domain-specific endpoints for each area of functionality

## 4. Data Flow

### 4.1 Client-Server Communication

1. Frontend makes API requests to the backend server
2. Backend validates requests and applies authorization rules
3. Backend communicates with the database through Drizzle ORM
4. Data is returned to the client as JSON responses

### 4.2 Authentication Flow

1. User authenticates through Supabase Auth
2. JWT tokens are stored and managed
3. Tokens are included in requests to authorized endpoints
4. Backend validates tokens and applies role-based access control

### 4.3 File Upload Flow

1. Client uploads files via multipart form data
2. Server processes uploads using multer
3. Files are stored in the filesystem or cloud storage
4. File metadata is stored in the database

## 5. External Dependencies

### 5.1 External APIs

- **Training.gov.au API**: Integration for qualification details
- **Fair Work API**: For award rates and compliance requirements
- **Stripe API**: For payment processing (referenced in dependencies)

### 5.2 Third-Party Services

- **Supabase**: For database, authentication, and file storage
- **Sentry**: For error tracking (referenced in code)
- **Redis/KV Store**: For caching and session management (Upstash)

## 6. Deployment Strategy

### 6.1 Environment Configuration

The application supports different environments (development, test, production) through environment variables. Configuration files like:

- `.env.example` - Template for environment variables
- `drizzle.config.ts` - Database configuration
- `.replit` - Replit-specific configuration

### 6.2 Build Process

The build process uses Vite for the frontend and esbuild for the backend:

```
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
```

This creates optimized bundles for both client and server code.

### 6.3 Deployment Platforms

Based on configuration files, the application appears to be deployable to:

- **Vercel**: For frontend hosting
- **Replit**: For development and potentially deployment
- **General cloud platforms**: Through containerization (implied by project structure)

### 6.4 CI/CD

While not explicitly defined in the repository, the presence of GitHub workflow references suggests the use of GitHub Actions for CI/CD pipelines, including:

- Type generation and validation
- Environment variable management
- Testing and deployment

## 7. Development Practices

### 7.1 Code Quality

The project implements various tools to maintain code quality:

- **TypeScript**: For static type checking
- **ESLint**: For code linting
- **Prettier**: For code formatting
- **Vitest**: For testing (referenced in config)

### 7.2 Component Library

The application uses a component-driven development approach with shadcn/ui and follows a well-structured component hierarchy for consistency and reusability.

### 7.3 State Management

Based on dependencies, the application likely uses:

- React Query for server state
- React context or hooks for local state
- Form state management through React Hook Form

### 7.4 Permission System

The application implements a robust permission system with:

- Role-based access control with predefined roles (admin, developer, organization_admin, field_officer, host_employer, apprentice, rto_admin, labour_hire_worker)
- Permission format: `action:resource` (e.g., `read:labour_hire_worker`, `verify:labour_hire_worker_document`)
- Permission checking middleware: `hasPermission`, `requirePermission`, and `hasAnyPermission`
- Developer role has all permissions (wildcard access)
- Fine-grained permissions for different user roles
- Labour hire worker functionality with dedicated permissions

## 8. Security Considerations

The application implements several security measures:

- **JWT token-based authentication**
- **Role-based access control** with granular permissions system
- **Unified permission format** using `action:resource` pattern
- **Permission middleware** to protect all API routes
- **Row Level Security** in the database
- **Input validation and sanitization**
- **Environment variable management** for secrets
- **Document verification workflow** with proper status tracking

## 9. Future Development

Based on the TODO.md file, future development plans include:

- Implementing multi-factor authentication for admin users
- Integrating real-time notification system
- Creating progress reviews system
- Implementing proper dependency injection patterns
- Adding comprehensive error handling for API routes