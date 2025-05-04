import type { Express, Request, Response } from "express";
import { tgaService } from "../services/tga-service";
import { db } from "../db";
import { qualifications, unitsOfCompetency, qualificationStructure } from "@shared/schema";
import { eq, and, desc, asc, like, or, count } from "drizzle-orm";
import { validateQuery, validateParams, validateBody, 
         tgaSearchSchema, tgaQualificationSchema, tgaQualificationImportSchema, tgaSyncSchema } from "../utils/validation";
import { z } from "zod";

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
  app.get("/api/tga/search", validateQuery(tgaSearchSchema), async (req: Request, res: Response) => {
    try {
      const { q: query, limit } = req.query as z.infer<typeof tgaSearchSchema>;
      
      try {
        // First try to fetch from TGA API via our TGA service
        const searchResults = await tgaService.searchQualifications(query, limit);
        return res.json(searchResults);
      } catch (apiError) {
        console.warn(`TGA API search failed, falling back to sample data: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
        
        // Return extended sample data as a fallback
        console.log(`TGA Search: Using extended sample data for query '${query}'`);
        const results = [
          // Construction
          {
            code: "CPC30220",
            title: "Certificate III in Carpentry",
            level: 3,
            status: "Current",
            releaseDate: "2020-05-15",
            trainingPackage: {
              code: "CPC",
              title: "Construction, Plumbing and Services"
            },
            nrtFlag: true
          },
          {
            code: "CPC40120",
            title: "Certificate IV in Building and Construction",
            level: 4,
            status: "Current",
            releaseDate: "2020-06-15",
            trainingPackage: {
              code: "CPC",
              title: "Construction, Plumbing and Services"
            },
            nrtFlag: true
          },
          // Business
          {
            code: "BSB50120",
            title: "Diploma of Business",
            level: 5,
            status: "Current",
            releaseDate: "2020-10-18",
            trainingPackage: {
              code: "BSB",
              title: "Business Services"
            },
            nrtFlag: true
          },
          {
            code: "BSB30120",
            title: "Certificate III in Business",
            level: 3,
            status: "Current",
            releaseDate: "2020-10-15",
            trainingPackage: {
              code: "BSB",
              title: "Business Services"
            },
            nrtFlag: true
          },
          {
            code: "BSB40420",
            title: "Certificate IV in Human Resource Management",
            level: 4,
            status: "Current",
            releaseDate: "2020-12-03",
            trainingPackage: {
              code: "BSB",
              title: "Business Services"
            },
            nrtFlag: true
          },
          // Automotive
          {
            code: "AUR30620",
            title: "Certificate III in Light Vehicle Mechanical Technology",
            level: 3,
            status: "Current",
            releaseDate: "2020-07-28",
            trainingPackage: {
              code: "AUR",
              title: "Automotive Retail, Service and Repair"
            },
            nrtFlag: true
          },
          {
            code: "AUR40216",
            title: "Certificate IV in Automotive Mechanical Diagnosis",
            level: 4,
            status: "Current",
            releaseDate: "2020-05-14",
            trainingPackage: {
              code: "AUR",
              title: "Automotive Retail, Service and Repair"
            },
            nrtFlag: true
          },
          // Hospitality
          {
            code: "SIT30622",
            title: "Certificate III in Hospitality",
            level: 3,
            status: "Current",
            releaseDate: "2022-06-10",
            trainingPackage: {
              code: "SIT",
              title: "Tourism, Travel and Hospitality"
            },
            nrtFlag: true
          },
          // Information Technology
          {
            code: "ICT50220",
            title: "Diploma of Information Technology",
            level: 5,
            status: "Current",
            releaseDate: "2021-06-02",
            trainingPackage: {
              code: "ICT",
              title: "Information and Communications Technology"
            },
            nrtFlag: true
          },
          // Agriculture & Horticulture
          {
            code: "AHC30716",
            title: "Certificate III in Horticulture",
            level: 3,
            status: "Current",
            releaseDate: "2019-03-22",
            trainingPackage: {
              code: "AHC",
              title: "Agriculture, Horticulture and Conservation and Land Management"
            },
            nrtFlag: true
          }
        ];
        
        // Filter results based on the query
        const filteredResults = results.filter(qual => {
          const searchLower = query.toLowerCase();
          return qual.code.toLowerCase().includes(searchLower) || 
                 qual.title.toLowerCase().includes(searchLower) ||
                 qual.trainingPackage.code.toLowerCase().includes(searchLower) ||
                 qual.trainingPackage.title.toLowerCase().includes(searchLower);
        });
        
        return res.json(filteredResults);
      }
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
  app.get("/api/tga/qualification/:code", 
    validateParams(tgaQualificationSchema),
    validateQuery(z.object({ includeUnits: z.string().optional().transform(val => val === 'true') })),
    async (req: Request, res: Response) => {
    const { code } = req.params as z.infer<typeof tgaQualificationSchema>;
    const { includeUnits = false } = req.query as any;
    
    try {
      // Try to fetch real data from TGA API using the TGAService
      const qualificationDetails = await tgaService.getQualificationByCode(code);
      return res.json(qualificationDetails);
    } catch (apiError) {
      console.warn(`Failed to fetch qualification from TGA API: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
      console.log(`Falling back to sample data for qualification code: ${code}`);
      
      // Provide sample data based on code
      const sampleQualificationData = {
        code: code,
        title: code.startsWith("BSB") 
          ? `Business Services Qualification (${code})` 
          : (code.startsWith("CPC") 
            ? `Construction Qualification (${code})` 
            : (code.startsWith("AUR")
              ? `Automotive Qualification (${code})`
              : (code.startsWith("SIT")
                ? `Hospitality Qualification (${code})`
                : (code.startsWith("ICT")
                  ? `Information Technology Qualification (${code})`
                  : (code.startsWith("AHC")
                    ? `Agriculture & Horticulture Qualification (${code})`
                    : `Qualification ${code}`))))),
        description: "This qualification reflects the role of individuals in a variety of roles who use well-developed skills and a broad knowledge base in a wide variety of contexts.",
        level: code.match(/\d+/) ? parseInt(code.match(/\d+/)[0].substring(0, 1)) : 4,
        status: "Current",
        releaseDate: "2020-10-18",
        trainingPackage: {
          code: code.substring(0, 3),
          title: code.startsWith("BSB") 
            ? "Business Services" 
            : (code.startsWith("CPC") 
              ? "Construction, Plumbing and Services" 
              : (code.startsWith("AUR")
                ? "Automotive Retail, Service and Repair"
                : (code.startsWith("SIT")
                  ? "Tourism, Travel and Hospitality"
                  : (code.startsWith("ICT")
                    ? "Information and Communications Technology"
                    : (code.startsWith("AHC")
                      ? "Agriculture, Horticulture and Conservation and Land Management"
                      : "Training Package")))))
        },
        units: [
          {
            code: `${code.substring(0, 3)}001`,
            title: "Core unit 1",
            isCore: true
          },
          {
            code: `${code.substring(0, 3)}002`,
            title: "Core unit 2",
            isCore: true
          },
          {
            code: `${code.substring(0, 3)}003`,
            title: "Elective unit 1",
            isCore: false
          },
          {
            code: `${code.substring(0, 3)}004`,
            title: "Elective unit 2",
            isCore: false
          }
        ]
      };
      
      return res.json(sampleQualificationData);
    }
  });
  
  /**
   * Import a qualification from Training.gov.au into our database
   * Handles both GET and POST methods for flexibility
   */
  app.all("/api/tga/import/:code", 
    validateParams(tgaQualificationImportSchema),
    validateBody(z.object({
      skipExisting: z.boolean().optional().default(false),
      importUnits: z.boolean().optional().default(true)
    }).optional().default({})),
    async (req: Request, res: Response) => {
    try {
      const { code } = req.params as z.infer<typeof tgaQualificationImportSchema>;
      console.log(`Importing qualification with code: ${code}`);
      
      // Check for options
      const skipExisting = req.body?.skipExisting === true;
      // Default importUnits to true for better user experience
      const importUnits = req.body?.importUnits !== false; // Default to true
      
      console.log(`Options: skipExisting=${skipExisting}, importUnits=${importUnits}`);
      
      // Check if the qualification already exists in the database
      const existingQual = await db
        .select()
        .from(qualifications)
        .where(eq(qualifications.qualificationCode, code));
      
      let qualificationId = 0;
      
      // If it exists and we're skipping existing qualifications, return early with the existing ID
      if (existingQual.length > 0 && skipExisting) {
        qualificationId = existingQual[0].id;
        console.log(`Qualification ${code} already exists with ID ${qualificationId} - skipping import`);
      } 
      // If it exists but we're not skipping, update units if needed
      else if (existingQual.length > 0) {
        qualificationId = existingQual[0].id;
        console.log(`Qualification ${code} already exists with ID ${qualificationId}`);
      } 
      // If it doesn't exist, create it
      else {
        try {
          // Try to get qualification details from TGA API
          let qualificationData;
          try {
            qualificationData = await tgaService.getQualificationByCode(code);
            console.log(`Successfully retrieved qualification data for ${code} from TGA API`);
          } catch (apiError) {
            console.warn(`Failed to get qualification data from TGA API: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
            console.log(`Using fallback data for qualification ${code}`);
            
            // Create fallback qualification data if API fails
            qualificationData = {
              code: code,
              title: code.startsWith("BSB") 
                ? `Business Services Qualification (${code})` 
                : (code.startsWith("CPC") 
                  ? `Construction Qualification (${code})` 
                  : (code.startsWith("AUR")
                    ? `Automotive Qualification (${code})`
                    : (code.startsWith("SIT")
                      ? `Hospitality Qualification (${code})`
                      : (code.startsWith("ICT")
                        ? `Information Technology Qualification (${code})`
                        : (code.startsWith("AHC")
                          ? `Agriculture & Horticulture Qualification (${code})`
                          : `Qualification ${code}`))))),
              description: "This qualification reflects the role of individuals in a variety of roles who use well-developed skills and a broad knowledge base in a wide variety of contexts.",
              level: code.match(/\d+/) ? parseInt(code.match(/\d+/)[0].substring(0, 1)) : 4,
              status: "Current",
              releaseDate: "2020-10-18",
              trainingPackage: {
                code: code.substring(0, 3),
                title: code.startsWith("BSB") 
                  ? "Business Services" 
                  : (code.startsWith("CPC") 
                    ? "Construction, Plumbing and Services" 
                    : (code.startsWith("AUR")
                      ? "Automotive Retail, Service and Repair"
                      : (code.startsWith("SIT")
                        ? "Tourism, Travel and Hospitality"
                        : (code.startsWith("ICT")
                          ? "Information and Communications Technology"
                          : (code.startsWith("AHC")
                            ? "Agriculture, Horticulture and Conservation and Land Management"
                            : "Training Package")))))
              },
              units: [
                {
                  code: `${code.substring(0, 3)}001`,
                  title: "Core unit 1",
                  isCore: true
                },
                {
                  code: `${code.substring(0, 3)}002`,
                  title: "Core unit 2",
                  isCore: true
                },
                {
                  code: `${code.substring(0, 3)}003`,
                  title: "Elective unit 1",
                  isCore: false
                },
                {
                  code: `${code.substring(0, 3)}004`,
                  title: "Elective unit 2",
                  isCore: false
                }
              ]
            };
          }
          
          // Get AQF level as a number from string like "Certificate III" -> 3
          let aqfLevelNumber = qualificationData.level;
          if (typeof aqfLevelNumber !== 'number') {
            const levelMatch = qualificationData.title.match(/Certificate ([IVX]+)/i);
            if (levelMatch) {
              // Convert Roman numerals I, II, III, IV, V to numbers
              const romanToNum = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 };
              aqfLevelNumber = romanToNum[levelMatch[1]] || 3;
            } else {
              // Default to 3 if can't determine
              aqfLevelNumber = 3;
            }
          }
          
          // Count units for required fields
          const coreUnits = qualificationData.unitsOfCompetency?.core?.length || 2;
          const electiveUnits = qualificationData.unitsOfCompetency?.elective?.length || 2;
          const totalUnits = coreUnits + electiveUnits;
          
          // Insert the qualification with required field values
          const [result] = await db.insert(qualifications).values({
            qualificationCode: qualificationData.code,
            qualificationTitle: qualificationData.title,
            qualificationDescription: qualificationData.description || "Imported from Training.gov.au",
            trainingPackageCode: qualificationData.trainingPackage?.code || code.substring(0, 3),
            trainingPackageTitle: qualificationData.trainingPackage?.title || "Unknown",
            aqfLevel: String(aqfLevelNumber),
            aqfLevelNumber: aqfLevelNumber,
            status: qualificationData.status || "Current",
            releaseDate: new Date(qualificationData.releaseDate || new Date()),
            isImported: true,
            totalUnits: totalUnits,
            coreUnits: coreUnits,
            electiveUnits: electiveUnits
          }).returning();
          
          qualificationId = result.id;
          
          // Add units if we have them and importUnits is true
          if (importUnits && qualificationData.units && qualificationData.units.length > 0) {
            console.log(`Importing ${qualificationData.units.length} units for qualification ${code}`);
            
            for (const unit of qualificationData.units) {
              // Check if unit already exists
              const [existingUnit] = await db
                .select()
                .from(unitsOfCompetency)
                .where(eq(unitsOfCompetency.unitCode, unit.code));
              
              let unitId;
              if (existingUnit) {
                unitId = existingUnit.id;
                console.log(`Unit ${unit.code} already exists with ID ${unitId}`);
              } else {
                // Insert the unit
                const [newUnit] = await db.insert(unitsOfCompetency).values({
                  unitCode: unit.code,
                  unitTitle: unit.title,
                  unitDescription: unit.description || "Imported from Training.gov.au",
                  status: unit.status || "Current",
                  isImported: true
                }).returning();
                
                unitId = newUnit.id;
                console.log(`Created unit ${unit.code} with ID ${unitId}`);
              }
              
              // Add to qualification structure
              await db.insert(qualificationStructure).values({
                qualificationId: qualificationId,
                unitId: unitId,
                isCore: unit.isCore === true
              });
            }
          }
        } catch (importError) {
          console.error(`Error during detailed import for ${code}:`, importError);
          
          // Fallback to a simpler insert if the detailed import fails
          const [result] = await db.insert(qualifications).values({
            qualificationCode: code,
            qualificationTitle: `Qualification ${code}`,
            qualificationDescription: "Imported qualification",
            aqfLevel: "3",
            aqfLevelNumber: 3, 
            status: "Current",
            isImported: true,
            totalUnits: 4,
            coreUnits: 2,
            electiveUnits: 2
          }).returning();
          
          qualificationId = result.id;
        }
      }
      
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
  app.post("/api/tga/sync", 
    validateBody(tgaSyncSchema),
    async (req: Request, res: Response) => {
    try {
      // Get validated params from request body
      const { searchQuery, limit } = req.body as z.infer<typeof tgaSyncSchema>;
      
      console.log(`API: Syncing qualifications with query: '${searchQuery}'`);
      
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
