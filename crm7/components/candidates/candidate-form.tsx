'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const candidateFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Please enter name.',
  }),
  email: z.string().email({
    message: 'Please enter valid email.',
  }),
  phone: z.string().min(1, {
    message: 'Please enter phone number.',
  }),
  location: z.string().min(1, {
    message: 'Please enter location.',
  }),
  title: z.string().min(1, {
    message: 'Please enter job title.',
  }),
  status: z.string().min(1, {
    message: 'Please select status.',
  }),
  about: z.string().min(1, {
    message: 'Please enter about.',
  }),
  skills: z.string().min(1, {
    message: 'Please enter skills.',
  }),
  availability: z.string().min(1, {
    message: 'Please enter availability.',
  }),
  preferredLocation: z.string().min(1, {
    message: 'Please enter preferred location.',
  }),
  salaryAmount: z.string(),
  salaryCurrency: z.string(),
  salaryPeriod: z.string(),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
});

interface CandidateFormValues {
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  status: string;
  about: string;
  skills: string;
  availability: string;
  preferredLocation: string;
  salaryAmount: string;
  salaryCurrency: string;
  salaryPeriod: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

interface CandidateFormProps {
  initialData?: Partial<CandidateFormValues>;
  onSubmitAction: (data: CandidateFormValues) => Promise<void>;
}

export function CandidateForm({
  initialData,
  onSubmitAction
}: CandidateFormProps): JSX.Element {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      location: initialData?.location ?? '',
      title: initialData?.title ?? '',
      status: initialData?.status ?? '',
      about: initialData?.about ?? '',
      skills: initialData?.skills ?? '',
      availability: initialData?.availability ?? '',
      preferredLocation: initialData?.preferredLocation ?? '',
      salaryAmount: initialData?.salaryAmount ?? '',
      salaryCurrency: initialData?.salaryCurrency ?? 'USD',
      salaryPeriod: initialData?.salaryPeriod ?? '',
      linkedinUrl: initialData?.linkedinUrl ?? '',
      githubUrl: initialData?.githubUrl ?? '',
      portfolioUrl: initialData?.portfolioUrl ?? '',
    },
  });

  const { toast } = useToast();

  const handleSubmit = async (data: CandidateFormValues): Promise<void> => {
    try {
      setIsSubmitting(true);
      await onSubmitAction(data);
      toast({
        title: 'Candidate saved',
        description: 'The candidate information has been successfully saved.',
      });
      form.reset();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save candidate information',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }): React.JSX.Element => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }): React.JSX.Element => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john.smith@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }): React.JSX.Element => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }): React.JSX.Element => (
            <FormItem>
              <FormLabel>Current Location</FormLabel>
              <FormControl>
                <Input placeholder="New York, NY" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }): React.JSX.Element => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="Senior Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }): React.JSX.Element => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Input placeholder="Select status" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="about"
        render={({ field }): React.JSX.Element => (
          <FormItem>
            <FormLabel>About</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Tell us about the candidate..."
                {...field}
              />
            </FormControl>
            <div className="text-sm text-muted-foreground">
              Brief description of the candidate's background and expertise.
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="skills"
        render={({ field }): React.JSX.Element => (
          <FormItem>
            <FormLabel>Skills</FormLabel>
            <FormControl>
              <Input
                placeholder="React, TypeScript, Node.js"
                {...field}
              />
            </FormControl>
            <div className="text-sm text-muted-foreground">
              Comma-separated list of skills
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="availability"
          render={({ field }): React.JSX.Element => (
            <FormItem>
              <FormLabel>Availability</FormLabel>
              <FormControl>
                <Input placeholder="Immediately" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredLocation"
          render={({ field }): React.JSX.Element => (
            <FormItem>
              <FormLabel>Preferred Location</FormLabel>
              <FormControl>
                <Input placeholder="Remote / New York, NY" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <FormField
          control={form.control}
          name="salaryAmount"
          render={({ field }): React.JSX.Element => (
            <FormItem>
              <FormLabel>Salary Amount</FormLabel>
              <FormControl>
                <Input placeholder="100000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salaryCurrency"
          render={({ field }): React.JSX.Element => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input placeholder="USD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salaryPeriod"
          render={({ field }): React.JSX.Element => (
            <FormItem>
              <FormLabel>Salary Period</FormLabel>
              <FormControl>
                <Input placeholder="Yearly" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <FormField
          control={form.control}
          name="linkedinUrl"
          render={({ field }): React.JSX.Element => (
            <FormItem>
              <FormLabel>LinkedIn</FormLabel>
              <FormControl>
                <Input placeholder="https://linkedin.com/in/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="githubUrl"
          render={({ field }): React.JSX.Element => (
            <FormItem>
              <FormLabel>GitHub</FormLabel>
              <FormControl>
                <Input placeholder="https://github.com/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="portfolioUrl"
          render={({ field }): React.JSX.Element => (
            <FormItem>
              <FormLabel>Portfolio</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Save Candidate'}
        </Button>
      </div>
    </form>
  );
}
