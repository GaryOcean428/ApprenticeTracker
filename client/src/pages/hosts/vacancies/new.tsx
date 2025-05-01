import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Loader2, CalendarIcon, ArrowLeft } from "lucide-react";

// Form schema
const vacancyFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  hostEmployerId: z.coerce.number().min(1, "Please select a host employer"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.string().optional(),
  specialRequirements: z.string().optional(),
  positionCount: z.coerce.number().min(1, "Must have at least 1 position").max(50, "Maximum 50 positions allowed"),
  isRemote: z.boolean().default(false),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  status: z.enum(["draft", "open", "filled", "closed"]),
  qualificationId: z.coerce.number().optional(),
  aqfLevel: z.coerce.number().min(1).max(10).optional(),
  industryRelevance: z.string().optional(),
  trainingRequirements: z.string().optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
  awardClassificationId: z.coerce.number().optional(),
  registeredGTO: z.boolean().default(true)
});

type VacancyFormValues = z.infer<typeof vacancyFormSchema>;

interface HostEmployer {
  id: number;
  name: string;
}

interface Qualification {
  id: number;
  name: string;
  code: string;
  aqfLevel: number;
}

interface Award {
  id: number;
  name: string;
  code: string;
}

interface AwardClassification {
  id: number;
  awardId: number;
  level: string;
  name: string;
  minHourlyRate: number;
}

const NewVacancyPage = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedAward, setSelectedAward] = useState<number | null>(null);
  
  // Get host employers
  const { data: hostEmployers, isLoading: hostLoading } = useQuery({
    queryKey: ["/api/hosts"],
    queryFn: async () => {
      const res = await fetch("/api/hosts");
      if (!res.ok) {
        throw new Error("Failed to fetch host employers");
      }
      return res.json() as Promise<HostEmployer[]>;
    },
  });
  
  // Get qualifications
  const { data: qualifications, isLoading: qualificationsLoading } = useQuery({
    queryKey: ["/api/qualifications"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/qualifications");
        if (!res.ok) {
          throw new Error("Failed to fetch qualifications");
        }
        return res.json() as Promise<Qualification[]>;
      } catch (error) {
        console.error("Error fetching qualifications:", error);
        return [];
      }
    },
  });
  
  // Get awards
  const { data: awards, isLoading: awardsLoading } = useQuery({
    queryKey: ["/api/awards"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/awards");
        if (!res.ok) {
          throw new Error("Failed to fetch awards");
        }
        return res.json() as Promise<Award[]>;
      } catch (error) {
        console.error("Error fetching awards:", error);
        return [];
      }
    },
  });
  
  // Get award classifications
  const { data: classifications, isLoading: classificationsLoading } = useQuery({
    queryKey: ["/api/award-classifications", selectedAward],
    queryFn: async () => {
      if (!selectedAward) return [];
      
      try {
        const res = await fetch(`/api/award-classifications/${selectedAward}`);
        if (!res.ok) {
          throw new Error("Failed to fetch award classifications");
        }
        return res.json() as Promise<AwardClassification[]>;
      } catch (error) {
        console.error("Error fetching award classifications:", error);
        return [];
      }
    },
    enabled: !!selectedAward,
  });
  
  // Initialize form
  const form = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancyFormSchema),
    defaultValues: {
      title: "",
      location: "",
      description: "",
      requirements: "",
      specialRequirements: "",
      positionCount: 1,
      isRemote: false,
      status: "draft",
      registeredGTO: true
    },
  });
  
  // Create vacancy mutation
  const createVacancyMutation = useMutation({
    mutationFn: async (data: VacancyFormValues) => {
      const formattedData = {
        ...data,
        startDate: format(data.startDate, "yyyy-MM-dd"),
        createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        updatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      };
      
      const res = await apiRequest("POST", "/api/vacancies", formattedData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vacancy created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vacancies"] });
      navigate("/hosts/vacancies");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create vacancy",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: VacancyFormValues) => {
    createVacancyMutation.mutate(values);
  };
  
  const isLoading = hostLoading || qualificationsLoading || awardsLoading || classificationsLoading;
  const isMutating = createVacancyMutation.isPending;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/hosts/vacancies")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vacancies
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Create New Vacancy</h1>
          <p className="text-muted-foreground">Post a new job vacancy for host employers</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="hostEmployerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Host Employer <span className="text-destructive">*</span></FormLabel>
                          <Select
                            value={field.value?.toString() || ""}
                            onValueChange={field.onChange}
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
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Apprentice Electrician" {...field} />
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
                          <FormLabel>Location <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Sydney, NSW" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                              Remote Position
                            </FormLabel>
                            <FormDescription>
                              Tick this if the position allows remote work
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="positionCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Positions <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormDescription>
                            How many openings are available for this vacancy
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
                          <FormLabel>Start Date <span className="text-destructive">*</span></FormLabel>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="filled">Filled</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide a detailed description of the job..."
                              className="min-h-28"
                              {...field}
                            />
                          </FormControl>
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
                              placeholder="List any general requirements for the position..."
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="specialRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requirements</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special requirements or conditions..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Card className="mt-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Australian Qualification Details</CardTitle>
                    <CardDescription>
                      Enter qualification and award details for this vacancy
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="qualificationId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qualification</FormLabel>
                              <Select
                                value={field.value?.toString() || ""}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a qualification" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-72">
                                  {qualifications?.map((qual) => (
                                    <SelectItem key={qual.id} value={qual.id.toString()}>
                                      {qual.name} ({qual.code}) - AQF Level {qual.aqfLevel}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="aqfLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>AQF Level</FormLabel>
                              <Select
                                value={field.value?.toString() || ""}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select AQF level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                                    <SelectItem key={level} value={level.toString()}>
                                      Level {level}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Australian Qualifications Framework level
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="registeredGTO"
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
                                  Registered GTO Position
                                </FormLabel>
                                <FormDescription>
                                  This is a Group Training Organization registered apprenticeship
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="hourlyRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hourly Rate (AUD)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" min="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <FormLabel>Award</FormLabel>
                        <Select
                          value={selectedAward?.toString() || ""}
                          onValueChange={(value) => setSelectedAward(Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an award" />
                          </SelectTrigger>
                          <SelectContent>
                            {awards?.map((award) => (
                              <SelectItem key={award.id} value={award.id.toString()}>
                                {award.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="awardClassificationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Classification</FormLabel>
                            <Select
                              value={field.value?.toString() || ""}
                              onValueChange={field.onChange}
                              disabled={!selectedAward || (classifications?.length || 0) === 0}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={selectedAward ? "Select a classification" : "Select an award first"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {classifications?.map((classification) => (
                                  <SelectItem key={classification.id} value={classification.id.toString()}>
                                    {classification.level} - {classification.name} (${classification.minHourlyRate.toFixed(2)}/hr)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/hosts/vacancies")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isMutating}>
                    {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Vacancy
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewVacancyPage;
