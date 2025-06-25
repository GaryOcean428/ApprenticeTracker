import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { 
  insertEnrichmentProgramSchema,
  insertEnrichmentParticipantSchema,
  insertEnrichmentWorkshopSchema,
  insertWorkshopAttendeeSchema,
  insertProgressReviewTemplateSchema,
  insertProgressReviewSchema,
  insertProgressReviewActionItemSchema
} from "@shared/schema";

const router = Router();

// Enrichment Program Routes

// Get all enrichment programs
router.get("/programs", async (req, res) => {
  try {
    const { active } = req.query;
    
    let programs;
    if (active === "true") {
      programs = await storage.getActiveEnrichmentPrograms();
    } else {
      programs = await storage.getAllEnrichmentPrograms();
    }
    
    res.json(programs);
  } catch (error) {
    console.error("Error fetching enrichment programs:", error);
    res.status(500).json({ 
      message: "Error fetching enrichment programs", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get enrichment program by ID
router.get("/programs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const program = await storage.getEnrichmentProgram(id);
    
    if (!program) {
      return res.status(404).json({ message: "Enrichment program not found" });
    }
    
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: "Error fetching enrichment program" });
  }
});

// Create enrichment program
router.post("/programs", async (req, res) => {
  try {
    const programData = insertEnrichmentProgramSchema.parse(req.body);
    const program = await storage.createEnrichmentProgram(programData);
    
    // Create activity log
    await storage.createActivityLog({
      userId: 1, // Assuming admin user
      action: "created",
      relatedTo: "enrichment_program",
      relatedId: program.id,
      details: { 
        message: `New enrichment program "${program.name}" created`,
        programId: program.id
      }
    });
    
    res.status(201).json(program);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid program data", errors: error.errors });
    } else {
      console.error("Error creating enrichment program:", error);
      res.status(500).json({ 
        message: "Error creating enrichment program",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
});

// Update enrichment program
router.patch("/programs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const programData = req.body;
    const program = await storage.updateEnrichmentProgram(id, programData);
    
    if (!program) {
      return res.status(404).json({ message: "Enrichment program not found" });
    }
    
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: "Error updating enrichment program" });
  }
});

// Enrichment Participant Routes

// Get participants for a program
router.get("/programs/:programId/participants", async (req, res) => {
  try {
    const programId = parseInt(req.params.programId);
    const participants = await storage.getEnrichmentParticipantsByProgram(programId);
    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching program participants" });
  }
});

// Enroll apprentice in program
router.post("/programs/:programId/participants", async (req, res) => {
  try {
    const programId = parseInt(req.params.programId);
    const participantData = insertEnrichmentParticipantSchema.parse({
      ...req.body,
      programId,
      enrollmentDate: new Date()
    });
    
    const participant = await storage.enrollApprenticeInProgram(participantData);
    
    res.status(201).json(participant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid participant data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Error enrolling apprentice in program" });
    }
  }
});

// Complete program participation
router.patch("/participants/:id/complete", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { feedback } = req.body;
    
    const participant = await storage.completeEnrichmentProgram(id, new Date(), feedback);
    
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }
    
    res.json(participant);
  } catch (error) {
    res.status(500).json({ message: "Error completing program participation" });
  }
});

// Enrichment Workshop Routes

// Get workshops for a program
router.get("/programs/:programId/workshops", async (req, res) => {
  try {
    const programId = parseInt(req.params.programId);
    const workshops = await storage.getEnrichmentWorkshopsByProgram(programId);
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workshops" });
  }
});

// Create workshop
router.post("/programs/:programId/workshops", async (req, res) => {
  try {
    const programId = parseInt(req.params.programId);
    const workshopData = insertEnrichmentWorkshopSchema.parse({
      ...req.body,
      programId
    });
    
    const workshop = await storage.createEnrichmentWorkshop(workshopData);
    res.status(201).json(workshop);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid workshop data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Error creating workshop" });
    }
  }
});

// Workshop Attendee Routes

// Register for workshop
router.post("/workshops/:workshopId/register", async (req, res) => {
  try {
    const workshopId = parseInt(req.params.workshopId);
    const attendeeData = insertWorkshopAttendeeSchema.parse({
      ...req.body,
      workshopId,
      registrationDate: new Date()
    });
    
    const attendee = await storage.registerForWorkshop(attendeeData);
    res.status(201).json(attendee);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid registration data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Error registering for workshop" });
    }
  }
});

// Mark workshop attendance
router.patch("/attendees/:id/attendance", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!["attended", "no-show", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid attendance status" });
    }
    
    const attendee = await storage.markWorkshopAttendance(id, status);
    
    if (!attendee) {
      return res.status(404).json({ message: "Workshop attendee not found" });
    }
    
    res.json(attendee);
  } catch (error) {
    res.status(500).json({ message: "Error updating workshop attendance" });
  }
});

// Progress Review Template Routes

// Get all progress review templates
router.get("/review-templates", async (req, res) => {
  try {
    const { active } = req.query;
    
    let templates;
    if (active === "true") {
      templates = await storage.getActiveProgressReviewTemplates();
    } else {
      templates = await storage.getAllProgressReviewTemplates();
    }
    
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching progress review templates" });
  }
});

// Create progress review template
router.post("/review-templates", async (req, res) => {
  try {
    const templateData = insertProgressReviewTemplateSchema.parse(req.body);
    const template = await storage.createProgressReviewTemplate(templateData);
    
    res.status(201).json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid template data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Error creating progress review template" });
    }
  }
});

// Progress Review Routes

// Get progress reviews
router.get("/reviews", async (req, res) => {
  try {
    const { apprenticeId, reviewerId } = req.query;
    
    let reviews;
    if (apprenticeId) {
      reviews = await storage.getProgressReviewsByApprentice(parseInt(apprenticeId as string));
    } else if (reviewerId) {
      reviews = await storage.getProgressReviewsByReviewer(parseInt(reviewerId as string));
    } else {
      reviews = await storage.getAllProgressReviews();
    }
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching progress reviews" });
  }
});

// Create progress review
router.post("/reviews", async (req, res) => {
  try {
    const reviewData = insertProgressReviewSchema.parse(req.body);
    const review = await storage.createProgressReview(reviewData);
    
    // Create activity log
    await storage.createActivityLog({
      userId: review.reviewerId,
      action: "created",
      relatedTo: "progress_review",
      relatedId: review.id,
      details: { 
        message: `Progress review scheduled for apprentice #${review.apprenticeId}`,
        reviewId: review.id,
        apprenticeId: review.apprenticeId
      }
    });
    
    res.status(201).json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid review data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Error creating progress review" });
    }
  }
});

// Complete progress review
router.patch("/reviews/:id/complete", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { summary, rating } = req.body;
    
    const review = await storage.completeProgressReview(id, summary, rating);
    
    if (!review) {
      return res.status(404).json({ message: "Progress review not found" });
    }
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Error completing progress review" });
  }
});

// Progress Review Action Items

// Get action items for a review
router.get("/reviews/:reviewId/action-items", async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const actionItems = await storage.getProgressReviewActionItemsByReview(reviewId);
    res.json(actionItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching action items" });
  }
});

// Create action item
router.post("/reviews/:reviewId/action-items", async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const actionItemData = insertProgressReviewActionItemSchema.parse({
      ...req.body,
      reviewId
    });
    
    const actionItem = await storage.createProgressReviewActionItem(actionItemData);
    res.status(201).json(actionItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid action item data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Error creating action item" });
    }
  }
});

// Complete action item
router.patch("/action-items/:id/complete", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { completionNotes } = req.body;
    
    const actionItem = await storage.completeProgressReviewActionItem(id, completionNotes);
    
    if (!actionItem) {
      return res.status(404).json({ message: "Action item not found" });
    }
    
    res.json(actionItem);
  } catch (error) {
    res.status(500).json({ message: "Error completing action item" });
  }
});

export default router;