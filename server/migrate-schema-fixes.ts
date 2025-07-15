import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Migration script to fix schema inconsistencies and rename conflicting tables
 *
 * Changes:
 * 1. Rename 'award_rates' table in billing schema to 'billing_award_rates' to avoid conflicts
 * 2. Add any missing indexes for performance
 * 3. Add any missing constraints
 */

async function migrateSchemaFixes() {
  console.log('Starting schema fixes migration...');

  try {
    // Check if billing award_rates table exists (old name)
    const billingTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'award_rates'
        AND table_comment LIKE '%billing%'
      );
    `);

    // If the old billing table exists, rename it
    if (billingTableExists.rows[0]?.exists) {
      console.log('Renaming award_rates to billing_award_rates...');
      await db.execute(sql`ALTER TABLE award_rates RENAME TO billing_award_rates;`);
      console.log('✓ Renamed billing award_rates table');
    }

    // Add missing indexes for better performance
    console.log('Adding performance indexes...');

    // Index on apprentice email for faster lookups
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_apprentices_email 
      ON apprentices(email);
    `);

    // Index on host employer status for filtering
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_host_employers_status 
      ON host_employers(status);
    `);

    // Index on timesheet status and dates
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_timesheets_status_date 
      ON timesheets(status, week_starting);
    `);

    // Index on document relations for faster lookups
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_documents_relation 
      ON documents(related_to, related_id);
    `);

    // Index on compliance record status
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_compliance_records_status 
      ON compliance_records(status, due_date);
    `);

    // Index on activity logs for dashboard queries
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp 
      ON activity_logs(timestamp DESC);
    `);

    // Index on tasks for filtering by status and assignee
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_tasks_assignee_status 
      ON tasks(assigned_to, status);
    `);

    // Index on qualifications for search
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_qualifications_code 
      ON qualifications(qualification_code);
    `);

    // Index on units of competency for search
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_units_competency_code 
      ON units_of_competency(unit_code);
    `);

    console.log('✓ Added performance indexes');

    // Add missing constraints to ensure data integrity
    console.log('Adding data integrity constraints...');

    // Ensure apprentice emails are properly formatted
    await db.execute(sql`
      ALTER TABLE apprentices 
      ADD CONSTRAINT IF NOT EXISTS chk_apprentice_email_format 
      CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    `);

    // Ensure user emails are properly formatted
    await db.execute(sql`
      ALTER TABLE users 
      ADD CONSTRAINT IF NOT EXISTS chk_user_email_format 
      CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    `);

    // Ensure host employer emails are properly formatted
    await db.execute(sql`
      ALTER TABLE host_employers 
      ADD CONSTRAINT IF NOT EXISTS chk_host_email_format 
      CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    `);

    // Ensure positive rates in pay_rates
    await db.execute(sql`
      ALTER TABLE pay_rates 
      ADD CONSTRAINT IF NOT EXISTS chk_pay_rate_positive 
      CHECK (hourly_rate > 0);
    `);

    // Ensure positive hours in timesheet_details
    await db.execute(sql`
      ALTER TABLE timesheet_details 
      ADD CONSTRAINT IF NOT EXISTS chk_hours_worked_positive 
      CHECK (hours_worked >= 0 AND hours_worked <= 24);
    `);

    // Ensure valid progress values for apprentices
    await db.execute(sql`
      ALTER TABLE apprentices 
      ADD CONSTRAINT IF NOT EXISTS chk_progress_range 
      CHECK (progress >= 0 AND progress <= 100);
    `);

    console.log('✓ Added data integrity constraints');

    // Update any existing invalid data to comply with new constraints
    console.log('Cleaning up existing data...');

    // Fix any invalid progress values
    await db.execute(sql`
      UPDATE apprentices 
      SET progress = CASE 
        WHEN progress < 0 THEN 0 
        WHEN progress > 100 THEN 100 
        ELSE progress 
      END
      WHERE progress < 0 OR progress > 100;
    `);

    // Fix any invalid hourly rates
    await db.execute(sql`
      UPDATE pay_rates 
      SET hourly_rate = 1.00 
      WHERE hourly_rate <= 0;
    `);

    console.log('✓ Cleaned up existing data');

    console.log('Schema fixes migration completed successfully!');
  } catch (error) {
    console.error('Error during schema fixes migration:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateSchemaFixes()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateSchemaFixes };
