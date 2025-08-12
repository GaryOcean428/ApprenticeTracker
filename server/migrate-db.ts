import { sql } from 'drizzle-orm';
import { db } from './db';

/**
 * This script creates the Fair Work integration tables for Australian Apprentice Management
 */
export async function migrateFairWorkSchema() {
  console.log('Starting Fair Work schema migration...');

  try {
    // Create awards table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS awards (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        fair_work_reference TEXT,
        fair_work_title TEXT,
        description TEXT,
        effective_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created awards table');

    // Create award_classifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS award_classifications (
        id SERIAL PRIMARY KEY,
        award_id INTEGER NOT NULL REFERENCES awards(id),
        name TEXT NOT NULL,
        level TEXT NOT NULL,
        fair_work_level_code TEXT,
        fair_work_level_desc TEXT,
        aqf_level TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created award_classifications table');

    // Create pay_rates table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pay_rates (
        id SERIAL PRIMARY KEY,
        classification_id INTEGER NOT NULL REFERENCES award_classifications(id),
        hourly_rate NUMERIC NOT NULL,
        effective_from DATE NOT NULL,
        effective_to DATE,
        pay_rate_type TEXT DEFAULT 'award',
        is_apprentice_rate BOOLEAN DEFAULT FALSE,
        apprenticeship_year INTEGER,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created pay_rates table');

    // Create penalty_rules table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS penalty_rules (
        id SERIAL PRIMARY KEY,
        award_id INTEGER NOT NULL REFERENCES awards(id),
        classification_id INTEGER REFERENCES award_classifications(id),
        penalty_name TEXT NOT NULL,
        penalty_type TEXT,
        multiplier NUMERIC(5,2),
        days_of_week JSONB,
        start_time TEXT,
        end_time TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created penalty_rules table');

    // Create allowance_rules table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS allowance_rules (
        id SERIAL PRIMARY KEY,
        award_id INTEGER NOT NULL REFERENCES awards(id),
        classification_id INTEGER REFERENCES award_classifications(id),
        allowance_name TEXT NOT NULL,
        allowance_amount NUMERIC(10,2),
        allowance_type TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created allowance_rules table');

    // Create public_holidays table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS public_holidays (
        id SERIAL PRIMARY KEY,
        state TEXT NOT NULL,
        holiday_date DATE NOT NULL,
        holiday_name TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created public_holidays table');

    // Create fairwork_compliance_logs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS fairwork_compliance_logs (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES apprentices(id),
        timesheet_id INTEGER REFERENCES timesheets(id),
        pay_rate_id INTEGER REFERENCES pay_rates(id),
        compliance_check TEXT,
        outcome TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created fairwork_compliance_logs table');

    // Create enterprise_agreements table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_agreements (
        id SERIAL PRIMARY KEY,
        agreement_name TEXT NOT NULL,
        agreement_code TEXT,
        description TEXT,
        effective_date DATE,
        expiry_date DATE,
        agreement_status TEXT DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created enterprise_agreements table');

    // Create gto_organizations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS gto_organizations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        is_gto BOOLEAN DEFAULT TRUE,
        labour_hire_licence_no TEXT,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        status TEXT DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created gto_organizations table');

    // Create external_portals table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS external_portals (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER NOT NULL REFERENCES gto_organizations(id),
        portal_name TEXT NOT NULL,
        portal_type TEXT,
        base_url TEXT,
        api_key TEXT,
        configuration JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created external_portals table');

    // Add AQF & GTO fields to apprentices table
    await db.execute(sql`
      ALTER TABLE apprentices
      ADD COLUMN IF NOT EXISTS aqf_level TEXT,
      ADD COLUMN IF NOT EXISTS apprenticeship_year INTEGER,
      ADD COLUMN IF NOT EXISTS gto_enrolled BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS gto_id INTEGER;
    `);
    console.log('Added AQF & GTO fields to apprentices table');

    // Add labour hire & GTO fields to host_employers table
    await db.execute(sql`
      ALTER TABLE host_employers
      ADD COLUMN IF NOT EXISTS is_gto BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS labour_hire_licence_no TEXT;
    `);
    console.log('Added labour hire fields to host_employers table');

    // Add Fair Work & AQF fields to training_contracts table
    await db.execute(sql`
      ALTER TABLE training_contracts
      ADD COLUMN IF NOT EXISTS aqf_level TEXT,
      ADD COLUMN IF NOT EXISTS rto_name TEXT,
      ADD COLUMN IF NOT EXISTS rto_code TEXT;
    `);
    console.log('Added Fair Work & AQF fields to training_contracts table');

    // Add labour hire & GTO fields to placements table
    await db.execute(sql`
      ALTER TABLE placements
      ADD COLUMN IF NOT EXISTS labour_hire_indicator BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS gto_placement BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS eba_id INTEGER REFERENCES enterprise_agreements(id);
    `);
    console.log('Added labour hire & GTO fields to placements table');

    console.log('Fair Work schema migration completed successfully!');
  } catch (error) {
    console.error('Fair Work schema migration failed:', error);
    throw error;
  }
}
