/**
 * Fair Work API Routes
 *
 * These routes provide access to Fair Work data and synchronization functionality.
 */

import { Router } from "express";
import { FairWorkApiClient } from "../../services/fairwork/api-client";
import { createFairWorkSyncScheduler } from "../../services/fairwork/scheduler";
import logger from "../../utils/logger";
import { authenticateUser, requirePermission } from "../../middleware/permissions";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { awards, awardClassifications, penaltyRules, allowanceRules } from "@shared/schema";

// Create router
const router = Router();

// Initialize API client
const apiClient = new FairWorkApiClient({
  baseUrl: process.env.FAIRWORK_API_URL || "https://api.fairwork.gov.au",
  apiKey: process.env.FAIRWORK_API_KEY || "",
});

// Initialize scheduler
const syncScheduler = createFairWorkSyncScheduler(apiClient);

/**
 * @route GET /api/fairwork/awards
 * @description Get all awards from our local database
 * @access Admin, Developer
 */
router.get("/awards", authenticateUser, requirePermission("read", "award"), async (req, res) => {
  try {
    logger.info("Getting all awards from database");
    
    // Query the database for all awards
    const allAwards = await db.select().from(awards);
    
    return res.json({
      success: true,
      data: allAwards,
    });
  } catch (error) {
    logger.error("Error fetching awards", { error });
    return res.status(500).json({
      success: false,
      error: "Failed to fetch awards",
    });
  }
});

/**
 * @route GET /api/fairwork/awards/:code
 * @description Get a specific award and its classifications
 * @access Admin, Developer
 */
router.get("/awards/:code", authenticateUser, requirePermission("read", "award"), async (req, res) => {
  try {
    const { code } = req.params;
    logger.info(`Getting award ${code} from database`);
    
    // Get the award
    const [award] = await db.select().from(awards).where(eq(awards.code, code));
    
    if (!award) {
      return res.status(404).json({
        success: false,
        error: `Award with code ${code} not found`,
      });
    }
    
    // Get the classifications for this award
    const classifications = await db
      .select()
      .from(awardClassifications)
      .where(eq(awardClassifications.awardId, award.id));
    
    return res.json({
      success: true,
      data: {
        award,
        classifications,
      },
    });
  } catch (error) {
    logger.error("Error fetching award", { error, awardCode: req.params.code });
    return res.status(500).json({
      success: false,
      error: "Failed to fetch award",
    });
  }
});

/**
 * @route GET /api/fairwork/awards/:code/classifications
 * @description Get classifications for a specific award
 * @access Admin, Developer
 */
router.get("/awards/:code/classifications", authenticateUser, requirePermission("read", "award"), async (req, res) => {
  try {
    const { code } = req.params;
    logger.info(`Getting classifications for award ${code}`);
    
    // Get the award
    const [award] = await db.select().from(awards).where(eq(awards.code, code));
    
    if (!award) {
      return res.status(404).json({
        success: false,
        error: `Award with code ${code} not found`,
      });
    }
    
    // Get the classifications for this award
    const classifications = await db
      .select()
      .from(awardClassifications)
      .where(eq(awardClassifications.awardId, award.id));
    
    return res.json({
      success: true,
      data: classifications,
    });
  } catch (error) {
    logger.error("Error fetching award classifications", { error, awardCode: req.params.code });
    return res.status(500).json({
      success: false,
      error: "Failed to fetch award classifications",
    });
  }
});

/**
 * @route GET /api/fairwork/awards/:code/penalties
 * @description Get penalties for a specific award
 * @access Admin, Developer
 */
router.get("/awards/:code/penalties", authenticateUser, requirePermission("read", "award"), async (req, res) => {
  try {
    const { code } = req.params;
    logger.info(`Getting penalties for award ${code}`);
    
    // Get the award
    const [award] = await db.select().from(awards).where(eq(awards.code, code));
    
    if (!award) {
      return res.status(404).json({
        success: false,
        error: `Award with code ${code} not found`,
      });
    }
    
    // Get the penalties for this award
    const penalties = await db
      .select()
      .from(penaltyRules)
      .where(eq(penaltyRules.awardId, award.id));
    
    return res.json({
      success: true,
      data: penalties,
    });
  } catch (error) {
    logger.error("Error fetching award penalties", { error, awardCode: req.params.code });
    return res.status(500).json({
      success: false,
      error: "Failed to fetch award penalties",
    });
  }
});

/**
 * @route GET /api/fairwork/awards/:code/allowances
 * @description Get allowances for a specific award
 * @access Admin, Developer
 */
router.get("/awards/:code/allowances", authenticateUser, requirePermission("read", "award"), async (req, res) => {
  try {
    const { code } = req.params;
    logger.info(`Getting allowances for award ${code}`);
    
    // Get the award
    const [award] = await db.select().from(awards).where(eq(awards.code, code));
    
    if (!award) {
      return res.status(404).json({
        success: false,
        error: `Award with code ${code} not found`,
      });
    }
    
    // Get the allowances for this award
    const allowances = await db
      .select()
      .from(allowanceRules)
      .where(eq(allowanceRules.awardId, award.id));
    
    return res.json({
      success: true,
      data: allowances,
    });
  } catch (error) {
    logger.error("Error fetching award allowances", { error, awardCode: req.params.code });
    return res.status(500).json({
      success: false,
      error: "Failed to fetch award allowances",
    });
  }
});

/**
 * @route POST /api/fairwork/sync
 * @description Trigger a manual sync of Fair Work data
 * @access Admin, Developer
 */
router.post("/sync", authenticateUser, requirePermission("update", "award"), async (req, res) => {
  try {
    const { forceUpdate, awardCode } = req.body;
    logger.info("Triggering manual Fair Work data sync", { forceUpdate, awardCode });
    
    // Start the sync in the background
    syncScheduler.triggerSync({
      forceUpdate: !!forceUpdate,
      targetAwardCode: awardCode,
    })
      .then(() => {
        logger.info("Manual Fair Work data sync completed successfully");
      })
      .catch(error => {
        logger.error("Error in manual Fair Work data sync", { error });
      });
    
    // Return immediately to avoid timeout
    return res.json({
      success: true,
      message: "Fair Work data sync started. This process may take several minutes to complete.",
    });
  } catch (error) {
    logger.error("Error starting Fair Work data sync", { error });
    return res.status(500).json({
      success: false,
      error: "Failed to start Fair Work data sync",
    });
  }
});

/**
 * @route GET /api/fairwork/sync/status
 * @description Get the status of the Fair Work data sync
 * @access Admin, Developer
 */
router.get("/sync/status", authenticateUser, requirePermission("read", "award"), async (req, res) => {
  try {
    logger.info("Getting Fair Work data sync status");
    
    const lastSyncTime = syncScheduler.getLastSyncTime();
    const nextSyncTime = syncScheduler.getNextSyncTime();
    
    return res.json({
      success: true,
      data: {
        lastSyncTime,
        nextSyncTime,
        status: lastSyncTime ? "active" : "pending",
      },
    });
  } catch (error) {
    logger.error("Error getting Fair Work data sync status", { error });
    return res.status(500).json({
      success: false,
      error: "Failed to get Fair Work data sync status",
    });
  }
});

// Start the sync scheduler when the server starts
syncScheduler.start().catch(error => {
  logger.error("Failed to start Fair Work sync scheduler", { error });
});

export default router;
