import { mock } from 'jest-mock-extended';
import type { PrismaClient } from '@prisma/client';
import { FairWorkService } from '../fairwork-service';
import type { FairWorkApiClient } from '../api-client';
import type { Award, Classification, PayRate } from '../fairwork.types';
import { NoopMetricsService } from '../../metrics-service';

describe('FairWorkService', () => {
  let service: FairWorkService;
  let mockApiClient: jest.Mocked<FairWorkApiClient>;
  let mockMetrics: NoopMetricsService;

  beforeEach(() => {
    mockApiClient = mock<FairWorkApiClient>();
    mockMetrics = new NoopMetricsService();
    service = new FairWorkService(mockApiClient, {
      prisma: {} as PrismaClient,
      metrics: mockMetrics
    });
  });

  describe('getClassifications', () => {
    it('should fetch classifications', async () => {
      const awardCode = 'TEST001';
      const mockClassifications: Classification[] = [
        {
          code: 'L1',
          name: 'Level 1',
          level: '1',
          baseRate: 25.0,
          validFrom: '2024-01-01',
        },
      ];

      mockApiClient.getClassifications.mockResolvedValueOnce(mockClassifications);

      const result = await service.getClassifications(awardCode);

      expect(result).toEqual(mockClassifications);
      expect(mockApiClient.getClassifications).toHaveBeenCalledWith(awardCode);
    });

    it('should handle API errors', async () => {
      const awardCode = 'TEST001';
      mockApiClient.getClassifications.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getClassifications(awardCode)).rejects.toThrow('API Error');
    });
  });
});
