import { Router } from 'express';
import { getAwards, getAwardRates } from './award-rates';
import { isAuthenticated, hasRole } from '../auth-routes';
import { hasPermission } from '../../middleware/permissions';

const router = Router();

// Protected routes
router.get('/awards', isAuthenticated, hasPermission('view:award_rates'), getAwards);
router.get('/rates/:awardCode', isAuthenticated, hasPermission('view:award_rates'), getAwardRates);

// Export the router
export default router;
