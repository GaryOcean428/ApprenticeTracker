import React from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Form schema for award
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  industry: z.string().optional(),
  sector: z.string().optional(),
  isActive: z.boolean().default(true),
  effectiveDate: z.string().optional().nullable(),
});

const EditAward = ({ params }) => {
  const { id } = params || useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const {
    data: award,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/awards/${id}`],
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      industry: '',
      sector: '',
      isActive: true,
      effectiveDate: '',
    },
  });

  // Update form values when award data is loaded
  React.useEffect(() => {
    if (award) {
      form.reset({
        name: award.name || '',
        code: award.code || '',
        description: award.description || '',
        industry: award.industry || '',
        sector: award.sector || '',
        isActive: award.isActive ?? true,
        effectiveDate: award.effectiveDate
          ? new Date(award.effectiveDate).toISOString().split('T')[0]
          : '',
      });
    }
  }, [award, form]);

  const updateMutation = useMutation({
    mutationFn: async data => {
      const response = await apiRequest('PUT', `/api/awards/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`/api/awards/${id}`]);
      queryClient.invalidateQueries(['/api/awards']);
      toast({
        title: 'Award Updated',
        description: 'The award has been updated successfully.',
      });
      navigate(`/awards/${id}`);
    },
    onError: error => {
      toast({
        title: 'Update Failed',
        description: `Failed to update award: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = data => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !award) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-xl font-semibold mb-2">Award Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The requested award could not be found or there was an error loading it.
        </p>
        <Button asChild>
          <Link href="/awards">Return to Awards List</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/awards/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Award
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Award</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Award Information</CardTitle>
          <CardDescription>Update the award details below</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Award name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Award code" {...field} />
                      </FormControl>
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
                        <Input placeholder="Industry" {...field} />
                      </FormControl>
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
                        <Input placeholder="Sector" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>The date when this award takes effect</FormDescription>
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
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>Is this award currently active?</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
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
                        placeholder="Provide a description for this award"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" asChild>
                  <Link href={`/awards/${id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditAward;
