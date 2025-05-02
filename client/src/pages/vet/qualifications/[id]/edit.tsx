import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  Save,
  Trash2,
  AlertCircle,
  ChevronDown,
  FolderInput,
  BookOpen,
  Award,
  FileBadge,
  CheckSquare,
  Coins,
  GraduationCap,
  Timer,
  Hash,
  Boxes,
  BookText,
  Info,
  FileText,
} from "lucide-react";

const aqfLevels = [
  "Certificate I",
  "Certificate II",
  "Certificate III",
  "Certificate IV",
  "Diploma",
  "Advanced Diploma",
  "Graduate Certificate",
  "Graduate Diploma",
  "Bachelor Degree",
  "Master's Degree"
];

const formSchema = z.object({
  qualificationCode: z.string().min(1, "Qualification code is required"),
  qualificationTitle: z.string().min(1, "Qualification title is required"),
  qualificationDescription: z.string().min(1, "Description is required"),
  aqfLevel: z.string().min(1, "AQF level is required"),
  aqfLevelNumber: z.coerce.number().int().min(1).max(10),
  trainingPackage: z.string().min(1, "Training package is required"),
  trainingPackageRelease: z.string().min(1, "Release information is required"),
  totalUnits: z.coerce.number().int().min(1, "At least 1 total unit is required"),
  coreUnits: z.coerce.number().int().min(0, "Cannot be negative"),
  electiveUnits: z.coerce.number().int().min(0, "Cannot be negative"),
  nominalHours: z.coerce.number().int().min(0, "Cannot be negative"),
  isActive: z.boolean().default(true),
  isApprenticeshipQualification: z.boolean().default(false),
  isFundedQualification: z.boolean().default(false),
  fundingDetails: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
}

export default function EditQualification() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch qualification data
  const { data: qualificationData, isLoading, error } = useQuery<{ qualification: Qualification }>({
    queryKey: [`/api/vet/qualifications/${params.id}`],
  });
  
  const qualification = qualificationData?.qualification;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      qualificationCode: "",
      qualificationTitle: "",
      qualificationDescription: "",
      aqfLevel: "",
      aqfLevelNumber: 1,
      trainingPackage: "",
      trainingPackageRelease: "",
      totalUnits: 0,
      coreUnits: 0,
      electiveUnits: 0,
      nominalHours: 0,
      isActive: true,
      isApprenticeshipQualification: false,
      isFundedQualification: false,
      fundingDetails: "",
    },
  });
  
  // Update form values when qualification data is loaded
  useEffect(() => {
    if (qualification) {
      // Reset form with qualification data
      form.reset({
        qualificationCode: qualification.qualificationCode || "",
        qualificationTitle: qualification.qualificationTitle || "",
        qualificationDescription: qualification.qualificationDescription || "",
        aqfLevel: qualification.aqfLevel || "",
        aqfLevelNumber: qualification.aqfLevelNumber || 1,
        trainingPackage: qualification.trainingPackage || "",
        trainingPackageRelease: qualification.trainingPackageRelease || "",
        totalUnits: qualification.totalUnits || 0,
        coreUnits: qualification.coreUnits || 0,
        electiveUnits: qualification.electiveUnits || 0,
        nominalHours: qualification.nominalHours || 0,
        isActive: qualification.isActive,
        isApprenticeshipQualification: qualification.isApprenticeshipQualification,
        isFundedQualification: qualification.isFundedQualification,
        fundingDetails: qualification.fundingDetails || "",
      });
    }
  }, [qualification, form]);
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest(
        "PATCH",
        `/api/vet/qualifications/${params.id}`,
        { qualificationData: data }
      );
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/vet/qualifications"] });
      queryClient.invalidateQueries({ queryKey: [`/api/vet/qualifications/${params.id}`] });
      
      toast({
        title: "Qualification updated",
        description: "The qualification has been updated successfully.",
      });
      
      // Navigate back to qualification details page
      navigate(`/vet/qualifications/${params.id}`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update qualification",
        description: error.message || "An error occurred while updating the qualification.",
      });
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "DELETE",
        `/api/vet/qualifications/${params.id}`
      );
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/vet/qualifications"] });
      
      toast({
        title: "Qualification deleted",
        description: "The qualification has been deleted successfully.",
      });
      
      // Navigate back to qualifications list
      navigate("/vet/qualifications");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to delete qualification",
        description: error.message || "An error occurred while deleting the qualification.",
      });
      setIsDeleting(false);
    },
  });
  
  // Form submission handler
  function onSubmit(data: FormValues) {
    updateMutation.mutate(data);
  }
  
  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load qualification data. Please try again later.
          </AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => navigate("/vet/qualifications")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Qualifications
        </Button>
      </div>
    );
  }
  
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
                <BreadcrumbLink href={`/vet/qualifications/${params.id}`}>
                  {isLoading ? "Details" : qualification?.qualificationCode}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/vet/qualifications/${params.id}`)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              {isLoading ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                `Edit ${qualification?.qualificationCode}`
              )}
            </h1>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/vet/qualifications/${params.id}`)}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setIsDeleting(true)}
            disabled={isDeleting || deleteMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button 
            type="submit" 
            form="qualification-form" 
            disabled={updateMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form id="qualification-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  The core details of the qualification including code, title and description.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="qualificationCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          Qualification Code
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. CPC40120" {...field} />
                        </FormControl>
                        <FormDescription>
                          The official national code for this qualification
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="qualificationTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Qualification Title
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Certificate IV in Building and Construction"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The full official title of this qualification
                        </FormDescription>
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
                      <FormLabel className="flex items-center gap-2">
                        <BookText className="h-4 w-4 text-muted-foreground" />
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a description of the qualification..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A detailed description of what this qualification covers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Classification Details</CardTitle>
                <CardDescription>
                  Information about the qualification's level, training package and unit requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="aqfLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          AQF Level
                        </FormLabel>
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
                            {aqfLevels.map((level, index) => (
                              <SelectItem key={level} value={level}>
                                {level}
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
                  
                  <FormField
                    control={form.control}
                    name="aqfLevelNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          AQF Level Number
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="10"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The numeric value of the AQF level (1-10)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="trainingPackage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          Training Package
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. CPC - Construction, Plumbing and Services" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The training package this qualification belongs to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="trainingPackageRelease"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileBadge className="h-4 w-4 text-muted-foreground" />
                          Training Package Release
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Release 5.0" {...field} />
                        </FormControl>
                        <FormDescription>
                          The version/release of the training package
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="totalUnits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Boxes className="h-4 w-4 text-muted-foreground" />
                          Total Units
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Total units required
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="coreUnits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4 text-muted-foreground" />
                          Core Units
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of core units
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="electiveUnits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FolderInput className="h-4 w-4 text-muted-foreground" />
                          Elective Units
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of elective units
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="nominalHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        Nominal Hours
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormDescription>
                        The estimated time (in hours) required to complete this qualification
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status & Classification</CardTitle>
                <CardDescription>
                  Active status and additional classification information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Active Qualification
                          </FormLabel>
                          <FormDescription>
                            Indicates this qualification is currently active and available
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isApprenticeshipQualification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Apprenticeship Qualification
                          </FormLabel>
                          <FormDescription>
                            Can be delivered through an apprenticeship pathway
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isFundedQualification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Funded Qualification
                          </FormLabel>
                          <FormDescription>
                            Eligible for government funding or subsidies
                          </FormDescription>
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
                      <FormLabel className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-muted-foreground" />
                        Funding Details
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter details about available funding or subsidies for this qualification..."
                          className="min-h-[100px]"
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Specific information about funding arrangements (if applicable)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/vet/qualifications/${params.id}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
            
            {isDeleting && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Are you sure you want to delete this qualification?</AlertTitle>
                <AlertDescription className="flex items-center gap-4 mt-2">
                  <span>This action cannot be undone.</span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsDeleting(false)}
                    >
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
          </form>
        </Form>
      )}
    </div>
  );
}