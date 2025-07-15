import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * This script creates the role-based access control tables and updates the users table
 */
export async function migrateRolesSchema() {
  console.log('Starting Role Management schema migration...');

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
    console.log('Created roles table');

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
    console.log('Created permissions table');

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
    console.log('Created role_permissions table');

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
    console.log('Created subscription_plans table');

    // Add columns to users table if they don't exist - but do it one by one to handle partial migrations
    console.log('Checking and adding missing columns to users table...');

    // Array of columns to check and add if missing
    const columnsToAdd = [
      { name: 'role_id', definition: 'INTEGER REFERENCES roles(id)' },
      { name: 'organization_id', definition: 'INTEGER' },
      { name: 'is_active', definition: 'BOOLEAN DEFAULT TRUE' },
      { name: 'stripe_customer_id', definition: 'TEXT' },
      { name: 'stripe_subscription_id', definition: 'TEXT' },
      { name: 'subscription_status', definition: 'TEXT' },
      { name: 'subscription_plan_id', definition: 'INTEGER REFERENCES subscription_plans(id)' },
      { name: 'subscription_starts_at', definition: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'subscription_ends_at', definition: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'last_login', definition: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'created_at', definition: 'TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()' },
      { name: 'updated_at', definition: 'TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()' },
    ];

    // Check and add each column individually
    for (const column of columnsToAdd) {
      try {
        const columnExists = await db.execute(sql`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name='users' AND column_name=${column.name};
        `);

        if (columnExists.rows.length === 0) {
          await db.execute(
            sql.raw(`ALTER TABLE users ADD COLUMN ${column.name} ${column.definition};`)
          );
          console.log(`Added ${column.name} column to users table`);
        } else {
          console.log(`Column ${column.name} already exists in users table`);
        }
      } catch (error) {
        console.error(`Error adding column ${column.name}:`, error);
      }
    }

    console.log('Role Management schema migration completed successfully!');
  } catch (error) {
    console.error('Error in Role Management schema migration:', error);
    throw error;
  }
}
