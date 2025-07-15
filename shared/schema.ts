import { pgTable, text, serial, integer, boolean, date, timestamp, json, numeric, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Import labour hire workers schema
export * from "./schema/labour-hire";

// Users
// Roles
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isSystem: boolean("is_system").default(false), // System roles cannot be deleted
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertRoleSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  isSystem: z.boolean().optional(),
});

// Permissions
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category"), // e.g., "apprentice", "host", "training", etc.
  action: text("action").notNull(), // e.g., "create", "read", "update", "delete"
  resource: text("resource").notNull(), // e.g., "apprentice", "host", "document", etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPermissionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  action: z.string(),
  resource: z.string(),
});

// Role Permissions (many-to-many)
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  permissionId: integer("permission_id").references(() => permissions.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRolePermissionSchema = z.object({
  roleId: z.number(),
  permissionId: z.number(),
});

// Subscription Plans (for future Stripe integration)
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }),
  billingCycle: text("billing_cycle").default("monthly"), // "monthly", "yearly", etc.
  features: json("features").default({}),
  isActive: boolean("is_active").default(true),
  stripePriceId: text("stripe_price_id"), // For Stripe integration
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSubscriptionPlanSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  billingCycle: z.string(),
  features: z.string().optional(),
  stripePriceId: z.string().optional(),
});

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user"), // Legacy role field
  roleId: integer("role_id").references(() => roles.id), // New reference to roles table
  organizationId: integer("organization_id").references(() => gtoOrganizations.id), // Association with organization
  profileImage: text("profile_image"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  // Stripe fields for future integration
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status"),
  subscriptionPlanId: integer("subscription_plan_id").references(() => subscriptionPlans.id),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string().optional(),
  roleId: z.number().optional(),
  organizationId: z.number().optional(),
  profileImage: z.string().optional(),
  isActive: z.boolean().optional(),
  subscriptionPlanId: z.number().optional(),
  subscriptionStatus: z.string().optional(),
  subscriptionEndsAt: z.date().optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
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
  // AQF & GTO fields
  aqfLevel: text("aqf_level"),                                   // e.g. 'Certificate III', 'Diploma'
  apprenticeshipYear: integer("apprenticeship_year"),            // Tracks which year of apprenticeship
  gtoEnrolled: boolean("gto_enrolled").default(false),           // Flag if placed via a GTO
  gtoId: integer("gto_id"),                                      // Reference to GTO organization
});

export const insertApprenticeSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.date().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  qualificationId: z.number().optional(),
  startDate: z.date().optional(),
  apprenticeshipYear: z.number().optional(),
  gtoEnrolled: z.boolean().optional(),
  gtoId: z.number().optional(),
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
  // Organization relationship
  organizationId: integer("organization_id").references(() => gtoOrganizations.id),
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
  // Charge rate customization fields
  customMarginRate: numeric("custom_margin_rate", { precision: 5, scale: 2 }),  // Custom margin rate for this host employer
  customAdminRate: numeric("custom_admin_rate", { precision: 5, scale: 2 }),    // Custom admin rate for this host employer
  chargeRateAgreement: text("charge_rate_agreement"),            // Description of any special agreements
  billingCycle: text("billing_cycle").default("weekly"),        // weekly, fortnightly, monthly
  agreementExpiry: date("agreement_expiry")                     // When the charge rate agreement expires
});

export const insertHostEmployerSchema = createInsertSchema(hostEmployers).omit({
  id: true,
});

// Define host employer relationships
export const hostEmployerRelations = relations(hostEmployers, ({ one, many }) => ({
  organization: one(gtoOrganizations, {
    fields: [hostEmployers.organizationId],
    references: [gtoOrganizations.id],
  }),
  placements: many(placements),
  quotes: many(quotes)
}));

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
  ebaId: integer("eba_id").references(() => enterpriseAgreements.id), // Link to enterprise agreement
  
  // Charge rate fields
  chargeRate: numeric("charge_rate", { precision: 10, scale: 2 }),       // Current charge rate for host employer
  negotiatedRate: numeric("negotiated_rate", { precision: 10, scale: 2 }), // Negotiated hourly rate for apprentice
  lastChargeRateUpdate: timestamp("last_charge_rate_update"),           // When the charge rate was last updated
  quoteId: integer("quote_id").references(() => quotes.id),            // Link to the original quote if applicable
});

export const insertPlacementSchema = createInsertSchema(placements).omit({
  id: true,
});

// Define placement relationships
export const placementsRelations = relations(placements, ({ one }) => ({
  apprentice: one(apprentices, {
    fields: [placements.apprenticeId],
    references: [apprentices.id],
  }),
  hostEmployer: one(hostEmployers, {
    fields: [placements.hostEmployerId],
    references: [hostEmployers.id],
  }),
  quote: one(quotes, {
    fields: [placements.quoteId],
    references: [quotes.id],
  }),
  enterpriseAgreement: one(enterpriseAgreements, {
    fields: [placements.ebaId],
    references: [enterpriseAgreements.id],
  })
}));

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
  hoursWorked: numeric("hours_worked", { precision: 5, scale: 2 }).notNull(),
  description: text("description"),
  startTime: text("start_time"),  // Format: HH:MM (24-hour)
  endTime: text("end_time"),      // Format: HH:MM (24-hour)
  breakDuration: numeric("break_duration", { precision: 5, scale: 2 }),  // Break duration in hours
  dayType: text("day_type").default("weekday"),  // 'weekday', 'saturday', 'sunday', 'public_holiday'
  // Pay calculation fields
  awardRateId: integer("award_rate_id").references(() => payRates.id),
  penaltyRuleId: integer("penalty_rule_id").references(() => penaltyRules.id),
  baseRate: numeric("base_rate", { precision: 10, scale: 2 }),  // Hourly base rate for this shift
  penaltyRate: numeric("penalty_rate", { precision: 10, scale: 2 }),  // Applied penalty rate (if any)
  allowances: json("allowances").default([]),  // Array of applied allowances
  calculatedAmount: numeric("calculated_amount", { precision: 10, scale: 2 }),  // Total calculated pay for this detail entry
});

export const insertTimesheetDetailSchema = createInsertSchema(timesheetDetails).omit({
  id: true,
});

// Define timesheet detail relationships
export const timesheetDetailsRelations = relations(timesheetDetails, ({ one }) => ({
  timesheet: one(timesheets, {
    fields: [timesheetDetails.timesheetId],
    references: [timesheets.id],
  }),
  awardRate: one(payRates, {
    fields: [timesheetDetails.awardRateId],
    references: [payRates.id],
  }),
  penaltyRule: one(penaltyRules, {
    fields: [timesheetDetails.penaltyRuleId],
    references: [penaltyRules.id],
  })
}));

// Timesheet Calculations
export const timesheetCalculations = pgTable("timesheet_calculations", {
  id: serial("id").primaryKey(),
  timesheetId: integer("timesheet_id").references(() => timesheets.id).notNull(),
  totalHours: numeric("total_hours", { precision: 10, scale: 2 }).notNull(),
  basePayTotal: numeric("base_pay_total", { precision: 10, scale: 2 }).notNull(),
  penaltyPayTotal: numeric("penalty_pay_total", { precision: 10, scale: 2 }),
  allowancesTotal: numeric("allowances_total", { precision: 10, scale: 2 }),
  grossTotal: numeric("gross_total", { precision: 10, scale: 2 }).notNull(),
  awardName: text("award_name"),
  classificationName: text("classification_name"),
  awardCode: text("award_code"),
  calculatedAt: timestamp("calculated_at").notNull().defaultNow(),
  payrollProcessed: boolean("payroll_processed").default(false),
  payrollProcessedDate: timestamp("payroll_processed_date"),
});

export const insertTimesheetCalculationSchema = createInsertSchema(timesheetCalculations).omit({
  id: true,
  calculatedAt: true,
  payrollProcessedDate: true,
});

// Define timesheet calculation relationships
export const timesheetCalculationsRelations = relations(timesheetCalculations, ({ one }) => ({
  timesheet: one(timesheets, {
    fields: [timesheetCalculations.timesheetId],
    references: [timesheets.id],
  })
}));

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
  industry: text("industry"),                    // e.g. 'Construction', 'Manufacturing', 'Health'
  sector: text("sector"),                        // e.g. 'Private', 'Public', 'Not-for-profit'
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

// Charge Rate Calculations
export const chargeRateCalculations = pgTable("charge_rate_calculations", {
  id: serial("id").primaryKey(),
  apprenticeId: integer("apprentice_id").references(() => apprentices.id).notNull(),
  hostEmployerId: integer("host_employer_id").references(() => hostEmployers.id).notNull(),
  payRate: numeric("pay_rate", { precision: 10, scale: 2 }).notNull(),
  totalHours: numeric("total_hours", { precision: 10, scale: 2 }).notNull(),
  billableHours: numeric("billable_hours", { precision: 10, scale: 2 }).notNull(),
  baseWage: numeric("base_wage", { precision: 10, scale: 2 }).notNull(),
  onCosts: json("on_costs").notNull(),
  totalCost: numeric("total_cost", { precision: 10, scale: 2 }).notNull(),
  costPerHour: numeric("cost_per_hour", { precision: 10, scale: 2 }).notNull(),
  chargeRate: numeric("charge_rate", { precision: 10, scale: 2 }).notNull(),
  marginRate: numeric("margin_rate", { precision: 5, scale: 2 }).notNull(),
  calculationDate: timestamp("calculation_date").notNull().defaultNow(),
  approved: boolean("approved").default(false),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedDate: timestamp("approved_date"),
  applied: boolean("applied").default(false),
  notes: text("notes"),
});

export const insertChargeRateCalculationSchema = createInsertSchema(chargeRateCalculations).omit({
  id: true,
  calculationDate: true,
  approvedDate: true,
});

// Define charge rate calculation relationships
export const chargeRateCalculationsRelations = relations(chargeRateCalculations, ({ one }) => ({
  apprentice: one(apprentices, {
    fields: [chargeRateCalculations.apprenticeId],
    references: [apprentices.id],
  }),
  hostEmployer: one(hostEmployers, {
    fields: [chargeRateCalculations.hostEmployerId],
    references: [hostEmployers.id],
  }),
  approver: one(users, {
    fields: [chargeRateCalculations.approvedBy],
    references: [users.id],
  })
}));

// Quote Management
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  hostEmployerId: integer("host_employer_id").references(() => hostEmployers.id).notNull(),
  quoteNumber: text("quote_number").notNull().unique(),
  quoteDate: timestamp("quote_date").notNull().defaultNow(),
  validUntil: timestamp("valid_until"),
  quoteTitle: text("quote_title").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, accepted, rejected, expired
  acceptedDate: timestamp("accepted_date"),
  acceptedBy: text("accepted_by"),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  quoteDate: true,
  createdAt: true,
  updatedAt: true,
});

// Define quote relationships
export const quotesRelations = relations(quotes, ({ one, many }) => ({
  hostEmployer: one(hostEmployers, {
    fields: [quotes.hostEmployerId],
    references: [hostEmployers.id],
  }),
  creator: one(users, {
    fields: [quotes.createdBy],
    references: [users.id],
  }),
  placements: many(placements),
  lineItems: many(quoteLineItems)
}));

// Quote Line Items
export const quoteLineItems = pgTable("quote_line_items", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").references(() => quotes.id).notNull(),
  apprenticeId: integer("apprentice_id").references(() => apprentices.id),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(), // hour, day, week, etc.
  weeklyHours: numeric("weekly_hours", { precision: 5, scale: 2 }),
  ratePerHour: numeric("rate_per_hour", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  costBreakdown: json("cost_breakdown"), // Optional detailed breakdown
  notes: text("notes"),
  sortOrder: integer("sort_order").default(0),
});

export const insertQuoteLineItemSchema = createInsertSchema(quoteLineItems).omit({
  id: true,
});

// Define quote line item relationships
export const quoteLineItemsRelations = relations(quoteLineItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteLineItems.quoteId],
    references: [quotes.id],
  }),
  apprentice: one(apprentices, {
    fields: [quoteLineItems.apprenticeId],
    references: [apprentices.id],
  })
}));

// Fair Work Compliance Logs
export const fairworkComplianceLogs = pgTable("fairwork_compliance_logs", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => apprentices.id),
  timesheetId: integer("timesheet_id").references(() => timesheets.id),
  payRateId: integer("pay_rate_id").references(() => payRates.id),
  awardCode: text("award_code"),                    // Award code from Fair Work
  classificationCode: text("classification_code"),    // Classification code from Fair Work
  requestedRate: numeric("requested_rate", { precision: 10, scale: 2 }),
  minimumRate: numeric("minimum_rate", { precision: 10, scale: 2 }),
  isValid: boolean("is_valid"),                     // Whether the rate meets or exceeds minimum
  complianceCheck: text("compliance_check"),        // JSON or text describing checks performed
  message: text("message"),                        // Validation result message
  source: text("source"),                          // 'fair_work_api', 'internal', etc.
  verifiedDate: timestamp("verified_date"),        // When the verification was performed
  outcome: text("outcome"),                        // 'compliant', 'adjustment_needed', etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFairworkComplianceLogSchema = createInsertSchema(fairworkComplianceLogs).omit({
  id: true,
  createdAt: true,
});

// Define Fair Work compliance log relationships
export const fairworkComplianceLogsRelations = relations(fairworkComplianceLogs, ({ one }) => ({
  employee: one(apprentices, {
    fields: [fairworkComplianceLogs.employeeId],
    references: [apprentices.id],
  }),
  timesheet: one(timesheets, {
    fields: [fairworkComplianceLogs.timesheetId],
    references: [timesheets.id],
  }),
  payRate: one(payRates, {
    fields: [fairworkComplianceLogs.payRateId],
    references: [payRates.id],
  })
}));

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
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

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

export type ChargeRateCalculation = typeof chargeRateCalculations.$inferSelect;
export type InsertChargeRateCalculation = z.infer<typeof insertChargeRateCalculationSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type QuoteLineItem = typeof quoteLineItems.$inferSelect;
export type InsertQuoteLineItem = z.infer<typeof insertQuoteLineItemSchema>;

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

// Units of Competency and Qualifications for Australian VET System

// Units of Competency - the building blocks of all VET qualifications
export const unitsOfCompetency = pgTable("units_of_competency", {
  id: serial("id").primaryKey(),
  unitCode: text("unit_code").notNull().unique(), // e.g., BSBTEC201
  unitTitle: text("unit_title").notNull(),  // e.g., "Use business software applications"
  unitDescription: text("unit_description"),
  releaseNumber: text("release_number"), // e.g., "Release 1"
  releaseDate: date("release_date"),
  trainingPackage: text("training_package"), // e.g., "BSB" for Business Services
  trainingPackageRelease: text("training_package_release"),
  elementSummary: json("element_summary"), // Array of elements
  performanceCriteria: json("performance_criteria"),
  assessmentRequirements: json("assessment_requirements"),
  nominalHours: integer("nominal_hours"),
  isActive: boolean("is_active").default(true),
  isImported: boolean("is_imported").default(false), // Flag for units imported from external packs
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUnitOfCompetencySchema = createInsertSchema(unitsOfCompetency).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Qualifications - made up of multiple Units of Competency
export const qualifications = pgTable("qualifications", {
  id: serial("id").primaryKey(),
  qualificationCode: text("qualification_code").notNull().unique(), // e.g., BSB20120
  qualificationTitle: text("qualification_title").notNull(), // e.g., "Certificate II in Workplace Skills"
  qualificationDescription: text("qualification_description"),
  aqfLevel: text("aqf_level").notNull(), // e.g., "Certificate I, II, III, IV, Diploma, etc."
  aqfLevelNumber: integer("aqf_level_number").notNull(), // 1 for Cert I, 2 for Cert II, etc.
  trainingPackage: text("training_package"), // e.g., "BSB" for Business Services
  trainingPackageRelease: text("training_package_release"),
  totalUnits: integer("total_units").notNull(),
  coreUnits: integer("core_units").notNull(),
  electiveUnits: integer("elective_units").notNull(),
  nominalHours: integer("nominal_hours"),
  isActive: boolean("is_active").default(true),
  isApprenticeshipQualification: boolean("is_apprenticeship_qualification").default(false),
  isFundedQualification: boolean("is_funded_qualification").default(false),
  fundingDetails: json("funding_details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertQualificationSchema = createInsertSchema(qualifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Qualification Structure - connects Qualifications to Units of Competency
export const qualificationStructure = pgTable("qualification_structure", {
  id: serial("id").primaryKey(),
  qualificationId: integer("qualification_id").references(() => qualifications.id).notNull(),
  unitId: integer("unit_id").references(() => unitsOfCompetency.id).notNull(),
  isCore: boolean("is_core").default(false), // false means elective
  groupName: text("group_name"), // For grouping electives, e.g., "Group A", "Group B"
  isMandatoryElective: boolean("is_mandatory_elective").default(false), // Some elective groups require a minimum number of units
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertQualificationStructureSchema = createInsertSchema(qualificationStructure).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Apprentice Unit Progress - tracks individual unit progression for apprentices
export const apprenticeUnitProgress = pgTable("apprentice_unit_progress", {
  id: serial("id").primaryKey(),
  apprenticeId: integer("apprentice_id").references(() => apprentices.id).notNull(),
  unitId: integer("unit_id").references(() => unitsOfCompetency.id).notNull(),
  status: text("status").notNull().default("not_started"), // "not_started", "in_progress", "completed", "assessed"
  startDate: date("start_date"),
  completedDate: date("completed_date"), 
  assessedDate: date("assessed_date"),
  assessmentResult: text("assessment_result"), // "competent", "not_yet_competent"
  assessorId: integer("assessor_id").references(() => users.id),
  evidence: json("evidence"), // Links to evidence documents
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertApprenticeUnitProgressSchema = createInsertSchema(apprenticeUnitProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Apprentice Qualification Enrollment - tracks which qualifications an apprentice is enrolled in
export const apprenticeQualifications = pgTable("apprentice_qualifications", {
  id: serial("id").primaryKey(),
  apprenticeId: integer("apprentice_id").references(() => apprentices.id).notNull(),
  qualificationId: integer("qualification_id").references(() => qualifications.id).notNull(),
  enrollmentDate: date("enrollment_date").notNull(),
  expectedCompletionDate: date("expected_completion_date"),
  status: text("status").notNull().default("active"), // "active", "completed", "withdrawn"
  completionDate: date("completion_date"),
  certificateIssueDate: date("certificate_issue_date"),
  certificateNumber: text("certificate_number"),
  rtoId: integer("rto_id"), // Reference to RTO if not in-house
  rtoName: text("rto_name"), // If external RTO
  fundingSource: text("funding_source"), // Government funded, fee-for-service, etc.
  fundingDetails: json("funding_details"),
  trainingPlanDocumentId: integer("training_plan_document_id").references(() => documents.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertApprenticeQualificationSchema = createInsertSchema(apprenticeQualifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UnitOfCompetency = typeof unitsOfCompetency.$inferSelect;
export type InsertUnitOfCompetency = z.infer<typeof insertUnitOfCompetencySchema>;

export type Qualification = typeof qualifications.$inferSelect;
export type InsertQualification = z.infer<typeof insertQualificationSchema>;

export type QualificationStructure = typeof qualificationStructure.$inferSelect;
export type InsertQualificationStructure = z.infer<typeof insertQualificationStructureSchema>;

export type ApprenticeUnitProgress = typeof apprenticeUnitProgress.$inferSelect;
export type InsertApprenticeUnitProgress = z.infer<typeof insertApprenticeUnitProgressSchema>;

export type ApprenticeQualification = typeof apprenticeQualifications.$inferSelect;
export type InsertApprenticeQualification = z.infer<typeof insertApprenticeQualificationSchema>;

// Host Employer Preferred Qualifications
export const hostEmployerPreferredQualifications = pgTable("host_employer_preferred_qualifications", {
  id: serial("id").primaryKey(),
  hostEmployerId: integer("host_employer_id").references(() => hostEmployers.id).notNull(),
  qualificationId: integer("qualification_id").references(() => qualifications.id).notNull(),
  priority: text("priority").default("medium"), // "high", "medium", "low"
  notes: text("notes"),
  isRequired: boolean("is_required").default(false), // Whether this qualification is required or just preferred
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertHostEmployerPreferredQualificationSchema = createInsertSchema(hostEmployerPreferredQualifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type HostEmployerPreferredQualification = typeof hostEmployerPreferredQualifications.$inferSelect;
export type InsertHostEmployerPreferredQualification = z.infer<typeof insertHostEmployerPreferredQualificationSchema>;

// Enrichment Programs
export const enrichmentPrograms = pgTable("enrichment_programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., "soft skills", "technical", "safety", "professional development"
  status: text("status").notNull().default("upcoming"), // "upcoming", "active", "completed", "cancelled"
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  tags: jsonb("tags").default([]).notNull(),
  facilitator: text("facilitator"),
  location: text("location"),
  maxParticipants: integer("max_participants"),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  fundingSource: text("funding_source"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEnrichmentProgramSchema = createInsertSchema(enrichmentPrograms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Enrichment Program Participants
export const enrichmentParticipants = pgTable("enrichment_participants", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").references(() => enrichmentPrograms.id).notNull(),
  apprenticeId: integer("apprentice_id").references(() => apprentices.id).notNull(),
  enrollmentDate: date("enrollment_date").notNull().defaultNow(),
  status: text("status").notNull().default("enrolled"), // "enrolled", "completed", "withdrawn"
  completionDate: date("completion_date"),
  feedback: text("feedback"),
  rating: integer("rating"), // Rating given by participant
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEnrichmentParticipantSchema = createInsertSchema(enrichmentParticipants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Enrichment Workshops/Events
export const enrichmentWorkshops = pgTable("enrichment_workshops", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").references(() => enrichmentPrograms.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  workshopDate: date("workshop_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  location: text("location"),
  facilitator: text("facilitator"),
  maxAttendees: integer("max_attendees"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEnrichmentWorkshopSchema = createInsertSchema(enrichmentWorkshops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Workshop Attendees
export const workshopAttendees = pgTable("workshop_attendees", {
  id: serial("id").primaryKey(),
  workshopId: integer("workshop_id").references(() => enrichmentWorkshops.id).notNull(),
  apprenticeId: integer("apprentice_id").references(() => apprentices.id).notNull(),
  status: text("status").notNull().default("registered"), // "registered", "attended", "cancelled", "no-show"
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
  feedback: text("feedback"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWorkshopAttendeeSchema = createInsertSchema(workshopAttendees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types export
export type EnrichmentProgram = typeof enrichmentPrograms.$inferSelect;
export type InsertEnrichmentProgram = z.infer<typeof insertEnrichmentProgramSchema>;

export type EnrichmentParticipant = typeof enrichmentParticipants.$inferSelect;
export type InsertEnrichmentParticipant = z.infer<typeof insertEnrichmentParticipantSchema>;

export type EnrichmentWorkshop = typeof enrichmentWorkshops.$inferSelect;
export type InsertEnrichmentWorkshop = z.infer<typeof insertEnrichmentWorkshopSchema>;

export type WorkshopAttendee = typeof workshopAttendees.$inferSelect;
export type InsertWorkshopAttendee = z.infer<typeof insertWorkshopAttendeeSchema>;

// Progress Review Templates
export const progressReviewTemplates = pgTable("progress_review_templates", {
  id: serial("id").primaryKey(),
  templateName: text("template_name").notNull(),
  description: text("description"),
  templateVersion: text("template_version").notNull(),
  formStructure: jsonb("form_structure").notNull(),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProgressReviewTemplateSchema = createInsertSchema(progressReviewTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Progress Reviews
export const progressReviews = pgTable("progress_reviews", {
  id: serial("id").primaryKey(),
  apprenticeId: integer("apprentice_id").references(() => apprentices.id).notNull(),
  templateId: integer("template_id").references(() => progressReviewTemplates.id).notNull(),
  reviewerId: integer("reviewer_id").references(() => users.id).notNull(),
  reviewDate: timestamp("review_date").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  reviewPeriodStart: date("review_period_start"),
  reviewPeriodEnd: date("review_period_end"),
  reviewData: jsonb("review_data").notNull(),
  overallRating: integer("overall_rating"),
  reviewSummary: text("review_summary"),
  apprenticeFeedback: text("apprentice_feedback"),
  reviewLocation: text("review_location"),
  nextReviewDate: timestamp("next_review_date"),
  nextReviewGoals: jsonb("next_review_goals"),
  hostEmployerId: integer("host_employer_id").references(() => hostEmployers.id),
  supervisorPresent: boolean("supervisor_present").default(false),
  supervisorName: text("supervisor_name"),
  supervisorFeedback: text("supervisor_feedback"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProgressReviewSchema = createInsertSchema(progressReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Progress Review Participants
export const progressReviewParticipants = pgTable("progress_review_participants", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => progressReviews.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // reviewer, observer, mentor, etc.
  attendanceStatus: text("attendance_status").notNull().default("invited"), // invited, confirmed, attended, absent
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProgressReviewParticipantSchema = createInsertSchema(progressReviewParticipants).omit({
  id: true,
  createdAt: true,
});

// Progress Review Action Items
export const progressReviewActionItems = pgTable("progress_review_action_items", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => progressReviews.id).notNull(),
  actionDescription: text("action_description").notNull(),
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  assigneeId: integer("assignee_id").references(() => users.id),
  dueDate: date("due_date"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  completionDate: date("completion_date"),
  completionNotes: text("completion_notes"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProgressReviewActionItemSchema = createInsertSchema(progressReviewActionItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Progress Review Documents
export const progressReviewDocuments = pgTable("progress_review_documents", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => progressReviews.id).notNull(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  documentType: text("document_type").notNull(), // evidence, signature, attachment, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProgressReviewDocumentSchema = createInsertSchema(progressReviewDocuments).omit({
  id: true,
  createdAt: true,
});

// Types for Progress Reviews
export type ProgressReviewTemplate = typeof progressReviewTemplates.$inferSelect;
export type InsertProgressReviewTemplate = z.infer<typeof insertProgressReviewTemplateSchema>;

export type ProgressReview = typeof progressReviews.$inferSelect;
export type InsertProgressReview = z.infer<typeof insertProgressReviewSchema>;

export type ProgressReviewParticipant = typeof progressReviewParticipants.$inferSelect;
export type InsertProgressReviewParticipant = z.infer<typeof insertProgressReviewParticipantSchema>;

export type ProgressReviewActionItem = typeof progressReviewActionItems.$inferSelect;
export type InsertProgressReviewActionItem = z.infer<typeof insertProgressReviewActionItemSchema>;

export type ProgressReviewDocument = typeof progressReviewDocuments.$inferSelect;
export type InsertProgressReviewDocument = z.infer<typeof insertProgressReviewDocumentSchema>;

// Export module schemas
export * from './schema/awards';
export * from './schema/billing';
export * from './schema/claims';
export * from './schema/whs';
export * from './schema/labour-hire';
export * from './schema/contacts';
export * from './schema/clients';
