import { db } from "./db";
import { sql } from "drizzle-orm";

export async function migrateHostPreferredQualifications() {
  console.log("Creating Host Employer Preferred Qualifications table...");
  
  try {
    // Create host_employer_preferred_qualifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS host_employer_preferred_qualifications (
        id serial PRIMARY KEY,
        host_employer_id integer REFERENCES host_employers(id) NOT NULL,
        qualification_id integer REFERENCES qualifications(id) NOT NULL,
        priority text DEFAULT 'medium',
        notes text,
        is_required boolean DEFAULT false,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Host Employer Preferred Qualifications table created');
    
    console.log('Host Preferred Qualifications migration completed successfully');
    return true;
  } catch (error) {
    console.error('Error in Host Preferred Qualifications migration:', error);
    throw error;
  }
}
