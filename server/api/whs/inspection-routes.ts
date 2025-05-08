import express from 'express';
import { storage } from '../../storage';
import { db } from '../../db';
import { z } from 'zod';
import { 
  whs_inspections,
  whs_documents,
  insertInspectionSchema,
  insertDocumentSchema
} from '@shared/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { isAuthenticated, hasPermission } from '../../middleware/auth';

export function setupInspectionRoutes(router: express.Router) {
  // GET all inspections with pagination
  router.get('/inspections', async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      // Filter by status if provided
      const statusFilter = req.query.status ? 
        sql`${whs_inspections.status} = ${req.query.status}` : 
        undefined;
      
      // Get inspections with pagination
      const query = db.select()
        .from(whs_inspections)
        .orderBy(desc(whs_inspections.inspection_date));
      
      if (statusFilter) {
        query.where(statusFilter);
      }
      
      const inspections = await query
        .limit(limit)
        .offset(offset);
      
      // Get total count for pagination
      const countResult = await db.select({ 
        count: sql`count(*)::int` 
      })
      .from(whs_inspections);
      
      const count = countResult[0]?.count || 0;
      const totalPages = Math.ceil(Number(count) / limit);
      
      res.json({
        inspections,
        pagination: {
          page,
          limit,
          total: count,
          totalPages
        }
      });
    } catch (error) {
      console.error('Error fetching inspections:', error);
      res.status(500).json({ message: 'Failed to fetch inspections' });
    }
  });
  
  // GET inspection by ID with related data
  router.get('/inspections/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      // Get inspection
      const [inspection] = await db.select()
        .from(whs_inspections)
        .where(sql`${whs_inspections.id} = ${id}`);
      
      if (!inspection) {
        return res.status(404).json({ message: 'Inspection not found' });
      }
      
      // Get documents
      const documents = await db.select()
        .from(whs_documents)
        .where(sql`${whs_documents.inspection_id} = ${id}`);
      
      res.json({
        inspection,
        documents
      });
    } catch (error) {
      console.error('Error fetching inspection:', error);
      res.status(500).json({ message: 'Failed to fetch inspection details' });
    }
  });
  
  // CREATE new inspection
  router.post('/inspections', hasPermission('whs.create_inspection'), async (req, res) => {
    try {
      const validatedData = insertInspectionSchema.parse(req.body);
      
      // Create inspection
      const [newInspection] = await db.insert(whs_inspections)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newInspection);
    } catch (error) {
      console.error('Error creating inspection:', error);
      res.status(400).json({ 
        message: 'Failed to create inspection',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // UPDATE inspection
  router.patch('/inspections/:id', hasPermission('whs.update_inspection'), async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      // Ensure inspection exists
      const [existingInspection] = await db.select()
        .from(whs_inspections)
        .where(sql`${whs_inspections.id} = ${id}`);
      
      if (!existingInspection) {
        return res.status(404).json({ message: 'Inspection not found' });
      }
      
      // Update inspection
      const [updatedInspection] = await db.update(whs_inspections)
        .set(req.body)
        .where(sql`${whs_inspections.id} = ${id}`)
        .returning();
      
      res.json(updatedInspection);
    } catch (error) {
      console.error('Error updating inspection:', error);
      res.status(400).json({ message: 'Failed to update inspection' });
    }
  });
  
  // DELETE inspection
  router.delete('/inspections/:id', hasPermission('whs.delete_inspection'), async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      // Delete inspection
      await db.delete(whs_inspections)
        .where(sql`${whs_inspections.id} = ${id}`);
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting inspection:', error);
      res.status(500).json({ message: 'Failed to delete inspection' });
    }
  });
  
  // Add document to inspection
  router.post('/inspections/:inspectionId/documents', hasPermission('whs.update_inspection'), async (req, res) => {
    try {
      const inspectionId = req.params.inspectionId;
      
      // Ensure inspection exists
      const [existingInspection] = await db.select()
        .from(whs_inspections)
        .where(sql`${whs_inspections.id} = ${inspectionId}`);
      
      if (!existingInspection) {
        return res.status(404).json({ message: 'Inspection not found' });
      }
      
      // Execute raw SQL instead of using the typed ORM
      // This avoids TypeScript errors that are hard to resolve due to circular references
      const query = sql`
        INSERT INTO whs_documents (
          title, file_path, filename, file_type, file_size, uploaded_by_id, inspection_id
        ) VALUES (
          ${req.body.title}, ${req.body.file_path}, ${req.body.filename}, 
          ${req.body.file_type}, ${req.body.file_size}, ${req.body.uploaded_by_id}, ${inspectionId}
        )
        RETURNING *
      `;
      
      const result = await db.execute(query);
      const newDocument = result.rows[0];
      
      res.status(201).json(newDocument);
    } catch (error) {
      console.error('Error adding document:', error);
      res.status(400).json({ message: 'Failed to add document' });
    }
  });
}