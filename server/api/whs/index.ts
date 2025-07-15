import express from 'express';
import { setupIncidentRoutes } from './incident-routes';
import { setupRiskAssessmentRoutes } from './risk-assessment-routes';
import { setupInspectionRoutes } from './inspection-routes';
import { setupPolicyRoutes } from './policy-routes';

export function setupWhsRoutes(app: express.Router): void {
  const whsRouter = express.Router();

  // Setup sub-routes
  setupIncidentRoutes(whsRouter);
  setupRiskAssessmentRoutes(whsRouter);
  setupInspectionRoutes(whsRouter);
  setupPolicyRoutes(whsRouter);

  // Register WHS router
  app.use('/whs', whsRouter);
}
