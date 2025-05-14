import { pgTable, text, serial, integer, boolean, date, timestamp, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users, gtoOrganizations, hostEmployers, apprentices } from "../schema";
import { labourHireWorkers } from "./labour-hire";

// Unified Contacts System

// Contact Tags
export const contactTags = pgTable("contact_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color").default("#6366F1"), // Default color (indigo)
  organizationId: integer("organization_id").references(() => gtoOrganizations.id),
  isSystem: boolean("is_system").default(false), // System tags cannot be deleted
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertContactTagSchema = createInsertSchema(contactTags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
} as const);

export type ContactTag = typeof contactTags.$inferSelect;
export type InsertContactTag = z.infer<typeof insertContactTagSchema>;

// Unified Contacts - This is our central contacts registry
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  // Basic contact information
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  displayName: text("display_name"), // For businesses or when name format differs
  email: text("email").notNull(),
  phone: text("phone"),
  mobile: text("mobile"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country").default("Australia"),
  
  // Contact type and references
  contactType: text("contact_type").notNull(), // person, business, organization
  primaryRole: text("primary_role").notNull(), // apprentice, worker, host_employer, client, supplier, partner
  
  // Reference IDs to connected entities (when a contact is also one of these)
  userId: integer("user_id").references(() => users.id),
  apprenticeId: integer("apprentice_id").references(() => apprentices.id),
  workerId: integer("worker_id").references(() => labourHireWorkers.id),
  hostEmployerId: integer("host_employer_id").references(() => hostEmployers.id),
  
  // Organization and notes
  organizationId: integer("organization_id").references(() => gtoOrganizations.id),
  companyName: text("company_name"),
  jobTitle: text("job_title"),
  department: text("department"),
  notes: text("notes"),
  
  // Profile and metadata
  profileImage: text("profile_image"),
  socialLinks: json("social_links").default({}), // JSON for different social media links
  customFields: json("custom_fields").default({}), // Extensible custom fields
  
  // Status and timestamps
  isActive: boolean("is_active").default(true),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastContactedAt: timestamp("last_contacted_at"),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastContactedAt: true,
} as const);

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

// Contact-Tag relationships (many-to-many)
export const contactTagAssignments = pgTable("contact_tag_assignments", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  tagId: integer("tag_id").references(() => contactTags.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertContactTagAssignmentSchema = createInsertSchema(contactTagAssignments).omit({
  id: true,
  createdAt: true,
} as const);

export type ContactTagAssignment = typeof contactTagAssignments.$inferSelect;
export type InsertContactTagAssignment = z.infer<typeof insertContactTagAssignmentSchema>;

// Contact Groups
export const contactGroups = pgTable("contact_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  organizationId: integer("organization_id").references(() => gtoOrganizations.id),
  isPrivate: boolean("is_private").default(false),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertContactGroupSchema = createInsertSchema(contactGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
} as const);

export type ContactGroup = typeof contactGroups.$inferSelect;
export type InsertContactGroup = z.infer<typeof insertContactGroupSchema>;

// Contact Group Members (many-to-many)
export const contactGroupMembers = pgTable("contact_group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => contactGroups.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  addedBy: integer("added_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertContactGroupMemberSchema = createInsertSchema(contactGroupMembers).omit({
  id: true,
  createdAt: true,
} as const);

export type ContactGroupMember = typeof contactGroupMembers.$inferSelect;
export type InsertContactGroupMember = z.infer<typeof insertContactGroupMemberSchema>;

// Contact Interaction History
export const contactInteractions = pgTable("contact_interactions", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  interactionType: text("interaction_type").notNull(), // email, call, meeting, note
  subject: text("subject").notNull(),
  content: text("content"),
  interactionDate: timestamp("interaction_date").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  metadata: jsonb("metadata").default({}), // Additional context-specific data
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertContactInteractionSchema = createInsertSchema(contactInteractions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
} as const);

export type ContactInteraction = typeof contactInteractions.$inferSelect;
export type InsertContactInteraction = z.infer<typeof insertContactInteractionSchema>;

// Relations
export const contactsRelations = relations(contacts, ({ one, many }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
  }),
  apprentice: one(apprentices, {
    fields: [contacts.apprenticeId],
    references: [apprentices.id],
  }),
  worker: one(labourHireWorkers, {
    fields: [contacts.workerId],
    references: [labourHireWorkers.id],
  }),
  hostEmployer: one(hostEmployers, {
    fields: [contacts.hostEmployerId],
    references: [hostEmployers.id],
  }),
  organization: one(gtoOrganizations, {
    fields: [contacts.organizationId],
    references: [gtoOrganizations.id],
  }),
  tags: many(contactTagAssignments),
  groupMemberships: many(contactGroupMembers),
  interactions: many(contactInteractions),
}));

export const contactTagsRelations = relations(contactTags, ({ one, many }) => ({
  organization: one(gtoOrganizations, {
    fields: [contactTags.organizationId],
    references: [gtoOrganizations.id],
  }),
  assignments: many(contactTagAssignments),
}));

export const contactTagAssignmentsRelations = relations(contactTagAssignments, ({ one }) => ({
  contact: one(contacts, {
    fields: [contactTagAssignments.contactId],
    references: [contacts.id],
  }),
  tag: one(contactTags, {
    fields: [contactTagAssignments.tagId],
    references: [contactTags.id],
  }),
}));

export const contactGroupsRelations = relations(contactGroups, ({ one, many }) => ({
  organization: one(gtoOrganizations, {
    fields: [contactGroups.organizationId],
    references: [gtoOrganizations.id],
  }),
  creator: one(users, {
    fields: [contactGroups.createdBy],
    references: [users.id],
  }),
  members: many(contactGroupMembers),
}));

export const contactGroupMembersRelations = relations(contactGroupMembers, ({ one }) => ({
  group: one(contactGroups, {
    fields: [contactGroupMembers.groupId],
    references: [contactGroups.id],
  }),
  contact: one(contacts, {
    fields: [contactGroupMembers.contactId],
    references: [contacts.id],
  }),
  addedByUser: one(users, {
    fields: [contactGroupMembers.addedBy],
    references: [users.id],
  }),
}));

export const contactInteractionsRelations = relations(contactInteractions, ({ one }) => ({
  contact: one(contacts, {
    fields: [contactInteractions.contactId],
    references: [contacts.id],
  }),
  creator: one(users, {
    fields: [contactInteractions.createdBy],
    references: [users.id],
  }),
}));