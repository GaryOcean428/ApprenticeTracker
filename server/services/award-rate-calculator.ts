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
  hostEmployers
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
      // Get timesheet and its details
      const [timesheet] = await db.select().from(timesheets).where(eq(timesheets.id, timesheetId));
      
      if (!timesheet) {
        throw new Error(`Timesheet with ID ${timesheetId} not found`);
      }

      // Get all timesheet details
      const details = await db.select().from(timesheetDetails).where(eq(timesheetDetails.timesheetId, timesheetId));
      
      if (details.length === 0) {
        throw new Error(`No timesheet details found for timesheet ID ${timesheetId}`);
      }

      // Get apprentice details including placement
      const [apprentice] = await db.select().from(apprentices).where(eq(apprentices.id, timesheet.apprenticeId));
      
      if (!apprentice) {
        throw new Error(`Apprentice with ID ${timesheet.apprenticeId} not found`);
      }

      // Get placement details to determine applicable award
      const [placement] = await db.select().from(placements).where(eq(placements.id, timesheet.placementId));
      
      if (!placement) {
        throw new Error(`Placement with ID ${timesheet.placementId} not found`);
      }

      // Determine the applicable award and classification for this apprentice
      const apprenticeAward = await this.determineApplicableAward(apprentice.id, placement.id);

      if (!apprenticeAward) {
        throw new Error(`Could not determine applicable award for apprentice ID ${apprentice.id}`);
      }

      // Get public holidays for the timesheet period
      const startDate = new Date(timesheet.weekStarting);
      // Add 6 days to get the end of the week
      const endDate = new Date(timesheet.weekStarting);
      endDate.setDate(endDate.getDate() + 6);

      const publicHolidaysList = await db.select().from(publicHolidays).where(
        and(
          gte(sql`${publicHolidays.holidayDate}::date`, startDate),
          lte(sql`${publicHolidays.holidayDate}::date`, endDate)
        )
      );

      // Calculate pay for each timesheet detail
      let totalBaseAmount = 0;
      let totalPenaltyAmount = 0;
      let totalAllowancesAmount = 0;
      let totalHours = 0;

      const calculationPromises = details.map(async (detail) => {
        // Determine day type (check if it's a public holiday)
        const detailDate = new Date(detail.date);
        const isPublicHoliday = publicHolidaysList.some(
          holiday => new Date(holiday.holidayDate).toDateString() === detailDate.toDateString()
        );

        let dayType: 'weekday' | 'saturday' | 'sunday' | 'public_holiday';
        
        if (isPublicHoliday) {
          dayType = 'public_holiday';
        } else {
          const day = detailDate.getDay();
          if (day === 0) dayType = 'sunday';
          else if (day === 6) dayType = 'saturday';
          else dayType = 'weekday';
        }

        // Create shift details object for calculation
        const shiftDetails: ShiftDetails = {
          date: detailDate,
          startTime: detail.startTime || '09:00', // Default if not provided
          endTime: detail.endTime || '17:00',     // Default if not provided
          breakDuration: Number(detail.breakDuration || 0),
          dayType
        };

        // Calculate pay for this detail
        const calculation = await this.calculateShiftPay(
          apprenticeAward.awardId,
          apprenticeAward.classificationId,
          apprentice.apprenticeshipYear || 1,
          shiftDetails
        );

        // Update the detail with the calculation results
        await db.update(timesheetDetails)
          .set({
            baseRate: String(calculation.baseRate),
            penaltyRate: calculation.penaltyRate ? String(calculation.penaltyRate) : null,
            calculatedAmount: String(calculation.totalAmount),
            dayType: dayType,
            allowances: calculation.allowances.length > 0 ? calculation.allowances : [],
            // If we have penalty info, set the penalty rule ID
            ...(calculation.penaltyMultiplier ? { 
              penaltyRuleId: calculation.appliedRules.includes('penalty') ? 
                apprenticeAward.penaltyRuleId : null 
            } : {}),
            awardRateId: apprenticeAward.payRateId
          })
          .where(eq(timesheetDetails.id, detail.id));

        // Accumulate totals
        totalBaseAmount += calculation.baseAmount;
        totalPenaltyAmount += calculation.penaltyAmount;
        totalAllowancesAmount += calculation.allowances.reduce((sum, allowance) => sum + allowance.amount, 0);
        totalHours += Number(detail.hoursWorked);

        return calculation;
      });

      await Promise.all(calculationPromises);

      // Get award and classification details for the record
      const [awardDetails] = await db.select().from(awards).where(eq(awards.id, apprenticeAward.awardId));
      const [classificationDetails] = await db.select().from(awardClassifications)
        .where(eq(awardClassifications.id, apprenticeAward.classificationId));

      // Create or update timesheet calculation record
      const grossTotal = totalBaseAmount + totalPenaltyAmount + totalAllowancesAmount;

      // Check if a calculation record already exists
      const [existingCalculation] = await db.select()
        .from(timesheetCalculations)
        .where(eq(timesheetCalculations.timesheetId, timesheetId));

      if (existingCalculation) {
        // Update existing record
        await db.update(timesheetCalculations)
          .set({
            totalHours: String(totalHours),
            basePayTotal: String(totalBaseAmount),
            penaltyPayTotal: String(totalPenaltyAmount),
            allowancesTotal: String(totalAllowancesAmount),
            grossTotal: String(grossTotal),
            calculatedAt: new Date(),
            awardName: awardDetails?.name || 'Unknown Award',
            classificationName: classificationDetails?.name || 'Unknown Classification',
            awardCode: awardDetails?.code || 'Unknown Code'
          })
          .where(eq(timesheetCalculations.id, existingCalculation.id));
      } else {
        // Create new record
        await db.insert(timesheetCalculations)
          .values([
            {
              timesheetId: timesheetId,
              totalHours: String(totalHours),
              basePayTotal: String(totalBaseAmount),
              penaltyPayTotal: String(totalPenaltyAmount),
              allowancesTotal: String(totalAllowancesAmount),
              grossTotal: String(grossTotal),
              awardName: awardDetails?.name || 'Unknown Award',
              classificationName: classificationDetails?.name || 'Unknown Classification',
              awardCode: awardDetails?.code || 'Unknown Code'
            }
          ]);
      }

      // Log compliance check
      await db.insert(fairworkComplianceLogs)
        .values({
          employeeId: apprentice.id,
          timesheetId: timesheet.id,
          payRateId: apprenticeAward.payRateId,
          complianceCheck: `Award rate calculated based on ${awardDetails?.name || 'Unknown Award'}`,
          outcome: 'compliant'
        });

      // Update timesheet total hours if needed
      if (totalHours !== Number(timesheet.totalHours)) {
        await db.update(timesheets)
          .set({ totalHours })
          .where(eq(timesheets.id, timesheetId));
      }

      return {
        timesheetId,
        apprenticeId: apprentice.id,
        totalHours,
        basePayTotal: totalBaseAmount,
        penaltyPayTotal: totalPenaltyAmount,
        allowancesTotal: totalAllowancesAmount,
        grossTotal,
        awardName: awardDetails?.name || 'Unknown Award',
        classificationName: classificationDetails?.name || 'Unknown Classification',
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
    apprenticeshipYear: number,
    shiftDetails: ShiftDetails
  ): Promise<CalculationResult> {
    try {
      // Get base pay rate
      const [payRate] = await db.select()
        .from(payRates)
        .where(
          and(
            eq(payRates.classificationId, classificationId),
            eq(payRates.isApprenticeRate, true),
            eq(payRates.apprenticeshipYear, apprenticeshipYear),
            lte(payRates.effectiveFrom, shiftDetails.date),
            or(
              eq(payRates.effectiveTo, null),
              gte(payRates.effectiveTo, shiftDetails.date)
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
              eq(allowanceRules.classificationId, null)
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
              eq(penaltyRules.classificationId, null)
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
    const [hours, minutes] = timeStr.split(':').map(Number);
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
}

// Create and export a singleton instance
export const awardRateCalculator = new AwardRateCalculator();
