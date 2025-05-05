import type { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';

import { CacheService } from '@/lib/services/cache/cache-service';
import { FairWorkService } from '@/lib/services/fairwork/fairwork-service';
import { logger } from '@/lib/services/logger';

import calculateHandler from '../../calculate';

jest.mock('@/lib/services/logger');
jest.mock('@/lib/services/cache/cache-service');
jest.mock('@/lib/services/fairwork/fairwork-service');

describe('Rate Calculation API Integration', () => {
  const mockValidRequest = {
    awardCode: 'TEST001',
    classificationCode: 'L1',
    employmentType: 'permanent',
    date: '2025-01-29',
    hours: 38,
  };

  const mockCalculationResponse = {
    baseRate: 25.5,
    penalties: [],
    allowances: [],
    total: 25.5,
    breakdown: {
      base: 25.5,
      penalties: 0,
      allowances: 0,
    },
    metadata: {
      calculatedAt: new Date(),
      effectiveDate: new Date('2025-01-29'),
      source: 'fairwork',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Caching Behavior', () => {
    it('should return cached result on subsequent requests', async () => {
      const { req: firstReq, res: firstRes } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: mockValidRequest,
      });

      const { req: secondReq, res: secondRes } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: mockValidRequest,
      });

      // First request should calculate and cache
      (FairWorkService.prototype.calculateRate as jest.Mock).mockResolvedValueOnce(
        mockCalculationResponse,
      );

      await calculateHandler(firstReq, firstRes);
      const firstResult = JSON.parse(firstRes._getData());

      // Second request should use cache
      await calculateHandler(secondReq, secondRes);
      const secondResult = JSON.parse(secondRes._getData());

      expect(firstResult).toEqual(secondResult);
      expect(FairWorkService.prototype.calculateRate).toHaveBeenCalledTimes(1);
    });

    it('should bypass cache with force-refresh header', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: mockValidRequest,
        headers: {
          'x-force-refresh': 'true',
        },
      });

      (FairWorkService.prototype.calculateRate as jest.Mock).mockResolvedValueOnce(
        mockCalculationResponse,
      );

      await calculateHandler(req, res);

      expect(FairWorkService.prototype.calculateRate).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });

    it('should handle cache service errors gracefully', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: mockValidRequest,
      });

      const cacheError = new Error('Cache connection failed');
      (CacheService.prototype.getOrSet as jest.Mock).mockRejectedValueOnce(cacheError);
      (FairWorkService.prototype.calculateRate as jest.Mock).mockResolvedValueOnce(
        mockCalculationResponse,
      );

      await calculateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Cache error'),
        expect.objectContaining({ error: cacheError.message }),
      );
    });
  });

  describe('Cache Control', () => {
    it('should refresh cache when force-refresh is true', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: mockValidRequest,
        headers: {
          'cache-control': 'no-cache',
        },
      });

      (FairWorkService.prototype.calculateRate as jest.Mock).mockResolvedValueOnce(
        mockCalculationResponse,
      );

      await calculateHandler(req, res);

      expect(CacheService.prototype.set).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });

    it('should handle cache refresh errors', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: mockValidRequest,
        headers: {
          'cache-control': 'no-cache',
        },
      });

      const error = new Error('Failed to refresh cache');
      (CacheService.prototype.set as jest.Mock).mockRejectedValueOnce(error);

      await calculateHandler(req, res);

      expect(res._getStatusCode()).toBe(200); // Should still return data even if cache fails
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Cache error'),
        expect.objectContaining({ error: error.message }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors with cached fallback', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: mockValidRequest,
      });

      const serviceError = new Error('Service unavailable');
      (FairWorkService.prototype.calculateRate as jest.Mock).mockRejectedValueOnce(serviceError);
      (CacheService.prototype.get as jest.Mock).mockResolvedValueOnce(mockCalculationResponse);

      await calculateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject({
        ...mockCalculationResponse,
        metadata: expect.objectContaining({ source: 'cached' }),
      });
    });

    it('should handle both service and cache failures', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: mockValidRequest,
      });

      const serviceError = new Error('Service unavailable');
      const cacheError = new Error('Cache unavailable');
      (FairWorkService.prototype.calculateRate as jest.Mock).mockRejectedValueOnce(serviceError);
      (CacheService.prototype.get as jest.Mock).mockRejectedValueOnce(cacheError);

      await calculateHandler(req, res);

      expect(res._getStatusCode()).toBe(503);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: expect.stringContaining('Service unavailable'),
        code: 'SERVICE_UNAVAILABLE',
      });
    });
  });
});

describe('calculate handler integration', () => {
  beforeEach(() => {
    vi.spyOn(FairWorkService.prototype, 'getActiveAwards').mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle rate calculation', async () => {
    const response = await calculateHandler(new NextRequest(
      'http://localhost:3000/api/rates/calculate',
      {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Rate',
          baseRate: 25.0,
          baseMargin: 1.5,
          superRate: 0.1,
          effectiveFrom: '2024-01-01',
          orgId: 'test-org',
          hours: 38,
          date: '2024-01-01',
        }),
      }
    ));

    expect(response.status).toBe(200);
  });
});
