import { Router } from 'express';
import { isAuthenticated } from '../auth-routes';
import { hasPermission } from '../../middleware/permissions';
import {
  getEnrichmentPrograms,
  getEnrichmentProgram,
  createEnrichmentProgram,
  updateEnrichmentProgram,
  deleteEnrichmentProgram,
} from './programs';

const router = Router();

// Enrichment Programs routes
router.get(
  '/programs',
  isAuthenticated,
  hasPermission('view:enrichment_programs'),
  getEnrichmentPrograms
);
router.get(
  '/programs/:id',
  isAuthenticated,
  hasPermission('view:enrichment_programs'),
  getEnrichmentProgram
);
router.post(
  '/programs',
  isAuthenticated,
  hasPermission('create:enrichment_programs'),
  createEnrichmentProgram
);
router.patch(
  '/programs/:id',
  isAuthenticated,
  hasPermission('edit:enrichment_programs'),
  updateEnrichmentProgram
);
router.delete(
  '/programs/:id',
  isAuthenticated,
  hasPermission('delete:enrichment_programs'),
  deleteEnrichmentProgram
);

// Export the router
export default router;
