import { pgTable, text, serial, integer, boolean, date, timestamp, json } from "drizzle-orm/pg-core";
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
