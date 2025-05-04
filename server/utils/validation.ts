/**
 * Validation utility functions for server-side validation
 */
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Validates request query parameters against a Zod schema
 * @param schema The Zod schema to validate against
 * @returns Express middleware that validates request query parameters
 */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}

/**
 * Validates request body against a Zod schema
 * @param schema The Zod schema to validate against
 * @returns Express middleware that validates request body
 */
export function validateBody<T extends z.ZodType>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}

/**
 * Validates request parameters against a Zod schema
 * @param schema The Zod schema to validate against
 * @returns Express middleware that validates request parameters
 */
export function validateParams<T extends z.ZodType>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}

// Common validation schemas
export const searchQuerySchema = z.object({
  q: z.string().min(3, 'Search query must be at least 3 characters').max(100, 'Search query too long'),
  limit: z.string().optional().transform(val => (val ? parseInt(val) : 20))
});

export const idParamSchema = z.object({
  id: z.string().refine(val => !isNaN(parseInt(val)), {
    message: 'ID must be a valid number'
  }).transform(val => parseInt(val))
});

export const codeParamSchema = z.object({
  code: z.string().min(5, 'Code must be at least 5 characters').max(20, 'Code too long')
});

// Specific validation schemas for TGA
export const tgaSearchSchema = searchQuerySchema;

export const tgaQualificationSchema = z.object({
  code: z.string().min(5, 'Qualification code must be at least 5 characters').max(20, 'Qualification code too long'),
  includeUnits: z.string().optional().transform(val => val === 'true')
});

export const tgaQualificationImportSchema = z.object({
  code: z.string().min(5, 'Qualification code must be at least 5 characters').max(20, 'Qualification code too long')
});

export const tgaSyncSchema = z.object({
  searchQuery: z.string().min(3, 'Search query must be at least 3 characters').max(100, 'Search query too long'),
  limit: z.string().optional().transform(val => (val ? parseInt(val) : 20))
});

export const tgaSyncBatchSchema = z.object({
  codes: z.array(z.string().min(5, 'Qualification code must be at least 5 characters').max(20, 'Qualification code too long'))
    .min(1, 'At least one qualification code is required')
});

export const tgaSyncAllSchema = z.object({
  keywords: z.array(z.string().min(3, 'Keyword must be at least 3 characters').max(50, 'Keyword too long'))
    .min(1, 'At least one keyword is required')
    .optional()
    .default(["Certificate III", "Certificate IV", "Diploma"])
});

// Additional schema for database qualification search
export const qualificationSearchSchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters').max(100, 'Search query too long')
});
