import { db } from '../server/db.js';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

async function createAwardUpdateChecksTable() {
  console.log('Creating award_update_checks table...');
  
  try {
    // Check if table exists first
    const result = await db.execute(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_schema = 'public'
         AND table_name = 'award_update_checks'
       );`
    );
    
    const tableExists = result[0].exists;
    
    if (tableExists) {
      console.log('award_update_checks table already exists, skipping creation.');
      return;
    }
    
    // Execute raw SQL to create the table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS award_update_checks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        award_code VARCHAR(20) NOT NULL,
        award_name VARCHAR(200) NOT NULL,
        check_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        current_version VARCHAR(50) NOT NULL,
        latest_version VARCHAR(50),
        update_available BOOLEAN DEFAULT FALSE NOT NULL,
        update_url VARCHAR(500),
        last_notified_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        ai_analysis TEXT,
        notification_message TEXT,
        impact_level VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS award_update_check_code_idx ON award_update_checks (award_code);
      CREATE INDEX IF NOT EXISTS award_update_check_status_idx ON award_update_checks (status);
    `);
    
    console.log('Successfully created award_update_checks table');
  } catch (error) {
    console.error('Error creating award_update_checks table:', error);
    throw error;
  }
}

try {
  await createAwardUpdateChecksTable();
  console.log('Migration completed successfully');
  process.exit(0);
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}