import express from 'express';
import { isAuthenticated } from '../../middleware/auth';
import { setupIncidentRoutes } from './incident-routes';
import { setupRiskAssessmentRoutes } from './risk-assessment-routes';
import { setupInspectionRoutes } from './inspection-routes';
import { setupPolicyRoutes } from './policy-routes';

// Create router
const whsRouter = express.Router();

// Apply authentication middleware to all WHS routes
whsRouter.use(isAuthenticated);

// Setup routes
setupIncidentRoutes(whsRouter);
setupRiskAssessmentRoutes(whsRouter);
setupInspectionRoutes(whsRouter);
setupPolicyRoutes(whsRouter);

export default whsRouter;