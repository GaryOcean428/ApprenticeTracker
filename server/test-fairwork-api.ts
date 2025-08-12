import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { eq } from 'drizzle-orm';
import { awards, awardClassifications, penaltyRules } from '../shared/schema';
import { db } from './db';

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

app.get('/test-api-penalty-rules/:awardId', async (req, res) => {
  try {
    const { awardId } = req.params;
    console.log(`Testing penalty rules API for award ID ${awardId}`);

    // Get penalty rules for this award
    const rules = await db
      .select()
      .from(penaltyRules)
      .where(eq(penaltyRules.awardId, parseInt(awardId)));

    console.log(`Found ${rules.length} penalty rules for award ID ${awardId}`);

    return res.json({
      success: true,
      message: 'Penalty Rules test API',
      data: {
        penaltyRules: rules,
      },
    });
  } catch (error) {
    console.error('Error testing penalty rules API', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to test penalty rules API',
    });
  }
});

app.get('/test-api-all-penalty-rules', async (req, res) => {
  try {
    console.log('Testing all penalty rules API');

    // Get all penalty rules
    const rules = await db.select().from(penaltyRules);

    console.log(`Found ${rules.length} total penalty rules`);

    return res.json({
      success: true,
      message: 'All Penalty Rules test API',
      data: {
        penaltyRules: rules,
      },
    });
  } catch (error) {
    console.error('Error testing all penalty rules API', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to test all penalty rules API',
    });
  }
});

const PORT = 5001;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Fair Work API test server running on port ${PORT}`);
});
