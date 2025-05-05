import { describe, expect, it, vi } from 'vitest';
import { FairWorkClient, createClient } from '../fairwork-client';
import type { RateValidationResponse } from '../types';

interface Award {
  code: string;
  name: string;
  effectiveFrom: string;
  classifications: Array<{
    code: string;
    name: string;
    level: string;
    baseRate: number;
    effectiveFrom: string;
  }>;
}

const TEST_CONFIG = {
  apiKey: 'test-api-key',
  apiUrl: 'https://api.test.fairwork.gov.au/v1',
  environment: 'sandbox' as const,
  timeout: 5000,
};

describe('FairWorkClient', () => {
  let client: FairWorkClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );
    global.fetch = fetchMock as unknown as typeof fetch;
    client = createClient(TEST_CONFIG);
  });

  it('should create a client instance', () => {
    expect(client).toBeInstanceOf(Object);
    expect(client).toHaveProperty('validatePayRate');
  });

  describe('validatePayRate', () => {
    it('validates pay rate', async () => {
      const mockResponse = {
        data: {
          isValid: true,
          minimumRate: 25.5,
          difference: 4.5,
        },
      };

      fetchMock.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await client.validatePayRate({
        rate: 30.0,
        awardCode: 'MA000001',
        classificationCode: 'L1',
      });

      expect(result).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        `${TEST_CONFIG.apiUrl}/rates/validate`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_CONFIG.apiKey}`,
            'X-Environment': TEST_CONFIG.environment,
          },
        }),
      );
    });

    it('should handle validation errors', async () => {
      const errorResponse = {
        code: 'INVALID_RATE',
        message: 'Rate is below minimum wage',
      };

      fetchMock.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve(errorResponse),
        })
      );

      await expect(
        client.validatePayRate({
          rate: 15.0,
          awardCode: 'MA000001',
          classificationCode: 'L1',
        }),
      ).rejects.toMatchObject({
        code: 'INVALID_RATE',
        status: 400,
      });
    });
  });

  describe('getActiveAwards', () => {
    it('should fetch active awards successfully', async () => {
      const mockAwards: Award[] = [
        {
          code: 'MA000001',
          name: 'Manufacturing Award',
          effectiveFrom: '2025-01-01',
          classifications: [
            {
              code: 'L1',
              name: 'Level 1',
              level: '1',
              baseRate: 25.0,
              effectiveFrom: '2025-01-01',
            },
          ],
        },
      ];

      fetchMock.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAwards),
        })
      );

      const result = await client.getActiveAwards();

      expect(result).toEqual(mockAwards);
      expect(fetchMock).toHaveBeenCalledWith(
        `${TEST_CONFIG.apiUrl}/awards/active`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_CONFIG.apiKey}`,
            'X-Environment': TEST_CONFIG.environment,
          },
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      fetchMock.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      await expect(client.getActiveAwards()).rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      const client = createClient({ ...TEST_CONFIG, timeout: 1 });

      fetchMock.mockImplementationOnce(() => new Promise((resolve) => setTimeout(resolve, 100)));

      await expect(client.getActiveAwards()).rejects.toThrow('AbortError');
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        code: 'UNAUTHORIZED',
        message: 'Invalid API key',
      };

      fetchMock.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve(errorResponse),
        })
      );

      await expect(client.getActiveAwards()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        status: 401,
      });
    });
  });
});
