import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { rateTemplateService, RateTemplateData, RateTemplateComponentData } from '../services/RateTemplateService'; // Assuming interfaces are exported
import logger from '../utils/logger';

// Placeholder for auth middleware - replace with actual implementation
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  if (req.user && req.user.id) { // Assuming req.user is populated by auth middleware
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

const hasPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Placeholder permission check
    logger.info(`Permission check for: ${permission}`);
    // @ts-ignore
    // if (req.user && req.user.hasPermission(permission)) { // Example
    //   return next();
    // }
    // res.status(403).json({ error: 'Forbidden' });
    return next(); // For now, allow all authenticated users
  };
};


const router = Router();

// --- Zod Schemas for Validation ---

const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  organization_id: z.number().int().optional().nullable(),
  status: z.enum(['draft', 'active', 'archived']),
  effective_from: z.string().datetime().optional().nullable().transform(val => val ? new Date(val) : null),
  effective_to: z.string().datetime().optional().nullable().transform(val => val ? new Date(val) : null),
  config_details: z.any().optional().nullable(),
});

const updateTemplateSchema = createTemplateSchema.partial().omit({ version: true }); // version is handled by service

const createComponentSchema = z.object({
  component_type: z.string().min(1, "Component type is required"),
  component_name: z.string().optional().nullable(),
  value_source_table: z.string().optional().nullable(),
  value_identifier: z.string().optional().nullable(),
  fixed_value_numeric: z.union([z.string(), z.number()]).optional().nullable(),
  percentage_value_numeric: z.union([z.string(), z.number()]).optional().nullable(),
  based_on_component_id: z.number().int().optional().nullable(),
  conditions: z.any().optional().nullable(),
  notes: z.string().optional().nullable(),
  order: z.number().int().optional().nullable(),
});

const updateComponentSchema = createComponentSchema.partial();

const calculationContextSchema = z.object({
  effectiveDate: z.string().datetime().transform(val => new Date(val)),
  // Add other expected context fields here, e.g.:
  apprenticeId: z.number().int().optional(),
  apprenticeYear: z.number().int().optional(),
  isAdult: z.boolean().optional(),
  hasCompletedYear12: z.boolean().optional(),
  day_of_week: z.string().optional(),
  time_of_day: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(), // HH:MM format
  is_public_holiday: z.boolean().optional(),
  employee_age: z.number().int().optional(),
  hours_in_shift: z.number().optional(),
}).passthrough(); // Allow other fields not explicitly defined

const validationContextSchema = z.object({
  awardCode: z.string().min(1),
  classificationSystemIdentifier: z.string().min(1), // Or z.number() if it's always numeric
  effectiveDate: z.string().datetime().transform(val => new Date(val)),
  userId: z.number().int().optional(), // For logging within service
}).passthrough();


// Middleware to get user ID (assuming it's set by a previous auth middleware)
const getUserId = (req: Request): number => {
  // @ts-ignore
  return req.user?.id || 0; // Default to 0 or handle error if user ID is critical
};

// --- Rate Templates CRUD ---

router.post('/', isAuthenticated, hasPermission('manage_rate_templates'), async (req: Request, res: Response) => {
  try {
    const data = createTemplateSchema.parse(req.body);
    const userId = getUserId(req);
    const template = await rateTemplateService.createRateTemplate(data as RateTemplateData, userId);
    res.status(201).json(template);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    logger.error('Error creating rate template:', error);
    res.status(500).json({ error: 'Failed to create rate template' });
  }
});

router.get('/', isAuthenticated, hasPermission('view_rate_templates'), async (req: Request, res: Response) => {
  try {
    const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
    const templates = await rateTemplateService.getAllRateTemplates(organizationId);
    res.status(200).json(templates);
  } catch (error: any) {
    logger.error('Error fetching rate templates:', error);
    res.status(500).json({ error: 'Failed to fetch rate templates' });
  }
});

router.get('/:templateId', isAuthenticated, hasPermission('view_rate_templates'), async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.templateId);
    if (isNaN(templateId)) return res.status(400).json({ error: 'Invalid template ID' });

    const template = await rateTemplateService.getRateTemplateById(templateId);
    if (!template) return res.status(404).json({ error: 'Rate template not found' });
    res.status(200).json(template);
  } catch (error: any) {
    logger.error(`Error fetching rate template ${req.params.templateId}:`, error);
    res.status(500).json({ error: 'Failed to fetch rate template' });
  }
});

router.put('/:templateId', isAuthenticated, hasPermission('manage_rate_templates'), async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.templateId);
    if (isNaN(templateId)) return res.status(400).json({ error: 'Invalid template ID' });

    const data = updateTemplateSchema.parse(req.body);
    const userId = getUserId(req);
    const template = await rateTemplateService.updateRateTemplate(templateId, data as Partial<RateTemplateData>, userId);
    if (!template) return res.status(404).json({ error: 'Rate template not found or update failed' });
    res.status(200).json(template);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    logger.error(`Error updating rate template ${req.params.templateId}:`, error);
    res.status(500).json({ error: 'Failed to update rate template' });
  }
});

router.post('/:templateId/archive', isAuthenticated, hasPermission('manage_rate_templates'), async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.templateId);
    if (isNaN(templateId)) return res.status(400).json({ error: 'Invalid template ID' });

    const userId = getUserId(req);
    const success = await rateTemplateService.archiveRateTemplate(templateId, userId);
    if (!success) return res.status(404).json({ error: 'Rate template not found or already archived' });
    res.status(200).json({ message: 'Rate template archived successfully' });
  } catch (error: any) {
    logger.error(`Error archiving rate template ${req.params.templateId}:`, error);
    res.status(500).json({ error: 'Failed to archive rate template' });
  }
});

router.post('/:templateId/unarchive', isAuthenticated, hasPermission('manage_rate_templates'), async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.templateId);
    if (isNaN(templateId)) return res.status(400).json({ error: 'Invalid template ID' });

    const userId = getUserId(req);
    const success = await rateTemplateService.unarchiveRateTemplate(templateId, userId);
    if (!success) return res.status(404).json({ error: 'Rate template not found or not archived' });
    res.status(200).json({ message: 'Rate template unarchived successfully' });
  } catch (error: any) {
    logger.error(`Error unarchiving rate template ${req.params.templateId}:`, error);
    res.status(500).json({ error: 'Failed to unarchive rate template' });
  }
});


// --- Rate Template Components CRUD (nested) ---
const componentsRouter = Router({ mergeParams: true }); // Ensure parent params (templateId) are merged

componentsRouter.post('/', isAuthenticated, hasPermission('manage_rate_templates'), async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const templateId = parseInt(req.params.templateId);
    if (isNaN(templateId)) return res.status(400).json({ error: 'Invalid parent template ID' });

    const data = createComponentSchema.parse(req.body);
    const userId = getUserId(req);
    // componentData in service excludes rate_template_id, it's passed as first param
    const component = await rateTemplateService.addComponentToTemplate(templateId, data as Omit<RateTemplateComponentData, 'rate_template_id'>, userId);
    res.status(201).json(component);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    // @ts-ignore
    logger.error(`Error adding component to template ${req.params.templateId}:`, error);
    res.status(500).json({ error: 'Failed to add component' });
  }
});

componentsRouter.get('/', isAuthenticated, hasPermission('view_rate_templates'), async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const templateId = parseInt(req.params.templateId);
    if (isNaN(templateId)) return res.status(400).json({ error: 'Invalid parent template ID' });

    const components = await rateTemplateService.getComponentsForTemplate(templateId);
    res.status(200).json(components);
  } catch (error: any) {
    // @ts-ignore
    logger.error(`Error fetching components for template ${req.params.templateId}:`, error);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
});

componentsRouter.put('/:componentId', isAuthenticated, hasPermission('manage_rate_templates'), async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const templateId = parseInt(req.params.templateId); // For context, not directly used by service update method if componentId is globally unique
    const componentId = parseInt(req.params.componentId);
    if (isNaN(templateId) || isNaN(componentId)) return res.status(400).json({ error: 'Invalid template or component ID' });

    const data = updateComponentSchema.parse(req.body);
    const userId = getUserId(req);
    const component = await rateTemplateService.updateTemplateComponent(componentId, data as Partial<Omit<RateTemplateComponentData, 'rate_template_id'>>, userId);
    if (!component) return res.status(404).json({ error: 'Component not found or update failed' });
    res.status(200).json(component);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    // @ts-ignore
    logger.error(`Error updating component ${req.params.componentId} for template ${req.params.templateId}:`, error);
    res.status(500).json({ error: 'Failed to update component' });
  }
});

componentsRouter.delete('/:componentId', isAuthenticated, hasPermission('manage_rate_templates'), async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const templateId = parseInt(req.params.templateId); // For context
    const componentId = parseInt(req.params.componentId);
    if (isNaN(templateId) || isNaN(componentId)) return res.status(400).json({ error: 'Invalid template or component ID' });

    const userId = getUserId(req);
    const success = await rateTemplateService.removeTemplateComponent(componentId, userId);
    if (!success) return res.status(404).json({ error: 'Component not found' });
    res.status(200).json({ message: 'Component removed successfully' });
  } catch (error: any) {
    // @ts-ignore
    logger.error(`Error deleting component ${req.params.componentId} for template ${req.params.templateId}:`, error);
    res.status(500).json({ error: 'Failed to delete component' });
  }
});

// Mount the nested router
router.use('/:templateId/components', componentsRouter);


// --- Calculation and Validation Endpoints ---

router.post('/:templateId/calculate', isAuthenticated, hasPermission('calculate_rates'), async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.templateId);
    if (isNaN(templateId)) return res.status(400).json({ error: 'Invalid template ID' });

    const context = calculationContextSchema.parse(req.body);
    const userId = getUserId(req); // For logging within service
    const result = await rateTemplateService.calculateRateFromTemplate(templateId, context, userId);

    if (!result) return res.status(404).json({ error: 'Rate template not found or calculation failed internally.' });
    res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed for calculation context", details: error.errors });
    }
    logger.error(`Error calculating rate for template ${req.params.templateId}:`, error);
    res.status(500).json({ error: 'Failed to calculate rate' });
  }
});

router.post('/:templateId/validate', isAuthenticated, hasPermission('validate_rates'), async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.templateId);
    if (isNaN(templateId)) return res.status(400).json({ error: 'Invalid template ID' });

    // @ts-ignore - req.user might not have id directly depending on auth setup
    const validationContextWithUser = { ...req.body, userId: req.user?.id };
    const context = validationContextSchema.parse(validationContextWithUser);

    const result = await rateTemplateService.validateTemplateRate(templateId, context);

    if (!result) return res.status(404).json({ error: 'Rate template not found or validation context invalid.' });
    res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed for validation context", details: error.errors });
    }
    logger.error(`Error validating rate for template ${req.params.templateId}:`, error);
    res.status(500).json({ error: 'Failed to validate rate' });
  }
});


export default router;
