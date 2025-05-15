/**
 * Fair Work Award Updates API
 * 
 * This API provides endpoints for managing award updates:
 * - Getting a list of pending updates
 * - Marking updates as processed
 * - Triggering a manual check for updates
 */

import { Request, Response } from 'express';
import { db } from '../../db';
import { awardUpdateChecks } from '@shared/schema/awards';
import { awardMonitor } from '../../services/fairwork/award-monitor';
import { eq } from 'drizzle-orm';
import logger from '../../utils/logger';

/**
 * Get award updates
 * Optionally filter by status (pending, notified, updated, ignored)
 */
export async function getAwardUpdates(req: Request, res: Response) {
  try {
    const { status } = req.query;
    
    if (status && typeof status === 'string' && 
        !['pending', 'notified', 'updated', 'ignored'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status. Must be one of: pending, notified, updated, ignored" 
      });
    }
    
    const updates = await awardMonitor.getAwardUpdates(
      status as 'pending' | 'notified' | 'updated' | 'ignored'
    );
    
    res.json({
      success: true,
      data: updates
    });
  } catch (error) {
    logger.error('Error fetching award updates', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch award updates'
    });
  }
}

/**
 * Trigger a manual check for award updates
 */
export async function checkForUpdates(req: Request, res: Response) {
  try {
    const pendingCount = await awardMonitor.manualCheckForUpdates();
    
    res.json({
      success: true,
      message: `Check completed. ${pendingCount} pending updates found.`,
      pendingCount
    });
  } catch (error) {
    logger.error('Error checking for award updates', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to check for award updates'
    });
  }
}

/**
 * Update an award with new information
 */
export async function updateAward(req: Request, res: Response) {
  try {
    const { awardCode } = req.params;
    const { name, url, version, effectiveDate, description } = req.body;
    
    if (!awardCode) {
      return res.status(400).json({
        success: false,
        message: 'Award code is required'
      });
    }
    
    // At least one update field is required
    if (!name && !url && !version && !effectiveDate && !description) {
      return res.status(400).json({
        success: false,
        message: 'At least one update field is required'
      });
    }
    
    const success = await awardMonitor.updateAward(awardCode, {
      name,
      url,
      version,
      effectiveDate,
      description
    });
    
    if (success) {
      res.json({
        success: true,
        message: `Award ${awardCode} updated successfully`
      });
    } else {
      res.status(404).json({
        success: false,
        message: `Award ${awardCode} not found`
      });
    }
  } catch (error) {
    logger.error('Error updating award', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to update award'
    });
  }
}

/**
 * Ignore an award update
 */
export async function ignoreAwardUpdate(req: Request, res: Response) {
  try {
    const { updateId } = req.params;
    
    if (!updateId) {
      return res.status(400).json({
        success: false,
        message: 'Update ID is required'
      });
    }
    
    // updateId is now a string to match our UUID-based primary keys
    const success = await awardMonitor.ignoreAwardUpdate(updateId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Award update ignored successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Award update not found'
      });
    }
  } catch (error) {
    logger.error('Error ignoring award update', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to ignore award update'
    });
  }
}