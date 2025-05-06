import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Calculator, Info, Upload, Users, FileCheck, Check } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
import MainLayout from '@/layouts/main-layout';

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
  // Make apprentice and host employer optional
  apprenticeId: z.number().int().positive({ message: 'Please select an apprentice' }).optional(),
  hostEmployerId: z.number().int().positive({ message: 'Please select a host employer' }).optional(),
  leadId: z.number().int().positive({ message: 'Please select a lead' }).optional(),
  payRate: z.number().positive({ message: 'Pay rate must be greater than zero' }),
  rateSource: z.enum(['fairwork', 'enterprise_agreement', 'manual']).default('manual'),
  enterpriseAgreementId: z.number().int().positive().optional(),
  awardId: z.number().int().positive().optional(),
  classificationId: z.number().int().positive().optional(),
  awardName: z.string().optional(),
  classificationName: z.string().optional(),
  customMargin: z.number().min(0).max(1).optional(),
  isTemplate: z.boolean().default(false),
  templateName: z.string().optional(),
  isQuote: z.boolean().default(false),
  isBulkOperation: z.boolean().default(false),
  selectedApprentices: z.array(z.number()).optional(),
  selectedHostEmployers: z.array(z.number()).optional(),
  notes: z.string().optional(),
});

export default function CreateChargeRatePage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('apprentice');
  const [calculationResult, setCalculationResult] = useState(null);
  const [selectedAward, setSelectedAward] = useState(null);
  const [selectedClassification, setSelectedClassification] = useState(null);
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
  const { data: apprentices } = useQuery({
    queryKey: ['/api/apprentices'],
    select: (data) => data?.data || [],
  });
  
  // Fetch host employers
  const { data: hostEmployers } = useQuery({
    queryKey: ['/api/host-employers'],
    select: (data) => data?.data || [],
  });
  
  // Set up form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payRate: 25.0,
      customMargin: DEFAULT_COST_CONFIG.defaultMargin,
      rateSource: 'manual',
      isQuote: false,
      isTemplate: false,
      isBulkOperation: false,
      notes: '',
    },
  });
  
  // Watch form values for real-time calculation
  const watchedValues = form.watch();
  
  // Mutation for saving calculation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
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
  const handleAwardSelect = (award, classification) => {
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
  const getApprenticeDisplayText = (apprentice) => {
    return `${apprentice.firstName} ${apprentice.lastName} - ${apprentice.tradeType || 'Apprentice'}`;
  };
  
  // Helper function for host employer display text
  const getHostEmployerDisplayText = (hostEmployer) => {
    return hostEmployer.companyName || hostEmployer.businessName || 'Unknown Host';
  };
  
  // Handle form submission
  const onSubmit = (data) => {
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
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(value);
  };
  
  // Selected apprentice and host employer
  const selectedApprentice = apprentices?.find((a) => a.id === watchedValues.apprenticeId);
  const selectedHostEmployer = hostEmployers?.find((h) => h.id === watchedValues.hostEmployerId);
  
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
                          <div className="space-y-4 mb-4">
                            <FormField
                              control={form.control}
                              name="isQuote"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel>Create as Quote</FormLabel>
                                    <FormDescription>
                                      Create this as a quote rather than assigning it to a specific apprentice or host.
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="isBulkOperation"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel>Bulk Operation</FormLabel>
                                    <FormDescription>
                                      Apply this rate calculation to multiple apprentices or host employers.
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {!watchedValues.isQuote && !watchedValues.isBulkOperation ? (
                            // Regular single apprentice/host selection
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
                          ) : watchedValues.isQuote ? (
                            // Quote options
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="leadId"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Attach to Lead</FormLabel>
                                    <Select
                                      value={field.value?.toString()}
                                      onValueChange={(value) => field.onChange(parseInt(value))}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a lead" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="1">Example Lead 1</SelectItem>
                                        <SelectItem value="2">Example Lead 2</SelectItem>
                                        <SelectItem value="3">Example Lead 3</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormDescription>
                                      Optionally attach this quote to a lead.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="isTemplate"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                      <FormLabel>Save as Template</FormLabel>
                                      <FormDescription>
                                        Save this as a reusable template for multiple hosts/apprentices.
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              {watchedValues.isTemplate && (
                                <FormField
                                  control={form.control}
                                  name="templateName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Template Name</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Enter template name" {...field} />
                                      </FormControl>
                                      <FormDescription>
                                        Name for the template to identify it in the future.
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </div>
                          ) : (
                            // Bulk operation selection
                            <div className="space-y-6">
                              <div>
                                <h3 className="text-sm font-medium mb-2">Select Apprentices</h3>
                                <div className="border rounded-md p-4 h-40 overflow-y-auto">
                                  {apprentices?.map((apprentice) => (
                                    <div key={apprentice.id} className="flex items-center space-x-2 mb-2">
                                      <Checkbox 
                                        id={`apprentice-${apprentice.id}`} 
                                        onCheckedChange={(checked) => {
                                          const currentVal = form.getValues('selectedApprentices') || [];
                                          if (checked) {
                                            form.setValue('selectedApprentices', [...currentVal, apprentice.id]);
                                          } else {
                                            form.setValue('selectedApprentices', 
                                              currentVal.filter(id => id !== apprentice.id)
                                            );
                                          }
                                        }}
                                      />
                                      <label htmlFor={`apprentice-${apprentice.id}`} className="text-sm">
                                        {getApprenticeDisplayText(apprentice)}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="text-sm font-medium mb-2">Select Host Employers</h3>
                                <div className="border rounded-md p-4 h-40 overflow-y-auto">
                                  {hostEmployers?.map((host) => (
                                    <div key={host.id} className="flex items-center space-x-2 mb-2">
                                      <Checkbox 
                                        id={`host-${host.id}`} 
                                        onCheckedChange={(checked) => {
                                          const currentVal = form.getValues('selectedHostEmployers') || [];
                                          if (checked) {
                                            form.setValue('selectedHostEmployers', [...currentVal, host.id]);
                                          } else {
                                            form.setValue('selectedHostEmployers', 
                                              currentVal.filter(id => id !== host.id)
                                            );
                                          }
                                        }}
                                      />
                                      <label htmlFor={`host-${host.id}`} className="text-sm">
                                        {getHostEmployerDisplayText(host)}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-end">
                            <Button 
                              type="button" 
                              onClick={() => setActiveTab('rate')}
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="rate">
                        <div className="space-y-6 py-4">
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="rateSource"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rate Source</FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select rate source" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="fairwork">Fair Work Award</SelectItem>
                                      <SelectItem value="enterprise_agreement">Enterprise Agreement</SelectItem>
                                      <SelectItem value="manual">Manual Entry</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Select the source for the pay rate calculation.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {watchedValues.rateSource === 'fairwork' ? (
                              <div className="border rounded-md p-4 bg-muted/30">
                                <h3 className="font-medium mb-2">Fair Work Award Rate</h3>
                                <AwardSelector onAwardSelected={handleAwardSelect} />
                              </div>
                            ) : watchedValues.rateSource === 'enterprise_agreement' ? (
                              <div className="border rounded-md p-4 bg-muted/30">
                                <h3 className="font-medium mb-2">Enterprise Agreement</h3>
                                <div className="mb-4">
                                  <Alert>
                                    <Info className="h-4 w-4 mr-2" />
                                    <AlertTitle>Enterprise Agreement Support</AlertTitle>
                                    <AlertDescription>
                                      Upload and select an Enterprise Agreement to determine rates. Supported file types: PDF, DOCX.
                                    </AlertDescription>
                                  </Alert>
                                </div>
                                <Button variant="outline" className="mb-4">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload Enterprise Agreement
                                </Button>
                              </div>
                            ) : (
                              <div className="border rounded-md p-4 bg-muted/30">
                                <h3 className="font-medium mb-2">Manual Rate Entry</h3>
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
                                        Enter the hourly pay rate manually.
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="customMargin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Margin (%)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
                                        max="100"
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
                          
                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
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
                                        {DEFAULT_BILLABLE_OPTIONS.includeAnnualLeave ? 'Yes' : 'No'}
                                      </li>
                                      <li>
                                        <span className="text-muted-foreground">Include Public Holidays:</span> 
                                        {DEFAULT_BILLABLE_OPTIONS.includePublicHolidays ? 'Yes' : 'No'}
                                      </li>
                                      <li>
                                        <span className="text-muted-foreground">Include Sick Leave:</span> 
                                        {DEFAULT_BILLABLE_OPTIONS.includeSickLeave ? 'Yes' : 'No'}
                                      </li>
                                      <li>
                                        <span className="text-muted-foreground">Include Training Time:</span> 
                                        {DEFAULT_BILLABLE_OPTIONS.includeTrainingTime ? 'Yes' : 'No'}
                                      </li>
                                      <li>
                                        <span className="text-muted-foreground">Include Adverse Weather:</span> 
                                        {DEFAULT_BILLABLE_OPTIONS.includeAdverseWeather ? 'Yes' : 'No'}
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          <div className="flex flex-col md:flex-row md:justify-between space-y-4 md:space-y-0">
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
                              disabled={isCalculating}
                            >
                              {isCalculating ? (
                                <>
                                  <span className="animate-spin mr-2">⧗</span> Calculating...
                                </>
                              ) : (
                                <>
                                  <Calculator className="h-4 w-4 mr-2" />
                                  Calculate Charge Rate
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="review">
                        <div className="space-y-6 py-4">
                          <div className="border rounded-md p-4">
                            {calculationResult ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="text-lg font-semibold">Calculation Summary</h3>
                                    <ul className="space-y-2 mt-2">
                                      <li className="flex justify-between">
                                        <span className="text-muted-foreground">Pay Rate:</span>
                                        <span className="font-medium">{formatCurrency(calculationResult.payRate)}/hr</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-muted-foreground">Total Annual Hours:</span>
                                        <span className="font-medium">{calculationResult.totalHours}</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-muted-foreground">Billable Hours:</span>
                                        <span className="font-medium">{calculationResult.billableHours}</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-muted-foreground">Base Annual Wage:</span>
                                        <span className="font-medium">{formatCurrency(calculationResult.baseWage)}</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-muted-foreground">Total Annual Cost:</span>
                                        <span className="font-medium">{formatCurrency(calculationResult.totalCost)}</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-muted-foreground">Cost Per Hour:</span>
                                        <span className="font-medium">{formatCurrency(calculationResult.costPerHour)}/hr</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-muted-foreground">Profit Margin:</span>
                                        <span className="font-medium">{(calculationResult.customMargin || DEFAULT_COST_CONFIG.defaultMargin) * 100}%</span>
                                      </li>
                                      <li className="flex justify-between font-semibold text-lg">
                                        <span>Charge Rate:</span>
                                        <span className="text-primary">{formatCurrency(calculationResult.chargeRate)}/hr</span>
                                      </li>
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h3 className="text-lg font-semibold">On-costs Breakdown</h3>
                                    <ul className="space-y-2 mt-2">
                                      <li className="flex justify-between">
                                        <span className="text-muted-foreground">Superannuation:</span>
                                        <span className="font-medium">{formatCurrency(calculationResult.oncosts.superannuation)}</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-muted-foreground">Workers Compensation:</span>
                                        <span className="font-medium">{formatCurrency(calculationResult.oncosts.workersComp)}</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-muted-foreground">Payroll Tax:</span>
                                        <span className="font-medium">{formatCurrency(calculationResult.oncosts.payrollTax)}</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-muted-foreground">Leave Loading:</span>
                                        <span className="font-medium">{formatCurrency(calculationResult.oncosts.leaveLoading)}</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-muted-foreground">Study Cost:</span>
                                        <span className="font-medium">{formatCurrency(calculationResult.oncosts.studyCost)}</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-muted-foreground">PPE Cost:</span>
                                        <span className="font-medium">{formatCurrency(calculationResult.oncosts.ppeCost)}</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-muted-foreground">Admin Cost:</span>
                                        <span className="font-medium">{formatCurrency(calculationResult.oncosts.adminCost)}</span>
                                      </li>
                                      <li className="flex justify-between font-semibold pt-2 border-t">
                                        <span>Total On-costs:</span>
                                        <span>
                                          {formatCurrency(
                                            calculationResult.oncosts.superannuation +
                                            calculationResult.oncosts.workersComp +
                                            calculationResult.oncosts.payrollTax +
                                            calculationResult.oncosts.leaveLoading +
                                            calculationResult.oncosts.studyCost +
                                            calculationResult.oncosts.ppeCost +
                                            calculationResult.oncosts.adminCost
                                          )}
                                        </span>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                
                                <div className="mt-6">
                                  <h3 className="text-lg font-semibold">{watchedValues.isBulkOperation ? 'Bulk Application' : 'Application'}</h3>
                                  {watchedValues.isBulkOperation ? (
                                    <div className="mt-2 space-y-2">
                                      <div>
                                        <p className="text-sm font-semibold">Selected Apprentices:</p>
                                        <div className="border rounded-md p-2 mt-1 text-sm">
                                          {watchedValues.selectedApprentices?.length ? 
                                            watchedValues.selectedApprentices.map(id => {
                                              const apprentice = apprentices?.find(a => a.id === id);
                                              return apprentice ? (
                                                <Badge key={id} variant="outline" className="mr-1 mb-1">
                                                  {getApprenticeDisplayText(apprentice)}
                                                </Badge>
                                              ) : null;
                                            }) : 
                                            <span className="text-muted-foreground">No apprentices selected</span>
                                          }
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold">Selected Host Employers:</p>
                                        <div className="border rounded-md p-2 mt-1 text-sm">
                                          {watchedValues.selectedHostEmployers?.length ? 
                                            watchedValues.selectedHostEmployers.map(id => {
                                              const host = hostEmployers?.find(h => h.id === id);
                                              return host ? (
                                                <Badge key={id} variant="outline" className="mr-1 mb-1">
                                                  {getHostEmployerDisplayText(host)}
                                                </Badge>
                                              ) : null;
                                            }) : 
                                            <span className="text-muted-foreground">No host employers selected</span>
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  ) : watchedValues.isQuote ? (
                                    <div className="mt-2">
                                      {watchedValues.leadId ? (
                                        <p>Quote will be attached to Lead ID: {watchedValues.leadId}</p>
                                      ) : (
                                        <p>Quote is not attached to any lead</p>
                                      )}
                                      {watchedValues.isTemplate && (
                                        <p className="mt-1">Will be saved as template: {watchedValues.templateName || 'Unnamed Template'}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="mt-2">
                                      <p>
                                        <span className="font-medium">Apprentice:</span> {selectedApprentice ? 
                                          getApprenticeDisplayText(selectedApprentice) : 'None selected'}
                                      </p>
                                      <p className="mt-1">
                                        <span className="font-medium">Host Employer:</span> {selectedHostEmployer ? 
                                          getHostEmployerDisplayText(selectedHostEmployer) : 'None selected'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                {watchedValues.notes && (
                                  <div className="mt-4">
                                    <h3 className="text-lg font-semibold">Notes</h3>
                                    <p className="mt-1 text-sm border rounded-md p-2">{watchedValues.notes}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center p-6">
                                <p className="text-muted-foreground">Please calculate the charge rate first</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col md:flex-row md:justify-between space-y-4 md:space-y-0">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setActiveTab('rate')}
                            >
                              Back
                            </Button>
                            
                            <Button 
                              type="submit"
                              disabled={!calculationResult || saveMutation.isPending}
                            >
                              {saveMutation.isPending ? (
                                <>
                                  <span className="animate-spin mr-2">⧗</span> Saving...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Save Charge Rate
                                </>
                              )}
                            </Button>
                          </div>
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
                <CardTitle>Charge Rate Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {calculationResult ? (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center p-4 border rounded-md text-center">
                      <span className="text-muted-foreground text-sm">Calculated Rate</span>
                      <span className="text-4xl font-bold text-primary">{formatCurrency(calculationResult.chargeRate)}</span>
                      <span className="text-muted-foreground text-sm">per hour</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-muted-foreground">Pay Rate:</span>
                      <span className="text-right">{formatCurrency(calculationResult.payRate)}/hr</span>
                      
                      <span className="text-muted-foreground">Cost Per Hour:</span>
                      <span className="text-right">{formatCurrency(calculationResult.costPerHour)}/hr</span>
                      
                      <span className="text-muted-foreground">Margin:</span>
                      <span className="text-right">{(calculationResult.customMargin || DEFAULT_COST_CONFIG.defaultMargin) * 100}%</span>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <ChargeRateVisualizer 
                        payRate={calculationResult.payRate}
                        costPerHour={calculationResult.costPerHour}
                        chargeRate={calculationResult.chargeRate}
                        margin={calculationResult.customMargin || DEFAULT_COST_CONFIG.defaultMargin}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 h-48 text-center text-muted-foreground">
                    <Calculator className="h-10 w-10 mb-2 opacity-30" />
                    <p>Complete the information and calculate to see the charge rate summary</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {calculationResult && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Annual Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Hours:</span>
                    <span>{calculationResult.totalHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Billable Hours:</span>
                    <span>{calculationResult.billableHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Wage:</span>
                    <span>{formatCurrency(calculationResult.baseWage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <span>{formatCurrency(calculationResult.totalCost)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Annual Revenue:</span>
                    <span>{formatCurrency(calculationResult.chargeRate * calculationResult.billableHours)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Annual Profit:</span>
                    <span>{formatCurrency(
                      (calculationResult.chargeRate * calculationResult.billableHours) - calculationResult.totalCost
                    )}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}