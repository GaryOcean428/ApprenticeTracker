# CRM7 Implementation Prioritization (May 9, 2025)

## Overview

This document outlines the implementation prioritization plan for CRM7, separating features into:
1. **Independent Tasks** - Work that can be completed without external API dependencies
2. **API-Dependent Tasks** - Work that requires integration with external services
3. **Hybrid Tasks** - Work that can be partially implemented without APIs but will require integration later

## Phase 1: Independent Tasks (Immediate Priority)

### 1. WHS Module Completion
- [x] ✅ Database schema implemented
- [x] ✅ API endpoints created
- [ ] 🔄 Complete incident management workflow
- [ ] 🔄 Enhance risk assessment tools
- [ ] 🔄 Improve policy document management
- [ ] 🔄 Complete WHS dashboard UI enhancements
- [ ] 🔄 Finish site inspection functionality
- [ ] 🔄 Implement comprehensive form validation

### 2. Database Relationship Optimization
- [ ] 🔄 Review and standardize entity relationships
- [ ] 🔄 Implement cascading behavior for related records
- [ ] 🔄 Fix redundant data entry issues
- [ ] 🔄 Create templates for common data patterns
- [ ] 🔄 Implement "copy from" functionality for repetitive data

### 3. Labour Hire Workers Support
- [ ] 🔄 Design and implement labour_hire_workers schema
- [ ] 🔄 Create admin UI for managing labour hire workers
- [ ] 🔄 Develop timesheet processing for labour hire workers
- [ ] 🔄 Implement basic billing calculations
- [ ] 🔄 Add placement management for labour hire workers

### 4. Notification System Framework
- [ ] 🔄 Design notification data model and database schema
- [ ] 🔄 Create notification preferences UI
- [ ] 🔄 Implement notification center in the application
- [ ] 🔄 Build notification triggers for system events
- [ ] 🔄 Create template system for notification content

### 5. Host Employer Portal Enhancements
- [ ] 🔄 Complete timesheet approval workflow
- [ ] 🔄 Implement apprentice placement tracking
- [ ] 🔄 Build documents module for host employers
- [ ] 🔄 Create host employer dashboard with key metrics
- [ ] 🔄 Implement agreement management features

### 6. Apprentice Portal Features
- [ ] 🔄 Enhance training progress tracking UI
- [ ] 🔄 Complete timesheet submission functionality
- [ ] 🔄 Implement document upload features
- [ ] 🔄 Create apprentice dashboard with key information
- [ ] 🔄 Build apprentice profile management

### 7. UI/UX Improvements
- [ ] 🔄 Connect all functional buttons to appropriate actions
- [ ] 🔄 Standardize form design and validation patterns
- [ ] 🔄 Enhance dashboard visualizations
- [ ] 🔄 Implement responsive design improvements
- [ ] 🔄 Create consistent error handling patterns

## Phase 2: Hybrid Tasks (Secondary Priority)

### 1. Email Notification Implementation
- [ ] 🔄 Set up SendGrid integration (API-dependent)
- [ ] 🔄 Create email template system (independent)
- [ ] 🔄 Implement email preferences (independent)
- [ ] 🔄 Build email sending service (independent until final API connection)
- [ ] 🔄 Create test harness for email templates (independent)

### 2. Fair Work Integration
- [ ] 🔄 Complete award rate engine (independent)
- [ ] 🔄 Set up Fair Work API connection (API-dependent)
- [ ] 🔄 Create award mapping UI (independent)
- [ ] 🔄 Implement rate association with apprentices (independent)
- [ ] 🔄 Build automated update processes (hybrid)

### 3. Training.gov.au Integration
- [ ] 🔄 Create qualification search UI (independent)
- [ ] 🔄 Implement local qualification caching (independent)
- [ ] 🔄 Set up TGA API connection (API-dependent)
- [ ] 🔄 Build superseded qualification tracking (independent)
- [ ] 🔄 Develop qualification subscription for apprentices (independent)

### 4. Host Employer Billing
- [ ] 🔄 Implement configurable rate engine (independent)
- [ ] 🔄 Build invoice generation system (independent)
- [ ] 🔄 Create debtor management UI (independent)
- [ ] 🔄 Integrate with external accounting systems (API-dependent)
- [ ] 🔄 Implement payment tracking (independent)

## Phase 3: API-Dependent Tasks (Final Priority)

### 1. SMS Notification System
- [ ] ⏳ Identify SMS provider
- [ ] ⏳ Implement SMS gateway integration
- [ ] ⏳ Build SMS sending service
- [ ] ⏳ Create SMS templates
- [ ] ⏳ Implement automated SMS notifications

### 2. ADMS Integration
- [ ] ⏳ Research ADMS requirements
- [ ] ⏳ Design ADMS integration approach
- [ ] ⏳ Implement data synchronization
- [ ] ⏳ Create ADMS reporting functionality
- [ ] ⏳ Build error handling and reconciliation

### 3. Additional API Integrations
- [ ] ⏳ Implement payment gateway integration
- [ ] ⏳ Set up STP reporting connections
- [ ] ⏳ Integrate with government portals
- [ ] ⏳ Connect to RTO systems
- [ ] ⏳ Implement accounting software integration

## Implementation Approach

1. **Stage 1: Independent Tasks First**
   - Complete all tasks that don't require external APIs
   - Prioritize WHS module as it's already 70% complete
   - Focus on improving user experience and data relationships

2. **Stage 2: Hybrid Tasks Next**
   - Implement as much as possible without API dependencies
   - Document where API integration points will be
   - Prepare all UI components and local functionality

3. **Stage 3: API-Dependent Features Last**
   - Complete external API integrations
   - Connect pre-built components to APIs
   - Implement full end-to-end functionality

## Current Focus (May 2025)

The immediate focus is:
1. Complete WHS module fully
2. Optimize database relationships 
3. Begin labour hire workers support
4. Start building the notification framework

As these are completed, we'll move to the hybrid tasks, implementing as much as possible without API dependencies while documenting requirements for the API integration points.