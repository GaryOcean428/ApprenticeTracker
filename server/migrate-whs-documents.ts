import { sql } from 'drizzle-orm';
import { db } from './db';

/**
 * Migration to add required relationship fields to whs_documents table
 */
export async function migrateWhsDocuments() {
  console.log('[INFO] Updating WHS documents schema...');
  
  try {
    // First check if the whs_documents table exists
    const tableCheckQuery = sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'whs_documents'
      );
    `;
    
    const tableExists = await db.execute(tableCheckQuery);
    
    if (!tableExists.rows[0]?.exists) {
      console.log('[INFO] WHS documents table does not exist yet, skipping schema update');
      return false;
    }
    
    // Check if columns already exist to avoid errors on re-running
    const checkColumnsQuery = sql`
      SELECT 
        column_name 
      FROM 
        information_schema.columns 
      WHERE 
        table_name = 'whs_documents' AND 
        column_name IN ('risk_assessment_id', 'inspection_id', 'policy_id')
    `;

    const existingColumns = await db.execute(checkColumnsQuery);
    const columnNames = existingColumns.rows.map(row => row.column_name);
    
    // Add risk_assessment_id if it doesn't exist
    if (!columnNames.includes('risk_assessment_id')) {
      await db.execute(sql`
        ALTER TABLE whs_documents 
        ADD COLUMN risk_assessment_id UUID REFERENCES whs_risk_assessments(id) ON DELETE CASCADE
      `);
      console.log('[INFO] Added risk_assessment_id column to whs_documents');
    }
    
    // Add inspection_id if it doesn't exist
    if (!columnNames.includes('inspection_id')) {
      await db.execute(sql`
        ALTER TABLE whs_documents 
        ADD COLUMN inspection_id UUID REFERENCES whs_inspections(id) ON DELETE CASCADE
      `);
      console.log('[INFO] Added inspection_id column to whs_documents');
    }
    
    // Add policy_id if it doesn't exist
    if (!columnNames.includes('policy_id')) {
      await db.execute(sql`
        ALTER TABLE whs_documents 
        ADD COLUMN policy_id UUID REFERENCES whs_policies(id) ON DELETE CASCADE
      `);
      console.log('[INFO] Added policy_id column to whs_documents');
    }
    
    console.log('[INFO] WHS documents schema updated successfully');
    return true;
  } catch (error) {
    console.error('[ERROR] Failed to update WHS documents schema:', error);
    // Don't throw error, just return false to allow other migrations to continue
    return false;
  }
}

// This file is only meant to be imported, not executed directly
// The migration is executed from server/index.ts