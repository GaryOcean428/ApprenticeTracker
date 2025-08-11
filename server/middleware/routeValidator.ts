import type { Request, Response, NextFunction } from 'express';
import { z, type ZodTypeAny } from 'zod';

/**
 * Factory for request validation middleware.
 * Validates body, query, and params with a Zod schema.
 */
export const validateRoute = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (result.success) {
      return next();
    }

    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.errors,
    });
  };
};
