# ApprenticeTracker Repository Analysis

## Overview

CRM7 (referred to as ApprenticeTracker in the user's request) is a comprehensive enterprise workforce management platform designed specifically for Australian Group Training Organizations (GTOs), focusing on apprentice and host employer management. The platform provides an integrated digital ecosystem with interconnected components including a public-facing website, admin portals, and the core CRM system.

## Key Features (from README)

*   **Integrated Authentication System**: Single sign-on across all system components with role-based access control.
*   **Apprentice Management**: Complete lifecycle management from recruitment to completion.
*   **Host Employer Management**: Employer onboarding, compliance tracking, and placement management.
*   **Compliance Tracking**: Fair Work requirements and GTO standards compliance monitoring.
*   **Training Integration**: Connection with Training.gov.au for qualification details.
*   **Document Management**: Secure storage and retrieval of essential documents.
*   **Timesheet Processing**: Apprentice timesheet submission, approval, and reporting.
*   **Placement Tracking**: End-to-end management of apprentice placements.
*   **Field Officer Tools**: Mobile-optimized interfaces for field operations.
*   **Reporting & Analytics**: Comprehensive reporting on all aspects of the business.

## Architecture

CRM7 is built using a microservices pattern with named services:

*   **crm7r-identity**: Authentication and identity management
*   **crm7r-docs**: Document storage and management
*   **crm7r-notify**: Notification and messaging service
*   **crm7r-compliance**: Compliance tracking and reporting
*   **crm7r-training**: Training and qualification management
*   **crm7r-placement**: Apprentice placement coordination

## Technology Stack

*   **Frontend**: Next.js 15.1.6, TypeScript, TailwindCSS, shadcn/ui
*   **Backend**: Node.js with Express
*   **Database**: PostgreSQL via Supabase
*   **Authentication**: Supabase Auth with JWT token handling
*   **Security**: Role-based authentication with Row Level Security (RLS)

## Implemented Components (from README)

*   Authentication system with JWT token handling and proper redirects
*   Route protection for all major sections
*   Comprehensive permissions system with client and server-side components
*   Integration with Training.gov.au API
*   Host employer management interface
*   Apprentice profile system
*   Document upload and management

## Project Structure (Observed)

*   `/client`: Frontend application code
*   `/server`: Backend API and services
*   `/shared`: Shared types and utilities
*   `/docs`: System documentation
*   `/attached_assets`
*   `/replit_agent`
*   `/scripts`
*   `/temp`
*   Configuration files: `.eslintrc.js`, `.gitignore`, `.prettierrc`, `.replit`, `components.json`, `drizzle.config.ts`
*   `README.md`, `TODO.md`

## Current Development Focus (from README)

*   Payroll system with award rate integration
*   Enrichment program management
*   Progress reviews system (⏳ In progress)
*   Calendar integration for field officers (⏳ In progress)
*   Training plans development and tracking (⏳ In progress)

## Languages Used (from GitHub page)

*   TypeScript 95.1%
*   PLpgSQL 2.1%
*   JavaScript 1.9%
*   CSS 0.6%
*   Shell 0.2%
*   CodeQL 0.1%

## Initial Observations

*   The project is actively developed (last commit 1 hour ago as of analysis).
*   It has 356 commits, 1 branch (main), 0 tags.
*   The README is quite detailed and provides a good overview.
*   The project is private.
*   It seems to be hosted/developed on Replit as well (replit.com/@bradenlang77/ApprenticeTracker).
*   The name in the README is CRM7, but the repository is ApprenticeTracker. This might need clarification or could be an internal name.
*   The project aims to be a comprehensive solution for GTOs.
