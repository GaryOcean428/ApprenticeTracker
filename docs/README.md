# CRM7 Documentation

## Overview
This documentation provides comprehensive information about the CRM7 Australian Apprentice Management Platform. This platform is designed to help Group Training Organizations (GTOs) manage apprentices, host employers, training contracts, and compliance requirements.

## Contents

### Primary Documentation
- **[Development Roadmap](../roadmap.md)** - Canonical development roadmap with current status and next steps
- **[National Standards Implementation](national_standards_implementation_status.md)** - Progress tracking against GTO compliance requirements

### System Architecture
- [System Architecture Overview](system-architecture.md) - Detailed description of system components, technical stack, and data models

### Compliance & Standards
- [GTO Compliance](gto-compliance.md) - Information about the compliance requirements for GTOs in Australia
- [Evidence Guide for GTOs](Evidence%20Guide%20for%20GTOs%20to%20Support%20the%20National%20Standards.pdf) - Official guide to support the National Standards

### API Integrations
- [Fair Work API](fair-work-api.md) - Documentation for the Fair Work Commission API integration
- [Training.gov.au API](tga-api.md) - Information about connecting to the Training.gov.au web services

### Development Guidelines
- [Code Standards](code-standards.md) - Development standards and best practices
- [Component Library](component-library.md) - UI component documentation and design system
- [Testing Strategy](testing-strategy.md) - Testing approach and quality assurance
- [Performance Optimization](performance-optimization.md) - Performance guidelines and optimization strategies

### Sample Data
The following CSV files contain sample data for testing and development:

- [Employee Detail](csv_data/EmployeeDetail%20-%20EmployeeDetail.csv)
- [Search All Clients](csv_data/Search%20All%20Clients%20-%20Search%20All%20Clients.csv)
- [WAAMS Data](csv_data/WAAMS%20Data%20-%20WAAMS.csv)
- [NRT Search Export](csv_data/NRTSearchExport_2025-05-03_12-07-14.csv)

### Screenshots
The `images` directory contains screenshots of the application interface for reference.

## Development Guidelines

### Authentication
- The application uses role-based authentication with Supabase Auth and Row Level Security (RLS)
- Different user types (developer, admin, field officer, host employer, apprentice) have different access levels

### Database
- PostgreSQL database with Drizzle ORM
- Comprehensive schema supporting all aspects of apprentice management
- Data models include users, apprentices, host employers, training contracts, and more

### API Structure
- RESTful API endpoints for all major entities
- Integration with Fair Work API for awards and enterprise agreements
- Integration with Training.gov.au for qualification and training data

### User Interface
- Built with React, Vite, TypeScript, TailwindCSS, and shadcn/ui components
- Responsive design for mobile, tablet, and desktop
- Organized into modules for different functional areas

