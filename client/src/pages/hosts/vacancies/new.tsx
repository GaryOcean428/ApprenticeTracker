import { useState } from "react";
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
  CardFooter,
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
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { ArrowLeft, CheckCircle, MapPin, Briefcase } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Define the form schema
const vacancyFormSchema = z.object({
  hostEmployerId: z.string().min(1, "Host employer is required"),
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  location: z.string().min(3, "Location is required"),
  trade: z.string().min(1, "Trade or qualification is required"),
  description: z.string().min(20, "Please provide a detailed description"),
  requirements: z.string().min(10, "Please list the key requirements"),
  isHighPriority: z.boolean().default(false),
  status: z.enum(["open", "filled", "closed"]),
  postedDate: z.date({
    required_error: "Posted date is required",
  }),
  closingDate: z.date({
    required_error: "Closing date is required",
  }).nullable(),
});

type VacancyFormValues = z.infer<typeof vacancyFormSchema>;

// Host employer type
interface HostEmployer {
  id: number;
  name: string;
}

// Trade options
const tradeOptions = [
  { value: "carpentry", label: "Carpentry" },
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "automotive", label: "Automotive" },
  { value: "hairdressing", label: "Hairdressing" },
  { value: "commercial_cookery", label: "Commercial Cookery" },
  { value: "it_support", label: "IT Support" },
  { value: "business_admin", label: "Business Administration" },
  { value: "horticulture", label: "Horticulture" },
  { value: "other", label: "Other" }
];

const NewVacancyPage = () => {
  const [, navigate] = useLocation();
  
  // Fetch host employers for the dropdown
  const { data: hostEmployers, isLoading: loadingHosts } = useQuery({
    queryKey: ["/api/hosts"],
    queryFn: async () => {
      const res = await fetch("/api/hosts");
      if (!res.ok) {
        // Return mock data if API not available yet
        console.warn("API endpoint for hosts not available");
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
      requirements: "",
      isHighPriority: false,
      status: "open",
      postedDate: new Date(),
      closingDate: addDays(new Date(), 30), // Default to 30 days from now
    },
  });

  // Mutation for creating vacancy
  const createVacancyMutation = useMutation({
    mutationFn: async (data: VacancyFormValues) => {
      return apiRequest("POST", "/api/vacancies", {
        ...data,
        postedDate: format(data.postedDate, "yyyy-MM-dd"),
        closingDate: data.closingDate ? format(data.closingDate, "yyyy-MM-dd") : null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Vacancy created",
        description: "The apprenticeship vacancy has been posted successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vacancies"] });
      navigate("/hosts/vacancies");
    },
    onError: (error) => {
      console.error("Failed to create vacancy:", error);
      toast({
        title: "Failed to create vacancy",
        description: "There was an error posting the vacancy. Please try again.",
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
        <h1 className="text-2xl font-bold">Post New Apprenticeship Vacancy</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vacancy Details</CardTitle>
          <CardDescription>
            Enter the details of the new apprenticeship vacancy
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
                        Select the host employer offering this vacancy
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
                      <FormLabel>Vacancy Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Apprentice Carpenter" {...field} />
                      </FormControl>
                      <FormDescription>
                        The title should clearly indicate the apprenticeship role
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
                        <div className="flex">
                          <MapPin className="h-4 w-4 mr-2 mt-3 text-muted-foreground" />
                          <Input 
                            placeholder="e.g. Melbourne CBD, Victoria" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        The location where the apprentice will work
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
                      <FormLabel>Trade or Qualification</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a trade or qualification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tradeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the relevant trade or qualification for this vacancy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postedDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Posted Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      <FormDescription>
                        The date when this vacancy will be published
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="closingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Closing Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      <FormDescription>
                        The date when this vacancy will close for applications
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
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="filled">Filled</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The current status of this vacancy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isHighPriority"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          High Priority Vacancy
                        </FormLabel>
                        <FormDescription>
                          Mark this vacancy as high priority if it needs immediate attention
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
                    <FormLabel>Vacancy Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed description of the vacancy, including the role, responsibilities, and what the apprentice will learn"
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A comprehensive description will attract better candidates
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
                        placeholder="List the key requirements for this vacancy (e.g., qualifications, skills, personal attributes)"
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Specify what qualities and skills you're looking for in candidates
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
                      <Briefcase className="mr-2 h-4 w-4" /> Post Vacancy
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
