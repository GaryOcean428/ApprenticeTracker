# Implementation Task List

This file captures the prioritized development tasks identified by comparing the current codebase with the documented roadmap and feature specifications.

## Phase 1: Critical Compliance & Financial Operations

### 1. Complete WHS Module
- **Status**: Forms and core tables exist but validation and reporting are incomplete.
- **Tasks**:
  - Finish validation for incident, risk assessment, inspection and policy forms.
  - Add incident workflow states and host employer integration.
  - Build WHS dashboard metrics and exportable reports.
- **Complexity**: Medium
- **Dependencies**: Host employer records
- **Success Criteria**: All WHS forms validated, incident workflow operational, dashboard shows key metrics and reports can be exported.

### 2. Implement Government Claims Management Module
- **Status**: No code yet.
- **Tasks**:
  - Design database schema for eligibility and claims.
  - Create REST endpoints for claim creation, status tracking and payment reconciliation.
  - Build UI wizard for preparing submissions with document upload.
- **Complexity**: High
- **Dependencies**: Compliance data, financial records
- **Success Criteria**: Claims can be created, tracked through lifecycle, and reconciled against payments.

### 3. Expand Host Employer Billing & Rate Calculation
- **Status**: Award rate engine and timesheet APIs exist; invoicing not implemented.
- **Tasks**:
  - Finalize Fair Work API integration for award rates.
  - Implement configurable on‑cost calculations (superannuation, workers comp).
  - Generate invoices from timesheets and agreements.
  - Add debtor management and aging reports.
- **Complexity**: High
- **Dependencies**: Payroll module, Fair Work API
- **Success Criteria**: Accurate charge rates produced, invoices generated and tracked, debtor reports available.

### 4. Build Enhanced Onboarding Module
- **Status**: Not implemented.
- **Tasks**:
  - Develop checklist‑based workflow engine for apprentice and host onboarding.
  - Integrate document collection and electronic acknowledgment.
  - Provide dashboard to track onboarding progress and pre‑employment checks.
- **Complexity**: Medium
- **Dependencies**: Document management, compliance requirements
- **Success Criteria**: Onboarding checklists complete, required documents stored, and progress visible per apprentice/host.

### 5. Strengthen Core Compliance Module
- **Status**: Basic tracking present; audit trail and multi‑jurisdiction config missing.
- **Tasks**:
  - Implement audit trail for compliance activities.
  - Add jurisdiction configuration and alerts for deadlines.
  - Create compliance reporting dashboards.
- **Complexity**: Medium
- **Dependencies**: WHS and claims modules
- **Success Criteria**: Compliance records include audit history, state requirements configurable, and dashboard reports generated.

## Phase 2: Lifecycle Management & Field Operations

### 6. Develop Apprentice Lifecycle Management Features
- **Status**: Progress reviews exist; mentoring and rotation tools absent.
- **Tasks**:
  - Build mentoring scheduler and session logs.
  - Enhance training progress tracking with competency data.
  - Implement rotation planning and performance management.
- **Complexity**: High
- **Dependencies**: Training data, onboarding module
- **Success Criteria**: Mentoring sessions recorded, progress against competencies visible, and rotations tracked per apprentice.

### 7. Create Field Officer Mobile Toolkit
- **Status**: No dedicated mobile tools.
- **Tasks**:
  - Build mobile‑optimized views with offline data capture.
  - Provide digital forms for WHS checks and progress reviews.
  - Sync data when connection is restored.
- **Complexity**: High
- **Dependencies**: Existing APIs, authentication
- **Success Criteria**: Field officers can record visits and submit forms on mobile, even offline.

### 8. Launch Host Employer Portal
- **Status**: Portal not available.
- **Tasks**:
  - Develop secure portal for host employers to view placements, submit timesheets and access WHS resources.
  - Implement agreement management and invoice viewing.
  - Add communication tools for host engagement.
- **Complexity**: High
- **Dependencies**: Billing module, document management
- **Success Criteria**: Hosts can log in, manage agreements, submit data and see invoices.

## Phase 3: Advanced Features & Integrations

### 9. Introduce Advanced Applicant Tracking
- **Status**: Basic recruitment only.
- **Tasks**:
  - Implement resume parsing and advanced search.
  - Integrate external job boards and bulk communication tools.
- **Complexity**: Medium
- **Dependencies**: Candidate data models
- **Success Criteria**: Candidates searchable by resume data and job postings synchronized.

### 10. Enhance Reporting and Analytics
- **Status**: Limited reporting endpoints.
- **Tasks**:
  - Build customizable reporting engine with role‑based dashboards.
  - Provide operational and compliance analytics.
- **Complexity**: Medium
- **Dependencies**: Data from all modules
- **Success Criteria**: Users can generate custom reports and view dashboards for key metrics.

### 11. Expand Document Management Capabilities
- **Status**: Basic storage only.
- **Tasks**:
  - Add document version control and granular permissions.
  - Implement electronic signatures and audit trails for changes.
- **Complexity**: Medium
- **Dependencies**: Existing docs service
- **Success Criteria**: Documents maintain history, access is controlled and signatures recorded.

## Cross‑Cutting Improvements

### 12. Notification System
- **Status**: Placeholder routes only.
- **Tasks**:
  - Define notification schema and user preferences.
  - Implement email and SMS sending via configured providers.
  - Trigger notifications for key events (claims, compliance deadlines, WHS incidents).
- **Complexity**: Medium
- **Dependencies**: User accounts, external email/SMS APIs
- **Success Criteria**: Users receive relevant notifications according to their preferences.

### 13. Training.gov.au API Integration
- **Status**: Service exists; API routes and UI incomplete.
- **Tasks**:
  - Expose REST endpoints using the existing TGAService.
  - Cache qualification data and allow searching from the UI.
  - Track superseded qualifications.
- **Complexity**: Medium
- **Dependencies**: SOAP/REST endpoints, caching layer
- **Success Criteria**: Users can search and view qualification details pulled from TGA with caching.

### 14. Security and Testing Enhancements
- **Status**: Basic auth implemented; TypeScript checks fail.
- **Tasks**:
  - Enforce role‑based access across all routes and add multi‑factor auth for admins.
  - Set up Vitest and Playwright with coverage targets of 80% for new code.
  - Add CI pipeline running lint, build and tests.
- **Complexity**: Medium
- **Dependencies**: Existing auth system, testing tools
- **Success Criteria**: CI passes with required coverage and roles enforced on all endpoints.

### 15. Accessibility and UX Refinement
- **Status**: Initial UI present.
- **Tasks**:
  - Address WCAG issues (color contrast, keyboard navigation).
  - Add ARIA attributes and focus indicators.
  - Provide consistent form validation feedback and loading states.
- **Complexity**: Medium
- **Dependencies**: Frontend components
- **Success Criteria**: Interfaces meet WCAG AA guidelines and provide clear feedback.

---
This list should be reviewed regularly and updated as features are delivered.
