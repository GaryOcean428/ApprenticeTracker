/**
 * Fair Work Sync Scheduler
 *
 * This service schedules automatic updates of Fair Work data
 * to ensure our system stays up-to-date with the latest rates and rules.
 */

import { FairWorkApiClient } from './api-client';
import { FairWorkDataSync } from './data-sync';
import logger from '../../utils/logger';

// Interval for Fair Work data syncs (in milliseconds)
// Default to weekly (7 days) updates
const DEFAULT_SYNC_INTERVAL = 7 * 24 * 60 * 60 * 1000;

export class FairWorkSyncScheduler {
  private apiClient: FairWorkApiClient;
  private dataSync: FairWorkDataSync;
  private syncTimer?: NodeJS.Timeout;
  private syncInterval: number;
  private lastSyncTime?: Date;

  constructor(apiClient: FairWorkApiClient, syncInterval?: number) {
    this.apiClient = apiClient;
    this.dataSync = new FairWorkDataSync(apiClient);
    this.syncInterval = syncInterval || DEFAULT_SYNC_INTERVAL;
  }

  /**
   * Start the scheduler - does an immediate sync then schedules regular updates
   */
  async start(): Promise<void> {
    logger.info('Starting Fair Work sync scheduler');

    // Perform an initial sync
    await this.performSync();

    // Schedule regular syncs
    this.schedule();

    // Calculate next sync time for logging
    const nextSyncTime = new Date(Date.now() + this.syncInterval);
    const formattedNextSync = nextSyncTime.toLocaleString();
    logger.info(`Next Fair Work data sync scheduled for ${formattedNextSync}`);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = undefined;
      logger.info('Fair Work sync scheduler stopped');
    }
  }

  /**
   * Schedule the next sync
   */
  private schedule(): void {
    // Clear any existing timer
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    // Schedule the next sync
    this.syncTimer = setTimeout(() => {
      this.performSync()
        .then(() => {
          // Schedule the next sync after this one completes
          this.schedule();
        })
        .catch(error => {
          logger.error('Error in scheduled Fair Work sync', { error });
          // Still schedule the next attempt even if this one failed
          this.schedule();
        });
    }, this.syncInterval);

    // Calculate and log next sync time
    const nextSyncTime = new Date(Date.now() + this.syncInterval);
    logger.info(`Next Fair Work data sync scheduled for ${nextSyncTime.toLocaleString()}`);
  }

  /**
   * Perform a full sync operation
   */
  private async performSync(): Promise<void> {
    try {
      logger.info('Starting scheduled Fair Work data sync');

      // Record the start time
      const startTime = Date.now();

      // First sync awards and classifications
      await this.dataSync.syncAwards({
        forceUpdate: false, // Only update if changed
        logResults: true,
        includeAllowances: true,
        includePenalties: true,
      });

      // Record the completion time
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // Convert to seconds

      this.lastSyncTime = new Date();
      logger.info(`Scheduled Fair Work data sync completed in ${duration.toFixed(2)} seconds`);

      return Promise.resolve();
    } catch (error) {
      logger.error('Error during scheduled Fair Work data sync', { error });
      return Promise.reject(error);
    }
  }

  /**
   * Trigger an immediate sync
   */
  async triggerSync(options?: { forceUpdate?: boolean; targetAwardCode?: string }): Promise<void> {
    try {
      logger.info('Triggering immediate Fair Work data sync', { options });

      // Record the start time
      const startTime = Date.now();

      // Sync awards and classifications
      await this.dataSync.syncAwards({
        forceUpdate: options?.forceUpdate || false,
        logResults: true,
        includeAllowances: true,
        includePenalties: true,
        targetAwardCode: options?.targetAwardCode,
      });

      // Record the completion time
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // Convert to seconds

      this.lastSyncTime = new Date();
      logger.info(`Manual Fair Work data sync completed in ${duration.toFixed(2)} seconds`);
    } catch (error) {
      logger.error('Error during manual Fair Work data sync', { error });
      throw error;
    }
  }

  /**
   * Get the last sync time
   */
  getLastSyncTime(): Date | undefined {
    return this.lastSyncTime;
  }

  /**
   * Get the next scheduled sync time
   */
  getNextSyncTime(): Date | undefined {
    if (!this.lastSyncTime) {
      return undefined;
    }

    return new Date(this.lastSyncTime.getTime() + this.syncInterval);
  }
}

// Factory function to create the scheduler
export const createFairWorkSyncScheduler = (
  apiClient: FairWorkApiClient,
  syncInterval?: number
) => {
  return new FairWorkSyncScheduler(apiClient, syncInterval);
};
