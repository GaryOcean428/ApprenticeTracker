import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertApprenticeSchema, 
  insertHostEmployerSchema, 
  insertTrainingContractSchema,
  insertPlacementSchema,
  insertDocumentSchema,
  insertComplianceRecordSchema,
  insertTimesheetSchema,
  insertTaskSchema
} from "@shared/schema";
import { z } from "zod";
import { gtoComplianceRouter } from "./api/gto-compliance-routes";
import { vetRouter } from "./api/vet-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - prefix all routes with /api
  
  // Get metrics for dashboard
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      // Default metrics values in case of data retrieval issues
      let metrics = {
        totalApprentices: 0,
        activeHosts: 0,
        complianceAlerts: 0,
        pendingApprovals: 0
      };
      
      try {
        const apprentices = await storage.getAllApprentices();
        metrics.totalApprentices = apprentices.length;
      } catch (err) {
        console.error("Error fetching apprentices for dashboard:", err);
      }
      
      try {
        const hosts = await storage.getAllHostEmployers();
        metrics.activeHosts = hosts.filter(host => host.status === "active").length;
      } catch (err) {
        console.error("Error fetching hosts for dashboard:", err);
      }
      
      try {
        const complianceRecords = await storage.getAllComplianceRecords();
        metrics.complianceAlerts = complianceRecords.filter(record => record.status === "non-compliant").length;
      } catch (err) {
        console.error("Error fetching compliance records for dashboard:", err);
      }
      
      try {
        const pendingTasks = (await storage.getAllTasks()).filter(
          task => task.status === "pending" && task.priority === "urgent"
        );
        metrics.pendingApprovals = pendingTasks.length;
      } catch (err) {
        console.error("Error fetching tasks for dashboard:", err);
      }
      
      res.json(metrics);
    } catch (error) {
      console.error("Error in dashboard metrics endpoint:", error);
      res.status(500).json({ 
        message: "Error fetching dashboard metrics",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get recent activities
  app.get("/api/activities/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getRecentActivityLogs(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent activities" });
    }
  });
  
  // Get tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });
  
  // Create task
  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      
      // Create activity log
      await storage.createActivityLog({
        userId: taskData.createdBy,
        action: "created",
        relatedTo: "task",
        relatedId: task.id,
        details: { 
          message: `Task "${task.title}" created`,
          taskId: task.id
        }
      });
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating task" });
      }
    }
  });
  
  // Update task status
  app.patch("/api/tasks/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "in_progress", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      let task;
      if (status === "completed") {
        task = await storage.completeTask(id);
      } else {
        task = await storage.updateTask(id, { status });
      }
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Error updating task" });
    }
  });
  
  // Apprentice routes
  
  // Get all apprentices
  app.get("/api/apprentices", async (req, res) => {
    try {
      const apprentices = await storage.getAllApprentices();
      res.json(apprentices);
    } catch (error) {
      console.error("Error fetching apprentices:", error);
      
      // Return a more detailed error message for debugging
      res.status(500).json({ 
        message: "Error fetching apprentices", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get apprentice by ID
  app.get("/api/apprentices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const apprentice = await storage.getApprentice(id);
      
      if (!apprentice) {
        return res.status(404).json({ message: "Apprentice not found" });
      }
      
      res.json(apprentice);
    } catch (error) {
      res.status(500).json({ message: "Error fetching apprentice" });
    }
  });
  
  // Create apprentice
  app.post("/api/apprentices", async (req, res) => {
    try {
      const apprenticeData = insertApprenticeSchema.parse(req.body);
      const apprentice = await storage.createApprentice(apprenticeData);
      
      // Create activity log
      await storage.createActivityLog({
        userId: 1, // Assuming admin user
        action: "created",
        relatedTo: "apprentice",
        relatedId: apprentice.id,
        details: { 
          message: `New apprentice ${apprentice.firstName} ${apprentice.lastName} registered`,
          apprenticeId: apprentice.id
        }
      });
      
      res.status(201).json(apprentice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid apprentice data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating apprentice" });
      }
    }
  });
  
  // Update apprentice
  app.patch("/api/apprentices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const apprenticeData = req.body;
      const apprentice = await storage.updateApprentice(id, apprenticeData);
      
      if (!apprentice) {
        return res.status(404).json({ message: "Apprentice not found" });
      }
      
      // Create activity log
      await storage.createActivityLog({
        userId: 1, // Assuming admin user
        action: "updated",
        relatedTo: "apprentice",
        relatedId: apprentice.id,
        details: { 
          message: `Apprentice ${apprentice.firstName} ${apprentice.lastName} updated`,
          apprenticeId: apprentice.id
        }
      });
      
      res.json(apprentice);
    } catch (error) {
      res.status(500).json({ message: "Error updating apprentice" });
    }
  });
  
  // Update apprentice status (transition between stages)
  app.patch("/api/apprentices/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      
      // Get the existing apprentice
      const existingApprentice = await storage.getApprentice(id);
      if (!existingApprentice) {
        return res.status(404).json({ message: "Apprentice not found" });
      }
      
      // Validate the status transition
      const validStatuses = [
        "applicant", 
        "recruitment", 
        "pre-commencement", 
        "active", 
        "suspended", 
        "withdrawn", 
        "completed"
      ];
      
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: "Invalid status",
          validStatuses 
        });
      }
      
      // Apply status change and update notes if provided
      const updateData: any = { status };
      if (notes) {
        updateData.notes = existingApprentice.notes 
          ? `${existingApprentice.notes}\n\n${new Date().toISOString().split('T')[0]} - STATUS CHANGE to ${status}:\n${notes}`
          : `${new Date().toISOString().split('T')[0]} - STATUS CHANGE to ${status}:\n${notes}`;
      }
      
      // Add specific date flags based on status transitions
      if (status === "active" && existingApprentice.status !== "active") {
        // When transitioning to active, set start date if not already set
        if (!existingApprentice.startDate) {
          updateData.startDate = new Date().toISOString().split('T')[0];
        }
      } else if (status === "completed" && existingApprentice.status !== "completed") {
        // When completing, set end date if not already set
        if (!existingApprentice.endDate) {
          updateData.endDate = new Date().toISOString().split('T')[0];
        }
      }
      
      // Update the apprentice
      const apprentice = await storage.updateApprentice(id, updateData);
      
      // Create activity log
      await storage.createActivityLog({
        userId: 1, // Assuming admin user
        action: "status-changed",
        relatedTo: "apprentice",
        relatedId: apprentice.id,
        details: { 
          message: `Apprentice ${apprentice.firstName} ${apprentice.lastName} status changed from ${existingApprentice.status} to ${status}`,
          apprenticeId: apprentice.id,
          previousStatus: existingApprentice.status,
          newStatus: status,
          notes: notes || null
        }
      });
      
      res.json(apprentice);
    } catch (error) {
      console.error("Error updating apprentice status:", error);
      res.status(500).json({ 
        message: "Error updating apprentice status",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Delete apprentice
  app.delete("/api/apprentices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const apprentice = await storage.getApprentice(id);
      
      if (!apprentice) {
        return res.status(404).json({ message: "Apprentice not found" });
      }
      
      const success = await storage.deleteApprentice(id);
      
      if (success) {
        // Create activity log
        await storage.createActivityLog({
          userId: 1, // Assuming admin user
          action: "deleted",
          relatedTo: "apprentice",
          relatedId: id,
          details: { 
            message: `Apprentice ${apprentice.firstName} ${apprentice.lastName} deleted`,
            apprenticeId: id
          }
        });
        
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Error deleting apprentice" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting apprentice" });
    }
  });
  
  // Host Employer routes
  
  // Get all host employers
  app.get("/api/hosts", async (req, res) => {
    try {
      const hosts = await storage.getAllHostEmployers();
      res.json(hosts);
    } catch (error) {
      console.error("Error fetching host employers:", error);
      
      // Return a more detailed error message for debugging
      res.status(500).json({
        message: "Error fetching host employers",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get host employer by ID
  app.get("/api/hosts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const host = await storage.getHostEmployer(id);
      
      if (!host) {
        return res.status(404).json({ message: "Host employer not found" });
      }
      
      res.json(host);
    } catch (error) {
      res.status(500).json({ message: "Error fetching host employer" });
    }
  });
  
  // Create host employer
  app.post("/api/hosts", async (req, res) => {
    try {
      const hostData = insertHostEmployerSchema.parse(req.body);
      const host = await storage.createHostEmployer(hostData);
      
      // Create activity log
      await storage.createActivityLog({
        userId: 1, // Assuming admin user
        action: "created",
        relatedTo: "host",
        relatedId: host.id,
        details: { 
          message: `New host employer ${host.name} registered`,
          hostId: host.id
        }
      });
      
      res.status(201).json(host);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid host employer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating host employer" });
      }
    }
  });
  
  // Update host employer
  app.patch("/api/hosts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hostData = req.body;
      const host = await storage.updateHostEmployer(id, hostData);
      
      if (!host) {
        return res.status(404).json({ message: "Host employer not found" });
      }
      
      // Create activity log
      await storage.createActivityLog({
        userId: 1, // Assuming admin user
        action: "updated",
        relatedTo: "host",
        relatedId: host.id,
        details: { 
          message: `Host employer ${host.name} updated`,
          hostId: host.id
        }
      });
      
      res.json(host);
    } catch (error) {
      res.status(500).json({ message: "Error updating host employer" });
    }
  });
  
  // Delete host employer
  app.delete("/api/hosts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const host = await storage.getHostEmployer(id);
      
      if (!host) {
        return res.status(404).json({ message: "Host employer not found" });
      }
      
      const success = await storage.deleteHostEmployer(id);
      
      if (success) {
        // Create activity log
        await storage.createActivityLog({
          userId: 1, // Assuming admin user
          action: "deleted",
          relatedTo: "host",
          relatedId: id,
          details: { 
            message: `Host employer ${host.name} deleted`,
            hostId: id
          }
        });
        
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Error deleting host employer" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting host employer" });
    }
  });
  
  // Training Contract routes
  
  // Get all training contracts
  app.get("/api/contracts", async (req, res) => {
    try {
      const contracts = await storage.getAllTrainingContracts();
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching training contracts" });
    }
  });
  
  // Get training contracts by apprentice ID
  app.get("/api/apprentices/:id/contracts", async (req, res) => {
    try {
      const apprenticeId = parseInt(req.params.id);
      const contracts = await storage.getTrainingContractsByApprentice(apprenticeId);
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching training contracts" });
    }
  });
  
  // Get training contract by ID
  app.get("/api/contracts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contract = await storage.getTrainingContract(id);
      
      if (!contract) {
        return res.status(404).json({ message: "Training contract not found" });
      }
      
      res.json(contract);
    } catch (error) {
      res.status(500).json({ message: "Error fetching training contract" });
    }
  });
  
  // Create training contract
  app.post("/api/contracts", async (req, res) => {
    try {
      const contractData = insertTrainingContractSchema.parse(req.body);
      const contract = await storage.createTrainingContract(contractData);
      
      // Create activity log
      await storage.createActivityLog({
        userId: 1, // Assuming admin user
        action: "created",
        relatedTo: "contract",
        relatedId: contract.id,
        details: { 
          message: `New training contract ${contract.contractNumber} created`,
          contractId: contract.id,
          apprenticeId: contract.apprenticeId
        }
      });
      
      res.status(201).json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid training contract data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating training contract" });
      }
    }
  });
  
  // Update training contract
  app.patch("/api/contracts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contractData = req.body;
      const contract = await storage.updateTrainingContract(id, contractData);
      
      if (!contract) {
        return res.status(404).json({ message: "Training contract not found" });
      }
      
      // Create activity log
      await storage.createActivityLog({
        userId: 1, // Assuming admin user
        action: "updated",
        relatedTo: "contract",
        relatedId: contract.id,
        details: { 
          message: `Training contract ${contract.contractNumber} updated`,
          contractId: contract.id
        }
      });
      
      res.json(contract);
    } catch (error) {
      res.status(500).json({ message: "Error updating training contract" });
    }
  });
  
  // Placement routes
  
  // Get all placements
  app.get("/api/placements", async (req, res) => {
    try {
      const placements = await storage.getAllPlacements();
      res.json(placements);
    } catch (error) {
      res.status(500).json({ message: "Error fetching placements" });
    }
  });
  
  // Get placements by apprentice ID
  app.get("/api/apprentices/:id/placements", async (req, res) => {
    try {
      const apprenticeId = parseInt(req.params.id);
      const placements = await storage.getPlacementsByApprentice(apprenticeId);
      res.json(placements);
    } catch (error) {
      res.status(500).json({ message: "Error fetching placements" });
    }
  });
  
  // Get placements by host ID
  app.get("/api/hosts/:id/placements", async (req, res) => {
    try {
      const hostId = parseInt(req.params.id);
      const placements = await storage.getPlacementsByHost(hostId);
      res.json(placements);
    } catch (error) {
      res.status(500).json({ message: "Error fetching placements" });
    }
  });
  
  // Get placement by ID
  app.get("/api/placements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const placement = await storage.getPlacement(id);
      
      if (!placement) {
        return res.status(404).json({ message: "Placement not found" });
      }
      
      res.json(placement);
    } catch (error) {
      res.status(500).json({ message: "Error fetching placement" });
    }
  });
  
  // Create placement
  app.post("/api/placements", async (req, res) => {
    try {
      const placementData = insertPlacementSchema.parse(req.body);
      const placement = await storage.createPlacement(placementData);
      
      // Get apprentice and host details for the activity log
      const apprentice = await storage.getApprentice(placement.apprenticeId);
      const host = await storage.getHostEmployer(placement.hostEmployerId);
      
      // Create activity log
      await storage.createActivityLog({
        userId: 1, // Assuming admin user
        action: "created",
        relatedTo: "placement",
        relatedId: placement.id,
        details: { 
          message: `New placement created for ${apprentice?.firstName} ${apprentice?.lastName} at ${host?.name}`,
          placementId: placement.id,
          apprenticeId: placement.apprenticeId,
          hostEmployerId: placement.hostEmployerId
        }
      });
      
      res.status(201).json(placement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid placement data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating placement" });
      }
    }
  });
  
  // Update placement
  app.patch("/api/placements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const placementData = req.body;
      const placement = await storage.updatePlacement(id, placementData);
      
      if (!placement) {
        return res.status(404).json({ message: "Placement not found" });
      }
      
      // Create activity log
      await storage.createActivityLog({
        userId: 1, // Assuming admin user
        action: "updated",
        relatedTo: "placement",
        relatedId: placement.id,
        details: { 
          message: `Placement #${placement.id} updated`,
          placementId: placement.id
        }
      });
      
      res.json(placement);
    } catch (error) {
      res.status(500).json({ message: "Error updating placement" });
    }
  });
  
  // Document routes
  
  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });
  
  // Get document by ID
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Error fetching document" });
    }
  });
  
  // Get documents by relation
  app.get("/api/documents/related/:type/:id", async (req, res) => {
    try {
      const relatedTo = req.params.type;
      const relatedId = parseInt(req.params.id);
      const documents = await storage.getDocumentsByRelation(relatedTo, relatedId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });
  
  // Create document
  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(documentData);
      
      // Create activity log
      await storage.createActivityLog({
        userId: document.uploadedBy || 1,
        action: "uploaded",
        relatedTo: "document",
        relatedId: document.id,
        details: { 
          message: `New document "${document.title}" uploaded`,
          documentId: document.id,
          relatedTo: document.relatedTo,
          relatedId: document.relatedId
        }
      });
      
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid document data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating document" });
      }
    }
  });
  
  // Compliance routes
  
  // Get all compliance records
  app.get("/api/compliance", async (req, res) => {
    try {
      const records = await storage.getAllComplianceRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Error fetching compliance records" });
    }
  });
  
  // Get compliance records by relation
  app.get("/api/compliance/related/:type/:id", async (req, res) => {
    try {
      const relatedTo = req.params.type;
      const relatedId = parseInt(req.params.id);
      const records = await storage.getComplianceRecordsByRelation(relatedTo, relatedId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Error fetching compliance records" });
    }
  });
  
  // Create compliance record
  app.post("/api/compliance", async (req, res) => {
    try {
      const recordData = insertComplianceRecordSchema.parse(req.body);
      const record = await storage.createComplianceRecord(recordData);
      
      // Create activity log
      await storage.createActivityLog({
        userId: 1, // Assuming admin user
        action: "created",
        relatedTo: "compliance",
        relatedId: record.id,
        details: { 
          message: `New compliance record created for ${record.relatedTo} #${record.relatedId}`,
          complianceId: record.id,
          relatedTo: record.relatedTo,
          relatedId: record.relatedId,
          status: record.status
        }
      });
      
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid compliance record data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating compliance record" });
      }
    }
  });
  
  // Update compliance record
  app.patch("/api/compliance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recordData = req.body;
      const record = await storage.updateComplianceRecord(id, recordData);
      
      if (!record) {
        return res.status(404).json({ message: "Compliance record not found" });
      }
      
      // Create activity log
      await storage.createActivityLog({
        userId: 1, // Assuming admin user
        action: "updated",
        relatedTo: "compliance",
        relatedId: record.id,
        details: { 
          message: `Compliance record #${record.id} updated`,
          complianceId: record.id,
          status: record.status
        }
      });
      
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Error updating compliance record" });
    }
  });
  
  // Timesheet routes
  
  // Get all timesheets
  app.get("/api/timesheets", async (req, res) => {
    try {
      const timesheets = await storage.getAllTimesheets();
      res.json(timesheets);
    } catch (error) {
      res.status(500).json({ message: "Error fetching timesheets" });
    }
  });
  
  // Get timesheets by apprentice ID
  app.get("/api/apprentices/:id/timesheets", async (req, res) => {
    try {
      const apprenticeId = parseInt(req.params.id);
      const timesheets = await storage.getTimesheetsByApprentice(apprenticeId);
      res.json(timesheets);
    } catch (error) {
      res.status(500).json({ message: "Error fetching timesheets" });
    }
  });
  
  // Get timesheet by ID
  app.get("/api/timesheets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const timesheet = await storage.getTimesheet(id);
      
      if (!timesheet) {
        return res.status(404).json({ message: "Timesheet not found" });
      }
      
      res.json(timesheet);
    } catch (error) {
      res.status(500).json({ message: "Error fetching timesheet" });
    }
  });
  
  // Create timesheet
  app.post("/api/timesheets", async (req, res) => {
    try {
      const timesheetData = insertTimesheetSchema.parse(req.body);
      const timesheet = await storage.createTimesheet(timesheetData);
      
      // Create activity log
      await storage.createActivityLog({
        userId: 1, // Assuming admin user
        action: "submitted",
        relatedTo: "timesheet",
        relatedId: timesheet.id,
        details: { 
          message: `New timesheet submitted for apprentice #${timesheet.apprenticeId}`,
          timesheetId: timesheet.id,
          apprenticeId: timesheet.apprenticeId,
          status: timesheet.status
        }
      });
      
      res.status(201).json(timesheet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid timesheet data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating timesheet" });
      }
    }
  });
  
  // Update timesheet status
  app.patch("/api/timesheets/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, approvedBy } = req.body;
      
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updateData: any = { status };
      
      if (status === "approved") {
        updateData.approvedBy = approvedBy || 1; // Default to admin user
        updateData.approvalDate = new Date();
      }
      
      const timesheet = await storage.updateTimesheet(id, updateData);
      
      if (!timesheet) {
        return res.status(404).json({ message: "Timesheet not found" });
      }
      
      // Create activity log
      await storage.createActivityLog({
        userId: updateData.approvedBy || 1,
        action: status === "approved" ? "approved" : status === "rejected" ? "rejected" : "updated",
        relatedTo: "timesheet",
        relatedId: timesheet.id,
        details: { 
          message: `Timesheet #${timesheet.id} ${status}`,
          timesheetId: timesheet.id,
          apprenticeId: timesheet.apprenticeId,
          status: timesheet.status
        }
      });
      
      res.json(timesheet);
    } catch (error) {
      res.status(500).json({ message: "Error updating timesheet" });
    }
  });

  // Get apprentice progress modules
  app.get("/api/progress/modules", async (req, res) => {
    try {
      // Return sample progress data
      const progressData = [
        {
          module: "Core Vocational Skills",
          progress: 85,
          status: "in_progress",
          lastActivity: "2024-04-25"
        },
        {
          module: "Health & Safety Fundamentals",
          progress: 100,
          status: "completed",
          lastActivity: "2024-04-15"
        },
        {
          module: "Industry Knowledge",
          progress: 100,
          status: "completed",
          lastActivity: "2024-04-10"
        },
        {
          module: "Practical Assessment",
          progress: 0,
          status: "not_started"
        }
      ];
      res.json(progressData);
    } catch (error) {
      res.status(500).json({ message: "Error fetching progress modules" });
    }
  });
  
  // Get apprentice assessments
  app.get("/api/progress/assessments", async (req, res) => {
    try {
      // Return sample assessment data
      const assessmentData = [
        {
          name: "Health & Safety Exam",
          score: 92,
          date: "2024-04-15",
          feedback: "Excellent understanding of workplace safety protocols"
        },
        {
          name: "Industry Knowledge Quiz",
          score: 88,
          date: "2024-04-10",
          feedback: "Good grasp of industry standards and practices"
        },
        {
          name: "Vocational Skills Assessment 1",
          score: 76,
          date: "2024-03-20",
          feedback: "Needs improvement in technical documentation"
        }
      ];
      res.json(assessmentData);
    } catch (error) {
      res.status(500).json({ message: "Error fetching assessments" });
    }
  });
  
  // Get compliance alerts
  app.get("/api/compliance/alerts", async (req, res) => {
    try {
      // Return sample compliance alerts
      const alerts = [
        {
          id: "1",
          type: "High",
          message: "Missing required documentation for apprentice onboarding",
          date: "2024-04-28"
        },
        {
          id: "2",
          type: "Medium",
          message: "Incomplete risk assessment form for XYZ Construction",
          date: "2024-04-26"
        },
        {
          id: "3",
          type: "Low",
          message: "Pending annual review for apprentice John Smith",
          date: "2024-04-25"
        }
      ];
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching compliance alerts" });
    }
  });

  // Public Website API Routes
  
  // Job Listings for public website
  app.get("/api/jobs", async (req, res) => {
    try {
      // In a real implementation, this would fetch job listings from the database
      // For now, we'll return static data that matches our frontend model
      const jobs = [
        {
          id: "1",
          title: "Carpentry Apprentice",
          location: "Perth Metro",
          type: "Full-time",
          description:
            "Join a leading construction company as a Carpentry Apprentice. Learn all aspects of carpentry while earning. Perfect for someone with basic hand tool skills and a passion for building.",
          requirements: ["Driver's License", "Year 10 completion", "Physically fit", "Reliable transportation"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Electrical Apprentice",
          location: "Perth Metro",
          type: "Full-time",
          description:
            "Fantastic opportunity for a motivated individual to join a well-established electrical contracting business as an apprentice electrician. Work on residential and commercial projects.",
          requirements: ["Year 12 Maths & English", "Driver's License", "Basic technical understanding", "Good communication skills"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Plumbing Apprentice",
          location: "Joondalup",
          type: "Full-time",
          description:
            "Join our team as a Plumbing Apprentice. Learn all aspects of plumbing while working alongside experienced tradespeople. Great opportunity for someone looking to build a career in the trades.",
          requirements: ["Year 10 completion", "Good problem-solving skills", "Physically fit", "Willing to learn"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "4",
          title: "Business Traineeship",
          location: "Perth CBD",
          type: "Full-time",
          description:
            "Exciting opportunity for a business trainee to join our corporate office. Gain hands-on experience in administration, customer service, and office procedures while earning a qualification.",
          requirements: ["Year 12 completion", "Computer literacy", "Good communication skills", "Customer service focus"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching job listings" });
    }
  });
  
  // Handle job applications
  app.post("/api/applications", async (req, res) => {
    try {
      // In a real implementation, this would save the application to the database
      // and potentially create an apprentice record or inquiry
      
      // Create activity log for tracking
      await storage.createActivityLog({
        userId: 1, // Assuming admin user or system
        action: "received",
        relatedTo: "application",
        relatedId: 0, // This would be the application ID in a real system
        details: { 
          message: `New apprentice application received for job ${req.body.jobId}`,
          applicantName: `${req.body.firstName} ${req.body.lastName}`,
          applicantEmail: req.body.email,
          jobId: req.body.jobId
        }
      });
      
      res.status(201).json({ 
        success: true, 
        message: "Your application has been received! We will contact you soon."
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error submitting application. Please try again later."
      });
    }
  });
  
  // Handle host employer inquiries
  app.post("/api/host-inquiries", async (req, res) => {
    try {
      // In a real implementation, this would save the inquiry to the database
      // and potentially create a host employer record or lead
      
      // Create activity log for tracking
      await storage.createActivityLog({
        userId: 1, // Assuming admin user or system
        action: "received",
        relatedTo: "inquiry",
        relatedId: 0, // This would be the inquiry ID in a real system
        details: { 
          message: `New host employer inquiry received from ${req.body.companyName}`,
          companyName: req.body.companyName,
          contactName: req.body.contactName,
          contactEmail: req.body.email,
          industry: req.body.industry
        }
      });
      
      res.status(201).json({ 
        success: true, 
        message: "Your inquiry has been received! Our team will contact you shortly."
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error submitting inquiry. Please try again later."
      });
    }
  });
  
  // Register GTO Compliance routes
  app.use("/api/gto-compliance", gtoComplianceRouter);
  
  // Register VET Training routes for Units of Competency and Qualifications
  app.use("/api/vet", vetRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
