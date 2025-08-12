import { eq, and, sql, desc } from 'drizzle-orm';
import {
  apprentices,
  placements,
  hostEmployers,
  chargeRateCalculations,
  quotes,
  quoteLineItems,
  awards,
  penaltyRules,
} from '@shared/schema';
import { db } from '../db';
import logger from '../utils/logger';
import { awardRateCalculator } from './award-rate-calculator';

/**
 * Types for charge rate calculations
 */
export interface CostConfig {
  superRate: number; // e.g., 0.115 for 11.5%
  wcRate: number; // workers' compensation rate
  payrollTaxRate: number; // payroll tax rate
  leaveLoading: number; // leave loading percentage
  studyCost: number; // annual study cost
  ppeCost: number; // annual protective clothing cost
  adminRate: number; // administration overhead rate
  defaultMargin: number; // default profit margin
  adverseWeatherDays: number; // days lost to adverse weather
}

export interface WorkConfig {
  hoursPerDay: number;
  daysPerWeek: number;
  weeksPerYear: number;
  annualLeaveDays: number;
  publicHolidays: number;
  sickLeaveDays: number;
  trainingWeeks: number;
}

export interface BillableOptions {
  includeAnnualLeave: boolean;
  includePublicHolidays: boolean;
  includeSickLeave: boolean;
  includeTrainingTime: boolean;
  includeAdverseWeather: boolean;
}

export interface OnCosts {
  superannuation: number;
  workersComp: number;
  payrollTax: number;
  leaveLoading: number;
  studyCost: number;
  ppeCost: number;
  adminCost: number;
}

export interface CalculationResult {
  payRate: number;
  totalHours: number;
  billableHours: number;
  baseWage: number;
  oncosts: OnCosts;
  totalCost: number;
  costPerHour: number;
  chargeRate: number;
  penaltyEstimates?: Record<string, number>;
}

/**
 * Service for calculating host employer charge rates
 * Based on the R8 calculation system
 */
export class ChargeRateCalculator {
  /**
   * Cost configuration for calculating charge rates
   */
  private defaultCostConfig = {
    superRate: 0.115, // 11.5% superannuation
    wcRate: 0.047, // 4.7% workers' compensation
    payrollTaxRate: 0.0485, // 4.85% payroll tax
    leaveLoading: 0.175, // 17.5% leave loading
    studyCost: 850, // $850/year study cost
    ppeCost: 300, // $300/year PPE cost
    adminRate: 0.17, // 17% admin overhead
    defaultMargin: 0.15, // 15% profit margin
    adverseWeatherDays: 5, // 5 days of adverse weather per year
  };

  /**
   * Default work configuration
   */
  private defaultWorkConfig = {
    hoursPerDay: 7.6,
    daysPerWeek: 5,
    weeksPerYear: 52,
    annualLeaveDays: 20,
    publicHolidays: 10,
    sickLeaveDays: 10,
    trainingWeeks: 5,
  };

  /**
   * Default billable options
   */
  private defaultBillableOptions = {
    includeAnnualLeave: false,
    includePublicHolidays: false,
    includeSickLeave: false,
    includeTrainingTime: false,
    includeAdverseWeather: false,
  };

  /**
   * Calculate total annual hours based on work configuration
   */
  calculateTotalAnnualHours(workConfig: any): number {
    return workConfig.hoursPerDay * workConfig.daysPerWeek * workConfig.weeksPerYear;
  }

  /**
   * Calculate billable hours based on work configuration and billable options
   */
  calculateBillableHours(workConfig: any, costConfig: any, billableOptions: any): number {
    let unbilledDays = 0;
    let unbilledWeeks = 0;

    // Only count days/weeks as unbilled if they should NOT be included in billable time
    if (!billableOptions.includeAnnualLeave) {
      unbilledDays += workConfig.annualLeaveDays;
    }
    if (!billableOptions.includePublicHolidays) {
      unbilledDays += workConfig.publicHolidays;
    }
    if (!billableOptions.includeSickLeave) {
      unbilledDays += workConfig.sickLeaveDays;
    }
    if (!billableOptions.includeAdverseWeather) {
      unbilledDays += costConfig.adverseWeatherDays;
    }

    // Convert unbilled days to weeks
    unbilledWeeks += unbilledDays / workConfig.daysPerWeek;

    // Add training weeks if they should not be included
    if (!billableOptions.includeTrainingTime) {
      unbilledWeeks += workConfig.trainingWeeks;
    }

    const billableWeeks = workConfig.weeksPerYear - unbilledWeeks;
    return workConfig.hoursPerDay * workConfig.daysPerWeek * billableWeeks;
  }

  /**
   * Calculate on-costs based on pay rate and configuration
   */
  calculateOnCosts(payRate: number, totalHours: number, config: any): any {
    const baseWage = payRate * totalHours;
    const annualLeaveHours = Math.min(totalHours, 152); // Max 4 weeks at 38 hours/week
    return {
      superannuation: baseWage * config.superRate,
      workersComp: baseWage * config.wcRate,
      payrollTax: baseWage * config.payrollTaxRate,
      leaveLoading: payRate * annualLeaveHours * config.leaveLoading,
      studyCost: config.studyCost,
      ppeCost: config.ppeCost,
      adminCost: baseWage * config.adminRate,
    };
  }

  /**
   * Get penalty rules for an award
   */
  async getPenaltyRules(awardId: number): Promise<any[]> {
    logger.info(`Fetching penalty rules for award ID ${awardId}`);

    try {
      const penalties = await db
        .select()
        .from(penaltyRules)
        .where(eq(penaltyRules.awardId, awardId))
        .orderBy(penaltyRules.penaltyType, desc(penaltyRules.multiplier));

      logger.info(`Found ${penalties.length} penalty rules for award ID ${awardId}`);
      return penalties;
    } catch (error) {
      logger.error('Error fetching penalty rules', { error, awardId });
      return [];
    }
  }

  /**
   * Calculate estimated penalty costs
   * This provides rough estimates of how penalties impact costs
   * for information purposes only - actual costs would be calculated
   * based on timesheet data
   */
  async calculatePenaltyEstimates(
    payRate: number,
    awardId: number
  ): Promise<Record<string, number>> {
    const penalties = await this.getPenaltyRules(awardId);
    const penaltyEstimates: Record<string, number> = {};

    // Calculate penalty costs based on typical distribution assumptions
    // These values would be refined based on actual timesheet data
    const TYPICAL_DISTRIBUTIONS = {
      // Weekend penalties - assume average percentage of weekend work
      weekend: 0.15, // 15% of hours on weekends
      // Public holiday penalties - assume 10 days / ~2 weeks of public holidays per year
      public_holiday: 0.038, // ~3.8% of hours on public holidays
      // Overtime penalties - assume 5% of work is overtime
      overtime: 0.05,
      // Evening shift penalties - assume 10% of work is evenings
      evening_shift: 0.1,
      // Night shift penalties - assume 5% of work is nights
      night_shift: 0.05,
    };

    // Calculate penalty costs for each penalty type
    for (const penalty of penalties) {
      const multiplier = parseFloat(penalty.multiplier.toString());
      const distribution =
        TYPICAL_DISTRIBUTIONS[penalty.penaltyType as keyof typeof TYPICAL_DISTRIBUTIONS] || 0;

      // Calculate penalty cost as: base pay rate * (penalty multiplier - 1) * distribution %
      // We subtract 1 from multiplier because we're only concerned with the extra cost
      const penaltyCost = payRate * (multiplier - 1) * distribution;

      // Store penalty cost estimate by penalty name
      penaltyEstimates[penalty.penaltyName] = parseFloat(penaltyCost.toFixed(2));
    }

    return penaltyEstimates;
  }

  /**
   * Calculate charge rate based on pay rate and configuration
   */
  async calculateChargeRate(
    payRate: number,
    workConfig: any = this.defaultWorkConfig,
    costConfig: any = this.defaultCostConfig,
    billableOptions: any = this.defaultBillableOptions,
    margin: number = this.defaultCostConfig.defaultMargin,
    awardId?: number
  ): Promise<CalculationResult> {
    logger.info(`Calculating charge rate for pay rate: ${payRate}`);

    const totalHours = this.calculateTotalAnnualHours(workConfig);
    const billableHours = this.calculateBillableHours(workConfig, costConfig, billableOptions);
    const baseWage = payRate * totalHours;
    const oncosts = this.calculateOnCosts(payRate, totalHours, costConfig);

    // Type-safe reduce to sum oncosts
    const totalOnCosts: number = Object.values(oncosts).reduce((sum: number, cost: any) => {
      return sum + (typeof cost === 'number' ? cost : 0);
    }, 0);

    // Calculate penalty estimates if an award ID is provided
    let penaltyEstimates: Record<string, number> | undefined;
    if (awardId) {
      try {
        penaltyEstimates = await this.calculatePenaltyEstimates(payRate, awardId);

        // Add an extra 5% to total costs to account for penalty rates
        // This is a simplified estimation - actual costs would come from timesheets
        const penaltyTotal = Object.values(penaltyEstimates).reduce(
          (sum: number, cost: number) => sum + cost,
          0
        );
        logger.info(`Estimated penalty costs: ${penaltyTotal}`);
      } catch (error) {
        logger.warn('Failed to calculate penalty estimates', { error, awardId });
      }
    }

    const totalCost: number = baseWage + totalOnCosts;
    const costPerHour = totalCost / billableHours;
    const chargeRate = costPerHour * (1 + margin);

    return {
      payRate,
      totalHours,
      billableHours,
      baseWage,
      oncosts,
      totalCost,
      costPerHour,
      chargeRate,
      penaltyEstimates,
    };
  }

  /**
   * Calculate and save charge rate for a specific apprentice and host employer
   */
  async calculateAndSaveChargeRate(apprenticeId: number, hostEmployerId: number): Promise<any> {
    try {
      logger.info(
        `Calculating charge rate for apprentice ID ${apprenticeId} and host employer ID ${hostEmployerId}`
      );

      // Get apprentice details including current pay rate
      const [apprentice] = await db
        .select()
        .from(apprentices)
        .where(eq(apprentices.id, apprenticeId));

      if (!apprentice) {
        logger.error(`Apprentice with ID ${apprenticeId} not found`);
        throw new Error(`Apprentice with ID ${apprenticeId} not found`);
      }

      // Get host employer details for any special configurations
      const [hostEmployer] = await db
        .select()
        .from(hostEmployers)
        .where(eq(hostEmployers.id, hostEmployerId));

      if (!hostEmployer) {
        logger.error(`Host employer with ID ${hostEmployerId} not found`);
        throw new Error(`Host employer with ID ${hostEmployerId} not found`);
      }

      // Try to get custom margin and admin rates if they exist in the database
      // Fetch the raw record to check if fields exist
      let customMarginRate = null;
      let customAdminRate = null;
      try {
        const result = await db.execute(sql`
          SELECT 
            CASE WHEN EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'host_employers' AND column_name = 'custom_margin_rate'
            ) THEN (SELECT custom_margin_rate FROM host_employers WHERE id = ${hostEmployerId})
            ELSE NULL
            END as custom_margin_rate,
            
            CASE WHEN EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'host_employers' AND column_name = 'custom_admin_rate'
            ) THEN (SELECT custom_admin_rate FROM host_employers WHERE id = ${hostEmployerId})
            ELSE NULL
            END as custom_admin_rate
        `);

        logger.debug('Custom rates raw query result:', result);

        if (result && result.rows && result.rows.length > 0) {
          logger.debug('Detected values:', result.rows[0]);
          if (
            result.rows[0].custom_margin_rate !== null &&
            result.rows[0].custom_margin_rate !== undefined
          ) {
            customMarginRate = parseFloat(result.rows[0].custom_margin_rate as string);
            logger.debug(`Setting custom margin rate: ${customMarginRate}`);
          }
          if (
            result.rows[0].custom_admin_rate !== null &&
            result.rows[0].custom_admin_rate !== undefined
          ) {
            customAdminRate = parseFloat(result.rows[0].custom_admin_rate as string);
            logger.debug(`Setting custom admin rate: ${customAdminRate}`);
          }
        }
      } catch (error) {
        logger.warn('Could not fetch custom rates, using defaults', { error });
      }

      // Get existing placements to determine if there are any special rate agreements
      const [existingPlacement] = await db
        .select()
        .from(placements)
        .where(
          and(
            eq(placements.apprenticeId, apprenticeId),
            eq(placements.hostEmployerId, hostEmployerId),
            eq(placements.status, 'active')
          )
        );

      // Initialize pay rate to a default value
      let payRate = 25.0; // Default hourly rate
      let awardCode: string | null = null;
      let awardId: number | undefined;
      let apprenticeYear = 1;
      let isAdult = true;
      let hasCompletedYear12 = true;

      // Try to get award ID and code from related tables
      try {
        // Check if there's an award ID directly associated with the placement
        if (existingPlacement) {
          if ('awardId' in existingPlacement && existingPlacement.awardId) {
            awardId = parseInt(existingPlacement.awardId.toString());
            logger.info(`Using award ID ${awardId} from placement`);

            // Fetch award code from the awards table
            const [award] = await db.select().from(awards).where(eq(awards.id, awardId));

            if (award) {
              awardCode = award.code;
              logger.info(`Found award code ${awardCode} for ID ${awardId}`);
            }
          }

          // Get apprentice year and education information if available in placement
          if ('apprenticeYear' in existingPlacement && existingPlacement.apprenticeYear) {
            apprenticeYear = parseInt(existingPlacement.apprenticeYear.toString());
          }

          if ('isAdult' in existingPlacement && existingPlacement.isAdult !== undefined) {
            isAdult = existingPlacement.isAdult === true || existingPlacement.isAdult === 'true';
          }

          if (
            'hasCompletedYear12' in existingPlacement &&
            existingPlacement.hasCompletedYear12 !== undefined
          ) {
            hasCompletedYear12 =
              existingPlacement.hasCompletedYear12 === true ||
              existingPlacement.hasCompletedYear12 === 'true';
          }

          logger.info(
            `Apprentice details: Year ${apprenticeYear}, Adult: ${isAdult}, Year 12: ${hasCompletedYear12}`
          );
        }

        // If no award ID yet, check if apprentice has a training contract with an award
        if (!awardId && apprentice && apprentice.id) {
          // Get apprentice training details
          if ('apprenticeYear' in apprentice && apprentice.apprenticeYear) {
            apprenticeYear = parseInt(apprentice.apprenticeYear.toString());
          }

          if ('isAdult' in apprentice && apprentice.isAdult !== undefined) {
            isAdult = apprentice.isAdult === true || apprentice.isAdult === 'true';
          }

          if ('hasCompletedYear12' in apprentice && apprentice.hasCompletedYear12 !== undefined) {
            hasCompletedYear12 =
              apprentice.hasCompletedYear12 === true || apprentice.hasCompletedYear12 === 'true';
          }

          // Fetch training contract for the apprentice to see if there's an award associated
          const [trainingContract] = await db
            .select()
            .from(placements)
            .where(eq(placements.apprenticeId, apprentice.id))
            .limit(1);

          if (trainingContract && 'awardId' in trainingContract && trainingContract.awardId) {
            awardId = parseInt(trainingContract.awardId.toString());
            logger.info(`Using award ID ${awardId} from training contract`);

            // Fetch award code from the awards table
            const [award] = await db.select().from(awards).where(eq(awards.id, awardId));

            if (award) {
              awardCode = award.code;
              logger.info(`Found award code ${awardCode} for ID ${awardId}`);
            }
          }
        }
      } catch (error) {
        logger.warn('Error determining award information for charge rate calculation', { error });
      }

      // If we have an award code, get the pay rate from Fair Work API
      if (awardCode) {
        try {
          logger.info(
            `Getting award pay rate for award ${awardCode} and apprentice year ${apprenticeYear}`
          );
          const fairworkRate = await awardRateCalculator.getApprenticePayRate(
            awardCode,
            apprenticeYear,
            isAdult,
            hasCompletedYear12
          );

          if (fairworkRate) {
            logger.info(`Using Fair Work award rate: $${fairworkRate}/hr`);
            payRate = fairworkRate;
          } else {
            logger.warn(
              `No Fair Work rate found for award ${awardCode}, using default rate of $${payRate}/hr`
            );
          }
        } catch (error) {
          logger.error('Error getting Fair Work award rate', { error, awardCode });
        }
      } else {
        logger.info(`No award code found, using default rate of $${payRate}/hr`);
      }

      // Override with negotiated rate from placement if it exists
      if (existingPlacement && existingPlacement.negotiatedRate) {
        const negotiatedRate = parseFloat(existingPlacement.negotiatedRate.toString());
        logger.info(`Using negotiated rate: $${negotiatedRate}/hr from placement`);
        payRate = negotiatedRate;
      }

      // Use custom rates from host employer if available, otherwise use default values
      const customMargin =
        customMarginRate !== null ? customMarginRate : this.defaultCostConfig.defaultMargin;
      const adminRate =
        customAdminRate !== null ? customAdminRate : this.defaultCostConfig.adminRate;

      logger.info(
        `Using custom margin rate: ${customMargin}, admin rate: ${adminRate} for host employer ${hostEmployerId}`
      );

      // Customize cost config based on host employer settings
      const costConfig = {
        ...this.defaultCostConfig,
        defaultMargin: customMargin,
        adminRate: adminRate,
      };

      // Calculate the charge rate
      const calculation = await this.calculateChargeRate(
        payRate,
        this.defaultWorkConfig,
        costConfig,
        this.defaultBillableOptions,
        customMargin, // Pass the custom margin here
        awardId // Pass award ID if available
      );

      // Save the calculation result
      const [savedCalculation] = await db
        .insert(chargeRateCalculations)
        .values({
          apprenticeId: apprenticeId,
          hostEmployerId: hostEmployerId,
          payRate: payRate.toString(),
          totalHours: calculation.totalHours.toString(),
          billableHours: calculation.billableHours.toString(),
          baseWage: calculation.baseWage.toString(),
          onCosts: JSON.stringify(calculation.oncosts),
          totalCost: calculation.totalCost.toString(),
          costPerHour: calculation.costPerHour.toString(),
          chargeRate: calculation.chargeRate.toString(),
          calculationDate: new Date(),
          marginRate: customMargin.toString(),
          approved: false, // Requires approval before being applied
        })
        .returning();

      return {
        calculationId: savedCalculation.id,
        apprenticeId,
        hostEmployerId,
        ...calculation,
      };
    } catch (error) {
      logger.error('Error calculating charge rate', { error, apprenticeId, hostEmployerId });
      throw error;
    }
  }

  /**
   * Generate a quote for host employer
   */
  async generateQuote(hostEmployerId: number, apprenticeIds: number[]): Promise<any> {
    try {
      logger.info(
        `Generating quote for host employer ID ${hostEmployerId} with ${apprenticeIds.length} apprentices`
      );

      if (!apprenticeIds.length) {
        throw new Error('At least one apprentice ID must be provided');
      }

      // Get host employer details
      const [hostEmployer] = await db
        .select()
        .from(hostEmployers)
        .where(eq(hostEmployers.id, hostEmployerId));

      if (!hostEmployer) {
        throw new Error(`Host employer with ID ${hostEmployerId} not found`);
      }

      // Create a new quote
      const [quote] = await db
        .insert(quotes)
        .values({
          hostEmployerId,
          status: 'draft',
          quoteDate: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          totalAmount: '0', // Will be updated after line items are added
          quoteTitle: `Quote for ${hostEmployer.name} - ${new Date().toLocaleDateString()}`,
          quoteNumber: `Q-${Date.now().toString().slice(-6)}`, // Simple quote number generation
          createdBy: 1, // This would normally come from the authenticated user
          notes: 'Automatically generated quote',
        })
        .returning();

      // Calculate charge rates for each apprentice and add as line items
      let totalAmount = 0;
      for (const apprenticeId of apprenticeIds) {
        // Calculate charge rate
        const calculation = await this.calculateAndSaveChargeRate(apprenticeId, hostEmployerId);

        // Get apprentice details for the line item description
        const [apprentice] = await db
          .select()
          .from(apprentices)
          .where(eq(apprentices.id, apprenticeId));

        if (!apprentice) {
          throw new Error(`Apprentice with ID ${apprenticeId} not found`);
        }

        // Calculate line item pricing
        const hoursPerWeek =
          this.defaultWorkConfig.hoursPerDay * this.defaultWorkConfig.daysPerWeek;
        const weeklyPrice = calculation.chargeRate * hoursPerWeek;
        const totalPrice = (weeklyPrice * 52).toString();

        // Add line item to quote
        const [lineItem] = await db
          .insert(quoteLineItems)
          .values({
            quoteId: quote.id,
            apprenticeId: apprenticeId,
            description: `${apprentice.firstName} ${apprentice.lastName} - Year ${apprentice.apprenticeshipYear || 1}`,
            quantity: '52', // 52 weeks
            unit: 'week',
            weeklyHours: hoursPerWeek.toString(),
            ratePerHour: calculation.chargeRate.toString(),
            totalPrice: totalPrice,
            notes: `Includes training, PPE, and administration costs`,
          })
          .returning();

        totalAmount += parseFloat(lineItem.totalPrice);
      }

      // Update the quote with the total amount
      await db
        .update(quotes)
        .set({
          totalAmount: totalAmount.toString(),
        })
        .where(eq(quotes.id, quote.id));

      return {
        quoteId: quote.id,
        quoteNumber: quote.quoteNumber,
        hostEmployerId,
        totalAmount,
        apprenticeCount: apprenticeIds.length,
        status: 'draft',
      };
    } catch (error) {
      logger.error('Error generating quote', { error, hostEmployerId, apprenticeIds });
      throw error;
    }
  }

  /**
   * Approve a charge rate calculation and apply it to the placement
   */
  async approveChargeRate(calculationId: number): Promise<any> {
    try {
      logger.info(`Approving charge rate calculation ID ${calculationId}`);

      // Get the calculation
      const [calculation] = await db
        .select()
        .from(chargeRateCalculations)
        .where(eq(chargeRateCalculations.id, calculationId));

      if (!calculation) {
        throw new Error(`Charge rate calculation with ID ${calculationId} not found`);
      }

      // Get existing placement or create a new one
      const [existingPlacement] = await db
        .select()
        .from(placements)
        .where(
          and(
            eq(placements.apprenticeId, calculation.apprenticeId),
            eq(placements.hostEmployerId, calculation.hostEmployerId),
            eq(placements.status, 'active')
          )
        );

      if (existingPlacement) {
        // Update existing placement with new charge rate
        await db
          .update(placements)
          .set({
            chargeRate: calculation.chargeRate,
            lastChargeRateUpdate: new Date(),
          })
          .where(eq(placements.id, existingPlacement.id));
      }

      // Mark the calculation as approved
      await db
        .update(chargeRateCalculations)
        .set({
          approved: true,
          approvedDate: new Date(),
          approvedBy: 1, // This would normally come from the authenticated user
        })
        .where(eq(chargeRateCalculations.id, calculationId));

      return {
        success: true,
        calculationId,
        placementId: existingPlacement?.id,
        message: existingPlacement
          ? 'Charge rate updated on existing placement'
          : 'Charge rate approved',
      };
    } catch (error) {
      logger.error('Error approving charge rate', { error, calculationId });
      throw error;
    }
  }
}

// Create and export a singleton instance
export const chargeRateCalculator = new ChargeRateCalculator();
