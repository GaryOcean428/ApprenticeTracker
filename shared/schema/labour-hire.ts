import { pgTable, text, serial, integer, boolean, date, timestamp, json, numeric, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users, hostEmployers, documents, gtoOrganizations } from "../schema";

// Labour Hire Workers
export const labourHireWorkers = pgTable("labour_hire_workers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  dateOfBirth: date("date_of_birth"),
  occupation: text("occupation").notNull(),
  status: text("status").notNull().default("active"),
  profileImage: text("profile_image"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  notes: text("notes"),
  // Skills and qualifications
  skillsDescription: text("skills_description"),
  experienceYears: integer("experience_years"),
  // Rate and billing
  hourlyRate: numeric("hourly_rate"),
  chargeRate: numeric("charge_rate"),
  // Compliance
  visaStatus: text("visa_status"),
  visaExpiryDate: date("visa_expiry_date"),
  workRights: boolean("work_rights").default(true),
  // Employment type
  employmentType: text("employment_type"), // casual, part-time, full-time
  availableDays: text("available_days"),   // JSON string of available days
  maxHoursPerWeek: integer("max_hours_per_week"),
  // Organization relationship
  organizationId: integer("organization_id").references(() => gtoOrganizations.id),
  // Fair Work fields
  awardClassification: text("award_classification"),
  awardLevel: text("award_level"),
  // Created and updated timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLabourHireWorkerSchema = createInsertSchema(labourHireWorkers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
} as const);

export type LabourHireWorker = typeof labourHireWorkers.$inferSelect;
export type InsertLabourHireWorker = z.infer<typeof insertLabourHireWorkerSchema>;

// Labour Hire Placements
export const labourHirePlacements = pgTable("labour_hire_placements", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id").references(() => labourHireWorkers.id).notNull(),
  hostEmployerId: integer("host_employer_id").references(() => hostEmployers.id).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: text("status").notNull().default("active"), // active, completed, terminated
  position: text("position").notNull(),
  hourlyRate: numeric("hourly_rate").notNull(),
  chargeRate: numeric("charge_rate").notNull(),
  hoursPerWeek: integer("hours_per_week"),
  shiftDetails: text("shift_details"), // JSON string with shift information
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLabourHirePlacementSchema = createInsertSchema(labourHirePlacements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
} as const);

export type LabourHirePlacement = typeof labourHirePlacements.$inferSelect;
export type InsertLabourHirePlacement = z.infer<typeof insertLabourHirePlacementSchema>;

// Labour Hire Timesheets
export const labourHireTimesheets = pgTable("labour_hire_timesheets", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id").references(() => labourHireWorkers.id).notNull(),
  placementId: integer("placement_id").references(() => labourHirePlacements.id).notNull(),
  weekStarting: date("week_starting").notNull(),
  status: text("status").notNull().default("draft"), // draft, submitted, approved, rejected
  totalHours: numeric("total_hours").notNull(),
  regularHours: numeric("regular_hours").notNull(),
  overtimeHours: numeric("overtime_hours").default("0"),
  doubleTimeHours: numeric("double_time_hours").default("0"),
  submittedDate: timestamp("submitted_date"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvalDate: timestamp("approval_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLabourHireTimesheetSchema = createInsertSchema(labourHireTimesheets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
} as const);

export type LabourHireTimesheet = typeof labourHireTimesheets.$inferSelect;
export type InsertLabourHireTimesheet = z.infer<typeof insertLabourHireTimesheetSchema>;

// Labour Hire Timesheet Details
export const labourHireTimesheetDetails = pgTable("labour_hire_timesheet_details", {
  id: serial("id").primaryKey(),
  timesheetId: integer("timesheet_id").references(() => labourHireTimesheets.id).notNull(),
  date: date("date").notNull(),
  hoursWorked: numeric("hours_worked").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  breakDuration: numeric("break_duration"),
  hourType: text("hour_type").default("regular"), // regular, overtime, double time
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLabourHireTimesheetDetailSchema = createInsertSchema(labourHireTimesheetDetails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
} as const);

export type LabourHireTimesheetDetail = typeof labourHireTimesheetDetails.$inferSelect;
export type InsertLabourHireTimesheetDetail = z.infer<typeof insertLabourHireTimesheetDetailSchema>;

// Worker Documents
export const labourHireWorkerDocuments = pgTable("labour_hire_worker_documents", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id").references(() => labourHireWorkers.id).notNull(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  documentType: text("document_type").notNull(), // resume, qualification, ID, visa, etc.
  verificationStatus: text("verification_status").default("pending"), // pending, verified, rejected
  verifiedBy: integer("verified_by").references(() => users.id),
  verificationDate: timestamp("verification_date"),
  expiryDate: date("expiry_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLabourHireWorkerDocumentSchema = createInsertSchema(labourHireWorkerDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
} as const);

export type LabourHireWorkerDocument = typeof labourHireWorkerDocuments.$inferSelect;
export type InsertLabourHireWorkerDocument = z.infer<typeof insertLabourHireWorkerDocumentSchema>;

// Relations
export const labourHireWorkersRelations = relations(labourHireWorkers, ({ one, many }) => ({
  user: one(users, {
    fields: [labourHireWorkers.userId],
    references: [users.id],
  }),
  placements: many(labourHirePlacements),
  timesheets: many(labourHireTimesheets),
  documents: many(labourHireWorkerDocuments),
  organization: one(gtoOrganizations, {
    fields: [labourHireWorkers.organizationId],
    references: [gtoOrganizations.id],
  }),
}));

export const labourHirePlacementsRelations = relations(labourHirePlacements, ({ one, many }) => ({
  worker: one(labourHireWorkers, {
    fields: [labourHirePlacements.workerId],
    references: [labourHireWorkers.id],
  }),
  hostEmployer: one(hostEmployers, {
    fields: [labourHirePlacements.hostEmployerId],
    references: [hostEmployers.id],
  }),
  timesheets: many(labourHireTimesheets),
}));

export const labourHireTimesheetsRelations = relations(labourHireTimesheets, ({ one, many }) => ({
  worker: one(labourHireWorkers, {
    fields: [labourHireTimesheets.workerId],
    references: [labourHireWorkers.id],
  }),
  placement: one(labourHirePlacements, {
    fields: [labourHireTimesheets.placementId],
    references: [labourHirePlacements.id],
  }),
  approver: one(users, {
    fields: [labourHireTimesheets.approvedBy],
    references: [users.id],
  }),
  details: many(labourHireTimesheetDetails),
}));

export const labourHireTimesheetDetailsRelations = relations(labourHireTimesheetDetails, ({ one }) => ({
  timesheet: one(labourHireTimesheets, {
    fields: [labourHireTimesheetDetails.timesheetId],
    references: [labourHireTimesheets.id],
  }),
}));

export const labourHireWorkerDocumentsRelations = relations(labourHireWorkerDocuments, ({ one }) => ({
  worker: one(labourHireWorkers, {
    fields: [labourHireWorkerDocuments.workerId],
    references: [labourHireWorkers.id],
  }),
  document: one(documents, {
    fields: [labourHireWorkerDocuments.documentId],
    references: [documents.id],
  }),
  verifier: one(users, {
    fields: [labourHireWorkerDocuments.verifiedBy],
    references: [users.id],
  }),
}));