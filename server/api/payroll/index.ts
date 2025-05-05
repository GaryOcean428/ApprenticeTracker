import { Router } from 'express';
import { getAwards, getAwardRates } from './award-rates';
import { getTimesheets, getTimesheet, approveTimesheet, rejectTimesheet } from './timesheets';
import { isAuthenticated, hasRole } from '../auth-routes';
import { hasPermission } from '../../middleware/permissions';

const router = Router();

// Award routes
router.get('/awards', isAuthenticated, hasPermission('view:award_rates'), getAwards);
router.get('/rates/:awardCode', isAuthenticated, hasPermission('view:award_rates'), getAwardRates);

// Timesheet routes
router.get('/timesheets', isAuthenticated, hasPermission('view:timesheets'), getTimesheets);
router.get('/timesheets/:id', isAuthenticated, hasPermission('view:timesheets'), getTimesheet);
router.patch('/timesheets/:id/approve', isAuthenticated, hasPermission('approve:timesheets'), approveTimesheet);
router.patch('/timesheets/:id/reject', isAuthenticated, hasPermission('approve:timesheets'), rejectTimesheet);

// Export the router
export default router;
