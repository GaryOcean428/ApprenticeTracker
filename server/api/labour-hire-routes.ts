import express from 'express';
import {
  insertLabourHireWorkerSchema,
  insertLabourHirePlacementSchema,
  insertLabourHireTimesheetSchema,
  insertLabourHireWorkerDocumentSchema,
} from '@shared/schema';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated, hasPermission } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

// Worker routes
router.get(
  '/workers',
  isAuthenticated,
  hasPermission('read:labour_hire_worker'),
  async (req, res) => {
    try {
      const workers = await storage.getAllLabourHireWorkers();
      res.json(workers);
    } catch (error) {
      logger.error('Error fetching labour hire workers', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while fetching workers' });
    }
  }
);

router.get(
  '/workers/:id',
  isAuthenticated,
  hasPermission('read:labour_hire_worker'),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid worker ID' });
      }

      const worker = await storage.getLabourHireWorker(id);
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }

      res.json(worker);
    } catch (error) {
      logger.error('Error fetching labour hire worker', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while fetching the worker' });
    }
  }
);

router.post(
  '/workers',
  isAuthenticated,
  hasPermission('create:labour_hire_worker'),
  async (req, res) => {
    try {
      const validatedData = insertLabourHireWorkerSchema.parse(req.body);

      // Check if worker with email already exists
      const existingWorker = await storage.getLabourHireWorkerByEmail(validatedData.email);
      if (existingWorker) {
        return res.status(400).json({ message: 'A worker with this email already exists' });
      }

      const worker = await storage.createLabourHireWorker(validatedData);
      res.status(201).json(worker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }

      logger.error('Error creating labour hire worker', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while creating the worker' });
    }
  }
);

router.put(
  '/workers/:id',
  isAuthenticated,
  hasPermission('update:labour_hire_worker'),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid worker ID' });
      }

      // Ensure worker exists
      const existingWorker = await storage.getLabourHireWorker(id);
      if (!existingWorker) {
        return res.status(404).json({ message: 'Worker not found' });
      }

      // Validate the request body
      const validatedData = insertLabourHireWorkerSchema.partial().parse(req.body);

      // If email is being changed, check if it's already in use
      if (validatedData.email && validatedData.email !== existingWorker.email) {
        const workerWithEmail = await storage.getLabourHireWorkerByEmail(validatedData.email);
        if (workerWithEmail && workerWithEmail.id !== id) {
          return res.status(400).json({ message: 'A worker with this email already exists' });
        }
      }

      const updatedWorker = await storage.updateLabourHireWorker(id, validatedData);
      res.json(updatedWorker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }

      logger.error('Error updating labour hire worker', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while updating the worker' });
    }
  }
);

router.delete(
  '/workers/:id',
  isAuthenticated,
  hasPermission('delete:labour_hire_worker'),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid worker ID' });
      }

      // Ensure worker exists
      const existingWorker = await storage.getLabourHireWorker(id);
      if (!existingWorker) {
        return res.status(404).json({ message: 'Worker not found' });
      }

      const deleted = await storage.deleteLabourHireWorker(id);
      if (!deleted) {
        return res.status(500).json({ message: 'Failed to delete worker' });
      }

      res.status(204).end();
    } catch (error) {
      logger.error('Error deleting labour hire worker', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while deleting the worker' });
    }
  }
);

// Placement routes
router.get(
  '/placements',
  isAuthenticated,
  hasPermission('read:labour_hire_placement'),
  async (req, res) => {
    try {
      const { workerId, hostEmployerId } = req.query;

      let placements;
      if (workerId) {
        placements = await storage.getLabourHirePlacementsByWorker(Number(workerId));
      } else if (hostEmployerId) {
        placements = await storage.getLabourHirePlacementsByHost(Number(hostEmployerId));
      } else {
        placements = await storage.getAllLabourHirePlacements();
      }

      res.json(placements);
    } catch (error) {
      logger.error('Error fetching labour hire placements', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while fetching placements' });
    }
  }
);

router.get(
  '/placements/:id',
  isAuthenticated,
  hasPermission('read:labour_hire_placement'),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid placement ID' });
      }

      const placement = await storage.getLabourHirePlacement(id);
      if (!placement) {
        return res.status(404).json({ message: 'Placement not found' });
      }

      res.json(placement);
    } catch (error) {
      logger.error('Error fetching labour hire placement', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while fetching the placement' });
    }
  }
);

router.post(
  '/placements',
  isAuthenticated,
  hasPermission('create:labour_hire_placement'),
  async (req, res) => {
    try {
      const validatedData = insertLabourHirePlacementSchema.parse(req.body);

      // Verify worker exists
      const worker = await storage.getLabourHireWorker(validatedData.workerId);
      if (!worker) {
        return res.status(400).json({ message: 'Worker not found' });
      }

      // Verify host employer exists
      const hostEmployer = await storage.getHostEmployer(validatedData.hostEmployerId);
      if (!hostEmployer) {
        return res.status(400).json({ message: 'Host employer not found' });
      }

      const placement = await storage.createLabourHirePlacement(validatedData);
      res.status(201).json(placement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }

      logger.error('Error creating labour hire placement', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while creating the placement' });
    }
  }
);

router.put(
  '/placements/:id',
  isAuthenticated,
  hasPermission('update:labour_hire_placement'),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid placement ID' });
      }

      // Ensure placement exists
      const existingPlacement = await storage.getLabourHirePlacement(id);
      if (!existingPlacement) {
        return res.status(404).json({ message: 'Placement not found' });
      }

      // Validate the request body
      const validatedData = insertLabourHirePlacementSchema.partial().parse(req.body);

      // Verify worker exists if worker ID is provided
      if (validatedData.workerId) {
        const worker = await storage.getLabourHireWorker(validatedData.workerId);
        if (!worker) {
          return res.status(400).json({ message: 'Worker not found' });
        }
      }

      // Verify host employer exists if host employer ID is provided
      if (validatedData.hostEmployerId) {
        const hostEmployer = await storage.getHostEmployer(validatedData.hostEmployerId);
        if (!hostEmployer) {
          return res.status(400).json({ message: 'Host employer not found' });
        }
      }

      const updatedPlacement = await storage.updateLabourHirePlacement(id, validatedData);
      res.json(updatedPlacement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }

      logger.error('Error updating labour hire placement', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while updating the placement' });
    }
  }
);

router.delete(
  '/placements/:id',
  isAuthenticated,
  hasPermission('delete:labour_hire_placement'),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid placement ID' });
      }

      // Ensure placement exists
      const existingPlacement = await storage.getLabourHirePlacement(id);
      if (!existingPlacement) {
        return res.status(404).json({ message: 'Placement not found' });
      }

      const deleted = await storage.deleteLabourHirePlacement(id);
      if (!deleted) {
        return res.status(500).json({ message: 'Failed to delete placement' });
      }

      res.status(204).end();
    } catch (error) {
      logger.error('Error deleting labour hire placement', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while deleting the placement' });
    }
  }
);

// Timesheet routes
router.get(
  '/timesheets',
  isAuthenticated,
  hasPermission('read:labour_hire_timesheet'),
  async (req, res) => {
    try {
      const { workerId, placementId } = req.query;

      let timesheets;
      if (workerId) {
        timesheets = await storage.getLabourHireTimesheetsByWorker(Number(workerId));
      } else if (placementId) {
        timesheets = await storage.getLabourHireTimesheetsByPlacement(Number(placementId));
      } else {
        timesheets = await storage.getAllLabourHireTimesheets();
      }

      res.json(timesheets);
    } catch (error) {
      logger.error('Error fetching labour hire timesheets', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while fetching timesheets' });
    }
  }
);

router.get(
  '/timesheets/:id',
  isAuthenticated,
  hasPermission('read:labour_hire_timesheet'),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid timesheet ID' });
      }

      const timesheet = await storage.getLabourHireTimesheet(id);
      if (!timesheet) {
        return res.status(404).json({ message: 'Timesheet not found' });
      }

      res.json(timesheet);
    } catch (error) {
      logger.error('Error fetching labour hire timesheet', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while fetching the timesheet' });
    }
  }
);

router.post(
  '/timesheets',
  isAuthenticated,
  hasPermission('create:labour_hire_timesheet'),
  async (req, res) => {
    try {
      const validatedData = insertLabourHireTimesheetSchema.parse(req.body);

      // Verify worker exists
      const worker = await storage.getLabourHireWorker(validatedData.workerId);
      if (!worker) {
        return res.status(400).json({ message: 'Worker not found' });
      }

      // Verify placement exists
      const placement = await storage.getLabourHirePlacement(validatedData.placementId);
      if (!placement) {
        return res.status(400).json({ message: 'Placement not found' });
      }

      // Verify placement matches worker
      if (placement.workerId !== validatedData.workerId) {
        return res.status(400).json({ message: 'Placement does not belong to this worker' });
      }

      const timesheet = await storage.createLabourHireTimesheet(validatedData);
      res.status(201).json(timesheet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }

      logger.error('Error creating labour hire timesheet', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while creating the timesheet' });
    }
  }
);

router.put(
  '/timesheets/:id',
  isAuthenticated,
  hasPermission('update:labour_hire_timesheet'),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid timesheet ID' });
      }

      // Ensure timesheet exists
      const existingTimesheet = await storage.getLabourHireTimesheet(id);
      if (!existingTimesheet) {
        return res.status(404).json({ message: 'Timesheet not found' });
      }

      // Validate the request body
      const validatedData = insertLabourHireTimesheetSchema.partial().parse(req.body);

      // Only allow updates to draft timesheets
      if (existingTimesheet.status !== 'draft' && !req.body.status) {
        return res.status(400).json({ message: 'Can only update draft timesheets' });
      }

      const updatedTimesheet = await storage.updateLabourHireTimesheet(id, validatedData);
      res.json(updatedTimesheet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }

      logger.error('Error updating labour hire timesheet', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while updating the timesheet' });
    }
  }
);

router.post(
  '/timesheets/:id/submit',
  isAuthenticated,
  hasPermission('update:labour_hire_timesheet'),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid timesheet ID' });
      }

      // Ensure timesheet exists
      const existingTimesheet = await storage.getLabourHireTimesheet(id);
      if (!existingTimesheet) {
        return res.status(404).json({ message: 'Timesheet not found' });
      }

      // Only allow submission of draft timesheets
      if (existingTimesheet.status !== 'draft') {
        return res.status(400).json({ message: 'Only draft timesheets can be submitted' });
      }

      const updatedTimesheet = await storage.submitLabourHireTimesheet(id);
      res.json(updatedTimesheet);
    } catch (error) {
      logger.error('Error submitting labour hire timesheet', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while submitting the timesheet' });
    }
  }
);

router.post(
  '/timesheets/:id/approve',
  isAuthenticated,
  hasPermission('approve:labour_hire_timesheet'),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid timesheet ID' });
      }

      // Ensure timesheet exists
      const existingTimesheet = await storage.getLabourHireTimesheet(id);
      if (!existingTimesheet) {
        return res.status(404).json({ message: 'Timesheet not found' });
      }

      // Only allow approval of submitted timesheets
      if (existingTimesheet.status !== 'submitted') {
        return res.status(400).json({ message: 'Only submitted timesheets can be approved' });
      }

      const userId = req.user.id;
      const updatedTimesheet = await storage.approveLabourHireTimesheet(id, userId);
      res.json(updatedTimesheet);
    } catch (error) {
      logger.error('Error approving labour hire timesheet', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while approving the timesheet' });
    }
  }
);

router.post(
  '/timesheets/:id/reject',
  isAuthenticated,
  hasPermission('approve:labour_hire_timesheet'),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid timesheet ID' });
      }

      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ message: 'Rejection reason is required' });
      }

      // Ensure timesheet exists
      const existingTimesheet = await storage.getLabourHireTimesheet(id);
      if (!existingTimesheet) {
        return res.status(404).json({ message: 'Timesheet not found' });
      }

      // Only allow rejection of submitted timesheets
      if (existingTimesheet.status !== 'submitted') {
        return res.status(400).json({ message: 'Only submitted timesheets can be rejected' });
      }

      const updatedTimesheet = await storage.rejectLabourHireTimesheet(id, reason);
      res.json(updatedTimesheet);
    } catch (error) {
      logger.error('Error rejecting labour hire timesheet', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while rejecting the timesheet' });
    }
  }
);

// Worker Document routes
router.get(
  '/workers/:workerId/documents',
  isAuthenticated,
  hasPermission('read:labour_hire_worker_document'),
  async (req, res) => {
    try {
      const workerId = parseInt(req.params.workerId);
      if (isNaN(workerId)) {
        return res.status(400).json({ message: 'Invalid worker ID' });
      }

      // Verify worker exists
      const worker = await storage.getLabourHireWorker(workerId);
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }

      const documents = await storage.getLabourHireWorkerDocuments(workerId);
      res.json(documents);
    } catch (error) {
      logger.error('Error fetching labour hire worker documents', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while fetching worker documents' });
    }
  }
);

router.post(
  '/workers/:workerId/documents',
  isAuthenticated,
  hasPermission('create:labour_hire_worker_document'),
  async (req, res) => {
    try {
      const workerId = parseInt(req.params.workerId);
      if (isNaN(workerId)) {
        return res.status(400).json({ message: 'Invalid worker ID' });
      }

      // Verify worker exists
      const worker = await storage.getLabourHireWorker(workerId);
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }

      const validatedData = insertLabourHireWorkerDocumentSchema.parse({
        ...req.body,
        workerId,
      });

      // Verify document exists
      const document = await storage.getDocument(validatedData.documentId);
      if (!document) {
        return res.status(400).json({ message: 'Document not found' });
      }

      const workerDocument = await storage.createLabourHireWorkerDocument(validatedData);
      res.status(201).json(workerDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }

      logger.error('Error creating labour hire worker document', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while creating the worker document' });
    }
  }
);

router.post(
  '/workers/documents/:id/verify',
  isAuthenticated,
  hasPermission('verify:labour_hire_worker_document'),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid document ID' });
      }

      // Ensure document exists
      const existingDocument = await storage.getLabourHireWorkerDocument(id);
      if (!existingDocument) {
        return res.status(404).json({ message: 'Worker document not found' });
      }

      // Only allow verification of pending documents
      if (existingDocument.verificationStatus !== 'pending') {
        return res.status(400).json({ message: 'Only pending documents can be verified' });
      }

      const userId = req.user.id;
      const updatedDocument = await storage.verifyLabourHireWorkerDocument(id, userId);
      res.json(updatedDocument);
    } catch (error) {
      logger.error('Error verifying labour hire worker document', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while verifying the document' });
    }
  }
);

router.post(
  '/workers/documents/:id/reject',
  isAuthenticated,
  hasPermission('verify:labour_hire_worker_document'),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid document ID' });
      }

      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ message: 'Rejection reason is required' });
      }

      // Ensure document exists
      const existingDocument = await storage.getLabourHireWorkerDocument(id);
      if (!existingDocument) {
        return res.status(404).json({ message: 'Worker document not found' });
      }

      // Only allow rejection of pending documents
      if (existingDocument.verificationStatus !== 'pending') {
        return res.status(400).json({ message: 'Only pending documents can be rejected' });
      }

      const updatedDocument = await storage.rejectLabourHireWorkerDocument(id, reason);
      res.json(updatedDocument);
    } catch (error) {
      logger.error('Error rejecting labour hire worker document', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: 'An error occurred while rejecting the document' });
    }
  }
);

export default router;
