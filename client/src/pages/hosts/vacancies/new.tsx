import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { ArrowLeft, BriefcaseBusiness, MapPin, GraduationCap, Briefcase } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Define the form schema
const vacancyFormSchema = z.object({
  hostEmployerId: z.string().min(1, "Host employer is required"),
  title: z.string().min(3, "Job title is required"),
  location: z.string().min(3, "Location is required"),
  trade: z.string().min(1, "Trade is required"),
  description: z.string().min(10, "Job description is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  numberOfPositions: z.coerce.number().min(1, "At least one position is required"),
  status: z.enum(["draft", "open", "filled", "closed"]),
  requirements: z.string().optional(),
  specialRequirements: z.string().optional(),
  isRemote: z.boolean().default(false),
  isApprenticeshipEligible: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  minWage: z.coerce.number().min(0, "Minimum wage must be 0 or more"),
  maxWage: z.coerce.number().min(0, "Maximum wage must be 0 or more"),
});

type VacancyFormValues = z.infer<typeof vacancyFormSchema>;

// Host employer type
interface HostEmployer {
  id: number;
  name: string;
}

// Trade options
const tradeOptions = [
  "Carpentry",
  "Electrical",
  "Plumbing",
  "Automotive",
  "Commercial Cookery",
  "Hairdressing",
  "Information Technology",
  "Business Administration",
  "Childcare",
  "Engineering",
  "Horticulture",
  "Hospitality",
  "Retail",
  "Construction",
  "Healthcare",
  "Other"
];

// Location options
const locationOptions = [
  "Sydney CBD",
  "Sydney - Inner West",
  "Sydney - Western Suburbs",
  "Sydney - Northern Beaches",
  "Sydney - Eastern Suburbs",
  "Sydney - South",
  "Melbourne CBD",
  "Melbourne - Inner Suburbs",
  "Melbourne - Eastern Suburbs",
  "Melbourne - Western Suburbs",
  "Brisbane CBD",
  "Brisbane - Inner Suburbs",
  "Gold Coast",
  "Perth Metropolitan",
  "Adelaide Metropolitan",
  "Canberra",
  "Hobart",
  "Darwin",
  "Regional NSW",
  "Regional VIC",
  "Regional QLD",
  "Regional SA",
  "Regional WA",
  "Regional TAS",
  "Regional NT",
  "Remote"
];

const NewVacancyPage = () => {
  const [, navigate] = useLocation();
  
  // Fetch host employers for the dropdown
  const { data: hostEmployers, isLoading: loadingHosts } = useQuery({
    queryKey: ["/api/hosts"],
    queryFn: async () => {
      const res = await fetch("/api/hosts");
      if (!res.ok) {
        // API not available yet
        return [];
      }
      return res.json() as Promise<HostEmployer[]>;
    },
  });

  // Set up form with default values
  const form = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancyFormSchema),
    defaultValues: {
      hostEmployerId: "",
      title: "",
      location: "",
      trade: "",
      description: "",
      startDate: addDays(new Date(), 14), // Default to 2 weeks from now
      numberOfPositions: 1,
      status: "draft",
      requirements: "",
      specialRequirements: "",
      isRemote: false,
      isApprenticeshipEligible: true,
      isPublic: true,
      minWage: 0,
      maxWage: 0,
    },
  });

  // Mutation for creating vacancy
  const createVacancyMutation = useMutation({
    mutationFn: async (data: VacancyFormValues) => {
      return apiRequest("POST", "/api/vacancies", {
        ...data,
        startDate: format(data.startDate, "yyyy-MM-dd"),
      });
    },
    onSuccess: () => {
      toast({
        title: "Vacancy created",
        description: "The job vacancy has been created successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vacancies"] });
      navigate("/hosts/vacancies");
    },
    onError: (error) => {
      console.error("Failed to create vacancy:", error);
      toast({
        title: "Failed to create vacancy",
        description: "There was an error creating the vacancy. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: VacancyFormValues) => {
    createVacancyMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate("/hosts/vacancies")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Vacancy</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vacancy Details</CardTitle>
          <CardDescription>
            Create a new job vacancy for host employers to fill with apprentices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="hostEmployerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host Employer</FormLabel>
                      <Select
                        disabled={loadingHosts}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a host employer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {hostEmployers?.map((host) => (
                            <SelectItem key={host.id} value={host.id.toString()}>
                              {host.name}
                            </SelectItem>
                          )) || (
                            <SelectItem value="" disabled>
                              No host employers available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the host employer for this vacancy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Apprentice Electrician" {...field} />
                      </FormControl>
                      <FormDescription>
                        The title of the position
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trade/Occupation</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trade or occupation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tradeOptions.map((trade) => (
                            <SelectItem key={trade} value={trade}>
                              {trade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The trade or occupation category
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locationOptions.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The primary work location
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      <FormDescription>
                        When the position is expected to start
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numberOfPositions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Positions</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        How many identical positions are available
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vacancy status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="filled">Filled</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Current status of the vacancy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="minWage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Wage ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormDescription>
                          Minimum hourly wage rate
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxWage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Wage ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormDescription>
                          Maximum hourly wage rate
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <FormField
                    control={form.control}
                    name="isRemote"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Remote Work Available
                          </FormLabel>
                          <FormDescription>
                            Position is eligible for remote or work-from-home arrangements
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isApprenticeshipEligible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Apprenticeship Eligible
                          </FormLabel>
                          <FormDescription>
                            Position is eligible for formal apprenticeship or traineeship arrangement
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Publicly Visible
                          </FormLabel>
                          <FormDescription>
                            Show this vacancy on the public job board and allow direct applications
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a detailed job description..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description of the job responsibilities and daily tasks
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
                    <FormLabel>Requirements (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter job requirements and qualifications..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Required qualifications, certifications, skills, or experience
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requirements (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any special requirements or notes..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Any special requirements, conditions, benefits, or additional information
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/hosts/vacancies")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createVacancyMutation.isPending}
                >
                  {createVacancyMutation.isPending ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <BriefcaseBusiness className="mr-2 h-4 w-4" /> Create Vacancy
                    </span>
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

export default NewVacancyPage;