import express, { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// Simple endpoint to get all contact tags
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log("GET /api/tags endpoint called");
    
    // Hard-code a sample response for testing
    const sampleTags = [
      {
        id: 1,
        name: "Apprentice",
        description: "Registered apprentice in training",
        color: "#3B82F6",
        isSystem: true
      },
      {
        id: 2,
        name: "Trainee",
        description: "Registered trainee in a training program",
        color: "#10B981",
        isSystem: true
      },
      {
        id: 3,
        name: "Labour Hire",
        description: "Labour hire worker",
        color: "#F59E0B",
        isSystem: true
      },
      {
        id: 4,
        name: "Host Employer",
        description: "Host employer representative",
        color: "#8B5CF6",
        isSystem: true
      },
      {
        id: 5,
        name: "Client",
        description: "Client contact",
        color: "#EC4899",
        isSystem: true
      }
    ];
    
    console.log("Returning sample tags");
    res.json(sampleTags);
  } catch (error: any) {
    console.error("Error in GET /api/tags:", error);
    console.error("Error details:", error.stack);
    res.status(500).json({ message: error.message });
  }
});

export default router;