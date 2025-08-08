import { pgTable, serial, text, varchar, timestamp, json, integer, boolean, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums for WHS module
export const incidentTypeEnum = pgEnum('whs_incident_type', ['incident', 'hazard', 'near_miss']);
export const incidentSeverityEnum = pgEnum('whs_incident_severity', ['low', 'medium', 'high']);
export const incidentStatusEnum = pgEnum('whs_incident_status', [
  'reported', 
  'investigating', 
  'action-required', 
  'remediation-in-progress', 
  'pending-review', 
  'resolved', 
  'closed', 
  'escalated', 
  'requires-followup'
]);

export const riskAssessmentStatusEnum = pgEnum('whs_risk_assessment_status', ['draft', 'in-progress', 'completed', 'review-required', 'expired']);
export const inspectionStatusEnum = pgEnum('whs_inspection_status', ['scheduled', 'in-progress', 'completed', 'overdue', 'cancelled']);
export const policyStatusEnum = pgEnum('whs_policy_status', ['draft', 'active', 'review-needed', 'archived']);

// Incidents/Hazards Table
export const whs_incidents = pgTable('whs_incidents', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  type: incidentTypeEnum('type').notNull().default('incident'),
  severity: incidentSeverityEnum('severity').notNull().default('medium'),
  status: incidentStatusEnum('status').notNull().default('reported'),
  location: varchar('location', { length: 200 }).notNull(),
  date_occurred: timestamp('date_occurred').notNull(),
  date_reported: timestamp('date_reported').notNull(),
  reporter_id: uuid('reporter_id').notNull(),
  reporter_name: varchar('reporter_name', { length: 100 }),
  apprentice_id: uuid('apprentice_id'),
  apprentice_name: varchar('apprentice_name', { length: 100 }),
  host_employer_id: uuid('host_employer_id'),
  host_employer_name: varchar('host_employer_name', { length: 100 }),
  host_supervisor_id: uuid('host_supervisor_id'),
  host_supervisor_name: varchar('host_supervisor_name', { length: 100 }),
  host_whs_contact_id: uuid('host_whs_contact_id'),
  host_whs_contact_name: varchar('host_whs_contact_name', { length: 100 }),
  host_notified: boolean('host_notified').default(false),
  host_notification_date: timestamp('host_notification_date'),
  immediate_actions: text('immediate_actions'),
  investigation_notes: text('investigation_notes'),
  resolution_details: text('resolution_details'),
  resolution_date: timestamp('resolution_date'),
  assigned_to_id: uuid('assigned_to_id'),
  assigned_to_name: varchar('assigned_to_name', { length: 100 }),
  notifiable_incident: boolean('notifiable_incident').default(false),
  authority_notified: boolean('authority_notified').default(false),
  authority_reference: varchar('authority_reference', { length: 100 }),
  followup_required: boolean('followup_required').default(false),
  followup_date: timestamp('followup_date'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Witnesses Table
export const whs_witnesses = pgTable('whs_witnesses', {
  id: uuid('id').defaultRandom().primaryKey(),
  incident_id: uuid('incident_id').notNull().references(() => whs_incidents.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  contact: varchar('contact', { length: 100 }),
  statement: text('statement'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Documents Table for WHS
export const whs_documents = pgTable('whs_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  incident_id: uuid('incident_id').references(() => whs_incidents.id, { onDelete: 'cascade' }),
  risk_assessment_id: uuid('risk_assessment_id').references(() => whs_risk_assessments.id, { onDelete: 'cascade' }),
  inspection_id: uuid('inspection_id').references(() => whs_inspections.id, { onDelete: 'cascade' }),
  policy_id: uuid('policy_id').references(() => whs_policies.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  filename: varchar('filename', { length: 200 }).notNull(),
  file_path: varchar('file_path', { length: 500 }).notNull(),
  file_type: varchar('file_type', { length: 50 }).notNull(),
  file_size: integer('file_size').notNull(),
  uploaded_by_id: uuid('uploaded_by_id').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Risk Assessments Table
export const whs_risk_assessments = pgTable('whs_risk_assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 200 }).notNull(),
  work_area: varchar('work_area', { length: 200 }),
  host_employer_id: uuid('host_employer_id'),
  host_employer_name: varchar('host_employer_name', { length: 100 }),
  assessment_date: timestamp('assessment_date').notNull(),
  assessor_id: uuid('assessor_id'),
  assessor_name: varchar('assessor_name', { length: 100 }),
  department: varchar('department', { length: 100 }),
  status: riskAssessmentStatusEnum('status').notNull().default('draft'),
  review_date: timestamp('review_date'),
  hazards: json('hazards').default([]),
  findings: text('findings'),
  recommendations: text('recommendations'),
  action_plan: text('action_plan'),
  approver_name: varchar('approver_name', { length: 100 }),
  approval_date: timestamp('approval_date'),
  approval_notes: text('approval_notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Inspections Table
export const whs_inspections = pgTable('whs_inspections', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  location: varchar('location', { length: 200 }).notNull(),
  host_employer_id: uuid('host_employer_id'),
  host_employer_name: varchar('host_employer_name', { length: 100 }),
  inspection_date: timestamp('inspection_date').notNull(),
  inspector_id: uuid('inspector_id').notNull(),
  inspector_name: varchar('inspector_name', { length: 100 }),
  status: inspectionStatusEnum('status').notNull().default('scheduled'),
  findings: text('findings'),
  compliance_score: integer('compliance_score'),
  action_items: json('action_items'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Safety Policies Table
export const whs_policies = pgTable('whs_policies', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  content: text('content').notNull(),
  file_path: varchar('file_path', { length: 500 }),
  document_type: varchar('document_type', { length: 50 }).notNull(),
  status: policyStatusEnum('status').notNull().default('draft'),
  version: varchar('version', { length: 50 }).notNull(),
  effective_date: timestamp('effective_date'),
  review_date: timestamp('review_date'),
  approved_by_id: uuid('approved_by_id'),
  approved_by_name: varchar('approved_by_name', { length: 100 }),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Define Zod schemas for validation and type inference
export const insertIncidentSchema = createInsertSchema(whs_incidents, {
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must not exceed 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(3, 'Location must be at least 3 characters').max(200, 'Location must not exceed 200 characters'),
  date_occurred: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for date occurred'
  }),
  date_reported: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for date reported'
  }),
  reporter_id: z.string().uuid('Invalid reporter ID format'),
  reporter_name: z.string().min(2, 'Reporter name must be at least 2 characters').optional(),
  immediate_actions: z.string().optional(),
  investigation_notes: z.string().optional(),
  type: z.enum(['incident', 'hazard', 'near_miss']),
  severity: z.enum(['low', 'medium', 'high']),
  status: z.enum([
    'reported', 
    'investigating', 
    'action-required', 
    'remediation-in-progress',
    'pending-review',
    'resolved', 
    'closed',
    'escalated',
    'requires-followup'
  ]),
  notifiable_incident: z.boolean().optional(),
  host_employer_id: z.string().uuid('Invalid host employer ID format').optional(),
  host_employer_name: z.string().optional(),
  host_supervisor_id: z.string().uuid('Invalid host supervisor ID format').optional(),
  host_supervisor_name: z.string().optional(),
  host_whs_contact_id: z.string().uuid('Invalid host WHS contact ID format').optional(),
  host_whs_contact_name: z.string().optional(),
  host_notified: z.boolean().optional(),
  host_notification_date: z.string().refine(val => !isNaN(Date.parse(val)) || !val, {
    message: 'Invalid date format for host notification date'
  }).optional(),
  followup_required: z.boolean().optional(),
  followup_date: z.string().refine(val => !isNaN(Date.parse(val)) || !val, {
    message: 'Invalid date format for followup date'
  }).optional(),
});
export const updateIncidentSchema = insertIncidentSchema.partial();

export const insertWitnessSchema = createInsertSchema(whs_witnesses, {
  name: z.string().min(2, 'Witness name must be at least 2 characters').max(100, 'Witness name must not exceed 100 characters'),
  incident_id: z.string().uuid('Invalid incident ID format'),
  contact: z.string().optional(),
  statement: z.string().optional(),
});

export const insertDocumentSchema = createInsertSchema(whs_documents, {
  title: z.string().min(3, 'Document title must be at least 3 characters').max(200, 'Document title must not exceed 200 characters'),
  filename: z.string().min(1, 'Filename is required').max(200, 'Filename must not exceed 200 characters'),
  file_path: z.string().min(1, 'File path is required').max(500, 'File path must not exceed 500 characters'),
  file_type: z.string().min(1, 'File type is required').max(50, 'File type must not exceed 50 characters'),
  file_size: z.number().int('File size must be an integer').positive('File size must be positive'),
  uploaded_by_id: z.string().uuid('Invalid uploader ID format'),
});

export const insertRiskAssessmentSchema = createInsertSchema(whs_risk_assessments, {
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must not exceed 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(3, 'Location must be at least 3 characters').max(200, 'Location must not exceed 200 characters'),
  assessment_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for assessment date'
  }),
  status: z.enum(['draft', 'in-progress', 'completed', 'review-required', 'expired']),
  work_area: z.string().max(200, 'Work area must not exceed 200 characters').optional(),
  findings: z.string().optional(),
  recommendations: z.string().optional(),
  action_plan: z.string().optional(),
});
export const updateRiskAssessmentSchema = insertRiskAssessmentSchema.partial();

export const insertInspectionSchema = createInsertSchema(whs_inspections, {
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must not exceed 200 characters'),
  location: z.string().min(3, 'Location must be at least 3 characters').max(200, 'Location must not exceed 200 characters'),
  inspection_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for inspection date'
  }),
  inspector_id: z.string().uuid('Invalid inspector ID format'),
  inspector_name: z.string().min(2, 'Inspector name must be at least 2 characters').max(100, 'Inspector name must not exceed 100 characters'),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'overdue', 'cancelled']),
  description: z.string().optional(),
  findings: z.string().optional(),
  compliance_score: z.number().int('Compliance score must be an integer').min(0, 'Compliance score must be at least 0').max(100, 'Compliance score must not exceed 100').optional(),
});
export const updateInspectionSchema = insertInspectionSchema.partial();

export const insertPolicySchema = createInsertSchema(whs_policies, {
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must not exceed 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  document_type: z.string().min(1, 'Document type is required').max(50, 'Document type must not exceed 50 characters'),
  status: z.enum(['draft', 'active', 'review-needed', 'archived']),
  version: z.string().min(1, 'Version is required').max(50, 'Version must not exceed 50 characters'),
  file_path: z.string().max(500, 'File path must not exceed 500 characters').optional(),
});
export const updatePolicySchema = insertPolicySchema.partial();

// Define types
export type Incident = typeof whs_incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type UpdateIncident = z.infer<typeof updateIncidentSchema>;

export type Witness = typeof whs_witnesses.$inferSelect;
export type InsertWitness = z.infer<typeof insertWitnessSchema>;

export type WHSDocument = typeof whs_documents.$inferSelect;
export type InsertWHSDocument = z.infer<typeof insertDocumentSchema>;

export type RiskAssessment = typeof whs_risk_assessments.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type UpdateRiskAssessment = z.infer<typeof updateRiskAssessmentSchema>;

export type Inspection = typeof whs_inspections.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type UpdateInspection = z.infer<typeof updateInspectionSchema>;
export type Policy = typeof whs_policies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type UpdatePolicy = z.infer<typeof updatePolicySchema>;
// WHS Metrics/Reports Table
export const whs_metrics = pgTable('whs_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  report_name: varchar('report_name', { length: 100 }).notNull(),
  report_type: varchar('report_type', { length: 50 }).notNull(), // 'incident', 'risk', 'inspection', 'compliance'
  parameters: json('parameters').default({}), // For storing report parameters
  date_range_start: timestamp('date_range_start'),
  date_range_end: timestamp('date_range_end'),
  created_by_id: uuid('created_by_id').notNull(),
  created_by_name: varchar('created_by_name', { length: 100 }),
  host_employer_id: uuid('host_employer_id'),
  host_employer_name: varchar('host_employer_name', { length: 100 }),
  metrics_data: json('metrics_data').default({}), // For storing calculated metrics
  chart_config: json('chart_config').default({}), // For storing chart display settings
  is_scheduled: boolean('is_scheduled').default(false),
  schedule_frequency: varchar('schedule_frequency', { length: 50 }), // 'daily', 'weekly', 'monthly'
  recipients: json('recipients').default([]), // For storing email recipients
  last_run_at: timestamp('last_run_at'),
  next_run_at: timestamp('next_run_at'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// WHS Metrics/Reports Type
export type WHSMetric = typeof whs_metrics.$inferSelect;

// WHS Export Template Table
export const whs_export_templates = pgTable('whs_export_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  template_name: varchar('template_name', { length: 100 }).notNull(),
  export_type: varchar('export_type', { length: 50 }).notNull(), // 'pdf', 'excel', 'csv'
  report_type: varchar('report_type', { length: 50 }).notNull(), // 'incident', 'risk', 'inspection', 'compliance'
  template_content: json('template_content').default({}), // For storing template structure
  header_content: text('header_content'),
  footer_content: text('footer_content'),
  created_by_id: uuid('created_by_id').notNull(),
  created_by_name: varchar('created_by_name', { length: 100 }),
  is_default: boolean('is_default').default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// WHS Export Template Type
export type WHSExportTemplate = typeof whs_export_templates.$inferSelect;

// Define Zod schemas for validation 
export const insertMetricSchema = createInsertSchema(whs_metrics, {
  report_name: z.string().min(3, 'Report name must be at least 3 characters').max(100, 'Report name must not exceed 100 characters'),
  report_type: z.string().min(3, 'Report type is required').max(50, 'Report type must not exceed 50 characters'),
  created_by_id: z.string().uuid('Invalid creator ID format'),
  date_range_start: z.string().refine(val => !isNaN(Date.parse(val)) || !val, {
    message: 'Invalid date format for range start'
  }).optional(),
  date_range_end: z.string().refine(val => !isNaN(Date.parse(val)) || !val, {
    message: 'Invalid date format for range end'
  }).optional(),
});

export const insertExportTemplateSchema = createInsertSchema(whs_export_templates, {
  template_name: z.string().min(3, 'Template name must be at least 3 characters').max(100, 'Template name must not exceed 100 characters'),
  export_type: z.string().min(2, 'Export type is required').max(50, 'Export type must not exceed 50 characters'),
  report_type: z.string().min(3, 'Report type is required').max(50, 'Report type must not exceed 50 characters'),
  created_by_id: z.string().uuid('Invalid creator ID format'),
});

export type InsertWHSMetric = z.infer<typeof insertMetricSchema>;
export type InsertWHSExportTemplate = z.infer<typeof insertExportTemplateSchema>;