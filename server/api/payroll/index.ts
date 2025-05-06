import { Router } from 'express';
import { 
  getAllAwards, 
  getAwardById, 
  getAwardClassifications, 
  getClassificationRates, 
  getAwardPenalties, 
  getAwardAllowances, 
  calculateTimesheetPay, 
  getTimesheetCalculation, 
  validateAwardRate,
  importModernAwardsData
} from './award-rates';
import { getTimesheets, getTimesheet, approveTimesheet, rejectTimesheet } from './timesheets';
import {
  calculateChargeRate,
  getChargeRateCalculation,
  approveChargeRate,
  generateQuote,
  getQuote,
  updateQuoteStatus
} from './charge-rates';
import {
  testCalculateChargeRate,
  testGenerateQuote,
  testGetQuote
} from './test-routes';
import { isAuthenticated, hasRole } from '../auth-routes';
import { hasPermission } from '../../middleware/permissions';

const router = Router();

// Award and payroll routes
router.get('/awards', isAuthenticated, hasPermission('view:award_rates'), getAllAwards);
router.get('/awards/:id', isAuthenticated, hasPermission('view:award_rates'), getAwardById);
router.get('/awards/:awardId/classifications', isAuthenticated, hasPermission('view:award_rates'), getAwardClassifications);
router.get('/classifications/:classificationId/rates', isAuthenticated, hasPermission('view:award_rates'), getClassificationRates);
router.get('/awards/:awardId/penalties', isAuthenticated, hasPermission('view:award_rates'), getAwardPenalties);
router.get('/awards/:awardId/allowances', isAuthenticated, hasPermission('view:award_rates'), getAwardAllowances);

// Fair Work API integration routes
router.post('/awards/validate-rate', isAuthenticated, hasPermission('manage:award_rates'), validateAwardRate);
router.post('/awards/import', isAuthenticated, hasRole('admin'), importModernAwardsData);

// Award calculation routes
router.post('/timesheets/:timesheetId/calculate', isAuthenticated, hasPermission('manage:timesheets'), calculateTimesheetPay);
router.get('/timesheets/:timesheetId/calculation', isAuthenticated, hasPermission('view:timesheets'), getTimesheetCalculation);

// Timesheet routes
router.get('/timesheets', isAuthenticated, hasPermission('view:timesheets'), getTimesheets);
router.get('/timesheets/:id', isAuthenticated, hasPermission('view:timesheets'), getTimesheet);
router.patch('/timesheets/:id/approve', isAuthenticated, hasPermission('approve:timesheets'), approveTimesheet);
router.patch('/timesheets/:id/reject', isAuthenticated, hasPermission('approve:timesheets'), rejectTimesheet);

// Charge Rate & Quote routes
router.post('/charge-rates/calculate', isAuthenticated, hasPermission('manage:charge_rates'), calculateChargeRate);
router.get('/charge-rates/:id', isAuthenticated, hasPermission('view:charge_rates'), getChargeRateCalculation);
router.patch('/charge-rates/:id/approve', isAuthenticated, hasPermission('approve:charge_rates'), approveChargeRate);
router.post('/quotes/generate', isAuthenticated, hasPermission('manage:quotes'), generateQuote);
router.get('/quotes/:id', isAuthenticated, hasPermission('view:quotes'), getQuote);
router.patch('/quotes/:id/status', isAuthenticated, hasPermission('manage:quotes'), updateQuoteStatus);

// Test routes - DEVELOPMENT ONLY (No auth required)
if (process.env.NODE_ENV !== 'production') {
  router.post('/test/charge-rates/calculate', testCalculateChargeRate);
  router.post('/test/quotes/generate', testGenerateQuote);
  router.get('/test/quotes/:id', testGetQuote);
  console.log('WARNING: Test routes enabled in development mode');
}

// Export the router
export default router;
