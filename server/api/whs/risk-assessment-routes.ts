import express from 'express';
import { db } from '../../db';
import { sql } from 'drizzle-orm';
import { hasPermission } from '../../middleware/auth';
import { 
  whs_risk_assessments,
  whs_documents,
  insertRiskAssessmentSchema,
  insertDocumentSchema
} from '@shared/schema/whs';

export function setupRiskAssessmentRoutes(router: express.Router) {
  // GET all risk assessments
  router.get('/risk-assessments', async (req, res) => {
    try {
      // Parse query parameters for pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      // Get risk assessments with pagination
      const assessments = await db.select()
        .from(whs_risk_assessments)
        .limit(limit)
        .offset(offset)
        .orderBy(sql`${whs_risk_assessments.assessment_date} DESC`);
      
      // Get total count for pagination
      const [{ count }] = await db.select({ 
        count: sql`count(*)::int` 
      })
      .from(whs_risk_assessments);
      
      res.json({
        assessments,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching risk assessments:', error);
      res.status(500).json({ message: 'Failed to fetch risk assessments' });
    }
  });
  
  // GET risk assessment by ID
  router.get('/risk-assessments/:id', async (req, res) => {
    try {
      const id = req.params.id;
      
      // Get risk assessment
      const [assessment] = await db.select()
        .from(whs_risk_assessments)
        .where(sql`${whs_risk_assessments.id} = ${id}`);
      
      if (!assessment) {
        return res.status(404).json({ message: 'Risk assessment not found' });
      }
      
      // Get documents
      const documents = await db.select()
        .from(whs_documents)
        .where(sql`${whs_documents.risk_assessment_id} = ${id}`);
      
      res.json({
        assessment,
        documents
      });
    } catch (error) {
      console.error('Error fetching risk assessment:', error);
      res.status(500).json({ message: 'Failed to fetch risk assessment details' });
    }
  });
  
  // CREATE new risk assessment
  router.post('/risk-assessments', hasPermission('whs.create_risk_assessment'), async (req, res) => {
    try {
      const validatedData = insertRiskAssessmentSchema.parse(req.body);
      
      // Create risk assessment
      const [newAssessment] = await db.insert(whs_risk_assessments)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newAssessment);
    } catch (error) {
      console.error('Error creating risk assessment:', error);
      res.status(400).json({ 
        message: 'Failed to create risk assessment',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // UPDATE risk assessment
  router.patch('/risk-assessments/:id', hasPermission('whs.update_risk_assessment'), async (req, res) => {
    try {
      const id = req.params.id;
      
      // Ensure risk assessment exists
      const [existingAssessment] = await db.select()
        .from(whs_risk_assessments)
        .where(sql`${whs_risk_assessments.id} = ${id}`);
      
      if (!existingAssessment) {
        return res.status(404).json({ message: 'Risk assessment not found' });
      }
      
      // Update risk assessment
      const [updatedAssessment] = await db.update(whs_risk_assessments)
        .set(req.body)
        .where(sql`${whs_risk_assessments.id} = ${id}`)
        .returning();
      
      res.json(updatedAssessment);
    } catch (error) {
      console.error('Error updating risk assessment:', error);
      res.status(400).json({ message: 'Failed to update risk assessment' });
    }
  });
  
  // DELETE risk assessment
  router.delete('/risk-assessments/:id', hasPermission('whs.delete_risk_assessment'), async (req, res) => {
    try {
      const id = req.params.id;
      
      // Delete risk assessment
      await db.delete(whs_risk_assessments)
        .where(sql`${whs_risk_assessments.id} = ${id}`);
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting risk assessment:', error);
      res.status(500).json({ message: 'Failed to delete risk assessment' });
    }
  });
  
  // Add document to risk assessment
  router.post('/risk-assessments/:assessmentId/documents', hasPermission('whs.update_risk_assessment'), async (req, res) => {
    try {
      const assessmentId = req.params.assessmentId;
      
      // Ensure risk assessment exists
      const [existingAssessment] = await db.select()
        .from(whs_risk_assessments)
        .where(sql`${whs_risk_assessments.id} = ${assessmentId}`);
      
      if (!existingAssessment) {
        return res.status(404).json({ message: 'Risk assessment not found' });
      }
      
      const documentData = insertDocumentSchema.parse({
        ...req.body,
        risk_assessment_id: assessmentId
      });
      
      // Create document
      const [newDocument] = await db.insert(whs_documents)
        .values(documentData)
        .returning();
      
      res.status(201).json(newDocument);
    } catch (error) {
      console.error('Error adding document:', error);
      res.status(400).json({ message: 'Failed to add document' });
    }
  });
}