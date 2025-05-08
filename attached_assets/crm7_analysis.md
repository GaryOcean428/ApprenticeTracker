# crm7 (Arcane-Fly) Repository Analysis

## Overview

The crm7 repository, hosted under `Arcane-Fly/crm7` and created by "braden" (likely the user, GaryOcean428, who is the main contributor), is described as "A modern, comprehensive CRM system built with Next.js, focusing on training, safety, payroll, and HR management." It is stated to be in Beta Development (75% complete).

## Key Features & Information (from README and GitHub page)

*   **Purpose**: A unified platform combining features for client relationships, employee training, safety compliance, and HR operations.
*   **Focus Areas**: Training, safety, payroll, and HR management.
*   **Key Features Listed**:
    *   Modern Dashboard: Real-time analytics and activity monitoring.
    *   Training & Development: Course management and skill tracking.
    *   Safety & Compliance: Incident reporting and compliance monitoring.
    *   Payroll & HR: Award interpretation and employee management.
    *   Client Management: Project tracking and communication tools.
*   **Documentation**: Extensive documentation is linked in the README, including:
    *   Getting Started Guide, Contributing Guidelines, Code Style Guide, Testing Guide.
    *   Technical Assessment, Architecture Overview, UI/UX Guidelines, Data Models, API Documentation.
    *   Deployment Guide, Environment Setup, Production Checklist.
*   **Deployment**: Uses Vercel with `development`, `preview`, and `master` branches for different environments.
    *   Development: `development.crm7.vercel.app`
    *   Production: `crm7.vercel.app` (linked to `braden.com.au` in the 'About' section on GitHub).

## Technology Stack (from README and GitHub page)

*   **Framework**: Next.js 14
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: shadcn/ui
*   **State Management**: Zustand
*   **Database**: Supabase
*   **Authentication**: Auth0 (mentioned in prerequisites, though Supabase is listed as the database, which often handles auth too)
*   **Testing**: Vitest, React Testing Library
*   **API**: REST with planned GraphQL support
*   **Tools**: Node.js ^18.17.0, PNPM ^9.0.0
*   **Languages from GitHub**: TypeScript (88.6%), JavaScript (5.8%), SCSS (2.6%), CSS (1.2%), HTML (0.8%), Other (1.0% including Shell, MDX, Dockerfile).

## Project Structure (Observed from README and GitHub page)

*   `/.devcontainer`
*   `/.github` (workflows, dependabot, etc.)
*   `/.husky` (git hooks)
*   `/.vscode`
*   `/action/lib/.automation`
*   `/api`
*   `/app` (likely Next.js app router structure)
*   `/backend/api/src`
*   `/codeql-custom-queries-javascript`
*   `/components` (React components)
*   `/config`
*   `/dist_scripts`
*   `/docs`
*   `/e2e` (end-to-end tests)
*   `/hooks`
*   `/lib` (core libraries and utilities)
*   `/pages` (Next.js pages - though App router is more common with Next.js 14, this might be a mix or older structure parts)
*   `/public` (static assets)
*   `/scripts`
*   `/src` (often contains app, components, lib etc. in newer Next.js structures)
*   `/storybook-static`
*   `/styles` (global styles)
*   `/supabase`
*   `/tests` (test suites)
*   `/types`
*   Configuration files: Extensive, including `.eslintrc.json`, `commitlint.config.js`, `docker-compose.yml`, `Dockerfile`, `jest.config.ts`, `lint-staged.config.js`, `next.config.mjs`, `package.json`, `pnpm-lock.yaml`, `postcss.config.js`, `prettier.config.js`, `README.md`, `tsconfig.json`, `vitest.config.ts`, etc.

## Repository Status

*   **Activity**: Last commit was "last week" by GaryOcean428.
*   **Commits**: 531 commits.
*   **Branches**: 16 branches.
*   **Privacy**: Public repository.
*   **Contributors**: 4 contributors listed (GaryOcean428, renovate[bot], snyk-bot, GaryOcean429).
*   **Issues**: 1 open issue.
*   **Pull Requests**: 13 pull requests (likely closed/merged, as it's a count).

## Initial Observations

*   This crm7 project is also a comprehensive CRM system, with a focus on training, safety, payroll, and HR, which aligns well with GTO requirements.
*   It appears to be the most actively and recently developed among the "like projects" provided, with a significant number of commits and branches.
*   The technology stack is modern and very similar to ApprenticeTracker and crm8u (Next.js, TypeScript, Supabase, TailwindCSS, shadcn/ui).
*   The project has a strong emphasis on development best practices: detailed documentation, structured commit messages (commitlint), linting, testing, and a clear Git workflow with multiple environments.
*   The use of Auth0 is mentioned as a prerequisite, which is a slight deviation from the other projects that seem to rely more on Supabase for authentication.
*   The public nature of this repository might offer more transparency into its structure and code if deeper dives are needed, compared to the private ones.
*   The name "crm7" is consistent with the ApprenticeTracker's README (which also refers to itself as CRM7 internally) and crm8u (which refers to itself as CRM7R). This strongly suggests these are all related projects, possibly evolving versions or components of a larger system vision.
