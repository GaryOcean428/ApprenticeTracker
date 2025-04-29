import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ratesService } from '@/lib/services/rates';

interface RateCalculation {
  id: string;
  rate: number;
  multiplier: number;
  result: number;
}

interface BulkRateCalculatorProps {
  orgId?: string;
}

interface CalculationResult {
  success: boolean;
  error?: string;
  result?: number;
}

interface BulkCalculationResult {
  [key: string]: CalculationResult;
}

interface Template {
  id: string;
}

interface Calculation {
  id: string;
  createdAt: string;
  status: string;
  results: {
    templateId: string;
    rate: number;
  }[];
}

interface QueryResult<T> {
  data: T[];
}

export function BulkRateCalculator({ orgId = 'default-org' }: BulkRateCalculatorProps): React.ReactElement {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templatesData } = useQuery<QueryResult<Template>>({
    queryKey: ['templates', orgId],
    queryFn: async () => {
      const result = await ratesService.getTemplates({ org_id: orgId });
      return { data: Array.isArray(result) ? result : [] };
    }
  });

  const { data: calculationsData, isLoading } = useQuery<QueryResult<Calculation>>({
    queryKey: ['bulk-calculations', orgId],
    queryFn: async () => {
      const result = await ratesService.getBulkCalculations({ org_id: orgId });
      return { data: Array.isArray(result) ? result : [] };
    }
  });

  const calculateRate = (baseRate: number, multiplier: number): CalculationResult => {
    try {
      if (baseRate <= 0 || multiplier <= 0) {
        return {
          success: false,
          error: 'Base rate and multiplier must be positive numbers',
        };
      }

      const result = baseRate * multiplier;
      return {
        success: true,
        result,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid calculation',
      };
    }
  };

  const createCalculation = useMutation({
    mutationFn: async () => {
      if (!templatesData) {
        throw new Error('No templates available');
      }
      const templateIds = templatesData.data.slice(0, 2).map((t: Template) => t.id);
      const calculations: BulkCalculationResult = {};
      templateIds.forEach((templateId: string) => {
        const baseRate = 100;
        const multiplier = 1.5;
        calculations[templateId] = calculateRate(baseRate, multiplier);
      });
      return ratesService.createBulkCalculation({
        org_id: orgId,
        templateIds,
        calculations,
      });
    },
    onSuccess: (response) => {
      queryClient.setQueryData(['bulk-calculations', orgId], (old: any) => ({
        data: old ? [...old, response] : [response],
      }));
      toast({
        title: 'Success',
        description: 'Calculation created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create calculation',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Bulk Rate Calculations</h2>
          <Button 
            onClick={(): void => createCalculation.mutate()}
            disabled={isLoading || createCalculation.isPending}
          >
            New Calculation
          </Button>
        </div>

        <div className="space-y-4">
          {calculationsData?.data.map((calc: Calculation) => (
            <Card key={calc.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Calculation {calc.id}</h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(calc.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Status: {calc.status}</p>
                </div>
                {calc.status === 'completed' && <Button variant="outline">View Results</Button>}
              </div>
              {Array.isArray(calc.results) && calc.results.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-semibold">Results</h4>
                  <ul className="space-y-1">
                    {calc.results.map((result) => (
                      <li
                        key={`${calc.id}-${result.templateId}`}
                        className="flex items-center justify-between"
                      >
                        <span>Template {result.templateId}</span>
                        <span className="font-medium">${result.rate.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>No rates calculated</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
