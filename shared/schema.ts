import { pgTable, text, serial, integer, boolean, date, timestamp, json, numeric, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user"),
  profileImage: text("profile_image"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  profileImage: true,
});

// Apprentices
export const apprentices = pgTable("apprentices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  dateOfBirth: date("date_of_birth"),
  trade: text("trade").notNull(),
  status: text("status").notNull().default("active"),
  profileImage: text("profile_image"),
  progress: integer("progress").default(0),
  startDate: date("start_date"),
  endDate: date("end_date"),
  notes: text("notes"),
  // AVETMISS & Fair Work Fields
  clientIdentifierApprenticeships: text("client_identifier_apprenticeships").unique(),  // AVETMISS unique identifier
  uniqueStudentIdentifier: text("unique_student_identifier"),      // USI for VET tracking
  highestSchoolLevelCompleted: text("highest_school_level_completed"), // e.g. 'Year 12'
  indigenousStatus: text("indigenous_status"),                    // For demographic reporting
  languageIdentifier: text("language_identifier"),                // Based on ASCL standards
  countryOfBirth: text("country_of_birth"),                       // Based on SACC standards
  disabilityFlag: boolean("disability_flag").default(false),      // For support requirements
  // AQF & GTO fields
  aqfLevel: text("aqf_level"),                                   // e.g. 'Certificate III', 'Diploma'
  apprenticeshipYear: integer("apprenticeship_year"),            // Tracks which year of apprenticeship
  gtoEnrolled: boolean("gto_enrolled").default(false),           // Flag if placed via a GTO
  gtoId: integer("gto_id"),                                      // Reference to GTO organization
  atSchoolFlag: boolean("at_school_flag").default(false),        // Indicates if still at school
  schoolLevelIdentifier: text("school_level_identifier"),        // Current school level if applicable
  schoolBasedFlag: boolean("school_based_flag").default(false),  // Indicates school-based apprenticeship
});

export const insertApprenticeSchema = createInsertSchema(apprentices).omit({
  id: true,
});

// Host Employers
export const hostEmployers = pgTable("host_employers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  status: text("status").notNull().default("active"),
  safetyRating: integer("safety_rating"),
  complianceStatus: text("compliance_status").notNull().default("pending"),
  notes: text("notes"),
  // AVETMISS and Fair Work fields
  employerIdentifier: text("employer_identifier").unique(),     // AVETMISS employer identifier
  employerLegalName: text("employer_legal_name"),               // Legal business name
  employerSize: text("employer_size"),                          // Size category (small, medium, large)
  employerTypeIdentifier: text("employer_type_identifier"),     // Type of employer (e.g., private, government)
  anzsicCode: text("anzsic_code"),                              // Industry classification code
  // WHS & Compliance fields
  whsPolicy: boolean("whs_policy").default(false),              // Has workplace health & safety policy
  whsLastAudit: date("whs_last_audit"),                         // Date of last safety audit
  whsNextAudit: date("whs_next_audit"),                         // Date of next scheduled audit
  // Labour hire fields
  isGto: boolean("is_gto").default(false),                      // Indicates if this org is a Group Training Organisation
  labourHireLicenceNo: text("labour_hire_licence_no"),          // For orgs operating under labour hire licensing laws
  labourHireLicenceExpiry: date("labour_hire_licence_expiry"),  // Expiry date for labour hire license
});

export const insertHostEmployerSchema = createInsertSchema(hostEmployers).omit({
  id: true,
});

// Training Contracts
export const trainingContracts = pgTable("training_contracts", {
  id: serial("id").primaryKey(),
  apprenticeId: integer("apprentice_id").references(() => apprentices.id).notNull(),
  contractNumber: text("contract_number").notNull().unique(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: text("status").notNull().default("active"),
  documentUrl: text("document_url"),
  terms: json("terms"),
  approvedBy: text("approved_by"),
  approvalDate: date("approval_date"),
  // Fair Work & AQF fields
  aqfLevel: text("aqf_level"),                 // e.g. 'Certificate III', 'Diploma'
  rtoName: text("rto_name"),                   // Name of the Registered Training Organisation
  rtoCode: text("rto_code"),                   // e.g., provider's RTO code
});

export const insertTrainingContractSchema = createInsertSchema(trainingContracts).omit({
  id: true,
});

// Placements
export const placements = pgTable("placements", {
  id: serial("id").primaryKey(),
  apprenticeId: integer("apprentice_id").references(() => apprentices.id).notNull(),
  hostEmployerId: integer("host_employer_id").references(() => hostEmployers.id).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: text("status").notNull().default("active"),
  position: text("position").notNull(),
  supervisor: text("supervisor"),
  supervisorContact: text("supervisor_contact"),
  notes: text("notes"),
  // Labour hire & GTO fields
  labourHireIndicator: boolean("labour_hire_indicator").default(false), // Distinguish direct hire vs. labour hire
  gtoPlacement: boolean("gto_placement").default(false),             // If placed by a GTO
  ebaId: integer("eba_id"),                                         // Link to enterprise agreement
});

export const insertPlacementSchema = createInsertSchema(placements).omit({
  id: true,
});

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  relatedTo: text("related_to").notNull(), // "apprentice", "host", "contract", etc.
  relatedId: integer("related_id").notNull(),
  expiryDate: date("expiry_date"),
  status: text("status").notNull().default("active"),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadDate: true,
});

// Compliance Records
export const complianceRecords = pgTable("compliance_records", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "safety", "document", "contract", etc.
  relatedTo: text("related_to").notNull(), // "apprentice", "host", "contract", etc.
  relatedId: integer("related_id").notNull(),
  status: text("status").notNull(), // "compliant", "non-compliant", "pending"
  dueDate: date("due_date"),
  completionDate: date("completion_date"),
  notes: text("notes"),
});

export const insertComplianceRecordSchema = createInsertSchema(complianceRecords).omit({
  id: true,
});

// Timesheets
export const timesheets = pgTable("timesheets", {
  id: serial("id").primaryKey(),
  apprenticeId: integer("apprentice_id").references(() => apprentices.id).notNull(),
  placementId: integer("placement_id").references(() => placements.id).notNull(),
  weekStarting: date("week_starting").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  totalHours: integer("total_hours").notNull(),
  submittedDate: timestamp("submitted_date").notNull().defaultNow(),
  approvedBy: integer("approved_by").references(() => users.id),
  approvalDate: timestamp("approval_date"),
  notes: text("notes"),
});

export const insertTimesheetSchema = createInsertSchema(timesheets).omit({
  id: true,
  submittedDate: true,
  approvalDate: true,
});

// Timesheet Details
export const timesheetDetails = pgTable("timesheet_details", {
  id: serial("id").primaryKey(),
  timesheetId: integer("timesheet_id").references(() => timesheets.id).notNull(),
  date: date("date").notNull(),
  hoursWorked: integer("hours_worked").notNull(),
  description: text("description"),
});

export const insertTimesheetDetailSchema = createInsertSchema(timesheetDetails).omit({
  id: true,
});

// Activity Logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  relatedTo: text("related_to"),
  relatedId: integer("related_id"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  details: json("details"),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: integer("assigned_to").references(() => users.id),
  dueDate: date("due_date"),
  priority: text("priority").default("medium"), // "low", "medium", "high", "urgent"
  status: text("status").notNull().default("pending"), // "pending", "in_progress", "completed"
  relatedTo: text("related_to"),
  relatedId: integer("related_id"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Fair Work Awards
export const awards = pgTable("awards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  fairWorkReference: text("fair_work_reference"), // e.g. 'MA000010'
  fairWorkTitle: text("fair_work_title"),        // e.g. 'Clerks — Private Sector Award 2010'
  description: text("description"),
  effectiveDate: date("effective_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAwardSchema = createInsertSchema(awards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Award Classifications
export const awardClassifications = pgTable("award_classifications", {
  id: serial("id").primaryKey(),
  awardId: integer("award_id").references(() => awards.id).notNull(),
  name: text("name").notNull(),
  level: text("level").notNull(),
  fairWorkLevelCode: text("fair_work_level_code"), // e.g. 'Level 1', 'Level 2'
  fairWorkLevelDesc: text("fair_work_level_desc"),
  aqfLevel: text("aqf_level"),                    // e.g. 'Certificate III', 'Diploma'
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAwardClassificationSchema = createInsertSchema(awardClassifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Pay Rates
export const payRates = pgTable("pay_rates", {
  id: serial("id").primaryKey(),
  classificationId: integer("classification_id").references(() => awardClassifications.id).notNull(),
  hourlyRate: numeric("hourly_rate").notNull(),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  payRateType: text("pay_rate_type").default("award"), // 'award', 'EBA', 'individual_agreement'
  isApprenticeRate: boolean("is_apprentice_rate").default(false),
  apprenticeshipYear: integer("apprenticeship_year"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPayRateSchema = createInsertSchema(payRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Penalty Rules
export const penaltyRules = pgTable("penalty_rules", {
  id: serial("id").primaryKey(),
  awardId: integer("award_id").references(() => awards.id).notNull(),
  classificationId: integer("classification_id").references(() => awardClassifications.id),
  penaltyName: text("penalty_name").notNull(),       // e.g. 'Weekend Loading', 'Overtime 1.5x'
  penaltyType: text("penalty_type"),                 // e.g. 'overtime', 'weekend', 'public_holiday'
  multiplier: numeric("multiplier", { precision: 5, scale: 2 }), // e.g. 1.50 for time-and-a-half
  daysOfWeek: json("days_of_week"),                  // e.g. [6,7] for Sat/Sun, or empty if not restricted
  startTime: text("start_time"),                     // If penalty applies after certain hour
  endTime: text("end_time"),                         // If penalty applies until certain hour
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPenaltyRuleSchema = createInsertSchema(penaltyRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Allowance Rules
export const allowanceRules = pgTable("allowance_rules", {
  id: serial("id").primaryKey(),
  awardId: integer("award_id").references(() => awards.id).notNull(),
  classificationId: integer("classification_id").references(() => awardClassifications.id),
  allowanceName: text("allowance_name").notNull(),    // e.g. 'Tool Allowance'
  allowanceAmount: numeric("allowance_amount", { precision: 10, scale: 2 }),
  allowanceType: text("allowance_type"),             // e.g. 'per_hour', 'per_day', 'per_shift'
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAllowanceRuleSchema = createInsertSchema(allowanceRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Public Holidays
export const publicHolidays = pgTable("public_holidays", {
  id: serial("id").primaryKey(),
  state: text("state").notNull(),       // e.g. 'VIC', 'NSW', or 'NATIONAL'
  holidayDate: date("holiday_date").notNull(),
  holidayName: text("holiday_name").notNull(),   // e.g. 'Australia Day'
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPublicHolidaySchema = createInsertSchema(publicHolidays).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Fair Work Compliance Logs
export const fairworkComplianceLogs = pgTable("fairwork_compliance_logs", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => apprentices.id).notNull(),
  timesheetId: integer("timesheet_id").references(() => timesheets.id),
  payRateId: integer("pay_rate_id").references(() => payRates.id),
  complianceCheck: text("compliance_check"),     // JSON or text describing checks performed
  outcome: text("outcome"),                     // 'compliant', 'adjustment_needed', etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFairworkComplianceLogSchema = createInsertSchema(fairworkComplianceLogs).omit({
  id: true,
  createdAt: true,
});

// Enterprise Agreements
export const enterpriseAgreements = pgTable("enterprise_agreements", {
  id: serial("id").primaryKey(),
  agreementName: text("agreement_name").notNull(),
  agreementCode: text("agreement_code"),      // e.g. an internal or official code
  description: text("description"),
  effectiveDate: date("effective_date"),
  expiryDate: date("expiry_date"),
  agreementStatus: text("agreement_status").default("active"), // 'active', 'expired'
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEnterpriseAgreementSchema = createInsertSchema(enterpriseAgreements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// GTO Organizations
export const gtoOrganizations = pgTable("gto_organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isGto: boolean("is_gto").default(true),  // Indicates if this org is a Group Training Organisation
  labourHireLicenceNo: text("labour_hire_licence_no"),   // For orgs operating under labour hire licensing laws
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  status: text("status").default("active"),
  // GTO Compliance Fields
  registrationStatus: text("registration_status").default("pending"), // "registered", "pending", "revoked"
  registrationNumber: text("registration_number"),  // GTO registration number with authorities
  registrationDate: date("registration_date"),
  registrationExpiryDate: date("registration_expiry_date"),
  lastComplianceAudit: date("last_compliance_audit"),
  nextComplianceAudit: date("next_compliance_audit"),
  complianceRating: integer("compliance_rating"), // 1-5 scale of compliance
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertGtoOrganizationSchema = createInsertSchema(gtoOrganizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// External Portals Configuration
export const externalPortals = pgTable("external_portals", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => gtoOrganizations.id).notNull(),
  portalName: text("portal_name").notNull(),            // e.g. 'RatesCalc', 'FairWork API Portal'
  portalType: text("portal_type"),                     // e.g. 'pay_calculation', 'compliance'
  baseUrl: text("base_url"),
  apiKey: text("api_key"),                     // If needed for authentication
  configuration: json("configuration").default({}),       // Extra config
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertExternalPortalSchema = createInsertSchema(externalPortals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Extend existing tables

// Add AQF & GTO fields to apprentices
export const extendedApprentices = {
  aqfLevel: text("aqf_level"),                 // e.g. 'Certificate III', 'Diploma'
  apprenticeshipYear: integer("apprenticeship_year"),   // Tracks which year of apprenticeship
  gtoEnrolled: boolean("gto_enrolled").default(false),  // Flag if the employee is placed via a GTO
  gtoId: integer("gto_id").references(() => gtoOrganizations.id),  // Reference to GTO organization
};

// Add labour hire & GTO fields to placements
export const extendedPlacements = {
  labourHireIndicator: boolean("labour_hire_indicator").default(false), // Distinguish direct hire vs. labour hire
  gtoPlacement: boolean("gto_placement").default(false),             // If placed by a GTO
  ebaId: integer("eba_id").references(() => enterpriseAgreements.id), // Link to enterprise agreement
};

// Add Fair Work & AQF fields to training contracts
export const extendedTrainingContracts = {
  aqfLevel: text("aqf_level"),                 // e.g. 'Certificate III', 'Diploma'
  rtoName: text("rto_name"),                    // Name of the Registered Training Organisation
  rtoCode: text("rto_code"),                    // e.g., provider's RTO code
};

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Apprentice = typeof apprentices.$inferSelect;
export type InsertApprentice = z.infer<typeof insertApprenticeSchema>;

export type HostEmployer = typeof hostEmployers.$inferSelect;
export type InsertHostEmployer = z.infer<typeof insertHostEmployerSchema>;

export type TrainingContract = typeof trainingContracts.$inferSelect;
export type InsertTrainingContract = z.infer<typeof insertTrainingContractSchema>;

export type Placement = typeof placements.$inferSelect;
export type InsertPlacement = z.infer<typeof insertPlacementSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type ComplianceRecord = typeof complianceRecords.$inferSelect;
export type InsertComplianceRecord = z.infer<typeof insertComplianceRecordSchema>;

export type Timesheet = typeof timesheets.$inferSelect;
export type InsertTimesheet = z.infer<typeof insertTimesheetSchema>;

export type TimesheetDetail = typeof timesheetDetails.$inferSelect;
export type InsertTimesheetDetail = z.infer<typeof insertTimesheetDetailSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Export new Australian-specific types
export type Award = typeof awards.$inferSelect;
export type InsertAward = z.infer<typeof insertAwardSchema>;

export type AwardClassification = typeof awardClassifications.$inferSelect;
export type InsertAwardClassification = z.infer<typeof insertAwardClassificationSchema>;

export type PayRate = typeof payRates.$inferSelect;
export type InsertPayRate = z.infer<typeof insertPayRateSchema>;

export type PenaltyRule = typeof penaltyRules.$inferSelect;
export type InsertPenaltyRule = z.infer<typeof insertPenaltyRuleSchema>;

export type AllowanceRule = typeof allowanceRules.$inferSelect;
export type InsertAllowanceRule = z.infer<typeof insertAllowanceRuleSchema>;

export type PublicHoliday = typeof publicHolidays.$inferSelect;
export type InsertPublicHoliday = z.infer<typeof insertPublicHolidaySchema>;

export type FairworkComplianceLog = typeof fairworkComplianceLogs.$inferSelect;
export type InsertFairworkComplianceLog = z.infer<typeof insertFairworkComplianceLogSchema>;

export type EnterpriseAgreement = typeof enterpriseAgreements.$inferSelect;
export type InsertEnterpriseAgreement = z.infer<typeof insertEnterpriseAgreementSchema>;

export type GtoOrganization = typeof gtoOrganizations.$inferSelect;
export type InsertGtoOrganization = z.infer<typeof insertGtoOrganizationSchema>;

export type ExternalPortal = typeof externalPortals.$inferSelect;
export type InsertExternalPortal = z.infer<typeof insertExternalPortalSchema>;

// GTO Compliance Module
export const gtoComplianceStandards = pgTable("gto_compliance_standards", {
  id: serial("id").primaryKey(),
  standardNumber: text("standard_number").notNull(),
  standardName: text("standard_name").notNull(),
  standardDescription: text("standard_description").notNull(),
  category: text("category").notNull(), // Recruitment/Monitoring/Governance
  requiredEvidence: text("required_evidence").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGtoComplianceStandardSchema = createInsertSchema(gtoComplianceStandards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const complianceAssessments = pgTable("compliance_assessments", {
  id: serial("id").primaryKey(),
  standardId: integer("standard_id").references(() => gtoComplianceStandards.id),
  organizationId: integer("organization_id").references(() => gtoOrganizations.id),
  status: text("status").notNull(), // "compliant", "non-compliant", "at_risk", "in_progress"
  assessmentDate: timestamp("assessment_date").notNull(),
  assessedBy: integer("assessed_by").references(() => users.id),
  evidence: json("evidence"),
  notes: text("notes"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertComplianceAssessmentSchema = createInsertSchema(complianceAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const apprenticeRecruitment = pgTable("apprentice_recruitment", {
  id: serial("id").primaryKey(),
  apprenticeId: integer("apprentice_id").references(() => apprentices.id),
  informationDisclosure: boolean("information_disclosure").default(false),
  informationDisclosureDate: timestamp("information_disclosure_date"),
  informationDisclosureEvidence: json("information_disclosure_evidence"),
  suitabilityAssessment: boolean("suitability_assessment").default(false),
  suitabilityAssessmentDate: timestamp("suitability_assessment_date"),
  suitabilityAssessmentScore: integer("suitability_assessment_score"),
  llnAssessment: boolean("lln_assessment").default(false),
  llnAssessmentDate: timestamp("lln_assessment_date"),
  llnAssessmentResults: json("lln_assessment_results"),
  specialNeeds: boolean("special_needs").default(false),
  specialNeedsDetails: json("special_needs_details"),
  guardianInformed: boolean("guardian_informed").default(false),
  guardianInformedDate: timestamp("guardian_informed_date"),
  guardianDetails: json("guardian_details"),
  signedAcknowledgment: boolean("signed_acknowledgment").default(false),
  signedAcknowledgmentDate: timestamp("signed_acknowledgment_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertApprenticeRecruitmentSchema = createInsertSchema(apprenticeRecruitment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const hostEmployerAgreements = pgTable("host_employer_agreements", {
  id: serial("id").primaryKey(),
  hostEmployerId: integer("host_employer_id").references(() => hostEmployers.id),
  agreementDate: timestamp("agreement_date").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  inductionProvided: boolean("induction_provided").default(false),
  inductionDate: timestamp("induction_date"),
  whsCompliance: text("whs_compliance").notNull(), // "compliant", "review_required", "non_compliant"
  whsAuditDate: timestamp("whs_audit_date"),
  agreementDocument: json("agreement_document"),
  supervisionCapacity: boolean("supervision_capacity").default(false),
  trainingCapacity: boolean("training_capacity").default(false),
  facilityCapacity: boolean("facility_capacity").default(false),
  reviewNotes: text("review_notes"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHostEmployerAgreementSchema = createInsertSchema(hostEmployerAgreements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const apprenticeInduction = pgTable("apprentice_induction", {
  id: serial("id").primaryKey(),
  apprenticeId: integer("apprentice_id").references(() => apprentices.id),
  inductionCompleted: boolean("induction_completed").default(false),
  inductionDate: timestamp("induction_date"),
  inductionContent: json("induction_content"),
  responsibilitiesExplained: boolean("responsibilities_explained").default(false),
  workplaceOperations: boolean("workplace_operations").default(false),
  industrialRelations: boolean("industrial_relations").default(false),
  whsRights: boolean("whs_rights").default(false),
  supportMechanisms: boolean("support_mechanisms").default(false),
  signOffBy: integer("sign_off_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertApprenticeInductionSchema = createInsertSchema(apprenticeInduction).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  complainantType: text("complainant_type").notNull(), // "apprentice", "host_employer", "rto"
  complainantId: integer("complainant_id"), // FK to appropriate table
  complaintType: text("complaint_type").notNull(), // "training", "payment", "quality", etc.
  openedDate: timestamp("opened_date").notNull(),
  status: text("status").notNull(), // "open", "under_review", "closed"
  description: text("description").notNull(),
  actionTaken: text("action_taken"),
  resolvedDate: timestamp("resolved_date"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const appeals = pgTable("appeals", {
  id: serial("id").primaryKey(),
  appellantType: text("appellant_type").notNull(), // "apprentice", "host_employer"
  appellantId: integer("appellant_id"), // FK to appropriate table
  appealType: text("appeal_type").notNull(), // "dismissal", "contract_breach", "extension"
  openedDate: timestamp("opened_date").notNull(),
  status: text("status").notNull(), // "pending", "referred", "approved", "rejected"
  description: text("description").notNull(),
  decisionDetails: text("decision_details"),
  decisionDate: timestamp("decision_date"),
  decidedBy: integer("decided_by").references(() => users.id),
  externalReferral: boolean("external_referral").default(false),
  referralDetails: json("referral_details"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAppealSchema = createInsertSchema(appeals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type GtoComplianceStandard = typeof gtoComplianceStandards.$inferSelect;
export type InsertGtoComplianceStandard = z.infer<typeof insertGtoComplianceStandardSchema>;

export type ComplianceAssessment = typeof complianceAssessments.$inferSelect;
export type InsertComplianceAssessment = z.infer<typeof insertComplianceAssessmentSchema>;

export type ApprenticeRecruitment = typeof apprenticeRecruitment.$inferSelect;
export type InsertApprenticeRecruitment = z.infer<typeof insertApprenticeRecruitmentSchema>;

export type HostEmployerAgreement = typeof hostEmployerAgreements.$inferSelect;
export type InsertHostEmployerAgreement = z.infer<typeof insertHostEmployerAgreementSchema>;

export type ApprenticeInduction = typeof apprenticeInduction.$inferSelect;
export type InsertApprenticeInduction = z.infer<typeof insertApprenticeInductionSchema>;

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;

export type Appeal = typeof appeals.$inferSelect;
export type InsertAppeal = z.infer<typeof insertAppealSchema>;
