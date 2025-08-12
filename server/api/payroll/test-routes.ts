import type { Request, Response } from 'express';
import { quotes, quoteLineItems } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { chargeRateCalculator } from '../../services/charge-rate-calculator';
import logger from '../../utils/logger';
import { db } from '../../db';

/**
 * Test route for calculating charge rate (no auth)
 * DEVELOPMENT ONLY - Not for production use!
 */
export const testCalculateChargeRate = async (req: Request, res: Response) => {
  try {
    const { apprenticeId, hostEmployerId } = req.body;

    if (!apprenticeId || !hostEmployerId) {
      return res.status(400).json({
        success: false,
        message: 'Apprentice ID and Host Employer ID are required',
      });
    }

    const result = await chargeRateCalculator.calculateAndSaveChargeRate(
      parseInt(apprenticeId),
      parseInt(hostEmployerId)
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error calculating charge rate', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

/**
 * Test route for generating a quote (no auth)
 * DEVELOPMENT ONLY - Not for production use!
 */
export const testGenerateQuote = async (req: Request, res: Response) => {
  try {
    const { hostEmployerId, apprenticeIds } = req.body;

    if (
      !hostEmployerId ||
      !apprenticeIds ||
      !Array.isArray(apprenticeIds) ||
      apprenticeIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Host Employer ID and at least one Apprentice ID are required',
      });
    }

    const result = await chargeRateCalculator.generateQuote(
      parseInt(hostEmployerId),
      apprenticeIds.map(id => parseInt(id))
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error generating quote', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

/**
 * Test route for getting quote details (no auth)
 * DEVELOPMENT ONLY - Not for production use!
 */
export const testGetQuote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, parseInt(id)));

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: `Quote with ID ${id} not found`,
      });
    }

    const lineItems = await db
      .select()
      .from(quoteLineItems)
      .where(eq(quoteLineItems.quoteId, parseInt(id)));

    return res.status(200).json({
      success: true,
      data: {
        quote,
        lineItems,
      },
    });
  } catch (error) {
    logger.error('Error retrieving quote', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};
