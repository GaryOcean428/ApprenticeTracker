import type { Request, Response, NextFunction } from 'express';
import { z, type ZodTypeAny, ZodError } from 'zod';

/**
 * Validate body, query, and params against a Zod schema.
 * On success, parsed values are written back to req.* for downstream handlers.
 */
export const validateRoute = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // If schema returns a shape with body/query/params, persist sanitized values.
      if (parsed && typeof parsed === 'object') {
        // @ts-expect-error Express doesn't strongly type these assignments
        req.body = (parsed as any).body ?? req.body;
        // @ts-expect-error
        req.query = (parsed as any).query ?? req.query;
        // @ts-expect-error
        req.params = (parsed as any).params ?? req.params;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      next(error);
    }
  };
};
