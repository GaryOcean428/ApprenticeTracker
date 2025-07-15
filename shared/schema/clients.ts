import { pgTable, text, serial, integer, boolean, date, timestamp, json, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users, gtoOrganizations, hostEmployers } from "../schema";
import { contacts } from "./contacts";

// Clients System - For tracking both host employers and non-host clients

// Client Types - Types of services that clients may engage with
export const clientTypes = pgTable("client_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertClientTypeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type ClientType = typeof clientTypes.$inferSelect;
export type InsertClientType = z.infer<typeof insertClientTypeSchema>;

// Clients - Central registry of all client organizations
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  
  // Basic client information
  name: text("name").notNull(),
  tradingName: text("trading_name"),
  legalName: text("legal_name"),
  abn: text("abn"),
  acn: text("acn"),
  
  // Contact information
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  primaryAddress: text("primary_address"),
  billingAddress: text("billing_address"),
  
  // Business information
  industry: text("industry"),
  employeeCount: integer("employee_count"),
  yearEstablished: integer("year_established"),
  
  // Client status and categorization
  status: text("status").notNull().default("active"), // active, inactive, lead, prospect, former
  clientSince: date("client_since"),
  clientType: text("client_type").notNull(), // host_employer, direct_client, both
  hostEmployerId: integer("host_employer_id").references(() => hostEmployers.id), // If this client is also a host employer
  
  // Business relationship
  accountManager: integer("account_manager").references(() => users.id), // User responsible for this client
  organizationId: integer("organization_id").references(() => gtoOrganizations.id),
  
  // Financial and contractual information
  creditRating: text("credit_rating"),
  creditLimit: numeric("credit_limit", { precision: 10, scale: 2 }),
  paymentTerms: text("payment_terms"),
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"),
  contractDetails: json("contract_details").default({}),
  
  // Service utilization
  serviceTypes: json("service_types").default([]), // Array of services utilized (labour hire, training, consulting, etc.)
  customFields: json("custom_fields").default({}), // Extensible fields
  
  // Notes and metadata
  notes: text("notes"),
  tags: json("tags").default([]), // Array of tag strings for quick filtering
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastInteractionDate: timestamp("last_interaction_date"),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastInteractionDate: true,
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

// Client Contacts - Linking clients to contacts
export const clientContacts = pgTable("client_contacts", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  isPrimary: boolean("is_primary").default(false),
  role: text("role"), // Contact's role within the client organization
  department: text("department"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertClientContactSchema = createInsertSchema(clientContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ClientContact = typeof clientContacts.$inferSelect;
export type InsertClientContact = z.infer<typeof insertClientContactSchema>;

// Client Services - Tracking services provided to clients
export const clientServices = pgTable("client_services", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  serviceType: text("service_type").notNull(), // labour_hire, apprenticeship, consulting, training, etc.
  description: text("description").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: text("status").notNull().default("active"),
  value: numeric("value", { precision: 10, scale: 2 }),
  notes: text("notes"),
  details: jsonb("details").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertClientServiceSchema = createInsertSchema(clientServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ClientService = typeof clientServices.$inferSelect;
export type InsertClientService = z.infer<typeof insertClientServiceSchema>;

// Client Interactions - History of communication and interactions
export const clientInteractions = pgTable("client_interactions", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id), // Optional specific contact
  interactionType: text("interaction_type").notNull(), // email, phone, meeting, site_visit, etc.
  interactionDate: timestamp("interaction_date").notNull().defaultNow(),
  subject: text("subject").notNull(),
  description: text("description"),
  outcome: text("outcome"),
  nextSteps: text("next_steps"),
  userId: integer("user_id").references(() => users.id), // User who recorded this interaction
  reminderDate: timestamp("reminder_date"),
  attachments: json("attachments").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertClientInteractionSchema = createInsertSchema(clientInteractions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ClientInteraction = typeof clientInteractions.$inferSelect;
export type InsertClientInteraction = z.infer<typeof insertClientInteractionSchema>;

// Relations
export const clientsRelations = relations(clients, ({ one, many }) => ({
  hostEmployer: one(hostEmployers, {
    fields: [clients.hostEmployerId],
    references: [hostEmployers.id],
  }),
  accountManager: one(users, {
    fields: [clients.accountManager],
    references: [users.id],
  }),
  organization: one(gtoOrganizations, {
    fields: [clients.organizationId],
    references: [gtoOrganizations.id],
  }),
  contacts: many(clientContacts),
  services: many(clientServices),
  interactions: many(clientInteractions),
}));

export const clientContactsRelations = relations(clientContacts, ({ one }) => ({
  client: one(clients, {
    fields: [clientContacts.clientId],
    references: [clients.id],
  }),
  contact: one(contacts, {
    fields: [clientContacts.contactId],
    references: [contacts.id],
  }),
}));

export const clientServicesRelations = relations(clientServices, ({ one }) => ({
  client: one(clients, {
    fields: [clientServices.clientId],
    references: [clients.id],
  }),
}));

export const clientInteractionsRelations = relations(clientInteractions, ({ one }) => ({
  client: one(clients, {
    fields: [clientInteractions.clientId],
    references: [clients.id],
  }),
  contact: one(contacts, {
    fields: [clientInteractions.contactId],
    references: [contacts.id],
  }),
  user: one(users, {
    fields: [clientInteractions.userId],
    references: [users.id],
  }),
}));