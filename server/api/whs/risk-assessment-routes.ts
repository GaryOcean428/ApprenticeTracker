import express from 'express';
import { db } from '../../db';
import { sql } from 'drizzle-orm';
import { hasPermission } from '../../middleware/auth';
import {
  whs_risk_assessments,
  whs_documents,
  insertRiskAssessmentSchema,
  updateRiskAssessmentSchema,
  insertDocumentSchema,
} from '@shared/schema/whs';

export function setupRiskAssessmentRoutes(router: express.Router) {
  // GET all risk assessments
  router.get('/risk-assessments', async (req, res) => {
    try {
      // Parse query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const search = (req.query.search as string) || '';
      const status = (req.query.status as string) || '';
      const hostEmployerId = (req.query.hostEmployerId as string) || '';

      // Build query with filters
      let query = db.select().from(whs_risk_assessments);
      let countQuery = db.select({ count: sql`count(*)::int` }).from(whs_risk_assessments);

      // Apply filters
      if (search) {
        const searchFilter = sql`(
          ${whs_risk_assessments.title} ILIKE ${'%' + search + '%'} OR
          ${whs_risk_assessments.location} ILIKE ${'%' + search + '%'} OR
          ${whs_risk_assessments.description} ILIKE ${'%' + search + '%'} OR
          ${whs_risk_assessments.assessor_name} ILIKE ${'%' + search + '%'}
        )`;

        query = query.where(searchFilter);
        countQuery = countQuery.where(searchFilter);
      }

      if (status) {
        query = query.where(sql`${whs_risk_assessments.status} = ${status}`);
        countQuery = countQuery.where(sql`${whs_risk_assessments.status} = ${status}`);
      }

      if (hostEmployerId) {
        query = query.where(sql`${whs_risk_assessments.host_employer_id} = ${hostEmployerId}`);
        countQuery = countQuery.where(
          sql`${whs_risk_assessments.host_employer_id} = ${hostEmployerId}`
        );
      }

      // Apply pagination and ordering
      query = query
        .limit(limit)
        .offset(offset)
        .orderBy(sql`${whs_risk_assessments.assessment_date} DESC`);

      // Execute queries
      const assessments = await query;
      const [countResult] = await countQuery;

      // Process hazards JSON for each assessment
      for (const assessment of assessments) {
        if (assessment.hazards) {
          try {
            // Parse hazards JSON if it's a string
            if (typeof assessment.hazards === 'string') {
              assessment.hazards = JSON.parse(assessment.hazards);
            }
          } catch (error) {
            console.error('Error parsing hazards JSON:', error);
            assessment.hazards = [];
          }
        } else {
          assessment.hazards = [];
        }
      }

      const totalCount = Number(countResult?.count || 0);

      res.json({
        assessments,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
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
      const [assessment] = await db
        .select()
        .from(whs_risk_assessments)
        .where(sql`${whs_risk_assessments.id} = ${id}`);

      if (!assessment) {
        return res.status(404).json({ message: 'Risk assessment not found' });
      }

      // Parse the hazards JSON if it exists
      if (assessment.hazards) {
        try {
          // If it's a string, parse it; otherwise, leave it as is
          if (typeof assessment.hazards === 'string') {
            assessment.hazards = JSON.parse(assessment.hazards);
          }
        } catch (parseError) {
          console.error('Error parsing hazards JSON:', parseError);
          // Set to empty array if parsing fails
          assessment.hazards = [];
        }
      } else {
        assessment.hazards = [];
      }

      // Get documents
      const documents = await db
        .select()
        .from(whs_documents)
        .where(sql`${whs_documents.risk_assessment_id} = ${id}`);

      res.json({
        assessment,
        documents,
      });
    } catch (error) {
      console.error('Error fetching risk assessment:', error);
      res.status(500).json({ message: 'Failed to fetch risk assessment details' });
    }
  });

  // CREATE new risk assessment
  router.post(
    '/risk-assessments',
    hasPermission('whs.create_risk_assessment'),
    async (req, res) => {
      try {
        // Handle hazards data correctly (ensure it's stored as JSON)
        const data = { ...req.body };

        // Make sure hazards is properly formatted as JSON
        if (data.hazards && typeof data.hazards !== 'string') {
          data.hazards = JSON.stringify(data.hazards);
        }

        const validatedData = insertRiskAssessmentSchema.parse(data);

        // Create risk assessment
        const [newAssessment] = await db
          .insert(whs_risk_assessments)
          .values(validatedData)
          .returning();

        res.status(201).json(newAssessment);
      } catch (error) {
        console.error('Error creating risk assessment:', error);
        res.status(400).json({
          message: 'Failed to create risk assessment',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  // UPDATE risk assessment
  router.patch(
    '/risk-assessments/:id',
    hasPermission('whs.update_risk_assessment'),
    async (req, res) => {
      try {
        const id = req.params.id;

        // Ensure risk assessment exists
        const [existingAssessment] = await db
          .select()
          .from(whs_risk_assessments)
          .where(sql`${whs_risk_assessments.id} = ${id}`);

        if (!existingAssessment) {
          return res.status(404).json({ message: 'Risk assessment not found' });
        }

        // Handle hazards data correctly (ensure it's stored as JSON)
        const data = { ...req.body };

        // Make sure hazards is properly formatted as JSON
        if (data.hazards && typeof data.hazards !== 'string') {
          data.hazards = JSON.stringify(data.hazards);
        }

        const validatedData = updateRiskAssessmentSchema.parse(data);

        // Update risk assessment
        const [updatedAssessment] = await db
          .update(whs_risk_assessments)
          .set(validatedData)
          .where(sql`${whs_risk_assessments.id} = ${id}`)
          .returning();

        res.json(updatedAssessment);
      } catch (error) {
        console.error('Error updating risk assessment:', error);
        res.status(400).json({
          message: 'Failed to update risk assessment',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  // DELETE risk assessment
  router.delete(
    '/risk-assessments/:id',
    hasPermission('whs.delete_risk_assessment'),
    async (req, res) => {
      try {
        const id = req.params.id;

        // Delete risk assessment
        await db.delete(whs_risk_assessments).where(sql`${whs_risk_assessments.id} = ${id}`);

        res.status(204).end();
      } catch (error) {
        console.error('Error deleting risk assessment:', error);
        res.status(500).json({ message: 'Failed to delete risk assessment' });
      }
    }
  );

  // Add document to risk assessment
  router.post(
    '/risk-assessments/:assessmentId/documents',
    hasPermission('whs.update_risk_assessment'),
    async (req, res) => {
      try {
        const assessmentId = req.params.assessmentId;

        // Ensure risk assessment exists
        const [existingAssessment] = await db
          .select()
          .from(whs_risk_assessments)
          .where(sql`${whs_risk_assessments.id} = ${assessmentId}`);

        if (!existingAssessment) {
          return res.status(404).json({ message: 'Risk assessment not found' });
        }

        const documentData = insertDocumentSchema.parse({
          ...req.body,
          risk_assessment_id: assessmentId,
        });

        // Create document
        const [newDocument] = await db.insert(whs_documents).values(documentData).returning();

        res.status(201).json(newDocument);
      } catch (error) {
        console.error('Error adding document:', error);
        res.status(400).json({ message: 'Failed to add document' });
      }
    }
  );

  // Approve risk assessment
  router.post(
    '/risk-assessments/:id/approve',
    hasPermission('whs.approve_risk_assessment'),
    async (req, res) => {
      try {
        const id = req.params.id;
        const { approverName, approvalNotes } = req.body;

        if (!approverName) {
          return res.status(400).json({ message: 'Approver name is required' });
        }

        // Ensure risk assessment exists
        const [existingAssessment] = await db
          .select()
          .from(whs_risk_assessments)
          .where(sql`${whs_risk_assessments.id} = ${id}`);

        if (!existingAssessment) {
          return res.status(404).json({ message: 'Risk assessment not found' });
        }

        // Update risk assessment with approval info
        const [updatedAssessment] = await db
          .update(whs_risk_assessments)
          .set({
            status: 'completed',
            approver_name: approverName,
            approval_date: new Date(),
            approval_notes: approvalNotes || null,
          })
          .where(sql`${whs_risk_assessments.id} = ${id}`)
          .returning();

        res.json(updatedAssessment);
      } catch (error) {
        console.error('Error approving risk assessment:', error);
        res.status(500).json({
          message: 'Failed to approve risk assessment',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );
}
