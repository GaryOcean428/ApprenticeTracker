import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertRoleSchema,
  insertPermissionSchema,
  insertRolePermissionSchema,
  insertSubscriptionPlanSchema,
  insertApprenticeSchema, 
  insertHostEmployerSchema, 
  insertTrainingContractSchema,
  insertPlacementSchema,
  insertDocumentSchema,
  insertComplianceRecordSchema,
  insertTimesheetSchema,
  insertTaskSchema
} from "@shared/schema";
import {
  insertContactTagSchema,
  insertContactTagAssignmentSchema
} from "@shared/schema/contacts";
import { z } from "zod";
import { gtoComplianceRouter } from "./api/gto-compliance-routes";
import { vetRouter } from "./api/vet-routes";
import { settingsRouter } from "./api/settings-routes";
import { registerHostRoutes } from "./api/host-routes";
import { registerTGARoutes } from "./api/tga-routes";
import { fairWorkRouter } from "./api/fair-work-routes";
import { authRouter, isAuthenticated, hasRole } from "./api/auth-routes";
import payrollRouter from "./api/payroll";
import fairworkApiRouter from "./api/fairwork";
import fairworkEnhancedRouter from "./api/fairwork-enhanced";
import enrichmentRouter from "./api/enrichment";
import progressReviewsRouter from "./api/progress-reviews";
import contactsRouter from "./api/contacts-routes";
import clientsRouter from "./api/clients-routes";
import financialRouter from "./api/financial";
import complianceRouter from "./api/compliance";
import { setupWhsRoutes } from "./api/whs/index";
import labourHireRouter from "./api/labour-hire-routes";
import tagsRouter from "./api/tags-routes";
import { eq, and } from "drizzle-orm";
import { db } from "./db"; // Assuming db connection is defined here
import { users, gtoOrganizations } from "@shared/schema";
import jwt from 'jsonwebtoken';

// Special test endpoints for Fair Work API that won't be intercepted by Vite
const fairworkTestEndpoints = (app: Express) => {
  // Add penalty rules endpoint
  app.get('/___direct_test_fairwork_penalties/:awardId', async (req, res) => {
    try {
      const { awardId } = req.params;
      const { penaltyRules } = (await import('../shared/schema'));
      const { db } = (await import('./db'));
      const { eq } = (await import('drizzle-orm'));
      
      console.log(`Testing direct penalties API for award ID ${awardId}`);
      
      // Get penalty rules for this award
      const penalties = await db
        .select()
        .from(penaltyRules)
        .where(eq(penaltyRules.awardId, parseInt(awardId)));
      
      console.log(`Found ${penalties.length} penalty rules for award ID ${awardId}`);
      
      return res.json({
        success: true,
        message: 'Direct penalty rules test API',
        data: {
          penalties,
        },
      });
    } catch (error) {
      console.error('Error in direct penalties test API', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to test direct penalties API',
      });
    }
  });

  app.get('/___direct_test_fairwork_awards', async (req, res) => {
    try {
      const { awards } = (await import('../shared/schema'));
      const { db } = (await import('./db'));
      
      console.log('Testing direct awards API');
      const allAwards = await db.select().from(awards).limit(10);
      
      return res.json({
        success: true,
        message: 'Direct awards test API',
        data: {
          awards: allAwards,
        },
      });
    } catch (error) {
      console.error('Error in direct awards test API', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to test direct awards API',
      });
    }
  });
  
  app.get('/___direct_test_fairwork_classifications/:awardId', async (req, res) => {
    try {
      const { awardId } = req.params;
      const { awardClassifications } = (await import('../shared/schema'));
      const { db } = (await import('./db'));
      const { eq } = (await import('drizzle-orm'));
      
      console.log(`Testing direct classifications API for award ID ${awardId}`);
      
      // Get classifications for this award
      const classifications = await db
        .select()
        .from(awardClassifications)
        .where(eq(awardClassifications.awardId, parseInt(awardId)));
      
      console.log(`Found ${classifications.length} classifications for award ID ${awardId}`);
      
      return res.json({
        success: true,
        message: 'Direct classifications test API',
        data: {
          classifications,
        },
      });
    } catch (error) {
      console.error('Error in direct classifications test API', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to test direct classifications API',
      });
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.0.1'
    });
  });
  
  // Error logging endpoint for client-side errors
  app.post('/api/error-log', (req, res) => {
    const { error, errorInfo, url, timestamp } = req.body;
    
    // Log error to the console for now
    // In production, these should be sent to a proper logging service
    console.error('[CLIENT ERROR]', {
      timestamp,
      url,
      error,
      errorInfo
    });
    
    // Could add integration with error tracking services here
    // like Sentry, LogRocket, etc.
    
    // Acknowledge receipt
    res.status(200).json({ received: true });
  });
  
  // Register special test endpoints for Fair Work API
  fairworkTestEndpoints(app);
  
  // Special direct test endpoint for contact tags
  app.get('/api/___direct_test_contact_tags', (req, res) => {
    try {
      console.log('Testing direct contact tags endpoint');
      
      return res.json({
        success: true,
        message: 'Direct contact tags test API',
        data: [
          { 
            id: 1, 
            name: "Test Tag", 
            description: "This is a test tag", 
            color: "#3B82F6",
            isSystem: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      });
    } catch (error) {
      console.error('Error in direct contact tags test API', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to test direct contact tags API',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // ====== DIRECT API ENDPOINTS TO BYPASS VITE MIDDLEWARE ======
  // IMPORTANT: These direct endpoints bypass the router objects to avoid Vite's catch-all route interference
  // Vite's middleware uses app.use("*",...) which intercepts all requests, including API calls
  // By defining these endpoints directly in routes.ts (before Vite middleware), we ensure they work properly
  
  // Authentication middleware specifically for direct endpoints
  const directEndpointAuth = async (req: any, res: any, next: any) => {
    try {
      // For development purposes
      if (process.env.NODE_ENV === 'development') {
        // Set a default development user
        req.user = {
          id: 1,
          username: 'dev-user',
          role: 'admin'
        };
        return next();
      }
      
      // Get the token from the Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
      }
      
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
      }
      
      // Verify the token
      const secretKey = process.env.JWT_SECRET || 'default-dev-secret';
      const decoded = jwt.verify(token, secretKey);
      
      // Add the user info to the request
      req.user = decoded;
      
      next();
    } catch (error) {
      console.error('Authentication error', error);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  };
  
  // Direct endpoint permission middleware
  const directEndpointPermission = (permission: string) => {
    return (req: any, res: any, next: any) => {
      // For development, allow all permissions
      if (process.env.NODE_ENV === 'development' && ['admin', 'developer'].includes(req.user.role)) {
        return next();
      }
      
      // Check permission in production
      if (!req.user.permissions || !req.user.permissions.includes(permission)) {
        return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      }
      
      next();
    };
  };
  
  // Helper function to format database rows into clean objects
  const formatDbRows = (rows: any) => {
    // If rows has rowCount and rows properties, it's a direct DB result
    if (rows && rows.rowCount !== undefined && Array.isArray(rows.rows)) {
      return rows.rows.map((row: any) => {
        // Convert to standard format object
        const cleanObj: any = {};
        for (const key in row) {
          if (Object.prototype.hasOwnProperty.call(row, key)) {
            cleanObj[key] = row[key];
          }
        }
        return cleanObj;
      });
    }
    
    // If it's already an array, assume it's the formatted result
    if (Array.isArray(rows)) {
      return rows;
    }
    
    // Return empty array for any other case
    return [];
  };
  
  // Get all contact tags with formatting
  app.get('/api/contacts/tags/all', directEndpointAuth, async (req, res) => {
    try {
      console.log("GET /api/contacts/tags/all direct endpoint called");
      const tags = await storage.getAllContactTags();
      const formattedTags = formatDbRows(tags);
      console.log(`Returning ${formattedTags.length} tags from direct /api/contacts/tags/all endpoint`);
      res.json(formattedTags);
    } catch (error: any) {
      console.error("Error in direct GET /api/contacts/tags/all:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a new contact tag - using direct data
  app.post('/api/contacts/tags', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("POST /api/contacts/tags direct endpoint called");
      
      // Skip the schema validation for now - directly create with the data
      const newTag = await storage.createContactTag({
        name: req.body.name,
        description: req.body.description,
        color: req.body.color,
        organizationId: req.body.organizationId,
        isSystem: req.body.isSystem || false
      });
      
      res.status(201).json(newTag);
    } catch (error: any) {
      console.error("Error in direct POST /api/contacts/tags:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update a contact tag - using direct data
  app.put('/api/contacts/tags/:id', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("PUT /api/contacts/tags/:id direct endpoint called");
      const id = parseInt(req.params.id);
      
      // Skip the schema validation for now - directly update with the data
      const updatedTag = await storage.updateContactTag(id, {
        name: req.body.name,
        description: req.body.description,
        color: req.body.color,
        organizationId: req.body.organizationId,
        isSystem: req.body.isSystem
      });
      
      if (!updatedTag) {
        return res.status(404).json({ message: 'Tag not found' });
      }
      
      res.json(updatedTag);
    } catch (error: any) {
      console.error("Error in direct PUT /api/contacts/tags/:id:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Delete a contact tag
  app.delete('/api/contacts/tags/:id', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("DELETE /api/contacts/tags/:id direct endpoint called");
      const id = parseInt(req.params.id);
      const success = await storage.deleteContactTag(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Tag not found' });
      }
      
      res.json({ message: 'Tag deleted successfully' });
    } catch (error: any) {
      console.error("Error in direct DELETE /api/contacts/tags/:id:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ===== CONTACT TAG ASSIGNMENTS DIRECT ENDPOINTS =====
  
  // Get tags for a specific contact
  app.get('/api/contacts/:id/tags', directEndpointAuth, async (req, res) => {
    try {
      console.log("GET /api/contacts/:id/tags direct endpoint called");
      const contactId = parseInt(req.params.id);
      const tags = await storage.getContactTags(contactId);
      const formattedTags = formatDbRows(tags);
      console.log(`Returning ${formattedTags.length} tags for contact ID ${contactId}`);
      res.json(formattedTags);
    } catch (error: any) {
      console.error(`Error in direct GET /api/contacts/:id/tags:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Assign tag to contact
  app.post('/api/contacts/:id/tags', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("POST /api/contacts/:id/tags direct endpoint called");
      const contactId = parseInt(req.params.id);
      
      // Skip schema validation, use direct data
      const assignment = await storage.assignTagToContact({
        contactId,
        tagId: req.body.tagId
      });
      
      res.status(201).json(assignment);
    } catch (error: any) {
      console.error(`Error in direct POST /api/contacts/:id/tags:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Remove tag from contact
  app.delete('/api/contacts/:contactId/tags/:tagId', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("DELETE /api/contacts/:contactId/tags/:tagId direct endpoint called");
      const contactId = parseInt(req.params.contactId);
      const tagId = parseInt(req.params.tagId);
      
      const success = await storage.removeTagFromContact(contactId, tagId);
      
      if (!success) {
        return res.status(404).json({ message: 'Tag assignment not found' });
      }
      
      res.json({ message: 'Tag removed from contact successfully' });
    } catch (error: any) {
      console.error(`Error in direct DELETE /api/contacts/:contactId/tags/:tagId:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // ===== CONTACT GROUPS DIRECT ENDPOINTS =====
  
  // Get all contact groups
  app.get('/api/contacts/groups', directEndpointAuth, async (req, res) => {
    try {
      console.log("GET /api/contacts/groups direct endpoint called");
      const groups = await storage.getAllContactGroups();
      const formattedGroups = formatDbRows(groups);
      console.log(`Returning ${formattedGroups.length} contact groups`);
      res.json(formattedGroups);
    } catch (error: any) {
      console.error(`Error in direct GET /api/contacts/groups:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a new contact group
  app.post('/api/contacts/groups', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("POST /api/contacts/groups direct endpoint called");
      
      // Note: Color may need to be stored in a custom field or metadata
      const newGroup = await storage.createContactGroup({
        name: req.body.name,
        description: req.body.description,
        organizationId: req.body.organizationId
      });
      
      res.status(201).json(newGroup);
    } catch (error: any) {
      console.error(`Error in direct POST /api/contacts/groups:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update a contact group
  app.put('/api/contacts/groups/:id', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("PUT /api/contacts/groups/:id direct endpoint called");
      const id = parseInt(req.params.id);
      
      const updatedGroup = await storage.updateContactGroup(id, {
        name: req.body.name,
        description: req.body.description
        // Note: Color removed as it's not in the schema
      });
      
      if (!updatedGroup) {
        return res.status(404).json({ message: 'Group not found' });
      }
      
      res.json(updatedGroup);
    } catch (error: any) {
      console.error(`Error in direct PUT /api/contacts/groups/:id:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Delete a contact group
  app.delete('/api/contacts/groups/:id', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("DELETE /api/contacts/groups/:id direct endpoint called");
      const id = parseInt(req.params.id);
      
      const success = await storage.deleteContactGroup(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Group not found' });
      }
      
      res.json({ message: 'Group deleted successfully' });
    } catch (error: any) {
      console.error(`Error in direct DELETE /api/contacts/groups/:id:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get group members
  app.get('/api/contacts/groups/:id/members', directEndpointAuth, async (req, res) => {
    try {
      console.log("GET /api/contacts/groups/:id/members direct endpoint called");
      const groupId = parseInt(req.params.id);
      
      // Get contacts that belong to this group
      const members = await storage.getGroupMembers(groupId);
      const formattedMembers = formatDbRows(members);
      
      console.log(`Returning ${formattedMembers.length} members for group ID ${groupId}`);
      res.json(formattedMembers);
    } catch (error: any) {
      console.error(`Error in direct GET /api/contacts/groups/:id/members:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Add contact to group
  app.post('/api/contacts/groups/:id/members', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("POST /api/contacts/groups/:id/members direct endpoint called");
      const groupId = parseInt(req.params.id);
      
      const membership = await storage.addContactToGroup({
        groupId,
        contactId: req.body.contactId
      });
      
      res.status(201).json(membership);
    } catch (error: any) {
      console.error(`Error in direct POST /api/contacts/groups/:id/members:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Remove contact from group
  app.delete('/api/contacts/groups/:groupId/members/:contactId', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("DELETE /api/contacts/groups/:groupId/members/:contactId direct endpoint called");
      const groupId = parseInt(req.params.groupId);
      const contactId = parseInt(req.params.contactId);
      
      const success = await storage.removeContactFromGroup(groupId, contactId);
      
      if (!success) {
        return res.status(404).json({ message: 'Group membership not found' });
      }
      
      res.json({ message: 'Contact removed from group successfully' });
    } catch (error: any) {
      console.error(`Error in direct DELETE /api/contacts/groups/:groupId/members/:contactId:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // ===== CONTACTS DIRECT ENDPOINTS =====
  
  // Get all contacts (with pagination)
  app.get('/api/contacts', directEndpointAuth, async (req, res) => {
    try {
      console.log("GET /api/contacts direct endpoint called");
      
      // Parse pagination parameters with defaults
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      // Get all contacts - add pagination in storage method if needed
      const contacts = await storage.getAllContacts();
      const formattedContacts = formatDbRows(contacts);
      
      // Apply manual pagination if needed
      const startIndex = offset;
      const endIndex = offset + limit;
      const paginatedContacts = formattedContacts.slice(startIndex, endIndex);
      const total = formattedContacts.length;
      
      console.log(`Returning ${paginatedContacts.length} contacts (page ${page}, limit ${limit}, total ${total})`);
      
      res.json({
        contacts: paginatedContacts,
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      console.error(`Error in direct GET /api/contacts:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get single contact by ID
  app.get('/api/contacts/:id', directEndpointAuth, async (req, res) => {
    try {
      console.log("GET /api/contacts/:id direct endpoint called");
      const id = parseInt(req.params.id);
      
      const contact = await storage.getContact(id);
      
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      res.json(contact);
    } catch (error: any) {
      console.error(`Error in direct GET /api/contacts/:id:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a new contact
  app.post('/api/contacts', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("POST /api/contacts direct endpoint called");
      
      // Create contact with fields that match the schema
      const newContact = await storage.createContact({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        contactType: req.body.contactType || 'general',
        primaryRole: req.body.primaryRole || 'primary',
        phone: req.body.phone,
        mobile: req.body.mobile,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        postalCode: req.body.postalCode,
        country: req.body.country || 'Australia',
        notes: req.body.notes,
        organizationId: req.body.organizationId,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
      });
      
      res.status(201).json(newContact);
    } catch (error: any) {
      console.error(`Error in direct POST /api/contacts:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update a contact
  app.put('/api/contacts/:id', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("PUT /api/contacts/:id direct endpoint called");
      const id = parseInt(req.params.id);
      
      // Update contact with fields that match the schema
      const updatedContact = await storage.updateContact(id, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        mobile: req.body.mobile,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        postalCode: req.body.postalCode,
        country: req.body.country,
        contactType: req.body.contactType,
        primaryRole: req.body.primaryRole,
        notes: req.body.notes,
        organizationId: req.body.organizationId,
        isActive: req.body.isActive
      });
      
      if (!updatedContact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      res.json(updatedContact);
    } catch (error: any) {
      console.error(`Error in direct PUT /api/contacts/:id:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Deactivate a contact (soft delete)
  app.put('/api/contacts/:id/deactivate', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("PUT /api/contacts/:id/deactivate direct endpoint called");
      const id = parseInt(req.params.id);
      
      const deactivated = await storage.deactivateContact(id);
      
      if (!deactivated) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      res.json({ message: 'Contact deactivated successfully' });
    } catch (error: any) {
      console.error(`Error in direct PUT /api/contacts/:id/deactivate:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Hard delete a contact (use with caution)
  app.delete('/api/contacts/:id', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("DELETE /api/contacts/:id direct endpoint called");
      const id = parseInt(req.params.id);
      
      const success = await storage.deleteContact(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      res.json({ message: 'Contact permanently deleted' });
    } catch (error: any) {
      console.error(`Error in direct DELETE /api/contacts/:id:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get all groups that a contact belongs to
  app.get('/api/contacts/:id/groups', directEndpointAuth, async (req, res) => {
    try {
      console.log("GET /api/contacts/:id/groups direct endpoint called");
      const id = parseInt(req.params.id);
      
      const groups = await storage.getContactGroups(id);
      const formattedGroups = formatDbRows(groups);
      
      console.log(`Returning ${formattedGroups.length} groups for contact ID ${id}`);
      res.json(formattedGroups);
    } catch (error: any) {
      console.error(`Error in direct GET /api/contacts/:id/groups:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get interactions for a contact
  app.get('/api/contacts/:id/interactions', directEndpointAuth, async (req, res) => {
    try {
      console.log("GET /api/contacts/:id/interactions direct endpoint called");
      const id = parseInt(req.params.id);
      
      const interactions = await storage.getContactInteractions(id);
      const formattedInteractions = formatDbRows(interactions);
      
      console.log(`Returning ${formattedInteractions.length} interactions for contact ID ${id}`);
      res.json(formattedInteractions);
    } catch (error: any) {
      console.error(`Error in direct GET /api/contacts/:id/interactions:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a new interaction for a contact
  app.post('/api/contacts/:id/interactions', directEndpointAuth, directEndpointPermission('contacts.manage'), async (req, res) => {
    try {
      console.log("POST /api/contacts/:id/interactions direct endpoint called");
      const contactId = parseInt(req.params.id);
      
      // Create interaction using fields that match the schema
      const interaction = await storage.createContactInteraction({
        contactId,
        interactionType: req.body.interactionType || 'note',
        subject: req.body.subject || 'New interaction',
        content: req.body.content,
        interactionDate: req.body.interactionDate ? new Date(req.body.interactionDate) : new Date(),
        createdBy: req.user?.id,
        metadata: req.body.metadata || {}
      });
      
      res.status(201).json(interaction);
    } catch (error: any) {
      console.error(`Error in direct POST /api/contacts/:id/interactions:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  // API Routes - prefix all routes with /api

  // Add debug logging for all API requests
  app.use('/api', (req, res, next) => {
    console.log(`[API] ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });

  // Register authentication routes first (highest priority)
  app.use('/api/auth', (req, res, next) => {
    console.log(`[AUTH] ${req.method} ${req.path} - Headers:`, req.headers['content-type']);
    // Ensure JSON responses for auth endpoints
    res.setHeader('Content-Type', 'application/json');
    next();
  }, authRouter); // Authentication routes (login, register, verify)
  
  // Register specialized route handlers
  app.use('/api/gto-compliance', gtoComplianceRouter);
  app.use('/api/vet', vetRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api', fairWorkRouter); // Routes like /api/awards, /api/enterprise-agreements
  app.use('/api/payroll', payrollRouter); // Payroll routes
  app.use('/api/enrichment', enrichmentRouter); // Enrichment routes
  app.use('/api/progress-reviews', progressReviewsRouter); // Progress Reviews routes
  app.use('/api/fairwork', fairworkApiRouter); // Main Fair Work API routes
  app.use('/api/fairwork-enhanced', fairworkEnhancedRouter); // Enhanced Fair Work API features with detailed award interpretation
  app.use('/api/financial', financialRouter); // Financial management routes
  app.use('/api/compliance', complianceRouter); // Compliance management routes
  setupWhsRoutes(app); // Work Health & Safety routes
  app.use('/api/labour-hire', labourHireRouter); // Labour Hire Workers routes
  app.use('/api/contacts', contactsRouter); // Unified Contacts System routes
  app.use('/api/clients', clientsRouter); // Client Management System routes
  app.use('/api/tags', tagsRouter); // Contact Tags routes
  
  // Register host employer routes
  registerHostRoutes(app);
  
  // Register Training.gov.au routes
  registerTGARoutes(app);

  // User Management Routes
  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ 
        message: "Error fetching users", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // Create user
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Create activity log
      await storage.createActivityLog({
        userId: 1, // Assuming admin user
        action: "created",
        relatedTo: "user",
        relatedId: user.id,
        details: { 
          message: `New user ${user.username} (${user.firstName} ${user.lastName}) created with role ${user.role}`,
          userId: user.id
        }
      });
      
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        console.error("Error creating user:", error);
        res.status(500).json({ 
          message: "Error creating user",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  // Update user
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;
      const user = await storage.updateUser(id, userData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create activity log
      await storage.createActivityLog({
        userId: 1, // Assuming admin user
        action: "updated",
        relatedTo: "user",
        relatedId: user.id,
        details: { 
          message: `User ${user.username} (${user.firstName} ${user.lastName}) updated`,
          userId: user.id
        }
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ 
        message: "Error updating user",
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Delete user
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const success = await storage.deleteUser(id);
      
      if (success) {
        // Create activity log
        await storage.createActivityLog({
          userId: 1, // Assuming admin user
          action: "deleted",
          relatedTo: "user",
          relatedId: id,
          details: { 
            message: `User ${user.username} (${user.firstName} ${user.lastName}) deleted`,
            userId: id
          }
        });
        
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Error deleting user" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // Get users by role
  app.get("/api/users/role/:role", async (req, res) => {
    try {
      const role = req.params.role;
      const users = await storage.getUsersByRole(role);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users by role" });
    }
  });

  // Get users by organization
  app.get("/api/users/organization/:organizationId", async (req, res) => {
    try {
      const organizationId = parseInt(req.params.organizationId);
      const users = await storage.getUsersByOrganization(organizationId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users by organization" });
    }
  });

  // Role Management Routes
  // Get all roles
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching roles" });
    }
  });

  // Get role by ID
  app.get("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const role = await storage.getRole(id);
      
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Error fetching role" });
    }
  });

  // Create role
  app.post("/api/roles", async (req, res) => {
    try {
      const roleData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(roleData);
      res.status(201).json(role);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid role data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating role" });
      }
    }
  });

  // Update role
  app.patch("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const roleData = req.body;
      const role = await storage.updateRole(id, roleData);
      
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Error updating role" });
    }
  });

  // Delete role
  app.delete("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const role = await storage.getRole(id);
      
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      if (role.isSystem) {
        return res.status(403).json({ message: "System roles cannot be deleted" });
      }
      
      const success = await storage.deleteRole(id);
      
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Error deleting role" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting role" });
    }
  });

  // Permission Management Routes
  // Get all permissions
  app.get("/api/permissions", async (req, res) => {
    try {
      const permissions = await storage.getAllPermissions();
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching permissions" });
    }
  });

  // Get permissions for a role
  app.get("/api/roles/:roleId/permissions", async (req, res) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const role = await storage.getRole(roleId);
      
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      const permissions = await storage.getRolePermissions(roleId);
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching role permissions" });
    }
  });

  // Assign permission to role
  app.post("/api/roles/:roleId/permissions", async (req, res) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const { permissionId } = req.body;
      
      if (!permissionId) {
        return res.status(400).json({ message: "Permission ID is required" });
      }
      
      const role = await storage.getRole(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      const permission = await storage.getPermission(permissionId);
      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }
      
      const rolePermission = await storage.assignPermissionToRole({
        roleId,
        permissionId
      });
      
      res.status(201).json(rolePermission);
    } catch (error) {
      res.status(500).json({ message: "Error assigning permission to role" });
    }
  });

  // Remove permission from role
  app.delete("/api/roles/:roleId/permissions/:permissionId", async (req, res) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const permissionId = parseInt(req.params.permissionId);
      
      const role = await storage.getRole(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      const permission = await storage.getPermission(permissionId);
      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }
      
      const success = await storage.removePermissionFromRole(roleId, permissionId);
      
      if (success) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "Permission not assigned to this role" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error removing permission from role" });
    }
  });

  // Subscription Plan Routes
  // Get all subscription plans
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subscription plans" });
    }
  });

  // Get subscription plan by ID
  app.get("/api/subscription-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.getSubscriptionPlan(id);
      
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subscription plan" });
    }
  });

  // Create subscription plan
  app.post("/api/subscription-plans", async (req, res) => {
    try {
      const planData = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid subscription plan data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating subscription plan" });
      }
    }
  });

  // Update subscription plan
  app.patch("/api/subscription-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const planData = req.body;
      const plan = await storage.updateSubscriptionPlan(id, planData);
      
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Error updating subscription plan" });
    }
  });

  // Delete subscription plan
  app.delete("/api/subscription-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.getSubscriptionPlan(id);
      
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      const success = await storage.deleteSubscriptionPlan(id);
      
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Error deleting subscription plan" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting subscription plan" });
    }
  });

  // Helper function to check if a user's account should be active based on their role and subscription
  async function checkUserActiveStatus(userId: number): Promise<boolean> {
    // Get the user
    const user = await storage.getUser(userId);
    if (!user) return false;
    
    // Get the user's role
    const role = user.roleId ? await storage.getRole(user.roleId) : null;
    const roleName = role?.name?.toLowerCase() || '';
    
    // Developers always remain active regardless of subscription
    if (roleName === 'developer') return true;
    
    // Check if the subscription is active based on end date
    const hasActiveSubscription = user.subscriptionEndsAt 
      ? new Date(user.subscriptionEndsAt) > new Date() 
      : false;
    
    return hasActiveSubscription;
  }
  
  // Update user subscription
  app.post("/api/users/:id/subscription", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { subscriptionPlanId, stripeCustomerId, stripeSubscriptionId, startDate, endDate } = req.body;
      
      // Get the user first
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get the user's role
      const role = user.roleId ? await storage.getRole(user.roleId) : null;
      const roleName = role?.name?.toLowerCase() || '';
      
      // For developers, never expire the subscription (always active)
      const isActive = roleName === 'developer' ? true : !!endDate && new Date(endDate) > new Date();
      
      // Update the user with subscription info
      const updatedUser = await storage.updateUser(userId, {
        subscriptionPlanId: subscriptionPlanId || null,
        stripeCustomerId: stripeCustomerId || null,
        stripeSubscriptionId: stripeSubscriptionId || null,
        subscriptionStatus: isActive ? 'active' : 'expired',
        isActive: isActive,
        // subscriptionStartsAt is not in the schema, so we're not updating it
        ...(endDate && { subscriptionEndsAt: new Date(endDate) }),
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user subscription" });
      }
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        isActive: updatedUser.isActive,
        subscriptionStatus: updatedUser.subscriptionStatus,
        subscriptionEndsAt: updatedUser.subscriptionEndsAt,
        role: roleName
      });
    } catch (error) {
      console.error("Error updating user subscription:", error);
      res.status(500).json({ 
        message: "Error updating user subscription",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Refresh subscription statuses for all users (could be triggered by a cron job)
  app.post("/api/subscriptions/refresh", async (req, res) => {
    try {
      // Get all users
      const users = await storage.getAllUsers();
      const results = [];
      
      // Check each user's subscription status
      for (const user of users) {
        // For developers, always keep active
        const role = user.roleId ? await storage.getRole(user.roleId) : null;
        const roleName = role?.name?.toLowerCase() || '';
        
        // Determine if the user should be active
        const shouldBeActive = roleName === 'developer' ? true : 
          user.subscriptionEndsAt && new Date(user.subscriptionEndsAt) > new Date();
        
        // Only update if the active status needs to change
        if (user.isActive !== shouldBeActive) {
          const updated = await storage.updateUser(user.id, {
            isActive: shouldBeActive,
            subscriptionStatus: shouldBeActive ? 'active' : 'expired'
          });
          
          if (updated) {
            results.push({
              id: user.id,
              username: user.username,
              isActive: shouldBeActive,
              changed: true
            });
          }
        }
      }
      
      res.json({
        message: `Updated subscription statuses for ${results.length} users`,
        updatedUsers: results
      });
    } catch (error) {
      console.error("Error refreshing subscription statuses:", error);
      res.status(500).json({ 
        message: "Error refreshing subscription statuses", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
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
      const activities = await storage.getActivityLogs({ limit });
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
      
      if (!apprentice) {
        return res.status(404).json({ message: "Apprentice not found or could not be updated" });
      }
      
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
  
  // Access verification endpoint for portal login
  app.post('/api/verify-access', async (req, res) => {
    try {
      const { username, password, organization, role } = req.body;
      
      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing username or password' 
        });
      }

      // Special case for developer role which has platform-level access
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Handle developer role (platform level access)
      if (user.role === 'developer') {
        // For simplicity in this demo, we're not checking the password hash
        // In a real application, you would verify the password hash here
        return res.status(200).json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            // Developer has platform-level access, so no specific organization
            platformAccess: true
          }
        });
      }
      
      // For non-developer roles, check organization and role
      if (!organization || !role) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing organization or role' 
        });
      }

      // Find the organization
      const [org] = await db.select()
        .from(gtoOrganizations)
        .where(eq(gtoOrganizations.name, organization));

      if (!org) {
        return res.status(404).json({ 
          success: false, 
          message: 'Organization not found' 
        });
      }

      // Check if user has the requested role
      if (user.role !== role) {
        return res.status(401).json({ 
          success: false, 
          message: 'Insufficient permissions for this role' 
        });
      }

      // For simplicity in this demo, we're not checking the password hash
      // In a real application, you would verify the password hash here
      
      // Return user data with organization info
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: {
            id: org.id,
            name: org.name
          }
        }
      });
    } catch (error) {
      console.error('Error verifying access:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Register GTO Compliance routes
  app.use("/api/gto-compliance", gtoComplianceRouter);
  
  // Register VET Training routes for Units of Competency and Qualifications
  app.use("/api/vet", vetRouter);
  
  // Register Fair Work routes (consolidated)
  app.use("/api/fair-work", fairWorkRouter);
  app.use("/api/fairwork-enhanced", fairworkEnhancedRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
