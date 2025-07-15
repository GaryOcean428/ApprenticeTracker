import { Request, Response } from 'express';
import { db } from '../../db';
import { eq, and, gte, lte, like } from 'drizzle-orm';
import {
  awards,
  awardClassifications,
  payRates,
  penaltyRules,
  allowanceRules,
  timesheets,
  timesheetCalculations,
} from '@shared/schema';
import { AwardRateCalculator } from '../../services/award-rate-calculator';
import logger from '../../utils/logger';

/**
 * Get all awards
 * @route GET /api/payroll/awards
 */
export async function getAllAwards(req: Request, res: Response) {
  try {
    const awardsList = await db.select().from(awards);
    return res.status(200).json(awardsList);
  } catch (error) {
    logger.error('Error fetching awards:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ message: 'Failed to fetch awards' });
  }
}

/**
 * Get award by ID
 * @route GET /api/payroll/awards/:id
 */
export async function getAwardById(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Award ID is required' });
  }

  try {
    const [award] = await db
      .select()
      .from(awards)
      .where(eq(awards.id, parseInt(id)));

    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }

    return res.status(200).json(award);
  } catch (error) {
    logger.error('Error fetching award:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ message: 'Failed to fetch award' });
  }
}

/**
 * Get classifications for an award
 * @route GET /api/payroll/awards/:awardId/classifications
 */
export async function getAwardClassifications(req: Request, res: Response) {
  const { awardId } = req.params;

  if (!awardId) {
    return res.status(400).json({ message: 'Award ID is required' });
  }

  try {
    const classifications = await db
      .select()
      .from(awardClassifications)
      .where(eq(awardClassifications.awardId, parseInt(awardId)));

    return res.status(200).json(classifications);
  } catch (error) {
    logger.error('Error fetching award classifications:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ message: 'Failed to fetch classifications' });
  }
}

/**
 * Get pay rates for a classification
 * @route GET /api/payroll/classifications/:classificationId/rates
 */
export async function getClassificationRates(req: Request, res: Response) {
  const { classificationId } = req.params;

  if (!classificationId) {
    return res.status(400).json({ message: 'Classification ID is required' });
  }

  try {
    const rates = await db
      .select()
      .from(payRates)
      .where(eq(payRates.classificationId, parseInt(classificationId)));

    return res.status(200).json(rates);
  } catch (error) {
    logger.error('Error fetching classification rates:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ message: 'Failed to fetch rates' });
  }
}

/**
 * Get penalty rules for an award
 * @route GET /api/payroll/awards/:awardId/penalties
 */
export async function getAwardPenalties(req: Request, res: Response) {
  const { awardId } = req.params;

  if (!awardId) {
    return res.status(400).json({ message: 'Award ID is required' });
  }

  try {
    const penalties = await db
      .select()
      .from(penaltyRules)
      .where(eq(penaltyRules.awardId, parseInt(awardId)));

    return res.status(200).json(penalties);
  } catch (error) {
    logger.error('Error fetching award penalties:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ message: 'Failed to fetch penalties' });
  }
}

/**
 * Get allowance rules for an award
 * @route GET /api/payroll/awards/:awardId/allowances
 */
export async function getAwardAllowances(req: Request, res: Response) {
  const { awardId } = req.params;

  if (!awardId) {
    return res.status(400).json({ message: 'Award ID is required' });
  }

  try {
    const allowances = await db
      .select()
      .from(allowanceRules)
      .where(eq(allowanceRules.awardId, parseInt(awardId)));

    return res.status(200).json(allowances);
  } catch (error) {
    logger.error('Error fetching award allowances:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ message: 'Failed to fetch allowances' });
  }
}

/**
 * Calculate pay for a timesheet
 * @route POST /api/payroll/timesheets/:timesheetId/calculate
 */
export async function calculateTimesheetPay(req: Request, res: Response) {
  const { timesheetId } = req.params;

  if (!timesheetId) {
    return res.status(400).json({ message: 'Timesheet ID is required' });
  }

  try {
    // Check if timesheet exists
    const [timesheet] = await db
      .select()
      .from(timesheets)
      .where(eq(timesheets.id, parseInt(timesheetId)));

    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    // Create calculator and calculate pay
    const calculator = new AwardRateCalculator();
    const result = await calculator.calculateTimesheetPay(parseInt(timesheetId));

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error calculating timesheet pay:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({
      message: 'Failed to calculate timesheet pay',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get calculated pay for a timesheet
 * @route GET /api/payroll/timesheets/:timesheetId/calculation
 */
export async function getTimesheetCalculation(req: Request, res: Response) {
  const { timesheetId } = req.params;

  if (!timesheetId) {
    return res.status(400).json({ message: 'Timesheet ID is required' });
  }

  try {
    const [calculation] = await db
      .select()
      .from(timesheetCalculations)
      .where(eq(timesheetCalculations.timesheetId, parseInt(timesheetId)));

    if (!calculation) {
      return res.status(404).json({ message: 'No calculation found for this timesheet' });
    }

    return res.status(200).json(calculation);
  } catch (error) {
    logger.error('Error fetching timesheet calculation:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ message: 'Failed to fetch calculation' });
  }
}

/**
 * Validate a pay rate against Fair Work Awards
 * @route POST /api/payroll/awards/validate-rate
 */
export async function validateAwardRate(req: Request, res: Response) {
  const { awardCode, classificationCode, hourlyRate } = req.body;

  if (!awardCode || !classificationCode || hourlyRate === undefined) {
    return res.status(400).json({
      message: 'awardCode, classificationCode, and hourlyRate are all required',
    });
  }

  try {
    // Create FairWork API client - in production this would be configured from environment variables
    // Here we rely on the fallback behavior in validateAwardRates when no client is provided
    const calculator = new AwardRateCalculator();

    // Validate the rate against Fair Work API
    const validationResult = await calculator.validateAwardRates(
      awardCode,
      classificationCode,
      parseFloat(hourlyRate)
    );

    return res.status(200).json(validationResult);
  } catch (error) {
    logger.error('Error validating award rate:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({
      message: 'Failed to validate award rate',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Import modern awards data from Fair Work API
 * @route POST /api/payroll/awards/import
 */
export async function importModernAwardsData(req: Request, res: Response) {
  try {
    // This would be properly configured in production
    // For now, use the award rate calculator without an API client
    // which will return appropriate error message
    const calculator = new AwardRateCalculator();
    const result = await calculator.importModernAwardsData();

    return res.status(200).json({
      message: 'Modern awards data imported successfully',
      stats: result,
    });
  } catch (error) {
    logger.error('Error importing modern awards data:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({
      message: 'Failed to import modern awards data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
