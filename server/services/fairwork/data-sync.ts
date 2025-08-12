/**
 * Fair Work Data Synchronization Service
 *
 * This service is responsible for keeping the local database in sync with
 * Fair Work Commission data, including awards, classifications, and pay rates.
 */

import { sql } from 'drizzle-orm';
import { awards, awardClassifications } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import * as cron from 'node-cron';
import logger from '../../utils/logger';
import { db } from '../../db';
import { FairWorkApiClient } from './api-client';

export class FairWorkDataSync {
  private apiClient: FairWorkApiClient;

  constructor(apiClient?: FairWorkApiClient) {
    this.apiClient =
      apiClient ||
      new FairWorkApiClient({
        baseUrl: process.env.FAIRWORK_API_URL || 'https://api.fairwork.gov.au',
        apiKey: process.env.FAIRWORK_API_KEY || '',
      });
  }

  /**
   * Initialize scheduled sync operations
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Fair Work data sync service...');

      // Run initial sync if database is empty
      const awardCount = await this.getAwardCount();
      if (awardCount === 0) {
        logger.info('No awards found in database - running initial sync...');
        await this.syncAllData();
      }

      // Schedule regular updates
      this.scheduleUpdates();

      logger.info('Fair Work data sync service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Fair Work data sync service', { error });
    }
  }

  /**
   * Schedule periodic updates
   */
  private scheduleUpdates(): void {
    // Schedule daily sync at 1:00 AM
    cron.schedule('0 1 * * *', async () => {
      logger.info('Running scheduled Fair Work data sync...');
      await this.syncAllData();
    });

    // Schedule weekly full refresh on Sundays at 2:00 AM
    cron.schedule('0 2 * * 0', async () => {
      logger.info('Running full Fair Work data refresh...');
      await this.syncAllData(true);
    });
  }

  /**
   * Sync all Fair Work data including awards, classifications, and pay rates
   */
  async syncAllData(forceRefresh: boolean = false): Promise<void> {
    try {
      logger.info(`Starting sync of all Fair Work data (force: ${forceRefresh})`);

      // Sync awards first (parent records)
      await this.syncAwards(forceRefresh);

      // Get all awards to sync their classifications and rates
      const allAwards = await db.select().from(awards);

      for (const award of allAwards) {
        // Sync classifications for this award
        await this.syncAwardClassifications(award.code, award.id, forceRefresh);

        // Sync pay rates for this award
        await this.syncPayRates(award.code, forceRefresh);
      }

      logger.info('Successfully completed sync of all Fair Work data');
    } catch (error) {
      logger.error('Failed to sync Fair Work data', { error });
    }
  }

  /**
   * Sync awards from Fair Work API
   */
  async syncAwards(forceRefresh: boolean = false): Promise<void> {
    try {
      logger.info('Syncing awards from Fair Work API...');

      // Get all awards from Fair Work API
      const fairWorkAwards = await this.apiClient.getActiveAwards();

      if (fairWorkAwards.length === 0) {
        logger.warn('No awards received from Fair Work API');
        return;
      }

      logger.info(`Received ${fairWorkAwards.length} awards from Fair Work API`);

      // For each award, insert or update in the database
      let inserted = 0;
      let updated = 0;

      for (const fairWorkAward of fairWorkAwards) {
        try {
          // Check if this award exists
          const existingAwards = await db
            .select()
            .from(awards)
            .where(eq(awards.code, fairWorkAward.code));

          if (existingAwards.length === 0) {
            // Insert new award
            await db.insert(awards).values({
              code: fairWorkAward.code,
              name: fairWorkAward.name,
              fairWorkReference: fairWorkAward.fair_work_reference || null,
              fairWorkTitle: fairWorkAward.fair_work_title || null,
              description: fairWorkAward.description || null,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            inserted++;
          } else if (forceRefresh) {
            // Update existing award if forced
            await db
              .update(awards)
              .set({
                name: fairWorkAward.name,
                fairWorkReference: fairWorkAward.fair_work_reference || null,
                fairWorkTitle: fairWorkAward.fair_work_title || null,
                description: fairWorkAward.description || null,
                updatedAt: new Date(),
              })
              .where(eq(awards.code, fairWorkAward.code));
            updated++;
          }
        } catch (awardError) {
          logger.error(`Error processing award ${fairWorkAward.code}`, { error: awardError });
        }
      }

      logger.info(`Award sync completed. Inserted: ${inserted}, Updated: ${updated}`);
    } catch (error) {
      logger.error('Failed to sync awards', { error });
    }
  }

  /**
   * Sync classifications for a specific award
   */
  async syncAwardClassifications(
    awardCode: string,
    awardId: number,
    forceRefresh: boolean = false
  ): Promise<void> {
    try {
      logger.info(`Syncing classifications for award ${awardCode}...`);

      // Get classifications from Fair Work API
      const classifications = await this.apiClient.getAwardClassifications(awardCode);

      if (classifications.length === 0) {
        logger.warn(`No classifications received from Fair Work API for award ${awardCode}`);
        return;
      }

      logger.info(`Received ${classifications.length} classifications for award ${awardCode}`);

      // For each classification, insert or update in the database
      let inserted = 0;
      let updated = 0;

      for (const classification of classifications) {
        try {
          // Check if this classification exists
          const existingClassifications = await db
            .select()
            .from(awardClassifications)
            .where(
              and(
                eq(awardClassifications.awardId, awardId),
                eq(
                  awardClassifications.fairWorkLevelCode,
                  classification.fair_work_level_code || ''
                )
              )
            );

          if (existingClassifications.length === 0) {
            // Insert new classification
            await db.insert(awardClassifications).values({
              awardId: awardId,
              name: classification.name,
              level: classification.level || '1',
              fairWorkLevelCode: classification.fair_work_level_code || null,
              fairWorkLevelDesc: classification.description || null,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            inserted++;
          } else if (forceRefresh) {
            // Update existing classification if forced
            await db
              .update(awardClassifications)
              .set({
                name: classification.name,
                level: classification.level || '1',
                fairWorkLevelDesc: classification.description || null,
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(awardClassifications.awardId, awardId),
                  eq(
                    awardClassifications.fairWorkLevelCode,
                    classification.fair_work_level_code || ''
                  )
                )
              );
            updated++;
          }
        } catch (classError) {
          logger.error(`Error processing classification for award ${awardCode}`, {
            error: classError,
          });
        }
      }

      logger.info(
        `Classification sync completed for award ${awardCode}. Inserted: ${inserted}, Updated: ${updated}`
      );
    } catch (error) {
      logger.error(`Failed to sync classifications for award ${awardCode}`, { error });
    }
  }

  /**
   * Sync pay rates for a specific award
   */
  async syncPayRates(awardCode: string, forceRefresh: boolean = false): Promise<void> {
    try {
      logger.info(`Syncing pay rates for award ${awardCode}...`);

      // Get pay rates from Fair Work API
      const payRatesData = await this.apiClient.getPayRates(awardCode);

      if (payRatesData.length === 0) {
        logger.warn(`No pay rates received from Fair Work API for award ${awardCode}`);
        return;
      }

      logger.info(`Received ${payRatesData.length} pay rates for award ${awardCode}`);

      // Get classifications for this award to match with pay rates
      const classifications = await db
        .select()
        .from(awardClassifications)
        .innerJoin(awards, eq(awardClassifications.awardId, awards.id))
        .where(eq(awards.code, awardCode));

      // For each pay rate, insert if it doesn't exist
      let inserted = 0;

      for (const rate of payRatesData) {
        try {
          // Find matching classification
          const matchingClassifications = classifications.filter(
            c => c.award_classifications.fairWorkLevelCode === rate.classification_id
          );

          if (matchingClassifications.length === 0) {
            logger.warn(`No matching classification found for rate ${rate.id}`);
            continue;
          }

          const classificationId = matchingClassifications[0].award_classifications.id;

          // Check if this rate already exists
          const effectiveFrom = new Date(rate.effective_from).toISOString().split('T')[0];
          const rateQuery = sql`
            SELECT * FROM pay_rates
            WHERE classification_id = ${classificationId}
              AND effective_from = ${effectiveFrom}
              AND is_apprentice_rate = ${rate.is_apprentice_rate || false}
          `;

          const existingRates = await db.execute(rateQuery);

          if (existingRates.rows.length === 0 || forceRefresh) {
            // Insert new pay rate
            const insertQuery = sql`
              INSERT INTO pay_rates (
                classification_id, hourly_rate, effective_from, 
                effective_to, source, is_apprentice_rate,
                apprenticeship_year, pay_rate_type
              ) VALUES (
                ${classificationId},
                ${rate.hourly_rate.toString()},
                ${effectiveFrom},
                ${rate.effective_to ? new Date(rate.effective_to).toISOString().split('T')[0] : null},
                'fairwork_api',
                ${rate.is_apprentice_rate || false},
                ${rate.apprenticeship_year || null},
                ${'Standard'}
              )
            `;

            await db.execute(insertQuery);
            inserted++;
          }
        } catch (rateError) {
          logger.error(`Error processing pay rate for award ${awardCode}`, { error: rateError });
        }
      }

      logger.info(`Pay rate sync completed for award ${awardCode}. Inserted: ${inserted}`);
    } catch (error) {
      logger.error(`Failed to sync pay rates for award ${awardCode}`, { error });
    }
  }

  /**
   * Get count of awards in the database
   */
  private async getAwardCount(): Promise<number> {
    const result = await db.select({ count: sql`COUNT(*)` }).from(awards);
    if (result[0] && result[0].count) {
      return parseInt(String(result[0].count));
    }
    return 0;
  }
}

// Export a singleton instance
export const fairWorkDataSync = new FairWorkDataSync();
