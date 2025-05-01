import type { Express } from "express";
import { tgaService } from "../services/tga-service";
import { db } from "../db";
import { qualifications, unitsOfCompetency, qualificationStructure } from "@shared/schema";
import { eq, and, desc, asc, like, or } from "drizzle-orm";

export function registerTGARoutes(app: Express) {
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
   */
  app.post("/api/tga/import/qualification/:code", async (req, res) => {
    try {
      const code = req.params.code;
      
      const qualificationId = await tgaService.importQualification(code);
      
      res.status(201).json({
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
   * Sync qualifications based on a search term
   */
  app.post("/api/tga/sync", async (req, res) => {
    try {
      const { searchQuery, limit } = req.body;
      
      if (!searchQuery || searchQuery.length < 3) {
        return res.status(400).json({
          message: "Search query must be at least 3 characters"
        });
      }
      
      const syncCount = await tgaService.syncQualifications(searchQuery, limit || 20);
      
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
   * Get a specific qualification from our database
   */
  app.get("/api/qualifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
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
          unitType: qualificationStructure.unitType,
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
        .filter(item => item.unitType === "core")
        .map(item => item.unit);
      
      const electiveUnits = structure
        .filter(item => item.unitType === "elective")
        .map(item => item.unit);
      
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
      
      const searchResults = await db
        .select()
        .from(qualifications)
        .where(
          or(
            like(qualifications.code, `%${query}%`),
            like(qualifications.name, `%${query}%`)
          )
        );
      
      res.json(searchResults);
    } catch (error) {
      console.error(`Error searching qualifications:`, error);
      res.status(500).json({
        message: "Error searching qualifications",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
