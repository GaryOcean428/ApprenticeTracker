import { pgTable, serial, text, varchar, timestamp, json, integer, boolean, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums for Claims module
export const claimStatusEnum = pgEnum('claim_status', ['draft', 'pending', 'submitted', 'in-review', 'approved', 'rejected', 'paid', 'reconciled', 'cancelled']);
export const claimTypeEnum = pgEnum('claim_type', ['commencement', 'completion', 'retention', 'restart', 'mid-point', 'rural-regional', 'disability', 'mature-age', 'other']);
export const eligibilityStatusEnum = pgEnum('eligibility_status', ['eligible', 'ineligible', 'pending-review', 'pending-documentation', 'expired']);

// Eligibility Criteria Table
export const eligibility_criteria = pgTable('eligibility_criteria', {
  id: uuid('id').defaultRandom().primaryKey(),
  claim_type: claimTypeEnum('claim_type').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  jurisdiction: varchar('jurisdiction', { length: 50 }).notNull(), // State or Federal
  funding_body: varchar('funding_body', { length: 100 }).notNull(),
  eligibility_rules: json('eligibility_rules').default({}), // JSON structure with rules
  documentation_required: json('documentation_required').default([]),
  maximum_amount: integer('maximum_amount'),
  active: boolean('active').default(true),
  expiry_date: timestamp('expiry_date'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Apprentice/Trainee Eligibility Table
export const apprentice_eligibility = pgTable('apprentice_eligibility', {
  id: uuid('id').defaultRandom().primaryKey(),
  apprentice_id: uuid('apprentice_id').notNull(),
  apprentice_name: varchar('apprentice_name', { length: 100 }),
  criteria_id: uuid('criteria_id').notNull().references(() => eligibility_criteria.id),
  status: eligibilityStatusEnum('status').notNull().default('pending-review'),
  eligible_from_date: timestamp('eligible_from_date'),
  eligible_to_date: timestamp('eligible_to_date'),
  notes: text('notes'),
  documentation_status: json('documentation_status').default([]),
  reviewed_by_id: uuid('reviewed_by_id'),
  reviewed_by_name: varchar('reviewed_by_name', { length: 100 }),
  review_date: timestamp('review_date'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Claims Table
export const claims = pgTable('claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  claim_number: varchar('claim_number', { length: 50 }).notNull(),
  apprentice_id: uuid('apprentice_id').notNull(),
  apprentice_name: varchar('apprentice_name', { length: 100 }),
  eligibility_id: uuid('eligibility_id').references(() => apprentice_eligibility.id),
  claim_type: claimTypeEnum('claim_type').notNull(),
  status: claimStatusEnum('status').notNull().default('draft'),
  submission_date: timestamp('submission_date'),
  amount_requested: integer('amount_requested').notNull(),
  amount_approved: integer('amount_approved'),
  payment_date: timestamp('payment_date'),
  payment_reference: varchar('payment_reference', { length: 100 }),
  funding_body: varchar('funding_body', { length: 100 }).notNull(),
  jurisdiction: varchar('jurisdiction', { length: 50 }).notNull(), // State or Federal
  submitted_by_id: uuid('submitted_by_id'),
  submitted_by_name: varchar('submitted_by_name', { length: 100 }),
  reviewed_by_id: uuid('reviewed_by_id'),
  reviewed_by_name: varchar('reviewed_by_name', { length: 100 }),
  review_date: timestamp('review_date'),
  rejection_reason: text('rejection_reason'),
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Claim Documents Table
export const claim_documents = pgTable('claim_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  claim_id: uuid('claim_id').notNull().references(() => claims.id, { onDelete: 'cascade' }),
  document_type: varchar('document_type', { length: 50 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  filename: varchar('filename', { length: 200 }).notNull(),
  file_path: varchar('file_path', { length: 500 }).notNull(),
  file_type: varchar('file_type', { length: 50 }).notNull(),
  file_size: integer('file_size').notNull(),
  uploaded_by_id: uuid('uploaded_by_id').notNull(),
  uploaded_by_name: varchar('uploaded_by_name', { length: 100 }),
  upload_date: timestamp('upload_date').notNull().defaultNow(),
  verification_status: varchar('verification_status', { length: 50 }).default('pending'), // pending, verified, rejected
  verified_by_id: uuid('verified_by_id'),
  verified_by_name: varchar('verified_by_name', { length: 100 }),
  verification_date: timestamp('verification_date'),
  verification_notes: text('verification_notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Claim History Table
export const claim_history = pgTable('claim_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  claim_id: uuid('claim_id').notNull().references(() => claims.id, { onDelete: 'cascade' }),
  status: claimStatusEnum('status').notNull(),
  changed_by_id: uuid('changed_by_id').notNull(),
  changed_by_name: varchar('changed_by_name', { length: 100 }),
  change_date: timestamp('change_date').notNull().defaultNow(),
  notes: text('notes'),
  changes: json('changes').default({}),
});

// Claim Reminders Table
export const claim_reminders = pgTable('claim_reminders', {
  id: uuid('id').defaultRandom().primaryKey(),
  claim_id: uuid('claim_id').references(() => claims.id, { onDelete: 'cascade' }),
  eligibility_id: uuid('eligibility_id').references(() => apprentice_eligibility.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  reminder_date: timestamp('reminder_date').notNull(),
  reminder_type: varchar('reminder_type', { length: 50 }).notNull(), // deadline, followup, documentation, etc.
  assigned_to_id: uuid('assigned_to_id').notNull(),
  assigned_to_name: varchar('assigned_to_name', { length: 100 }),
  is_completed: boolean('is_completed').default(false),
  completed_date: timestamp('completed_date'),
  completed_by_id: uuid('completed_by_id'),
  completed_by_name: varchar('completed_by_name', { length: 100 }),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Define Zod schemas for validation and type inference
export const insertEligibilityCriteriaSchema = createInsertSchema(eligibility_criteria, {
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must not exceed 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  jurisdiction: z.string().min(2, 'Jurisdiction is required').max(50, 'Jurisdiction must not exceed 50 characters'),
  funding_body: z.string().min(2, 'Funding body is required').max(100, 'Funding body must not exceed 100 characters'),
  claim_type: z.enum(['commencement', 'completion', 'retention', 'restart', 'mid-point', 'rural-regional', 'disability', 'mature-age', 'other']),
  active: z.boolean().optional(),
  expiry_date: z.string().refine(val => !isNaN(Date.parse(val)) || !val, {
    message: 'Invalid date format for expiry date'
  }).optional(),
});

export const insertApprenticeEligibilitySchema = createInsertSchema(apprentice_eligibility, {
  apprentice_id: z.string().uuid('Invalid apprentice ID format'),
  criteria_id: z.string().uuid('Invalid criteria ID format'),
  status: z.enum(['eligible', 'ineligible', 'pending-review', 'pending-documentation', 'expired']),
  notes: z.string().optional(),
  eligible_from_date: z.string().refine(val => !isNaN(Date.parse(val)) || !val, {
    message: 'Invalid date format for eligible from date'
  }).optional(),
  eligible_to_date: z.string().refine(val => !isNaN(Date.parse(val)) || !val, {
    message: 'Invalid date format for eligible to date'
  }).optional(),
});

export const insertClaimSchema = createInsertSchema(claims, {
  claim_number: z.string().min(3, 'Claim number must be at least 3 characters').max(50, 'Claim number must not exceed 50 characters'),
  apprentice_id: z.string().uuid('Invalid apprentice ID format'),
  claim_type: z.enum(['commencement', 'completion', 'retention', 'restart', 'mid-point', 'rural-regional', 'disability', 'mature-age', 'other']),
  amount_requested: z.number().int('Amount must be an integer').positive('Amount must be positive'),
  funding_body: z.string().min(2, 'Funding body is required').max(100, 'Funding body must not exceed 100 characters'),
  jurisdiction: z.string().min(2, 'Jurisdiction is required').max(50, 'Jurisdiction must not exceed 50 characters'),
  status: z.enum(['draft', 'pending', 'submitted', 'in-review', 'approved', 'rejected', 'paid', 'reconciled', 'cancelled']),
  notes: z.string().optional(),
});

export const updateClaimSchema = insertClaimSchema.partial();

export const insertClaimDocumentSchema = createInsertSchema(claim_documents, {
  claim_id: z.string().uuid('Invalid claim ID format'),
  document_type: z.string().min(2, 'Document type is required').max(50, 'Document type must not exceed 50 characters'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must not exceed 200 characters'),
  filename: z.string().min(1, 'Filename is required').max(200, 'Filename must not exceed 200 characters'),
  file_path: z.string().min(1, 'File path is required').max(500, 'File path must not exceed 500 characters'),
  file_type: z.string().min(1, 'File type is required').max(50, 'File type must not exceed 50 characters'),
  file_size: z.number().int('File size must be an integer').positive('File size must be positive'),
  uploaded_by_id: z.string().uuid('Invalid uploader ID format'),
});

export const insertClaimReminderSchema = createInsertSchema(claim_reminders, {
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must not exceed 200 characters'),
  reminder_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for reminder date'
  }),
  reminder_type: z.string().min(2, 'Reminder type is required').max(50, 'Reminder type must not exceed 50 characters'),
  assigned_to_id: z.string().uuid('Invalid assignee ID format'),
  description: z.string().optional(),
});

// Define types
export type EligibilityCriteria = typeof eligibility_criteria.$inferSelect;
export type InsertEligibilityCriteria = z.infer<typeof insertEligibilityCriteriaSchema>;

export type ApprenticeEligibility = typeof apprentice_eligibility.$inferSelect;
export type InsertApprenticeEligibility = z.infer<typeof insertApprenticeEligibilitySchema>;

export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;

export type ClaimDocument = typeof claim_documents.$inferSelect;
export type InsertClaimDocument = z.infer<typeof insertClaimDocumentSchema>;

export type ClaimHistory = typeof claim_history.$inferSelect;

export type ClaimReminder = typeof claim_reminders.$inferSelect;
export type InsertClaimReminder = z.infer<typeof insertClaimReminderSchema>;