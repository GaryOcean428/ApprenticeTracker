import { FairWorkClient } from './fairwork-client';
import type { Allowance } from './fairwork.types';
import { env } from '@/lib/config/environment';

export async function getAllowances(awardCode: string, date: string): Promise<Allowance[]> {
  const client = new FairWorkClient({
    apiKey: env.FAIRWORK_API_KEY,
    apiUrl: env.FAIRWORK_API_URL,
    environment: env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    timeout: 5000,
  });

  return client.getAllowances(awardCode, { date });
}
