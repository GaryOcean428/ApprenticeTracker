import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { insertAwardSchema } from '@shared/schema';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { queryClient } from '@/lib/queryClient';

// Extend schema with client-side validation
const formSchema = insertAwardSchema.extend({
  effectiveDate: z.date().optional(),
  industry: z.string().optional(),
  sector: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateAward() {
  const [, navigate] = useLocation();

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      fairWorkReference: '',
      fairWorkTitle: '',
      industry: '',
      sector: '',
      description: '',
      isActive: true,
    },
  });

  // Create mutation for form submission
  const createAwardMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await fetch('/api/awards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create award');
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success('Award created successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/awards'] });
      navigate('/awards');
    },
    onError: error => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    createAwardMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-4" onClick={() => navigate('/awards')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create Fair Work Award</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Award Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Award Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter award name" {...field} />
                      </FormControl>
                      <FormDescription>The full name of the Modern Award</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Award Code*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. MA2020" {...field} />
                      </FormControl>
                      <FormDescription>A unique code for this award</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fairWorkReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fair Work Reference</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. MA000010" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        The official reference number from Fair Work Australia
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fairWorkTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fair Work Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Manufacturing and Associated Industries Award 2020"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>The official title from Fair Work Australia</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Construction, Manufacturing, Healthcare"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>The primary industry this award covers</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sector</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Private, Public, Not-for-profit"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>The economic sector this award applies to</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Effective Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
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
                      <FormDescription>The date this award comes into effect</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>Is this award currently active?</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
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
                        placeholder="Enter award description"
                        className="min-h-[120px]"
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>Additional details about this award</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/awards')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAwardMutation.isPending}>
                  {createAwardMutation.isPending ? 'Creating...' : 'Create Award'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
