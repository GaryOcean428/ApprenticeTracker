import type { FairWorkService } from '@/lib/services/fairwork/index';
import { RateServiceImpl } from './index';
import type { RatesService } from './types';

export const ratesService: RatesService = new RateServiceImpl({} as FairWorkService);
