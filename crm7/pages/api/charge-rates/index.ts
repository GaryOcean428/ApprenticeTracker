import { type NextApiRequest, type NextApiResponse } from 'next';
import { type RateTemplate } from '@/lib/types/rates';
import { ratesService } from '@/lib/services/rates';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const template = req.body;
    const result = await ratesService.getTemplates({ org_id: template.org_id });
    if (!result.data.length) {
      res.status(404).json({ error: 'Rate template not found' });
      return;
    }

    const updatedTemplate = await ratesService.updateRateTemplate(template.id, {
      ...template,
      effectiveFrom: new Date().toISOString(),
    });

    res.status(200).json(updatedTemplate);
  } catch (error) {
    console.error('Failed to update rate template:', error);
    res.status(500).json({ error: 'Failed to update rate template' });
  }
}
