/* eslint-disable */
/* webhint-disable no-inline-styles */
/**
 * RateComplianceValidator component
 * Shows validation results for rate template compliance
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ReloadIcon, CheckCircledIcon, CrossCircledIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEnhancedRates } from '@/hooks/use-enhanced-rates';
import type { ExtendedValidationResult } from '@/lib/services/rates/enhanced-types';

interface RateComplianceValidatorProps {
  readonly orgId: string;
  readonly availableTemplates: ReadonlyArray<{ id: string; name: string }>;
}

export function RateComplianceValidator({ orgId, availableTemplates }: RateComplianceValidatorProps): JSX.Element {
  const [templateId, setTemplateId] = useState<string>('');
  const { toast } = useToast();
  
  const {
    validateCompliance,
    loading
  } = useEnhancedRates({ orgId });
  
  const [validationResult, setValidationResult] = useState<ExtendedValidationResult | null>(null);
  
  async function handleValidate(): Promise<void> {
    if (!templateId) {
      toast({
        title: 'Selection required',
        description: 'Please select a template to validate',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const result = (await validateCompliance(templateId)) as ExtendedValidationResult;
      setValidationResult(result);
    } catch (error) {
      console.error('Error validating template:', error);
      toast({
        title: 'Validation failed',
        description: 'Could not validate the selected template',
        variant: 'destructive'
      });
    }
  }
  
  // Format currency
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(value);
  }
  
  // Render compliance status icon
  function renderStatusIcon(status: string): JSX.Element | null {
    switch (status) {
    case 'compliant':
      return <CheckCircledIcon className="h-6 w-6 text-green-500" />;
    case 'warning':
      return <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />;
    case 'non-compliant':
      return <CrossCircledIcon className="h-6 w-6 text-red-500" />;
    default:
      return null;
    }
  }
  
  // Render compliance status badge
  function renderStatusBadge(status: string): JSX.Element | null {
    switch (status) {
    case 'compliant':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Compliant</Badge>;
    case 'warning':
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">Warning</Badge>;
    case 'non-compliant':
      return <Badge variant="destructive">Non-Compliant</Badge>;
    default:
      return null;
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rate Compliance Validator</CardTitle>
        <CardDescription>Validate a rate template against award requirements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="template-select" className="text-sm font-medium">Select Template</label>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger id="template-select">
              <SelectValue placeholder="Select a template to validate" />
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
        
        <Button onClick={() => { void handleValidate(); }} disabled={!!loading.validateCompliance}>
          {loading.validateCompliance ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            'Validate Compliance'
          )}
        </Button>
        
        {validationResult && (
          <div className="mt-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {renderStatusIcon(validationResult.complianceStatus)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Compliance Result</h3>
                  {renderStatusBadge(validationResult.complianceStatus)}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  Validated against {validationResult.awardCode} ({validationResult.levelCode})
                  on {new Date(validationResult.validationTime).toLocaleString()}
                </p>
                
                {validationResult.isValid ? (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircledIcon className="h-4 w-4" />
                    <AlertTitle>Award rate compliant</AlertTitle>
                    <AlertDescription>
                      This rate is above the minimum rate of {formatCurrency(validationResult.minimumRate)}.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <CrossCircledIcon className="h-4 w-4" />
                    <AlertTitle>Award rate non-compliant</AlertTitle>
                    <AlertDescription>
                      This rate is below the minimum rate of {formatCurrency(validationResult.minimumRate)}.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Rate Analysis</h4>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Minimum award rate</span>
                  <span className="font-medium">{formatCurrency(validationResult.minimumRate)}</span>
                </div>
                
                <div className="flex justify-between mb-4">
                  <span className="text-sm font-semibold">Template rate</span>
                  <span className="font-semibold">
                    {formatCurrency(validationResult.minimumRate + validationResult.difference)}
                  </span>
                </div>
                
                <div className="relative pt-5">
                  {/* Minimum rate marker */}
                  <div className="absolute top-0 left-0 text-xs text-muted-foreground">
                    Minimum
                  </div>
                  
                  {/* Current rate marker */}
                  <div
                    className="absolute top-0 text-xs text-muted-foreground"
                    style={{
                      left: `${Math.min(100, Math.max(0, 
                        ((validationResult.minimumRate + validationResult.difference) / 
                        (validationResult.minimumRate * 1.5)) * 100
                      ))}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    Current
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    {/* Minimum marker */}
                    <div className="h-full w-[1px] bg-red-500 absolute left-0"></div>
                    
                    {/* Rate above minimum */}
                    <div
                      className={`h-full ${
                        validationResult.difference >= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(0, 
                          ((validationResult.minimumRate + Math.max(0, validationResult.difference)) / 
                          (validationResult.minimumRate * 1.5)) * 100
                        ))}%`
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-sm mt-2">
                  {validationResult.difference >= 0 ? (
                    <span className="text-green-600">
                      {formatCurrency(validationResult.difference)} above minimum
                    </span>
                  ) : (
                    <span className="text-red-600 font-bold">
                      {formatCurrency(Math.abs(validationResult.difference))} below minimum
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Additional Checks</h4>
                <ul className="space-y-2">
                  {validationResult.additionalChecks.map((check: any) => (
                    <li key={check.name} className="flex items-center gap-2">
                      {check.passed ? (
                        <CheckCircledIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <CrossCircledIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className={check.passed ? 'text-sm' : 'text-sm text-red-600'}>
                        {check.message || check.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4 text-xs text-muted-foreground">
        <div>
          Data sourced from FairWork API
        </div>
        <div>
          Last updated: April 2025
        </div>
      </CardFooter>
    </Card>
  );
}
