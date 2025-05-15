import { pgTable, text, varchar, integer, uuid, boolean, timestamp, numeric, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Awards table
export const awards = pgTable('awards', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(), // Award code e.g. MA000003
  name: varchar('name', { length: 200 }).notNull(),
  shortName: varchar('short_name', { length: 100 }),
  publishedYear: integer('published_year').notNull(),
  effectiveFrom: timestamp('effective_from'),
  effectiveTo: timestamp('effective_to'),
  isActive: boolean('is_active').default(true),
  description: text('description'),
  industry: varchar('industry', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    codeYearIdx: uniqueIndex('award_code_year_idx').on(table.code, table.publishedYear),
  };
});

// Award Classifications table
export const awardClassifications = pgTable('award_classifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  awardId: uuid('award_id').notNull().references(() => awards.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }),
  name: varchar('name', { length: 200 }).notNull(),
  level: integer('level'),
  description: text('description'),
  isApprentice: boolean('is_apprentice').default(false),
  isTrainee: boolean('is_trainee').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    awardIdIdx: index('award_classification_award_id_idx').on(table.awardId),
  };
});

// Award Rates table
export const awardRates = pgTable('award_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  awardId: uuid('award_id').notNull().references(() => awards.id, { onDelete: 'cascade' }),
  classificationId: uuid('classification_id').notNull().references(() => awardClassifications.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(), // Calendar year the rate applies to
  financialYear: integer('financial_year'), // Financial year the rate applies to (July-June)
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }).notNull(),
  weeklyRate: numeric('weekly_rate', { precision: 10, scale: 2 }).notNull(),
  annualRate: numeric('annual_rate', { precision: 10, scale: 2 }),
  effectiveFrom: timestamp('effective_from'),
  effectiveTo: timestamp('effective_to'),
  isAdult: boolean('is_adult').default(false),
  hasCompletedYear12: boolean('has_completed_year12').default(false),
  sector: varchar('sector', { length: 50 }),
  apprenticeYear: integer('apprentice_year'), // 1-4 for apprentices
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    awardIdIdx: index('award_rate_award_id_idx').on(table.awardId),
    classificationIdIdx: index('award_rate_classification_id_idx').on(table.classificationId),
    yearIdx: index('award_rate_year_idx').on(table.year),
  };
});

// Enterprise Agreement table
export const enterpriseAgreements = pgTable('enterprise_agreements', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  code: varchar('code', { length: 50 }).notNull(),
  organization: varchar('organization', { length: 200 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true),
  description: text('description'),
  documentUrl: varchar('document_url', { length: 500 }),
  uploadedById: uuid('uploaded_by_id'),
  uploadedAt: timestamp('uploaded_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Enterprise Agreement Rates table
export const enterpriseAgreementRates = pgTable('enterprise_agreement_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  agreementId: uuid('agreement_id').notNull().references(() => enterpriseAgreements.id, { onDelete: 'cascade' }),
  classificationName: varchar('classification_name', { length: 200 }).notNull(),
  level: integer('level'),
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }).notNull(),
  weeklyRate: numeric('weekly_rate', { precision: 10, scale: 2 }).notNull(),
  annualRate: numeric('annual_rate', { precision: 10, scale: 2 }),
  effectiveFrom: timestamp('effective_from').notNull(),
  effectiveTo: timestamp('effective_to'),
  isApprentice: boolean('is_apprentice').default(false),
  isTrainee: boolean('is_trainee').default(false),
  apprenticeYear: integer('apprentice_year'), // 1-4 for apprentices
  isAdult: boolean('is_adult').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    agreementIdIdx: index('ea_rate_agreement_id_idx').on(table.agreementId),
  };
});

// Custom Pay Rates Table (for manually defined rates)
export const customPayRates = pgTable('custom_pay_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }).notNull(),
  weeklyRate: numeric('weekly_rate', { precision: 10, scale: 2 }).notNull(),
  annualRate: numeric('annual_rate', { precision: 10, scale: 2 }),
  effectiveFrom: timestamp('effective_from').notNull(),
  effectiveTo: timestamp('effective_to'),
  createdById: uuid('created_by_id').notNull(),
  notes: text('notes'),
  isApprentice: boolean('is_apprentice').default(false),
  isTrainee: boolean('is_trainee').default(false),
  apprenticeYear: integer('apprentice_year'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Award Update Checks Table - tracks when awards are checked for updates
export const awardUpdateChecks = pgTable('award_update_checks', {
  id: uuid('id').defaultRandom().primaryKey(),
  awardCode: varchar('award_code', { length: 20 }).notNull(),
  awardName: varchar('award_name', { length: 200 }).notNull(),
  checkDate: timestamp('check_date').notNull().defaultNow(),
  currentVersion: varchar('current_version', { length: 50 }).notNull(),
  latestVersion: varchar('latest_version', { length: 50 }),
  updateAvailable: boolean('update_available').default(false).notNull(),
  updateUrl: varchar('update_url', { length: 500 }),
  lastNotifiedDate: timestamp('last_notified_date'),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'notified', 'updated', 'ignored'
  aiAnalysis: text('ai_analysis'),                    // JSON string with AI analysis results
  notificationMessage: text('notification_message'),  // AI-generated notification message
  impactLevel: varchar('impact_level', { length: 20 }), // 'low', 'medium', 'high'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    awardCodeIdx: index('award_update_check_code_idx').on(table.awardCode),
    statusIdx: index('award_update_check_status_idx').on(table.status),
  };
});

// Define Zod schemas for validation
export const insertAwardSchema = createInsertSchema(awards);
export const insertAwardClassificationSchema = createInsertSchema(awardClassifications);
export const insertAwardRateSchema = createInsertSchema(awardRates);
export const insertEnterpriseAgreementSchema = createInsertSchema(enterpriseAgreements);
export const insertEnterpriseAgreementRateSchema = createInsertSchema(enterpriseAgreementRates);
export const insertCustomPayRateSchema = createInsertSchema(customPayRates);
export const insertAwardUpdateCheckSchema = createInsertSchema(awardUpdateChecks);

// Define types for use in the application
export type Award = typeof awards.$inferSelect;
export type InsertAward = z.infer<typeof insertAwardSchema>;

export type AwardClassification = typeof awardClassifications.$inferSelect;
export type InsertAwardClassification = z.infer<typeof insertAwardClassificationSchema>;

export type AwardRate = typeof awardRates.$inferSelect;
export type InsertAwardRate = z.infer<typeof insertAwardRateSchema>;

export type EnterpriseAgreement = typeof enterpriseAgreements.$inferSelect;
export type InsertEnterpriseAgreement = z.infer<typeof insertEnterpriseAgreementSchema>;

export type EnterpriseAgreementRate = typeof enterpriseAgreementRates.$inferSelect;
export type InsertEnterpriseAgreementRate = z.infer<typeof insertEnterpriseAgreementRateSchema>;

export type CustomPayRate = typeof customPayRates.$inferSelect;
export type InsertCustomPayRate = z.infer<typeof insertCustomPayRateSchema>;

export type AwardUpdateCheck = typeof awardUpdateChecks.$inferSelect;
export type InsertAwardUpdateCheck = z.infer<typeof insertAwardUpdateCheckSchema>;