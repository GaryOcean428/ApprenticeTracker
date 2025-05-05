'use client';

import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { RateTemplate } from '@/lib/types/rates';
import { useRateValidation } from '@/hooks/use-rate-validation';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';

interface RateCalculatorProps {
  orgId?: string;
  onCalculate?: (totalAmount: number) => void;
}

function RateCalculatorContent({ orgId, onCalculate }: RateCalculatorProps): React.ReactElement {
  const [templates, setTemplates] = useState<RateTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseClient = createClient();
  const { toast } = useToast();
  const { validateRate, isValidating, error: validationError } = useRateValidation();

  const calculateRate = async (template: RateTemplate): Promise<void> => {
    try {
      const baseAmount = template.baseRate;
      const superAmount = baseAmount * (template.superRate / 100);
      const leaveAmount = baseAmount * (template.leaveLoading / 100);
      const workersCompAmount = baseAmount * (template.workersCompRate / 100);
      const payrollTaxAmount = baseAmount * (template.payrollTaxRate / 100);
      const trainingAmount = baseAmount * (template.trainingCostRate / 100);
      const otherAmount = baseAmount * (template.otherCostsRate / 100);

      const totalAmount = Number(
        (
          baseAmount +
          superAmount +
          leaveAmount +
          workersCompAmount +
          payrollTaxAmount +
          trainingAmount +
          otherAmount
        ).toFixed(2)
      );

      onCalculate?.(totalAmount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate rate';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  useEffect((): void => {
    const fetchTemplates = async (): Promise<void> => {
      try {
        const { data, error } = await supabaseClient
          .from('rate_templates')
          .select('*')
          .eq('org_id', orgId)
          .eq('status', 'active');

        if (error) throw error;

        setTemplates(data || []);
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
  }, [orgId, supabaseClient, toast]);

  if (loading) return <div>Loading templates...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {templates.map((template) => (
        <div key={template.id} className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold">{template.name}</h3>
          <p className="text-sm text-muted-foreground">{template.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">Base Rate:</span>
              <span className="ml-2">${template.baseRate.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-sm font-medium">Super Rate:</span>
              <span className="ml-2">{template.superRate}%</span>
            </div>
            {/* Add more rate details as needed */}
          </div>
          <button
            onClick={() => void calculateRate(template)}
            disabled={isValidating}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? 'Validating...' : 'Calculate Rate'}
          </button>
          {validationError && <p className="mt-2 text-sm text-red-500">{validationError}</p>}
        </div>
      ))}
    </div>
  );
}

export function RateCalculator(props: RateCalculatorProps): JSX.Element {
  return (
    <ErrorBoundary>
      <RateCalculatorContent {...props} />
    </ErrorBoundary>
  );
}
