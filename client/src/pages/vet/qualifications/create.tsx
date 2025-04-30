import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Check, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const createQualificationSchema = z.object({
  code: z.string().min(1, "Qualification code is required"),
  title: z.string().min(1, "Qualification title is required"),
  description: z.string().min(1, "Description is required"),
  level: z.string().min(1, "AQF level is required"),
  industryArea: z.string().min(1, "Industry area is required"),
  isActive: z.boolean().default(true),
  isSuperseded: z.boolean().default(false),
  nominalHours: z.number().min(0, "Nominal hours must be a positive number").default(0),
  releases: z.array(z.string()).default([]),
});

export default function CreateQualification() {
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<z.infer<typeof createQualificationSchema>>({
    resolver: zodResolver(createQualificationSchema),
    defaultValues: {
      code: "",
      title: "",
      description: "",
      level: "",
      industryArea: "",
      isActive: true,
      isSuperseded: false,
      nominalHours: 0,
      releases: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createQualificationSchema>) => {
      setIsSubmitting(true);
      const res = await apiRequest("POST", "/api/vet/qualifications", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Qualification created successfully",
        description: "The qualification has been added to the system",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vet/qualifications"] });
      navigate("/vet/qualifications");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create qualification",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: z.infer<typeof createQualificationSchema>) => {
    createMutation.mutate(data);
  };

  // List of AQF levels
  const aqfLevels = [
    { value: "Certificate I", label: "Certificate I" },
    { value: "Certificate II", label: "Certificate II" },
    { value: "Certificate III", label: "Certificate III" },
    { value: "Certificate IV", label: "Certificate IV" },
    { value: "Diploma", label: "Diploma" },
    { value: "Advanced Diploma", label: "Advanced Diploma" },
    { value: "Associate Degree", label: "Associate Degree" },
    { value: "Bachelor Degree", label: "Bachelor Degree" },
    { value: "Graduate Certificate", label: "Graduate Certificate" },
    { value: "Graduate Diploma", label: "Graduate Diploma" },
    { value: "Masters Degree", label: "Masters Degree" },
    { value: "Doctoral Degree", label: "Doctoral Degree" },
  ];

  // List of industry areas
  const industryAreas = [
    "Agriculture, Forestry and Fishing",
    "Mining",
    "Manufacturing",
    "Electricity, Gas, Water and Waste Services",
    "Construction",
    "Wholesale Trade",
    "Retail Trade",
    "Accommodation and Food Services",
    "Transport, Postal and Warehousing",
    "Information Media and Telecommunications",
    "Financial and Insurance Services",
    "Rental, Hiring and Real Estate Services",
    "Professional, Scientific and Technical Services",
    "Administrative and Support Services",
    "Public Administration and Safety",
    "Education and Training",
    "Health Care and Social Assistance",
    "Arts and Recreation Services",
    "Other Services",
  ];

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate("/vet/qualifications")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Qualification</h1>
          <p className="text-muted-foreground">
            Add a new AQF Qualification to the system
          </p>
        </div>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Qualification Details</CardTitle>
              <CardDescription>
                Enter the details for the new qualification
              </CardDescription>
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
                        <Input placeholder="e.g. UEE30920" {...field} value={field.value || ""} />
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select AQF level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {aqfLevels.map((level) => (
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
                  <FormItem>
                    <FormLabel>Qualification Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Certificate III in Electrotechnology Electrician" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>
                      The official title of this qualification
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
                        value={field.value || ""}
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry area" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industryAreas.map((industry) => (
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
                          onChange={(e) => {
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
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
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
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
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
                onClick={() => navigate("/vet/qualifications")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-2"
              >
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