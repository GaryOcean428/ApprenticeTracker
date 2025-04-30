import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Plus, 
  Pencil, 
  Trash2, 
  MoreHorizontal, 
  Package, 
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Define Training Package interface
interface TrainingPackage {
  id: number;
  code: string;
  title: string;
  description: string;
  releaseNumber: string;
  releaseDate: string;
  isActive: boolean;
  isSuperseded: boolean;
  industryArea: string;
  website: string;
  createdAt: string;
  updatedAt: string;
}

// Define Training Package creation schema
const trainingPackageSchema = z.object({
  code: z.string().min(2, { message: "Code must be at least 2 characters." }),
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  releaseNumber: z.string().min(1, { message: "Release number is required." }),
  releaseDate: z.string().optional(),
  isActive: z.boolean().default(true),
  isSuperseded: z.boolean().default(false),
  industryArea: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export default function TrainingPackagesList() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form for creating new training package
  const form = useForm<z.infer<typeof trainingPackageSchema>>({
    resolver: zodResolver(trainingPackageSchema),
    defaultValues: {
      code: "",
      title: "",
      description: "",
      releaseNumber: "",
      releaseDate: "",
      isActive: true,
      isSuperseded: false,
      industryArea: "",
      website: "",
    },
  });

  // Fetch training packages
  const { 
    data: trainingPackages, 
    isLoading,
    error,
    refetch
  } = useQuery<TrainingPackage[]>({
    queryKey: ['/api/vet/training-packages'],
    queryFn: async () => {
      // This would normally fetch from an API endpoint
      // For now, return mock data
      return [
        {
          id: 1,
          code: "BSB",
          title: "Business Services Training Package",
          description: "The Business Services Training Package provides a framework for vocational education and training for the business services industry.",
          releaseNumber: "8.0",
          releaseDate: "2023-05-15",
          isActive: true,
          isSuperseded: false,
          industryArea: "Business Services",
          website: "https://training.gov.au/Training/Details/BSB",
          createdAt: "2024-01-10T00:00:00.000Z",
          updatedAt: "2024-01-10T00:00:00.000Z"
        },
        {
          id: 2,
          code: "UEE",
          title: "Electrotechnology Training Package",
          description: "The Electrotechnology Training Package covers occupations and job roles in electrical, electronics, refrigeration, renewable energy, and telecommunications.",
          releaseNumber: "4.0",
          releaseDate: "2023-06-20",
          isActive: true,
          isSuperseded: false,
          industryArea: "Electrotechnology",
          website: "https://training.gov.au/Training/Details/UEE",
          createdAt: "2024-01-15T00:00:00.000Z",
          updatedAt: "2024-01-15T00:00:00.000Z"
        },
        {
          id: 3,
          code: "AUR",
          title: "Automotive Retail, Service and Repair Training Package",
          description: "The Automotive Retail, Service and Repair Training Package provides skills and knowledge for careers in automotive retail, service and repair.",
          releaseNumber: "6.0",
          releaseDate: "2022-11-10",
          isActive: true,
          isSuperseded: false,
          industryArea: "Automotive",
          website: "https://training.gov.au/Training/Details/AUR",
          createdAt: "2024-01-20T00:00:00.000Z",
          updatedAt: "2024-01-20T00:00:00.000Z"
        },
        {
          id: 4,
          code: "CPC",
          title: "Construction, Plumbing and Services Training Package",
          description: "The Construction, Plumbing and Services Training Package provides skills and knowledge for careers in construction, plumbing and services.",
          releaseNumber: "5.0",
          releaseDate: "2022-09-18",
          isActive: true,
          isSuperseded: false,
          industryArea: "Construction",
          website: "https://training.gov.au/Training/Details/CPC",
          createdAt: "2024-01-25T00:00:00.000Z",
          updatedAt: "2024-01-25T00:00:00.000Z"
        },
        {
          id: 5,
          code: "TAE",
          title: "Training and Education Training Package",
          description: "The Training and Education Training Package provides the skills and knowledge for careers in vocational education and training.",
          releaseNumber: "3.0",
          releaseDate: "2021-07-12",
          isActive: false,
          isSuperseded: true,
          industryArea: "Education and Training",
          website: "https://training.gov.au/Training/Details/TAE",
          createdAt: "2024-02-01T00:00:00.000Z",
          updatedAt: "2024-02-01T00:00:00.000Z"
        },
        {
          id: 6,
          code: "ICT",
          title: "Information and Communications Technology Training Package",
          description: "The Information and Communications Technology Training Package provides skills and knowledge for careers in IT and telecommunications.",
          releaseNumber: "7.0",
          releaseDate: "2023-02-28",
          isActive: true,
          isSuperseded: false,
          industryArea: "Information Technology",
          website: "https://training.gov.au/Training/Details/ICT",
          createdAt: "2024-02-05T00:00:00.000Z",
          updatedAt: "2024-02-05T00:00:00.000Z"
        },
        {
          id: 7,
          code: "SIT",
          title: "Tourism, Travel and Hospitality Training Package",
          description: "The Tourism, Travel and Hospitality Training Package provides skills and knowledge for careers in tourism, travel and hospitality.",
          releaseNumber: "2.0",
          releaseDate: "2022-04-15",
          isActive: true,
          isSuperseded: false,
          industryArea: "Hospitality and Tourism",
          website: "https://training.gov.au/Training/Details/SIT",
          createdAt: "2024-02-10T00:00:00.000Z",
          updatedAt: "2024-02-10T00:00:00.000Z"
        }
      ];
    }
  });

  // Create training package mutation
  const createTrainingPackageMutation = useMutation({
    mutationFn: async (data: z.infer<typeof trainingPackageSchema>) => {
      // This would normally post to an API endpoint
      // toast({
      //   title: "Training Package created",
      //   description: `Successfully created ${data.code} - ${data.title}`,
      // });
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Training Package created",
        description: `Successfully created ${form.getValues().code} - ${form.getValues().title}`,
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/vet/training-packages'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating Training Package",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof trainingPackageSchema>) => {
    createTrainingPackageMutation.mutate(data);
  };

  // Filter training packages based on search and filter
  const filteredTrainingPackages = trainingPackages?.filter(pkg => {
    // Apply search filter
    const matchesSearch = searchQuery === "" || 
      pkg.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.industryArea?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && pkg.isActive) ||
      (statusFilter === "inactive" && !pkg.isActive) ||
      (statusFilter === "superseded" && pkg.isSuperseded);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Training Packages</h2>
          <p className="text-muted-foreground">
            Manage Training Packages for vocational education and training
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Training Package
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Training Package</DialogTitle>
              <DialogDescription>
                Add a new Training Package to the system
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. BSB" {...field} />
                        </FormControl>
                        <FormDescription>
                          The official code for this Training Package
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="releaseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 8.0" {...field} />
                        </FormControl>
                        <FormDescription>
                          The release version of this Training Package
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
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Business Services Training Package" {...field} />
                      </FormControl>
                      <FormDescription>
                        The official title of this Training Package
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
                          placeholder="Enter a description of the Training Package"
                          className="min-h-24"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        A description of what this Training Package covers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industryArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry Area</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Business Services" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          The primary industry area for this package
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="releaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          The date this version was released
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. https://training.gov.au/..." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        Link to official information about this package
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active Package</FormLabel>
                          <FormDescription>
                            Inactive packages will not be available for new enrollments
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
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Superseded</FormLabel>
                          <FormDescription>
                            Mark if this package has been superseded by a newer version
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTrainingPackageMutation.isPending}>
                    {createTrainingPackageMutation.isPending && (
                      <span className="animate-spin mr-2">...</span>
                    )}
                    Create Package
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Training Packages</CardTitle>
          <CardDescription>
            View and manage Training Packages for VET qualifications and units of competency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by code, title or industry..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <select 
                className="h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Packages</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="superseded">Superseded</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-destructive">Error loading Training Packages</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Release</TableHead>
                    <TableHead>Industry Area</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrainingPackages?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No Training Packages found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrainingPackages?.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-medium">{pkg.code}</TableCell>
                        <TableCell>{pkg.title}</TableCell>
                        <TableCell>{pkg.releaseNumber}</TableCell>
                        <TableCell>{pkg.industryArea}</TableCell>
                        <TableCell>
                          {pkg.isSuperseded ? (
                            <Badge variant="outline" className="border-amber-500 text-amber-500">
                              Superseded
                            </Badge>
                          ) : pkg.isActive ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-destructive text-destructive">
                              <XCircle className="mr-1 h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/vet/training-packages/${pkg.id}`)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: "Edit Package", description: "Edit functionality coming soon" })}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Package
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => toast({ title: "Delete Package", description: "Delete functionality coming soon" })}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Package
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredTrainingPackages?.length || 0} Training Packages found
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}