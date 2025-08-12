import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
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

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Define form schema
const formSchema = z.object({
  unitCode: z.string().min(1, 'Unit code is required'),
  unitTitle: z.string().min(1, 'Unit title is required'),
  unitDescription: z.string().optional(),
  trainingPackage: z.string().optional(),
  trainingPackageRelease: z.string().optional(),
  releaseNumber: z.string().optional(),
  nominalHours: z.coerce.number().int().min(0, 'Nominal hours must be 0 or greater'),
  isActive: z.boolean().default(true),
  isImported: z.boolean().default(false),
  assessmentRequirements: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditUnitOfCompetency() {
  const { id } = useParams();
  const unitId = parseInt(id);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch unit of competency data
  const {
    data: unit,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/vet/units/${unitId}`],
    enabled: !isNaN(unitId),
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitCode: '',
      unitTitle: '',
      unitDescription: '',
      trainingPackage: '',
      trainingPackageRelease: '',
      releaseNumber: '',
      nominalHours: 0,
      isActive: true,
      isImported: false,
      assessmentRequirements: '',
    },
  });

  // Update form with unit data when available
  useEffect(() => {
    if (unit) {
      form.reset({
        unitCode: unit.unitCode,
        unitTitle: unit.unitTitle,
        unitDescription: unit.unitDescription || '',
        trainingPackage: unit.trainingPackage || '',
        trainingPackageRelease: unit.trainingPackageRelease || '',
        releaseNumber: unit.releaseNumber || '',
        nominalHours: unit.nominalHours || 0,
        isActive: unit.isActive,
        isImported: unit.isImported || false,
        assessmentRequirements: unit.assessmentRequirements || '',
      });
    }
  }, [unit, form]);

  // Update unit mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest('PATCH', `/api/vet/units/${unitId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Unit updated',
        description: 'Unit of competency has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vet/units'] });
      queryClient.invalidateQueries({ queryKey: [`/api/vet/units/${unitId}`] });
      navigate('/vet/units');
    },
    onError: error => {
      toast({
        title: 'Error',
        description: `Failed to update unit: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete unit mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/vet/units/${unitId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Unit deleted',
        description: 'Unit of competency has been deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vet/units'] });
      navigate('/vet/units');
    },
    onError: error => {
      toast({
        title: 'Error',
        description: `Failed to delete unit: ${error.message}`,
        variant: 'destructive',
      });
      setIsDeleting(false);
    },
  });

  // Handle form submission
  function onSubmit(data: FormValues) {
    updateMutation.mutate(data);
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/vet/units">Units of Competency</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Loading...</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Skeleton className="h-[75px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  // Error state
  if (error || !unit) {
    return (
      <div className="space-y-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/vet/units">Units of Competency</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Error</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load unit of competency'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/vet/units')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Units
        </Button>
      </div>
    );
  }

  // Render the component
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/vet/units">Units of Competency</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/vet/units/${unitId}`}>{unit.unitCode}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Unit of Competency</CardTitle>
                <CardDescription>Update the details of this unit of competency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unitCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Code</FormLabel>
                        <FormControl>
                          <Input placeholder="CPCCBC4001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nominalHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nominal Hours</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="unitTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Apply building codes and standards" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="This unit describes the skills and knowledge required..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="trainingPackage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Package</FormLabel>
                        <FormControl>
                          <Input placeholder="CPC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trainingPackageRelease"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Package Release</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assessmentRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Assessment must be conducted..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Is this unit currently active and available for use?
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isImported"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Imported from TGA</FormLabel>
                          <FormDescription>
                            Was this unit imported from Training.gov.au?
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => navigate(`/vet/units/${unitId}`)}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => setIsDeleting(true)}
                    disabled={deleteMutation.isPending || unit.isImported}
                  >
                    {unit.isImported ? 'Imported units cannot be deleted' : 'Delete'}
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>

      {/* Confirmation Dialog for Delete */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this unit of competency? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleting(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
