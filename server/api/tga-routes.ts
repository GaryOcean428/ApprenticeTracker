import type { Express } from "express";
import { tgaService } from "../services/tga-service";
import { db } from "../db";
import { qualifications, unitsOfCompetency, qualificationStructure } from "@shared/schema";
import { eq, and, desc, asc, like, or } from "drizzle-orm";

export function registerTGARoutes(app: Express) {
  // Register specific routes before parameterized routes to prevent conflicts
  
  /**
   * Search qualifications in our database
   */
  app.get("/api/qualifications/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        return res.status(400).json({
          message: "Search query must be at least 2 characters"
        });
      }
      
      console.log(`Searching qualifications with query: ${query}`);
      
      try {
        // Make search more effective by handling common cases
        const searchTerm = query.trim();
        
        console.log(`Processing search term: '${searchTerm}'`);
        
        const searchResults = await db
          .select()
          .from(qualifications)
          .where(
            or(
              // Search by code (usually uppercase)
              like(qualifications.qualificationCode, `%${searchTerm.toUpperCase()}%`),
              
              // Case-insensitive search on title
              like(db.sql`UPPER(${qualifications.qualificationTitle})`, `%${searchTerm.toUpperCase()}%`),
              
              // Search for terms within the description
              searchTerm.length > 3 
                ? like(db.sql`UPPER(${qualifications.qualificationDescription})`, `%${searchTerm.toUpperCase()}%`)
                : db.sql`1=0`
            )
          );
        
        console.log(`Found ${searchResults.length} qualifications matching '${query}'`);
        return res.json(searchResults);
      } catch (searchError) {
        console.error(`Database error in qualifications search:`, searchError);
        
        // For development, return a helpful error response with more details
        return res.status(500).json({
          message: "Database error while searching qualifications",
          details: searchError instanceof Error ? searchError.message : 'Unknown error',
          query: query
        });
      }
      
    } catch (error) {
      console.error(`Error searching qualifications:`, error);
      return res.status(500).json({
        message: "Error searching qualifications",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  /**
   * Search for qualifications in the Training.gov.au system
   */
  app.get("/api/tga/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      if (!query || query.length < 3) {
        return res.status(400).json({
          message: "Search query must be at least 3 characters"
        });
      }
      
      const results = await tgaService.searchQualifications(query, limit);
      res.json(results);
    } catch (error) {
      console.error("Error searching TGA qualifications:", error);
      res.status(500).json({
        message: "Error searching TGA qualifications",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  /**
   * Get qualification details from Training.gov.au by code
   */
  app.get("/api/tga/qualification/:code", async (req, res) => {
    try {
      const code = req.params.code;
      
      const qualificationDetails = await tgaService.getQualificationByCode(code);
      
      if (!qualificationDetails) {
        return res.status(404).json({
          message: `Qualification with code ${code} not found in TGA`
        });
      }
      
      res.json(qualificationDetails);
    } catch (error) {
      console.error(`Error fetching TGA qualification ${req.params.code}:`, error);
      res.status(500).json({
        message: "Error fetching TGA qualification",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  /**
   * Import a qualification from Training.gov.au into our database
   * Handles both GET and POST methods for flexibility
   */
  app.all("/api/tga/import/:code", async (req, res) => {
    try {
      const code = req.params.code;
      console.log(`Importing qualification with code: ${code}`);
      
      // Validate qualification code format (typically alphanumeric with some variations)
      if (!/^[A-Za-z0-9_-]+$/.test(code)) {
        return res.status(400).json({
          message: `Invalid qualification code format: ${code}`
        });
      }
      
      const qualificationId = await tgaService.importQualification(code);
      
      res.json({
        message: `Qualification ${code} imported successfully`,
        qualificationId
      });
    } catch (error) {
      console.error(`Error importing TGA qualification ${req.params.code}:`, error);
      res.status(500).json({
        message: "Error importing TGA qualification",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  /**
   * Legacy endpoint support for qualification import
   */
  app.post("/api/tga/import/qualification/:code", async (req, res) => {
    // Redirect to the new endpoint format
    res.redirect(307, `/api/tga/import/${req.params.code}`);
  });
  
  /**
   * Sync qualifications based on a search term
   */
  app.post("/api/tga/sync", async (req, res) => {
    try {
      // Support both parameter formats for compatibility
      const searchQuery = req.body.searchQuery || req.body.query;
      const limit = req.body.limit || 20;
      
      console.log(`API: Syncing qualifications with query: '${searchQuery}'`);
      
      if (!searchQuery || searchQuery.length < 3) {
        return res.status(400).json({
          message: "Search query must be at least 3 characters"
        });
      }
      
      const syncCount = await tgaService.syncQualifications(searchQuery, limit);
      
      res.json({
        message: `Synced ${syncCount} qualifications for search "${searchQuery}"`,
        count: syncCount
      });
    } catch (error) {
      console.error("Error syncing TGA qualifications:", error);
      res.status(500).json({
        message: "Error syncing TGA qualifications",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  /**
   * Get all qualifications from our database
   */
  app.get("/api/qualifications", async (req, res) => {
    try {
      const allQualifications = await db
        .select()
        .from(qualifications);
      
      res.json(allQualifications);
    } catch (error) {
      console.error("Error fetching qualifications:", error);
      res.status(500).json({
        message: "Error fetching qualifications from database",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  /**
   * Get a specific qualification from our database by ID
   */
  app.get("/api/qualifications/:id", async (req, res) => {
    try {
      // Safely parse the ID, ensuring it's a valid number or returning NaN
      const idParam = req.params.id;
      const id = parseInt(idParam);
      
      // Check if id is a valid number
      if (isNaN(id)) {
        return res.status(400).json({
          message: `Invalid qualification ID: '${idParam}' is not a number`
        });
      }
      
      console.log(`Fetching qualification with ID: ${id}`);
      
      // Get the qualification
      const [qualification] = await db
        .select()
        .from(qualifications)
        .where(eq(qualifications.id, id));
      
      if (!qualification) {
        return res.status(404).json({
          message: `Qualification with ID ${id} not found`
        });
      }
      
      // Get the qualification structure (units)
      const structure = await db
        .select({
          isCore: qualificationStructure.isCore,
          unit: unitsOfCompetency
        })
        .from(qualificationStructure)
        .innerJoin(
          unitsOfCompetency,
          eq(qualificationStructure.unitId, unitsOfCompetency.id)
        )
        .where(eq(qualificationStructure.qualificationId, id));
      
      // Organize units by core and elective
      const coreUnits = structure
        .filter(item => item.isCore === true)
        .map(item => item.unit);
      
      const electiveUnits = structure
        .filter(item => item.isCore === false)
        .map(item => item.unit);
      
      console.log(`Found ${coreUnits.length} core units and ${electiveUnits.length} elective units`);
      
      res.json({
        ...qualification,
        units: {
          core: coreUnits,
          elective: electiveUnits
        }
      });
    } catch (error) {
      console.error(`Error fetching qualification ${req.params.id}:`, error);
      res.status(500).json({
        message: "Error fetching qualification details",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Duplicate sync route removed - handled by the other /api/tga/sync endpoint

  // Removed duplicate route

}
