import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarIcon, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

// Define the Risk Assessment form schema
const riskAssessmentFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  assessment_date: z.date({
    required_error: 'Assessment date is required',
  }),
  review_date: z.date().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  host_employer_id: z.string().optional(),
  assessor_name: z.string().min(2, 'Assessor name must be at least 2 characters'),
  department: z.string().optional(),
  status: z.enum(['draft', 'in-progress', 'completed', 'review-required'], {
    required_error: 'Please select a status',
  }),
  work_area: z.string().min(2, 'Work area must be at least 2 characters'),
  // Hazards and controls
  hazards: z
    .array(
      z.object({
        description: z.string().min(3, 'Hazard description must be at least 3 characters'),
        risk_level: z.enum(['low', 'medium', 'high', 'critical'], {
          required_error: 'Please select a risk level',
        }),
        controls: z.string().min(5, 'Control measures must be at least 5 characters'),
        residual_risk: z.enum(['low', 'medium', 'high', 'critical'], {
          required_error: 'Please select a residual risk level',
        }),
      })
    )
    .min(1, 'At least one hazard must be identified'),
  approver_name: z.string().optional(),
  approval_date: z.date().optional(),
  approval_notes: z.string().optional(),
});

type RiskAssessmentFormValues = z.infer<typeof riskAssessmentFormSchema>;

// Initial empty hazard object
const emptyHazard = {
  description: '',
  risk_level: 'medium' as const,
  controls: '',
  residual_risk: 'low' as const,
};

interface RiskLevelOption {
  value: 'low' | 'medium' | 'high' | 'critical';
  label: string;
  color: string;
}

const riskLevelOptions: RiskLevelOption[] = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
];

interface NewRiskAssessmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NewRiskAssessmentForm({ onSuccess, onCancel }: NewRiskAssessmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeHazardIndex, setActiveHazardIndex] = useState<number | null>(null);

  // Set up the form
  const form = useForm<RiskAssessmentFormValues>({
    resolver: zodResolver(riskAssessmentFormSchema),
    defaultValues: {
      title: '',
      location: '',
      assessment_date: new Date(),
      description: '',
      assessor_name: '',
      department: '',
      status: 'draft',
      work_area: '',
      hazards: [{ ...emptyHazard }],
    },
  });

  // Create risk assessment mutation
  const createMutation = useMutation({
    mutationFn: async (data: RiskAssessmentFormValues) => {
      const response = await apiRequest('POST', '/api/whs/risk-assessments', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create risk assessment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whs/risk-assessments'] });
      toast({
        title: 'Risk assessment created',
        description: 'The risk assessment has been created successfully.',
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create risk assessment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add a new hazard
  const addHazard = () => {
    const hazards = form.getValues('hazards') || [];
    form.setValue('hazards', [...hazards, { ...emptyHazard }]);
    // Open the newly added hazard accordion
    setActiveHazardIndex(hazards.length);
  };

  // Remove a hazard
  const removeHazard = (index: number) => {
    const hazards = form.getValues('hazards') || [];
    if (hazards.length <= 1) {
      toast({
        title: 'Cannot remove hazard',
        description: 'At least one hazard must be identified in the risk assessment.',
        variant: 'destructive',
      });
      return;
    }

    const updatedHazards = [...hazards];
    updatedHazards.splice(index, 1);
    form.setValue('hazards', updatedHazards);

    // If the active hazard was removed, reset the active index
    if (activeHazardIndex === index) {
      setActiveHazardIndex(null);
    } else if (activeHazardIndex !== null && activeHazardIndex > index) {
      // Adjust the active index if a hazard before it was removed
      setActiveHazardIndex(activeHazardIndex - 1);
    }
  };

  // Handle form submission
  const onSubmit = (data: RiskAssessmentFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Risk Assessment Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="review-required">Review Required</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="work_area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Area</FormLabel>
                <FormControl>
                  <Input placeholder="Specific work area" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assessment_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Assessment Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className="w-full pl-3 text-left font-normal">
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={date => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="review_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Review Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className="w-full pl-3 text-left font-normal">
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={date => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Date when this assessment should be reviewed</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assessor_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assessor Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name of person conducting assessment" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Department" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the assessment purpose and scope"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Hazards & Controls</h3>
            <Button type="button" variant="outline" onClick={addHazard}>
              Add Hazard
            </Button>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={activeHazardIndex !== null ? `item-${activeHazardIndex}` : undefined}
            onValueChange={value =>
              setActiveHazardIndex(value ? parseInt(value.split('-')[1]) : null)
            }
          >
            {form.watch('hazards')?.map((_, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <div className="flex items-center">
                  <AccordionTrigger className="flex-1">
                    Hazard {index + 1}:{' '}
                    {form.watch(`hazards.${index}.description`) || '(No description)'}
                  </AccordionTrigger>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      removeHazard(index);
                    }}
                    className="mr-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <AccordionContent>
                  <div className="space-y-4 p-2">
                    <FormField
                      control={form.control}
                      name={`hazards.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hazard Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the hazard in detail"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`hazards.${index}.risk_level`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Risk Level (Before Controls)</FormLabel>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {riskLevelOptions.map(option => (
                              <Badge
                                key={option.value}
                                variant="outline"
                                className={`cursor-pointer px-3 py-1 ${
                                  field.value === option.value ? option.color : ''
                                }`}
                                onClick={() =>
                                  form.setValue(`hazards.${index}.risk_level`, option.value, {
                                    shouldValidate: true,
                                  })
                                }
                              >
                                {option.label}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`hazards.${index}.controls`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Control Measures</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List the control measures to mitigate this hazard"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`hazards.${index}.residual_risk`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Residual Risk (After Controls)</FormLabel>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {riskLevelOptions.map(option => (
                              <Badge
                                key={option.value}
                                variant="outline"
                                className={`cursor-pointer px-3 py-1 ${
                                  field.value === option.value ? option.color : ''
                                }`}
                                onClick={() =>
                                  form.setValue(`hazards.${index}.residual_risk`, option.value, {
                                    shouldValidate: true,
                                  })
                                }
                              >
                                {option.label}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="border-t pt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Risk Assessment
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default NewRiskAssessmentForm;
