import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { validateRoute } from './routeValidator';

describe('validateRoute', () => {
  it('calls next when validation succeeds', async () => {
    const req = { body: { name: 'Jane' }, query: {}, params: {} } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();

    const schema = z.object({
      body: z.object({ name: z.string() }),
      query: z.object({}).default({}),
      params: z.object({}).default({}),
    });

    await validateRoute(schema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responds with 400 when validation fails', async () => {
    const req = { body: {}, query: {}, params: {} } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();

    const schema = z.object({
      body: z.object({ name: z.string() }),
      query: z.object({}).default({}),
      params: z.object({}).default({}),
    });

    await validateRoute(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validation failed',
      errors: expect.any(Array),
    });
    expect(next).not.toHaveBeenCalled();
  });
});
