import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { env } from '@/lib/config/environment';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as getRates } from '../[awardCode]/[classificationCode]/rates/route';
import { POST as validateRate } from '../[awardCode]/[classificationCode]/validate/route';

vi.mock('@/lib/services/fairwork/fairwork-client');
vi.mock('@/lib/logger');

const TEST_URL = `http://${env.HOST}:${env.PORT}`;

describe('FairWork API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/fairwork/[awardCode]/[classificationCode]/rates', () => {
    it('should return rates for valid params', async () => {
      const mockAward = {
        code: 'TEST001',
        name: 'Test Award',
        industry: 'Test Industry',
        effectiveFrom: '2024-01-01',
        classifications: []
      };

      vi.mocked(FairWorkClient.prototype.getAward).mockResolvedValueOnce(mockAward);

      const request = new NextRequest(new URL('http://test.com'));
      const context = {
        params: Promise.resolve({ 
          awardCode: 'MA000001', 
          classificationCode: 'L1' 
        }),
      };

      const response = await getRates(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockAward });
    });
  });

  describe('POST /api/fairwork/[awardCode]/[classificationCode]/validate', () => {
    it('should validate rate successfully', async () => {
      const mockValidation = {
        isValid: true,
        minimumRate: 25.5,
        difference: 4.5
      };

      vi.mocked(FairWorkClient.prototype.validatePayRate).mockResolvedValueOnce(mockValidation);

      const request = new NextRequest(
        new URL('http://test.com'),
        {
          method: 'POST',
          body: JSON.stringify({ rate: 27.5 }),
        }
      );

      const context = {
        params: Promise.resolve({ 
          awardCode: 'MA000001', 
          classificationCode: 'L1' 
        }),
      };

      const response = await validateRate(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockValidation });
    });
  });
});
