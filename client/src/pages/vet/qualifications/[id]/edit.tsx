import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  CircleAlert,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash,
  X,
} from 'lucide-react';

// Define form schema
const formSchema = z.object({
  qualificationCode: z.string().min(1, 'Qualification code is required'),
  qualificationTitle: z.string().min(1, 'Qualification title is required'),
  qualificationDescription: z.string().optional(),
  aqfLevel: z.string().min(1, 'AQF level is required'),
  aqfLevelNumber: z.coerce.number().int().min(1).max(10),
  trainingPackage: z.string().min(1, 'Training package is required'),
  trainingPackageRelease: z.string().min(1, 'Training package release is required'),
  totalUnits: z.coerce.number().int().min(1, 'Total units is required'),
  coreUnits: z.coerce.number().int().min(0, 'Core units must be 0 or greater'),
  electiveUnits: z.coerce.number().int().min(0, 'Elective units must be 0 or greater'),
  nominalHours: z.coerce.number().int().min(0, 'Nominal hours must be 0 or greater'),
  isActive: z.boolean().default(true),
  isApprenticeshipQualification: z.boolean().default(false),
  isFundedQualification: z.boolean().default(false),
  fundingDetails: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

// Define unit interface
interface Unit {
  id: number;
  unitCode: string;
  unitTitle: string;
  unitDescription: string;
  isCore: boolean;
  nominalHours: number;
  prerequisiteUnitIds: number[] | null;
  createdAt: string;
  updatedAt: string;
}

// Define qualification structure interface
interface QualificationStructure {
  id: number;
  qualificationId: number;
  unitId: number;
  isCore: boolean;
  unitGroup: string | null;
  createdAt: string;
  updatedAt: string;
  unit: Unit;
}

// Define qualification interface
interface Qualification {
  id: number;
  qualificationCode: string;
  qualificationTitle: string;
  qualificationDescription: string;
  aqfLevel: string;
  aqfLevelNumber: number;
  trainingPackage: string;
  trainingPackageRelease: string;
  totalUnits: number;
  coreUnits: number;
  electiveUnits: number;
  nominalHours: number;
  isActive: boolean;
  isApprenticeshipQualification: boolean;
  isFundedQualification: boolean;
  fundingDetails: string | null;
  createdAt: string;
  updatedAt: string;
  structure?: QualificationStructure[];
}

// Define unit group type for organizing units
type UnitGroups = Record<string, QualificationStructure[]>;

export default function EditQualification() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isAddUnitDialogOpen, setIsAddUnitDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnitGroup, setSelectedUnitGroup] = useState<string | null>(null);

  // Fetch qualification data
  const {
    data: qualificationData,
    isLoading,
    error,
  } = useQuery<{ qualification: Qualification }>({
    queryKey: ['/api/vet/qualifications', params.id],
    enabled: !!params.id,
  });

  // Fetch units data
  const { data: unitsData, isLoading: isLoadingUnits } = useQuery<{ units: Unit[] }>({
    queryKey: ['/api/vet/units'],
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      qualificationCode: '',
      qualificationTitle: '',
      qualificationDescription: '',
      aqfLevel: '',
      aqfLevelNumber: 1,
      trainingPackage: '',
      trainingPackageRelease: '',
      totalUnits: 0,
      coreUnits: 0,
      electiveUnits: 0,
      nominalHours: 0,
      isActive: true,
      isApprenticeshipQualification: false,
      isFundedQualification: false,
      fundingDetails: null,
    },
  });

  // Debug qualification data
  useEffect(() => {
    console.log('Qualification data received:', qualificationData);
  }, [qualificationData]);

  // Update form with qualification data when available
  useEffect(() => {
    if (qualificationData?.qualification) {
      const qualification = qualificationData.qualification;
      console.log('Setting form data with:', qualification);
      form.reset({
        qualificationCode: qualification.qualificationCode || '',
        qualificationTitle: qualification.qualificationTitle || '',
        qualificationDescription: qualification.qualificationDescription || '',
        aqfLevel: qualification.aqfLevel || '',
        aqfLevelNumber: qualification.aqfLevelNumber || 1,
        trainingPackage: qualification.trainingPackage || '',
        trainingPackageRelease: qualification.trainingPackageRelease || '',
        totalUnits: qualification.totalUnits || 0,
        coreUnits: qualification.coreUnits || 0,
        electiveUnits: qualification.electiveUnits || 0,
        nominalHours: qualification.nominalHours || 0,
        isActive: qualification.isActive || false,
        isApprenticeshipQualification: qualification.isApprenticeshipQualification || false,
        isFundedQualification: qualification.isFundedQualification || false,
        fundingDetails: qualification.fundingDetails || null,
      });
    }
  }, [qualificationData, form]);

  // Update qualification mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest('PATCH', `/api/vet/qualifications/${params.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Qualification updated',
        description: 'Qualification has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vet/qualifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vet/qualifications', params.id] });
    },
    onError: error => {
      toast({
        title: 'Error',
        description: `Failed to update qualification: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete qualification mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/vet/qualifications/${params.id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Qualification deleted',
        description: 'Qualification has been deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vet/qualifications'] });
      navigate('/vet/qualifications');
    },
    onError: error => {
      toast({
        title: 'Error',
        description: `Failed to delete qualification: ${error.message}`,
        variant: 'destructive',
      });
      setIsDeleting(false);
    },
  });

  // Add unit to qualification mutation
  const addUnitMutation = useMutation({
    mutationFn: async ({
      unitId,
      isCore,
      unitGroup,
    }: {
      unitId: number;
      isCore: boolean;
      unitGroup: string | null;
    }) => {
      const res = await apiRequest('POST', `/api/vet/qualifications/${params.id}/units`, {
        unitId,
        isCore,
        unitGroup,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Unit added',
        description: 'Unit has been added to the qualification',
      });
      setIsAddUnitDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/vet/qualifications', params.id] });
    },
    onError: error => {
      toast({
        title: 'Error',
        description: `Failed to add unit: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Remove unit from qualification mutation
  const removeUnitMutation = useMutation({
    mutationFn: async (structureId: number) => {
      const res = await apiRequest(
        'DELETE',
        `/api/vet/qualifications/${params.id}/units/${structureId}`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Unit removed',
        description: 'Unit has been removed from the qualification',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vet/qualifications', params.id] });
    },
    onError: error => {
      toast({
        title: 'Error',
        description: `Failed to remove unit: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update unit group mutation
  const updateUnitGroupMutation = useMutation({
    mutationFn: async ({
      structureId,
      unitGroup,
    }: {
      structureId: number;
      unitGroup: string | null;
    }) => {
      const res = await apiRequest(
        'PATCH',
        `/api/vet/qualifications/${params.id}/units/${structureId}`,
        { unitGroup }
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Unit group updated',
        description: 'Unit group has been updated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vet/qualifications', params.id] });
    },
    onError: error => {
      toast({
        title: 'Error',
        description: `Failed to update unit group: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  function onSubmit(data: FormValues) {
    updateMutation.mutate(data);
  }

  // Filter units based on search term
  const filteredUnits =
    unitsData && unitsData.units
      ? unitsData.units.filter(unit => {
          const searchTermLower = searchTerm.toLowerCase();
          return (
            unit.unitCode.toLowerCase().includes(searchTermLower) ||
            unit.unitTitle.toLowerCase().includes(searchTermLower) ||
            (unit.unitDescription?.toLowerCase() || '').includes(searchTermLower)
          );
        })
      : [];

  // Get unique unit groups
  const unitGroups = qualificationData?.qualification?.structure
    ? qualificationData.qualification.structure.reduce((groups: UnitGroups, structure) => {
        const groupName = structure.unitGroup || 'Ungrouped';
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(structure);
        return groups;
      }, {})
    : {};

  // Check if unit is already in the qualification
  const isUnitInQualification = (unitId: number) => {
    return qualificationData?.qualification?.structure
      ? qualificationData.qualification.structure.some(structure => structure.unitId === unitId)
      : false;
  };

  // Function to handle adding unit to qualification
  const handleAddUnit = (unitId: number) => {
    if (isUnitInQualification(unitId)) {
      toast({
        title: 'Unit already added',
        description: 'This unit is already part of the qualification',
        variant: 'destructive',
      });
      return;
    }

    addUnitMutation.mutate({
      unitId,
      isCore: false, // Default to elective
      unitGroup: selectedUnitGroup,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/vet/qualifications">Qualifications</BreadcrumbLink>
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
  if (error || !qualificationData) {
    return (
      <div className="space-y-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/vet/qualifications">Qualifications</BreadcrumbLink>
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
            {error instanceof Error ? error.message : 'Failed to load qualification'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/vet/qualifications')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Qualifications
        </Button>
      </div>
    );
  }

  // Render the component
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/vet/qualifications">Qualifications</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {qualificationData?.qualification?.qualificationCode || 'Qualification'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Edit Qualification</h1>
            <Badge variant={qualificationData?.qualification?.isActive ? 'default' : 'secondary'}>
              {qualificationData?.qualification?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {qualificationData?.qualification?.qualificationCode || 'No Code'} -{' '}
            {qualificationData?.qualification?.qualificationTitle || 'No Title'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/vet/qualifications/${params.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to View
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleting(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Qualification Details</CardTitle>
                  <CardDescription>Update qualification details and properties</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="qualificationCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qualification Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="qualificationTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qualification Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="qualificationDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ''}
                            className="min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="aqfLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AQF Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select AQF level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Certificate I">Certificate I</SelectItem>
                              <SelectItem value="Certificate II">Certificate II</SelectItem>
                              <SelectItem value="Certificate III">Certificate III</SelectItem>
                              <SelectItem value="Certificate IV">Certificate IV</SelectItem>
                              <SelectItem value="Diploma">Diploma</SelectItem>
                              <SelectItem value="Advanced Diploma">Advanced Diploma</SelectItem>
                              <SelectItem value="Graduate Certificate">
                                Graduate Certificate
                              </SelectItem>
                              <SelectItem value="Graduate Diploma">Graduate Diploma</SelectItem>
                              <SelectItem value="Bachelor Degree">Bachelor Degree</SelectItem>
                              <SelectItem value="Masters Degree">Masters Degree</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aqfLevelNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AQF Level Number</FormLabel>
                          <Select
                            onValueChange={value => field.onChange(parseInt(value))}
                            defaultValue={field.value.toString()}
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select AQF level number" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="6">6</SelectItem>
                              <SelectItem value="7">7</SelectItem>
                              <SelectItem value="8">8</SelectItem>
                              <SelectItem value="9">9</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="trainingPackage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Training Package</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="totalUnits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Units</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="coreUnits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Core Units</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="electiveUnits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Elective Units</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
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
                            <Input
                              type="number"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Active Qualification</FormLabel>
                            <FormDescription>Available for enrollment</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isApprenticeshipQualification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Apprenticeship Qualification</FormLabel>
                            <FormDescription>Eligible for apprenticeships</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isFundedQualification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Funded Qualification</FormLabel>
                            <FormDescription>Eligible for government funding</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="fundingDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funding Details</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ''}
                            className="min-h-[100px]"
                            placeholder="Enter funding details if this is a funded qualification"
                            disabled={!form.watch('isFundedQualification')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => navigate(`/vet/qualifications/${params.id}`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="units" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Units of Competency</CardTitle>
                <CardDescription>Manage units associated with this qualification</CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog open={isAddUnitDialogOpen} onOpenChange={setIsAddUnitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Unit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add Unit of Competency</DialogTitle>
                      <DialogDescription>
                        Search and add units to this qualification.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="grid w-full gap-1.5">
                          <Input
                            type="search"
                            placeholder="Search by code or title..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <Select
                          value={selectedUnitGroup || 'no-group'}
                          onValueChange={value =>
                            setSelectedUnitGroup(value === 'no-group' ? null : value)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Unit Group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-group">No Group</SelectItem>
                            {Object.keys(unitGroups).map(group => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                            <SelectItem value="New Group">+ New Group</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedUnitGroup === 'New Group' && (
                        <Input
                          placeholder="Enter new group name"
                          value={selectedUnitGroup === 'New Group' ? '' : selectedUnitGroup || ''}
                          onChange={e => setSelectedUnitGroup(e.target.value)}
                        />
                      )}

                      <ScrollArea className="h-[300px] rounded-md border">
                        {isLoadingUnits ? (
                          <div className="p-4 flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : filteredUnits.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            No units found
                          </div>
                        ) : (
                          <div className="p-4 space-y-2">
                            {filteredUnits.map(unit => (
                              <div
                                key={unit.id}
                                className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                              >
                                <div>
                                  <div className="font-medium">{unit.unitCode}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {unit.unitTitle}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAddUnit(unit.id)}
                                  disabled={
                                    isUnitInQualification(unit.id) || addUnitMutation.isPending
                                  }
                                >
                                  {isUnitInQualification(unit.id) ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddUnitDialogOpen(false)}>
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.keys(unitGroups).length === 0 ? (
                  <div className="text-center p-8 border rounded-md">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No Units Added</h3>
                    <p className="text-muted-foreground mb-4">
                      This qualification doesn't have any units of competency yet.
                    </p>
                    <Button onClick={() => setIsAddUnitDialogOpen(true)} variant="secondary">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Unit
                    </Button>
                  </div>
                ) : (
                  Object.entries(unitGroups).map(([groupName, structures]) => (
                    <Card key={groupName} className="overflow-hidden">
                      <CardHeader className="bg-muted/50">
                        <CardTitle className="text-base">
                          {groupName}
                          <Badge variant="outline" className="ml-2">
                            {structures.length} {structures.length === 1 ? 'unit' : 'units'}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="border-t">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[120px]">Unit Code</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead className="w-[100px] text-center">Type</TableHead>
                                <TableHead className="w-[100px] text-center">Hours</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {structures.map(structure => (
                                <TableRow key={structure.id}>
                                  <TableCell className="font-medium">
                                    {structure.unit.unitCode}
                                  </TableCell>
                                  <TableCell>{structure.unit.unitTitle}</TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant={structure.isCore ? 'default' : 'secondary'}>
                                      {structure.isCore ? 'Core' : 'Elective'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {structure.unit.nominalHours}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() =>
                                          updateUnitGroupMutation.mutate({
                                            structureId: structure.id,
                                            unitGroup: null, // Set to null to remove from group
                                          })
                                        }
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="destructive"
                                        onClick={() => removeUnitMutation.mutate(structure.id)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isDeleting && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Are you sure you want to delete this qualification?</AlertTitle>
          <AlertDescription className="flex items-center gap-4 mt-2">
            <span>This action cannot be undone.</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsDeleting(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                Yes, Delete
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
