/**
 * Labour Hire Workers Migration
 *
 * This migration adds support for labour hire workers (non-apprentice employees)
 * including placements, timesheets, and document management.
 */
import { db } from './db';
import { sql } from 'drizzle-orm';
import logger from './utils/logger';

export async function migrateLabourHireSchema() {
  logger.info('Creating Labour Hire Workers tables...');

  try {
    // Check if labour_hire_workers table already exists
    const tablesExist = await checkIfLabourHireTablesExist();
    if (tablesExist) {
      logger.info('Labour Hire Workers tables already exist, skipping migration.');
      return;
    }

    // Create labour_hire_workers table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS labour_hire_workers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        date_of_birth DATE,
        occupation TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        profile_image TEXT,
        start_date DATE,
        end_date DATE,
        notes TEXT,
        skills_description TEXT,
        experience_years INTEGER,
        hourly_rate NUMERIC,
        charge_rate NUMERIC,
        visa_status TEXT,
        visa_expiry_date DATE,
        work_rights BOOLEAN DEFAULT true,
        employment_type TEXT,
        available_days TEXT,
        max_hours_per_week INTEGER,
        organization_id INTEGER REFERENCES gto_organizations(id),
        award_classification TEXT,
        award_level TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create labour_hire_placements table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS labour_hire_placements (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER NOT NULL REFERENCES labour_hire_workers(id),
        host_employer_id INTEGER NOT NULL REFERENCES host_employers(id),
        start_date DATE NOT NULL,
        end_date DATE,
        status TEXT NOT NULL DEFAULT 'active',
        position TEXT NOT NULL,
        hourly_rate NUMERIC NOT NULL,
        charge_rate NUMERIC NOT NULL,
        hours_per_week INTEGER,
        shift_details TEXT,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create labour_hire_timesheets table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS labour_hire_timesheets (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER NOT NULL REFERENCES labour_hire_workers(id),
        placement_id INTEGER NOT NULL REFERENCES labour_hire_placements(id),
        week_starting DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        total_hours NUMERIC NOT NULL,
        regular_hours NUMERIC NOT NULL,
        overtime_hours NUMERIC DEFAULT '0',
        double_time_hours NUMERIC DEFAULT '0',
        submitted_date TIMESTAMP,
        approved_by INTEGER REFERENCES users(id),
        approval_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create labour_hire_timesheet_details table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS labour_hire_timesheet_details (
        id SERIAL PRIMARY KEY,
        timesheet_id INTEGER NOT NULL REFERENCES labour_hire_timesheets(id),
        date DATE NOT NULL,
        hours_worked NUMERIC NOT NULL,
        start_time TEXT,
        end_time TEXT,
        break_duration NUMERIC,
        hour_type TEXT DEFAULT 'regular',
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create labour_hire_worker_documents table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS labour_hire_worker_documents (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER NOT NULL REFERENCES labour_hire_workers(id),
        document_id INTEGER NOT NULL REFERENCES documents(id),
        document_type TEXT NOT NULL,
        verification_status TEXT DEFAULT 'pending',
        verified_by INTEGER REFERENCES users(id),
        verification_date TIMESTAMP,
        expiry_date DATE,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Add indexes for performance
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_lhw_email ON labour_hire_workers(email);`);
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_lhw_status ON labour_hire_workers(status);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_lhw_organization ON labour_hire_workers(organization_id);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_lhp_worker ON labour_hire_placements(worker_id);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_lhp_host ON labour_hire_placements(host_employer_id);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_lhp_status ON labour_hire_placements(status);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_lht_worker ON labour_hire_timesheets(worker_id);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_lht_placement ON labour_hire_timesheets(placement_id);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_lht_status ON labour_hire_timesheets(status);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_lhts_timesheet ON labour_hire_timesheet_details(timesheet_id);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_lhwd_worker ON labour_hire_worker_documents(worker_id);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_lhwd_document ON labour_hire_worker_documents(document_id);`
    );

    logger.info('Labour Hire Workers tables created successfully');
  } catch (error) {
    logger.error('Error creating Labour Hire Workers tables', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function checkIfLabourHireTablesExist(): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'labour_hire_workers'
      );
    `);

    // Properly cast and handle the result
    if (result && result.rows && result.rows.length > 0) {
      return !!result.rows[0].exists;
    }
    return false;
  } catch (error) {
    logger.error('Error checking if Labour Hire Workers tables exist', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
