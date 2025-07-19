import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Check, Save, X, Search, Loader2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const createQualificationSchema = z.object({
  code: z.string().min(1, 'Qualification code is required'),
  title: z.string().min(1, 'Qualification title is required'),
  description: z.string().min(1, 'Description is required'),
  level: z.string().min(1, 'AQF level is required'),
  industryArea: z.string().min(1, 'Industry area is required'),
  isActive: z.boolean().default(true),
  isSuperseded: z.boolean().default(false),
  nominalHours: z.number().min(0, 'Nominal hours must be a positive number').default(0),
  releases: z.array(z.string()).default([]),
});

interface TGAQualificationTrainingPackage {
  code: string;
  title: string;
}

interface TGAQualification {
  code: string;
  title: string;
  level?: number;
  status?: string;
  releaseDate?: string;
  expiryDate?: string;
  trainingPackage?: TGAQualificationTrainingPackage;
  nrtFlag?: boolean;
}

export default function CreateQualification() {
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQualification, setSelectedQualification] = useState<TGAQualification | null>(null);
  const [isQualificationPopoverOpen, setIsQualificationPopoverOpen] = useState(false);

  // Initialize form with default values
  const form = useForm<z.infer<typeof createQualificationSchema>>({
    resolver: zodResolver(createQualificationSchema),
    defaultValues: {
      code: '',
      title: '',
      description: '',
      level: '',
      industryArea: '',
      isActive: true,
      isSuperseded: false,
      nominalHours: 0,
      releases: [],
    },
  });

  const { toast } = useToast();

  // Search TGA qualifications
  const { data: searchResults, isLoading: isSearching } = useQuery<TGAQualification[]>({
    queryKey: ['/api/tga/search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 3) return [];
      const res = await apiRequest(
        'GET',
        `/api/tga/search?q=${encodeURIComponent(searchTerm)}&limit=10`
      );
      return await res.json();
    },
    enabled: searchTerm.length >= 3,
  });

  // Get qualification details from code (for after selection)
  const { data: qualificationDetails, isLoading: isLoadingDetails } = useQuery<any>({
    queryKey: ['/api/tga/qualification', selectedQualification?.code],
    queryFn: async () => {
      if (!selectedQualification?.code) return null;
      const res = await apiRequest('GET', `/api/tga/qualification/${selectedQualification.code}`);
      return await res.json();
    },
    enabled: !!selectedQualification?.code,
  });

  // Loading state for form fields when qualification is selected
  const [isPopulatingFields, setIsPopulatingFields] = useState(false);

  // Update form when qualification details are loaded
  useEffect(() => {
    if (selectedQualification) {
      setIsPopulatingFields(true);
    }

    if (qualificationDetails) {
      // Map AQF level from level number
      const aqfLevelMap = {
        1: 'Certificate I',
        2: 'Certificate II',
        3: 'Certificate III',
        4: 'Certificate IV',
        5: 'Diploma',
        6: 'Advanced Diploma',
        7: 'Bachelor Degree',
        8: 'Graduate Certificate',
        9: 'Masters Degree',
        10: 'Doctoral Degree',
      };

      // Set active based on status
      const isActive = qualificationDetails.status === 'Current';
      const isSuperseded = qualificationDetails.status === 'Superseded';

      // Get industry area from training package if available
      let industryArea = 'Other Services';
      if (qualificationDetails.trainingPackage?.title) {
        const packageTitle = qualificationDetails.trainingPackage.title;
        if (packageTitle.includes('Construction')) {
          industryArea = 'Construction';
        } else if (packageTitle.includes('Health')) {
          industryArea = 'Health Care and Social Assistance';
        } else if (packageTitle.includes('Education')) {
          industryArea = 'Education and Training';
        }
        // Additional mappings could be added here
      }

      // Set field values with a small delay to show loading state
      setTimeout(() => {
        form.setValue('code', qualificationDetails.code);
        form.setValue('title', qualificationDetails.title);
        form.setValue(
          'level',
          (qualificationDetails.level &&
            aqfLevelMap[qualificationDetails.level as keyof typeof aqfLevelMap]) ||
            ''
        );
        form.setValue(
          'description',
          `This qualification is part of the ${qualificationDetails.trainingPackage?.title || 'National Training Package'}.`
        );
        form.setValue('industryArea', industryArea);
        form.setValue('isActive', isActive);
        form.setValue('isSuperseded', isSuperseded);
        setIsPopulatingFields(false);

        toast({
          title: 'Qualification data loaded',
          description: `Details for ${qualificationDetails.code} populated from Training.gov.au`,
          variant: 'default',
        });
      }, 500); // Short delay for visual feedback
    }
  }, [qualificationDetails, selectedQualification]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createQualificationSchema>) => {
      setIsSubmitting(true);

      // Step 1: Create the qualification
      const res = await apiRequest('POST', '/api/vet/qualifications', data);
      const qualification = await res.json();

      // Step 2: If using TGA data and we have units, import them too
      if (selectedQualification?.code && qualificationDetails?.unitsOfCompetency) {
        try {
          // Import all units from TGA
          const importRes = await apiRequest(
            'POST',
            `/api/tga/import/${selectedQualification.code}`,
            {
              skipExisting: true, // Skip if qualification already exists
              importUnits: true, // Also import associated units
            }
          );

          // Include import results in our response
          qualification.unitsImported = true;
          qualification.importResults = await importRes.json();
        } catch (importError) {
          console.error('Error importing units from TGA:', importError);
          // Continue anyway - qualification was created, just units weren't imported
          qualification.unitsImported = false;
          qualification.importError =
            importError instanceof Error ? importError.message : 'Unknown error';
        }
      }

      return qualification;
    },
    onSuccess: data => {
      // Show appropriate message based on whether units were also imported
      let description = 'The qualification has been added to the system';
      if (data.unitsImported) {
        description += ' with associated units of competency';
      }

      toast({
        title: 'Qualification created successfully',
        description,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vet/qualifications'] });
      navigate('/vet/qualifications');
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create qualification',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: z.infer<typeof createQualificationSchema>) => {
    createMutation.mutate(data);
  };

  const handleSelectQualification = (qualification: TGAQualification) => {
    setSelectedQualification(qualification);
    setIsQualificationPopoverOpen(false);
  };

  // List of AQF levels
  const aqfLevels = [
    { value: 'Certificate I', label: 'Certificate I' },
    { value: 'Certificate II', label: 'Certificate II' },
    { value: 'Certificate III', label: 'Certificate III' },
    { value: 'Certificate IV', label: 'Certificate IV' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Advanced Diploma', label: 'Advanced Diploma' },
    { value: 'Associate Degree', label: 'Associate Degree' },
    { value: 'Bachelor Degree', label: 'Bachelor Degree' },
    { value: 'Graduate Certificate', label: 'Graduate Certificate' },
    { value: 'Graduate Diploma', label: 'Graduate Diploma' },
    { value: 'Masters Degree', label: 'Masters Degree' },
    { value: 'Doctoral Degree', label: 'Doctoral Degree' },
  ];

  // List of industry areas
  const industryAreas = [
    'Agriculture, Forestry and Fishing',
    'Mining',
    'Manufacturing',
    'Electricity, Gas, Water and Waste Services',
    'Construction',
    'Wholesale Trade',
    'Retail Trade',
    'Accommodation and Food Services',
    'Transport, Postal and Warehousing',
    'Information Media and Telecommunications',
    'Financial and Insurance Services',
    'Rental, Hiring and Real Estate Services',
    'Professional, Scientific and Technical Services',
    'Administrative and Support Services',
    'Public Administration and Safety',
    'Education and Training',
    'Health Care and Social Assistance',
    'Arts and Recreation Services',
    'Other Services',
  ];

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/vet/qualifications')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Qualification</h1>
          <p className="text-muted-foreground">Add a new AQF Qualification to the system</p>
        </div>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Qualification Details</CardTitle>
                  <CardDescription>Enter the details for the new qualification</CardDescription>
                </div>
                {isPopulatingFields && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Populating fields...</span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. UEE30920" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        The official qualification code from training.gov.au
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AQF Level</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select AQF level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {aqfLevels.map(level => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The Australian Qualifications Framework level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Qualification Title</FormLabel>
                    <Popover
                      open={isQualificationPopoverOpen}
                      onOpenChange={setIsQualificationPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isQualificationPopoverOpen}
                            className="justify-between w-full font-normal"
                          >
                            {selectedQualification ? (
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-semibold text-primary">
                                  {selectedQualification.code}
                                </span>
                                <span className="truncate">{selectedQualification.title}</span>
                              </div>
                            ) : field.value ? (
                              field.value
                            ) : (
                              'Search for a qualification...'
                            )}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start" side="bottom" sideOffset={5}>
                        <Command className="w-full">
                          <CommandInput
                            placeholder="Search qualifications by name..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            className="h-9"
                          />
                          {searchTerm.length > 0 && searchTerm.length < 3 && (
                            <div className="px-4 py-2.5 text-sm text-muted-foreground">
                              Enter at least 3 characters to search
                            </div>
                          )}
                          <CommandEmpty>
                            {isSearching ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            ) : (
                              'No qualifications found'
                            )}
                          </CommandEmpty>
                          <CommandList>
                            {searchResults && searchResults.length > 0 && (
                              <CommandGroup heading="Training.gov.au Qualifications">
                                {searchResults.map(qualification => (
                                  <CommandItem
                                    key={qualification.code}
                                    value={qualification.code}
                                    onSelect={() => handleSelectQualification(qualification)}
                                    className="flex flex-col items-start py-3"
                                  >
                                    <div className="flex items-center w-full">
                                      <span className="font-medium">{qualification.code}</span>
                                      <Badge
                                        variant={
                                          qualification.status === 'Current' ? 'default' : 'outline'
                                        }
                                        className="ml-2"
                                      >
                                        {qualification.status || 'Unknown'}
                                      </Badge>
                                      <span className="ml-auto text-sm text-muted-foreground">
                                        {qualification.level && `AQF Level ${qualification.level}`}
                                      </span>
                                    </div>
                                    <div className="mt-1 w-full truncate text-sm text-muted-foreground">
                                      {qualification.title}
                                    </div>
                                    {qualification.trainingPackage && (
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        {qualification.trainingPackage.title}
                                      </div>
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Search and select from official Training.gov.au qualifications (automatically
                      fills related fields)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a detailed description of the qualification..."
                        className="min-h-32"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      A comprehensive description of what this qualification covers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="industryArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry Area</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry area" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industryAreas.map(industry => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The primary industry area for this qualification
                      </FormDescription>
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
                          min="0"
                          placeholder="e.g. 900"
                          {...field}
                          value={field.value ?? 0}
                          onChange={e => {
                            field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        The estimated hours required to complete this qualification
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                      <FormControl>
                        <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Qualification</FormLabel>
                        <FormDescription>
                          Inactive qualifications will not be available for new enrollments
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isSuperseded"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                      <FormControl>
                        <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Superseded</FormLabel>
                        <FormDescription>
                          Mark if this qualification has been superseded by a newer version
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/vet/qualifications')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <span className="animate-spin">...</span>}
                <Save className="h-4 w-4" />
                Save Qualification
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
}
