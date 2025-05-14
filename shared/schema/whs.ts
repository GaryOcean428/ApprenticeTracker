import { pgTable, serial, text, varchar, timestamp, json, integer, boolean, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums for WHS module
export const incidentTypeEnum = pgEnum('whs_incident_type', ['incident', 'hazard', 'near_miss']);
export const incidentSeverityEnum = pgEnum('whs_incident_severity', ['low', 'medium', 'high']);
export const incidentStatusEnum = pgEnum('whs_incident_status', ['reported', 'investigating', 'action-required', 'resolved', 'closed']);

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
  immediate_actions: text('immediate_actions'),
  investigation_notes: text('investigation_notes'),
  resolution_details: text('resolution_details'),
  resolution_date: timestamp('resolution_date'),
  assigned_to_id: uuid('assigned_to_id'),
  assigned_to_name: varchar('assigned_to_name', { length: 100 }),
  notifiable_incident: boolean('notifiable_incident').default(false),
  authority_notified: boolean('authority_notified').default(false),
  authority_reference: varchar('authority_reference', { length: 100 }),
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
  description: z.string().min(10, 'Description must be at least 10 characters'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
}).omit({
  id: true,
  created_at: true,
  last_updated: true
} as const);

export const insertWitnessSchema = createInsertSchema(whs_witnesses, {
  name: z.string().min(2, 'Witness name must be at least 2 characters'),
}).omit({
  id: true,
  created_at: true
} as const);

export const insertDocumentSchema = createInsertSchema(whs_documents).omit({
  id: true,
  created_at: true
} as const);

export const insertRiskAssessmentSchema = createInsertSchema(whs_risk_assessments).omit({
  id: true,
  created_at: true
} as const);

export const insertInspectionSchema = createInsertSchema(whs_inspections).omit({
  id: true,
  created_at: true
} as const);

export const insertPolicySchema = createInsertSchema(whs_policies).omit({
  id: true,
  created_at: true
} as const);

// Define types
export type Incident = typeof whs_incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;

export type Witness = typeof whs_witnesses.$inferSelect;
export type InsertWitness = z.infer<typeof insertWitnessSchema>;

export type WHSDocument = typeof whs_documents.$inferSelect;
export type InsertWHSDocument = z.infer<typeof insertDocumentSchema>;

export type RiskAssessment = typeof whs_risk_assessments.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;

export type Inspection = typeof whs_inspections.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;

export type Policy = typeof whs_policies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;