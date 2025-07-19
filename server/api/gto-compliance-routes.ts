import { Router } from 'express';
import { db } from '../db';
import {
  gtoComplianceStandards,
  complianceAssessments,
  apprenticeRecruitment,
  apprenticeInduction,
  hostEmployerAgreements,
  complaints,
  appeals,
  gtoOrganizations,
} from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import {
  insertGtoComplianceStandardSchema,
  insertComplianceAssessmentSchema,
} from '@shared/schema';
import { z } from 'zod';

export const gtoComplianceRouter = Router();

// Get all GTO compliance standards
gtoComplianceRouter.get('/standards', async (req, res) => {
  try {
    const standards = await db.select().from(gtoComplianceStandards);
    res.json(standards);
  } catch (error) {
    console.error('Error fetching GTO compliance standards:', error);
    res.status(500).json({ message: 'Error fetching GTO compliance standards' });
  }
});

// Get a single GTO compliance standard by ID
gtoComplianceRouter.get('/standards/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [standard] = await db
      .select()
      .from(gtoComplianceStandards)
      .where(eq(gtoComplianceStandards.id, id));

    if (!standard) {
      return res.status(404).json({ message: 'GTO compliance standard not found' });
    }

    res.json(standard);
  } catch (error) {
    console.error('Error fetching GTO compliance standard:', error);
    res.status(500).json({ message: 'Error fetching GTO compliance standard' });
  }
});

// Create a new GTO compliance standard
gtoComplianceRouter.post('/standards', async (req, res) => {
  try {
    const data = insertGtoComplianceStandardSchema.parse(req.body);
    const [standard] = await db.insert(gtoComplianceStandards).values(data).returning();

    res.status(201).json(standard);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    console.error('Error creating GTO compliance standard:', error);
    res.status(500).json({ message: 'Error creating GTO compliance standard' });
  }
});

// Get compliance assessments for an organization
gtoComplianceRouter.get('/assessments/:organizationId', async (req, res) => {
  try {
    const organizationId = parseInt(req.params.organizationId);
    const assessments = await db
      .select({
        assessment: complianceAssessments,
        standard: gtoComplianceStandards,
      })
      .from(complianceAssessments)
      .innerJoin(
        gtoComplianceStandards,
        eq(complianceAssessments.standardId, gtoComplianceStandards.id)
      )
      .where(eq(complianceAssessments.organizationId, organizationId));

    res.json(assessments);
  } catch (error) {
    console.error('Error fetching compliance assessments:', error);
    res.status(500).json({ message: 'Error fetching compliance assessments' });
  }
});

// Create a new compliance assessment
gtoComplianceRouter.post('/assessments', async (req, res) => {
  try {
    const data = insertComplianceAssessmentSchema.parse(req.body);
    const [assessment] = await db.insert(complianceAssessments).values(data).returning();

    res.status(201).json(assessment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    console.error('Error creating compliance assessment:', error);
    res.status(500).json({ message: 'Error creating compliance assessment' });
  }
});

// Get compliance dashboard data for an organization
gtoComplianceRouter.get('/dashboard/:organizationId', async (req, res) => {
  try {
    const organizationId = parseInt(req.params.organizationId);

    // Get the GTO organization
    const [organization] = await db
      .select()
      .from(gtoOrganizations)
      .where(eq(gtoOrganizations.id, organizationId));

    if (!organization) {
      return res.status(404).json({ message: 'GTO organization not found' });
    }

    // Get all assessments for this organization
    const assessments = await db
      .select({
        assessment: complianceAssessments,
        standard: gtoComplianceStandards,
      })
      .from(complianceAssessments)
      .innerJoin(
        gtoComplianceStandards,
        eq(complianceAssessments.standardId, gtoComplianceStandards.id)
      )
      .where(eq(complianceAssessments.organizationId, organizationId));

    // Get standards by category
    const standardsByCategory = await db
      .select()
      .from(gtoComplianceStandards)
      .groupBy(gtoComplianceStandards.category);

    // Get total standards count
    const standards = await db.select().from(gtoComplianceStandards);

    const totalStandardsCount = standards.length;

    // Calculate compliance statistics
    const compliantAssessments = assessments.filter(
      a => a.assessment.status === 'compliant'
    ).length;
    const atRiskAssessments = assessments.filter(a => a.assessment.status === 'at_risk').length;
    const nonCompliantAssessments = assessments.filter(
      a => a.assessment.status === 'non_compliant'
    ).length;
    const inProgressAssessments = assessments.filter(
      a => a.assessment.status === 'in_progress'
    ).length;

    // Get standards by category with assessment status
    const complianceByCategory: Record<
      string,
      {
        total: number;
        compliant: number;
        atRisk: number;
        nonCompliant: number;
        inProgress: number;
      }
    > = {};

    assessments.forEach(a => {
      const category = a.standard.category;
      if (!complianceByCategory[category]) {
        complianceByCategory[category] = {
          total: 0,
          compliant: 0,
          atRisk: 0,
          nonCompliant: 0,
          inProgress: 0,
        };
      }

      complianceByCategory[category].total++;

      if (a.assessment.status === 'compliant') {
        complianceByCategory[category].compliant++;
      } else if (a.assessment.status === 'at_risk') {
        complianceByCategory[category].atRisk++;
      } else if (a.assessment.status === 'non_compliant') {
        complianceByCategory[category].nonCompliant++;
      } else if (a.assessment.status === 'in_progress') {
        complianceByCategory[category].inProgress++;
      }
    });

    // Get upcoming assessments due in the next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingAssessments = await db
      .select({
        assessment: complianceAssessments,
        standard: gtoComplianceStandards,
      })
      .from(complianceAssessments)
      .innerJoin(
        gtoComplianceStandards,
        eq(complianceAssessments.standardId, gtoComplianceStandards.id)
      )
      .where(
        and(
          eq(complianceAssessments.organizationId, organizationId)
          // Check if dueDate is within the next 30 days
          // This is a simplified version - would need to convert to timestamp comparison in real query
          // db.sql`${complianceAssessments.dueDate} <= ${thirtyDaysFromNow}`
        )
      );

    // Get all complaints and appeals
    const allComplaints = await db.select().from(complaints);

    const allAppeals = await db.select().from(appeals);

    res.json({
      organization,
      complianceStatus: {
        compliant: compliantAssessments,
        atRisk: atRiskAssessments,
        nonCompliant: nonCompliantAssessments,
        inProgress: inProgressAssessments,
        total: assessments.length,
        totalStandards: totalStandardsCount,
      },
      complianceByCategory,
      upcomingAssessments,
      complaints: {
        total: allComplaints.length,
        open: allComplaints.filter(c => c.status === 'open').length,
        underReview: allComplaints.filter(c => c.status === 'under_review').length,
        closed: allComplaints.filter(c => c.status === 'closed').length,
      },
      appeals: {
        total: allAppeals.length,
        pending: allAppeals.filter(a => a.status === 'pending').length,
        approved: allAppeals.filter(a => a.status === 'approved').length,
        rejected: allAppeals.filter(a => a.status === 'rejected').length,
        referred: allAppeals.filter(a => a.status === 'referred').length,
      },
    });
  } catch (error) {
    console.error('Error fetching compliance dashboard data:', error);
    res.status(500).json({ message: 'Error fetching compliance dashboard data' });
  }
});
