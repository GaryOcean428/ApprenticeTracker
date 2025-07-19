import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * This script creates the Progress Reviews tables for apprentice assessment and reviews
 */
export async function migrateProgressReviewsSchema() {
  console.log('Creating Progress Reviews tables...');

  // Create Progress Review Templates table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS progress_review_templates (
        id serial PRIMARY KEY,
        template_name text NOT NULL,
        description text,
        template_version text NOT NULL,
        form_structure jsonb NOT NULL,
        is_active boolean DEFAULT true,
        created_by integer REFERENCES users(id),
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Progress Review Templates table created');
  } catch (error) {
    console.error('Error creating Progress Review Templates table:', error);
    throw error;
  }

  // Create Progress Reviews table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS progress_reviews (
        id serial PRIMARY KEY,
        apprentice_id integer REFERENCES apprentices(id) NOT NULL,
        template_id integer REFERENCES progress_review_templates(id) NOT NULL,
        reviewer_id integer REFERENCES users(id) NOT NULL,
        review_date timestamp NOT NULL,
        scheduled_date timestamp,
        status text NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
        review_period_start date,
        review_period_end date,
        review_data jsonb NOT NULL,
        overall_rating integer,
        review_summary text,
        apprentice_feedback text,
        review_location text,
        next_review_date timestamp,
        next_review_goals jsonb,
        host_employer_id integer REFERENCES host_employers(id),
        supervisor_present boolean DEFAULT false,
        supervisor_name text,
        supervisor_feedback text,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Progress Reviews table created');
  } catch (error) {
    console.error('Error creating Progress Reviews table:', error);
    throw error;
  }

  // Create Progress Review Participants table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS progress_review_participants (
        id serial PRIMARY KEY,
        review_id integer REFERENCES progress_reviews(id) NOT NULL,
        user_id integer REFERENCES users(id) NOT NULL,
        role text NOT NULL, -- reviewer, observer, mentor, etc.
        attendance_status text NOT NULL DEFAULT 'invited', -- invited, confirmed, attended, absent
        notes text,
        created_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Progress Review Participants table created');
  } catch (error) {
    console.error('Error creating Progress Review Participants table:', error);
    throw error;
  }

  // Create Progress Review Action Items table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS progress_review_action_items (
        id serial PRIMARY KEY,
        review_id integer REFERENCES progress_reviews(id) NOT NULL,
        action_description text NOT NULL,
        priority text NOT NULL DEFAULT 'medium', -- low, medium, high, critical
        assignee_id integer REFERENCES users(id),
        due_date date,
        status text NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
        completion_date date,
        completion_notes text,
        created_by integer REFERENCES users(id) NOT NULL,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Progress Review Action Items table created');
  } catch (error) {
    console.error('Error creating Progress Review Action Items table:', error);
    throw error;
  }

  // Create Progress Review Documents table to link reviews with uploaded documents
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS progress_review_documents (
        id serial PRIMARY KEY,
        review_id integer REFERENCES progress_reviews(id) NOT NULL,
        document_id integer REFERENCES documents(id) NOT NULL,
        document_type text NOT NULL, -- evidence, signature, attachment, etc.
        created_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Progress Review Documents table created');
  } catch (error) {
    console.error('Error creating Progress Review Documents table:', error);
    throw error;
  }

  console.log('Progress Reviews schema migration completed successfully');
}
