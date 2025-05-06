/**
 * Fair Work Data Sync Service
 *
 * This service is responsible for synchronizing data from the Fair Work API
 * and storing it in our local database for improved performance and reliability.
 */

import { db } from "../../db";
import { FairWorkApiClient } from "./api-client";
import logger from "../../utils/logger";
import { 
  awards,
  awardClassifications,
  payRates,
  penaltyRules,
  allowanceRules,
  fairworkComplianceLogs,
  InsertFairworkComplianceLog
} from "@shared/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface SyncOptions {
  forceUpdate?: boolean;
  logResults?: boolean;
  includeAllowances?: boolean;
  includePenalties?: boolean;
  targetAwardCode?: string;
}

export class FairWorkDataSync {
  private apiClient: FairWorkApiClient;

  constructor(apiClient: FairWorkApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Synchronize awards data
   */
  async syncAwards(options: SyncOptions = {}): Promise<void> {
    try {
      logger.info('Starting awards sync...', { options });
      
      // Get all active awards from the API
      const apiAwards = await this.apiClient.getActiveAwards();
      logger.info(`Retrieved ${apiAwards.length} awards from Fair Work API`);
      
      // Process each award
      for (const apiAward of apiAwards) {
        // Check if award already exists
        const [existingAward] = await db
          .select()
          .from(awards)
          .where(eq(awards.code, apiAward.code));
        
        if (existingAward && !options.forceUpdate) {
          logger.debug(`Award ${apiAward.code} already exists, skipping`);
          continue;
        }
        
        if (existingAward) {
          // Update existing award
          await db
            .update(awards)
            .set({
              name: apiAward.name,
              description: apiAward.description || null,
              fairWorkReference: apiAward.fair_work_reference || null,
              publishedYear: apiAward.published_year ? Number(apiAward.published_year) : null,
              effectiveDate: apiAward.effective_date ? new Date(apiAward.effective_date) : null,
              updatedAt: new Date()
            })
            .where(eq(awards.code, apiAward.code));
            
          logger.debug(`Updated award ${apiAward.code}`);
        } else {
          // Insert new award
          await db
            .insert(awards)
            .values({
              code: apiAward.code,
              name: apiAward.name,
              description: apiAward.description || null,
              fairWorkReference: apiAward.fair_work_reference || null,
              publishedYear: apiAward.published_year ? Number(apiAward.published_year) : null,
              effectiveDate: apiAward.effective_date ? new Date(apiAward.effective_date) : null
            });
            
          logger.debug(`Inserted new award ${apiAward.code}`);
        }
        
        // If we're targeting a specific award and this isn't it, skip processing details
        if (options.targetAwardCode && options.targetAwardCode !== apiAward.code) {
          continue;
        }
        
        // Sync classifications for this award
        await this.syncClassifications(apiAward.code, options);
        
        // Sync allowances if requested
        if (options.includeAllowances) {
          await this.syncAllowances(apiAward.code, options);
        }
        
        // Sync penalties if requested
        if (options.includePenalties) {
          await this.syncPenalties(apiAward.code, options);
        }
      }
      
      // Log the sync completion
      if (options.logResults) {
        await this.logSyncCompletion('awards', true);
      }
      
      logger.info('Awards sync completed successfully');
    } catch (error) {
      logger.error('Error syncing awards', { error });
      
      if (options.logResults) {
        await this.logSyncCompletion('awards', false, String(error));
      }
      
      throw error;
    }
  }

  /**
   * Synchronize award classifications
   */
  async syncClassifications(awardCode: string, options: SyncOptions = {}): Promise<void> {
    try {
      logger.info(`Syncing classifications for award ${awardCode}`);
      
      // First, get the award ID from our database
      const [award] = await db
        .select()
        .from(awards)
        .where(eq(awards.code, awardCode));
      
      if (!award) {
        throw new Error(`Award with code ${awardCode} not found in database`);
      }
      
      // Get classifications from the API
      const apiClassifications = await this.apiClient.getAwardClassifications(awardCode);
      logger.info(`Retrieved ${apiClassifications.length} classifications for award ${awardCode}`);
      
      // Process each classification
      for (const apiClassification of apiClassifications) {
        // Check if classification already exists
        const [existingClassification] = await db
          .select()
          .from(awardClassifications)
          .where(
            and(
              eq(awardClassifications.awardId, award.id),
              eq(awardClassifications.code, apiClassification.id)
            )
          );
        
        // For classifications, always determine apprentice status and level
        const isApprentice = (
          apiClassification.name.toLowerCase().includes('apprentice') ||
          apiClassification.level.toLowerCase().includes('apprentice')
        );
        
        // Try to determine apprenticeship year from the name/level
        let apprenticeshipYear: number | null = null;
        
        if (isApprentice) {
          const yearMatch = apiClassification.name.match(/year (\d+)/i) || 
                        apiClassification.level.match(/year (\d+)/i);
          
          if (yearMatch && yearMatch[1]) {
            apprenticeshipYear = parseInt(yearMatch[1], 10);
          }
        }
        
        if (existingClassification && !options.forceUpdate) {
          logger.debug(`Classification ${apiClassification.id} already exists for award ${awardCode}, skipping`);
          continue;
        }
        
        if (existingClassification) {
          // Update existing classification
          await db
            .update(awardClassifications)
            .set({
              name: apiClassification.name,
              level: apiClassification.level,
              description: apiClassification.description || null,
              isApprentice,
              apprenticeshipYear,
              parentClassificationName: apiClassification.parent_classification_name || null,
              updatedAt: new Date()
            })
            .where(eq(awardClassifications.id, existingClassification.id));
            
          logger.debug(`Updated classification ${apiClassification.id} for award ${awardCode}`);
          
          // Update related pay rates
          await this.syncPayRates(existingClassification.id, apiClassification, options);
        } else {
          // Insert new classification
          const [newClassification] = await db
            .insert(awardClassifications)
            .values({
              awardId: award.id,
              code: apiClassification.id,
              name: apiClassification.name,
              level: apiClassification.level,
              description: apiClassification.description || null,
              isApprentice,
              apprenticeshipYear,
              parentClassificationName: apiClassification.parent_classification_name || null
            })
            .returning();
            
          logger.debug(`Inserted new classification ${apiClassification.id} for award ${awardCode}`);
          
          // Insert related pay rates
          if (newClassification) {
            await this.syncPayRates(newClassification.id, apiClassification, options);
          }
        }
      }
      
      logger.info(`Classification sync completed for award ${awardCode}`);
    } catch (error) {
      logger.error(`Error syncing classifications for award ${awardCode}`, { error });
      throw error;
    }
  }

  /**
   * Synchronize pay rates for a classification
   */
  async syncPayRates(
    classificationId: number, 
    apiClassification: any, 
    options: SyncOptions = {}
  ): Promise<void> {
    // In a real implementation, we would fetch pay rates from the API for this classification
    // and update our database. For simplicity, we'll just use a dummy rate based on apprenticeship year.
    try {
      const [classification] = await db
        .select()
        .from(awardClassifications)
        .where(eq(awardClassifications.id, classificationId));
      
      if (!classification) {
        throw new Error(`Classification with ID ${classificationId} not found`);
      }
      
      // Check if this is an apprentice classification
      if (classification.isApprentice) {
        // Base hourly rate varies by apprenticeship year
        // (simplified logic - real implementation would use API data)
        const year = classification.apprenticeshipYear || 1;
        let hourlyRate = 15.0; // Default starting rate
        
        // Apply simplified progression: 65% in year 1, 75% in year 2, 85% in year 3, 95% in year 4
        switch(year) {
          case 1: hourlyRate = 15.0; break;
          case 2: hourlyRate = 18.5; break;
          case 3: hourlyRate = 22.0; break;
          case 4: hourlyRate = 25.5; break;
          default: hourlyRate = 15.0;
        }
        
        // Check if a rate already exists for this classification and year
        const [existingRate] = await db
          .select()
          .from(payRates)
          .where(
            and(
              eq(payRates.classificationId, classificationId),
              eq(payRates.isApprenticeRate, true),
              eq(payRates.apprenticeshipYear, year)
            )
          );
        
        if (existingRate && !options.forceUpdate) {
          // Rate already exists, skip
          return;
        }
        
        const today = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(today.getFullYear() + 1);
        
        if (existingRate) {
          // Update existing rate
          await db
            .update(payRates)
            .set({
              hourlyRate: hourlyRate.toString(),
              updatedAt: today
            })
            .where(eq(payRates.id, existingRate.id));
            
          logger.debug(`Updated pay rate for classification ${classificationId} year ${year}`);
        } else {
          // Insert new rate
          await db
            .insert(payRates)
            .values({
              classificationId,
              hourlyRate: hourlyRate.toString(),
              effectiveFrom: today,
              effectiveTo: nextYear,
              payRateType: 'award',
              isApprenticeRate: true,
              apprenticeshipYear: year,
              notes: 'Auto-generated from Fair Work sync'
            });
            
          logger.debug(`Inserted pay rate for classification ${classificationId} year ${year}`);
        }
      } else {
        // Non-apprentice rate - simplified placeholder
        const hourlyRate = 27.5;
        
        // Check if a rate already exists for this classification
        const [existingRate] = await db
          .select()
          .from(payRates)
          .where(
            and(
              eq(payRates.classificationId, classificationId),
              eq(payRates.isApprenticeRate, false)
            )
          );
        
        if (existingRate && !options.forceUpdate) {
          // Rate already exists, skip
          return;
        }
        
        const today = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(today.getFullYear() + 1);
        
        if (existingRate) {
          // Update existing rate
          await db
            .update(payRates)
            .set({
              hourlyRate: hourlyRate.toString(),
              updatedAt: today
            })
            .where(eq(payRates.id, existingRate.id));
            
          logger.debug(`Updated pay rate for classification ${classificationId}`);
        } else {
          // Insert new rate
          await db
            .insert(payRates)
            .values({
              classificationId,
              hourlyRate: hourlyRate.toString(),
              effectiveFrom: today,
              effectiveTo: nextYear,
              payRateType: 'award',
              isApprenticeRate: false,
              notes: 'Auto-generated from Fair Work sync'
            });
            
          logger.debug(`Inserted pay rate for classification ${classificationId}`);
        }
      }
    } catch (error) {
      logger.error(`Error syncing pay rates for classification ${classificationId}`, { error });
      throw error;
    }
  }

  /**
   * Synchronize allowances for an award
   */
  async syncAllowances(awardCode: string, options: SyncOptions = {}): Promise<void> {
    try {
      logger.info(`Syncing allowances for award ${awardCode}`);
      
      // First, get the award ID from our database
      const [award] = await db
        .select()
        .from(awards)
        .where(eq(awards.code, awardCode));
      
      if (!award) {
        throw new Error(`Award with code ${awardCode} not found in database`);
      }
      
      // Get allowances from the API
      // Combine both wage and expense allowances
      const wageAllowances = await this.apiClient.getWageAllowances();
      const expenseAllowances = await this.apiClient.getExpenseAllowances();

      // Filter only allowances for this award
      const awardWageAllowances = wageAllowances.filter(a => a.code === awardCode);
      const awardExpenseAllowances = expenseAllowances.filter(a => a.code === awardCode);
      
      logger.info(`Retrieved ${awardWageAllowances.length} wage allowances and ${awardExpenseAllowances.length} expense allowances for award ${awardCode}`);
      
      // Handle wage allowances
      for (const allowance of awardWageAllowances) {
        await this.processAllowance(award.id, allowance, 'wage', options);
      }
      
      // Handle expense allowances
      for (const allowance of awardExpenseAllowances) {
        await this.processAllowance(award.id, allowance, 'expense', options);
      }
      
      logger.info(`Allowance sync completed for award ${awardCode}`);
    } catch (error) {
      logger.error(`Error syncing allowances for award ${awardCode}`, { error });
      throw error;
    }
  }

  /**
   * Process a single allowance
   */
  private async processAllowance(
    awardId: number, 
    allowance: any, 
    allowanceType: 'wage' | 'expense',
    options: SyncOptions = {}
  ): Promise<void> {
    try {
      // Determine payment frequency type
      let paymentType = 'per_week';
      
      if (allowance.payment_frequency) {
        const frequency = allowance.payment_frequency.toLowerCase();
        if (frequency.includes('hour')) {
          paymentType = 'per_hour';
        } else if (frequency.includes('day')) {
          paymentType = 'per_day';
        } else if (frequency.includes('shift')) {
          paymentType = 'per_shift';
        } else if (frequency.includes('meal')) {
          paymentType = 'per_meal';
        }
      }
      
      // Check if allowance already exists
      const allowanceName = allowance.allowance || 'Unknown Allowance';
      
      const [existingAllowance] = await db
        .select()
        .from(allowanceRules)
        .where(
          and(
            eq(allowanceRules.awardId, awardId),
            eq(allowanceRules.allowanceName, allowanceName)
          )
        );
      
      if (existingAllowance && !options.forceUpdate) {
        logger.debug(`Allowance ${allowanceName} already exists for award ${awardId}, skipping`);
        return;
      }
      
      // Extract allowance amount
      const allowanceAmount = parseFloat(allowance.allowance_amount) || 0;
      
      if (existingAllowance) {
        // Update existing allowance
        await db
          .update(allowanceRules)
          .set({
            allowanceAmount: allowanceAmount.toString(),
            allowanceType: paymentType,
            notes: `Last updated via Fair Work sync on ${new Date().toISOString()}`,
            updatedAt: new Date()
          })
          .where(eq(allowanceRules.id, existingAllowance.id));
          
        logger.debug(`Updated allowance ${allowanceName} for award ${awardId}`);
      } else {
        // Insert new allowance
        await db
          .insert(allowanceRules)
          .values({
            awardId,
            allowanceName,
            allowanceAmount: allowanceAmount.toString(),
            allowanceType: paymentType,
            notes: `${allowanceType.toUpperCase()} allowance - Imported from Fair Work API`
          });
          
        logger.debug(`Inserted new allowance ${allowanceName} for award ${awardId}`);
      }
    } catch (error) {
      logger.error('Error processing allowance', { error, awardId, allowance });
      throw error;
    }
  }

  /**
   * Synchronize penalties for an award
   */
  async syncPenalties(awardCode: string, options: SyncOptions = {}): Promise<void> {
    try {
      logger.info(`Syncing penalties for award ${awardCode}`);
      
      // First, get the award ID from our database
      const [award] = await db
        .select()
        .from(awards)
        .where(eq(awards.code, awardCode));
      
      if (!award) {
        throw new Error(`Award with code ${awardCode} not found in database`);
      }
      
      // Get penalties from the API
      const penalties = await this.apiClient.getPenalties();
      
      // Filter penalties for this award
      const awardPenalties = penalties.filter(p => p.code === awardCode);
      logger.info(`Retrieved ${awardPenalties.length} penalties for award ${awardCode}`);
      
      // Process each penalty
      for (const penalty of awardPenalties) {
        await this.processPenalty(award.id, penalty, options);
      }
      
      logger.info(`Penalty sync completed for award ${awardCode}`);
    } catch (error) {
      logger.error(`Error syncing penalties for award ${awardCode}`, { error });
      throw error;
    }
  }

  /**
   * Process a single penalty
   */
  private async processPenalty(
    awardId: number, 
    penalty: any,
    options: SyncOptions = {}
  ): Promise<void> {
    try {
      // Extract penalty details
      const penaltyName = penalty.penalty_description || 'Unknown Penalty';
      let multiplier = parseFloat(penalty.rate) || 1.0;
      
      // Convert from percentage if needed
      if (multiplier > 2) { // Assuming anything over 200% is actually a percentage
        multiplier = multiplier / 100;
      }
      
      // Determine penalty type
      let penaltyType = 'weekday';
      const description = (penalty.penalty_description || '').toLowerCase();
      
      if (description.includes('saturday')) {
        penaltyType = 'saturday';
      } else if (description.includes('sunday')) {
        penaltyType = 'sunday';
      } else if (description.includes('public holiday')) {
        penaltyType = 'public_holiday';
      } else if (description.includes('overtime')) {
        penaltyType = 'overtime';
      }
      
      // Check if penalty already exists
      const [existingPenalty] = await db
        .select()
        .from(penaltyRules)
        .where(
          and(
            eq(penaltyRules.awardId, awardId),
            eq(penaltyRules.penaltyName, penaltyName)
          )
        );
      
      if (existingPenalty && !options.forceUpdate) {
        logger.debug(`Penalty ${penaltyName} already exists for award ${awardId}, skipping`);
        return;
      }
      
      // Determine days of week for this penalty
      const daysOfWeek = [];
      if (penaltyType === 'saturday') {
        daysOfWeek.push(6); // Saturday is day 6 (0-indexed where 0 is Sunday)
      } else if (penaltyType === 'sunday') {
        daysOfWeek.push(0); // Sunday is day 0
      }
      
      if (existingPenalty) {
        // Update existing penalty
        await db
          .update(penaltyRules)
          .set({
            penaltyName,
            penaltyType,
            multiplier: multiplier.toString(),
            daysOfWeek: daysOfWeek.length > 0 ? JSON.stringify(daysOfWeek) : null,
            notes: `Last updated via Fair Work sync on ${new Date().toISOString()}`,
            updatedAt: new Date()
          })
          .where(eq(penaltyRules.id, existingPenalty.id));
          
        logger.debug(`Updated penalty ${penaltyName} for award ${awardId}`);
      } else {
        // Insert new penalty
        await db
          .insert(penaltyRules)
          .values({
            awardId,
            penaltyName,
            penaltyType,
            multiplier: multiplier.toString(),
            daysOfWeek: daysOfWeek.length > 0 ? JSON.stringify(daysOfWeek) : null,
            notes: `Imported from Fair Work API`
          });
          
        logger.debug(`Inserted new penalty ${penaltyName} for award ${awardId}`);
      }
    } catch (error) {
      logger.error('Error processing penalty', { error, awardId, penalty });
      throw error;
    }
  }

  /**
   * Log the completion of a sync operation
   */
  private async logSyncCompletion(
    syncType: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      const logEntry: InsertFairworkComplianceLog = {
        syncType,
        syncDate: new Date(),
        success,
        errorMessage: errorMessage || null,
        recordsProcessed: 0, // Would normally count records
        metadata: {}
      };
      
      await db.insert(fairworkComplianceLogs).values(logEntry);
    } catch (error) {
      logger.error('Error logging sync completion', { error });
      // Don't throw here to avoid breaking the main flow
    }
  }
}

// Create and export a singleton instance
export const fairworkDataSync = (apiClient: FairWorkApiClient) => new FairWorkDataSync(apiClient);
