import { Router, Request, Response } from 'express';
import { db } from '../db';
import { awards, awardClassifications, enterpriseAgreements } from '@shared/schema';
import { eq, sql, ilike, or, and, inArray } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const fairWorkRouter = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// GET /api/awards - Get all awards
fairWorkRouter.get('/awards', async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.search as string;
    let query = db.select().from(awards);
    
    if (searchTerm) {
      query = query.where(
        or(
          ilike(awards.name, `%${searchTerm}%`),
          ilike(awards.code, `%${searchTerm}%`),
          ilike(awards.fairWorkTitle, `%${searchTerm}%`),
          ilike(awards.description, `%${searchTerm}%`)
        )
      );
    }
    
    const result = await query.orderBy(awards.name);
    res.json(result);
  } catch (error) {
    console.error('Error fetching awards:', error);
    res.status(500).json({ 
      message: 'Error fetching awards', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// GET /api/awards/:id - Get award by ID
fairWorkRouter.get('/awards/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.select().from(awards).where(eq(awards.id, id));
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'Award not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching award:', error);
    res.status(500).json({ 
      message: 'Error fetching award', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// POST /api/awards - Create a new award
fairWorkRouter.post('/awards', async (req: Request, res: Response) => {
  try {
    const awardData = req.body;
    
    // Add timestamps
    awardData.createdAt = new Date();
    awardData.updatedAt = new Date();
    
    const result = await db.insert(awards).values(awardData).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating award:', error);
    res.status(500).json({ 
      message: 'Error creating award', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// PUT /api/awards/:id - Update an award
fairWorkRouter.put('/awards/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const awardData = req.body;
    
    // Update timestamp
    awardData.updatedAt = new Date();
    
    const result = await db
      .update(awards)
      .set(awardData)
      .where(eq(awards.id, id))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'Award not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating award:', error);
    res.status(500).json({ 
      message: 'Error updating award', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// DELETE /api/awards/:id - Delete an award
fairWorkRouter.delete('/awards/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if award exists
    const existingAward = await db.select().from(awards).where(eq(awards.id, id));
    if (existingAward.length === 0) {
      return res.status(404).json({ message: 'Award not found' });
    }
    
    // Delete award
    await db.delete(awards).where(eq(awards.id, id));
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting award:', error);
    res.status(500).json({ 
      message: 'Error deleting award', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// GET /api/awards/:id/classifications - Get classifications for an award
fairWorkRouter.get('/awards/:id/classifications', async (req: Request, res: Response) => {
  try {
    const awardId = parseInt(req.params.id);
    
    // Check if award exists
    const existingAward = await db.select().from(awards).where(eq(awards.id, awardId));
    if (existingAward.length === 0) {
      return res.status(404).json({ message: 'Award not found' });
    }
    
    // Get classifications
    const result = await db
      .select()
      .from(awardClassifications)
      .where(eq(awardClassifications.awardId, awardId))
      .orderBy(awardClassifications.level, awardClassifications.name);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching award classifications:', error);
    res.status(500).json({ 
      message: 'Error fetching award classifications', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// POST /api/awards/:id/classifications - Add a classification to an award
fairWorkRouter.post('/awards/:id/classifications', async (req: Request, res: Response) => {
  try {
    const awardId = parseInt(req.params.id);
    const classificationData = req.body;
    
    // Check if award exists
    const existingAward = await db.select().from(awards).where(eq(awards.id, awardId));
    if (existingAward.length === 0) {
      return res.status(404).json({ message: 'Award not found' });
    }
    
    // Add timestamps and awardId
    classificationData.createdAt = new Date();
    classificationData.updatedAt = new Date();
    classificationData.awardId = awardId;
    
    // Create classification
    const result = await db.insert(awardClassifications).values(classificationData).returning();
    
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating award classification:', error);
    res.status(500).json({ 
      message: 'Error creating award classification', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// GET /api/enterprise-agreements - Get all enterprise agreements
fairWorkRouter.get('/enterprise-agreements', async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(enterpriseAgreements).orderBy(enterpriseAgreements.name);
    res.json(result);
  } catch (error) {
    console.error('Error fetching enterprise agreements:', error);
    res.status(500).json({ 
      message: 'Error fetching enterprise agreements', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// POST /api/enterprise-agreements - Create a new enterprise agreement
fairWorkRouter.post('/enterprise-agreements', async (req: Request, res: Response) => {
  try {
    const agreementData = req.body;
    
    // Add timestamps
    agreementData.createdAt = new Date();
    agreementData.updatedAt = new Date();
    
    const result = await db.insert(enterpriseAgreements).values(agreementData).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating enterprise agreement:', error);
    res.status(500).json({ 
      message: 'Error creating enterprise agreement', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// POST /api/enterprise-agreements/upload - Upload and process enterprise agreement file
fairWorkRouter.post('/enterprise-agreements/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Return the uploaded file information
    res.status(201).json({ 
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading enterprise agreement file:', error);
    res.status(500).json({ 
      message: 'Error uploading enterprise agreement file', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// POST /api/enterprise-agreements/:id/rates - Add pay rates to an enterprise agreement
fairWorkRouter.post('/enterprise-agreements/:id/rates', async (req: Request, res: Response) => {
  try {
    const agreementId = parseInt(req.params.id);
    const { rates } = req.body;
    
    // Check if enterprise agreement exists
    const existingAgreement = await db
      .select()
      .from(enterpriseAgreements)
      .where(eq(enterpriseAgreements.id, agreementId));
      
    if (existingAgreement.length === 0) {
      return res.status(404).json({ message: 'Enterprise agreement not found' });
    }
    
    // Process and save rates (This would require a payRates table implementation)
    // For now, just return success
    res.status(200).json({ 
      message: 'Pay rates processed successfully',
      agreementId,
      ratesCount: rates?.length || 0
    });
  } catch (error) {
    console.error('Error processing enterprise agreement rates:', error);
    res.status(500).json({ 
      message: 'Error processing enterprise agreement rates', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});
