import { sql } from 'drizzle-orm';
import chalk from 'chalk';
import { pool, db } from './db';

export async function migrateWhsRiskAssessments() {
  console.log(chalk.blue('[INFO] Updating WHS Risk Assessments schema...'));

  try {
    // Check if the table exists before attempting to alter it
    const tableExists = await checkTableExists('whs_risk_assessments');

    if (!tableExists) {
      console.log(
        chalk.yellow('[INFO] WHS Risk Assessments table does not exist yet, skipping schema update')
      );
      return;
    }

    // Add new columns
    await db.execute(sql`
      ALTER TABLE whs_risk_assessments
      ADD COLUMN IF NOT EXISTS work_area VARCHAR(200),
      ADD COLUMN IF NOT EXISTS department VARCHAR(100),
      ADD COLUMN IF NOT EXISTS hazards JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS approver_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS approval_notes TEXT;
    `);

    // Make assessor_id nullable (for cases where it's not yet assigned)
    await db.execute(sql`
      ALTER TABLE whs_risk_assessments 
      ALTER COLUMN assessor_id DROP NOT NULL;
    `);

    console.log(chalk.green('[INFO] WHS Risk Assessments schema updated successfully'));
  } catch (error) {
    console.error(chalk.red('[ERROR] Failed to update WHS Risk Assessments schema:'), error);
    throw error;
  }
}

async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await pool.query(
    `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `,
    [tableName]
  );

  return result.rows[0].exists;
}
