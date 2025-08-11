import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

/**
 * Validates the incoming request against a provided Zod schema.
 * Sends a 400 response with detailed errors when validation fails.
 */
export const validateRoute = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  };
};
