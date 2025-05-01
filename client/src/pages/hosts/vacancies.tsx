import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Building2,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Info,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

// Define types
interface Vacancy {
  id: number;
  hostEmployerId: number;
  title: string;
  description: string;
  industry: string;
  qualification: string;
  numberOfPositions: number;
  location: string;
  salaryRange: string;
  workingHours: string;
  status: "open" | "filled" | "closed";
  publishedDate: string;
  expiryDate: string | null;
  requirements: string;
  benefits: string;
  createdAt: string;
  updatedAt: string;
}

interface Candidate {
  id: number;
  vacancyId: number;
  apprenticeId: number;
  firstName: string;
  lastName: string;
  email: string;
  status: "applied" | "shortlisted" | "interviewing" | "offered" | "accepted" | "rejected";
  applicationDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Form schema for new vacancy
const vacancyFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  industry: z.string().min(1, { message: "Industry is required" }),
  qualification: z.string().min(1, { message: "Qualification is required" }),
  numberOfPositions: z.coerce.number().min(1, { message: "At least 1 position is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  salaryRange: z.string().min(1, { message: "Salary range is required" }),
  workingHours: z.string().min(1, { message: "Working hours are required" }),
  expiryDate: z.string().optional(),
  requirements: z.string().min(10, { message: "Requirements must be at least 10 characters" }),
  benefits: z.string().min(10, { message: "Benefits must be at least 10 characters" }),
});

type VacancyFormValues = z.infer<typeof vacancyFormSchema>;

const HostVacanciesPage = () => {
  const params = useParams<{ id?: string }>();
  const hostId = params.id ? parseInt(params.id) : undefined;
  const [activeTab, setActiveTab] = useState("vacancies");
  const [isAddingVacancy, setIsAddingVacancy] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [vacancyToDelete, setVacancyToDelete] = useState<Vacancy | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form for creating/editing vacancies
  const form = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      industry: "",
      qualification: "",
      numberOfPositions: 1,
      location: "",
      salaryRange: "",
      workingHours: "",
      expiryDate: "",
      requirements: "",
      benefits: "",
    },
  });

  // Reset form when dialog closes
  const resetForm = () => {
    form.reset();
    setSelectedVacancy(null);
  };

  // Fill form with existing vacancy data when editing
  const editVacancy = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    form.reset({
      title: vacancy.title,
      description: vacancy.description,
      industry: vacancy.industry,
      qualification: vacancy.qualification,
      numberOfPositions: vacancy.numberOfPositions,
      location: vacancy.location,
      salaryRange: vacancy.salaryRange,
      workingHours: vacancy.workingHours,
      expiryDate: vacancy.expiryDate ? format(new Date(vacancy.expiryDate), "yyyy-MM-dd") : undefined,
      requirements: vacancy.requirements,
      benefits: vacancy.benefits,
    });
    setIsAddingVacancy(true);
  };

  // Fetch host employer details
  const { data: host, isLoading: hostLoading } = useQuery({
    queryKey: ["/api/hosts", hostId],
    queryFn: async () => {
      if (!hostId) return null;
      const res = await fetch(`/api/hosts/${hostId}`);
      if (!res.ok) throw new Error("Failed to fetch host employer");
      return res.json();
    },
    enabled: !!hostId,
  });

  // Fetch vacancies
  const { data: vacancies, isLoading: vacanciesLoading } = useQuery({
    queryKey: ["/api/hosts", hostId, "vacancies"],
    queryFn: async () => {
      if (!hostId) return [];
      const res = await fetch(`/api/host-vacancies/${hostId}`);
      if (!res.ok) throw new Error("Failed to fetch vacancies");
      return res.json() as Promise<Vacancy[]>;
    },
    enabled: !!hostId,
  });

  // Fetch candidates
  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ["/api/hosts", hostId, "candidates"],
    queryFn: async () => {
      if (!hostId) return [];
      const res = await fetch(`/api/host-candidates/${hostId}`);
      if (!res.ok) throw new Error("Failed to fetch candidates");
      return res.json() as Promise<Candidate[]>;
    },
    enabled: !!hostId,
  });

  // Create/update vacancy mutation
  const vacancyMutation = useMutation({
    mutationFn: async (data: VacancyFormValues & { id?: number }) => {
      const isEdit = !!data.id;
      const url = isEdit 
        ? `/api/host-vacancies/${data.id}` 
        : "/api/host-vacancies";

      const method = isEdit ? "PATCH" : "POST";
      const payload = isEdit ? data : { ...data, hostEmployerId: hostId, status: "open" };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save vacancy");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hosts", hostId, "vacancies"] });
      setIsAddingVacancy(false);
      toast({
        title: selectedVacancy ? "Vacancy Updated" : "Vacancy Created",
        description: selectedVacancy 
          ? "The vacancy has been successfully updated." 
          : "The new vacancy has been successfully created.",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete vacancy mutation
  const deleteVacancyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/host-vacancies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete vacancy");
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hosts", hostId, "vacancies"] });
      toast({
        title: "Vacancy Deleted",
        description: "The vacancy has been successfully deleted.",
      });
      setVacancyToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update candidate status mutation
  const updateCandidateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/candidates/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update candidate status");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hosts", hostId, "candidates"] });
      toast({
        title: "Candidate Status Updated",
        description: "The candidate status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: VacancyFormValues) => {
    vacancyMutation.mutate({
      ...data,
      id: selectedVacancy?.id,
    });
  };

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return format(new Date(dateStr), "dd MMM yyyy");
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-100 text-green-800">Open</Badge>;
      case "filled":
        return <Badge className="bg-blue-100 text-blue-800">Filled</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      case "applied":
        return <Badge className="bg-blue-100 text-blue-800">Applied</Badge>;
      case "shortlisted":
        return <Badge className="bg-purple-100 text-purple-800">Shortlisted</Badge>;
      case "interviewing":
        return <Badge className="bg-yellow-100 text-yellow-800">Interviewing</Badge>;
      case "offered":
        return <Badge className="bg-pink-100 text-pink-800">Offered</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Filter candidates by vacancy
  const getCandidatesByVacancy = (vacancyId: number) => {
    return candidates?.filter((candidate) => candidate.vacancyId === vacancyId) || [];
  };

  // Loading state
  if (hostLoading || vacanciesLoading || candidatesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {host ? `${host.name} - Vacancies` : "Host Employer Vacancies"}
        </h1>
        <Dialog open={isAddingVacancy} onOpenChange={setIsAddingVacancy}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Vacancy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {selectedVacancy ? "Edit Vacancy" : "Create New Vacancy"}
              </DialogTitle>
              <DialogDescription>
                {selectedVacancy
                  ? "Update the details of this vacancy"
                  : "Fill in the details to create a new vacancy for apprentices"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Apprentice Carpenter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="construction">Construction</SelectItem>
                            <SelectItem value="electrical">Electrical</SelectItem>
                            <SelectItem value="plumbing">Plumbing</SelectItem>
                            <SelectItem value="automotive">Automotive</SelectItem>
                            <SelectItem value="hospitality">Hospitality</SelectItem>
                            <SelectItem value="it">Information Technology</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualification</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select qualification" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="certificate_ii">Certificate II</SelectItem>
                            <SelectItem value="certificate_iii">Certificate III</SelectItem>
                            <SelectItem value="certificate_iv">Certificate IV</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                            <SelectItem value="advanced_diploma">Advanced Diploma</SelectItem>
                          </SelectContent>
                        </Select>
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
                          placeholder="Provide a detailed description of the role"
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numberOfPositions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Positions</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
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
                          <Input placeholder="e.g. Sydney CBD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salaryRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Range</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. $40,000 - $45,000 p.a." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Working Hours</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 38 hours per week, Mon-Fri" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        When applications for this position will close
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List the requirements for this position"
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefits</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List the benefits offered with this position"
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsAddingVacancy(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={vacancyMutation.isPending}>
                    {vacancyMutation.isPending ? "Saving..." : selectedVacancy ? "Update Vacancy" : "Create Vacancy"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <Tabs defaultValue="vacancies" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="vacancies">Active Vacancies</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="vacancies" className="mt-0">
            {vacancies && vacancies.length > 0 ? (
              <div className="space-y-6">
                {vacancies
                  .filter((vacancy) => vacancy.status !== "closed")
                  .map((vacancy) => (
                    <Card key={vacancy.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/50 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{vacancy.title}</CardTitle>
                            <CardDescription>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Building2 className="mr-1 h-3.5 w-3.5" />
                                  {vacancy.industry}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="mr-1 h-3.5 w-3.5" />
                                  {vacancy.location}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <DollarSign className="mr-1 h-3.5 w-3.5" />
                                  {vacancy.salaryRange}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="mr-1 h-3.5 w-3.5" />
                                  {vacancy.workingHours}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="mr-1 h-3.5 w-3.5" />
                                  Posted: {formatDate(vacancy.publishedDate)}
                                </div>
                              </div>
                            </CardDescription>
                          </div>
                          <div className="flex items-start gap-2">
                            {getStatusBadge(vacancy.status)}
                            <div className="flex">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editVacancy(vacancy)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Vacancy</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this vacancy? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteVacancyMutation.mutate(vacancy.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Position Details</h4>
                            <p className="text-sm text-muted-foreground">{vacancy.description}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Requirements</h4>
                              <p className="text-sm text-muted-foreground">{vacancy.requirements}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Benefits</h4>
                              <p className="text-sm text-muted-foreground">{vacancy.benefits}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-muted/30 flex justify-between">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span className="text-sm">
                            {vacancy.numberOfPositions} position{vacancy.numberOfPositions > 1 ? "s" : ""} available
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          {vacancy.expiryDate && (
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Closes: {formatDate(vacancy.expiryDate)}
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <Button variant="outline" size="sm">
                              <UserPlus className="h-4 w-4 mr-2" />
                              View Applicants ({getCandidatesByVacancy(vacancy.id).length})
                            </Button>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="text-muted-foreground">
                  No active vacancies. Create a vacancy to start receiving applications.
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="candidates" className="mt-0">
            {candidates && candidates.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Vacancy</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => {
                    const vacancy = vacancies?.find(v => v.id === candidate.vacancyId);
                    return (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">{candidate.firstName} {candidate.lastName}</div>
                            <div className="text-sm text-muted-foreground">{candidate.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{vacancy?.title || "Unknown Vacancy"}</TableCell>
                        <TableCell>{formatDate(candidate.applicationDate)}</TableCell>
                        <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Select
                              value={candidate.status}
                              onValueChange={(value) => {
                                updateCandidateStatusMutation.mutate({
                                  id: candidate.id,
                                  status: value,
                                });
                              }}
                              disabled={updateCandidateStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="applied">Applied</SelectItem>
                                <SelectItem value="shortlisted">Shortlist</SelectItem>
                                <SelectItem value="interviewing">Interview</SelectItem>
                                <SelectItem value="offered">Offer</SelectItem>
                                <SelectItem value="accepted">Accept</SelectItem>
                                <SelectItem value="rejected">Reject</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm">
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                <div className="text-muted-foreground">
                  No candidates have applied to your vacancies yet.
                </div>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
};

export default HostVacanciesPage;