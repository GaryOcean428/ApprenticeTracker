import { db } from "./db";
import { sql } from "drizzle-orm";
import logger from "./utils/logger";

/**
 * This script adds the AVETMISS and Fair Work fields to the host_employers table
 * to ensure data consistency across tables
 */
export async function migrateHostEmployersFields() {
  console.log("Starting host employers fields migration...");
  
  try {
    // Check for existing columns to avoid errors if they already exist
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'host_employers' AND column_name = 'employer_identifier'
      ) as has_employer_identifier;
    `);

    const hasEmployerIdentifier = result.length > 0 && result[0] && (result[0] as any).has_employer_identifier === true;
    
    if (!hasEmployerIdentifier) {
      // Add AVETMISS and Fair Work fields
      await db.execute(sql`
        ALTER TABLE host_employers 
        ADD COLUMN IF NOT EXISTS employer_identifier TEXT UNIQUE,
        ADD COLUMN IF NOT EXISTS employer_legal_name TEXT,
        ADD COLUMN IF NOT EXISTS employer_size TEXT,
        ADD COLUMN IF NOT EXISTS employer_type_identifier TEXT,
        ADD COLUMN IF NOT EXISTS anzsic_code TEXT,
        ADD COLUMN IF NOT EXISTS whs_policy BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS whs_last_audit DATE,
        ADD COLUMN IF NOT EXISTS whs_next_audit DATE,
        ADD COLUMN IF NOT EXISTS labour_hire_licence_expiry DATE
      `);
      console.log("Added AVETMISS and Fair Work fields to host_employers table");
    } else {
      console.log("AVETMISS and Fair Work fields already exist in host_employers table");
    }

    console.log("Host employers fields migration completed successfully!");
    return true;
  } catch (error) {
    console.error("Host employers fields migration failed:", error);
    logger.error("Host employers fields migration failed", { error });
    throw error;
  }
}
