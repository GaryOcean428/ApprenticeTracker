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
import { ArrowLeft, CheckCircle, FileText, Upload } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format, addYears } from "date-fns";

// Define the form schema
const agreementFormSchema = z.object({
  hostEmployerId: z.string().min(1, "Host employer is required"),
  agreementDate: z.date({
    required_error: "Agreement date is required",
  }),
  expiryDate: z.date({
    required_error: "Expiry date is required",
  }),
  status: z.enum(["current", "pending", "expired"]),
  whsCompliance: z.enum(["compliant", "review_required", "non_compliant"]),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
  notes: z.string().optional(),
  // In a real app, you would handle file uploads differently
  // This is a placeholder for the form structure
  document: z.string().optional(),
});

type AgreementFormValues = z.infer<typeof agreementFormSchema>;

// Host employer type
interface HostEmployer {
  id: number;
  name: string;
}

const NewAgreementPage = () => {
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
  const form = useForm<AgreementFormValues>({
    resolver: zodResolver(agreementFormSchema),
    defaultValues: {
      hostEmployerId: "",
      agreementDate: new Date(),
      expiryDate: addYears(new Date(), 1), // Default to 1 year from now
      status: "pending",
      whsCompliance: "review_required",
      termsAccepted: false,
      notes: "",
      document: "",
    },
  });

  // Mutation for creating agreement
  const createAgreementMutation = useMutation({
    mutationFn: async (data: AgreementFormValues) => {
      return apiRequest("POST", "/api/host-agreements", {
        ...data,
        agreementDate: format(data.agreementDate, "yyyy-MM-dd"),
        expiryDate: format(data.expiryDate, "yyyy-MM-dd"),
      });
    },
    onSuccess: () => {
      toast({
        title: "Agreement created",
        description: "Host employer agreement has been created successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/host-agreements"] });
      navigate("/hosts/agreements");
    },
    onError: (error) => {
      console.error("Failed to create agreement:", error);
      toast({
        title: "Failed to create agreement",
        description: "There was an error creating the host employer agreement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: AgreementFormValues) => {
    createAgreementMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate("/hosts/agreements")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Host Employer Agreement</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agreement Details</CardTitle>
          <CardDescription>
            Enter the details of the new host employer agreement
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
                        Select the host employer for this agreement
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
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="current">Current</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The current status of this agreement
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreementDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Agreement Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      <FormDescription>
                        The date when the agreement was signed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiry Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      <FormDescription>
                        The date when the agreement expires
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whsCompliance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WHS Compliance Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select compliance status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="compliant">Compliant</SelectItem>
                          <SelectItem value="review_required">Review Required</SelectItem>
                          <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Workplace Health and Safety compliance status
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Agreement Document</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // In real app, you'd upload the file and set the file URL/path
                                field.onChange(file.name); // For demo just store the name
                              }
                            }}
                          />
                          <Button type="button" variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" /> Upload
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload the signed agreement document (PDF or Word)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional notes about this agreement"
                        className="h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional notes or comments about this agreement
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="termsAccepted"
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
                        I confirm that all information provided is accurate and that the host employer has agreed to the terms
                      </FormLabel>
                      <FormDescription>
                        By checking this box, you confirm that the host employer has been informed of all responsibilities and obligations.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/hosts/agreements")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createAgreementMutation.isPending}
                >
                  {createAgreementMutation.isPending ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4" /> Create Agreement
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

export default NewAgreementPage;
