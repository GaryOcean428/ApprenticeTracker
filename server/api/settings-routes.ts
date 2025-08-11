import express, { Request, Response } from 'express';
import { db } from '../db';
import { storage } from '../storage';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { join } from 'path';
import fs from 'fs';
import multer from 'multer';

// Set up multer for file uploads
const uploadDir = process.env.UPLOAD_DIR || 'uploads/';
// Ensure upload directory exists
if (!fs.existsSync(uploadDir.replace(/\/$/, ''))) {
  fs.mkdirSync(uploadDir.replace(/\/$/, ''), { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const settingsRouter = express.Router();

// System Configuration Routes
// Get all configuration settings
settingsRouter.get('/config', async (req: Request, res: Response) => {
  try {
    // Mock data temporarily while schema is being implemented
    const configs = [
      {
        id: 1,
        key: 'siteName',
        value: 'Australian Apprentice Management',
        category: 'general',
        description: 'The name of the site displayed throughout the application',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        key: 'supportEmail',
        value: 'support@example.com',
        category: 'general',
        description: 'Email for user support inquiries',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        key: 'timezone',
        value: 'Australia/Sydney',
        category: 'general',
        description: 'Default timezone for dates and times',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        key: 'maintenanceMode',
        value: 'false',
        category: 'general',
        description: 'Whether the site is in maintenance mode',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Group configs by category
    const groupedConfigs = configs.reduce(
      (acc, config) => {
        if (!acc[config.category]) {
          acc[config.category] = [];
        }
        acc[config.category].push(config);
        return acc;
      },
      {} as Record<string, typeof configs>
    );

    res.json(groupedConfigs);
  } catch (error) {
    console.error('Error fetching system configurations:', error);
    res.status(500).json({
      message: 'Error fetching system configurations',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get configuration by key
settingsRouter.get('/config/:key', async (req: Request, res: Response) => {
  try {
    const key = req.params.key;

    // Mock data temporarily while schema is being implemented
    const configs = [
      {
        id: 1,
        key: 'siteName',
        value: 'Australian Apprentice Management',
        category: 'general',
        description: 'The name of the site displayed throughout the application',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        key: 'supportEmail',
        value: 'support@example.com',
        category: 'general',
        description: 'Email for user support inquiries',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const config = configs.find(c => c.key === key);

    if (!config) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching configuration' });
  }
});

// Create or update configuration
settingsRouter.post('/config', async (req: Request, res: Response) => {
  try {
    // Mock response while schema is being implemented
    const configData = req.body;

    // Return mock updated config
    res.json({
      id: 1,
      key: configData.key,
      value: configData.value,
      category: configData.category || 'general',
      description: configData.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid configuration data', errors: error.errors });
    } else {
      console.error('Error creating/updating configuration:', error);
      res.status(500).json({
        message: 'Error creating/updating configuration',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

// Delete configuration
settingsRouter.delete('/config/:key', async (req: Request, res: Response) => {
  try {
    const key = req.params.key;

    // Mock successful deletion
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting configuration' });
  }
});

// Integrations Routes
// Get all integrations
settingsRouter.get('/integrations', async (req: Request, res: Response) => {
  try {
    // Mock data temporarily while schema is being implemented
    const allIntegrations = [
      {
        id: 1,
        name: 'Fair Work Australia',
        provider: 'Fair Work',
        type: 'api',
        status: 'inactive',
        lastSynced: null,
        apiKey: null,
        apiUrl: 'https://api.fairwork.gov.au/v1',
        config: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Email Service',
        provider: 'SMTP',
        type: 'notification',
        status: 'active',
        lastSynced: new Date().toISOString(),
        apiKey: null,
        apiUrl: null,
        config: {
          smtpHost: 'smtp.example.com',
          smtpPort: 587,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: 'Document Storage',
        provider: 'Local Storage',
        type: 'storage',
        status: 'active',
        lastSynced: null,
        apiKey: null,
        apiUrl: null,
        config: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    res.json(allIntegrations);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({
      message: 'Error fetching integrations',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get integration by ID
settingsRouter.get('/integrations/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Mock data temporarily while schema is being implemented
    const integrations = [
      {
        id: 1,
        name: 'Fair Work Australia',
        provider: 'Fair Work',
        type: 'api',
        status: 'inactive',
        lastSynced: null,
        apiKey: null,
        apiUrl: 'https://api.fairwork.gov.au/v1',
        config: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Email Service',
        provider: 'SMTP',
        type: 'notification',
        status: 'active',
        lastSynced: new Date().toISOString(),
        apiKey: null,
        apiUrl: null,
        config: {
          smtpHost: 'smtp.example.com',
          smtpPort: 587,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const integration = integrations.find(i => i.id === id);

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    res.json(integration);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching integration' });
  }
});

// Create integration
settingsRouter.post('/integrations', async (req: Request, res: Response) => {
  try {
    // Mock data temporarily while schema is being implemented
    const integrationData = req.body;

    // Return mock created integration
    res.status(201).json({
      id: 4,
      name: integrationData.name || 'New Integration',
      provider: integrationData.provider || 'Custom',
      type: integrationData.type || 'api',
      status: 'active',
      lastSynced: null,
      apiKey: integrationData.apiKey || null,
      apiUrl: integrationData.apiUrl || null,
      config: integrationData.config || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid integration data', errors: error.errors });
    } else {
      console.error('Error creating integration:', error);
      res.status(500).json({
        message: 'Error creating integration',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

// Update integration
settingsRouter.patch('/integrations/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const integrationData = req.body;

    // Mock data temporarily while schema is being implemented
    res.json({
      id: id,
      name: integrationData.name || 'Updated Integration',
      provider: integrationData.provider || 'Custom',
      type: integrationData.type || 'api',
      status: integrationData.status || 'active',
      lastSynced: null,
      apiKey: integrationData.apiKey || null,
      apiUrl: integrationData.apiUrl || null,
      config: integrationData.config || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating integration:', error);
    res.status(500).json({
      message: 'Error updating integration',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Delete integration
settingsRouter.delete('/integrations/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Mock successful deletion
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting integration' });
  }
});

// Test integration connection
settingsRouter.post('/integrations/:id/test', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [integration] = await db.select().from(integrations).where(eq(integrations.id, id));

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // This is a placeholder for testing different integrations
    // In a real implementation, we would test the connection based on the integration type
    switch (integration.type) {
      case 'api':
        if (integration.provider === 'Fair Work') {
          // Simulate Fair Work API test
          if (integration.apiKey && integration.apiUrl) {
            // Simulate success
            res.json({ success: true, message: 'Successfully connected to Fair Work API' });
          } else {
            res.json({ success: false, message: 'Missing API key or URL' });
          }
        } else {
          res.json({ success: true, message: 'Test connection simulated successfully' });
        }
        break;

      case 'notification':
        if (integration.provider === 'SMTP') {
          // Simulate SMTP test
          const config = (integration.config as Record<string, any>) || {};
          if (config.smtpHost && config.smtpPort) {
            res.json({ success: true, message: 'Successfully connected to SMTP server' });
          } else {
            res.json({ success: false, message: 'Missing SMTP configuration' });
          }
        } else {
          res.json({ success: true, message: 'Test notification service simulated successfully' });
        }
        break;

      case 'storage':
        res.json({ success: true, message: 'Storage connection test simulated successfully' });
        break;

      default:
        res.json({ success: true, message: 'Generic test completed successfully' });
    }
  } catch (error) {
    console.error('Error testing integration:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing integration',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Sync integration data
settingsRouter.post('/integrations/:id/sync', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [integration] = await db.select().from(integrations).where(eq(integrations.id, id));

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Update lastSynced time
    const now = new Date();
    await db
      .update(integrations)
      .set({
        lastSynced: now,
        updatedAt: now,
      })
      .where(eq(integrations.id, id));

    // In a real implementation, this would trigger a sync process
    // For now, we just return success
    res.json({ success: true, message: 'Sync process initiated' });
  } catch (error) {
    console.error('Error syncing integration:', error);
    res.status(500).json({
      message: 'Error syncing integration',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Webhook Routes
// Get all webhooks
settingsRouter.get('/webhooks', async (req: Request, res: Response) => {
  try {
    // Mock data temporarily while schema is being implemented
    const allWebhooks = [
      {
        id: 1,
        name: 'New Apprentice Notification',
        url: 'https://example.com/webhook/apprentice',
        events: ['apprentice.created', 'apprentice.updated'],
        secret: 'abc123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Compliance Alert',
        url: 'https://example.com/webhook/compliance',
        events: ['compliance.issue'],
        secret: 'xyz456',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    res.json(allWebhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({
      message: 'Error fetching webhooks',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Create webhook
settingsRouter.post('/webhooks', async (req: Request, res: Response) => {
  try {
    // Mock data temporarily while schema is being implemented
    const webhookData = req.body;

    // Return mock created webhook
    res.status(201).json({
      id: 3,
      name: webhookData.name || 'New Webhook',
      url: webhookData.url || 'https://example.com/webhook',
      events: webhookData.events || ['default.event'],
      secret: webhookData.secret || 'webhook_secret',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid webhook data', errors: error.errors });
    } else {
      console.error('Error creating webhook:', error);
      res.status(500).json({
        message: 'Error creating webhook',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

// Update webhook
settingsRouter.patch('/webhooks/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const webhookData = req.body;

    // Mock data temporarily while schema is being implemented
    res.json({
      id: id,
      name: webhookData.name || 'Updated Webhook',
      url: webhookData.url || 'https://example.com/webhook',
      events: webhookData.events || ['default.event'],
      secret: webhookData.secret || 'webhook_secret',
      isActive: webhookData.isActive !== undefined ? webhookData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating webhook:', error);
    res.status(500).json({
      message: 'Error updating webhook',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Delete webhook
settingsRouter.delete('/webhooks/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Mock successful deletion
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({
      message: 'Error deleting webhook',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Import/Export Routes
// Get all data jobs
settingsRouter.get('/data-jobs', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Mock data temporarily while schema is being implemented
    let jobs = [
      {
        id: 1,
        type: 'import',
        dataType: 'apprentices',
        status: 'completed',
        fileName: 'apprentices-import-20250401.csv',
        fileFormat: 'csv',
        recordsProcessed: 124,
        recordsTotal: 124,
        options: { skipHeader: true, updateExisting: true },
        errors: null,
        userId,
        createdAt: new Date(Date.now() - 86400000),
        completedAt: new Date(Date.now() - 86395000),
        updatedAt: new Date(Date.now() - 86395000),
      },
      {
        id: 2,
        type: 'export',
        dataType: 'host_employers',
        status: 'in_progress',
        fileName: 'employers-export-20250430.xlsx',
        fileFormat: 'xlsx',
        recordsProcessed: 47,
        recordsTotal: 150,
        options: { includeArchived: false },
        errors: null,
        userId,
        createdAt: new Date(),
        completedAt: null,
        updatedAt: new Date(),
      },
      {
        id: 3,
        type: 'import',
        dataType: 'training_contracts',
        status: 'failed',
        fileName: 'contracts-import-20250429.csv',
        fileFormat: 'csv',
        recordsProcessed: 5,
        recordsTotal: 78,
        options: { skipHeader: true, updateExisting: false },
        errors: ['Row 6: Invalid apprentice ID', 'Row 10: Missing required field: contractNumber'],
        userId,
        createdAt: new Date(Date.now() - 172800000),
        completedAt: new Date(Date.now() - 172790000),
        updatedAt: new Date(Date.now() - 172790000),
      },
    ];

    // Filter by type if provided
    if (type) {
      jobs = jobs.filter(job => job.type === type);
    }

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching data jobs:', error);
    res.status(500).json({
      message: 'Error fetching data jobs',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Create import job
settingsRouter.post('/import', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { type, options } = req.body;

    if (!type) {
      return res.status(400).json({ message: 'Data type is required' });
    }

    // Get file extension
    const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();
    let fileFormat = 'unknown';
    if (fileExtension === 'csv') fileFormat = 'csv';
    else if (fileExtension === 'xlsx' || fileExtension === 'xls') fileFormat = 'xlsx';
    else if (fileExtension === 'json') fileFormat = 'json';

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Mock data temporarily while schema is being implemented
    const importJob = {
      id: 4,
      type: 'import',
      dataType: type,
      status: 'queued',
      fileName: req.file.originalname,
      fileFormat,
      recordsProcessed: 0,
      recordsTotal: 0,
      options: options ? JSON.parse(options) : {},
      errors: null,
      userId,
      createdAt: new Date(),
      completedAt: null,
      updatedAt: new Date(),
    };

    res.status(201).json(importJob);
  } catch (error) {
    console.error('Error creating import job:', error);
    res.status(500).json({
      message: 'Error creating import job',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Create export job
settingsRouter.post('/export', async (req: Request, res: Response) => {
  try {
    const { type, format, dateRange, includeArchived } = req.body;

    if (!type || !format) {
      return res.status(400).json({ message: 'Type and format are required' });
    }

    // Create a filename based on the type and current date
    const now = new Date();
    const dateString = now.toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `${type}-export-${dateString}.${format}`;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Mock data temporarily while schema is being implemented
    const exportJob = {
      id: 5,
      type: 'export',
      dataType: type,
      status: 'queued',
      fileName,
      fileFormat: format,
      recordsProcessed: 0,
      recordsTotal: 0,
      options: { dateRange, includeArchived },
      errors: null,
      userId,
      createdAt: now,
      completedAt: null,
      updatedAt: now,
    };

    res.status(201).json(exportJob);
  } catch (error) {
    console.error('Error creating export job:', error);
    res.status(500).json({
      message: 'Error creating export job',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get data job by ID
settingsRouter.get('/data-jobs/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Mock data temporarily while schema is being implemented
    const jobs = [
      {
        id: 1,
        type: 'import',
        dataType: 'apprentices',
        status: 'completed',
        fileName: 'apprentices-import-20250401.csv',
        fileFormat: 'csv',
        recordsProcessed: 124,
        recordsTotal: 124,
        options: { skipHeader: true, updateExisting: true },
        errors: null,
        userId,
        createdAt: new Date(Date.now() - 86400000),
        completedAt: new Date(Date.now() - 86395000),
        updatedAt: new Date(Date.now() - 86395000),
      },
      {
        id: 2,
        type: 'export',
        dataType: 'host_employers',
        status: 'in_progress',
        fileName: 'employers-export-20250430.xlsx',
        fileFormat: 'xlsx',
        recordsProcessed: 47,
        recordsTotal: 150,
        options: { includeArchived: false },
        errors: null,
        userId,
        createdAt: new Date(),
        completedAt: null,
        updatedAt: new Date(),
      },
    ];

    const job = jobs.find(j => j.id === id);

    if (!job) {
      return res.status(404).json({ message: 'Data job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching data job:', error);
    res.status(500).json({
      message: 'Error fetching data job',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Cancel data job
settingsRouter.post('/data-jobs/:id/cancel', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Mock data temporarily while schema is being implemented
    const job = {
      id: id,
      type: 'import',
      dataType: 'apprentices',
      status: 'failed',
      fileName: 'apprentices-import-20250401.csv',
      fileFormat: 'csv',
      recordsProcessed: 10,
      recordsTotal: 100,
      options: { skipHeader: true, updateExisting: true },
      errors: { message: 'Job cancelled by user' },
      userId,
      createdAt: new Date(Date.now() - 3600000),
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    res.json(job);
  } catch (error) {
    console.error('Error cancelling data job:', error);
    res.status(500).json({
      message: 'Error cancelling data job',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Custom Data Views Routes
// Get all data views
settingsRouter.get('/data-views', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Mock data temporarily while schema is being implemented
    const allViews = [
      {
        id: 1,
        name: 'Apprentices with Host Details',
        description: 'Apprentices with their host employer information',
        entityType: 'apprentices',
        columns: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phone',
          'trade',
          'hostEmployer.name',
          'hostEmployer.contactPerson',
        ],
        filters: [{ field: 'status', operator: 'eq', value: 'active' }],
        sortBy: 'lastName',
        sortDirection: 'asc',
        isPublic: true,
        userId,
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
      },
      {
        id: 2,
        name: 'Active Compliance Issues',
        description: 'All unresolved compliance issues',
        entityType: 'compliance_records',
        columns: ['id', 'type', 'status', 'dueDate', 'relatedTo', 'relatedId', 'notes'],
        filters: [{ field: 'status', operator: 'ne', value: 'resolved' }],
        sortBy: 'dueDate',
        sortDirection: 'asc',
        isPublic: false,
        userId,
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 172800000),
      },
    ];

    res.json(allViews);
  } catch (error) {
    console.error('Error fetching data views:', error);
    res.status(500).json({
      message: 'Error fetching data views',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get data view by ID
settingsRouter.get('/data-views/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Mock data temporarily while schema is being implemented
    const views = [
      {
        id: 1,
        name: 'Apprentices with Host Details',
        description: 'Apprentices with their host employer information',
        entityType: 'apprentices',
        columns: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phone',
          'trade',
          'hostEmployer.name',
          'hostEmployer.contactPerson',
        ],
        filters: [{ field: 'status', operator: 'eq', value: 'active' }],
        sortBy: 'lastName',
        sortDirection: 'asc',
        isPublic: true,
        userId,
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
      },
      {
        id: 2,
        name: 'Active Compliance Issues',
        description: 'All unresolved compliance issues',
        entityType: 'compliance_records',
        columns: ['id', 'type', 'status', 'dueDate', 'relatedTo', 'relatedId', 'notes'],
        filters: [{ field: 'status', operator: 'ne', value: 'resolved' }],
        sortBy: 'dueDate',
        sortDirection: 'asc',
        isPublic: false,
        userId,
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 172800000),
      },
    ];

    const view = views.find(v => v.id === id);

    if (!view) {
      return res.status(404).json({ message: 'Data view not found' });
    }

    res.json(view);
  } catch (error) {
    console.error('Error fetching data view:', error);
    res.status(500).json({
      message: 'Error fetching data view',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Create data view
settingsRouter.post('/data-views', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Mock data temporarily while schema is being implemented
    const viewData = req.body;

    res.status(201).json({
      id: 3,
      name: viewData.name || 'New Data View',
      description: viewData.description || '',
      entityType: viewData.entityType || 'apprentices',
      columns: viewData.columns || ['id', 'firstName', 'lastName'],
      filters: viewData.filters || [],
      sortBy: viewData.sortBy || 'id',
      sortDirection: viewData.sortDirection || 'asc',
      isPublic: viewData.isPublic !== undefined ? viewData.isPublic : false,
      userId: req.user?.id || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid data view', errors: error.errors });
    } else {
      console.error('Error creating data view:', error);
      res.status(500).json({
        message: 'Error creating data view',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

// Update data view
settingsRouter.patch('/data-views/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const viewData = req.body;

    // Mock data temporarily while schema is being implemented
    res.json({
      id: id,
      name: viewData.name || 'Updated Data View',
      description: viewData.description || '',
      entityType: viewData.entityType || 'apprentices',
      columns: viewData.columns || ['id', 'firstName', 'lastName'],
      filters: viewData.filters || [],
      sortBy: viewData.sortBy || 'id',
      sortDirection: viewData.sortDirection || 'asc',
      isPublic: viewData.isPublic !== undefined ? viewData.isPublic : false,
      userId,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating data view:', error);
    res.status(500).json({
      message: 'Error updating data view',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Delete data view
settingsRouter.delete('/data-views/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Mock successful deletion
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting data view:', error);
    res.status(500).json({
      message: 'Error deleting data view',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export { settingsRouter };
