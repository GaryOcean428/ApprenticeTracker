import express, { Request, Response } from 'express';
import { storage } from '../storage';
import { 
  insertContactSchema, 
  insertContactTagSchema, 
  insertContactTagAssignmentSchema,
  insertContactGroupSchema,
  insertContactGroupMemberSchema,
  insertContactInteractionSchema
} from '@shared/schema';
import { isAuthenticated } from '../middleware/auth';
import { hasPermission } from '../middleware/permissions';
import { z } from 'zod';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = express.Router();

// Ensure authorized for contacts management
// Temporarily using isAuthenticated only until permissions are properly defined
const contactsAuthorized = [isAuthenticated]; // Was: [isAuthenticated, hasPermission('manage:contacts')]
const contactsViewAuthorized = [isAuthenticated]; // Was: [isAuthenticated, hasPermission('view:contacts')]

// ===================== CONTACTS ROUTES =====================

// Get all contacts
router.get('/', contactsViewAuthorized, async (req: Request, res: Response) => {
  try {
    const primaryRole = req.query.primaryRole as string | undefined;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
    
    const contacts = await storage.getAllContacts({ 
      primaryRole, 
      isActive, 
      organizationId 
    });
    
    res.json(contacts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get contact by ID
router.get('/:id', contactsViewAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const contact = await storage.getContact(id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new contact
router.post('/', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const parsedData = insertContactSchema.parse(req.body);
    const newContact = await storage.createContact(parsedData);
    res.status(201).json(newContact);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update a contact
router.put('/:id', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const parsedData = insertContactSchema.partial().parse(req.body);
    
    const updatedContact = await storage.updateContact(id, parsedData);
    
    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.json(updatedContact);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Deactivate a contact
router.put('/:id/deactivate', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deactivateContact(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.json({ message: 'Contact deactivated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a contact
router.delete('/:id', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteContact(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.json({ message: 'Contact deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ===================== CONTACT TAGS ROUTES =====================

// Get all contact tags - primary endpoint
// Using an explicit path to avoid confusion with the /:id route
// Temporarily removing authorization middleware for debugging
router.get('/contact-tags', async (req: Request, res: Response) => {
  try {
    console.log("GET /api/contacts/contact-tags endpoint called");
    
    // Directly return some static data to test if the API route works at all
    // This is just a temporary test to isolate where the issue is
    console.log("Returning static test data from /contact-tags endpoint");
    return res.json([
      { 
        id: 1, 
        name: "Test Tag", 
        description: "This is a test tag", 
        color: "#3B82F6",
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
    
    // The original code BELOW will be skipped during this test
    // const tags = await storage.getAllContactTags();
    // console.log(`Returning ${tags.length} tags from /contact-tags endpoint`);
    // res.json(tags);
  } catch (error: any) {
    console.error("Error in GET /api/contacts/contact-tags:", error);
    console.error("Error details:", error.stack);
    res.status(500).json({ 
      message: error.message,
      stack: error.stack,
      name: error.name,
      fullError: JSON.stringify(error)
    });
  }
});

// Get all contact tags (alternative route)
router.get('/tags/all', contactsViewAuthorized, async (req: Request, res: Response) => {
  try {
    console.log("GET /api/contacts/tags/all endpoint called");
    const tags = await storage.getAllContactTags();
    console.log(`Returning ${tags.length} tags from /tags/all endpoint`);
    res.json(tags);
  } catch (error: any) {
    console.error("Error in GET /api/contacts/tags/all:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new contact tag
router.post('/tags', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const parsedData = insertContactTagSchema.parse(req.body);
    const newTag = await storage.createContactTag(parsedData);
    res.status(201).json(newTag);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update a contact tag
router.put('/tags/:id', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const parsedData = insertContactTagSchema.partial().parse(req.body);
    
    const updatedTag = await storage.updateContactTag(id, parsedData);
    
    if (!updatedTag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    res.json(updatedTag);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete a contact tag
router.delete('/tags/:id', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteContactTag(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    res.json({ message: 'Tag deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get tags for a contact
router.get('/:id/tags', contactsViewAuthorized, async (req: Request, res: Response) => {
  try {
    const contactId = parseInt(req.params.id);
    const tags = await storage.getContactTags(contactId);
    res.json(tags);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Assign tag to contact
router.post('/:id/tags', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const contactId = parseInt(req.params.id);
    const parsedData = insertContactTagAssignmentSchema.parse({
      ...req.body,
      contactId
    });
    
    const assignment = await storage.assignTagToContact(parsedData);
    res.status(201).json(assignment);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Remove tag from contact
router.delete('/:contactId/tags/:tagId', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const contactId = parseInt(req.params.contactId);
    const tagId = parseInt(req.params.tagId);
    
    const success = await storage.removeTagFromContact(contactId, tagId);
    
    if (!success) {
      return res.status(404).json({ message: 'Tag assignment not found' });
    }
    
    res.json({ message: 'Tag removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ===================== CONTACT GROUPS ROUTES =====================

// Get all contact groups - primary endpoint
router.get('/groups', contactsViewAuthorized, async (req: Request, res: Response) => {
  try {
    console.log("GET /api/contacts/groups endpoint called");
    const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
    const groups = await storage.getAllContactGroups(organizationId);
    console.log(`Returning ${groups.length} groups from /groups endpoint`);
    res.json(groups);
  } catch (error: any) {
    console.error("Error in GET /api/contacts/groups:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all contact groups (alternative route)
router.get('/groups/all', contactsViewAuthorized, async (req: Request, res: Response) => {
  try {
    const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
    const groups = await storage.getAllContactGroups(organizationId);
    res.json(groups);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new contact group
router.post('/groups', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const parsedData = insertContactGroupSchema.parse(req.body);
    const newGroup = await storage.createContactGroup(parsedData);
    res.status(201).json(newGroup);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete a contact group
router.delete('/groups/:id', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteContactGroup(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get group members
router.get('/groups/:id/members', contactsViewAuthorized, async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id);
    const members = await storage.getGroupMembers(groupId);
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add contact to group
router.post('/groups/:id/members', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id);
    const parsedData = insertContactGroupMemberSchema.parse({
      ...req.body,
      groupId
    });
    
    const member = await storage.addContactToGroup(parsedData);
    res.status(201).json(member);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Remove contact from group
router.delete('/groups/:groupId/members/:contactId', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const contactId = parseInt(req.params.contactId);
    
    const success = await storage.removeContactFromGroup(groupId, contactId);
    
    if (!success) {
      return res.status(404).json({ message: 'Group member not found' });
    }
    
    res.json({ message: 'Contact removed from group successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get groups for a contact
router.get('/:id/groups', contactsViewAuthorized, async (req: Request, res: Response) => {
  try {
    const contactId = parseInt(req.params.id);
    const groups = await storage.getContactGroups(contactId);
    res.json(groups);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ===================== CONTACT INTERACTIONS ROUTES =====================

// Get interactions for a contact
router.get('/:id/interactions', contactsViewAuthorized, async (req: Request, res: Response) => {
  try {
    const contactId = parseInt(req.params.id);
    const interactions = await storage.getContactInteractions(contactId);
    res.json(interactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new interaction
router.post('/:id/interactions', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const contactId = parseInt(req.params.id);
    const parsedData = insertContactInteractionSchema.parse({
      ...req.body,
      contactId,
      userId: req.user.id // Add the current user as the one who created the interaction
    });
    
    const interaction = await storage.createContactInteraction(parsedData);
    res.status(201).json(interaction);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update an interaction
router.put('/interactions/:id', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const parsedData = insertContactInteractionSchema.partial().parse(req.body);
    
    const updatedInteraction = await storage.updateContactInteraction(id, parsedData);
    
    if (!updatedInteraction) {
      return res.status(404).json({ message: 'Interaction not found' });
    }
    
    res.json(updatedInteraction);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete an interaction
router.delete('/interactions/:id', contactsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteContactInteraction(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Interaction not found' });
    }
    
    res.json({ message: 'Interaction deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;