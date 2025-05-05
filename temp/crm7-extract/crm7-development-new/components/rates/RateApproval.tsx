import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/lib/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import type { RateTemplate } from '@/lib/types/rates';

interface RateApprovalProps {
  org_id: string;
  onApprove?: (template: RateTemplate) => void;
  onReject?: (template: RateTemplate) => void;
}

export default function RateApproval({
  org_id,
  onApprove,
  onReject,
}: RateApprovalProps): JSX.Element {
  const supabase = createClient();
  const { user } = useUser();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<RateTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingTemplates = useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('rate_templates')
        .select('*')
        .eq('org_id', org_id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false });

      if (typeof error !== "undefined" && error !== null) {
        toast({
          variant: 'destructive',
          title: 'Fetch Error',
          description: error.message,
        });
        return;
      }

      setTemplates(data as RateTemplate[]);
    } catch (error) {
      console.error('Error fetching pending templates:', error);
      setError('Failed to load pending templates');
      toast({
        title: 'Error',
        description: 'Failed to load pending templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [org_id, supabase, toast]);

  const handleApprove = useCallback(
    async (template: RateTemplate) => {
      try {
        await supabase
          .from('rate_templates')
          .update({
            status: 'active',
            updated_by: user?.id,
          })
          .eq('id', template.id);

        toast({
          title: 'Success',
          description: 'Rate template approved successfully',
        });

        setTemplates((prev) => prev.filter((t) => t.id !== template.id));
        onApprove?.(template);
      } catch (error) {
        console.error('Error approving template:', error);
        toast({
          title: 'Error',
          description: 'Failed to approve template',
          variant: 'destructive',
        });
      }
    },
    [onApprove, supabase, toast, user],
  );

  const handleReject = useCallback(
    async (template: RateTemplate) => {
      try {
        await supabase
          .from('rate_templates')
          .update({
            status: 'archived',
            updated_by: user?.id,
          })
          .eq('id', template.id);

        toast({
          title: 'Success',
          description: 'Rate template rejected successfully',
        });

        setTemplates((prev) => prev.filter((t) => t.id !== template.id));
        onReject?.(template);
      } catch (error) {
        console.error('Error rejecting template:', error);
        toast({
          title: 'Error',
          description: 'Failed to reject template',
          variant: 'destructive',
        });
      }
    },
    [onReject, supabase, toast, user],
  );

  useEffect((): void => {
    fetchPendingTemplates();
  }, [org_id, fetchPendingTemplates]);

  if (typeof loading !== "undefined" && loading !== null) return <div>Loading pending templates...</div>;
  if (typeof error !== "undefined" && error !== null) return <div className="text-red-500">{error}</div>;
  if (!templates.length) return <div>No pending templates to approve</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Pending Rate Templates</h2>
      <div className="divide-y">
        {templates.map((template) => (
          <div key={template.id} className="py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-gray-500">{template.description}</p>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Base Rate:</span>
                  <span>${template.baseRate}</span>
                  <span className="text-gray-500">Base Margin:</span>
                  <span>{template.baseMargin}%</span>
                  <span className="text-gray-500">Super Rate:</span>
                  <span>{template.superRate}%</span>
                  <span className="text-gray-500">Template Type:</span>
                  <span className="capitalize">{template.templateType}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={(): Promise<void> => handleReject(template)}
                className="rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
              >
                Reject
              </button>
              <button
                onClick={(): Promise<void> => handleApprove(template)}
                className="rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200"
              >
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
