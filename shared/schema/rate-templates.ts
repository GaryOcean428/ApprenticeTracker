import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  date,
  timestamp,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core";

// users table is defined in shared/schema.ts
import { users } from "../schema";

export const rateTemplatesTable = pgTable("rate_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  organization_id: integer("organization_id"),
  status: varchar("status", { length: 50 }).notNull(),
  effective_from: date("effective_from"),
  effective_to: date("effective_to"),
  version: integer("version").notNull().default(1),
  config_details: jsonb("config_details"),
  created_by_user_id: integer("created_by_user_id").references(
    () => users.id
  ),
  updated_by_user_id: integer("updated_by_user_id").references(
    () => users.id
  ),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const rateTemplateComponentsTable = pgTable(
  "rate_template_components",
  {
    id: serial("id").primaryKey(),
    rate_template_id: integer("rate_template_id")
      .notNull()
      .references(() => rateTemplatesTable.id, { onDelete: "cascade" }),
    component_type: varchar("component_type", { length: 100 }).notNull(),
    component_name: varchar("component_name", { length: 255 }),
    value_source_table: varchar("value_source_table", { length: 100 }),
    value_identifier: varchar("value_identifier", { length: 255 }),
    fixed_value_numeric: decimal("fixed_value_numeric", {
      precision: 10,
      scale: 2,
    }),
    percentage_value_numeric: decimal("percentage_value_numeric", {
      precision: 5,
      scale: 2,
    }),
    based_on_component_id: integer("based_on_component_id").references(
      () => rateTemplateComponentsTable.id,
      { onDelete: "set null" }
    ),
    conditions: jsonb("conditions"),
    notes: text("notes"),
    order: integer("order"),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
  }
);

export const rateActivityLogsTable = pgTable("rate_activity_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  user_id: integer("user_id").references(() => users.id),
  activity_type: varchar("activity_type", { length: 100 }).notNull(),
  rate_template_id: integer("rate_template_id").references(
    () => rateTemplatesTable.id,
    { onDelete: "set null" }
  ),
  details: jsonb("details"),
  target_entity: varchar("target_entity", { length: 50 }),
  target_entity_id: integer("target_entity_id"),
});
