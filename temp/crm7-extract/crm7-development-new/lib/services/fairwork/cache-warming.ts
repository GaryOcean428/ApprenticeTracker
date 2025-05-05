import { CacheService } from '../cache/cache-service';
import { logger } from '@/lib/logger';
import type { FairWorkService } from './fairwork-service';

interface CacheWarmingConfig {
  interval: number;
  maxConcurrent: number;
  retryDelay: number;
}

const CACHE_CONFIG = {
  prefix: 'fairwork',
  ttl: 3600,
};

export class FairWorkCacheWarming {
  private readonly cache: CacheService;
  private readonly fairWorkService: FairWorkService;
  private isWarming = false;

  constructor(fairWorkService: FairWorkService, config: CacheWarmingConfig) {
    this.fairWorkService = fairWorkService;
    this.cache = new CacheService(CACHE_CONFIG);
  }

  async warmClassifications(params: Record<string, unknown>): Promise<void> {
    try {
      const key = `classifications:${JSON.stringify(params)}`;
      await this.cache.getOrSet(key, () => 
        this.fairWorkService.getClassifications(params.awardCode as string)
      );
    } catch (error) {
      logger.error('Failed to warm classifications cache:', { error });
    }
  }

  async warmRates(params: Record<string, unknown>): Promise<void> {
    try {
      const key = `rates:${JSON.stringify(params)}`;
      await this.cache.getOrSet(key, () => 
        this.fairWorkService.getCurrentRates()
      );
    } catch (error) {
      logger.error('Failed to warm rates cache:', { error });
    }
  }

  async warmFutureRates(params: Record<string, unknown>): Promise<void> {
    try {
      const key = `future-rates:${JSON.stringify(params)}`;
      const date = params.date as string;
      await this.cache.getOrSet(key, () => 
        this.fairWorkService.getRatesForDate(new Date(date))
      );
    } catch (error) {
      logger.error('Failed to warm future rates cache:', { error });
    }
  }
}
