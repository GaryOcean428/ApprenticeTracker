import { Router } from 'express';
import { z } from 'zod';
import {
  insertAwardSchema,
  insertAwardClassificationSchema,
  insertPayRateSchema,
  insertPenaltyRuleSchema,
  insertAllowanceRuleSchema,
  insertPublicHolidaySchema,
} from '@shared/schema';
import { storage } from '../storage';

const router = Router();

// Award Management Routes

// Get all awards
router.get('/awards', async (req, res) => {
  try {
    const awards = await storage.getAllAwards();
    res.json(awards);
  } catch (error) {
    console.error('Error fetching awards:', error);
    res.status(500).json({
      message: 'Error fetching awards',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get award by ID
router.get('/awards/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const award = await storage.getAward(id);

    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }

    res.json(award);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching award' });
  }
});

// Create award
router.post('/awards', async (req, res) => {
  try {
    const awardData = insertAwardSchema.parse(req.body);
    const award = await storage.createAward(awardData);

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Create activity log
    await storage.createActivityLog({
      userId,
      action: 'created',
      relatedTo: 'award',
      relatedId: award.id,
      details: {
        message: `New award ${award.name} (${award.code}) created`,
        awardId: award.id,
      },
    });

    res.status(201).json(award);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid award data', errors: error.errors });
    } else {
      console.error('Error creating award:', error);
      res.status(500).json({
        message: 'Error creating award',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

// Update award
router.patch('/awards/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const awardData = req.body;
    const award = await storage.updateAward(id, awardData);

    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Create activity log
    await storage.createActivityLog({
      userId,
      action: 'updated',
      relatedTo: 'award',
      relatedId: award.id,
      details: {
        message: `Award ${award.name} (${award.code}) updated`,
        awardId: award.id,
      },
    });

    res.json(award);
  } catch (error) {
    console.error('Error updating award:', error);
    res.status(500).json({
      message: 'Error updating award',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Award Classification Routes

// Get classifications for an award
router.get('/awards/:awardId/classifications', async (req, res) => {
  try {
    const awardId = parseInt(req.params.awardId);
    const classifications = await storage.getAwardClassificationsByAward(awardId);
    res.json(classifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching award classifications' });
  }
});

// Create award classification
router.post('/awards/:awardId/classifications', async (req, res) => {
  try {
    const awardId = parseInt(req.params.awardId);
    const classificationData = insertAwardClassificationSchema.parse({
      ...req.body,
      awardId,
    });

    const classification = await storage.createAwardClassification(classificationData);

    res.status(201).json(classification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid classification data', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error creating award classification' });
    }
  }
});

// Pay Rate Routes

// Get all pay rates
router.get('/pay-rates', async (req, res) => {
  try {
    const payRates = await storage.getAllPayRates();
    res.json(payRates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pay rates' });
  }
});

// Get current pay rates
router.get('/pay-rates/current', async (req, res) => {
  try {
    const payRates = await storage.getCurrentPayRates();
    res.json(payRates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching current pay rates' });
  }
});

// Get pay rates by classification
router.get('/classifications/:classificationId/pay-rates', async (req, res) => {
  try {
    const classificationId = parseInt(req.params.classificationId);
    const payRates = await storage.getPayRatesByClassification(classificationId);
    res.json(payRates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pay rates for classification' });
  }
});

// Create pay rate
router.post('/pay-rates', async (req, res) => {
  try {
    const payRateData = insertPayRateSchema.parse(req.body);
    const payRate = await storage.createPayRate(payRateData);

    res.status(201).json(payRate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid pay rate data', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error creating pay rate' });
    }
  }
});

// Penalty Rules Routes

// Get penalty rules for an award
router.get('/awards/:awardId/penalty-rules', async (req, res) => {
  try {
    const awardId = parseInt(req.params.awardId);
    const rules = await storage.getPenaltyRulesByAward(awardId);
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching penalty rules' });
  }
});

// Create penalty rule
router.post('/awards/:awardId/penalty-rules', async (req, res) => {
  try {
    const awardId = parseInt(req.params.awardId);
    const ruleData = insertPenaltyRuleSchema.parse({
      ...req.body,
      awardId,
    });

    const rule = await storage.createPenaltyRule(ruleData);
    res.status(201).json(rule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid penalty rule data', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error creating penalty rule' });
    }
  }
});

// Allowance Rules Routes

// Get allowance rules for an award
router.get('/awards/:awardId/allowance-rules', async (req, res) => {
  try {
    const awardId = parseInt(req.params.awardId);
    const rules = await storage.getAllowanceRulesByAward(awardId);
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching allowance rules' });
  }
});

// Create allowance rule
router.post('/awards/:awardId/allowance-rules', async (req, res) => {
  try {
    const awardId = parseInt(req.params.awardId);
    const ruleData = insertAllowanceRuleSchema.parse({
      ...req.body,
      awardId,
    });

    const rule = await storage.createAllowanceRule(ruleData);
    res.status(201).json(rule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid allowance rule data', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error creating allowance rule' });
    }
  }
});

// Public Holidays Routes

// Get public holidays
router.get('/public-holidays', async (req, res) => {
  try {
    const { state, year } = req.query;

    let holidays;
    if (state) {
      holidays = await storage.getPublicHolidaysByState(state as string);
    } else if (year) {
      holidays = await storage.getPublicHolidaysByYear(parseInt(year as string));
    } else {
      holidays = await storage.getAllPublicHolidays();
    }

    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public holidays' });
  }
});

// Create public holiday
router.post('/public-holidays', async (req, res) => {
  try {
    const holidayData = insertPublicHolidaySchema.parse(req.body);
    const holiday = await storage.createPublicHoliday(holidayData);

    res.status(201).json(holiday);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid public holiday data', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error creating public holiday' });
    }
  }
});

export default router;
