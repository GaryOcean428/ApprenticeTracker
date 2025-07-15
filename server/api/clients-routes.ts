import express, { Request, Response } from 'express';
import { storage } from '../storage';
import {
  insertClientSchema,
  insertClientTypeSchema,
  insertClientContactSchema,
  insertClientServiceSchema,
  insertClientInteractionSchema,
} from '@shared/schema';
import { isAuthenticated } from '../middleware/auth';
import { hasPermission } from '../middleware/permissions';
import { z } from 'zod';

const router = express.Router();

// Ensure authorized for clients management
const clientsAuthorized = [isAuthenticated, hasPermission('manage:clients')];
const clientsViewAuthorized = [isAuthenticated, hasPermission('view:clients')];

// ===================== CLIENTS ROUTES =====================

// Get all clients
router.get('/', clientsViewAuthorized, async (req: Request, res: Response) => {
  try {
    const clientType = req.query.clientType as string | undefined;
    const status = req.query.status as string | undefined;
    const organizationId = req.query.organizationId
      ? parseInt(req.query.organizationId as string)
      : undefined;

    const clients = await storage.getAllClients({
      clientType,
      status,
      organizationId,
    });

    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get client by ID
router.get('/:id', clientsViewAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const client = await storage.getClient(id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new client
router.post('/', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const parsedData = insertClientSchema.parse(req.body);
    const newClient = await storage.createClient(parsedData);
    res.status(201).json(newClient);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update a client
router.put('/:id', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const parsedData = insertClientSchema.partial().parse(req.body);

    const updatedClient = await storage.updateClient(id, parsedData);

    if (!updatedClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(updatedClient);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Deactivate a client
router.put('/:id/deactivate', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deactivateClient(id);

    if (!success) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ message: 'Client deactivated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a client
router.delete('/:id', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteClient(id);

    if (!success) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ===================== CLIENT TYPES ROUTES =====================

// Get all client types
router.get('/types/all', clientsViewAuthorized, async (req: Request, res: Response) => {
  try {
    const types = await storage.getAllClientTypes();
    res.json(types);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new client type
router.post('/types', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const parsedData = insertClientTypeSchema.parse(req.body);
    const newType = await storage.createClientType(parsedData);
    res.status(201).json(newType);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update a client type
router.put('/types/:id', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const parsedData = insertClientTypeSchema.partial().parse(req.body);

    const updatedType = await storage.updateClientType(id, parsedData);

    if (!updatedType) {
      return res.status(404).json({ message: 'Client type not found' });
    }

    res.json(updatedType);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete a client type
router.delete('/types/:id', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteClientType(id);

    if (!success) {
      return res.status(404).json({ message: 'Client type not found' });
    }

    res.json({ message: 'Client type deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ===================== CLIENT CONTACTS ROUTES =====================

// Get contacts for a client
router.get('/:id/contacts', clientsViewAuthorized, async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);
    const contacts = await storage.getClientContacts(clientId);
    res.json(contacts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add contact to client
router.post('/:id/contacts', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);
    const parsedData = insertClientContactSchema.parse({
      ...req.body,
      clientId,
    });

    const clientContact = await storage.addContactToClient(parsedData);
    res.status(201).json(clientContact);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update client contact
router.put('/contacts/:id', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const parsedData = insertClientContactSchema.partial().parse(req.body);

    const updatedClientContact = await storage.updateClientContact(id, parsedData);

    if (!updatedClientContact) {
      return res.status(404).json({ message: 'Client contact not found' });
    }

    res.json(updatedClientContact);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Remove contact from client
router.delete(
  '/:clientId/contacts/:contactId',
  clientsAuthorized,
  async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const contactId = parseInt(req.params.contactId);

      const success = await storage.removeContactFromClient(clientId, contactId);

      if (!success) {
        return res.status(404).json({ message: 'Client contact not found' });
      }

      res.json({ message: 'Contact removed from client successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Set primary contact for client
router.put(
  '/:clientId/contacts/:contactId/primary',
  clientsAuthorized,
  async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const contactId = parseInt(req.params.contactId);

      const success = await storage.setPrimaryContact(clientId, contactId);

      if (!success) {
        return res.status(404).json({ message: 'Client contact not found' });
      }

      res.json({ message: 'Primary contact set successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ===================== CLIENT SERVICES ROUTES =====================

// Get services for a client
router.get('/:id/services', clientsViewAuthorized, async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);
    const services = await storage.getClientServices(clientId);
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add service to client
router.post('/:id/services', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);
    const parsedData = insertClientServiceSchema.parse({
      ...req.body,
      clientId,
    });

    const service = await storage.addServiceToClient(parsedData);
    res.status(201).json(service);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update client service
router.put('/services/:id', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const parsedData = insertClientServiceSchema.partial().parse(req.body);

    const updatedService = await storage.updateClientService(id, parsedData);

    if (!updatedService) {
      return res.status(404).json({ message: 'Client service not found' });
    }

    res.json(updatedService);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Remove service from client
router.delete('/services/:id', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const success = await storage.removeServiceFromClient(id);

    if (!success) {
      return res.status(404).json({ message: 'Client service not found' });
    }

    res.json({ message: 'Service removed from client successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ===================== CLIENT INTERACTIONS ROUTES =====================

// Get interactions for a client
router.get('/:id/interactions', clientsViewAuthorized, async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);
    const interactions = await storage.getClientInteractions(clientId);
    res.json(interactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new interaction
router.post('/:id/interactions', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);
    const parsedData = insertClientInteractionSchema.parse({
      ...req.body,
      clientId,
      userId: req.user.id, // Add the current user as the one who created the interaction
    });

    const interaction = await storage.createClientInteraction(parsedData);
    res.status(201).json(interaction);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update an interaction
router.put('/interactions/:id', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const parsedData = insertClientInteractionSchema.partial().parse(req.body);

    const updatedInteraction = await storage.updateClientInteraction(id, parsedData);

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
router.delete('/interactions/:id', clientsAuthorized, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteClientInteraction(id);

    if (!success) {
      return res.status(404).json({ message: 'Interaction not found' });
    }

    res.json({ message: 'Interaction deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
