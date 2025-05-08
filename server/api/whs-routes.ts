import express from 'express';
import incidentRoutes from './whs/index';
import policyRoutes from './whs/policy-routes';
import inspectionRoutes from './whs/inspection-routes';

const router = express.Router();

// Mount the WHS routes
router.use('/whs', incidentRoutes);
router.use('/whs', policyRoutes);
router.use('/whs', inspectionRoutes);

export default router;