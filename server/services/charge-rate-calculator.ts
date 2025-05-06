import { db } from '../db';
import { eq, and, gt, lt, gte, lte, sql, inArray } from 'drizzle-orm';
import logger from '../utils/logger';
import {
  apprentices,
  placements,
  hostEmployers,
  chargeRateCalculations,
  quotes,
  quoteLineItems
} from '@shared/schema';

/**
 * Service for calculating host employer charge rates
 * Based on the R8 calculation system
 */
export class ChargeRateCalculator {
  /**
   * Cost configuration for calculating charge rates
   */
  private defaultCostConfig = {
    superRate: 0.115,         // 11.5% superannuation
    wcRate: 0.047,            // 4.7% workers' compensation
    payrollTaxRate: 0.0485,   // 4.85% payroll tax
    leaveLoading: 0.175,      // 17.5% leave loading
    studyCost: 850,           // $850/year study cost
    ppeCost: 300,             // $300/year PPE cost
    adminRate: 0.17,          // 17% admin overhead
    defaultMargin: 0.15,      // 15% profit margin
    adverseWeatherDays: 5     // 5 days of adverse weather per year
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
    trainingWeeks: 5
  };

  /**
   * Default billable options
   */
  private defaultBillableOptions = {
    includeAnnualLeave: false,
    includePublicHolidays: false,
    includeSickLeave: false,
    includeTrainingTime: false,
    includeAdverseWeather: false
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
      adminCost: baseWage * config.adminRate
    };
  }

  /**
   * Calculate charge rate based on pay rate and configuration
   */
  calculateChargeRate(
    payRate: number,
    workConfig: any = this.defaultWorkConfig,
    costConfig: any = this.defaultCostConfig,
    billableOptions: any = this.defaultBillableOptions,
    margin: number = this.defaultCostConfig.defaultMargin
  ): any {
    logger.info(`Calculating charge rate for pay rate: ${payRate}`);
    
    const totalHours = this.calculateTotalAnnualHours(workConfig);
    const billableHours = this.calculateBillableHours(workConfig, costConfig, billableOptions);
    const baseWage = payRate * totalHours;
    const oncosts = this.calculateOnCosts(payRate, totalHours, costConfig);
    // Type-safe reduce to sum oncosts
    const totalOnCosts = Object.values(oncosts).reduce((sum, cost) => {
      return sum + (typeof cost === 'number' ? cost : 0);
    }, 0);
    const totalCost = baseWage + totalOnCosts;
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
    };
  }

  /**
   * Calculate and save charge rate for a specific apprentice and host employer
   */
  async calculateAndSaveChargeRate(apprenticeId: number, hostEmployerId: number): Promise<any> {
    try {
      logger.info(`Calculating charge rate for apprentice ID ${apprenticeId} and host employer ID ${hostEmployerId}`);
      
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
        
        if (result && result[0]) {
          if (result[0].custom_margin_rate !== null) {
            customMarginRate = parseFloat(result[0].custom_margin_rate);
          }
          if (result[0].custom_admin_rate !== null) {
            customAdminRate = parseFloat(result[0].custom_admin_rate);
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

      // Default base pay rate - would normally come from payRates table based on award
      // and classification, but for now we'll use a default value
      let payRate = 25.0; // Default hourly rate
      
      // Override with negotiated rate from placement if it exists
      if (existingPlacement && existingPlacement.negotiatedRate) {
        payRate = parseFloat(existingPlacement.negotiatedRate.toString());
      }

      // Use custom rates from host employer if available, otherwise use default values
      const customMargin = customMarginRate !== null ? customMarginRate : this.defaultCostConfig.defaultMargin;
      const adminRate = customAdminRate !== null ? customAdminRate : this.defaultCostConfig.adminRate;
      
      logger.info(`Using custom margin rate: ${customMargin}, admin rate: ${adminRate} for host employer ${hostEmployerId}`);
      
      // Customize cost config based on host employer settings
      const costConfig = {
        ...this.defaultCostConfig,
        defaultMargin: customMargin,
        adminRate: adminRate
      };

      // Calculate the charge rate
      const calculation = this.calculateChargeRate(
        payRate, 
        this.defaultWorkConfig, 
        costConfig, 
        this.defaultBillableOptions,
        customMargin // Pass the custom margin here
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
          approved: false // Requires approval before being applied
        })
        .returning();

      return {
        calculationId: savedCalculation.id,
        apprenticeId,
        hostEmployerId,
        ...calculation
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
      logger.info(`Generating quote for host employer ID ${hostEmployerId} with ${apprenticeIds.length} apprentices`);
      
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
          notes: 'Automatically generated quote'
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
        const hoursPerWeek = this.defaultWorkConfig.hoursPerDay * this.defaultWorkConfig.daysPerWeek;
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
            notes: `Includes training, PPE, and administration costs`
          })
          .returning();
          
        totalAmount += parseFloat(lineItem.totalPrice);
      }
      
      // Update the quote with the total amount
      await db
        .update(quotes)
        .set({
          totalAmount: totalAmount.toString()
        })
        .where(eq(quotes.id, quote.id));
      
      return {
        quoteId: quote.id,
        quoteNumber: quote.quoteNumber,
        hostEmployerId,
        totalAmount,
        apprenticeCount: apprenticeIds.length,
        status: 'draft'
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
            lastChargeRateUpdate: new Date()
          })
          .where(eq(placements.id, existingPlacement.id));
      }
      
      // Mark the calculation as approved
      await db
        .update(chargeRateCalculations)
        .set({
          approved: true,
          approvedDate: new Date(),
          approvedBy: 1 // This would normally come from the authenticated user
        })
        .where(eq(chargeRateCalculations.id, calculationId));
      
      return {
        success: true,
        calculationId,
        placementId: existingPlacement?.id,
        message: existingPlacement ? 'Charge rate updated on existing placement' : 'Charge rate approved'
      };
    } catch (error) {
      logger.error('Error approving charge rate', { error, calculationId });
      throw error;
    }
  }
}

// Create and export a singleton instance
export const chargeRateCalculator = new ChargeRateCalculator();
