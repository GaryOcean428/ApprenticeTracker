import type { Express } from "express";
import { db } from "../db";
import { storage } from "../storage";
import {
  eq,
  and,
  asc,
  desc,
  like,
  isNull,
  not,
  sql,
} from "drizzle-orm";
import {
  hostEmployers,
  hostEmployerAgreements,
  placements,
  apprentices,
  timesheets,
  hostEmployerPreferredQualifications,
  qualifications,
} from "@shared/schema";
import { z } from "zod";
import { isAuthenticated } from "../api/auth-routes";
import { hasPermission, hasAnyPermission } from "../middleware/permissions";

export function registerHostRoutes(app: Express) {
  // Get all host employers
  app.get("/api/hosts", isAuthenticated, hasPermission('view:hosts'), async (req, res) => {
    try {
      const hosts = await storage.getAllHostEmployers();
      res.json(hosts);
    } catch (error) {
      console.error("Error fetching host employers:", error);
      res.status(500).json({ message: "Error fetching host employers" });
    }
  });

  // Get a specific host employer by ID
  app.get("/api/hosts/:id", isAuthenticated, hasPermission('view:hosts'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const host = await storage.getHostEmployer(id);
      
      if (!host) {
        return res.status(404).json({ message: "Host employer not found" });
      }
      
      res.json(host);
    } catch (error) {
      console.error("Error fetching host employer:", error);
      res.status(500).json({ message: "Error fetching host employer" });
    }
  });
  
  // Host Employer Agreements
  
  // Get all agreements for a host employer
  app.get("/api/host-agreements/:hostId", isAuthenticated, hasPermission('view:hosts'), async (req, res) => {
    try {
      const hostId = parseInt(req.params.hostId);
      
      // Check if host employer exists
      const host = await storage.getHostEmployer(hostId);
      if (!host) {
        return res.status(404).json({ message: "Host employer not found" });
      }
      
      // Get all agreements for this host
      const agreements = await db
        .select()
        .from(hostEmployerAgreements)
        .where(eq(hostEmployerAgreements.hostEmployerId, hostId))
        .orderBy(desc(hostEmployerAgreements.agreementDate));
      
      res.json(agreements);
    } catch (error) {
      console.error("Error fetching host agreements:", error);
      res.status(500).json({ message: "Error fetching host agreements" });
    }
  });
  
  // Get specific agreement
  app.get("/api/host-agreements/:hostId/:agreementId", isAuthenticated, hasPermission('view:hosts'), async (req, res) => {
    try {
      const hostId = parseInt(req.params.hostId);
      const agreementId = parseInt(req.params.agreementId);
      
      // Get the specific agreement
      const [agreement] = await db
        .select()
        .from(hostEmployerAgreements)
        .where(
          and(
            eq(hostEmployerAgreements.id, agreementId),
            eq(hostEmployerAgreements.hostEmployerId, hostId)
          )
        );
      
      if (!agreement) {
        return res.status(404).json({ message: "Agreement not found" });
      }
      
      res.json(agreement);
    } catch (error) {
      console.error("Error fetching host agreement:", error);
      res.status(500).json({ message: "Error fetching host agreement" });
    }
  });
  
  // Create a new agreement
  app.post("/api/host-agreements", isAuthenticated, hasPermission('manage:hosts'), async (req, res) => {
    try {
      const agreementData = req.body;
      
      // Validate the agreement data
      if (!agreementData.hostEmployerId) {
        return res.status(400).json({ message: "Host employer ID is required" });
      }
      
      // Check if host employer exists
      const host = await storage.getHostEmployer(agreementData.hostEmployerId);
      if (!host) {
        return res.status(404).json({ message: "Host employer not found" });
      }
      
      // Create the agreement
      const [agreement] = await db
        .insert(hostEmployerAgreements)
        .values({
          ...agreementData,
          agreementDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      res.status(201).json(agreement);
    } catch (error) {
      console.error("Error creating host agreement:", error);
      res.status(500).json({ message: "Error creating host agreement" });
    }
  });
  
  // Update an agreement
  app.patch("/api/host-agreements/:agreementId", async (req, res) => {
    try {
      const agreementId = parseInt(req.params.agreementId);
      const updateData = req.body;
      
      // Check if agreement exists
      const [existingAgreement] = await db
        .select()
        .from(hostEmployerAgreements)
        .where(eq(hostEmployerAgreements.id, agreementId));
      
      if (!existingAgreement) {
        return res.status(404).json({ message: "Agreement not found" });
      }
      
      // Update the agreement
      const [updatedAgreement] = await db
        .update(hostEmployerAgreements)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(hostEmployerAgreements.id, agreementId))
        .returning();
      
      res.json(updatedAgreement);
    } catch (error) {
      console.error("Error updating host agreement:", error);
      res.status(500).json({ message: "Error updating host agreement" });
    }
  });
  
  // Delete an agreement
  app.delete("/api/host-agreements/:agreementId", async (req, res) => {
    try {
      const agreementId = parseInt(req.params.agreementId);
      
      // Check if agreement exists
      const [existingAgreement] = await db
        .select()
        .from(hostEmployerAgreements)
        .where(eq(hostEmployerAgreements.id, agreementId));
      
      if (!existingAgreement) {
        return res.status(404).json({ message: "Agreement not found" });
      }
      
      // Delete the agreement
      await db
        .delete(hostEmployerAgreements)
        .where(eq(hostEmployerAgreements.id, agreementId));
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting host agreement:", error);
      res.status(500).json({ message: "Error deleting host agreement" });
    }
  });

  // Placements API Endpoints
  app.get("/api/hosts/:hostId/placements", isAuthenticated, hasPermission('view:hosts'), async (req, res) => {
    try {
      const hostId = parseInt(req.params.hostId);
      
      // Get all placements for this host with apprentice info
      const placementsData = await db
        .select({
          placement: placements,
          apprentice: apprentices,
        })
        .from(placements)
        .leftJoin(apprentices, eq(placements.apprenticeId, apprentices.id))
        .where(eq(placements.hostEmployerId, hostId))
        .orderBy(desc(placements.startDate));
      
      // Format the data for the frontend
      const result = placementsData.map(({ placement, apprentice }) => ({
        ...placement,
        apprentice: apprentice ? {
          id: apprentice.id,
          firstName: apprentice.firstName,
          lastName: apprentice.lastName,
          email: apprentice.email,
          phone: apprentice.phone,
          status: apprentice.status,
          qualification: apprentice.qualification,
          startDate: apprentice.startDate,
          expectedEndDate: apprentice.expectedEndDate,
        } : undefined,
      }));
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching host placements:", error);
      res.status(500).json({ message: "Error fetching host placements" });
    }
  });

  // Apprentices API Endpoint - Get all apprentices for a host employer
  app.get("/api/hosts/:hostId/apprentices", isAuthenticated, hasPermission('view:hosts'), async (req, res) => {
    try {
      const hostId = parseInt(req.params.hostId);
      
      // Get all apprentices with active placements for this host
      const placementsData = await db
        .select({
          apprentice: apprentices,
        })
        .from(placements)
        .innerJoin(apprentices, eq(placements.apprenticeId, apprentices.id))
        .where(
          and(
            eq(placements.hostEmployerId, hostId),
            eq(placements.status, "active")
          )
        )
        .groupBy(apprentices.id);
      
      const result = placementsData.map(({ apprentice }) => apprentice);
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching host apprentices:", error);
      res.status(500).json({ message: "Error fetching host apprentices" });
    }
  });

  // Timesheets API Endpoint - Get all timesheets for a host employer
  app.get("/api/hosts/:hostId/timesheets", async (req, res) => {
    try {
      const hostId = parseInt(req.params.hostId);
      
      // Get all timesheets for apprentices with placements at this host
      const timesheetData = await db
        .select({
          timesheet: timesheets,
          apprentice: {
            id: apprentices.id,
            firstName: apprentices.firstName,
            lastName: apprentices.lastName,
          },
        })
        .from(timesheets)
        .innerJoin(apprentices, eq(timesheets.apprenticeId, apprentices.id))
        .innerJoin(placements, eq(timesheets.apprenticeId, placements.apprenticeId))
        .where(
          and(
            eq(placements.hostEmployerId, hostId),
            eq(placements.status, "active")
          )
        )
        .orderBy(desc(timesheets.weekStartDate));
      
      // Format the data for the frontend
      const result = timesheetData.map(({ timesheet, apprentice }) => ({
        ...timesheet,
        apprentice,
      }));
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching host timesheets:", error);
      res.status(500).json({ message: "Error fetching host timesheets" });
    }
  });

  // Host Stats API Endpoint - Get stats for a host employer
  app.get("/api/hosts/:hostId/stats", async (req, res) => {
    try {
      const hostId = parseInt(req.params.hostId);
      
      // Get count of all apprentices that have ever been placed with this host
      const totalApprenticesResult = await db
        .select({ count: sql<number>`count(distinct ${placements.apprenticeId})` })
        .from(placements)
        .where(eq(placements.hostEmployerId, hostId));
      
      // Get count of active apprentices
      const activeApprenticesResult = await db
        .select({ count: sql<number>`count(distinct ${placements.apprenticeId})` })
        .from(placements)
        .where(
          and(
            eq(placements.hostEmployerId, hostId),
            eq(placements.status, "active")
          )
        );
      
      // Get count of completed apprentices
      const completedApprenticesResult = await db
        .select({ count: sql<number>`count(distinct ${placements.apprenticeId})` })
        .from(placements)
        .where(
          and(
            eq(placements.hostEmployerId, hostId),
            eq(placements.status, "completed")
          )
        );
      
      // Get count of terminated apprentices
      const terminatedApprenticesResult = await db
        .select({ count: sql<number>`count(distinct ${placements.apprenticeId})` })
        .from(placements)
        .where(
          and(
            eq(placements.hostEmployerId, hostId),
            eq(placements.status, "terminated")
          )
        );
      
      // Get count of pending timesheets
      const pendingTimesheetsResult = await db
        .select({ count: sql<number>`count(${timesheets.id})` })
        .from(timesheets)
        .innerJoin(placements, eq(timesheets.apprenticeId, placements.apprenticeId))
        .where(
          and(
            eq(placements.hostEmployerId, hostId),
            eq(placements.status, "active"),
            eq(timesheets.status, "pending")
          )
        );
      
      // Calculate completion rate
      const totalPlaced = totalApprenticesResult[0]?.count || 0;
      const completed = completedApprenticesResult[0]?.count || 0;
      const terminated = terminatedApprenticesResult[0]?.count || 0;
      const completionRate = totalPlaced > 0 ? Math.round((completed / (completed + terminated)) * 100) : 0;
      
      // Get the latest agreement to calculate compliance rate
      const [latestAgreement] = await db
        .select()
        .from(hostEmployerAgreements)
        .where(eq(hostEmployerAgreements.hostEmployerId, hostId))
        .orderBy(desc(hostEmployerAgreements.agreementDate))
        .limit(1);
      
      let complianceRate = 0;
      if (latestAgreement) {
        // Simple compliance rate calculation
        let compliancePoints = 0;
        const totalPoints = 4;
        
        // Check if agreement is current
        if (new Date(latestAgreement.expiryDate) > new Date()) {
          compliancePoints++;
        }
        
        // Check WHS compliance status
        if (latestAgreement.whsCompliance === "compliant") {
          compliancePoints++;
        }
        
        // Check induction
        if (latestAgreement.inductionProvided) {
          compliancePoints++;
        }
        
        // Check facilities
        if (latestAgreement.supervisionCapacity && 
            latestAgreement.trainingCapacity && 
            latestAgreement.facilityCapacity) {
          compliancePoints++;
        }
        
        complianceRate = Math.round((compliancePoints / totalPoints) * 100);
      }
      
      res.json({
        totalApprentices: totalApprenticesResult[0]?.count || 0,
        activeApprentices: activeApprenticesResult[0]?.count || 0,
        completedApprentices: completedApprenticesResult[0]?.count || 0,
        terminatedApprentices: terminatedApprenticesResult[0]?.count || 0,
        averageCompletionRate: completionRate,
        complianceRate: complianceRate,
        pendingTimesheets: pendingTimesheetsResult[0]?.count || 0,
      });
    } catch (error) {
      console.error("Error fetching host stats:", error);
      res.status(500).json({ message: "Error fetching host stats" });
    }
  });

  // Timesheet Approval API Endpoint
  app.patch("/api/timesheets/:timesheetId/status", async (req, res) => {
    try {
      const timesheetId = parseInt(req.params.timesheetId);
      const { status, notes } = req.body;
      
      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      // Check if timesheet exists
      const [existingTimesheet] = await db
        .select()
        .from(timesheets)
        .where(eq(timesheets.id, timesheetId));
      
      if (!existingTimesheet) {
        return res.status(404).json({ message: "Timesheet not found" });
      }
      
      // Update timesheet status
      const [updatedTimesheet] = await db
        .update(timesheets)
        .set({
          status,
          reviewNotes: notes || null,
          reviewDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(timesheets.id, timesheetId))
        .returning();
      
      // If approved, create an activity log (this could trigger billing process)
      if (status === 'approved') {
        // Create activity entry - would trigger billing workflow
        await storage.createActivityLog({
          userId: req.user?.id || 1, // Fallback to admin if no user
          action: "approved",
          relatedTo: "timesheet",
          relatedId: timesheetId,
          details: {
            message: "Timesheet approved by host employer",
            timesheetId,
            apprenticeId: existingTimesheet.apprenticeId,
            weekStartDate: existingTimesheet.weekStartDate,
            weekEndDate: existingTimesheet.weekEndDate,
            totalHours: existingTimesheet.totalHours,
          },
          timestamp: new Date(),
        });
      }
      
      res.json(updatedTimesheet);
    } catch (error) {
      console.error("Error updating timesheet status:", error);
      res.status(500).json({ message: "Error updating timesheet status" });
    }
  });

  // Host Employer Preferred Qualifications API Endpoints
  
  // Get all preferred qualifications for a host employer
  app.get("/api/hosts/:hostId/preferred-qualifications", async (req, res) => {
    try {
      const hostId = parseInt(req.params.hostId);
      
      // Check if host employer exists
      const host = await storage.getHostEmployer(hostId);
      if (!host) {
        return res.status(404).json({ message: "Host employer not found" });
      }
      
      // Get all preferred qualifications for this host
      const preferredQuals = await storage.getHostEmployerPreferredQualifications(hostId);
      
      // Get the full qualification details for each preference
      const result = await Promise.all(
        preferredQuals.map(async (pref) => {
          const qualification = await storage.getQualification(pref.qualificationId);
          return {
            ...pref,
            qualification: qualification || undefined
          };
        })
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching host preferred qualifications:", error);
      res.status(500).json({ message: "Error fetching host preferred qualifications" });
    }
  });
  
  // Get a specific preferred qualification
  app.get("/api/hosts/:hostId/preferred-qualifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hostId = parseInt(req.params.hostId);
      
      // Get the preferred qualification
      const preferredQual = await storage.getHostEmployerPreferredQualification(id);
      
      if (!preferredQual || preferredQual.hostEmployerId !== hostId) {
        return res.status(404).json({ message: "Preferred qualification not found" });
      }
      
      // Get the qualification details
      const qualification = await storage.getQualification(preferredQual.qualificationId);
      
      res.json({
        ...preferredQual,
        qualification: qualification || undefined
      });
    } catch (error) {
      console.error("Error fetching preferred qualification:", error);
      res.status(500).json({ message: "Error fetching preferred qualification" });
    }
  });
  
  // Add a preferred qualification to a host employer
  app.post("/api/hosts/:hostId/preferred-qualifications", async (req, res) => {
    try {
      const hostId = parseInt(req.params.hostId);
      const { qualificationId, priority, notes, isRequired } = req.body;
      
      // Check if host employer exists
      const host = await storage.getHostEmployer(hostId);
      if (!host) {
        return res.status(404).json({ message: "Host employer not found" });
      }
      
      // Check if qualification exists
      const qualification = await storage.getQualification(qualificationId);
      if (!qualification) {
        return res.status(404).json({ message: "Qualification not found" });
      }
      
      // Create new preferred qualification
      const preferredQual = await storage.addHostEmployerPreferredQualification({
        hostEmployerId: hostId,
        qualificationId,
        priority: priority || "medium",
        notes,
        isRequired: isRequired || false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Return with qualification details
      res.status(201).json({
        ...preferredQual,
        qualification
      });
    } catch (error) {
      console.error("Error creating preferred qualification:", error);
      res.status(500).json({ message: "Error creating preferred qualification" });
    }
  });
  
  // Update a preferred qualification
  app.patch("/api/hosts/:hostId/preferred-qualifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hostId = parseInt(req.params.hostId);
      const { priority, notes, isRequired } = req.body;
      
      // Check if the preferred qualification exists and belongs to the host
      const existingPref = await storage.getHostEmployerPreferredQualification(id);
      if (!existingPref || existingPref.hostEmployerId !== hostId) {
        return res.status(404).json({ message: "Preferred qualification not found" });
      }
      
      // Update the preferred qualification
      const updatedPref = await storage.updateHostEmployerPreferredQualification(id, {
        priority,
        notes,
        isRequired,
        updatedAt: new Date()
      });
      
      // Get the qualification details
      const qualification = await storage.getQualification(existingPref.qualificationId);
      
      res.json({
        ...updatedPref,
        qualification: qualification || undefined
      });
    } catch (error) {
      console.error("Error updating preferred qualification:", error);
      res.status(500).json({ message: "Error updating preferred qualification" });
    }
  });
  
  // Remove a preferred qualification
  app.delete("/api/hosts/:hostId/preferred-qualifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hostId = parseInt(req.params.hostId);
      
      // Check if the preferred qualification exists and belongs to the host
      const existingPref = await storage.getHostEmployerPreferredQualification(id);
      if (!existingPref || existingPref.hostEmployerId !== hostId) {
        return res.status(404).json({ message: "Preferred qualification not found" });
      }
      
      // Delete the preferred qualification
      await storage.removeHostEmployerPreferredQualification(id);
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting preferred qualification:", error);
      res.status(500).json({ message: "Error deleting preferred qualification" });
    }
  });

  // Host Monitoring API Endpoints
  // Get monitoring entries for a host
  app.get("/api/hosts/:hostId/monitoring", async (req, res) => {
    try {
      // We'd implement this endpoint to fetch monitoring entries
      // Since we haven't created this table/schema yet, returning empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching monitoring entries:", error);
      res.status(500).json({ message: "Error fetching monitoring entries" });
    }
  });

  // Host Vacancies API Endpoints
  // Get all vacancies
  app.get("/api/vacancies", async (req, res) => {
    try {
      // Get all vacancies from the database
      const vacancies = await db
        .select()
        .from(hostEmployers)
        .leftJoin(placements, eq(placements.hostEmployerId, hostEmployers.id))
        .orderBy(desc(placements.startDate));
      
      res.json(vacancies);
    } catch (error) {
      console.error("Error fetching vacancies:", error);
      res.status(500).json({ message: "Error fetching vacancies" });
    }
  });
  
  // Create a new vacancy
  app.post("/api/vacancies", async (req, res) => {
    try {
      const vacancyData = req.body;
      
      // Validate the vacancy data
      if (!vacancyData.hostEmployerId) {
        return res.status(400).json({ message: "Host employer ID is required" });
      }
      
      // Check if host employer exists
      const host = await storage.getHostEmployer(parseInt(vacancyData.hostEmployerId));
      if (!host) {
        return res.status(404).json({ message: "Host employer not found" });
      }
      
      // Creating a placement record for the vacancy
      // In a real application, this might be a separate vacancies table
      const [vacancy] = await db
        .insert(placements)
        .values({
          hostEmployerId: parseInt(vacancyData.hostEmployerId),
          title: vacancyData.title,
          location: vacancyData.location,
          startDate: new Date(vacancyData.startDate),
          status: "open",
          positionCount: vacancyData.numberOfPositions || 1,
          description: vacancyData.description,
          requirements: vacancyData.requirements || "",
          specialRequirements: vacancyData.specialRequirements || "",
          isRemote: vacancyData.isRemote || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      res.status(201).json(vacancy);
    } catch (error) {
      console.error("Error creating vacancy:", error);
      res.status(500).json({ 
        message: "Error creating vacancy",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get vacancies for a host
  app.get("/api/host-vacancies/:hostId", async (req, res) => {
    try {
      const hostId = parseInt(req.params.hostId);
      
      // Get all vacancies (placements with no apprentice) for this host
      const vacancies = await db
        .select()
        .from(placements)
        .where(
          and(
            eq(placements.hostEmployerId, hostId),
            isNull(placements.apprenticeId),
            eq(placements.status, "open")
          )
        );
      
      res.json(vacancies);
    } catch (error) {
      console.error("Error fetching host vacancies:", error);
      res.status(500).json({ message: "Error fetching host vacancies" });
    }
  });

  // Get candidates for a host's vacancies
  app.get("/api/host-candidates/:hostId", async (req, res) => {
    try {
      // We'd implement this endpoint to fetch candidates
      // Since we haven't created this table/schema yet, returning empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching host candidates:", error);
      res.status(500).json({ message: "Error fetching host candidates" });
    }
  });

  // Host Reports API Endpoint
  app.get("/api/hosts/:hostId/reports", async (req, res) => {
    try {
      // We'd implement this endpoint to fetch reports
      // Since we haven't created this table/schema yet, returning empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching host reports:", error);
      res.status(500).json({ message: "Error fetching host reports" });
    }
  });
}