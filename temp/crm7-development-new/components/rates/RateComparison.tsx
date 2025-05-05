import { useState, useEffect } from 'react';
import { type RateTemplate } from '@/lib/types/rates';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';

interface RateComparisonProps {
  orgId: string;
}

export function RateComparison({ orgId }: RateComparisonProps): JSX.Element {
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<RateTemplate[]>([]);

  useEffect((): void => {
    const fetchTemplates = async (): Promise<void> => {
      try {
        const { data, error } = await supabase
          .from('rate_templates')
          .select('*')
          .eq('org_id', orgId)
          .eq('status', 'active');

        if (typeof error !== "undefined" && error !== null) throw error;
        setTemplates(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchTemplates();
  }, [orgId, supabase, toast]);

  if (typeof loading !== "undefined" && loading !== null) return <div>Loading templates...</div>;
  if (typeof error !== "undefined" && error !== null) return <div className="text-red-500">{error}</div>;
  if (!templates.length) return <div>No templates available for comparison</div>;

  return (
    <div className="space-y-6">
      {/* Component implementation */}
    </div>
  );
}
