import { db } from './db';
import { 
  gtoComplianceStandards, 
  complianceAssessments, 
  apprenticeRecruitment,
  hostEmployerAgreements,
  apprenticeInduction,
  complaints,
  appeals
} from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * This script creates the GTO Compliance tables for Australian Apprentice Management
 */
export async function migrateGtoComplianceSchema() {
  console.log('Creating GTO Compliance tables...');

  // Add GTO compliance-related fields to GTO Organizations table
  try {
    await db.execute(sql`
      ALTER TABLE gto_organizations 
      ADD COLUMN IF NOT EXISTS registration_status text DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS registration_number text,
      ADD COLUMN IF NOT EXISTS registration_date date,
      ADD COLUMN IF NOT EXISTS registration_expiry_date date,
      ADD COLUMN IF NOT EXISTS last_compliance_audit date,
      ADD COLUMN IF NOT EXISTS next_compliance_audit date,
      ADD COLUMN IF NOT EXISTS compliance_rating integer
    `);
    console.log('GTO Organization table updated with compliance fields');
  } catch (error) {
    console.error('Error updating GTO Organization table:', error);
    throw error;
  }

  // Create GTO Compliance Standards table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS gto_compliance_standards (
        id serial PRIMARY KEY,
        standard_number text NOT NULL,
        standard_name text NOT NULL,
        standard_description text NOT NULL,
        category text NOT NULL,
        required_evidence text[],
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('GTO Compliance Standards table created');
  } catch (error) {
    console.error('Error creating GTO Compliance Standards table:', error);
    throw error;
  }

  // Create Compliance Assessments table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS compliance_assessments (
        id serial PRIMARY KEY,
        standard_id integer REFERENCES gto_compliance_standards(id),
        organization_id integer REFERENCES gto_organizations(id),
        status text NOT NULL,
        assessment_date timestamp NOT NULL,
        assessed_by integer REFERENCES users(id),
        evidence jsonb,
        notes text,
        due_date timestamp,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Compliance Assessments table created');
  } catch (error) {
    console.error('Error creating Compliance Assessments table:', error);
    throw error;
  }

  // Create Apprentice Recruitment table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS apprentice_recruitment (
        id serial PRIMARY KEY,
        apprentice_id integer REFERENCES apprentices(id),
        information_disclosure boolean DEFAULT false,
        information_disclosure_date timestamp,
        information_disclosure_evidence jsonb,
        suitability_assessment boolean DEFAULT false,
        suitability_assessment_date timestamp,
        suitability_assessment_score integer,
        lln_assessment boolean DEFAULT false,
        lln_assessment_date timestamp,
        lln_assessment_results jsonb,
        special_needs boolean DEFAULT false,
        special_needs_details jsonb,
        guardian_informed boolean DEFAULT false,
        guardian_informed_date timestamp,
        guardian_details jsonb,
        signed_acknowledgment boolean DEFAULT false,
        signed_acknowledgment_date timestamp,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Apprentice Recruitment table created');
  } catch (error) {
    console.error('Error creating Apprentice Recruitment table:', error);
    throw error;
  }

  // Create Host Employer Agreements table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS host_employer_agreements (
        id serial PRIMARY KEY,
        host_employer_id integer REFERENCES host_employers(id),
        agreement_date timestamp NOT NULL,
        expiry_date timestamp NOT NULL,
        induction_provided boolean DEFAULT false,
        induction_date timestamp,
        whs_compliance text NOT NULL,
        whs_audit_date timestamp,
        agreement_document jsonb,
        supervision_capacity boolean DEFAULT false,
        training_capacity boolean DEFAULT false,
        facility_capacity boolean DEFAULT false,
        review_notes text,
        reviewed_by integer REFERENCES users(id),
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Host Employer Agreements table created');
  } catch (error) {
    console.error('Error creating Host Employer Agreements table:', error);
    throw error;
  }

  // Create Apprentice Induction table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS apprentice_induction (
        id serial PRIMARY KEY,
        apprentice_id integer REFERENCES apprentices(id),
        induction_completed boolean DEFAULT false,
        induction_date timestamp,
        induction_content jsonb,
        responsibilities_explained boolean DEFAULT false,
        workplace_operations boolean DEFAULT false,
        industrial_relations boolean DEFAULT false,
        whs_rights boolean DEFAULT false,
        support_mechanisms boolean DEFAULT false,
        sign_off_by integer REFERENCES users(id),
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Apprentice Induction table created');
  } catch (error) {
    console.error('Error creating Apprentice Induction table:', error);
    throw error;
  }

  // Create Complaints table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS complaints (
        id serial PRIMARY KEY,
        complainant_type text NOT NULL,
        complainant_id integer,
        complaint_type text NOT NULL,
        opened_date timestamp NOT NULL,
        status text NOT NULL,
        description text NOT NULL,
        action_taken text,
        resolved_date timestamp,
        resolved_by integer REFERENCES users(id),
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Complaints table created');
  } catch (error) {
    console.error('Error creating Complaints table:', error);
    throw error;
  }

  // Create Appeals table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS appeals (
        id serial PRIMARY KEY,
        appellant_type text NOT NULL,
        appellant_id integer,
        appeal_type text NOT NULL,
        opened_date timestamp NOT NULL,
        status text NOT NULL,
        description text NOT NULL,
        decision_details text,
        decision_date timestamp,
        decided_by integer REFERENCES users(id),
        external_referral boolean DEFAULT false,
        referral_details jsonb,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);
    console.log('Appeals table created');
  } catch (error) {
    console.error('Error creating Appeals table:', error);
    throw error;
  }
  
  console.log('GTO Compliance schema migration completed successfully');
}