import { mock } from 'jest-mock-extended';
import type { CacheService } from '@/lib/services/cache/cache-service';
import { logger } from '@/lib/services/logger';
import { FairWorkCacheMiddleware } from '../cache-middleware';
import type { RateValidationRequest, RateCalculationRequest } from '../types';
import type { FairWorkApiClient } from '../types';

jest.mock('@/lib/services/logger');
jest.mock('@/lib/services/cache/cache-service');

describe('FairWorkCacheMiddleware', () => {
  let cacheMiddleware: FairWorkCacheMiddleware;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockClient: jest.Mocked<FairWorkApiClient>;

  beforeEach(() => {
    mockCacheService = mock<CacheService>();
    mockClient = mock<FairWorkApiClient>();
    cacheMiddleware = new FairWorkCacheMiddleware(mockClient);
    // @ts-expect-error - Accessing private cache property for testing
    cacheMiddleware.cache = mockCacheService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Base Rate Operations', () => {
    const mockParams = {
      awardCode: 'TEST001',
      classificationCode: 'L1',
      date: new Date('2025-01-29').toISOString(),
    };

    it('should cache base rate calculations', async () => {
      const mockRate = 25.5;
      const factory = jest.fn().mockResolvedValue(mockRate);

      mockCacheService.getOrSet.mockImplementation(async (key, fn) => fn());

      const result = await cacheMiddleware.getBaseRate(mockParams, factory);

      expect(result).toBe(mockRate);
      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('base-rate'),
        expect.any(Function)
      );
      expect(factory).toHaveBeenCalledWith(mockParams);
    });

    it('should return cached base rate without calling factory', async () => {
      const mockRate = 25.5;
      const factory = jest.fn().mockResolvedValue(30.0);

      mockCacheService.getOrSet.mockResolvedValue(mockRate);

      const result = await cacheMiddleware.getBaseRate(mockParams, factory);

      expect(result).toBe(mockRate);
      expect(factory).not.toHaveBeenCalled();
    });

    it('should invalidate base rate cache', async () => {
      await cacheMiddleware.invalidateBaseRate(mockParams);

      expect(mockCacheService.delete).toHaveBeenCalledWith(expect.stringContaining('base-rate'));
    });
  });

  describe('Classifications Operations', () => {
    const mockParams = {
      awardCode: 'TEST001',
      date: new Date('2025-01-29').toISOString(),
    };

    it('should cache classifications', async () => {
      const mockClassifications = [
        { code: 'L1', name: 'Level 1' },
        { code: 'L2', name: 'Level 2' },
      ];
      const factory = jest.fn().mockResolvedValue(mockClassifications);

      mockCacheService.getOrSet.mockImplementation(async (key, fn) => fn());

      const result = await cacheMiddleware.getClassifications(mockParams, factory);

      expect(result).toEqual(mockClassifications);
      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('classifications'),
        expect.any(Function)
      );
      expect(factory).toHaveBeenCalledWith(mockParams);
    });

    it('should invalidate classifications cache', async () => {
      await cacheMiddleware.invalidateClassifications(mockParams);

      expect(mockCacheService.delete).toHaveBeenCalledWith(
        expect.stringContaining('classifications'),
      );
    });
  });

  describe('Rate Calculation Operations', () => {
    const mockParams = {
      awardCode: 'TEST001',
      classificationCode: 'L1',
      date: new Date('2025-01-29').toISOString(),
      employmentType: 'permanent',
      hours: 38
    } as Record<string, unknown>;

    it('should cache rate calculations', async () => {
      const mockResult = {
        rate: 30.5,
        components: [{ type: 'base', amount: 25.5 }],
      };
      const factory = jest.fn().mockResolvedValue(mockResult);

      mockCacheService.getOrSet.mockImplementation(async (key, fn) => fn());

      const result = await cacheMiddleware.calculateRate(mockParams, factory);

      expect(result).toEqual(mockResult);
      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('calculate-rate'),
        expect.any(Function)
      );
      expect(factory).toHaveBeenCalledWith(mockParams);
    });
  });

  describe('Rate Validation Operations', () => {
    const mockParams = {
      awardCode: 'TEST001',
      classificationCode: 'L1',
      rate: 25.5,
      date: new Date('2025-01-29').toISOString(),
    };

    it('should cache rate validations', async () => {
      const mockResult = {
        isValid: true,
        minimumRate: 20.5,
      };
      const factory = jest.fn().mockResolvedValue(mockResult);

      mockCacheService.getOrSet.mockImplementation(async (key, fn) => fn());

      const result = await cacheMiddleware.validateRate(mockParams, factory);

      expect(result).toEqual(mockResult);
      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('validate-rate'),
        expect.any(Function)
      );
      expect(factory).toHaveBeenCalledWith(mockParams);
    });
  });

  describe('Award Cache Operations', () => {
    const awardCode = 'TEST001';

    it('should invalidate all caches for an award', async () => {
      await cacheMiddleware.invalidateAwardCache(awardCode);

      expect(mockCacheService.deletePattern).toHaveBeenCalledWith(
        expect.stringContaining(awardCode),
      );
      expect(logger.info).toHaveBeenCalledWith('Invalidated award cache:', {
        awardCode,
      });
    });

    it('should handle errors during award cache invalidation', async () => {
      const error = new Error('Cache error');
      mockCacheService.deletePattern.mockRejectedValue(error);

      await expect(cacheMiddleware.invalidateAwardCache(awardCode)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent keys for same parameters', async () => {
      const params = {
        awardCode: 'TEST001',
        classificationCode: 'L1',
        date: new Date('2025-01-29').toISOString(),
      };
      const factory = jest.fn();

      await cacheMiddleware.getBaseRate(params, factory);
      await cacheMiddleware.getBaseRate(params, factory);

      const [firstCall, secondCall] = mockCacheService.getOrSet.mock.calls;
      expect(firstCall[0]).toBe(secondCall[0]);
    });

    it('should generate different keys for different parameters', async () => {
      const factory = jest.fn();
      const params1 = {
        awardCode: 'TEST001',
        classificationCode: 'L1',
        date: new Date('2025-01-29').toISOString(),
      };
      const params2 = {
        awardCode: 'TEST001',
        classificationCode: 'L2',
        date: new Date('2025-01-29').toISOString(),
      };

      await cacheMiddleware.getBaseRate(params1, factory);
      await cacheMiddleware.getBaseRate(params2, factory);

      const [firstCall, secondCall] = mockCacheService.getOrSet.mock.calls;
      expect(firstCall[0]).not.toBe(secondCall[0]);
    });
  });

  describe('Cleanup', () => {
    it('should close cache service', async () => {
      await cacheMiddleware.close();
      expect(mockCacheService.close).toHaveBeenCalled();
    });
  });
});
