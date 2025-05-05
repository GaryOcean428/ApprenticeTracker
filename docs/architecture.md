# Application Architecture

## Overview
This document provides a comprehensive overview of the application architecture, design patterns, and major components.

## Architecture Pattern
The application follows a modified MVC (Model-View-Controller) architecture pattern with the following components:

- **Models**: Defined in `shared/schema.ts` using Drizzle ORM
- **Views**: React components in the client side
- **Controllers**: API routes in the server side

## Directory Structure

### Client-side
- `components/`: Reusable UI components
  - `common/`: Shared atomic components
  - `ui/`: shadcn UI components
  - Feature-specific component folders
- `hooks/`: Custom React hooks
- `lib/`: Utility functions and services
- `pages/`: Page components corresponding to routes
- `contexts/`: React context providers
- `services/`: API service abstractions

### Server-side
- `api/`: API route definitions
- `middleware/`: Express middleware
- `services/`: Business logic services
- `microservices/`: Specialized domain services
- `utils/`: Utility functions

## Data Flow
1. Client makes a request through React Query
2. Request is processed through API routes
3. API routes use services for business logic
4. Services interact with the database through the storage layer
5. Response flows back to the client

## Authentication Flow
The application uses JWT-based authentication with role-based access control:

1. User logs in through `/api/auth/login`
2. Server validates credentials and returns a JWT token
3. Client stores JWT token and includes it in subsequent requests
4. Server-side middleware validates the token and checks permissions

## Microservices Architecture

The application is designed with a microservices approach, with the following key services:

- `crm7r-identity`: User authentication and management
- `crm7r-docs`: Document storage and management
- `crm7r-notify`: Notification system
- `crm7r-placement`: Apprentice placement management
- `crm7r-training`: Training and qualification tracking
- `crm7r-payroll`: Payroll and timesheet management
- `crm7r-compliance`: Compliance with Australian standards

## Permission System

The application implements a role-based access control system with the following roles:

- Developer: Platform-level access
- Admin: Organization-wide access
- Organization Admin: Access to specific organization resources
- Field Officer: Access to assigned apprentices and hosts
- Host Employer: Access to their own data and assigned apprentices
- Apprentice: Access to their own data and submissions
- RTO Admin: Access to training and qualification data

## External Integrations

- Training.gov.au API: For qualification and competency data
- Fair Work API: For awards, classifications, and rates
- Document storage services
- Notification services (email, SMS)

## Database Schema

The application uses PostgreSQL with Drizzle ORM. Key entities include:

- Users
- Organizations
- Apprentices
- Host Employers
- Placements
- Training Contracts
- Qualifications
- Units of Competency
- Timesheets
- Documents
- Compliance Records
