# Braden Group CRM7 - Australian Apprentice Management Platform

## Overview

CRM7 is a comprehensive enterprise workforce management platform designed specifically for Australian Group Training Organizations (GTOs), focusing on apprentice and host employer management. The platform provides an integrated digital ecosystem with interconnected components including a public-facing website, admin portals, and the core CRM system.

## Key Features

- **Integrated Authentication System**: Single sign-on across all system components with role-based access control
- **Apprentice Management**: Complete lifecycle management from recruitment to completion
- **Host Employer Management**: Employer onboarding, compliance tracking, and placement management
- **Compliance Tracking**: Fair Work requirements and GTO standards compliance monitoring
- **Training Integration**: Connection with Training.gov.au for qualification details
- **Document Management**: Secure storage and retrieval of essential documents
- **Timesheet Processing**: Apprentice timesheet submission, approval, and reporting
- **Placement Tracking**: End-to-end management of apprentice placements
- **Field Officer Tools**: Mobile-optimized interfaces for field operations
- **Reporting & Analytics**: Comprehensive reporting on all aspects of the business

## Architecture

CRM7 is built using a microservices pattern with named services:

- **crm7r-identity**: Authentication and identity management
- **crm7r-docs**: Document storage and management
- **crm7r-notify**: Notification and messaging service
- **crm7r-compliance**: Compliance tracking and reporting
- **crm7r-training**: Training and qualification management
- **crm7r-placement**: Apprentice placement coordination

## Technical Stack

- **Frontend**: Next.js 15.1.6, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js with Express
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with JWT token handling
- **Security**: Role-based authentication with Row Level Security (RLS)

## Development Status

The platform is currently under active development with the following major components implemented:

- ✅ Authentication system with JWT token handling and proper redirects
- ✅ Route protection for all major sections
- ✅ Comprehensive permissions system with client and server-side components
- ✅ Integration with Training.gov.au API
- ✅ Host employer management interface
- ✅ Apprentice profile system
- ✅ Document upload and management

## Application Structure

- `/client`: Frontend application code
- `/server`: Backend API and services
- `/shared`: Shared types and utilities
- `/docs`: System documentation

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- **Architecture**: `architecture.md`, `system-architecture.md`
- **Code Standards**: `code-standards.md`, `component-library.md`
- **API Documentation**: `fair-work-api.md`, `tga-api.md`
- **System Requirements**: `national-standards-summary.md`, `gto-compliance.md`
- **Development Strategy**: `upgrade-roadmap.md`, `gap-analysis.md`, `competitor-comparison.md`
- **Performance**: `performance-optimization.md`, `testing-strategy.md`

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database
- Supabase account (for authentication)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the development server: `npm run dev`

## Development Roadmap

CRM7 follows a strategic development roadmap based on comprehensive analysis of regulatory requirements and industry best practices. See our detailed roadmap in `/docs/upgrade-roadmap.md`.

### Phase 1: Critical Compliance & Financial Operations (Current Focus)

⏳ Work Health and Safety (WHS) Management
⏳ Government Claims Management
⏳ Host Employer Billing and Invoicing
⏳ Enhanced Onboarding Module
⏳ Core Compliance Module Enhancement
✅ Payroll system with award rate integration

### Phase 2: Lifecycle Management & Field Operations

⏳ Advanced Apprentice Lifecycle Management
⏳ Field Officer Mobile Toolkit
⏳ Host Employer Portal
✅ Enrichment program management
⏳ Progress reviews system

### Phase 3: Advanced Features & Integrations

⏳ Advanced Applicant Tracking
⏳ Enhanced Reporting and Analytics
⏳ Advanced Document Management
⏳ External System Integrations
⏳ Calendar integration for field officers
⏳ Training plans development and tracking

## License

Proprietary - Braden Group Pty Ltd
