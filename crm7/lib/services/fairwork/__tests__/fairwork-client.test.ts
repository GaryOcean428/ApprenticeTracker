import { logger } from '@/lib/logger';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FairWorkClient, type FairWorkConfig } from '../fairwork-client';
import type { RateValidationRequest } from '../types';

vi.mock('axios');
vi.mock('@/lib/logger');

const mockConfig: FairWorkConfig = {
  apiKey: 'test-api-key',
  apiUrl: 'https://api.test.com',
  environment: 'sandbox',
  timeout: 5000,
};

describe('FairWorkClient', () => {
  let client: FairWorkClient;
  let mockAxios: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAxios = {
      get: vi.fn(),
      post: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
      defaults: {},
      getUri: vi.fn(),
      request: vi.fn(),
      delete: vi.fn(),
      head: vi.fn(),
      options: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      postForm: vi.fn(),
      putForm: vi.fn(),
      patchForm: vi.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    vi.mocked(axios.create).mockReturnValue(mockAxios);
    client = new FairWorkClient(mockConfig);
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: mockConfig.apiUrl,
        timeout: mockConfig.timeout,
        headers: {
          Authorization: `Bearer ${mockConfig.apiKey}`,
          'Content-Type': 'application/json',
          'X-Environment': mockConfig.environment,
        },
      });
    });

    it('should throw error for invalid config', () => {
      expect(() =>
        new FairWorkClient({
          ...mockConfig,
          apiUrl: 'invalid-url',
        }),
      ).toThrow('Invalid config');
    });
  });

  describe('getAward', () => {
    it('should fetch award details', async () => {
      const awardCode = 'MA000001';
      const mockResponse: AxiosResponse = {
        data: {
          code: awardCode,
          name: 'Test Award',
          description: 'Test Description',
          industry: 'Test Industry',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await client.getAward(awardCode);
      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.get).toHaveBeenCalledWith(`/awards/${awardCode}`);
    });

    it('should handle API error', async () => {
      const mockError = Object.assign(
        new Error('Award not found'),
        {
          isAxiosError: true,
          response: {
            status: 404,
            data: { message: 'Award not found' }
          }
        }
      );

      mockAxios.get.mockRejectedValue(mockError);

      await expect(client.getAward('invalid')).rejects.toThrow('Award not found');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('validatePayRate', () => {
    it('should validate pay rate', async () => {
      const params = {
        rate: 30,
        awardCode: 'MA000001',
        classificationCode: 'L1'
      };

      const mockResponse = {
        data: {
          isValid: true,
          minimumRate: 25.5,
          difference: 4.5,
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await client.validatePayRate(params);
      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith(
        `/awards/${params.awardCode}/classifications/${params.classificationCode}/validate`,
        { rate: params.rate }
      );
    });
  });

  describe('searchAwards', () => {
    it('should search awards with parameters', async () => {
      const params = {
        query: 'test',
        industry: 'retail',
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        data: {
          items: [
            { code: 'MA000001', name: 'Test Award 1' },
            { code: 'MA000002', name: 'Test Award 2' },
          ],
          total: 2,
        },
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await client.searchAwards(params);
      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.get).toHaveBeenCalledWith('/awards', { params });
    });
  });

  describe('getClassification', () => {
    it('should fetch classification details', async () => {
      const awardCode = 'MA000001';
      const classificationCode = 'L1';
      const mockResponse = {
        data: {
          code: classificationCode,
          name: 'Level 1',
        },
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await client.getClassification(awardCode, classificationCode);
      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.get).toHaveBeenCalledWith(
        `/awards/${awardCode}/classifications/${classificationCode}`,
      );
    });
  });

  describe('calculatePay', () => {
    it('should calculate pay with all components', async () => {
      const params = {
        awardCode: 'MA000001',
        classificationCode: 'L1',
        date: '2025-01-01',
        employmentType: 'casual',
        hours: 38,
        penalties: ['SAT'],
        allowances: ['TOOL']
      };

      const mockResponse = {
        data: {
          baseRate: 25.5,
          casualLoading: 25,
          total: 47.375,
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await client.calculatePay(params);
      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith(
        `/awards/${params.awardCode}/classifications/${params.classificationCode}/calculate`,
        {
          date: params.date,
          employmentType: params.employmentType,
          hours: params.hours,
          penalties: params.penalties,
          allowances: params.allowances
        }
      );
    });
  });

  describe('getPenalties', () => {
    it('should fetch penalties', async () => {
      const awardCode = 'MA000001';
      const params = {
        date: '2025-01-01',
        type: 'weekend',
      };

      const mockResponse = {
        data: [
          { code: 'SAT', rate: 25, description: 'Saturday penalty' },
          { code: 'SUN', rate: 50, description: 'Sunday penalty' },
        ],
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await client.getPenalties(awardCode, params);
      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.get).toHaveBeenCalledWith(`/awards/${awardCode}/penalties`, { params });
    });
  });

  describe('getAllowances', () => {
    it('should fetch allowances', async () => {
      const awardCode = 'MA000001';
      const params = {
        date: '2025-01-01',
        type: 'tools',
      };

      const mockResponse = {
        data: [{ code: 'TOOL', amount: 15.5, description: 'Tool allowance' }],
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await client.getAllowances(awardCode, params);
      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.get).toHaveBeenCalledWith(`/awards/${awardCode}/allowances`, { params });
    });
  });

  describe('getLeaveEntitlements', () => {
    it('should fetch leave entitlements', async () => {
      const awardCode = 'MA000001';
      const params = {
        employmentType: 'permanent' as const,
        date: '2025-01-01',
      };

      const mockResponse = {
        data: [
          { type: 'annual', amount: 20, unit: 'days' },
          { type: 'sick', amount: 10, unit: 'days' },
        ],
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await client.getLeaveEntitlements(awardCode, params);
      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.get).toHaveBeenCalledWith(`/awards/${awardCode}/leave-entitlements`, {
        params,
      });
    });
  });

  describe('getPublicHolidays', () => {
    it('should fetch public holidays', async () => {
      const params = {
        state: 'NSW',
        year: 2025,
      };

      const mockResponse = {
        data: [
          { date: '2025-01-01', name: "New Year's Day" },
          { date: '2025-01-26', name: 'Australia Day' },
        ],
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await client.getPublicHolidays(params);
      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.get).toHaveBeenCalledWith('/public-holidays', { params });
    });
  });
});
