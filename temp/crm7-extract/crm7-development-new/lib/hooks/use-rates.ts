import { useQuery } from '@tanstack/react-query';
import { ratesService } from '@/lib/services/rates';
import type { RateTemplate } from '@/lib/types/rates';

interface TemplateResponse {
  data: RateTemplate[];
}

export function useRates(orgId: string) {
  return useQuery<RateTemplate[]>({
    queryKey: ['rates', orgId],
    queryFn: async () => {
      const result = await ratesService.getTemplates({ org_id: orgId });
      const response = result as unknown as TemplateResponse;
      if (!response?.data) {
        throw new Error('Invalid response from rates service');
      }
      return response.data;
    },
  });
}
