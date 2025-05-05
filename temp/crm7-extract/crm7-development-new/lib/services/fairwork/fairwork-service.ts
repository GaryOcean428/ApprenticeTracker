import { BaseService, type ServiceOptions, type IBaseService } from '@/lib/utils/service';
import { createLogger } from '../logger';
import { type FairWorkApiClient } from './api-client';
import type { Award, Classification, ClassificationHierarchy, PayRate, RateTemplate } from './fairwork.types';
import { CacheService } from '../cache/cache-service';

const logger = createLogger('FairWorkService');
const CACHE_CONFIG = {
  prefix: 'fairwork',
  ttl: 3600,
};

export interface FairWorkService extends IBaseService {
  getActiveAwards(): Promise<Award[]>;
  getAward(code: string): Promise<Award | null>;
  getCurrentRates(): Promise<PayRate[]>;
  getRatesForDate(date: Date): Promise<PayRate[]>;
  getClassifications(awardCode: string): Promise<Classification[]>;
  getClassificationHierarchy(): Promise<ClassificationHierarchy | null>;
  calculateRate(template: RateTemplate): Promise<number>;
}

export class FairWorkServiceImpl extends BaseService implements FairWorkService {
  private readonly cache: CacheService;

  constructor(
    private readonly apiClient: FairWorkApiClient,
    options: ServiceOptions = {}
  ) {
    super('FairWorkService', '1.0.0', options);
    this.cache = new CacheService(CACHE_CONFIG);
  }

  private static parseDateFields<T extends { effectiveFrom: string; effectiveTo?: string }>(
    items: T[]
  ): T[] {
    return items.map((item) => ({
      ...item,
      effectiveFrom: new Date(item.effectiveFrom),
      effectiveTo: item.effectiveTo ? new Date(item.effectiveTo) : undefined,
    }));
  }

  private async handleApiCall<T>(apiCall: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      logger.error(errorMessage, error as Error);
      throw error;
    }
  }

  async getActiveAwards(): Promise<Award[]> {
    return this.handleApiCall(async () => {
      const awards = await this.apiClient.getActiveAwards();
      return FairWorkServiceImpl.parseDateFields(awards);
    }, 'Failed to get active awards');
  }

  async getAward(code: string): Promise<Award | null> {
    return this.handleApiCall(async () => {
      const award = await this.apiClient.getAward(code);
      return award ? FairWorkServiceImpl.parseDateFields([award])[0] : null;
    }, 'Failed to get award');
  }

  async getCurrentRates(): Promise<PayRate[]> {
    return this.handleApiCall(async () => {
      const rates = await this.apiClient.getCurrentRates();
      return FairWorkServiceImpl.parseDateFields(rates);
    }, 'Failed to get current rates');
  }

  async getRatesForDate(date: Date): Promise<PayRate[]> {
    return this.handleApiCall(async () => {
      const rates = await this.apiClient.getRatesForDate(date.toISOString());
      return FairWorkServiceImpl.parseDateFields(rates);
    }, 'Failed to get rates for date');
  }

  async getClassifications(awardCode: string): Promise<Classification[]> {
    const key = `classifications:${awardCode}`;
    const classifications = await this.cache.getOrSet(key, async () => 
      await this.apiClient.getClassifications()
    );
    return classifications || [];
  }

  async getClassificationHierarchy(): Promise<ClassificationHierarchy | null> {
    return this.handleApiCall(
      () => this.apiClient.getClassificationHierarchy(),
      'Failed to get classification hierarchy'
    );
  }

  async calculateRate(template: RateTemplate): Promise<number> {
    return this.executeServiceMethod('calculateRate', async () => {
      const rates = await this.getCurrentRates();
      // Simple calculation for now
      return template.baseRate * (1 + (template.baseMargin || 0));
    });
  }

  public getMetrics(): Record<string, unknown> | null {
    const baseMetrics = super.getMetrics();
    if (!baseMetrics) return null;

    return {
      ...baseMetrics,
      cacheStats: {},
      apiStats: {}
    };
  }

  public resetMetrics(): void {
    // No-op for now since cache and client don't support metrics yet
  }
}

export const FairWorkService = FairWorkServiceImpl;
export default FairWorkServiceImpl;
