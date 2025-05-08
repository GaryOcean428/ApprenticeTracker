/**
 * Fair Work API routes
 * 
 * These routes provide access to Fair Work Commission data including awards,
 * classifications, and pay rates.
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { awardRateCalculator } from '../../services/award-rate-calculator';
import { fairWorkDataSync } from '../../services/fairwork/data-sync';
import { FairWorkApiClient } from '../../services/fairwork/api-client';
import logger from '../../utils/logger';
import { isAuthenticated } from '../../middleware/auth';

const router = express.Router();
const fairWorkApiClient = new FairWorkApiClient({
  baseUrl: process.env.FAIRWORK_API_URL || 'https://api.fairwork.gov.au',
  apiKey: process.env.FAIRWORK_API_KEY || ''
});

/**
 * @route GET /api/fairwork/awards
 * @desc Get all awards
 * @access Private
 */
router.get('/awards', isAuthenticated, async (req, res) => {
  try {
    const awards = await fairWorkApiClient.getActiveAwards();
    res.json(awards);
  } catch (error) {
    logger.error('Error fetching awards', { error });
    res.status(500).json({ error: 'Failed to fetch awards' });
  }
});

/**
 * @route GET /api/fairwork/awards/:code
 * @desc Get an award by code
 * @access Private
 */
router.get('/awards/:code', isAuthenticated, async (req, res) => {
  try {
    const { code } = req.params;
    const award = await fairWorkApiClient.getAward(code);
    
    if (!award) {
      return res.status(404).json({ error: 'Award not found' });
    }
    
    res.json(award);
  } catch (error) {
    logger.error('Error fetching award', { error });
    res.status(500).json({ error: 'Failed to fetch award' });
  }
});

/**
 * @route GET /api/fairwork/awards/:code/classifications
 * @desc Get classifications for an award
 * @access Private
 */
router.get('/awards/:code/classifications', isAuthenticated, async (req, res) => {
  try {
    const { code } = req.params;
    const classifications = await fairWorkApiClient.getAwardClassifications(code);
    res.json(classifications);
  } catch (error) {
    logger.error('Error fetching classifications', { error });
    res.status(500).json({ error: 'Failed to fetch classifications' });
  }
});

/**
 * @route GET /api/fairwork/awards/:code/pay-rates
 * @desc Get pay rates for an award
 * @access Private
 */
router.get('/awards/:code/pay-rates', isAuthenticated, async (req, res) => {
  try {
    const { code } = req.params;
    const {
      classificationLevel,
      classificationFixedId,
      employeeRateTypeCode,
      operativeFrom,
      operativeTo
    } = req.query;
    
    const options: any = {};
    
    if (classificationLevel) options.classificationLevel = parseInt(classificationLevel as string);
    if (classificationFixedId) options.classificationFixedId = parseInt(classificationFixedId as string);
    if (employeeRateTypeCode) options.employeeRateTypeCode = employeeRateTypeCode as string;
    if (operativeFrom) options.operativeFrom = operativeFrom as string;
    if (operativeTo) options.operativeTo = operativeTo as string;
    
    const payRates = await fairWorkApiClient.getPayRates(code, options);
    res.json(payRates);
  } catch (error) {
    logger.error('Error fetching pay rates', { error });
    res.status(500).json({ error: 'Failed to fetch pay rates' });
  }
});

/**
 * @route GET /api/fairwork/apprentice-rates
 * @desc Get apprentice pay rates
 * @access Private
 */
router.get('/apprentice-rates', isAuthenticated, [
  query('award').notEmpty().withMessage('Award code is required'),
  query('year').isInt({ min: 1, max: 4 }).withMessage('Apprentice year must be between 1 and 4'),
  query('isAdult').optional().isBoolean().withMessage('isAdult must be a boolean'),
  query('hasCompletedYear12').optional().isBoolean().withMessage('hasCompletedYear12 must be a boolean')
], async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const award = req.query.award as string;
    const year = parseInt(req.query.year as string);
    const isAdult = req.query.isAdult === 'true';
    const hasCompletedYear12 = req.query.hasCompletedYear12 === 'true';
    
    const rate = await awardRateCalculator.getApprenticePayRate(
      award,
      year,
      isAdult,
      hasCompletedYear12
    );
    
    if (rate === null) {
      return res.status(404).json({ error: 'Pay rate not found' });
    }
    
    res.json({ 
      rate,
      award,
      year,
      isAdult,
      hasCompletedYear12
    });
  } catch (error) {
    logger.error('Error fetching apprentice rate', { error });
    res.status(500).json({ error: 'Failed to fetch apprentice rate' });
  }
});

/**
 * @route GET /api/fairwork/classification-rates
 * @desc Get classification pay rates
 * @access Private
 */
router.get('/classification-rates', isAuthenticated, [
  query('award').notEmpty().withMessage('Award code is required'),
  query('classification').notEmpty().withMessage('Classification code is required')
], async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const award = req.query.award as string;
    const classification = req.query.classification as string;
    
    const rate = await awardRateCalculator.getClassificationPayRate(
      award,
      classification
    );
    
    if (rate === null) {
      return res.status(404).json({ error: 'Pay rate not found' });
    }
    
    res.json({ 
      rate,
      award,
      classification
    });
  } catch (error) {
    logger.error('Error fetching classification rate', { error });
    res.status(500).json({ error: 'Failed to fetch classification rate' });
  }
});

/**
 * @route POST /api/fairwork/sync
 * @desc Manually trigger a sync of Fair Work data
 * @access Private (admin only)
 */
router.post('/sync', isAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    // Check if the user has admin permissions
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const forceRefresh = req.body.forceRefresh === true;
    
    // Start the sync in the background
    fairWorkDataSync.syncAllData(forceRefresh).catch(error => {
      logger.error('Background sync failed', { error });
    });
    
    res.json({ 
      message: 'Sync started',
      forceRefresh
    });
  } catch (error) {
    logger.error('Error starting sync', { error });
    res.status(500).json({ error: 'Failed to start sync' });
  }
});

/**
 * @route GET /api/fairwork/status
 * @desc Get status of Fair Work API integration
 * @access Private (admin only)
 */
router.get('/status', isAuthenticated, async (req, res) => {
  try {
    // Check if the user has admin permissions
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Test a basic API call to check if it's working
    const awards = await fairWorkApiClient.getActiveAwards();
    
    res.json({
      status: 'operational',
      apiUrl: process.env.FAIRWORK_API_URL,
      lastSync: new Date().toISOString(), // In a real app, we'd store this timestamp
      awardCount: awards.length
    });
  } catch (error) {
    logger.error('Error checking API status', { error });
    res.status(500).json({ 
      status: 'error',
      error: 'API connection failed',
      message: error.message || 'Unknown error'
    });
  }
});

export default router;