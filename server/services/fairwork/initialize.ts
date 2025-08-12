/**
 * Fair Work Services Initializer
 *
 * This file initializes all Fair Work-related services
 */

import logger from '../../utils/logger';
import { AwardMonitorService } from './award-monitor';

// Initialize the Award Monitor Service
export function initializeFairWorkServices(): void {
  try {
    logger.info('Initializing Fair Work services');

    // Create and initialize the award monitor service
    const awardMonitor = new AwardMonitorService();
    awardMonitor.initialize();

    logger.info('Fair Work services initialized successfully');
  } catch (error) {
    logger.error('Error initializing Fair Work services', { error });
  }
}
