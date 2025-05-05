import { mock } from 'jest-mock-extended';
import { CacheWarming } from '@/lib/services/cache/warming';
import { FairWorkCacheWarming } from '../cache-warming';
import type { FairWorkService } from '../fairwork-service';
import type { Award } from '../types';

vi.mock('@/lib/services/cache/warming', () => ({
  CacheWarming: vi.fn().mockImplementation(() => ({
    register: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
}));

describe('FairWorkCacheWarming', () => {
  let mockFairWorkService: jest.Mocked<FairWorkService>;
  let warming: FairWorkCacheWarming;

  const mockAwards: Award[] = [
    {
      code: 'TEST001',
      name: 'Test Award 1',
      industry: 'Test Industry',
      effectiveFrom: '2024-01-01',
      classifications: [],
    },
    {
      code: 'TEST002',
      name: 'Test Award 2',
      industry: 'Test Industry',
      effectiveFrom: '2024-01-01',
      classifications: [],
    },
  ];

  beforeEach(() => {
    mockFairWorkService = mock<FairWorkService>();
    warming = new FairWorkCacheWarming(mockFairWorkService, {
      interval: 3600000,
      maxConcurrent: 5,
      retryDelay: 1000,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('warms classifications cache', async () => {
    await warming.warmClassifications({ awardCode: 'TEST001' });
    expect(mockFairWorkService.getClassifications).toHaveBeenCalledWith('TEST001');
  });
});
