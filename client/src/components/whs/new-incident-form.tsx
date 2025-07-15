import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const incidentFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  type: z.enum(['incident', 'hazard'], {
    required_error: 'Please select a type',
  }),
  severity: z.enum(['high', 'medium', 'low'], {
    required_error: 'Please select a severity level',
  }),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  date_occurred: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: 'Please enter a valid date',
  }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  immediate_actions: z.string().optional(),
  notifiable_incident: z.boolean().default(false),
  witnesses: z
    .array(
      z.object({
        name: z.string().min(2, 'Witness name must be at least 2 characters'),
        contact: z.string().optional(),
        statement: z.string().optional(),
      })
    )
    .optional(),
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

interface NewIncidentFormProps {
  onSuccess: () => void;
}

export default function NewIncidentForm({ onSuccess }: NewIncidentFormProps) {
  const { toast } = useToast();
  const [witnesses, setWitnesses] = useState<
    Array<{ name: string; contact: string; statement: string }>
  >([]);

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      title: '',
      type: 'incident',
      severity: 'medium',
      location: '',
      date_occurred: new Date().toISOString().split('T')[0],
      description: '',
      immediate_actions: '',
      notifiable_incident: false,
      witnesses: [],
    },
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (values: IncidentFormValues) => {
      const res = await apiRequest('POST', '/api/whs/incidents', values);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create incident');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Incident reported successfully',
        description: 'The incident has been recorded in the system.',
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to report incident',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: IncidentFormValues) => {
    // Ensure witnesses from state are included in form values
    values.witnesses = witnesses;
    createIncidentMutation.mutate(values);
  };

  const addWitness = () => {
    setWitnesses([...witnesses, { name: '', contact: '', statement: '' }]);
  };

  const updateWitness = (index: number, field: keyof (typeof witnesses)[0], value: string) => {
    const newWitnesses = [...witnesses];
    newWitnesses[index][field] = value;
    setWitnesses(newWitnesses);
  };

  const removeWitness = (index: number) => {
    const newWitnesses = [...witnesses];
    newWitnesses.splice(index, 1);
    setWitnesses(newWitnesses);
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
                  <Input placeholder="Brief title of the incident" {...field} />
                </FormControl>
                <FormDescription>A short, descriptive title for the incident</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="incident">Incident</SelectItem>
                    <SelectItem value="hazard">Hazard</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Classify as an incident (occurred) or hazard (potential risk)
                </FormDescription>
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
                  <Input placeholder="Where it happened" {...field} />
                </FormControl>
                <FormDescription>The specific place where the incident occurred</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_occurred"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Occurred</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>When the incident or hazard was first observed</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>How serious the incident is or could be</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notifiable_incident"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Notifiable Incident</FormLabel>
                  <FormDescription>
                    Does this incident require notification to a regulatory authority?
                  </FormDescription>
                </div>
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
                  placeholder="Detailed description of what happened"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe in detail what happened, including any contributing factors
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="immediate_actions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Immediate Actions Taken</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Actions taken immediately after the incident"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe any immediate actions taken to address the incident or hazard
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Witnesses</h3>
            <Button type="button" variant="outline" onClick={addWitness}>
              Add Witness
            </Button>
          </div>

          {witnesses.map((witness, index) => (
            <Card key={index} className="mb-4">
              <CardContent className="pt-6 pb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel htmlFor={`witness-name-${index}`}>Name</FormLabel>
                    <Input
                      id={`witness-name-${index}`}
                      value={witness.name}
                      onChange={e => updateWitness(index, 'name', e.target.value)}
                      placeholder="Witness name"
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel htmlFor={`witness-contact-${index}`}>Contact Information</FormLabel>
                    <Input
                      id={`witness-contact-${index}`}
                      value={witness.contact}
                      onChange={e => updateWitness(index, 'contact', e.target.value)}
                      placeholder="Phone or email"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <FormLabel htmlFor={`witness-statement-${index}`}>Statement</FormLabel>
                    <Textarea
                      id={`witness-statement-${index}`}
                      value={witness.statement}
                      onChange={e => updateWitness(index, 'statement', e.target.value)}
                      placeholder="What the witness observed"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-0">
                <Button type="button" variant="destructive" onClick={() => removeWitness(index)}>
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex justify-end mt-8">
          <Button type="submit" size="lg" disabled={createIncidentMutation.isPending}>
            {createIncidentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Report Incident
          </Button>
        </div>
      </form>
    </Form>
  );
}
