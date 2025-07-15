import { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { insertComplianceRecordSchema } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { queryClient } from '@/lib/queryClient';
// No need for Link import

// Extend schema with client-side validation
const formSchema = insertComplianceRecordSchema.extend({
  dueDate: z.date().optional(),
  completionDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateComplianceRecord() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const relatedTo = searchParams.get('relatedTo');
  const relatedId = searchParams.get('relatedId');

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: '',
      status: 'pending',
      relatedTo: relatedTo || '',
      relatedId: relatedId ? parseInt(relatedId) : undefined,
      notes: '',
    },
  });

  // Create mutation for form submission
  const createComplianceMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create compliance record');
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success('Compliance record created successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/compliance'] });

      // If this was created in relation to another entity, invalidate that query too
      if (relatedTo && relatedId) {
        queryClient.invalidateQueries({
          queryKey: [`/api/compliance/related/${relatedTo}/${relatedId}`],
        });
      }

      // Navigate back to the list or the related entity
      if (relatedTo && relatedId) {
        navigate(`/${relatedTo}s/${relatedId}`);
      } else {
        navigate('/compliance');
      }
    },
    onError: error => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    createComplianceMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-4" onClick={() => navigate('/compliance')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create Compliance Record</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Record Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compliance Type*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select compliance type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="safety">Safety</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="certification">Certification</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="compliant">Compliant</SelectItem>
                          <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!relatedTo && (
                  <FormField
                    control={form.control}
                    name="relatedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related To*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select related entity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="apprentice">Apprentice</SelectItem>
                            <SelectItem value="host">Host Employer</SelectItem>
                            <SelectItem value="contract">Training Contract</SelectItem>
                            <SelectItem value="placement">Placement</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {!relatedId && (
                  <FormField
                    control={form.control}
                    name="relatedId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related ID*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter ID"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
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
                  name="completionDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Completion Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                        placeholder="Enter any additional notes or details"
                        className="min-h-[120px]"
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/compliance')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createComplianceMutation.isPending}>
                  {createComplianceMutation.isPending ? 'Creating...' : 'Create Compliance Record'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
