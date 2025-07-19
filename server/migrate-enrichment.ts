import { db } from './db';
import { sql } from 'drizzle-orm';
import {
  enrichmentPrograms,
  enrichmentParticipants,
  enrichmentWorkshops,
  workshopAttendees,
} from '@shared/schema';

/**
 * This script creates the enrichment program tables for apprentice enrichment activities
 */
export async function migrateEnrichmentSchema() {
  console.log('Creating Enrichment Program tables...');

  try {
    // Create enrichment_programs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enrichment_programs (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'upcoming',
        start_date DATE NOT NULL,
        end_date DATE,
        tags JSONB NOT NULL DEFAULT '[]',
        facilitator TEXT,
        location TEXT,
        max_participants INTEGER,
        cost NUMERIC(10, 2),
        funding_source TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created enrichment_programs table');

    // Create enrichment_participants table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enrichment_participants (
        id SERIAL PRIMARY KEY,
        program_id INTEGER NOT NULL REFERENCES enrichment_programs(id),
        apprentice_id INTEGER NOT NULL REFERENCES apprentices(id),
        enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
        status TEXT NOT NULL DEFAULT 'enrolled',
        completion_date DATE,
        feedback TEXT,
        rating INTEGER,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created enrichment_participants table');

    // Create enrichment_workshops table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enrichment_workshops (
        id SERIAL PRIMARY KEY,
        program_id INTEGER REFERENCES enrichment_programs(id),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        workshop_date DATE NOT NULL,
        start_time TEXT,
        end_time TEXT,
        location TEXT,
        facilitator TEXT,
        max_attendees INTEGER,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created enrichment_workshops table');

    // Create workshop_attendees table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS workshop_attendees (
        id SERIAL PRIMARY KEY,
        workshop_id INTEGER NOT NULL REFERENCES enrichment_workshops(id),
        apprentice_id INTEGER NOT NULL REFERENCES apprentices(id),
        status TEXT NOT NULL DEFAULT 'registered',
        registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        feedback TEXT,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created workshop_attendees table');

    console.log('Enrichment schema migration completed successfully');
    return true;
  } catch (error) {
    console.error('Error migrating enrichment schema:', error);
    return false;
  }
}
