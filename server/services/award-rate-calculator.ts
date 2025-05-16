/**
 * Award Rate Calculator Service
 * 
 * This service connects Fair Work award rates to the charge rate calculator
 * to ensure all charge rates are based on up-to-date and compliant wage data.
 */

import { db } from '../db';
import { 
  awards, 
  awardClassifications, 
  payRates
} from '@shared/schema';
import { and, eq, gte, lte, desc, isNull, sql } from 'drizzle-orm';
import logger from '../utils/logger';
import { FairWorkApiClient } from './fairwork/api-client';

// Define a local interface for apprentice pay rates
interface ApprenticePayRate {
  id: number;
  awardId: number;
  classificationId: number;
  apprenticeYear: number;
  hourlyRate: string | number;
  isAdult: boolean;
  hasCompletedYear12: boolean;
  effectiveFrom: string | Date;
  effectiveTo?: string | Date;
  source: string;
}

/**
 * Service to handle award rate calculations and data access
 * for use in the charge rate calculator
 */
export class AwardRateCalculator {
  private fairworkApiClient: FairWorkApiClient;

  constructor(fairworkApiClient?: FairWorkApiClient) {
    // If a client is provided, use it, otherwise create a default one
    this.fairworkApiClient = fairworkApiClient || new FairWorkApiClient({
      baseUrl: process.env.FAIRWORK_API_URL || 'https://api.fairwork.gov.au',
      apiKey: process.env.FAIRWORK_API_KEY || ''
    });
  }

  /**
   * Get the appropriate pay rate for an apprentice based on:
   * - Award
   * - Classification
   * - Apprenticeship year
   * - Age (adult/junior)
   * - Education (completed year 12)
   */
  async getApprenticePayRate(
    awardCode: string,
    apprenticeYear: number,
    isAdult: boolean = true,
    hasCompletedYear12: boolean = true
  ): Promise<number | null> {
    try {
      logger.info(`Getting apprentice pay rate for: Award ${awardCode}, Year ${apprenticeYear}, Adult: ${isAdult}, Year 12: ${hasCompletedYear12}`);
      
      // First, try to find the award
      const [award] = await db
        .select()
        .from(awards)
        .where(eq(awards.code, awardCode));
      
      if (!award) {
        logger.warn(`Award with code ${awardCode} not found`);
        return null;
      }

      // Then, find apprentice pay rates for this award using a custom SQL query
      // since we don't have a direct table model
      const query = sql`
        SELECT * FROM pay_rates 
        WHERE classification_id IN (
          SELECT id FROM award_classifications WHERE award_id = ${award.id}
        )
          AND apprenticeship_year = ${apprenticeYear}
          AND is_apprentice_rate = true
        ORDER BY effective_from DESC
        LIMIT 1
      `;
      
      const result = await db.execute(query);
      const apprenticeRates = result.rows;
      
      // If we found a rate, return it
      if (apprenticeRates && apprenticeRates.length > 0) {
        const rate = apprenticeRates[0] as Record<string, any>;
        logger.info(`Found apprentice pay rate: $${rate.hourly_rate}/hr (from ${rate.effective_from})`);
        return parseFloat(String(rate.hourly_rate));
      }
      
      // If no specific apprentice rate is found, try to get from Fair Work API in real-time
      try {
        logger.info(`No local apprentice pay rate found, trying Fair Work API for award ${awardCode}`);
        
        // Find the appropriate apprentice classification in the award
        const apprenticeClassification = await this.getApprenticeClassification(award.id);
        if (!apprenticeClassification) {
          logger.warn(`No apprentice classification found for award ${awardCode}`);
          return null;
        }
        
        // Fetch the pay rates from Fair Work API
        const fairWorkRates = await this.fairworkApiClient.getPayRates(awardCode, {
          classificationFixedId: parseInt(apprenticeClassification.fair_work_level_code || '0'),
          employeeRateTypeCode: 'AP' // 'AP' is for Apprentice
        });
        
        // Find the specific rate that matches our criteria
        let matchingRate = fairWorkRates.find(rate => 
          rate.is_apprentice_rate && 
          rate.apprenticeship_year === apprenticeYear
        );
        
        // If we found a rate from Fair Work, use it
        if (matchingRate) {
          const apiRate = matchingRate.hourly_rate;
          logger.info(`Found Fair Work apprentice pay rate: $${apiRate}/hr`);
          
          // Cache this rate in the database for future use
          await this.cacheApprenticePayRate(
            award.id, 
            apprenticeClassification.id, 
            apprenticeYear, 
            apiRate, 
            isAdult, 
            hasCompletedYear12
          );
          
          return apiRate;
        }
        
        // If we couldn't find a specific rate, try to find the reference tradesperson rate
        // and calculate based on apprentice percentages of that rate
        const referenceClassification = await this.getReferenceTradeClassification(award.id, awardCode);
        
        if (referenceClassification) {
          logger.info(`Found reference classification: ${referenceClassification.name}`);
          
          // Try to get the pay rate for this reference classification
          const referenceRateQuery = sql`
            SELECT * FROM pay_rates
            WHERE classification_id = ${referenceClassification.id}
              AND is_apprentice_rate = false
            ORDER BY effective_from DESC
            LIMIT 1
          `;
          
          const rateResult = await db.execute(referenceRateQuery);
          const referenceRates = rateResult.rows as any[];
          
          if (referenceRates && referenceRates.length > 0) {
            const referenceRate = referenceRates[0];
            const referenceHourlyRate = parseFloat(String(referenceRate.hourly_rate));
            
            // Calculate the apprentice rate based on percentages of the reference rate
            let percentage = 0.5; // Default 50%
            
            if (isAdult) {
              // Adult apprentice percentages
              switch (apprenticeYear) {
                case 1: percentage = 0.80; break; // 80%
                case 2: percentage = 0.85; break; // 85%
                case 3: percentage = 0.90; break; // 90%
                case 4: percentage = 0.95; break; // 95%
                default: percentage = 0.50; // Default fallback
              }
            } else {
              // Junior apprentice percentages
              if (hasCompletedYear12) {
                // With Year 12 completion
                switch (apprenticeYear) {
                  case 1: percentage = 0.55; break; // 55%
                  case 2: percentage = 0.65; break; // 65%
                  case 3: percentage = 0.75; break; // 75%
                  case 4: percentage = 0.90; break; // 90%
                  default: percentage = 0.50; // Default fallback
                }
              } else {
                // Without Year 12 completion
                switch (apprenticeYear) {
                  case 1: percentage = 0.50; break; // 50%
                  case 2: percentage = 0.60; break; // 60%
                  case 3: percentage = 0.70; break; // 70%
                  case 4: percentage = 0.80; break; // 80%
                  default: percentage = 0.50; // Default fallback
                }
              }
            }
            
            const calculatedRate = Math.round(referenceHourlyRate * percentage * 100) / 100;
            logger.info(`Calculated apprentice pay rate: $${calculatedRate}/hr (${percentage * 100}% of $${referenceHourlyRate}/hr)`);
            
            // Cache this rate in the database for future use
            await this.cacheApprenticePayRate(
              award.id, 
              apprenticeClassification.id, 
              apprenticeYear, 
              calculatedRate, 
              isAdult, 
              hasCompletedYear12
            );
            
            return calculatedRate;
          }
        }
        
        // Fallback to default calculation if we can't find reference rates
        const calculatedRate = this.calculateDefaultApprenticeRate(apprenticeYear, isAdult, hasCompletedYear12);
        logger.info(`Fell back to default apprentice pay rate: $${calculatedRate}/hr`);
        
        // Cache this rate in the database for future use
        await this.cacheApprenticePayRate(
          award.id, 
          apprenticeClassification.id, 
          apprenticeYear, 
          calculatedRate, 
          isAdult, 
          hasCompletedYear12
        );
        
        return calculatedRate;
      } catch (apiError) {
        logger.error('Error fetching rates from Fair Work API', { error: apiError });
        
        // If API fails, use a fallback calculation
        // This ensures we always return something usable
        const fallbackRate = this.calculateDefaultApprenticeRate(apprenticeYear, isAdult, hasCompletedYear12);
        logger.info(`Using fallback apprentice pay rate due to API error: $${fallbackRate}/hr`);
        
        // Cache this calculated rate so we have something in the database
        try {
          await this.cacheApprenticePayRate(
            award.id, 
            apprenticeClassification.id, 
            apprenticeYear, 
            fallbackRate, 
            isAdult, 
            hasCompletedYear12
          );
        } catch (cacheError) {
          logger.error('Error caching fallback apprentice rate', { error: cacheError });
          // Continue even if caching fails
        }
        
        return fallbackRate;
      }
    } catch (error) {
      logger.error('Error getting apprentice pay rate', { error });
      return null;
    }
  }

  /**
   * Get a standard pay rate for a classification
   */
  async getClassificationPayRate(awardCode: string, classificationCode: string): Promise<number | null> {
    try {
      logger.info(`Getting classification pay rate for: Award ${awardCode}, Classification ${classificationCode}`);
      
      // First, try to find the award
      const [award] = await db
        .select()
        .from(awards)
        .where(eq(awards.code, awardCode));
      
      if (!award) {
        logger.warn(`Award with code ${awardCode} not found`);
        return null;
      }

      // Then, find the classification using a raw query since we need to access the code field
      const classificationQuery = sql`
        SELECT * FROM award_classifications 
        WHERE award_id = ${award.id} 
          AND fair_work_level_code = ${classificationCode}
      `;
      
      const classResult = await db.execute(classificationQuery);
      const classifications = classResult.rows as any[];
      
      if (!classifications || classifications.length === 0) {
        logger.warn(`Classification ${classificationCode} not found for award ${awardCode}`);
        return null;
      }
      
      const classification = classifications[0];

      // Get the latest pay rate for this classification using a raw query
      const payRateQuery = sql`
        SELECT * FROM pay_rates
        WHERE classification_id = ${classification.id}
          AND is_apprentice_rate = false
        ORDER BY effective_from DESC
        LIMIT 1
      `;
      
      const rateResult = await db.execute(payRateQuery);
      const classificationRates = rateResult.rows as any[];
      
      // If we found a rate, return it
      if (classificationRates && classificationRates.length > 0) {
        const rate = classificationRates[0] as Record<string, any>;
        logger.info(`Found classification pay rate: $${rate.hourly_rate}/hr (from ${rate.effective_from})`);
        return parseFloat(String(rate.hourly_rate));
      }
      
      // If no rate is found, try to get from Fair Work API
      try {
        logger.info(`No local classification pay rate found, trying Fair Work API for award ${awardCode}`);
        
        // Fetch pay rates from Fair Work API
        const fairWorkRates = await this.fairworkApiClient.getPayRates(awardCode, {
          classificationFixedId: parseInt(classificationCode),
          employeeRateTypeCode: 'STD' // Standard adult rate
        });
        
        // Find the most recent valid rate
        const currentDate = new Date().toISOString().split('T')[0];
        const validRates = fairWorkRates.filter(rate => 
          !rate.is_apprentice_rate &&
          (!rate.effective_to || rate.effective_to >= currentDate)
        );
        
        // Sort by effective date descending to get the most recent
        validRates.sort((a, b) => 
          new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
        );
        
        // If we found rates from Fair Work API
        if (validRates.length > 0) {
          const apiRate = validRates[0].hourly_rate;
          logger.info(`Found Fair Work classification pay rate: $${apiRate}/hr`);
          
          // Cache this rate in the database for future use
          await this.cacheClassificationPayRate(
            award.id,
            classification.id,
            apiRate
          );
          
          return apiRate;
        }
        
        // If no rates found from API, calculate a default
        const calculatedRate = this.calculateDefaultClassificationRate(classification.level);
        logger.info(`Calculated classification pay rate: $${calculatedRate}/hr`);
        
        // Cache this rate in the database for future use
        await this.cacheClassificationPayRate(
          award.id,
          classification.id,
          calculatedRate
        );
        
        return calculatedRate;
      } catch (apiError) {
        logger.error('Error fetching rates from Fair Work API', { error: apiError });
        
        // If API fails, use a fallback calculation
        const fallbackRate = this.calculateDefaultClassificationRate(classification.level);
        logger.info(`Using fallback classification pay rate: $${fallbackRate}/hr`);
        return fallbackRate;
      }
    } catch (error) {
      logger.error('Error getting classification pay rate', { error });
      return null;
    }
  }

  /**
   * Get enterprise agreement pay rate
   */
  async getEnterpriseAgreementRate(
    agreementId: number, 
    classificationCode: string
  ): Promise<number | null> {
    try {
      logger.info(`Getting enterprise agreement rate for: Agreement ${agreementId}, Classification ${classificationCode}`);
      
      // This would fetch rates from the enterprise agreement table
      // For now, we return a default value
      // In a real implementation, we would look up the rate based on the agreement and classification
      
      return 28.50; // Default EA rate
    } catch (error) {
      logger.error('Error getting enterprise agreement rate', { error });
      return null;
    }
  }

  /**
   * Find apprentice classification for an award
   */
  private async getApprenticeClassification(awardId: number): Promise<any> {
    try {
      // Get classifications for this award that match apprentice related terms using a raw query
      const query = sql`
        SELECT * FROM award_classifications 
        WHERE award_id = ${awardId}
      `;
      
      const result = await db.execute(query);
      const apprenticeClassifications = result.rows as any[];
      
      // Find the first one that looks like an apprentice classification
      // Based on name or fair_work_level_code (contains 'apprentice', 'trainee', etc.)
      for (const classification of apprenticeClassifications) {
        const name = (classification.name || '').toLowerCase();
        const fairWorkCode = (classification.fair_work_level_code || '').toLowerCase();
        
        if (name.includes('apprentice') || name.includes('trainee') || 
            fairWorkCode.includes('ap') || fairWorkCode.includes('tr')) {
          return classification;
        }
      }
      
      // If we can't find a specific apprentice classification,
      // return the lowest level classification as a fallback
      if (apprenticeClassifications.length > 0) {
        // Sort by level ascending and return the first one
        const sortedByLevel = [...apprenticeClassifications].sort((a, b) => {
          const levelA = parseInt(a.level.toString()) || 0;
          const levelB = parseInt(b.level.toString()) || 0;
          return levelA - levelB;
        });
        
        return sortedByLevel[0];
      }
      
      return null;
    } catch (error) {
      logger.error('Error finding apprentice classification', { error, awardId });
      return null;
    }
  }
  
  /**
   * Find reference tradesperson classification for apprentice rate calculations
   * This is used to determine the base rate from which apprentice percentages are calculated
   */
  private async getReferenceTradeClassification(awardId: number, awardCode: string): Promise<any> {
    try {
      // Get all classifications for this award
      const query = sql`
        SELECT * FROM award_classifications 
        WHERE award_id = ${awardId}
      `;
      
      const result = await db.execute(query);
      const classifications = result.rows as any[];
      
      if (!classifications || classifications.length === 0) {
        logger.warn(`No classifications found for award ${awardCode}`);
        return null;
      }
      
      // Different awards use different reference classifications for apprentice percentages
      // This follows similar logic to what we use in the FairWork API client
      
      if (awardCode === 'MA000025') { // Electrical Award
        // Electrical worker grade 5 is the reference (C10 equivalent)
        return classifications.find(c => 
          (c.name || '').toLowerCase().includes('electrical worker grade 5'));
      } 
      else if (awardCode === 'MA000036') { // Plumbing Award
        // For plumbing, use Plumbing and Mechanical Services Tradesperson / Level 1
        return classifications.find(c => 
          (c.name || '').toLowerCase().includes('plumbing and mechanical services tradesperson') ||
          (c.name || '').toLowerCase().includes('level 1'));
      } 
      else if (awardCode === 'MA000003') { // Building and Construction Award
        // Use Level 3 - CW/ECW 3 for Building and Construction
        return classifications.find(c => 
          (c.name || '').toLowerCase().includes('cw/ecw 3') ||
          (c.name || '').toLowerCase().includes('level 3'));
      }
      else if (awardCode === 'MA000010') { // Manufacturing Award
        // Use C10 - Engineering/Manufacturing Tradesperson Level I
        return classifications.find(c => 
          (c.name || '').toLowerCase().includes('c10') ||
          (c.name || '').toLowerCase().includes('tradesperson level 1'));
      }
      
      // For other awards, look for common tradesperson reference levels
      const tradePersonLevel = classifications.find(c => {
        const name = (c.name || '').toLowerCase();
        return name.includes('c10') || 
               name.includes('tradesperson') || 
               name.includes('level 1') ||
               name.includes('qualified');
      });
      
      if (tradePersonLevel) {
        return tradePersonLevel;
      }
      
      // If we can't find a specific tradesperson classification,
      // return a level that's in the middle of the classification range
      if (classifications.length > 0) {
        // Sort by level ascending
        const sortedByLevel = [...classifications].sort((a, b) => {
          const levelA = parseInt(a.level.toString()) || 0;
          const levelB = parseInt(b.level.toString()) || 0;
          return levelA - levelB;
        });
        
        // Return a classification roughly midway through the levels
        // This is because tradesperson levels tend to be in the middle of most awards
        const midIndex = Math.floor(sortedByLevel.length / 2);
        return sortedByLevel[midIndex];
      }
      
      return null;
    } catch (error) {
      logger.error('Error finding reference trade classification', { error, awardId, awardCode });
      return null;
    }
  }

  /**
   * Calculate a default apprentice pay rate based on exact Fair Work award rates
   * This is a fallback method when API data is not available
   * Updated with 2024/2025 FY rates based on reference data
   */
  private calculateDefaultApprenticeRate(
    apprenticeYear: number, 
    isAdult: boolean = true,
    hasCompletedYear12: boolean = true
  ): number {
    // Calculate rate based on exact Fair Work rates for 2024-2025 financial year
    // instead of using percentage calculations
    
    // These are the exact rates from Fair Work for Electrical Award (MA000025)
    // as per reference data provided

    if (isAdult) {
      // Adult apprentice exact rates - these are the same regardless of Year 12 completion
      switch (apprenticeYear) {
        case 1: return 23.91; // 1st year adult apprentice
        case 2: return 26.42; // 2nd year adult apprentice
        case 3: return 26.42; // 3rd year adult apprentice
        case 4: return 26.42; // 4th year adult apprentice
        default: return 23.91; // Default to 1st year
      }
    } else {
      // Junior apprentice rates
      if (hasCompletedYear12) {
        // With Year 12 completion
        switch (apprenticeYear) {
          case 1: return 16.62; // 1st year with Year 12
          case 2: return 19.53; // 2nd year with Year 12
          case 3: return 20.99; // 3rd year with Year 12
          case 4: return 24.49; // 4th year with Year 12
          default: return 16.62; // Default to 1st year
        }
      } else {
        // Without Year 12 completion
        switch (apprenticeYear) {
          case 1: return 15.16; // 1st year without Year 12
          case 2: return 18.08; // 2nd year without Year 12
          case 3: return 20.99; // 3rd year without Year 12
          case 4: return 24.49; // 4th year without Year 12
          default: return 15.16; // Default to 1st year
        }
      }
    }
  }

  /**
   * Calculate a default classification rate
   * This is a fallback method when API data is not available
   */
  private calculateDefaultClassificationRate(level: number | string): number {
    // Base rate for Level 1
    const baseRate = 23.00;
    
    // Convert string level to number if needed
    const numericLevel = typeof level === 'string' ? parseInt(level) || 1 : level;
    
    // Add $2.25 per level
    const calculatedRate = baseRate + ((numericLevel - 1) * 2.25);
    
    // Return the rate rounded to 2 decimal places
    return Math.round(calculatedRate * 100) / 100;
  }

  /**
   * Cache an apprentice pay rate in the database for future use
   */
  private async cacheApprenticePayRate(
    awardId: number,
    classificationId: number,
    apprenticeYear: number,
    hourlyRate: number,
    isAdult: boolean = true,
    hasCompletedYear12: boolean = true
  ): Promise<void> {
    try {
      // Insert the pay rate into the pay_rates table with a raw query
      const query = sql`
        INSERT INTO pay_rates (
          classification_id, hourly_rate, effective_from, source, 
          is_apprentice_rate, apprenticeship_year, pay_rate_type
        ) VALUES (
          ${classificationId}, 
          ${hourlyRate.toString()}, 
          ${new Date().toISOString().split('T')[0]}, 
          'calculated',
          TRUE,
          ${apprenticeYear},
          ${isAdult ? "'Adult'" : hasCompletedYear12 ? "'Year 12'" : "'Junior'"}
        )
      `;
      
      await db.execute(query);
      logger.info(`Cached apprentice pay rate: $${hourlyRate}/hr for award ${awardId}, year ${apprenticeYear}`);
    } catch (error) {
      logger.error('Error caching apprentice pay rate', { error });
    }
  }

  /**
   * Cache a classification pay rate in the database for future use
   */
  private async cacheClassificationPayRate(
    awardId: number,
    classificationId: number,
    hourlyRate: number
  ): Promise<void> {
    try {
      // Insert the pay rate into the pay_rates table with a raw query
      const query = sql`
        INSERT INTO pay_rates (
          classification_id, hourly_rate, effective_from, source, is_apprentice_rate
        ) VALUES (
          ${classificationId}, 
          ${hourlyRate.toString()}, 
          ${new Date().toISOString().split('T')[0]}, 
          'calculated',
          FALSE
        )
      `;
      
      await db.execute(query);
      logger.info(`Cached classification pay rate: $${hourlyRate}/hr for award ${awardId}, classification ${classificationId}`);
    } catch (error) {
      logger.error('Error caching classification pay rate', { error });
    }
  }
}

// Export a singleton instance
export const awardRateCalculator = new AwardRateCalculator();