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
    try {
      logger.info(`Fetching actual pay rates from Fair Work API for classification ${classificationId}`);
      
      const [classification] = await db
        .select()
        .from(awardClassifications)
        .where(eq(awardClassifications.id, classificationId));
      
      if (!classification) {
        throw new Error(`Classification with ID ${classificationId} not found`);
      }
      
      // Get the award for this classification
      const [award] = await db
        .select()
        .from(awards)
        .where(eq(awards.id, classification.awardId));
      
      if (!award) {
        throw new Error(`Award not found for classification ${classificationId}`);
      }
      
      // Calculate base rate using the Fair Work API
      // The API requires the classification code to calculate the appropriate rate
      const calculatedRate = await this.apiClient.calculateBaseRate(classification.code);
      
      if (!calculatedRate) {
        logger.warn(`Could not get base rate from Fair Work API for classification ${classification.code}. Using fallback method.`);
        // Fallback to award-specific calculation based on classification attributes
        await this.calculateFallbackRate(classification, award);
        return;
      }
      
      logger.info(`Received base rate of $${calculatedRate} for classification ${classification.name}`);
      
      // Check if this is an apprentice classification
      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);
      
      if (classification.isApprentice) {
        const year = classification.apprenticeshipYear || 1;
        
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
        
        if (existingRate) {
          // Update existing rate
          await db
            .update(payRates)
            .set({
              hourlyRate: calculatedRate.toString(),
              updatedAt: today
            })
            .where(eq(payRates.id, existingRate.id));
            
          logger.debug(`Updated pay rate for apprentice classification ${classification.name} year ${year} to $${calculatedRate}`);
        } else {
          // Insert new rate
          await db
            .insert(payRates)
            .values({
              classificationId,
              hourlyRate: calculatedRate.toString(),
              effectiveFrom: today,
              effectiveTo: nextYear,
              payRateType: 'award',
              isApprenticeRate: true,
              apprenticeshipYear: year,
              notes: 'Updated from Fair Work API'
            });
            
          logger.debug(`Inserted pay rate for apprentice classification ${classification.name} year ${year}: $${calculatedRate}`);
        }
      } else {
        // Handle non-apprentice rate
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
        
        if (existingRate) {
          // Update existing rate
          await db
            .update(payRates)
            .set({
              hourlyRate: calculatedRate.toString(),
              updatedAt: today
            })
            .where(eq(payRates.id, existingRate.id));
            
          logger.debug(`Updated pay rate for classification ${classification.name} to $${calculatedRate}`);
        } else {
          // Insert new rate
          await db
            .insert(payRates)
            .values({
              classificationId,
              hourlyRate: calculatedRate.toString(),
              effectiveFrom: today,
              effectiveTo: nextYear,
              payRateType: 'award',
              isApprenticeRate: false,
              notes: 'Updated from Fair Work API'
            });
            
          logger.debug(`Inserted pay rate for classification ${classification.name}: $${calculatedRate}`);
        }
      }
    } catch (error) {
      logger.error(`Error syncing pay rates for classification ${classificationId}`, { error });
      throw error;
    }
  }
  
  /**
   * Calculate a fallback rate when the API doesn't provide one
   */
  private async calculateFallbackRate(
    classification: any,
    award: any
  ): Promise<void> {
    try {
      logger.info(`Using fallback rate calculation for ${classification.name}`);
      
      // Calculate based on apprenticeship year if applicable
      let hourlyRate = 27.5; // Default adult rate
      
      if (classification.isApprentice) {
        const year = classification.apprenticeshipYear || 1;
        
        // These rates are industry standard approximations for apprentices
        // Proper implementation would use formulas from the actual award
        // We're calculating them as a percentage of the standard adult rate
        switch(year) {
          case 1: hourlyRate = 27.5 * 0.55; break; // 55% of adult rate
          case 2: hourlyRate = 27.5 * 0.65; break; // 65% of adult rate 
          case 3: hourlyRate = 27.5 * 0.80; break; // 80% of adult rate
          case 4: hourlyRate = 27.5 * 0.95; break; // 95% of adult rate
          default: hourlyRate = 27.5 * 0.55; // Default to first year
        }
      }
      
      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);
      
      // Check if a rate already exists
      const [existingRate] = classification.isApprentice ?
        await db
          .select()
          .from(payRates)
          .where(
            and(
              eq(payRates.classificationId, classification.id),
              eq(payRates.isApprenticeRate, true),
              eq(payRates.apprenticeshipYear, classification.apprenticeshipYear || 1)
            )
          ) :
        await db
          .select()
          .from(payRates)
          .where(
            and(
              eq(payRates.classificationId, classification.id),
              eq(payRates.isApprenticeRate, false)
            )
          );
      
      if (existingRate) {
        // Update existing rate
        await db
          .update(payRates)
          .set({
            hourlyRate: hourlyRate.toFixed(2),
            updatedAt: today,
            notes: 'Fallback calculation - API data unavailable'
          })
          .where(eq(payRates.id, existingRate.id));
          
        logger.debug(`Updated fallback pay rate for classification ${classification.name} to $${hourlyRate.toFixed(2)}`);
      } else {
        // Insert new rate
        const values: any = {
          classificationId: classification.id,
          hourlyRate: hourlyRate.toFixed(2),
          effectiveFrom: today,
          effectiveTo: nextYear,
          payRateType: 'award',
          isApprenticeRate: classification.isApprentice,
          notes: 'Fallback calculation - API data unavailable'
        };
        
        if (classification.isApprentice) {
          values.apprenticeshipYear = classification.apprenticeshipYear || 1;
        }
        
        await db
          .insert(payRates)
          .values(values);
          
        logger.debug(`Inserted fallback pay rate for classification ${classification.name}: $${hourlyRate.toFixed(2)}`);
      }
    } catch (error) {
      logger.error(`Error calculating fallback rate for classification ${classification.id}`, { error });
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
      
      // Get allowances from the API for this specific award
      // Using the new award-specific endpoints
      const awardWageAllowances = await this.apiClient.getWageAllowances(awardCode);
      const awardExpenseAllowances = await this.apiClient.getExpenseAllowances(awardCode);
      
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
      
      // Get penalties from the API for this specific award
      // Using the new award-specific endpoint
      const awardPenalties = await this.apiClient.getPenalties(awardCode);
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
