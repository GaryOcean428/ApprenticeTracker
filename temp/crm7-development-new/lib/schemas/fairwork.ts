import { z } from 'zod';

export const DateParamsSchema = z.object({
  date: z.string().datetime().optional(),
  type: z.string().optional(),
});

export const ValidateSchema = z.object({
  rate: z.number().positive(),
  date: z.string().datetime(),
  options: z.record(z.unknown()).optional(),
});
