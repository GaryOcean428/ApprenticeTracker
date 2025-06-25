import { pgTable, serial, text, varchar, timestamp, json, integer, boolean, uuid, pgEnum, numeric, date } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums for Billing module
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'pending', 'sent', 'overdue', 'paid', 'partially-paid', 'cancelled', 'credit']);
export const paymentMethodEnum = pgEnum('payment_method', ['direct-deposit', 'credit-card', 'bpay', 'check', 'cash', 'other']);
export const rateTypeEnum = pgEnum('rate_type', ['base', 'overtime', 'holiday', 'weekend', 'penalty', 'allowance']);

// Award Rates Table
export const billingAwardRates = pgTable('billing_award_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  award_code: varchar('award_code', { length: 50 }).notNull(),
  award_name: varchar('award_name', { length: 200 }).notNull(),
  classification_code: varchar('classification_code', { length: 50 }).notNull(),
  classification_name: varchar('classification_name', { length: 200 }).notNull(),
  level: varchar('level', { length: 50 }).notNull(),
  effective_date: date('effective_date').notNull(),
  expiry_date: date('expiry_date'),
  hourly_rate: numeric('hourly_rate', { precision: 10, scale: 2 }).notNull(),
  weekly_rate: numeric('weekly_rate', { precision: 10, scale: 2 }),
  is_apprentice: boolean('is_apprentice').default(false),
  year_of_apprenticeship: integer('year_of_apprenticeship'),
  age_bracket: varchar('age_bracket', { length: 50 }),
  is_approved: boolean('is_approved').default(true),
  updated_from_fair_work: boolean('updated_from_fair_work').default(false),
  last_sync_date: timestamp('last_sync_date'),
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Award Penalties and Allowances Table
export const award_penalties = pgTable('award_penalties', {
  id: uuid('id').defaultRandom().primaryKey(),
  award_code: varchar('award_code', { length: 50 }).notNull(),
  penalty_code: varchar('penalty_code', { length: 50 }).notNull(),
  penalty_name: varchar('penalty_name', { length: 200 }).notNull(),
  type: rateTypeEnum('type').notNull(),
  multiplier: numeric('multiplier', { precision: 5, scale: 2 }).notNull(),
  fixed_amount: numeric('fixed_amount', { precision: 10, scale: 2 }),
  description: text('description'),
  applicable_days: json('applicable_days').default([]), // e.g. ["Monday", "Sunday"]
  applicable_times: json('applicable_times').default({}), // e.g. {"start": "18:00", "end": "06:00"}
  minimum_hours: numeric('minimum_hours', { precision: 5, scale: 2 }),
  is_approved: boolean('is_approved').default(true),
  effective_date: date('effective_date').notNull(),
  expiry_date: date('expiry_date'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// On-Cost Configuration Table
export const oncost_configuration = pgTable('oncost_configuration', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // superannuation, workers_comp, payroll_tax, etc.
  calculation_method: varchar('calculation_method', { length: 50 }).notNull(), // percentage, fixed, tiered
  percentage_rate: numeric('percentage_rate', { precision: 5, scale: 2 }),
  fixed_amount: numeric('fixed_amount', { precision: 10, scale: 2 }),
  tiered_rates: json('tiered_rates').default([]), // For tiered calculation methods
  is_mandatory: boolean('is_mandatory').default(true),
  is_active: boolean('is_active').default(true),
  jurisdiction: varchar('jurisdiction', { length: 50 }), // For state-specific rates
  effective_date: date('effective_date').notNull(),
  expiry_date: date('expiry_date'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Host Employer Rate Agreements Table
export const host_employer_rates = pgTable('host_employer_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  host_employer_id: uuid('host_employer_id').notNull(),
  host_employer_name: varchar('host_employer_name', { length: 100 }),
  agreement_name: varchar('agreement_name', { length: 100 }).notNull(),
  agreement_start_date: date('agreement_start_date').notNull(),
  agreement_end_date: date('agreement_end_date'),
  is_active: boolean('is_active').default(true),
  base_rate: numeric('base_rate', { precision: 10, scale: 2 }).notNull(),
  award_reference: uuid('award_reference').references(() => billingAwardRates.id),
  award_code: varchar('award_code', { length: 50 }),
  use_fair_work_rates: boolean('use_fair_work_rates').default(false),
  markup_percentage: numeric('markup_percentage', { precision: 5, scale: 2 }).default('0'),
  oncost_inclusions: json('oncost_inclusions').default([]), // Array of oncost IDs included
  custom_penalties: json('custom_penalties').default([]), // Custom penalty rates
  notes: text('notes'),
  approved_by_id: uuid('approved_by_id'),
  approved_by_name: varchar('approved_by_name', { length: 100 }),
  approval_date: timestamp('approval_date'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Invoice Table
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoice_number: varchar('invoice_number', { length: 50 }).notNull(),
  host_employer_id: uuid('host_employer_id').notNull(),
  host_employer_name: varchar('host_employer_name', { length: 100 }),
  status: invoiceStatusEnum('status').notNull().default('draft'),
  issue_date: date('issue_date').notNull(),
  due_date: date('due_date').notNull(),
  period_start_date: date('period_start_date'),
  period_end_date: date('period_end_date'),
  subtotal_amount: numeric('subtotal_amount', { precision: 10, scale: 2 }).notNull(),
  tax_amount: numeric('tax_amount', { precision: 10, scale: 2 }).notNull(),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  amount_paid: numeric('amount_paid', { precision: 10, scale: 2 }).default('0'),
  discount_amount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0'),
  discount_reason: varchar('discount_reason', { length: 200 }),
  notes: text('notes'),
  payment_terms: varchar('payment_terms', { length: 100 }),
  purchase_order_number: varchar('purchase_order_number', { length: 50 }),
  created_by_id: uuid('created_by_id').notNull(),
  created_by_name: varchar('created_by_name', { length: 100 }),
  sent_date: timestamp('sent_date'),
  sent_by_id: uuid('sent_by_id'),
  sent_by_name: varchar('sent_by_name', { length: 100 }),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Invoice Line Item Table
export const invoice_line_items = pgTable('invoice_line_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoice_id: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  description: varchar('description', { length: 500 }).notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull(),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  unit_type: varchar('unit_type', { length: 50 }).default('hours'), // hours, days, units, etc.
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax_rate: numeric('tax_rate', { precision: 5, scale: 2 }).default('10'), // Default 10% GST
  tax_amount: numeric('tax_amount', { precision: 10, scale: 2 }).notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  apprentice_id: uuid('apprentice_id'),
  apprentice_name: varchar('apprentice_name', { length: 100 }),
  timesheet_reference: uuid('timesheet_reference'),
  award_reference: uuid('award_reference'),
  rate_type: varchar('rate_type', { length: 50 }),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Payment Records Table
export const payment_records = pgTable('payment_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoice_id: uuid('invoice_id').notNull().references(() => invoices.id),
  payment_date: date('payment_date').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  payment_method: paymentMethodEnum('payment_method').notNull(),
  reference_number: varchar('reference_number', { length: 100 }),
  notes: text('notes'),
  recorded_by_id: uuid('recorded_by_id').notNull(),
  recorded_by_name: varchar('recorded_by_name', { length: 100 }),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Fair Work API Sync Log
export const fair_work_sync_log = pgTable('fair_work_sync_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  sync_date: timestamp('sync_date').notNull().defaultNow(),
  sync_type: varchar('sync_type', { length: 50 }).notNull(), // full, incremental, award-specific
  status: varchar('status', { length: 50 }).notNull(), // success, partial, failed
  records_processed: integer('records_processed'),
  records_updated: integer('records_updated'),
  error_message: text('error_message'),
  sync_details: json('sync_details').default({}),
  initiated_by_id: uuid('initiated_by_id'),
  initiated_by_name: varchar('initiated_by_name', { length: 100 }),
  duration_seconds: integer('duration_seconds'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Invoice Templates Table
export const invoice_templates = pgTable('invoice_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  template_name: varchar('template_name', { length: 100 }).notNull(),
  is_default: boolean('is_default').default(false),
  header_content: text('header_content'),
  footer_content: text('footer_content'),
  terms_content: text('terms_content'),
  logo_path: varchar('logo_path', { length: 500 }),
  template_content: json('template_content').default({}),
  created_by_id: uuid('created_by_id').notNull(),
  created_by_name: varchar('created_by_name', { length: 100 }),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Define Zod schemas for validation and type inference
export const insertBillingAwardRateSchema = createInsertSchema(billingAwardRates, {
  award_code: z.string().min(2, 'Award code must be at least 2 characters').max(50, 'Award code must not exceed 50 characters'),
  award_name: z.string().min(3, 'Award name must be at least 3 characters').max(200, 'Award name must not exceed 200 characters'),
  classification_code: z.string().min(1, 'Classification code is required').max(50, 'Classification code must not exceed 50 characters'),
  classification_name: z.string().min(3, 'Classification name must be at least 3 characters').max(200, 'Classification name must not exceed 200 characters'),
  level: z.string().min(1, 'Level is required').max(50, 'Level must not exceed 50 characters'),
  effective_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for effective date'
  }),
  hourly_rate: z.number().positive('Hourly rate must be positive'),
  expiry_date: z.string().refine(val => !isNaN(Date.parse(val)) || !val, {
    message: 'Invalid date format for expiry date'
  }).optional(),
});

export const insertAwardPenaltySchema = createInsertSchema(award_penalties, {
  award_code: z.string().min(2, 'Award code must be at least 2 characters').max(50, 'Award code must not exceed 50 characters'),
  penalty_code: z.string().min(1, 'Penalty code is required').max(50, 'Penalty code must not exceed 50 characters'),
  penalty_name: z.string().min(3, 'Penalty name must be at least 3 characters').max(200, 'Penalty name must not exceed 200 characters'),
  type: z.enum(['base', 'overtime', 'holiday', 'weekend', 'penalty', 'allowance']),
  multiplier: z.number().optional(),
  fixed_amount: z.number().optional(),
  effective_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for effective date'
  }),
});

export const insertOncostConfigurationSchema = createInsertSchema(oncost_configuration, {
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must not exceed 100 characters'),
  type: z.string().min(2, 'Type is required').max(50, 'Type must not exceed 50 characters'),
  calculation_method: z.string().min(2, 'Calculation method is required').max(50, 'Calculation method must not exceed 50 characters'),
  percentage_rate: z.number().optional(),
  fixed_amount: z.number().optional(),
  is_mandatory: z.boolean().optional(),
  effective_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for effective date'
  }),
});

export const insertHostEmployerRateSchema = createInsertSchema(host_employer_rates, {
  host_employer_id: z.string().uuid('Invalid host employer ID format'),
  agreement_name: z.string().min(3, 'Agreement name must be at least 3 characters').max(100, 'Agreement name must not exceed 100 characters'),
  agreement_start_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for agreement start date'
  }),
  base_rate: z.number().positive('Base rate must be positive'),
  agreement_end_date: z.string().refine(val => !isNaN(Date.parse(val)) || !val, {
    message: 'Invalid date format for agreement end date'
  }).optional(),
  is_active: z.boolean().optional(),
  use_fair_work_rates: z.boolean().optional(),
  markup_percentage: z.number().min(0, 'Markup percentage cannot be negative').optional(),
});

export const insertInvoiceSchema = createInsertSchema(invoices, {
  invoice_number: z.string().min(3, 'Invoice number must be at least 3 characters').max(50, 'Invoice number must not exceed 50 characters'),
  host_employer_id: z.string().uuid('Invalid host employer ID format'),
  issue_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for issue date'
  }),
  due_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for due date'
  }),
  subtotal_amount: z.number().positive('Subtotal amount must be positive'),
  tax_amount: z.number().min(0, 'Tax amount cannot be negative'),
  total_amount: z.number().positive('Total amount must be positive'),
  status: z.enum(['draft', 'pending', 'sent', 'overdue', 'paid', 'partially-paid', 'cancelled', 'credit']),
  created_by_id: z.string().uuid('Invalid creator ID format'),
  period_start_date: z.string().refine(val => !isNaN(Date.parse(val)) || !val, {
    message: 'Invalid date format for period start date'
  }).optional(),
  period_end_date: z.string().refine(val => !isNaN(Date.parse(val)) || !val, {
    message: 'Invalid date format for period end date'
  }).optional(),
});

export const insertInvoiceLineItemSchema = createInsertSchema(invoice_line_items, {
  invoice_id: z.string().uuid('Invalid invoice ID format'),
  description: z.string().min(3, 'Description must be at least 3 characters').max(500, 'Description must not exceed 500 characters'),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().positive('Unit price must be positive'),
  subtotal: z.number().positive('Subtotal must be positive'),
  tax_amount: z.number().min(0, 'Tax amount cannot be negative'),
  total: z.number().positive('Total must be positive'),
  unit_type: z.string().max(50, 'Unit type must not exceed 50 characters').optional(),
});

export const insertPaymentRecordSchema = createInsertSchema(payment_records, {
  invoice_id: z.string().uuid('Invalid invoice ID format'),
  payment_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for payment date'
  }),
  amount: z.number().positive('Payment amount must be positive'),
  payment_method: z.enum(['direct-deposit', 'credit-card', 'bpay', 'check', 'cash', 'other']),
  recorded_by_id: z.string().uuid('Invalid recorder ID format'),
  reference_number: z.string().max(100, 'Reference number must not exceed 100 characters').optional(),
});

export const insertInvoiceTemplateSchema = createInsertSchema(invoice_templates, {
  template_name: z.string().min(3, 'Template name must be at least 3 characters').max(100, 'Template name must not exceed 100 characters'),
  created_by_id: z.string().uuid('Invalid creator ID format'),
  is_default: z.boolean().optional(),
  header_content: z.string().optional(),
  footer_content: z.string().optional(),
  terms_content: z.string().optional(),
});

// Define types
export type BillingAwardRate = typeof billingAwardRates.$inferSelect;
export type InsertBillingAwardRate = z.infer<typeof insertBillingAwardRateSchema>;

export type AwardPenalty = typeof award_penalties.$inferSelect;
export type InsertAwardPenalty = z.infer<typeof insertAwardPenaltySchema>;

export type OncostConfiguration = typeof oncost_configuration.$inferSelect;
export type InsertOncostConfiguration = z.infer<typeof insertOncostConfigurationSchema>;

export type HostEmployerRate = typeof host_employer_rates.$inferSelect;
export type InsertHostEmployerRate = z.infer<typeof insertHostEmployerRateSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceLineItem = typeof invoice_line_items.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;

export type PaymentRecord = typeof payment_records.$inferSelect;
export type InsertPaymentRecord = z.infer<typeof insertPaymentRecordSchema>;

export type FairWorkSyncLog = typeof fair_work_sync_log.$inferSelect;

export type InvoiceTemplate = typeof invoice_templates.$inferSelect;
export type InsertInvoiceTemplate = z.infer<typeof insertInvoiceTemplateSchema>;