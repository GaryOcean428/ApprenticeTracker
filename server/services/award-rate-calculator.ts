import { db } from "../db";
import { eq, and, gte, lte, inArray, sql, like, or } from "drizzle-orm";
import { 
  awards, 
  awardClassifications,
  payRates, 
  penaltyRules,
  allowanceRules,
  publicHolidays,
  timesheetDetails,
  timesheets,
  apprentices,
  placements,
  timesheetCalculations,
  fairworkComplianceLogs,
  hostEmployers,
  InsertFairworkComplianceLog
} from "@shared/schema";
import { FairWorkApiClient } from "../services/fairwork/api-client";
import logger from "../utils/logger";

export interface ShiftDetails {
  date: Date;
  startTime: string; // Format: "HH:MM" in 24-hour format
  endTime: string; // Format: "HH:MM" in 24-hour format
  breakDuration: number; // In hours
  dayType?: 'weekday' | 'saturday' | 'sunday' | 'public_holiday';
}

export interface CalculationResult {
  baseRate: number;
  penaltyRate?: number;
  penaltyMultiplier?: number;
  hoursWorked: number;
  baseAmount: number;
  penaltyAmount: number;
  allowances: Array<{
    name: string;
    amount: number;
    type: string;
  }>;
  totalAmount: number;
  appliedRules: string[];
}

export class AwardRateCalculator {
  private fairworkClient?: FairWorkApiClient;

  constructor(fairworkClient?: FairWorkApiClient) {
    this.fairworkClient = fairworkClient;
  }

  /**
   * Calculate pay for a timesheet based on award rates
   */
  async calculateTimesheetPay(timesheetId: number): Promise<any> {
    try {
      logger.info(`Calculating pay for timesheet ID ${timesheetId}`);
      
      // Get timesheet details
      const [timesheet] = await db
        .select()
        .from(timesheets)
        .where(eq(timesheets.id, timesheetId));

      if (!timesheet) {
        logger.error(`Timesheet with ID ${timesheetId} not found`);
        throw new Error(`Timesheet with ID ${timesheetId} not found`);
      }

      // Get shift details for this timesheet
      const shiftEntries = await db
        .select()
        .from(timesheetDetails)
        .where(eq(timesheetDetails.timesheetId, timesheetId));

      if (!shiftEntries || shiftEntries.length === 0) {
        throw new Error(`No shift entries found for timesheet ID ${timesheetId}`);
      }

      // Calculate pay for each shift
      const shiftResults = [];
      let totalAmount = 0;

      for (const shift of shiftEntries) {
        // Skip if missing required data
        if (!shift.date || !shift.startTime || !shift.endTime) {
          logger.warn('Skipping shift with missing date/time data', { shift });
          continue;
        }

        // Determine day type if not set (basic implementation)
        let dayType = shift.dayType as 'weekday' | 'saturday' | 'sunday' | 'public_holiday' | undefined;
        
        if (!dayType) {
          const shiftDate = new Date(shift.date);
          const day = shiftDate.getDay();
          
          // Check if it's a public holiday
          const [publicHoliday] = await db
            .select()
            .from(publicHolidays)
            .where(eq(publicHolidays.holidayDate, shift.date));

          if (publicHoliday) {
            dayType = 'public_holiday';
          } else if (day === 0) {
            dayType = 'sunday';
          } else if (day === 6) {
            dayType = 'saturday';
          } else {
            dayType = 'weekday';
          }
        }

        // Make sure we handle any null values or conversions for all fields
        const shiftDetails: ShiftDetails = {
          date: new Date(shift.date),
          startTime: shift.startTime || '',
          endTime: shift.endTime || '',
          breakDuration: typeof shift.breakDuration === 'string' ? parseFloat(shift.breakDuration) || 0 : (shift.breakDuration || 0),
          dayType: dayType
        };

        // Get applicable award details from placement/apprentice data
        const applicable = await this.determineApplicableAward(
          timesheet.apprenticeId,
          timesheet.placementId
        );

        if (!applicable) {
          throw new Error(`Could not determine applicable award for apprentice ID ${timesheet.apprenticeId}`);
        }

        // Calculate pay for this shift
        const shiftResult = await this.calculateShiftPay(
          applicable.awardId,
          applicable.classificationId,
          shiftDetails
        );

        shiftResults.push({
          shiftId: shift.id,
          result: shiftResult
        });

        totalAmount += shiftResult.totalAmount;
      }

      // Save calculation result
      const [existingCalculation] = await db
        .select()
        .from(timesheetCalculations)
        .where(eq(timesheetCalculations.timesheetId, timesheetId));

      if (existingCalculation) {
        // Update existing calculation
        await db
          .update(timesheetCalculations)
          .set({
            grossTotal: totalAmount.toString(),
            calculatedAt: new Date()
          })
          .where(eq(timesheetCalculations.id, existingCalculation.id));
      } else {
        // Gather award and classification info
        let awardName = 'Unknown';
        let awardCode = 'Unknown';
        let classificationName = 'Unknown';
        let totalHoursWorked = 0;
        let totalBaseAmount = 0;
        let totalPenaltyAmount = 0;
        let totalAllowancesAmount = 0;
        
        // Get award info
        if (shiftResults.length > 0) {
          // Find applicable award and classification
          const applicable = await this.determineApplicableAward(
            timesheet.apprenticeId,
            timesheet.placementId
          );
          
          if (applicable) {
            const [award] = await db.select().from(awards).where(eq(awards.id, applicable.awardId));
            const [classification] = await db.select().from(awardClassifications).where(eq(awardClassifications.id, applicable.classificationId));
            
            if (award) {
              awardName = award.name;
              awardCode = award.code;
            }
            
            if (classification) {
              classificationName = classification.name;
            }
          }
          
          // Calculate totals from all shifts
          for (const shift of shiftResults) {
            const result = shift.result;
            totalHoursWorked += result.hoursWorked;
            totalBaseAmount += result.baseAmount;
            totalPenaltyAmount += result.penaltyAmount;
            totalAllowancesAmount += result.allowances.reduce((sum, allowance) => sum + allowance.amount, 0);
          }
        }
        
        // Create new calculation
        await db
          .insert(timesheetCalculations)
          .values({
            timesheetId,
            totalHours: totalHoursWorked.toString(),
            basePayTotal: totalBaseAmount.toString(),
            penaltyPayTotal: totalPenaltyAmount.toString(),
            allowancesTotal: totalAllowancesAmount.toString(),
            grossTotal: totalAmount.toString(),
            awardName,
            classificationName,
            awardCode
          });
      }

      return {
        timesheetId,
        totalAmount,
        shifts: shiftResults
      };
    } catch (error) {
      logger.error('Error calculating timesheet pay', { error, timesheetId });
      throw error;
    }
  }

  /**
   * Calculate pay for a specific shift based on award rates
   */
  async calculateShiftPay(
    awardId: number,
    classificationId: number,
    shiftDetails: ShiftDetails
  ): Promise<CalculationResult> {
    try {
      logger.info(`Calculating pay for shift on ${shiftDetails.date.toISOString().split('T')[0]}`, {
        awardId, 
        classificationId,
        dayType: shiftDetails.dayType || 'not specified'
      });
      // Get base pay rate for this classification
      // Note: In a production system, this would need to account for the apprentice's year
      // and possibly other factors specific to the award
      const apprenticeshipYear = 1; // Default to 1st year apprentice for simplicity
      const dateStr = shiftDetails.date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

      const [payRate] = await db
        .select()
        .from(payRates)
        .where(
          and(
            eq(payRates.classificationId, classificationId),
            eq(payRates.isApprenticeRate, true),
            eq(payRates.apprenticeshipYear, apprenticeshipYear),
            lte(payRates.effectiveFrom, dateStr),
            or(
              sql`${payRates.effectiveTo} IS NULL`,
              gte(payRates.effectiveTo, dateStr)
            )
          )
        );

      if (!payRate) {
        throw new Error(`No pay rate found for classification ID ${classificationId} and apprenticeship year ${apprenticeshipYear}`);
      }

      const baseRate = Number(payRate.hourlyRate);

      // Calculate working hours
      const startTime = this.parseTime(shiftDetails.startTime);
      const endTime = this.parseTime(shiftDetails.endTime);
      let hoursWorked = (endTime - startTime) / 3600; // Convert seconds to hours

      // Apply break deduction
      if (shiftDetails.breakDuration && shiftDetails.breakDuration > 0) {
        hoursWorked -= shiftDetails.breakDuration;
      }

      if (hoursWorked <= 0) {
        throw new Error('Invalid shift hours. End time must be after start time and account for breaks.');
      }

      // Calculate base amount
      const baseAmount = baseRate * hoursWorked;

      // Get applicable penalties based on day type
      let penaltyRate = 0;
      let penaltyMultiplier = 1;
      let penaltyAmount = 0;
      const appliedRules: string[] = ['base_rate'];

      if (shiftDetails.dayType && shiftDetails.dayType !== 'weekday') {
        const [penalty] = await db.select()
          .from(penaltyRules)
          .where(
            and(
              eq(penaltyRules.awardId, awardId),
              eq(penaltyRules.classificationId, classificationId),
              eq(penaltyRules.penaltyType, shiftDetails.dayType)
            )
          );

        if (penalty) {
          penaltyMultiplier = Number(penalty.multiplier) || 1;
          penaltyRate = baseRate * penaltyMultiplier;
          penaltyAmount = (penaltyRate - baseRate) * hoursWorked; // Only the penalty portion
          appliedRules.push('penalty');
        }
      }

      // Get applicable allowances
      const allowancesList = await db.select()
        .from(allowanceRules)
        .where(
          and(
            eq(allowanceRules.awardId, awardId),
            or(
              eq(allowanceRules.classificationId, classificationId),
              sql`${allowanceRules.classificationId} IS NULL`
            )
          )
        );

      // Calculate allowances
      const allowances = allowancesList.map(allowance => {
        let amount = Number(allowance.allowanceAmount) || 0;
        
        // Adjust amount based on allowance type
        if (allowance.allowanceType === 'per_hour') {
          amount *= hoursWorked;
        } else if (allowance.allowanceType === 'per_shift') {
          // No adjustment needed for per shift allowances
        }

        return {
          name: allowance.allowanceName,
          amount,
          type: allowance.allowanceType || 'fixed'
        };
      });

      // Only include allowances with amount > 0
      const filteredAllowances = allowances.filter(a => a.amount > 0);
      
      if (filteredAllowances.length > 0) {
        appliedRules.push('allowances');
      }

      const totalAllowancesAmount = filteredAllowances.reduce((sum, allowance) => sum + allowance.amount, 0);

      // Calculate total amount
      const totalAmount = baseAmount + penaltyAmount + totalAllowancesAmount;

      return {
        baseRate,
        penaltyRate: penaltyRate || undefined,
        penaltyMultiplier: penaltyMultiplier !== 1 ? penaltyMultiplier : undefined,
        hoursWorked,
        baseAmount,
        penaltyAmount,
        allowances: filteredAllowances,
        totalAmount,
        appliedRules,
      };
    } catch (error) {
      logger.error('Error calculating shift pay', { error, awardId, classificationId, shiftDetails });
      throw error;
    }
  }

  /**
   * Determine which award and classification applies to an apprentice
   */
  async determineApplicableAward(apprenticeId: number, placementId: number): Promise<{
    awardId: number;
    classificationId: number;
    payRateId: number;
    penaltyRuleId?: number;
  } | null> {
    try {
      logger.info(`Determining applicable award for apprentice ID ${apprenticeId}, placement ID ${placementId}`);
      // Get apprentice details including their trade
      const [apprentice] = await db.select().from(apprentices).where(eq(apprentices.id, apprenticeId));
      
      if (!apprentice) {
        throw new Error(`Apprentice with ID ${apprenticeId} not found`);
      }

      // Get placement details to determine host employer
      const [placement] = await db.select().from(placements).where(eq(placements.id, placementId));
      
      if (!placement) {
        throw new Error(`Placement with ID ${placementId} not found`);
      }

      // First, check if the host employer has a specific award code set (simplified approach)
      // In a real implementation, this would check for enterprise agreements, etc.
      const [hostEmployer] = await db.select().from(hostEmployers).where(eq(hostEmployers.id, placement.hostEmployerId));
      
      if (!hostEmployer) {
        throw new Error(`Host employer with ID ${placement.hostEmployerId} not found`);
      }

      // 1. Try to find trade-specific award based on apprentice's trade
      // This is a simplified mapping - real world implementation would be more complex
      let awardCode = '';
      const apprenticeTrade = apprentice.trade.toLowerCase();

      if (apprenticeTrade.includes('electrical') || apprenticeTrade.includes('electronic')) {
        awardCode = 'MA000025'; // Electrical Award
      } else if (apprenticeTrade.includes('building') || apprenticeTrade.includes('construction')) {
        awardCode = 'MA000020'; // Building and Construction Award
      } else if (apprenticeTrade.includes('hospitality') || apprenticeTrade.includes('food')) {
        awardCode = 'MA000009'; // Hospitality Award
      } else {
        // Default to Manufacturing Award if no specific match
        awardCode = 'MA000010'; // Manufacturing Award
      }

      // Get the award ID
      const [award] = await db.select().from(awards).where(eq(awards.code, awardCode));
      
      if (!award) {
        throw new Error(`Award with code ${awardCode} not found`);
      }

      // Get appropriate classification for apprentice
      // In real implementation, this would have more sophisticated mapping logic
      const [classification] = await db.select()
        .from(awardClassifications)
        .where(
          and(
            eq(awardClassifications.awardId, award.id),
            eq(awardClassifications.level, `Apprentice Year ${apprentice.apprenticeshipYear || 1}`)
          )
        );

      let finalClassification = classification;
      
      if (!finalClassification) {
        // Try to find a generic apprentice classification
        const [fallbackClassification] = await db.select()
          .from(awardClassifications)
          .where(
            and(
              eq(awardClassifications.awardId, award.id),
              like(awardClassifications.name, '%Apprentice%')
            )
          );
          
        if (!fallbackClassification) {
          throw new Error(`No suitable classification found for apprentice ID ${apprenticeId} under award ${awardCode}`);
        }
        
        // Use the fallback classification
        finalClassification = fallbackClassification;
      }

      // Get the appropriate pay rate for this classification and apprentice year
      const [payRate] = await db.select()
        .from(payRates)
        .where(
          and(
            eq(payRates.classificationId, finalClassification.id),
            eq(payRates.isApprenticeRate, true),
            eq(payRates.apprenticeshipYear, apprentice.apprenticeshipYear || 1)
          )
        );

      if (!payRate) {
        throw new Error(`No pay rate found for classification ID ${finalClassification.id} and apprenticeship year ${apprentice.apprenticeshipYear || 1}`);
      }

      // Get a weekend penalty rule for this award/classification (if available)
      const [penaltyRule] = await db.select()
        .from(penaltyRules)
        .where(
          and(
            eq(penaltyRules.awardId, award.id),
            or(
              eq(penaltyRules.classificationId, finalClassification.id),
              sql`${penaltyRules.classificationId} IS NULL`
            ),
            eq(penaltyRules.penaltyType, 'saturday')
          )
        );

      return {
        awardId: award.id,
        classificationId: finalClassification.id,
        payRateId: payRate.id,
        penaltyRuleId: penaltyRule?.id
      };
    } catch (error) {
      logger.error('Error determining applicable award', { error, apprenticeId, placementId });
      return null;
    }
  }

  /**
   * Parse time string in HH:MM format to seconds since midnight
   */
  private parseTime(timeStr: string): number {
    if (!timeStr || timeStr.trim() === '') {
      throw new Error('Empty time string provided');
    }
    
    // Safely parse hours and minutes to ensure they're numbers
    const parts = timeStr.split(':');
    if (parts.length !== 2) {
      throw new Error(`Invalid time format: ${timeStr}. Expected format: HH:MM`);
    }
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error(`Invalid time values in: ${timeStr}. Hours must be 0-23, minutes 0-59`);
    }
    
    return (hours * 3600) + (minutes * 60);
  }

  /**
   * Helper function for common SQL conditions
   */
  private or(...conditions: any[]) {
    return conditions.reduce((acc, condition) => {
      if (acc === undefined) return condition;
      return sql`${acc} OR ${condition}`;
    });
  }

  /**
   * Helper function for LIKE operation in Drizzle ORM
   */
  private like(column: any, pattern: string) {
    return sql`${column} LIKE ${pattern}`;
  }

  /**
   * Validate and fetch current modern award rates from Fair Work API
   * Uses the API client to fetch and validate award rates against the current Fair Work Commission data
   */
  async validateAwardRates(awardCode: string, classificationCode: string, hourlyRate: number): Promise<any> {
    logger.info(`Validating award rates: Award Code=${awardCode}, Classification=${classificationCode}, Rate=${hourlyRate}`);
    
    if (!this.fairworkClient) {
      logger.warn('No Fair Work API client provided, skipping external validation');
      return { 
        is_valid: null,
        minimum_rate: null,
        message: 'Fair Work API client not configured'
      };
    }

    try {
      // Format current date as YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      
      // Create validation request
      const validationRequest = {
        award_code: awardCode,
        classification_code: classificationCode,
        hourly_rate: hourlyRate,
        date: today
      };

      // Use the Fair Work API client to validate the rate
      const validationResult = await this.fairworkClient.validateRateTemplate(validationRequest);
      
      // Log the result for auditing purposes using direct column references
      await db.insert(fairworkComplianceLogs).values({
        [fairworkComplianceLogs.awardCode.name]: awardCode,
        [fairworkComplianceLogs.classificationCode.name]: classificationCode,
        [fairworkComplianceLogs.requestedRate.name]: hourlyRate.toString(),
        [fairworkComplianceLogs.minimumRate.name]: validationResult.minimum_rate.toString(),
        [fairworkComplianceLogs.isValid.name]: validationResult.is_valid,
        [fairworkComplianceLogs.message.name]: validationResult.message || '',
        [fairworkComplianceLogs.complianceCheck.name]: JSON.stringify({
          validationRequest,
          validationResponse: validationResult
        }),
        [fairworkComplianceLogs.verifiedDate.name]: new Date(),
        [fairworkComplianceLogs.outcome.name]: validationResult.is_valid ? 'compliant' : 'non_compliant',
        [fairworkComplianceLogs.source.name]: 'fair_work_api'
      });

      return validationResult;
    } catch (error) {
      logger.error('Error validating award rates with Fair Work API', { error, awardCode, classificationCode });
      throw error;
    }
  }

  /**
   * Import modern awards data from Fair Work API
   * This method can be used to periodically sync with the Fair Work API
   */
  async importModernAwardsData(): Promise<{
    awards: number;
    classifications: number;
    rates: number;
  }> {
    logger.info('Starting import of modern awards data from Fair Work API');
    
    if (!this.fairworkClient) {
      logger.error('Fair Work API client not configured for importing data');
      throw new Error('Fair Work API client not configured');
    }

    try {
      // Track import statistics
      const stats = {
        awards: 0,
        classifications: 0,
        rates: 0
      };

      // Fetch all awards from API
      const fairWorkAwards = await this.fairworkClient.getActiveAwards();
      
      // Process each award
      for (const fwAward of fairWorkAwards) {
        // Insert or update award in database
        const [award] = await db
          .insert(awards)
          .values({
            code: fwAward.code,
            name: fwAward.name,
            fairWorkReference: fwAward.fair_work_reference,
            fairWorkTitle: fwAward.fair_work_title || `${fwAward.name} ${fwAward.version_number || ''}`,
            description: fwAward.description,
            effectiveDate: fwAward.effective_date,
            isActive: true
          })
          .onConflictDoUpdate({
            target: awards.code,
            set: {
              name: fwAward.name,
              fairWorkReference: fwAward.fair_work_reference,
              fairWorkTitle: fwAward.fair_work_title || `${fwAward.name} ${fwAward.version_number || ''}`,
              description: fwAward.description,
              effectiveDate: fwAward.effective_date,
              updatedAt: new Date()
            }
          })
          .returning();

        stats.awards++;
        
        // Fetch classifications for this award
        const classifications = await this.fairworkClient.getAwardClassifications(fwAward.code);
        
        for (const classification of classifications) {
          // Skip if not related to this award
          if (classification.award_id !== fwAward.id) continue;
          
          // Insert or update classification
          const [dbClassification] = await db
            .insert(awardClassifications)
            .values({
              awardId: award.id,
              name: classification.name,
              level: classification.level,
              description: classification.description,
              fairWorkLevelCode: classification.fair_work_level_code,
              fairWorkLevelDesc: classification.classification_level ? classification.classification_level.toString() : undefined,
              isActive: true
            })
            .onConflictDoUpdate({
              target: [awardClassifications.awardId, awardClassifications.name, awardClassifications.level],
              set: {
                description: classification.description,
                fairWorkLevelCode: classification.fair_work_level_code,
                fairWorkLevelDesc: classification.classification_level ? classification.classification_level.toString() : undefined,
                updatedAt: new Date()
              }
            })
            .returning();
            
          stats.classifications++;
        }
      }

      logger.info('Successfully imported modern awards data', { stats });
      return stats;
    } catch (error) {
      logger.error('Error importing modern awards data from Fair Work API', { error });
      throw error;
    }
  }
}

// Create and export a singleton instance
export const awardRateCalculator = new AwardRateCalculator();
