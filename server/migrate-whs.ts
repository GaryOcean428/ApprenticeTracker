import { db } from './db';
import { sql } from 'drizzle-orm';
import logger from './utils/logger';

export async function migrateWHS() {
  logger.info('Creating Work Health and Safety (WHS) tables...');

  try {
    // Create WHS incident and hazard reporting table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS whs_incidents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL, -- incident, hazard, near_miss
        severity VARCHAR(50) NOT NULL, -- low, medium, high, critical
        location VARCHAR(255) NOT NULL,
        date_occurred TIMESTAMP NOT NULL,
        date_reported TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        description TEXT NOT NULL,
        immediate_actions TEXT,
        reporter_id INTEGER REFERENCES users(id),
        apprentice_id INTEGER REFERENCES apprentices(id),
        host_employer_id INTEGER REFERENCES host_employers(id),
        status VARCHAR(50) NOT NULL DEFAULT 'reported', -- reported, investigating, resolved, closed
        assigned_to INTEGER REFERENCES users(id),
        investigation_notes TEXT,
        resolution_details TEXT,
        resolution_date TIMESTAMP,
        notifiable_incident BOOLEAN DEFAULT FALSE,
        authority_notified BOOLEAN DEFAULT FALSE,
        authority_reference VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create WHS incident witness table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS whs_incident_witnesses (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES whs_incidents(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        contact VARCHAR(255) NOT NULL,
        statement TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create WHS incident documents table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS whs_incident_documents (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES whs_incidents(id) ON DELETE CASCADE,
        document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create WHS risk assessment table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS whs_risk_assessments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        host_employer_id INTEGER REFERENCES host_employers(id),
        location VARCHAR(255) NOT NULL,
        assessment_date TIMESTAMP NOT NULL,
        assessor_id INTEGER REFERENCES users(id),
        description TEXT NOT NULL,
        hazards_identified TEXT NOT NULL,
        current_controls TEXT,
        risk_rating VARCHAR(50) NOT NULL, -- low, medium, high, extreme
        additional_controls TEXT NOT NULL,
        residual_risk_rating VARCHAR(50) NOT NULL, -- low, medium, high, extreme
        review_date TIMESTAMP NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, completed, reviewed, expired
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create WHS risk assessment responsible persons table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS whs_risk_responsible_persons (
        id SERIAL PRIMARY KEY,
        risk_assessment_id INTEGER REFERENCES whs_risk_assessments(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        responsibility TEXT NOT NULL,
        due_date TIMESTAMP,
        completion_date TIMESTAMP,
        status VARCHAR(50) NOT NULL DEFAULT 'assigned', -- assigned, in_progress, completed
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create WHS training records table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS whs_training_records (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        training_type VARCHAR(100) NOT NULL, -- induction, specific_hazard, qualification, certification
        user_id INTEGER REFERENCES users(id),
        apprentice_id INTEGER REFERENCES apprentices(id),
        completion_date TIMESTAMP NOT NULL,
        expiry_date TIMESTAMP,
        status VARCHAR(50) NOT NULL DEFAULT 'valid', -- valid, expiring_soon, expired
        verification_method VARCHAR(100), -- certificate, assessment, observation
        verified_by INTEGER REFERENCES users(id),
        verification_date TIMESTAMP,
        document_id INTEGER REFERENCES documents(id),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create WHS site inspections table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS whs_site_inspections (
        id SERIAL PRIMARY KEY,
        host_employer_id INTEGER REFERENCES host_employers(id) NOT NULL,
        site_address VARCHAR(255) NOT NULL,
        inspection_date TIMESTAMP NOT NULL,
        inspector_id INTEGER REFERENCES users(id) NOT NULL,
        inspection_type VARCHAR(100) NOT NULL, -- initial, routine, follow_up, incident_investigation
        overall_rating VARCHAR(50) NOT NULL, -- compliant, minor_issues, major_issues, critical
        findings TEXT NOT NULL,
        recommendations TEXT,
        corrective_actions TEXT,
        follow_up_required BOOLEAN DEFAULT FALSE,
        follow_up_date TIMESTAMP,
        status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, completed, remediation_required, closed
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create WHS inspection checklist items table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS whs_inspection_checklist_items (
        id SERIAL PRIMARY KEY,
        inspection_id INTEGER REFERENCES whs_site_inspections(id) ON DELETE CASCADE,
        category VARCHAR(100) NOT NULL, -- general_safety, fire_safety, first_aid, electrical, etc.
        item_description TEXT NOT NULL,
        compliance_status VARCHAR(50) NOT NULL, -- compliant, non_compliant, not_applicable
        severity VARCHAR(50), -- low, medium, high
        notes TEXT,
        photos_document_ids TEXT, -- Comma-separated list of document IDs
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create WHS policies and procedures table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS whs_policies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        document_id INTEGER REFERENCES documents(id),
        version VARCHAR(50) NOT NULL,
        effective_date TIMESTAMP NOT NULL,
        review_date TIMESTAMP NOT NULL,
        approved_by INTEGER REFERENCES users(id),
        approval_date TIMESTAMP NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active', -- draft, active, under_review, archived
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create WHS policy acknowledgements table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS whs_policy_acknowledgements (
        id SERIAL PRIMARY KEY,
        policy_id INTEGER REFERENCES whs_policies(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        apprentice_id INTEGER REFERENCES apprentices(id),
        acknowledged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        acknowledgement_method VARCHAR(100) NOT NULL, -- electronic, paper, verbal
        ip_address VARCHAR(100),
        version_acknowledged VARCHAR(50) NOT NULL
      )
    `);

    logger.info('WHS tables created successfully');
    return true;
  } catch (error) {
    logger.error(
      'Error creating WHS tables: ' + (error instanceof Error ? error.message : String(error))
    );
    throw error;
  }
}
