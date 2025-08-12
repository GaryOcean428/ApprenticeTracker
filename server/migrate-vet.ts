import { sql } from 'drizzle-orm';
import { db } from './db';

/**
 * This script creates the VET Training tables for Units of Competency and Qualifications
 */
export async function migrateVetSchema() {
  console.log('Creating VET Training tables...');

  // Create Units of Competency table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS units_of_competency (
        id serial PRIMARY KEY,
        unit_code text NOT NULL UNIQUE,
        unit_title text NOT NULL,
        unit_description text,
        release_number text,
        release_date date,
        training_package text,
        training_package_release text,
        element_summary jsonb,
        performance_criteria jsonb,
        assessment_requirements jsonb,
        nominal_hours integer,
        is_active boolean DEFAULT true,
        is_imported boolean DEFAULT false,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Units of Competency table created');
  } catch (error) {
    console.error('Error creating Units of Competency table:', error);
    throw error;
  }

  // Create Qualifications table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS qualifications (
        id serial PRIMARY KEY,
        qualification_code text NOT NULL UNIQUE,
        qualification_title text NOT NULL,
        qualification_description text,
        aqf_level text NOT NULL,
        aqf_level_number integer NOT NULL,
        training_package text,
        training_package_release text,
        total_units integer NOT NULL,
        core_units integer NOT NULL,
        elective_units integer NOT NULL,
        nominal_hours integer,
        is_active boolean DEFAULT true,
        is_apprenticeship_qualification boolean DEFAULT false,
        is_funded_qualification boolean DEFAULT false,
        funding_details jsonb,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Qualifications table created');
  } catch (error) {
    console.error('Error creating Qualifications table:', error);
    throw error;
  }

  // Create Qualification Structure table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS qualification_structure (
        id serial PRIMARY KEY,
        qualification_id integer REFERENCES qualifications(id) NOT NULL,
        unit_id integer REFERENCES units_of_competency(id) NOT NULL,
        is_core boolean DEFAULT false,
        group_name text,
        is_mandatory_elective boolean DEFAULT false,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Qualification Structure table created');
  } catch (error) {
    console.error('Error creating Qualification Structure table:', error);
    throw error;
  }

  // Create Apprentice Unit Progress table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS apprentice_unit_progress (
        id serial PRIMARY KEY,
        apprentice_id integer REFERENCES apprentices(id) NOT NULL,
        unit_id integer REFERENCES units_of_competency(id) NOT NULL,
        status text NOT NULL DEFAULT 'not_started',
        start_date date,
        completed_date date,
        assessed_date date,
        assessment_result text,
        assessor_id integer REFERENCES users(id),
        evidence jsonb,
        notes text,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Apprentice Unit Progress table created');
  } catch (error) {
    console.error('Error creating Apprentice Unit Progress table:', error);
    throw error;
  }

  // Create Apprentice Qualifications table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS apprentice_qualifications (
        id serial PRIMARY KEY,
        apprentice_id integer REFERENCES apprentices(id) NOT NULL,
        qualification_id integer REFERENCES qualifications(id) NOT NULL,
        enrollment_date date NOT NULL,
        expected_completion_date date,
        status text NOT NULL DEFAULT 'active',
        completion_date date,
        certificate_issue_date date,
        certificate_number text,
        rto_id integer,
        rto_name text,
        funding_source text,
        funding_details jsonb,
        training_plan_document_id integer REFERENCES documents(id),
        notes text,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Apprentice Qualifications table created');
  } catch (error) {
    console.error('Error creating Apprentice Qualifications table:', error);
    throw error;
  }

  console.log('VET Training schema migration completed successfully');
}
