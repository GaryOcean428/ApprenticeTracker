# National Standards for Group Training Organisations (GTOs) - Key Requirements for Software

## Source

Revised National Standards for Group Training Organisations (January 2017) - Visually inspected from https://content.apprenticeships.gov.au/sites/default/files/2023-11/National%20Standards%20for%20GTOs.pdf

## Purpose of the Standards

To ensure nationally consistent, high-quality services are provided by GTOs. The standards provide a framework for GTOs to operate ethically, considering apprentice, trainee, and host employer needs, and enhancing the reputation of group training.

Key outcome: Develop an apprentice/trainee into a skilled worker with a recognized qualification.

Three key elements GTOs need to focus on (reflected in Standards):
1.  Recruitment, employment, and induction.
2.  Monitoring and supporting apprentices and trainees to completion.
3.  Maintaining a sustainable GTO (well-governed and administered).

## The Standards & Implications for GTO Software

### 1. Recruitment, Employment, and Induction

*   **1.1 Information Provision**: Before entering an Employment Contract and a Training Contract, the GTO must inform apprentices/trainees about their employment conditions, the host employer arrangement, the training, support services, and rights/obligations.
    *   *Software Implication*: System to manage and record communication of this information. Document templates for employment conditions, host employer agreements. Tracking acknowledgment.
*   **1.2 Induction**: GTO inducts apprentices/trainees into the apprenticeship/traineeship system. This includes explaining:
    *   Apprentice/trainee responsibilities under the Training Contract, to the host employer, the GTO, the Registered Training Organisation (RTO), and school (if applicable).
    *   Processes for accessing support and dealing with employment/training issues.
    *   *Software Implication*: Induction checklist management, recording of induction completion, storage of induction materials, system for apprentices/trainees to access support information.
*   **1.3 Advice to Host Employers**: GTO provides clear and accurate advice to host employers to ensure they understand the apprenticeship/traineeship system and obtain their agreement (via a Host Employer Agreement) regarding their roles and responsibilities in training and supporting the apprentice/trainee, maintaining a safe workplace, and cooperating with the GTO and RTO.
    *   *Software Implication*: Host employer portal, management of Host Employer Agreements (templates, signing, storage), communication logs with host employers, WHS information dissemination.
*   **RTO Development of Training Plan**: GTO actively participates in the RTO's development of the Training Plan (based on competency-based progression and completion principles relevant to the qualification, occupation, host employer’s workplace, and apprentice/trainee needs).
    *   *Software Implication*: Integration or data exchange with RTO systems, storage and versioning of Training Plans, tracking GTO participation/input.

### 2. Monitoring and Supporting Apprentices and Trainees to Completion

*   **2.1 Services for Continuity and Quality**: GTO provides services to meet apprentice/trainee needs to facilitate continuity of the Training Contract to completion and the quality/breadth of training. This includes:
    *   Support and mentoring throughout the Training Contract.
    *   Providing resources/advice or procuring special equipment for the workplace to meet access, equity, and Work Health and Safety (WHS) requirements.
    *   *Software Implication*: Mentoring schedule and log, support ticket system, resource library, WHS incident reporting and management, tracking of equipment provision.
*   **2.2 Progress Monitoring**: GTO monitors each apprentice/trainee’s progress against the Training Plan and:
    *   Facilitates integration of training and employment experiences, including arranging workplace rotations if required.
    *   Requests RTO review of the Training Plan when changes occur (workplace rotations, competency-based progressions, other changes).
    *   *Software Implication*: Training plan progress tracking (milestones, competencies), system for managing and scheduling rotations, communication tools for RTO liaison.
*   **2.3 Systems for Support**: GTO has appropriate systems (based on scale/scope of operations) to manage and support apprentices/trainees in times of economic downturn or ‘stand down’ to facilitate retention.
    *   *Software Implication*: Status tracking for apprentices (e.g., active, stood down), communication tools for support during stand down.
*   **2.4 Host Employer Support**: GTO provides assistance, coordination, and accurate advice to host employers for the duration of the Host Employer Agreement. Works with host employer to provide appropriate on-the-job training, supervision, support, and mentoring to the hosted apprentice/trainee.
    *   *Software Implication*: Host employer portal with resources, communication logs, tools for field officers to record interactions and support provided to host employers.
*   **2.5 Performance Issue Management**: GTO manages performance issues ‘fairly’ and records the outcome and feedback.
    *   *Software Implication*: Performance management module, case notes, feedback recording.
*   **2.6 Compliance for Competency-Based Progression**: GTO complies with Commonwealth, State, and Territory requirements for competency-based progression and completion; supports genuine efforts to achieve qualification in an appropriate timeframe.
    *   *Software Implication*: System must align with relevant jurisdictional requirements for tracking and reporting competency progression.

### 3. GTO Governance and Administration

*   **3.1 Legislative Compliance**: GTO complies with Commonwealth, State, and Territory legislative and regulatory requirements and policies for employment and training of apprentices/trainees in each jurisdiction they operate.
    *   *Software Implication*: Configurable compliance settings per jurisdiction, audit trails, reporting capabilities to demonstrate compliance.
*   **3.3 Performance Monitoring & Continuous Improvement**: GTO develops, monitors, and continually improves its performance and strategic directions using performance data, audit results, assessments, surveys, etc.
    *   *Software Implication*: Reporting and analytics module, data collection for audits and surveys, tracking of improvement initiatives.
*   **3.4 Financial Viability**: GTO can demonstrate financial viability.
    *   *Software Implication*: Financial management modules (billing, invoicing, claims management) to support financial reporting and viability assessment.
*   **3.5 Insurance**: GTO holds appropriate insurances.
    *   *Software Implication*: Document management for insurance policies, expiry reminders.
*   **3.6 Access and Equity**: GTO adheres to principles of access and equity in all operations.
    *   *Software Implication*: Data collection and reporting on diversity, accessibility considerations in UI/UX.
*   **3.7 Clear and Accurate Marketing**: Clear and accurate marketing, advertising materials, and other information provided by the GTO regarding its services, host employer roles/responsibilities, and apprenticeship/traineeship requirements.
    *   *Software Implication*: Content management for marketing materials, version control.
*   **3.8 Complaints and Appeals**: Transparently dealt with in accordance with a documented complaints and appeals process, or referred to State/Territory dispute resolution where Training Contract completion is at risk.
    *   *Software Implication*: Complaints and appeals logging and tracking module, workflow for resolution process.

## Definitions Relevant to Software

*   **Apprentice/Trainee**: Person employed by GTO under an Approved Training Contract leading to a nationally recognized qualification.
*   **Employment Contract**: Contract between apprentice/trainee and GTO clarifying employment conditions.
*   **Host Employer**: Organisation hosting an apprentice/trainee, providing supervision and on-the-job training.
*   **Host Employer Agreement**: Written agreement between GTO and host employer specifying responsibilities and charge out rate.
*   **Training Contract**: Nationally agreed Training Contract for an apprenticeship/traineeship, registered with state/territory authority.
*   **Registered Training Organisation (RTO)**: Organisation registered to deliver and issue nationally recognized qualifications.
*   **Rotation**: Apprentice/trainee moving from one host employer to another.
*   **Training Plan**: Program of training and assessment developed by RTO with GTO, employer, and apprentice/trainee.

## Overall Technological Implications

A comprehensive GTO software solution needs to support:
*   **Data Management**: Securely store and manage data for apprentices, trainees, host employers, RTOs, training contracts, employment contracts, host employer agreements, training plans, progress, communications, financial transactions, compliance documentation.
*   **Workflow Automation**: For recruitment, onboarding, induction, progress monitoring, rotations, performance management, claims, complaints.
*   **Communication Tools**: For apprentices, trainees, host employers, RTOs, internal staff (email, SMS, portal notifications).
*   **Reporting and Analytics**: For performance monitoring, compliance, financial management, continuous improvement.
*   **Compliance Management**: Adherence to National Standards, jurisdictional requirements, WHS, privacy laws.
*   **Financial Management**: Payroll (if GTO is employer), invoicing host employers, managing government incentives/claims.
*   **Document Management**: Storage, version control, and access control for all key documents.
*   **User Portals**: Separate interfaces for apprentices/trainees, host employers, and GTO staff/field officers.
*   **Integration Capabilities**: With RTO systems, job boards, payroll systems (if external), accounting software, government portals (e.g., for claims, STP).
*   **Mobile Accessibility**: For field officers and potentially other users.
*   **Security and Privacy**: Robust security measures to protect sensitive personal and financial data.
