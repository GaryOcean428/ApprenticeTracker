'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const claimSchema = z.object({
  claimType: z.string({
    required_error: 'Please select a claim type',
  }),
  amount: z.string().min(1, 'Amount is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  attachments: z.string().optional(),
});

type ClaimForm = z.infer<typeof claimSchema>;

export default function SubmitClaimPage() {
  const { toast } = useToast();

  const form = useForm<ClaimForm>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      claimType: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      attachments: '',
    },
  });

  async function onSubmit(_data: ClaimForm) {
    try {
      // Here you would typically save the data to your backend
      toast({
        title: 'Success',
        description: 'Claim has been submitted successfully.',
      });
      form.reset();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to submit claim. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Submit a Claim</CardTitle>
          <CardDescription>Fill out the form below to submit your claim.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="claimType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claim Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a claim type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="expense">Expense Claim</SelectItem>
                        <SelectItem value="travel">Travel Claim</SelectItem>
                        <SelectItem value="equipment">Equipment Claim</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                        placeholder="Provide details about your claim"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="attachments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attachments</FormLabel>
                    <FormControl>
                      <Input type="file" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit Claim</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
