import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Calculator, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { AwardSelector } from '@/components/awards/AwardSelector';
import { ChargeRateVisualizer } from '@/components/rates/ChargeRateVisualizer';
import { MainLayout } from '@/components/layout/MainLayout';

// Default configuration values
const DEFAULT_COST_CONFIG = {
  superRate: 0.115, // 11.5%
  wcRate: 0.03, // 3%
  payrollTaxRate: 0.05, // 5%
  leaveLoading: 0.175, // 17.5%
  studyCost: 2500, // $2,500 per year
  ppeCost: 550, // $550 per year
  adminRate: 0.10, // 10%
  defaultMargin: 0.15, // 15%
  adverseWeatherDays: 5, // 5 days per year
};

const DEFAULT_WORK_CONFIG = {
  hoursPerDay: 7.6, // 7.6 hours per day (38 hour week)
  daysPerWeek: 5, // 5 days per week
  weeksPerYear: 52, // 52 weeks per year
  annualLeaveDays: 20, // 20 days per year
  publicHolidays: 10, // 10 days per year
  sickLeaveDays: 10, // 10 days per year
  trainingWeeks: 6, // 6 weeks per year
};

const DEFAULT_BILLABLE_OPTIONS = {
  includeAnnualLeave: false,
  includePublicHolidays: false,
  includeSickLeave: false,
  includeTrainingTime: false,
  includeAdverseWeather: false,
};

// Form schema
const formSchema = z.object({
  apprenticeId: z.number().int().positive({ message: 'Please select an apprentice' }),
  hostEmployerId: z.number().int().positive({ message: 'Please select a host employer' }),
  payRate: z.number().positive({ message: 'Pay rate must be greater than zero' }),
  awardId: z.number().int().positive().optional(),
  classificationId: z.number().int().positive().optional(),
  awardName: z.string().optional(),
  classificationName: z.string().optional(),
  customMargin: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
});

export default function CreateChargeRatePage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('apprentice');
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [selectedAward, setSelectedAward] = useState<any>(null);
  const [selectedClassification, setSelectedClassification] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Define apprentice and host employer types
  interface Apprentice {
    id: number;
    firstName: string;
    lastName: string;
    tradeType?: string;
  }

  interface HostEmployer {
    id: number;
    companyName?: string;
    businessName?: string;
  }

  // Fetch apprentices
  const { data: apprentices } = useQuery<any, Error, Apprentice[]>({
    queryKey: ['/api/apprentices'],
    select: (data: any) => data?.data || [],
  });
  
  // Fetch host employers
  const { data: hostEmployers } = useQuery<any, Error, HostEmployer[]>({
    queryKey: ['/api/host-employers'],
    select: (data: any) => data?.data || [],
  });
  
  // Set up form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payRate: 25.0,
      customMargin: DEFAULT_COST_CONFIG.defaultMargin,
      notes: '',
    },
  });
  
  // Watch form values for real-time calculation
  const watchedValues = form.watch();
  
  // Mutation for saving calculation
  const saveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest('POST', '/api/payroll/charge-rates', data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/charge-rates'] });
      toast({
        title: 'Calculation Saved',
        description: 'The charge rate calculation has been saved successfully.',
      });
      navigate(`/charge-rates/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save calculation',
        variant: 'destructive',
      });
    },
  });
  
  // Handle award selection
  const handleAwardSelect = (award: any, classification?: any) => {
    setSelectedAward(award);
    setSelectedClassification(classification);
    
    form.setValue('awardId', award.id);
    form.setValue('awardName', award.name);
    
    if (classification) {
      form.setValue('classificationId', classification.id);
      form.setValue('classificationName', classification.name);
    }
  };
  
  // Calculate charge rate
  const calculateChargeRate = async () => {
    try {
      setIsCalculating(true);
      
      // Validate form
      await form.trigger(['payRate', 'apprenticeId', 'hostEmployerId']);
      
      if (form.formState.errors.payRate || 
          form.formState.errors.apprenticeId || 
          form.formState.errors.hostEmployerId) {
        return;
      }
      
      // Get form values
      const { payRate, awardId, customMargin } = form.getValues();
      
      // Call API to calculate charge rate
      const response = await apiRequest('POST', '/api/payroll/charge-rates/calculate', {
        payRate,
        awardId,
        customMargin: customMargin || DEFAULT_COST_CONFIG.defaultMargin,
        costConfig: DEFAULT_COST_CONFIG,
        workConfig: DEFAULT_WORK_CONFIG,
        billableOptions: DEFAULT_BILLABLE_OPTIONS,
      });
      
      const result = await response.json();
      setCalculationResult(result.data);
      
      // Move to next tab
      setActiveTab('review');
    } catch (error) {
      toast({
        title: 'Calculation Error',
        description: 'An error occurred while calculating the charge rate.',
        variant: 'destructive',
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Helper function for apprentice display text
  const getApprenticeDisplayText = (apprentice: Apprentice) => {
    return `${apprentice.firstName} ${apprentice.lastName} - ${apprentice.tradeType || 'Apprentice'}`;
  };
  
  // Helper function for host employer display text
  const getHostEmployerDisplayText = (hostEmployer: HostEmployer) => {
    return hostEmployer.companyName || hostEmployer.businessName || 'Unknown Host';
  };
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!calculationResult) {
      toast({
        title: 'Calculation Required',
        description: 'Please calculate the charge rate before saving.',
        variant: 'destructive',
      });
      return;
    }
    
    saveMutation.mutate({
      ...data,
      ...calculationResult,
    });
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(value);
  };
  
  // Selected apprentice and host employer
  const selectedApprentice = apprentices?.find((a: Apprentice) => a.id === watchedValues.apprenticeId);
  const selectedHostEmployer = hostEmployers?.find((h: HostEmployer) => h.id === watchedValues.hostEmployerId);
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/charge-rates">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Charge Rates
              </Link>
            </Button>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Charge Rate Calculation</h1>
            <p className="text-muted-foreground mt-1">
              Create a new charge rate calculation for an apprentice and host employer.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Calculation Details</CardTitle>
                <CardDescription>
                  Enter the details needed to calculate the charge rate.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="apprentice">Apprentice & Host</TabsTrigger>
                    <TabsTrigger value="rate">Rate Information</TabsTrigger>
                    <TabsTrigger value="review">Review & Save</TabsTrigger>
                  </TabsList>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <TabsContent value="apprentice">
                        <div className="space-y-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="apprenticeId"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Apprentice</FormLabel>
                                  <Select
                                    value={field.value?.toString()}
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select an apprentice" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {apprentices?.map((apprentice) => (
                                        <SelectItem key={apprentice.id} value={apprentice.id.toString()}>
                                          {getApprenticeDisplayText(apprentice)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Select the apprentice for this charge rate calculation.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="hostEmployerId"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Host Employer</FormLabel>
                                  <Select
                                    value={field.value?.toString()}
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a host employer" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {hostEmployers?.map((hostEmployer) => (
                                        <SelectItem key={hostEmployer.id} value={hostEmployer.id.toString()}>
                                          {getHostEmployerDisplayText(hostEmployer)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Select the host employer for this charge rate calculation.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              type="button" 
                              onClick={() => setActiveTab('rate')}
                              disabled={!form.getValues().apprenticeId || !form.getValues().hostEmployerId}
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="rate">
                        <div className="space-y-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <FormField
                                control={form.control}
                                name="payRate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Pay Rate ($/hour)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      The hourly pay rate for the apprentice.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="customMargin"
                                render={({ field }) => (
                                  <FormItem className="mt-6">
                                    <FormLabel>Margin (%)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
                                        max="1"
                                        {...field}
                                        value={field.value !== undefined ? field.value * 100 : ''}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) / 100)}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      The profit margin percentage to apply to the cost per hour.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div>
                              <FormLabel>Award & Classification</FormLabel>
                              <div className="flex flex-col space-y-2">
                                <AwardSelector 
                                  onAwardSelected={handleAwardSelect}
                                  buttonVariant="outline"
                                  buttonLabel={selectedAward ? 
                                    `${selectedAward.name} - ${selectedClassification?.name || 'No Classification'}` : 
                                    'Select Award & Classification'
                                  }
                                />
                                <FormDescription>
                                  Optionally select an award and classification to apply penalty rates.
                                </FormDescription>
                              </div>
                              
                              <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                  <FormItem className="mt-6">
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Add any additional notes for this calculation"
                                        {...field}
                                        rows={3}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Optional notes that will be saved with this calculation.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="advanced">
                              <AccordionTrigger>
                                <span className="flex items-center">
                                  <Info className="h-4 w-4 mr-2" /> 
                                  Advanced Configuration
                                </span>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 p-2">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Cost Configuration</h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                      <li><span className="text-muted-foreground">Superannuation Rate:</span> {DEFAULT_COST_CONFIG.superRate * 100}%</li>
                                      <li><span className="text-muted-foreground">Workers Comp Rate:</span> {DEFAULT_COST_CONFIG.wcRate * 100}%</li>
                                      <li><span className="text-muted-foreground">Payroll Tax Rate:</span> {DEFAULT_COST_CONFIG.payrollTaxRate * 100}%</li>
                                      <li><span className="text-muted-foreground">Leave Loading:</span> {DEFAULT_COST_CONFIG.leaveLoading * 100}%</li>
                                      <li><span className="text-muted-foreground">Annual Study Cost:</span> {formatCurrency(DEFAULT_COST_CONFIG.studyCost)}</li>
                                      <li><span className="text-muted-foreground">Annual PPE Cost:</span> {formatCurrency(DEFAULT_COST_CONFIG.ppeCost)}</li>
                                      <li><span className="text-muted-foreground">Admin Rate:</span> {DEFAULT_COST_CONFIG.adminRate * 100}%</li>
                                      <li><span className="text-muted-foreground">Adverse Weather Days:</span> {DEFAULT_COST_CONFIG.adverseWeatherDays}</li>
                                    </ul>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Work Configuration</h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                      <li><span className="text-muted-foreground">Hours Per Day:</span> {DEFAULT_WORK_CONFIG.hoursPerDay}</li>
                                      <li><span className="text-muted-foreground">Days Per Week:</span> {DEFAULT_WORK_CONFIG.daysPerWeek}</li>
                                      <li><span className="text-muted-foreground">Weeks Per Year:</span> {DEFAULT_WORK_CONFIG.weeksPerYear}</li>
                                      <li><span className="text-muted-foreground">Annual Leave Days:</span> {DEFAULT_WORK_CONFIG.annualLeaveDays}</li>
                                      <li><span className="text-muted-foreground">Public Holidays:</span> {DEFAULT_WORK_CONFIG.publicHolidays}</li>
                                      <li><span className="text-muted-foreground">Sick Leave Days:</span> {DEFAULT_WORK_CONFIG.sickLeaveDays}</li>
                                      <li><span className="text-muted-foreground">Training Weeks:</span> {DEFAULT_WORK_CONFIG.trainingWeeks}</li>
                                    </ul>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Billable Options</h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                      <li>
                                        <span className="text-muted-foreground">Include Annual Leave:</span> 
                                        <Badge variant="outline" className="ml-2">
                                          {DEFAULT_BILLABLE_OPTIONS.includeAnnualLeave ? 'Yes' : 'No'}
                                        </Badge>
                                      </li>
                                      <li>
                                        <span className="text-muted-foreground">Include Public Holidays:</span>
                                        <Badge variant="outline" className="ml-2">
                                          {DEFAULT_BILLABLE_OPTIONS.includePublicHolidays ? 'Yes' : 'No'}
                                        </Badge>
                                      </li>
                                      <li>
                                        <span className="text-muted-foreground">Include Sick Leave:</span>
                                        <Badge variant="outline" className="ml-2">
                                          {DEFAULT_BILLABLE_OPTIONS.includeSickLeave ? 'Yes' : 'No'}
                                        </Badge>
                                      </li>
                                      <li>
                                        <span className="text-muted-foreground">Include Training Time:</span>
                                        <Badge variant="outline" className="ml-2">
                                          {DEFAULT_BILLABLE_OPTIONS.includeTrainingTime ? 'Yes' : 'No'}
                                        </Badge>
                                      </li>
                                      <li>
                                        <span className="text-muted-foreground">Include Adverse Weather:</span>
                                        <Badge variant="outline" className="ml-2">
                                          {DEFAULT_BILLABLE_OPTIONS.includeAdverseWeather ? 'Yes' : 'No'}
                                        </Badge>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          <div className="flex justify-between">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setActiveTab('apprentice')}
                            >
                              Back
                            </Button>
                            <Button 
                              type="button" 
                              onClick={calculateChargeRate}
                              disabled={isCalculating || !form.getValues().payRate}
                            >
                              {isCalculating ? 'Calculating...' : 'Calculate Charge Rate'}
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="review">
                        <div className="space-y-6 py-4">
                          {calculationResult ? (
                            <>
                              <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>Calculation Result</AlertTitle>
                                <AlertDescription>
                                  Review the calculation results before saving. You can go back to adjust the inputs if needed.
                                </AlertDescription>
                              </Alert>
                              
                              <ChargeRateVisualizer 
                                calculation={calculationResult}
                                apprenticeName={selectedApprentice ? getApprenticeDisplayText(selectedApprentice) : undefined}
                                hostEmployerName={selectedHostEmployer ? getHostEmployerDisplayText(selectedHostEmployer) : undefined}
                                awardName={selectedAward?.name}
                                classificationName={selectedClassification?.name}
                              />
                              
                              <div className="flex justify-between">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setActiveTab('rate')}
                                >
                                  Back
                                </Button>
                                <Button 
                                  type="submit"
                                  disabled={saveMutation.isPending}
                                >
                                  {saveMutation.isPending ? 'Saving...' : 'Save Calculation'}
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-8">
                              <Calculator className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                              <h3 className="text-lg font-medium mb-2">No Calculation Yet</h3>
                              <p className="text-muted-foreground mb-4">
                                Please complete the previous steps and calculate the charge rate first.
                              </p>
                              <Button type="button" onClick={() => setActiveTab('rate')}>
                                Go to Rate Information
                              </Button>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </form>
                  </Form>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Calculation Summary</CardTitle>
                <CardDescription>
                  Information about the current calculation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Apprentice</h3>
                    {selectedApprentice ? (
                      <div className="text-sm">
                        <p className="font-medium">{getApprenticeDisplayText(selectedApprentice)}</p>
                        <p className="text-muted-foreground">
                          Status: {selectedApprentice.status || 'Not specified'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No apprentice selected</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Host Employer</h3>
                    {selectedHostEmployer ? (
                      <div className="text-sm">
                        <p className="font-medium">{getHostEmployerDisplayText(selectedHostEmployer)}</p>
                        <p className="text-muted-foreground">
                          Industry: {selectedHostEmployer.industry || 'Not specified'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No host employer selected</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Award Information</h3>
                    {selectedAward ? (
                      <div className="text-sm">
                        <p className="font-medium">{selectedAward.name}</p>
                        <p className="text-muted-foreground">{selectedAward.code}</p>
                        {selectedClassification && (
                          <Badge className="mt-2">{selectedClassification.name}</Badge>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No award selected</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Rate Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Pay Rate:</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(watchedValues.payRate || 0)}/hr
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Margin:</span>
                        <span className="text-sm font-medium">
                          {((watchedValues.customMargin || DEFAULT_COST_CONFIG.defaultMargin) * 100).toFixed(1)}%
                        </span>
                      </div>
                      {calculationResult && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Cost Per Hour:</span>
                            <span className="text-sm font-medium">
                              {formatCurrency(calculationResult.costPerHour)}/hr
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Charge Rate:</span>
                            <span className="text-sm font-medium text-primary">
                              {formatCurrency(calculationResult.chargeRate)}/hr
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={calculationResult ? 'default' : 'outline'}
                  onClick={calculationResult ? form.handleSubmit(onSubmit) : calculateChargeRate}
                  disabled={saveMutation.isPending || isCalculating}
                >
                  {calculationResult ? 
                    (saveMutation.isPending ? 'Saving...' : 'Save Calculation') : 
                    (isCalculating ? 'Calculating...' : 'Calculate Charge Rate')
                  }
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
