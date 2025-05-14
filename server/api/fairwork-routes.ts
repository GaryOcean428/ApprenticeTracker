import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { awards, awardClassifications, awardRates } from '@shared/schema/awards';

const router = Router();

// Schema for validating query parameters for fetching award rates
const fetchRatesQuerySchema = z.object({
  awardId: z.string().optional(),
  awardCode: z.string().optional(),
  year: z.coerce.number().optional(),
  isAdult: z.coerce.boolean().optional().default(false),
  hasCompletedYear12: z.coerce.boolean().optional().default(false),
  sector: z.string().optional(),
  apprenticeYear: z.coerce.number().optional(),
  includeAllYears: z.coerce.boolean().optional().default(false),
});

// API endpoint to fetch award rates
// This endpoint serves as a bridge between the FairWork API and our internal data
router.get('/rates', async (req: Request, res: Response) => {
  try {
    const query = fetchRatesQuerySchema.parse(req.query);
    
    // Build the base query
    let ratesQuery = db.select().from(awardRates);
    
    if (query.awardId) {
      ratesQuery = ratesQuery.where(eq(awardRates.awardId, query.awardId));
    }
    
    if (query.awardCode) {
      // Join with awards table to filter by code
      const awardSubquery = db.select().from(awards)
        .where(eq(awards.code, query.awardCode))
        .limit(1);
      
      const [award] = await awardSubquery;
      
      if (!award) {
        return res.status(404).json({ 
          error: 'Award not found', 
          message: `No award found with code ${query.awardCode}` 
        });
      }
      
      ratesQuery = ratesQuery.where(eq(awardRates.awardId, award.id));
    }
    
    if (query.year) {
      ratesQuery = ratesQuery.where(eq(awardRates.year, query.year));
    }
    
    if (query.isAdult) {
      ratesQuery = ratesQuery.where(eq(awardRates.isAdult, true));
    }
    
    if (query.hasCompletedYear12) {
      ratesQuery = ratesQuery.where(eq(awardRates.hasCompletedYear12, true));
    }
    
    if (query.sector) {
      ratesQuery = ratesQuery.where(eq(awardRates.sector, query.sector));
    }
    
    if (query.apprenticeYear && !query.includeAllYears) {
      ratesQuery = ratesQuery.where(eq(awardRates.apprenticeYear, query.apprenticeYear));
    }
    
    // Execute the query
    const rates = await ratesQuery;
    
    if (rates.length === 0) {
      return res.status(404).json({ 
        error: 'No rates found', 
        message: 'No rates found matching the specified criteria' 
      });
    }
    
    return res.json({ 
      success: true,
      data: rates 
    });
  } catch (error) {
    console.error('Error fetching award rates:', error);
    return res.status(400).json({ 
      error: 'Invalid request',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

// Endpoint to fetch all available awards
router.get('/awards', async (_req: Request, res: Response) => {
  try {
    const allAwards = await db.select().from(awards);
    return res.json({
      success: true,
      data: allAwards
    });
  } catch (error) {
    console.error('Error fetching awards:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

// Endpoint to fetch award classifications
router.get('/classifications', async (req: Request, res: Response) => {
  try {
    const { awardId } = req.query;
    
    if (!awardId) {
      return res.status(400).json({ 
        error: 'Missing parameter',
        message: 'awardId is required'
      });
    }
    
    const classifications = await db.select()
      .from(awardClassifications)
      .where(eq(awardClassifications.awardId, awardId as string));
    
    return res.json({
      success: true,
      data: classifications
    });
  } catch (error) {
    console.error('Error fetching classifications:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

// Endpoint to fetch historical award rates for trend analysis
router.get('/historical-rates', async (req: Request, res: Response) => {
  try {
    const { awardId, classificationId, years } = req.query;
    
    if (!awardId || !classificationId) {
      return res.status(400).json({ 
        error: 'Missing parameters',
        message: 'awardId and classificationId are required'
      });
    }
    
    let ratesQuery = db.select()
      .from(awardRates)
      .where(eq(awardRates.awardId, awardId as string))
      .where(eq(awardRates.classificationId, classificationId as string));
    
    // If specific years are requested
    if (years) {
      const yearList = (years as string).split(',').map(y => parseInt(y.trim()));
      // Use 'in' operator once we have it properly typed
      // For now, we'll just filter afterwards
      const allRates = await ratesQuery;
      const filteredRates = allRates.filter(rate => yearList.includes(rate.year));
      
      return res.json({
        success: true,
        data: filteredRates
      });
    }
    
    const rates = await ratesQuery;
    
    return res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

// Endpoint to sync rates from Fair Work API
// This would be scheduled to run periodically
router.post('/sync', async (_req: Request, res: Response) => {
  try {
    // This would call the syncFairWorkData function and update our database
    // For now, we'll just return a success message
    return res.json({
      success: true,
      message: 'Fair Work data sync initiated'
    });
  } catch (error) {
    console.error('Error syncing Fair Work data:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

export default router;