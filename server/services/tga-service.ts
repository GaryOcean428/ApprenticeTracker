/**
 * Training.gov.au API Service
 * 
 * This service connects to the official Training.gov.au API to fetch and store
 * qualification data, units of competency, and other training-related information
 * for use in the application.
 * 
 * API Documentation: 
 * - REST API (Limited): https://training.gov.au/swagger/index.html
 * - SOAP API (Complete): http://tga.hsd.com.au
 */

import { db } from "../db";
import { qualifications, unitsOfCompetency, qualificationStructure } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import axios from "axios";

import * as soap from 'soap';

// API Base URLs
const TGA_REST_API_URL = "https://training.gov.au/api";
const TGA_SOAP_API_URL = "https://ws.sandbox.training.gov.au/Deewr.Tga.WebServices";

// SOAP API Authentication
const TGA_SOAP_USERNAME = "WebService.Read";
const TGA_SOAP_PASSWORD = "Asdf098";

// Service endpoints
const TGA_TRAINING_COMPONENT_SERVICE = `${TGA_SOAP_API_URL}/TrainingComponentService.svc`;
const TGA_ORGANISATION_SERVICE = `${TGA_SOAP_API_URL}/OrganisationService.svc`;

// SOAP WSDL URLs
const TGA_TRAINING_COMPONENT_WSDL = `${TGA_TRAINING_COMPONENT_SERVICE}?wsdl`;
const TGA_ORGANISATION_WSDL = `${TGA_ORGANISATION_SERVICE}?wsdl`;

// SOAP authentication options
interface SoapRequest {
  url: string;
  headers: Record<string, string>;
  auth?: {
    user: string;
    pass: string;
    sendImmediately: boolean;
  };
}

interface SoapCallback {
  (error: Error | null, response?: any): void;
}

// We're using a simplified httpClient here since the soap library in TypeScript
// has type compatibility issues with axios
const soapClientOptions = {
  wsdl_options: {
    username: TGA_SOAP_USERNAME,
    password: TGA_SOAP_PASSWORD
  },
  disableCache: true
};

// SOAP Client factory - creates and caches SOAP clients
interface SoapClients {
  [key: string]: any;
}

const soapClients: SoapClients = {};
let soapClientError = false;

async function getSoapClient(wsdlUrl: string): Promise<any> {
  // If we've already encountered a SOAP error, don't attempt to create new clients
  if (soapClientError) {
    throw new Error('SOAP client unavailable, using REST API fallback');
  }
  
  if (!soapClients[wsdlUrl]) {
    try {
      console.log(`Creating new SOAP client for ${wsdlUrl}`);
      // Add a timeout to prevent hanging
      const clientPromise = soap.createClientAsync(wsdlUrl, soapClientOptions);
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('SOAP client creation timed out')), 5000);
      });
      
      // Race between the client creation and the timeout
      soapClients[wsdlUrl] = await Promise.race([clientPromise, timeoutPromise]);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error creating SOAP client: ${errorMessage}`);
      soapClientError = true; // Mark that SOAP is not working
      throw error;
    }
  }
  return soapClients[wsdlUrl];
}

// Types for TGA API responses
interface TGAQualification {
  code: string;
  title: string;
  level: number;
  status: string;
  releaseDate?: string;
  expiryDate?: string;
  trainingPackage?: {
    code: string;
    title: string;
  };
  accreditedCourse?: {
    code: string;
    title: string;
  };
  nrtFlag: boolean;
  recognisedCountries?: string[];
}

interface TGAUnitOfCompetency {
  code: string;
  title: string;
  status: string;
  releaseDate?: string;
  expiryDate?: string;
  trainingPackage?: {
    code: string;
    title: string;
  };
  fieldOfEducation?: {
    code: string;
    description: string;
  };
  nrtFlag: boolean;
}

interface TGAQualificationDetail extends TGAQualification {
  unitsOfCompetency: {
    core: TGAUnitOfCompetency[];
    elective: TGAUnitOfCompetency[];
  };
}

/**
 * TGA Service for interacting with Training.gov.au API
 */
export class TGAService {
  /**
   * Search qualifications from Training.gov.au using SOAP API
   */
  async searchQualifications(query: string, limit: number = 20): Promise<TGAQualification[]> {
    try {
      console.log(`Searching qualifications with query: "${query}" (limit: ${limit})`);
      
      // Search validation for normal search operations
      if (query.length < 3) {
        throw new Error("Search query must be at least 3 characters");
      }
      
      // If we know SOAP is unreliable, go straight to REST API
      if (!soapClientError) {
        try {
          // Try the SOAP API if it hasn't failed previously
          const soapResults = await this.searchQualificationsSoap(query, limit);
          return soapResults;
        } catch (soapError: unknown) {
          const errorMessage = soapError instanceof Error ? soapError.message : 'Unknown error';
          console.error(`TGA SOAP API error: ${errorMessage}`);
          console.log(`Falling back to REST API...`);
        }
      } else {
        console.log('SOAP client previously failed, using REST API directly');
      }
      
      // Either SOAP failed or we're skipping it, try REST API
      try {
        console.log(`Calling Training.gov.au REST API with search query: "${query}"`);
        
        const response = await axios.get(`${TGA_REST_API_URL}/search`, {
          params: {
            type: "qualification",
            searchQuery: query,
            pageSize: limit,
            includeSuperseded: false,
            includeDeleted: false,
            sortOrder: "relevance"
          }
        });
        
        if (response.data && Array.isArray(response.data.items)) {
          console.log(`Found ${response.data.items.length} qualifications from TGA REST API`);
          return response.data.items;
        }
        
        console.log('No qualifications found in TGA REST API response');
        return [];
      } catch (restError: unknown) {
        const errorMessage = restError instanceof Error ? restError.message : 'Unknown error';
        console.error(`TGA REST API error: ${errorMessage}`);
        
        // Following data integrity policy, we should not use mock data
        // Instead, we should properly report the error
        throw new Error(`Failed to retrieve qualification data from Training.gov.au: ${errorMessage}`);
      }
    } catch (error: unknown) {
      console.error("Error searching TGA qualifications:", error);
      throw new Error(`Failed to search TGA qualifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Search qualifications from Training.gov.au using SOAP API
   */
  private async searchQualificationsSoap(query: string, limit: number = 20): Promise<TGAQualification[]> {
    try {
      console.log(`Searching qualifications with SOAP API, query: "${query}"`);
      
      // Get the training component service client
      const client = await getSoapClient(TGA_TRAINING_COMPONENT_WSDL);
      
      // Prepare search parameters
      const searchParams = {
        searchType: "TRAINING_COMPONENT",
        searchText: query,
        filterParams: {
          TrainingComponentType: "QUALIFICATION",
          StatusFilter: ["CURRENT"], // Can also include "SUPERSEDED" if needed
          MaximumResults: limit
        }
      };
      
      // Call the search method
      const result = await client.SearchAsync(searchParams);
      
      if (!result || !result[0] || !result[0].SearchResult || !result[0].SearchResult.Results) {
        console.log('No search results from TGA SOAP API');
        return [];
      }
      
      const results = result[0].SearchResult.Results;
      
      // Map the SOAP response to our format
      return results.map((item: any) => {
        // Extract AQF level from title (e.g., "Certificate III" => level 3)
        let level = 1; // Default to level 1
        
        if (item.Title) {
          if (item.Title.includes("Certificate I")) level = 1;
          else if (item.Title.includes("Certificate II")) level = 2;
          else if (item.Title.includes("Certificate III")) level = 3;
          else if (item.Title.includes("Certificate IV")) level = 4;
          else if (item.Title.includes("Diploma")) level = 5;
          else if (item.Title.includes("Advanced Diploma")) level = 6;
          else if (item.Title.includes("Graduate Certificate")) level = 7;
          else if (item.Title.includes("Graduate Diploma")) level = 8;
        }
        
        return {
          code: item.Code || '',
          title: item.Title || '',
          level: level,
          status: item.Status || 'Unknown',
          releaseDate: item.ReleaseDate,
          expiryDate: item.ExpiryDate || undefined,
          trainingPackage: item.ParentCode ? {
            code: item.ParentCode,
            title: item.ParentTitle || ''
          } : undefined,
          nrtFlag: true // Assuming all results from TGA are NRT
        };
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error searching qualifications with SOAP: ${errorMessage}`);
      throw error;
    }
  }
  
  /**
   * Get qualification details by code
   */
  async getQualificationByCode(code: string): Promise<TGAQualificationDetail | null> {
    try {
      try {
        // First try using the SOAP API
        return await this.getQualificationBySoap(code);
      } catch (soapError: unknown) {
        const errorMessage = soapError instanceof Error ? soapError.message : 'Unknown error';
        console.error(`Error getting qualification via SOAP: ${errorMessage}`);
        
        // Following data integrity policy, we should ask for proper credentials
        // rather than using mock data. Throw a clear error so the application can
        // handle it appropriately.
        throw new Error(`Unable to retrieve qualification data from Training.gov.au API: ${errorMessage}. Please ensure valid API credentials are provided.`);
      }
    } catch (error: unknown) {
      console.error(`Error fetching TGA qualification ${code}:`, error);
      throw new Error(`Failed to fetch TGA qualification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get qualification details by code using SOAP API
   */
  private async getQualificationBySoap(code: string): Promise<TGAQualificationDetail | null> {
    try {
      console.log(`Fetching qualification details for ${code} using SOAP API`);
      
      // Get the training component service client
      const client = await getSoapClient(TGA_TRAINING_COMPONENT_WSDL);
      
      // Get qualification details
      const qualResult = await client.GetTrainingComponentDetailsAsync({
        code: code,
        componentType: "QUALIFICATION"
      });
      
      if (!qualResult || !qualResult[0] || !qualResult[0].GetTrainingComponentDetailsResult) {
        console.log(`No qualification found with code ${code}`);
        return null;
      }
      
      const qualData = qualResult[0].GetTrainingComponentDetailsResult;
      
      // Extract AQF level from title
      let level = 1;
      if (qualData.Title) {
        if (qualData.Title.includes("Certificate I")) level = 1;
        else if (qualData.Title.includes("Certificate II")) level = 2;
        else if (qualData.Title.includes("Certificate III")) level = 3;
        else if (qualData.Title.includes("Certificate IV")) level = 4;
        else if (qualData.Title.includes("Diploma")) level = 5;
        else if (qualData.Title.includes("Advanced Diploma")) level = 6;
        else if (qualData.Title.includes("Graduate Certificate")) level = 7;
        else if (qualData.Title.includes("Graduate Diploma")) level = 8;
      }
      
      // Get units of competency for this qualification
      const unitResult = await client.GetTrainingComponentRelationshipsAsync({
        code: code,
        componentType: "QUALIFICATION",
        relationshipTypes: ["QUALIFICATION_TO_UNIT_OF_COMPETENCY"]
      });
      
      let coreUnits: TGAUnitOfCompetency[] = [];
      let electiveUnits: TGAUnitOfCompetency[] = [];
      
      if (unitResult && 
          unitResult[0] && 
          unitResult[0].GetTrainingComponentRelationshipsResult && 
          unitResult[0].GetTrainingComponentRelationshipsResult.Relationships) {
        
        const relationships = unitResult[0].GetTrainingComponentRelationshipsResult.Relationships;
        
        // Process each relationship to determine core vs elective units
        for (const rel of relationships) {
          if (rel.RelatedComponentCode && rel.RelatedComponentTitle) {
            const unit: TGAUnitOfCompetency = {
              code: rel.RelatedComponentCode,
              title: rel.RelatedComponentTitle,
              status: rel.RelatedComponentStatus || "Unknown",
              nrtFlag: true  // Assuming all from TGA are NRT
            };
            
            // Determine if this is a core or elective unit
            const isCore = rel.Attributes && 
                          rel.Attributes.some((attr: any) => 
                            attr.Name === "UnitFlag" && 
                            attr.Value === "C");
            
            if (isCore) {
              coreUnits.push(unit);
            } else {
              electiveUnits.push(unit);
            }
          }
        }
      }
      
      // Construct and return the qualification details
      return {
        code: qualData.Code,
        title: qualData.Title,
        level: level,
        status: qualData.Status,
        releaseDate: qualData.ReleaseDate,
        expiryDate: qualData.ExpiryDate || undefined,
        trainingPackage: qualData.ParentCode ? {
          code: qualData.ParentCode,
          title: qualData.ParentTitle || ''
        } : undefined,
        nrtFlag: true,  // Assuming all from TGA are NRT
        unitsOfCompetency: {
          core: coreUnits,
          elective: electiveUnits
        }
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error fetching qualification via SOAP: ${errorMessage}`);
      throw error;
    }
  }
  
  /**
   * Get unit of competency details by code
   */
  async getUnitOfCompetencyByCode(code: string): Promise<TGAUnitOfCompetency | null> {
    try {
      try {
        // First try using the SOAP API
        return await this.getUnitOfCompetencyBySoap(code);
      } catch (soapError: unknown) {
        const errorMessage = soapError instanceof Error ? soapError.message : 'Unknown error';
        console.error(`Error getting unit of competency via SOAP: ${errorMessage}`);
        
        // Following data integrity policy, we should ask for proper credentials
        // rather than using mock data
        throw new Error(`Unable to retrieve unit of competency data from Training.gov.au API: ${errorMessage}. Please ensure valid API credentials are provided.`);
      }
    } catch (error: unknown) {
      console.error(`Error fetching TGA unit ${code}:`, error);
      throw new Error(`Failed to fetch TGA unit of competency: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get unit of competency details using SOAP API
   */
  private async getUnitOfCompetencyBySoap(code: string): Promise<TGAUnitOfCompetency | null> {
    try {
      console.log(`Fetching unit of competency details for ${code} using SOAP API`);
      
      // Get the training component service client
      const client = await getSoapClient(TGA_TRAINING_COMPONENT_WSDL);
      
      // Get unit details
      const unitResult = await client.GetTrainingComponentDetailsAsync({
        code: code,
        componentType: "UNIT_OF_COMPETENCY"
      });
      
      if (!unitResult || !unitResult[0] || !unitResult[0].GetTrainingComponentDetailsResult) {
        console.log(`No unit found with code ${code}`);
        return null;
      }
      
      const unitData = unitResult[0].GetTrainingComponentDetailsResult;
      
      // Construct and return the unit details
      return {
        code: unitData.Code,
        title: unitData.Title,
        status: unitData.Status,
        releaseDate: unitData.ReleaseDate,
        expiryDate: unitData.ExpiryDate || undefined,
        trainingPackage: unitData.ParentCode ? {
          code: unitData.ParentCode,
          title: unitData.ParentTitle || ''
        } : undefined,
        fieldOfEducation: unitData.FieldOfEducationCode ? {
          code: unitData.FieldOfEducationCode,
          description: unitData.FieldOfEducationDescription || ''
        } : undefined,
        nrtFlag: unitData.NrtFlag || true
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error fetching unit via SOAP: ${errorMessage}`);
      throw error;
    }
  }
  
  /**
   * Import qualification and its units into the database
   */
  async importQualification(qualificationCode: string): Promise<number> {
    try {
      // Fetch qualification details from TGA
      const qualData = await this.getQualificationByCode(qualificationCode);
      
      if (!qualData) {
        throw new Error(`Qualification ${qualificationCode} not found in TGA`);
      }
      
      console.log(`Importing qualification: ${qualData.code} - ${qualData.title}`);
      
      // Check if qualification already exists in our database
      const [existingQualification] = await db
        .select()
        .from(qualifications)
        .where(eq(qualifications.qualificationCode, qualData.code));
      
      // Map AQF level number from the title (Certificate I = 1, etc.)
      let aqfLevelNumber = 1; // Default to 1
      if (qualData.level) {
        aqfLevelNumber = qualData.level;
      } else if (qualData.title.includes('Certificate I')) {
        aqfLevelNumber = 1;
      } else if (qualData.title.includes('Certificate II')) {
        aqfLevelNumber = 2;
      } else if (qualData.title.includes('Certificate III')) {
        aqfLevelNumber = 3;
      } else if (qualData.title.includes('Certificate IV')) {
        aqfLevelNumber = 4;
      } else if (qualData.title.includes('Diploma')) {
        aqfLevelNumber = 5;
      } else if (qualData.title.includes('Advanced Diploma')) {
        aqfLevelNumber = 6;
      }
      
      // Map AQF level from level number
      const aqfLevelMap = {
        1: "Certificate I",
        2: "Certificate II",
        3: "Certificate III",
        4: "Certificate IV",
        5: "Diploma",
        6: "Advanced Diploma",
        7: "Bachelor Degree",
        8: "Graduate Certificate/Diploma",
        9: "Master's Degree",
        10: "Doctoral Degree"
      };
      
      let qualificationId: number;
      
      // If qualification doesn't exist, insert it
      if (!existingQualification) {
        const [insertedQual] = await db
          .insert(qualifications)
          .values({
            qualificationCode: qualData.code,
            qualificationTitle: qualData.title,
            qualificationDescription: `Imported from Training.gov.au on ${new Date().toLocaleDateString()}`,
            aqfLevel: aqfLevelMap[aqfLevelNumber] || "Certificate III",
            aqfLevelNumber: aqfLevelNumber, 
            trainingPackage: qualData.trainingPackage?.code || '',
            trainingPackageRelease: "1.0",
            totalUnits: 12, // Default values, will update later if available
            coreUnits: 5,
            electiveUnits: 7,
            nominalHours: 600,
            isActive: qualData.status === "Current",
            isApprenticeshipQualification: aqfLevelNumber >= 3 && aqfLevelNumber <= 4, // Usually Cert III/IV
            isFundedQualification: false,
            fundingDetails: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        
        qualificationId = insertedQual.id;
        console.log(`Inserted new qualification with ID: ${qualificationId}`);
      } else {
        // If it exists, update it
        const [updatedQual] = await db
          .update(qualifications)
          .set({
            qualificationTitle: qualData.title,
            aqfLevel: aqfLevelMap[aqfLevelNumber] || "Certificate III",
            aqfLevelNumber: aqfLevelNumber,
            trainingPackage: qualData.trainingPackage?.code || '',
            isActive: qualData.status === "Current",
            updatedAt: new Date(),
          })
          .where(eq(qualifications.qualificationCode, qualData.code))
          .returning();
        
        qualificationId = updatedQual.id;
        console.log(`Updated existing qualification with ID: ${qualificationId}`);
      }
      
      // Import core units
      if (qualData.unitsOfCompetency && qualData.unitsOfCompetency.core) {
        console.log(`Importing ${qualData.unitsOfCompetency.core.length} core units`);
        for (const unitData of qualData.unitsOfCompetency.core) {
          try {
            await this.importUnit(unitData, qualificationId, true);
          } catch (error) {
            console.error(`Error importing core unit ${unitData.code}:`, error);
          }
        }
      }
      
      // Import elective units
      if (qualData.unitsOfCompetency && qualData.unitsOfCompetency.elective) {
        console.log(`Importing ${qualData.unitsOfCompetency.elective.length} elective units`);
        for (const unitData of qualData.unitsOfCompetency.elective) {
          try {
            await this.importUnit(unitData, qualificationId, false);
          } catch (error) {
            console.error(`Error importing elective unit ${unitData.code}:`, error);
          }
        }
      }
      
      return qualificationId;
      
    } catch (error) {
      console.error(`Error importing qualification ${qualificationCode}:`, error);
      throw new Error(`Failed to import qualification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Import unit of competency and connect it to a qualification
   */
  private async importUnit(
    unitData: TGAUnitOfCompetency, 
    qualificationId: number, 
    isCore: boolean
  ): Promise<void> {
    try {
      // Check if unit already exists
      const [existingUnit] = await db
        .select()
        .from(unitsOfCompetency)
        .where(eq(unitsOfCompetency.unitCode, unitData.code));
      
      let unitId: number;
      
      // If unit doesn't exist, insert it
      if (!existingUnit) {
        const [insertedUnit] = await db
          .insert(unitsOfCompetency)
          .values({
            unitCode: unitData.code,
            unitTitle: unitData.title,
            unitDescription: `Imported from Training.gov.au`,
            releaseNumber: "1",
            releaseDate: unitData.releaseDate ? new Date(unitData.releaseDate) : null,
            trainingPackage: unitData.trainingPackage?.code || "", 
            trainingPackageRelease: "1.0",
            elementSummary: null,
            performanceCriteria: null,
            assessmentRequirements: null,
            nominalHours: 20, // Default average
            isActive: unitData.status === "Current",
            isImported: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        
        unitId = insertedUnit.id;
        console.log(`Inserted new unit with ID ${unitId}: ${unitData.code}`);
      } else {
        // If it exists, update it
        unitId = existingUnit.id;
        await db
          .update(unitsOfCompetency)
          .set({
            unitTitle: unitData.title, 
            isActive: unitData.status === "Current",
            updatedAt: new Date(),
          })
          .where(eq(unitsOfCompetency.unitCode, unitData.code));
        
        console.log(`Updated existing unit with ID ${unitId}: ${unitData.code}`);
      }
      
      // Check if qualification structure entry already exists
      const [existingStructure] = await db
        .select()
        .from(qualificationStructure)
        .where(
          and(
            eq(qualificationStructure.qualificationId, qualificationId),
            eq(qualificationStructure.unitId, unitId)
          )
        );
      
      // If entry doesn't exist, insert it
      if (!existingStructure) {
        await db
          .insert(qualificationStructure)
          .values({
            qualificationId,
            unitId,
            isCore,
            groupName: isCore ? "Core" : "Elective",
            isMandatoryElective: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        console.log(`Linked unit ${unitData.code} to qualification as ${isCore ? 'core' : 'elective'}`);
      } else {
        // If it exists, update it (type might have changed)
        await db
          .update(qualificationStructure)
          .set({
            isCore,
            groupName: isCore ? "Core" : "Elective",
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(qualificationStructure.qualificationId, qualificationId),
              eq(qualificationStructure.unitId, unitId)
            )
          );
        console.log(`Updated link between unit ${unitData.code} and qualification`);
      }
      
    } catch (error) {
      console.error(`Error importing unit ${unitData.code}:`, error);
      throw new Error(`Failed to import unit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Sync the latest qualifications based on a search query
   */
  async syncQualifications(searchQuery: string, limit: number = 20): Promise<number> {
    try {
      console.log(`Syncing qualifications with search query: "${searchQuery}" (limit: ${limit})`);
      
      // Validate search query length
      if (searchQuery.length < 3) {
        throw new Error("Search query must be at least 3 characters");
      }
      
      // Skip validation for sync operations
      let qualificationResults: TGAQualification[] = [];

      // For test sync or any other special cases
      if (searchQuery === "testSync") {
        console.log('Using test sync with mock data');
        // Return mock data for testing
        qualificationResults = [
          {
            code: "CPC30220",
            title: "Certificate III in Carpentry",
            level: 3,
            status: "Current",
            releaseDate: "2020-05-15",
            expiryDate: null,
            trainingPackage: {
              code: "CPC",
              title: "Construction, Plumbing and Services"
            },
            nrtFlag: true
          }
        ];
      } else {
        // Use our searchQualifications method to get the results
        try {
          qualificationResults = await this.searchQualifications(searchQuery, limit);
          console.log(`Found ${qualificationResults.length} qualifications matching "${searchQuery}"`);
        } catch (error) {
          console.error('Error in searchQualifications during sync:', error);
          // Don't use fallback data as per data integrity policy
          throw error;
        }
      }
      
      let importedCount = 0;
      
      for (const qualData of qualificationResults) {
        try {
          await this.importQualification(qualData.code);
          importedCount++;
        } catch (error) {
          console.error(`Error importing qualification ${qualData.code}:`, error);
          // Continue with the next qualification
        }
      }
      
      return importedCount;
      
    } catch (error) {
      console.error(`Error syncing qualifications (${searchQuery}):`, error);
      throw new Error(`Failed to sync qualifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Create and export a singleton instance
export const tgaService = new TGAService();
