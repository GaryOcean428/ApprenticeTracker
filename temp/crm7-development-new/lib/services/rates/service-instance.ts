import type { FairWorkService } from '@/lib/services/fairwork/index';
import { createConfiguredRateService } from './config';
import type { RatesService } from './types';
import type { EnhancedRateService } from './enhanced-types';

// Create a configured service instance
export const ratesService: RatesService | EnhancedRateService = createConfiguredRateService(
  {} as FairWorkService,
  {
    enableMetrics: process.env.NODE_ENV === 'production',
    enableActivityTracking: process.env.NODE_ENV === 'production', 
    userId: 'system', // In a real app, you'd get the current user's ID
    orgId: process.env.DEFAULT_ORG_ID // In a real app, this would be contextual
  }
);
