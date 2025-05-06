import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { awards, awardClassifications, penaltyRules, allowanceRules } from '../shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';

// This file is for direct testing of Fair Work API routes without Vite interference

const app = express();
app.use(cors());
app.use(express.json());

app.get('/test-api-awards', async (req, res) => {
  try {
    console.log('Testing awards API');
    const allAwards = await db.select().from(awards).limit(10);
    return res.json({
      success: true,
      message: 'Awards test API',
      data: {
        awards: allAwards,
      },
    });
  } catch (error) {
    console.error('Error testing awards API', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to test awards API',
    });
  }
});

app.get('/test-api-classifications/:awardId', async (req, res) => {
  try {
    const { awardId } = req.params;
    console.log(`Testing classifications API for award ID ${awardId}`);
    
    // Get classifications for this award
    const classifications = await db
      .select()
      .from(awardClassifications)
      .where(eq(awardClassifications.awardId, parseInt(awardId)));
    
    console.log(`Found ${classifications.length} classifications for award ID ${awardId}`);
    
    return res.json({
      success: true,
      message: 'Classifications test API',
      data: {
        classifications,
      },
    });
  } catch (error) {
    console.error('Error testing classifications API', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to test classifications API',
    });
  }
});

const PORT = 5001;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Fair Work API test server running on port ${PORT}`);
});
