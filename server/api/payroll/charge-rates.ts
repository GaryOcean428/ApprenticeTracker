import { Router, Request, Response } from 'express';
import { chargeRateCalculator } from '../../services/charge-rate-calculator';
import { db } from '../../db';
import { penaltyRules, awards } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export const chargeRateRouter = Router();

/**
 * Calculate charge rate based on provided parameters
 * POST /api/payroll/charge-rates/calculate
 */
chargeRateRouter.post('/calculate', async (req: Request, res: Response) => {
  try {
    console.log('[INFO] Calculating charge rate for pay rate:', req.body.payRate);
    const { payRate, awardId } = req.body;
    
    if (!payRate) {
      return res.status(400).json({
        success: false,
        error: 'Pay rate is required'
      });
    }
    
    // Get custom configuration values if provided
    const customConfig = req.body.config || {};
    const customMargin = req.body.margin || undefined;
    
    // Calculate the charge rate
    const result = await chargeRateCalculator.calculateChargeRate(
      parseFloat(payRate), 
      customConfig.workConfig, 
      customConfig.costConfig, 
      customConfig.billableOptions,
      customMargin,
      awardId
    );
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error calculating charge rate', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate charge rate',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get penalty rules for an award
 * GET /api/payroll/charge-rates/award/:awardId/penalties
 */
chargeRateRouter.get('/award/:awardId/penalties', async (req: Request, res: Response) => {
  try {
    const { awardId } = req.params;
    
    // Get penalty rules for this award
    const penalties = await db
      .select()
      .from(penaltyRules)
      .where(eq(penaltyRules.awardId, parseInt(awardId)));
      
    return res.json({
      success: true,
      data: penalties
    });
  } catch (error) {
    console.error('Error fetching penalty rules', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch penalty rules',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Calculate penalty cost estimates for a pay rate and award
 * GET /api/payroll/charge-rates/estimate-penalties
 */
chargeRateRouter.post('/estimate-penalties', async (req: Request, res: Response) => {
  try {
    const { payRate, awardId } = req.body;
    
    if (!payRate || !awardId) {
      return res.status(400).json({
        success: false,
        error: 'Pay rate and award ID are required'
      });
    }
    
    console.log('[INFO] Fetching penalty rules for award ID', awardId);
    
    // Get award information
    const [award] = await db
      .select()
      .from(awards)
      .where(eq(awards.id, parseInt(awardId)));
      
    // Get estimated penalty costs
    const penaltyEstimates = await chargeRateCalculator.calculatePenaltyEstimates(
      parseFloat(payRate),
      parseInt(awardId)
    );
    
    return res.json({
      success: true,
      payRate,
      awardId,
      awardName: award?.name || 'Unknown Award',
      data: penaltyEstimates
    });
  } catch (error) {
    console.error('Error estimating penalty costs', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to estimate penalty costs',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Calculate and save a charge rate for an apprentice and host employer
 * POST /api/payroll/charge-rates/calculate-and-save
 */
chargeRateRouter.post('/calculate-and-save', async (req: Request, res: Response) => {
  try {
    const { apprenticeId, hostEmployerId, payRate, margin } = req.body;
    
    if (!apprenticeId || !hostEmployerId || !payRate) {
      return res.status(400).json({
        success: false,
        error: 'Apprentice ID, host employer ID, and pay rate are required'
      });
    }
    
    // Calculate and save the charge rate
    const result = await chargeRateCalculator.calculateAndSaveChargeRate(
      parseInt(apprenticeId),
      parseInt(hostEmployerId),
      margin ? parseFloat(margin) : undefined
    );
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error calculating and saving charge rate', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate and save charge rate',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Generate a quote for a host employer with multiple apprentices
 * POST /api/payroll/charge-rates/generate-quote
 */
chargeRateRouter.post('/generate-quote', async (req: Request, res: Response) => {
  try {
    const { hostEmployerId, apprenticeIds } = req.body;
    
    if (!hostEmployerId || !apprenticeIds || !Array.isArray(apprenticeIds) || apprenticeIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Host employer ID and at least one apprentice ID are required'
      });
    }
    
    // Generate the quote
    const result = await chargeRateCalculator.generateQuote(
      parseInt(hostEmployerId),
      apprenticeIds.map((id: any) => parseInt(id))
    );
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error generating quote', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate quote',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Approve a charge rate calculation and apply it to the placement
 * POST /api/payroll/charge-rates/:calculationId/approve
 */
chargeRateRouter.post('/:calculationId/approve', async (req: Request, res: Response) => {
  try {
    const { calculationId } = req.params;
    
    // Approve the charge rate calculation
    const result = await chargeRateCalculator.approveChargeRate(parseInt(calculationId));
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error approving charge rate', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to approve charge rate',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});
