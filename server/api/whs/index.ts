import express from 'express';
import { storage } from '../../storage';
import { db } from '../../db';
import { isAuthenticated } from '../../middleware/auth';
import { z } from 'zod';
import { 
  whs_incidents, 
  whs_risk_assessments,
  whs_inspections,
  whs_policies
} from '@shared/schema';
import { eq } from 'drizzle-orm';

// Import specific route handlers
import { setupIncidentRoutes } from './incident-routes';
import { setupRiskAssessmentRoutes } from './risk-assessment-routes';
import { setupInspectionRoutes } from './inspection-routes';
import { setupPolicyRoutes } from './policy-routes';

const router = express.Router();

// Apply authentication middleware to all WHS routes
router.use(isAuthenticated);

// WHS Dashboard statistics
router.get('/statistics', async (req, res) => {
  try {
    // Get count of incidents
    const incidentsCount = await db.select({ count: db.fn.count() }).from(whs_incidents);
    
    // Get count of open issues (incidents with status not 'resolved' or 'closed')
    const openIssuesCount = await db
      .select({ count: db.fn.count() })
      .from(whs_incidents)
      .where(
        eq(whs_incidents.status, 'reported')
      );
    
    // Get count of risk assessments
    const riskAssessmentsCount = await db.select({ count: db.fn.count() }).from(whs_risk_assessments);
    
    // Get count of inspections
    const inspectionsCount = await db.select({ count: db.fn.count() }).from(whs_inspections);
    
    // Count of urgent notifications (high severity incidents that are not closed)
    const urgentNotificationsCount = await db
      .select({ count: db.fn.count() })
      .from(whs_incidents)
      .where(
        eq(whs_incidents.severity, 'high')
      );
    
    const stats = {
      incidents: {
        total: Number(incidentsCount[0]?.count || 0),
        change: 0 // For demo purposes - in production this would calculate the change from previous period
      },
      openIssues: {
        total: Number(openIssuesCount[0]?.count || 0),
        change: 0
      },
      riskAssessments: {
        total: Number(riskAssessmentsCount[0]?.count || 0),
        change: 0
      },
      inspections: {
        total: Number(inspectionsCount[0]?.count || 0),
        change: 0
      },
      urgentNotifications: []
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching WHS statistics:', error);
    res.status(500).json({ message: 'Failed to fetch WHS statistics' });
  }
});

// Set up specific route handlers
setupIncidentRoutes(router);
setupRiskAssessmentRoutes(router);
setupInspectionRoutes(router);
setupPolicyRoutes(router);

export default router;