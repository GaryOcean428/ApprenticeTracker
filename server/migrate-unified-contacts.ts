/**
 * Migration script for creating the unified contact and client management system
 */
import { sql } from 'drizzle-orm';
import { db } from './db';
// Use console for logging in migration scripts
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.debug(`[DEBUG] ${message}`, ...args),
};

export async function migrateUnifiedContactsSystem() {
  logger.info('Starting unified contacts and clients schema migration...');

  try {
    // Create Contact Tags table
    logger.info('Creating contact_tags table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contact_tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        color TEXT DEFAULT '#6366F1',
        organization_id INTEGER REFERENCES gto_organizations(id),
        is_system BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('contact_tags table created successfully');

    // Create Contacts table
    logger.info('Creating contacts table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        display_name TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        mobile TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'Australia',
        
        contact_type TEXT NOT NULL,
        primary_role TEXT NOT NULL,
        
        user_id INTEGER REFERENCES users(id),
        apprentice_id INTEGER REFERENCES apprentices(id),
        worker_id INTEGER REFERENCES labour_hire_workers(id),
        host_employer_id INTEGER REFERENCES host_employers(id),
        
        organization_id INTEGER REFERENCES gto_organizations(id),
        company_name TEXT,
        job_title TEXT,
        department TEXT,
        notes TEXT,
        
        profile_image TEXT,
        social_links JSONB DEFAULT '{}',
        custom_fields JSONB DEFAULT '{}',
        
        is_active BOOLEAN DEFAULT TRUE,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_contacted_at TIMESTAMP
      )
    `);
    logger.info('contacts table created successfully');

    // Create Contact Tag Assignments table
    logger.info('Creating contact_tag_assignments table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contact_tag_assignments (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES contact_tags(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('contact_tag_assignments table created successfully');

    // Create Contact Groups table
    logger.info('Creating contact_groups table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contact_groups (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        organization_id INTEGER REFERENCES gto_organizations(id),
        is_private BOOLEAN DEFAULT FALSE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('contact_groups table created successfully');

    // Create Contact Group Members table
    logger.info('Creating contact_group_members table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contact_group_members (
        id SERIAL PRIMARY KEY,
        group_id INTEGER NOT NULL REFERENCES contact_groups(id) ON DELETE CASCADE,
        contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        added_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('contact_group_members table created successfully');

    // Create Contact Interactions table
    logger.info('Creating contact_interactions table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contact_interactions (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        interaction_type TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT,
        interaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('contact_interactions table created successfully');

    // Create Client Types table
    logger.info('Creating client_types table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS client_types (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('client_types table created successfully');

    // Create Clients table
    logger.info('Creating clients table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        trading_name TEXT,
        legal_name TEXT,
        abn TEXT,
        acn TEXT,
        
        email TEXT,
        phone TEXT,
        website TEXT,
        primary_address TEXT,
        billing_address TEXT,
        
        industry TEXT,
        employee_count INTEGER,
        year_established INTEGER,
        
        status TEXT NOT NULL DEFAULT 'active',
        client_since DATE,
        client_type TEXT NOT NULL,
        host_employer_id INTEGER REFERENCES host_employers(id),
        
        account_manager INTEGER REFERENCES users(id),
        organization_id INTEGER REFERENCES gto_organizations(id),
        
        credit_rating TEXT,
        credit_limit NUMERIC(10, 2),
        payment_terms TEXT,
        contract_start_date DATE,
        contract_end_date DATE,
        contract_details JSONB DEFAULT '{}',
        
        service_types JSONB DEFAULT '[]',
        custom_fields JSONB DEFAULT '{}',
        
        notes TEXT,
        tags JSONB DEFAULT '[]',
        
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_interaction_date TIMESTAMP
      )
    `);
    logger.info('clients table created successfully');

    // Create Client Contacts table
    logger.info('Creating client_contacts table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS client_contacts (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        is_primary BOOLEAN DEFAULT FALSE,
        role TEXT,
        department TEXT,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('client_contacts table created successfully');

    // Create Client Services table
    logger.info('Creating client_services table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS client_services (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        service_type TEXT NOT NULL,
        description TEXT NOT NULL,
        start_date DATE,
        end_date DATE,
        status TEXT NOT NULL DEFAULT 'active',
        value NUMERIC(10, 2),
        notes TEXT,
        details JSONB DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('client_services table created successfully');

    // Create Client Interactions table
    logger.info('Creating client_interactions table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS client_interactions (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        contact_id INTEGER REFERENCES contacts(id),
        interaction_type TEXT NOT NULL,
        interaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        subject TEXT NOT NULL,
        description TEXT,
        outcome TEXT,
        next_steps TEXT,
        user_id INTEGER REFERENCES users(id),
        reminder_date TIMESTAMP,
        attachments JSONB DEFAULT '[]',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('client_interactions table created successfully');

    // Create indexes
    logger.info('Creating indexes...');

    // Contact indexes
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS contacts_primary_role_idx ON contacts(primary_role)`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS contacts_organization_id_idx ON contacts(organization_id)`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS contacts_apprentice_id_idx ON contacts(apprentice_id)`
    );
    await db.execute(sql`CREATE INDEX IF NOT EXISTS contacts_worker_id_idx ON contacts(worker_id)`);
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS contacts_host_employer_id_idx ON contacts(host_employer_id)`
    );

    // Client indexes
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS clients_organization_id_idx ON clients(organization_id)`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS clients_host_employer_id_idx ON clients(host_employer_id)`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS clients_client_type_idx ON clients(client_type)`
    );
    await db.execute(sql`CREATE INDEX IF NOT EXISTS clients_status_idx ON clients(status)`);

    logger.info('Indexes created successfully');

    logger.info('Unified contacts and clients schema migration completed successfully');
    return true;
  } catch (error) {
    logger.error('Error in unified contacts and clients schema migration:', error);
    throw error;
  }
}

/**
 * Seeds basic system contact tags
 */
export async function seedContactTags() {
  logger.info('Seeding system contact tags...');

  try {
    // Check if we already have system tags
    const existingTags = await db.execute(sql`
      SELECT COUNT(*) FROM contact_tags WHERE is_system = TRUE
    `);

    const count = parseInt(String(existingTags.rows[0].count), 10);
    if (count > 0) {
      logger.info('System contact tags already exist. Skipping...');
      return;
    }

    // Insert system tags
    await db.execute(sql`
      INSERT INTO contact_tags (name, description, color, is_system) VALUES
        ('Apprentice', 'Registered apprentice in training', '#3B82F6', TRUE),
        ('Trainee', 'Registered trainee in a training program', '#10B981', TRUE),
        ('Labour Hire', 'Labour hire worker', '#F59E0B', TRUE),
        ('Host Employer', 'Host employer representative', '#8B5CF6', TRUE),
        ('Client', 'Client contact', '#EC4899', TRUE),
        ('Supplier', 'Supplier or vendor contact', '#6366F1', TRUE),
        ('VIP', 'Very important contact', '#EF4444', TRUE),
        ('RTO', 'Registered Training Organization contact', '#14B8A6', TRUE),
        ('Field Officer', 'Field officer responsible for site visits', '#0891B2', TRUE),
        ('Government', 'Government department or regulatory contact', '#6B7280', TRUE)
    `);

    // Insert some example client types
    await db.execute(sql`
      INSERT INTO client_types (name, description) VALUES
        ('Host Employer', 'Organizations that host apprentices and trainees'),
        ('Labour Hire', 'Organizations using labour hire services'),
        ('Training Partner', 'Organizations partnering for training delivery'),
        ('Consulting Client', 'Organizations using consulting services'),
        ('Industry Partner', 'Industry association or partnership'),
        ('Government', 'Government departments and agencies')
    `);

    logger.info('System contact tags and client types seeded successfully');
  } catch (error) {
    logger.error('Error seeding system contact tags:', error);
    throw error;
  }
}
