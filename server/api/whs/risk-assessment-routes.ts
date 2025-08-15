import type express from 'express';
import { sql } from 'drizzle-orm';
import {
  whs_risk_assessments,
  whs_documents,
  insertRiskAssessmentSchema,
  updateRiskAssessmentSchema,
  insertDocumentSchema,
} from '@shared/schema/whs';
import { db } from '../../db';
import { hasPermission } from '../../middleware/auth';
import { sendEmailNotification } from '../../services/notification-service';
import {
  generateRiskAssessmentPDFReport,
  generateRiskAssessmentExcelReport,
} from '../../services/whs-report-generator';

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

        // Validate workflow transition
        if (existingAssessment.status === 'completed') {
          return res.status(400).json({ message: 'Risk assessment is already approved' });
        }

        // Update risk assessment with approval info
        const [updatedAssessment] = await db
          .update(whs_risk_assessments)
          .set({
            status: 'completed',
            approver_name: approverName,
            approval_date: new Date(),
            approval_notes: approvalNotes || null,
            updated_at: new Date(),
          })
          .where(sql`${whs_risk_assessments.id} = ${id}`)
          .returning();

        // Send approval notifications
        try {
          await sendRiskAssessmentApprovalNotifications(updatedAssessment, approverName);
        } catch (notificationError) {
          console.error('Error sending approval notifications:', notificationError);
        }

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

  // WORKFLOW: Transition risk assessment status
  router.patch(
    '/risk-assessments/:id/status',
    hasPermission('whs.update_risk_assessment'),
    async (req, res) => {
      try {
        const id = req.params.id;
        const { status, notes } = req.body;

        // Validate status transition
        const validStatuses = ['draft', 'in-progress', 'completed', 'review-required', 'expired'];

        if (!validStatuses.includes(status)) {
          return res.status(400).json({ message: 'Invalid status transition' });
        }

        // Get current risk assessment
        const [currentAssessment] = await db
          .select()
          .from(whs_risk_assessments)
          .where(sql`${whs_risk_assessments.id} = ${id}`);

        if (!currentAssessment) {
          return res.status(404).json({ message: 'Risk assessment not found' });
        }

        // Update status
        const updateData: any = {
          status,
          updated_at: new Date(),
        };

        // Set review date if moving to review-required
        if (status === 'review-required' && !currentAssessment.review_date) {
          const reviewDate = new Date();
          reviewDate.setMonth(reviewDate.getMonth() + 12); // Default to 12 months from now
          updateData.review_date = reviewDate;
        }

        const [updatedAssessment] = await db
          .update(whs_risk_assessments)
          .set(updateData)
          .where(sql`${whs_risk_assessments.id} = ${id}`)
          .returning();

        // Send notifications for status changes
        if (status === 'review-required') {
          try {
            await sendRiskAssessmentReviewNotifications(updatedAssessment);
          } catch (notificationError) {
            console.error('Error sending review notifications:', notificationError);
          }
        }

        res.json(updatedAssessment);
      } catch (error) {
        console.error('Error updating risk assessment status:', error);
        res.status(400).json({ message: 'Failed to update risk assessment status' });
      }
    }
  );

  // REPORTS: Generate risk assessment reports
  router.get('/risk-assessments/reports', async (req, res) => {
    try {
      const { format = 'json', startDate, endDate, status, hostEmployerId } = req.query;

      // Build query with filters
      let query = db.select().from(whs_risk_assessments);

      if (startDate) {
        query = query.where(sql`${whs_risk_assessments.assessment_date} >= ${startDate}`);
      }

      if (endDate) {
        query = query.where(sql`${whs_risk_assessments.assessment_date} <= ${endDate}`);
      }

      if (status) {
        query = query.where(sql`${whs_risk_assessments.status} = ${status}`);
      }

      if (hostEmployerId) {
        query = query.where(sql`${whs_risk_assessments.host_employer_id} = ${hostEmployerId}`);
      }

      query = query.orderBy(sql`${whs_risk_assessments.assessment_date} DESC`);

      const assessments = await query;

      if (format === 'pdf') {
        // Generate PDF report
        const pdfBuffer = await generateRiskAssessmentPDFReport(assessments);
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=risk-assessments-report-${new Date().toISOString().split('T')[0]}.pdf`,
        });
        return res.send(pdfBuffer);
      }

      if (format === 'excel') {
        // Generate Excel report
        const excelBuffer = await generateRiskAssessmentExcelReport(assessments);
        res.set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=risk-assessments-report-${new Date().toISOString().split('T')[0]}.xlsx`,
        });
        return res.send(excelBuffer);
      }

      res.json({ assessments, total: assessments.length });
    } catch (error) {
      console.error('Error generating risk assessment report:', error);
      res.status(500).json({ message: 'Failed to generate report' });
    }
  });
}

// Helper function to send risk assessment approval notifications
async function sendRiskAssessmentApprovalNotifications(assessment: any, approverName: string) {
  try {
    console.log(`[WHS_NOTIFICATION] Risk assessment approved: ${assessment.id} by ${approverName}`);

    const emailRecipients: string[] = [];

    // Notify the assessor if available
    if (assessment.assessor_email) {
      emailRecipients.push(assessment.assessor_email);
    }

    // Notify host employer
    if (assessment.host_employer_email) {
      emailRecipients.push(assessment.host_employer_email);
    }

    // Notify WHS administrators
    const whsAdminEmails = process.env.WHS_ADMIN_EMAILS?.split(',') || [];
    emailRecipients.push(...whsAdminEmails.filter(email => email.trim()));

    if (emailRecipients.length > 0) {
      try {
        await sendEmailNotification({
          recipients: emailRecipients,
          subject: `Risk Assessment Approved: ${assessment.title}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0; color: white;">Risk Assessment Approved</h2>
              </div>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; margin: 0;">
                <h3 style="margin-top: 0; color: #1f2937;">${assessment.title}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; font-weight: bold;">Location:</td><td style="padding: 8px 0;">${assessment.location}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Assessment Date:</td><td style="padding: 8px 0;">${new Date(assessment.assessment_date).toLocaleDateString()}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Assessor:</td><td style="padding: 8px 0;">${assessment.assessor_name || 'Unknown'}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Approved By:</td><td style="padding: 8px 0;">${approverName}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Approval Date:</td><td style="padding: 8px 0;">${new Date().toLocaleDateString()}</td></tr>
                  ${assessment.host_employer_name ? `<tr><td style="padding: 8px 0; font-weight: bold;">Host Employer:</td><td style="padding: 8px 0;">${assessment.host_employer_name}</td></tr>` : ''}
                </table>
                ${
                  assessment.approval_notes
                    ? `
                <div style="margin: 15px 0;">
                  <strong>Approval Notes:</strong>
                  <p style="background: white; padding: 15px; border-radius: 4px; margin: 5px 0;">${assessment.approval_notes}</p>
                </div>`
                    : ''
                }
                ${
                  assessment.recommendations
                    ? `
                <div style="margin: 15px 0;">
                  <strong>Recommendations:</strong>
                  <p style="background: white; padding: 15px; border-radius: 4px; margin: 5px 0;">${assessment.recommendations}</p>
                </div>`
                    : ''
                }
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                This risk assessment has been approved and is now in effect.
              </p>
            </div>
          `,
          textContent: `Risk Assessment Approved\n\nTitle: ${assessment.title}\nLocation: ${assessment.location}\nApproved By: ${approverName}\nApproval Date: ${new Date().toLocaleDateString()}`,
        });
        console.log(
          `Risk assessment approval notifications sent to ${emailRecipients.length} recipients`
        );
      } catch (emailError) {
        console.error('Error sending approval email notifications:', emailError);
      }
    }
  } catch (error) {
    console.error('Error sending risk assessment approval notifications:', error);
  }
}

// Helper function to send risk assessment review notifications
async function sendRiskAssessmentReviewNotifications(assessment: any) {
  try {
    console.log(`[WHS_NOTIFICATION] Risk assessment requires review: ${assessment.id}`);

    const emailRecipients: string[] = [];

    // Notify WHS administrators/managers who can conduct reviews
    const whsAdminEmails = process.env.WHS_ADMIN_EMAILS?.split(',') || [];
    emailRecipients.push(...whsAdminEmails.filter(email => email.trim()));

    if (emailRecipients.length > 0) {
      try {
        await sendEmailNotification({
          recipients: emailRecipients,
          subject: `Risk Assessment Review Required: ${assessment.title}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #d97706; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0; color: white;">Risk Assessment Review Required</h2>
              </div>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; margin: 0;">
                <h3 style="margin-top: 0; color: #1f2937;">${assessment.title}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; font-weight: bold;">Location:</td><td style="padding: 8px 0;">${assessment.location}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Assessment Date:</td><td style="padding: 8px 0;">${new Date(assessment.assessment_date).toLocaleDateString()}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Assessor:</td><td style="padding: 8px 0;">${assessment.assessor_name || 'Unknown'}</td></tr>
                  ${assessment.review_date ? `<tr><td style="padding: 8px 0; font-weight: bold;">Review Due:</td><td style="padding: 8px 0;">${new Date(assessment.review_date).toLocaleDateString()}</td></tr>` : ''}
                  ${assessment.host_employer_name ? `<tr><td style="padding: 8px 0; font-weight: bold;">Host Employer:</td><td style="padding: 8px 0;">${assessment.host_employer_name}</td></tr>` : ''}
                </table>
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                This risk assessment requires review and approval. Please log into the ApprenticeTracker system to review.
              </p>
            </div>
          `,
          textContent: `Risk Assessment Review Required\n\nTitle: ${assessment.title}\nLocation: ${assessment.location}\nAssessor: ${assessment.assessor_name}`,
        });
        console.log(
          `Risk assessment review notifications sent to ${emailRecipients.length} recipients`
        );
      } catch (emailError) {
        console.error('Error sending review email notifications:', emailError);
      }
    }
  } catch (error) {
    console.error('Error sending risk assessment review notifications:', error);
  }
}
