/**
 * RateTemplateComparison component
 * Displays a side-by-side comparison of two rate templates
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { ReloadIcon, ArrowRightIcon } from '@radix-ui/react-icons';

import { useEnhancedRates } from '@/hooks/use-enhanced-rates';

interface RateTemplateComparisonProps {
  orgId: string;
  availableTemplates: Array<{ id: string; name: string }>;
}

export function RateTemplateComparison({ orgId, availableTemplates }: RateTemplateComparisonProps) {
  const [baseTemplateId, setBaseTemplateId] = useState<string>('');
  const [compareTemplateId, setCompareTemplateId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('fields');
  const { toast } = useToast();
  
  const {
    compareTemplates,
    loading
  } = useEnhancedRates({ orgId });
  
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  
  async function handleCompare() {
    if (!baseTemplateId || !compareTemplateId) {
      toast({
        title: 'Selection required',
        description: 'Please select two templates to compare',
        variant: 'destructive'
      });
      return;
    }
    
    if (baseTemplateId === compareTemplateId) {
      toast({
        title: 'Invalid selection',
        description: 'Please select different templates to compare',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const result = await compareTemplates(baseTemplateId, compareTemplateId);
      setComparisonResult(result);
    } catch (error) {
      console.error('Error comparing templates:', error);
      toast({
        title: 'Comparison failed',
        description: 'Could not compare the selected templates',
        variant: 'destructive'
      });
    }
  }
  
  // Format percentage with "+" prefix for positive numbers
  function formatPercentage(value: number) {
    return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  }
  
  // Get display name for field
  function getFieldDisplayName(fieldName: string): string {
    const fieldNameMap: Record<string, string> = {
      baseRate: 'Base Rate',
      baseMargin: 'Base Margin',
      superRate: 'Superannuation Rate',
      leaveLoading: 'Leave Loading',
      workersCompRate: 'Workers Comp Rate',
      payrollTaxRate: 'Payroll Tax Rate',
      trainingCostRate: 'Training Cost Rate',
      otherCostsRate: 'Other Costs Rate',
      fundingOffset: 'Funding Offset',
      casualLoading: 'Casual Loading'
    };
    
    return fieldNameMap[fieldName] || fieldName;
  }
  
  // Get severity className based on difference percentage
  function getSeverityClass(percentDiff: number): string {
    if (Math.abs(percentDiff) < 3) return 'text-green-600';
    if (Math.abs(percentDiff) < 10) return 'text-amber-600';
    return 'text-red-600 font-bold';
  }
  
  // Get background color for difference visualization
  function getDifferenceBackgroundStyle(percentDiff: number) {
    if (percentDiff === 0) return {};
    
    const absValue = Math.min(Math.abs(percentDiff), 50); // Cap at 50% for visualization
    const intensity = (absValue / 50) * 100;
    
    if (percentDiff > 0) {
      return { background: `linear-gradient(90deg, rgba(220, 252, 231, 0) 0%, rgba(22, 163, 74, ${intensity / 100}) 100%)` };
    } else {
      return { background: `linear-gradient(90deg, rgba(254, 226, 226, 0) 0%, rgba(220, 38, 38, ${intensity / 100}) 100%)` };
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rate Template Comparison</CardTitle>
        <CardDescription>Compare any two rate templates to analyze differences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Base Template</label>
            <Select value={baseTemplateId} onValueChange={setBaseTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end justify-center py-2">
            <ArrowRightIcon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Compare Template</label>
            <Select value={compareTemplateId} onValueChange={setCompareTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={handleCompare} disabled={loading.compareTemplates}>
          {loading.compareTemplates ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Comparing...
            </>
          ) : (
            'Compare Templates'
          )}
        </Button>
        
        {comparisonResult && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Comparison Results</h3>
                <p className="text-sm text-muted-foreground">
                  Overall difference: {formatPercentage(comparisonResult.differencePercent)}
                </p>
              </div>
              
              <Badge variant={comparisonResult.differencePercent > 10 ? 'destructive' : 'outline'}>
                {comparisonResult.differences.length} differences found
              </Badge>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="fields">Field Comparison</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="visualization">Visualization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="fields">
                <Card>
                  <CardContent className="p-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Base Value</TableHead>
                          <TableHead>Compare Value</TableHead>
                          <TableHead>Difference</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonResult.differences.map((diff: any) => (
                          <TableRow key={diff.field}>
                            <TableCell>{getFieldDisplayName(diff.field)}</TableCell>
                            <TableCell>{diff.baseValue}</TableCell>
                            <TableCell>{diff.compareValue}</TableCell>
                            <TableCell className={getSeverityClass(diff.differencePercent)}>
                              {formatPercentage(diff.differencePercent)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="summary">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Significant Changes</h4>
                      {comparisonResult.summary.significantChanges.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {comparisonResult.summary.significantChanges.map((field: string) => (
                            <li key={field} className="text-red-600">
                              {getFieldDisplayName(field)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No significant changes detected
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Cost Impact Analysis</h4>
                      <p className="text-sm">
                        The total cost difference is approximately{' '}
                        <span className={getSeverityClass(comparisonResult.differencePercent)}>
                          {formatPercentage(comparisonResult.differencePercent)}
                        </span>
                        {' '}which could have a{' '}
                        {Math.abs(comparisonResult.differencePercent) < 5 
                          ? 'minimal' 
                          : Math.abs(comparisonResult.differencePercent) < 15
                            ? 'moderate'
                            : 'significant'}{' '}
                        impact on overall rates.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="visualization">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {comparisonResult.differences.map((diff: any) => (
                        <div key={diff.field} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{getFieldDisplayName(diff.field)}</span>
                            <span className={getSeverityClass(diff.differencePercent)}>
                              {formatPercentage(diff.differencePercent)}
                            </span>
                          </div>
                          <div className="h-6 w-full rounded-full bg-muted overflow-hidden relative">
                            <div className="h-full w-full" style={getDifferenceBackgroundStyle(diff.differencePercent)}>
                              <div className="absolute top-0 left-1/2 h-full w-[2px] bg-black/20 transform -translate-x-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
