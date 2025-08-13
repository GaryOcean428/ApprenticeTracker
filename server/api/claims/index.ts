import type express from 'express';
import { setupClaimsRoutes } from './claims-routes';

export function setupClaimsAPI(router: express.Router) {
  setupClaimsRoutes(router);
}