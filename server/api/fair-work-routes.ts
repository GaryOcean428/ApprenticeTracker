import express, { Request, Response } from 'express';
import { db } from "../db";
import { awards, awardClassifications, enterpriseAgreements, payRates } from '@shared/schema';
import { eq } from 'drizzle-orm';
import multer from 'multer';

// Set up multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const fairWorkRouter = express.Router();

// GET /api/awards - Get all awards
fairWorkRouter.get('/awards', async (req: Request, res: Response) => {
  try {
    const allAwards = await db.select().from(awards);
    res.json(allAwards);
  } catch (error) {
    console.error('Error fetching awards:', error);
    res.status(500).json({ error: 'Failed to fetch awards' });
  }
});

// GET /api/awards/:id - Get a specific award
fairWorkRouter.get('/awards/:id', async (req: Request, res: Response) => {
  try {
    const award = await db.select().from(awards).where(eq(awards.id, parseInt(req.params.id)));
    
    if (award.length === 0) {
      return res.status(404).json({ error: 'Award not found' });
    }
    
    res.json(award[0]);
  } catch (error) {
    console.error('Error fetching award:', error);
    res.status(500).json({ error: 'Failed to fetch award' });
  }
});

// POST /api/awards - Create a new award
fairWorkRouter.post('/awards', async (req: Request, res: Response) => {
  try {
    const newAward = await db.insert(awards).values(req.body).returning();
    res.status(201).json(newAward[0]);
  } catch (error) {
    console.error('Error creating award:', error);
    res.status(500).json({ error: 'Failed to create award' });
  }
});

// PUT /api/awards/:id - Update an award
fairWorkRouter.put('/awards/:id', async (req: Request, res: Response) => {
  try {
    const updatedAward = await db.update(awards)
      .set(req.body)
      .where(eq(awards.id, parseInt(req.params.id)))
      .returning();
    
    if (updatedAward.length === 0) {
      return res.status(404).json({ error: 'Award not found' });
    }
    
    res.json(updatedAward[0]);
  } catch (error) {
    console.error('Error updating award:', error);
    res.status(500).json({ error: 'Failed to update award' });
  }
});

// DELETE /api/awards/:id - Delete an award
fairWorkRouter.delete('/awards/:id', async (req: Request, res: Response) => {
  try {
    const deletedAward = await db.delete(awards)
      .where(eq(awards.id, parseInt(req.params.id)))
      .returning();
    
    if (deletedAward.length === 0) {
      return res.status(404).json({ error: 'Award not found' });
    }
    
    res.json({ message: 'Award deleted successfully' });
  } catch (error) {
    console.error('Error deleting award:', error);
    res.status(500).json({ error: 'Failed to delete award' });
  }
});

// GET /api/awards/:id/classifications - Get all classifications for an award
fairWorkRouter.get('/awards/:id/classifications', async (req: Request, res: Response) => {
  try {
    const classifications = await db.select()
      .from(awardClassifications)
      .where(eq(awardClassifications.awardId, parseInt(req.params.id)));
    
    res.json(classifications);
  } catch (error) {
    console.error('Error fetching classifications:', error);
    res.status(500).json({ error: 'Failed to fetch classifications' });
  }
});

// POST /api/awards/:id/classifications - Create a new classification for an award
fairWorkRouter.post('/awards/:id/classifications', async (req: Request, res: Response) => {
  try {
    const awardId = parseInt(req.params.id);
    
    // Verify the award exists
    const award = await db.select().from(awards).where(eq(awards.id, awardId));
    if (award.length === 0) {
      return res.status(404).json({ error: 'Award not found' });
    }
    
    const newClassification = await db.insert(awardClassifications)
      .values({
        ...req.body,
        awardId
      })
      .returning();
    
    res.status(201).json(newClassification[0]);
  } catch (error) {
    console.error('Error creating classification:', error);
    res.status(500).json({ error: 'Failed to create classification' });
  }
});

// GET /api/enterprise-agreements - Get all enterprise agreements
fairWorkRouter.get('/enterprise-agreements', async (req: Request, res: Response) => {
  try {
    const agreements = await db.select().from(enterpriseAgreements);
    res.json(agreements);
  } catch (error) {
    console.error('Error fetching enterprise agreements:', error);
    res.status(500).json({ error: 'Failed to fetch enterprise agreements' });
  }
});

// POST /api/enterprise-agreements - Create a new enterprise agreement
fairWorkRouter.post('/enterprise-agreements', async (req: Request, res: Response) => {
  try {
    const newAgreement = await db.insert(enterpriseAgreements)
      .values(req.body)
      .returning();
    
    res.status(201).json(newAgreement[0]);
  } catch (error) {
    console.error('Error creating enterprise agreement:', error);
    res.status(500).json({ error: 'Failed to create enterprise agreement' });
  }
});

// POST /api/enterprise-agreements/upload - Upload and extract rates from EA document
fairWorkRouter.post('/enterprise-agreements/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Mock extracted pay rates for now
    // In a real implementation, this would use some text analysis or AI to extract rates
    const extractedRates = [
      {
        classification: 'Level 1 - Entry Level',
        rate: 25.50,
        effective_date: new Date().toISOString().split('T')[0],
        notes: 'Extracted from page 12'
      },
      {
        classification: 'Level 2 - Experienced',
        rate: 28.75,
        effective_date: new Date().toISOString().split('T')[0],
        notes: 'Extracted from page 12'
      },
      {
        classification: 'Level 3 - Advanced',
        rate: 32.40,
        effective_date: new Date().toISOString().split('T')[0],
        notes: 'Extracted from page 13'
      }
    ];
    
    res.json({
      success: true,
      fileName: req.file.originalname,
      filePath: req.file.path,
      extractedRates
    });
  } catch (error) {
    console.error('Error processing enterprise agreement:', error);
    res.status(500).json({ error: 'Failed to process enterprise agreement' });
  }
});

// POST /api/enterprise-agreements/:id/rates - Add extracted rates to an EA
fairWorkRouter.post('/enterprise-agreements/:id/rates', async (req: Request, res: Response) => {
  try {
    const agreementId = parseInt(req.params.id);
    const { rates } = req.body;
    
    if (!Array.isArray(rates) || rates.length === 0) {
      return res.status(400).json({ error: 'Valid pay rates are required' });
    }
    
    // Add each rate to the database
    const insertedRates = [];
    for (const rate of rates) {
      const newRate = await db.insert(payRates)
        .values({
          ...rate,
          enterpriseAgreementId: agreementId,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      insertedRates.push(newRate[0]);
    }
    
    res.status(201).json({
      success: true,
      rates: insertedRates
    });
  } catch (error) {
    console.error('Error adding pay rates:', error);
    res.status(500).json({ error: 'Failed to add pay rates' });
  }
});

export default fairWorkRouter;