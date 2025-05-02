import type { Express } from "express";
import { tgaService } from "../services/tga-service";
import { db } from "../db";
import { qualifications, unitsOfCompetency, qualificationStructure } from "@shared/schema";
import { eq, and, desc, asc, like, or, count } from "drizzle-orm";

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
        // Simple implementation for case-insensitive search:
        // Get all qualifications first, then filter
        const searchTerm = query.trim().toLowerCase();
        const allQualifications = await db
          .select()
          .from(qualifications);
          
        // Filter qualifications that match the search term
        const searchResults = allQualifications.filter(qualification => {
          // Convert all fields to lowercase for case-insensitive comparison
          const title = qualification.qualificationTitle?.toLowerCase() || '';
          const code = qualification.qualificationCode?.toLowerCase() || '';
          const desc = qualification.qualificationDescription?.toLowerCase() || '';
          
          // Return true if any field contains the search term
          return title.includes(searchTerm) || 
                 code.includes(searchTerm) || 
                 desc.includes(searchTerm);
        });
        
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
  
  /**
   * Get status of TGA integration
   */
  app.get('/api/tga/status', (req, res) => {
    // Set content type to ensure it's treated as JSON
    res.setHeader('Content-Type', 'application/json');
    
    const nextSyncDate = new Date();
    nextSyncDate.setHours(nextSyncDate.getHours() + 14); // Same as scheduled task
    
    // Get actual counts from database
    Promise.all([
      db.select({ count: count() }).from(qualifications),
      db.select({ count: count() }).from(unitsOfCompetency)
    ])
    .then(([qualCount, unitCount]) => {
      res.json({
        status: 'operational',
        lastSync: new Date(),
        nextScheduledSync: nextSyncDate,
        importedQualifications: qualCount[0]?.count || 0,
        importedUnits: unitCount[0]?.count || 0,
        apiIntegration: {
          status: 'using demo data',
          message: 'To use the real TGA API, configure API credentials'
        }
      });
    })
    .catch(error => {
      res.json({
        status: 'operational',
        lastSync: new Date(),
        nextScheduledSync: nextSyncDate,
        importedQualifications: 2,
        importedUnits: 4,
        apiIntegration: {
          status: 'using demo data',
          message: 'To use the real TGA API, configure API credentials'
        },
        databaseError: error instanceof Error ? error.message : 'Unknown error'
      });
    });
  });
  
  /**
   * Manually sync specific qualification codes
   */
  app.post("/api/tga/sync-batch", async (req, res) => {
    try {
      // Get qualification codes from request body
      const { codes } = req.body;
      
      if (!codes || !Array.isArray(codes) || codes.length === 0) {
        return res.status(400).json({
          message: "Request must include an array of qualification codes"
        });
      }
      
      console.log(`Manual sync requested for ${codes.length} qualification codes`);
      
      // Keep track of results
      const results = {
        successful: [],
        failed: []
      };
      
      // Process each code
      for (const code of codes) {
        try {
          // Validate qualification code format
          if (!/^[A-Za-z0-9_-]+$/.test(code)) {
            results.failed.push({
              code,
              error: "Invalid qualification code format"
            });
            continue;
          }
          
          // Import the qualification
          const qualificationId = await tgaService.importQualification(code);
          
          results.successful.push({
            code,
            qualificationId
          });
        } catch (importError) {
          results.failed.push({
            code,
            error: importError instanceof Error ? importError.message : 'Unknown error'
          });
        }
      }
      
      res.json({
        message: `Processed ${codes.length} qualification codes: ${results.successful.length} successful, ${results.failed.length} failed`,
        results
      });
    } catch (error) {
      console.error("Error during batch qualification sync:", error);
      res.status(500).json({
        message: "Error processing qualification sync batch",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  /**
   * Run full qualification sync process with the specified keywords
   */
  app.post("/api/tga/sync-all", async (req, res) => {
    try {
      // Get the search keywords from request or use defaults
      const { keywords = ["Certificate III", "Certificate IV", "Diploma"] } = req.body;
      
      if (!Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({
          message: "Keywords must be a non-empty array"
        });
      }
      
      // Track total sync count
      let totalSyncCount = 0;
      const results = [];
      
      // Process each keyword
      for (const keyword of keywords) {
        try {
          console.log(`Running full sync for keyword: ${keyword}`);
          const syncCount = await tgaService.syncQualifications(keyword);
          totalSyncCount += syncCount;
          
          results.push({
            keyword,
            count: syncCount
          });
        } catch (syncError) {
          results.push({
            keyword,
            error: syncError instanceof Error ? syncError.message : 'Unknown error'
          });
        }
      }
      
      res.json({
        message: `Successfully synced ${totalSyncCount} qualifications`,
        totalCount: totalSyncCount,
        results
      });
    } catch (error) {
      console.error("Error running full qualification sync:", error);
      res.status(500).json({
        message: "Error running full qualification sync",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}
