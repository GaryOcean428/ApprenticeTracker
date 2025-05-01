import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * This script creates the role-based access control tables and updates the users table
 */
export async function migrateRolesSchema() {
  console.log("Starting Role Management schema migration...");
  
  try {
    // Create roles table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        is_system BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Created roles table");

    // Create permissions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        category TEXT,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Created permissions table");

    // Create role_permissions table (many-to-many relationship)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(role_id, permission_id)
      );
    `);
    console.log("Created role_permissions table");

    // Create subscription_plans table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC,
        billing_cycle TEXT DEFAULT 'monthly',
        features JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        stripe_price_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Created subscription_plans table");

    // Add columns to users table if they don't exist
    // Check if role_id column exists
    const roleIdColumnExists = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='users' AND column_name='role_id';
    `);

    if (roleIdColumnExists.rows.length === 0) {
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN role_id INTEGER REFERENCES roles(id),
        ADD COLUMN organization_id INTEGER,
        ADD COLUMN stripe_customer_id TEXT,
        ADD COLUMN stripe_subscription_id TEXT,
        ADD COLUMN subscription_plan_id INTEGER REFERENCES subscription_plans(id),
        ADD COLUMN subscription_starts_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN subscription_ends_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN last_login TIMESTAMP WITH TIME ZONE,
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      `);
      console.log("Added role and subscription columns to users table");
    } else {
      console.log("Role and subscription columns already exist in users table");
    }

    console.log("Role Management schema migration completed successfully!");
  } catch (error) {
    console.error("Error in Role Management schema migration:", error);
    throw error;
  }
}
