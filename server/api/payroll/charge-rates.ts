import { Request, Response } from 'express';
import { chargeRateCalculator } from '../../services/charge-rate-calculator';
import logger from '../../utils/logger';
import { db } from '../../db';
import { chargeRateCalculations, quotes, quoteLineItems } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Calculate charge rate for an apprentice at a specific host employer
 */
export const calculateChargeRate = async (req: Request, res: Response) => {
  try {
    const { apprenticeId, hostEmployerId } = req.body;
    
    if (!apprenticeId || !hostEmployerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Apprentice ID and Host Employer ID are required' 
      });
    }
    
    const result = await chargeRateCalculator.calculateAndSaveChargeRate(
      parseInt(apprenticeId), 
      parseInt(hostEmployerId)
    );
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error calculating charge rate', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
};

/**
 * Get an existing charge rate calculation by ID
 */
export const getChargeRateCalculation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [calculation] = await db
      .select()
      .from(chargeRateCalculations)
      .where(eq(chargeRateCalculations.id, parseInt(id)));
    
    if (!calculation) {
      return res.status(404).json({
        success: false,
        message: `Charge rate calculation with ID ${id} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: calculation
    });
  } catch (error) {
    logger.error('Error retrieving charge rate calculation', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
};

/**
 * Approve a charge rate calculation and apply it to the placement
 */
export const approveChargeRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await chargeRateCalculator.approveChargeRate(parseInt(id));
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error approving charge rate', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
};

/**
 * Generate a quote for a host employer with multiple apprentices
 */
export const generateQuote = async (req: Request, res: Response) => {
  try {
    const { hostEmployerId, apprenticeIds } = req.body;
    
    if (!hostEmployerId || !apprenticeIds || !Array.isArray(apprenticeIds) || apprenticeIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Host Employer ID and at least one Apprentice ID are required' 
      });
    }
    
    const result = await chargeRateCalculator.generateQuote(
      parseInt(hostEmployerId),
      apprenticeIds.map(id => parseInt(id))
    );
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error generating quote', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
};

/**
 * Get a quote by ID with its line items
 */
export const getQuote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, parseInt(id)));
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: `Quote with ID ${id} not found`
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
        lineItems
      }
    });
  } catch (error) {
    logger.error('Error retrieving quote', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
};

/**
 * Update a quote's status (e.g., to 'accepted' or 'rejected')
 */
export const updateQuoteStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    
    if (!status || !['draft', 'sent', 'accepted', 'rejected', 'expired'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid status is required (draft, sent, accepted, rejected, expired)' 
      });
    }
    
    const updateData: any = {
      status
    };
    
    // Add additional fields based on status
    if (status === 'accepted') {
      updateData.acceptedDate = new Date();
      updateData.acceptedBy = req.body.acceptedBy || 'Customer';
    } else if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    await db
      .update(quotes)
      .set(updateData)
      .where(eq(quotes.id, parseInt(id)));
    
    return res.status(200).json({
      success: true,
      message: `Quote status updated to ${status}`
    });
  } catch (error) {
    logger.error('Error updating quote status', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
};
