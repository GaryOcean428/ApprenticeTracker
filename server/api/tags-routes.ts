import type { Request, Response } from 'express';
import express from 'express';
import { insertContactTagSchema } from '@shared/schema';
import { z } from 'zod';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// Get all contact tags
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('GET /api/tags endpoint called');

    // Sample tags for testing until the storage method is fixed
    const sampleTags = [
      {
        id: 1,
        name: 'Apprentice',
        description: 'Registered apprentice in training',
        color: '#3B82F6',
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Trainee',
        description: 'Registered trainee in a training program',
        color: '#10B981',
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: 'Labour Hire',
        description: 'Labour hire worker',
        color: '#F59E0B',
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 4,
        name: 'Host Employer',
        description: 'Host employer representative',
        color: '#8B5CF6',
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 5,
        name: 'Client',
        description: 'Client contact',
        color: '#EC4899',
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    console.log('Returning sample tags');
    res.json(sampleTags);

    /* Commented out until storage is fixed
    const tags = await storage.getAllContactTags();
    res.json(tags);
    */
  } catch (error: any) {
    console.error('Error in GET /api/tags:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: error.message });
  }
});

// Create new contact tag
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const tagData = insertContactTagSchema.parse(req.body);

    // For testing, return a dummy response
    const newTag = {
      id: Math.floor(Math.random() * 1000) + 100,
      ...tagData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(201).json(newTag);

    /* Commented out until storage is fixed
    const tag = await storage.createContactTag(tagData);
    res.status(201).json(tag);
    */
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid tag data', errors: error.errors });
    } else {
      console.error('Error creating tag:', error);
      res.status(500).json({ message: error.message });
    }
  }
});

// Update contact tag
router.put('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const tagData = req.body;

    // For testing, return a dummy response
    const updatedTag = {
      id,
      ...tagData,
      updatedAt: new Date().toISOString(),
    };

    res.json(updatedTag);

    /* Commented out until storage is fixed
    const tag = await storage.updateContactTag(id, tagData);
    
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    
    res.json(tag);
    */
  } catch (error: any) {
    console.error('Error updating tag:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete contact tag
router.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // For testing, return a dummy success response
    res.json({ success: true });

    /* Commented out until storage is fixed
    // First check if the tag is a system tag
    const tag = await storage.getContactTag(id);
    
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    
    if (tag.isSystem) {
      return res.status(403).json({ message: "System tags cannot be deleted" });
    }
    
    const success = await storage.deleteContactTag(id);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ message: "Error deleting tag" });
    }
    */
  } catch (error: any) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
