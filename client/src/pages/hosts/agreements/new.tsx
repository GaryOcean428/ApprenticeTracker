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
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { ArrowLeft, FileText, Building2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Define the form schema
const agreementFormSchema = z.object({
  hostEmployerId: z.string().min(1, "Host employer is required"),
  agreementNumber: z.string().min(3, "Agreement number is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  totalPositions: z.coerce.number().min(1, "At least one position is required"),
  termsAndConditions: z.string().min(10, "Terms and conditions are required"),
  status: z.enum(["draft", "active", "expired", "terminated"]),
  specialRequirements: z.string().optional(),
  autoRenew: z.boolean().default(false),
  approvedBy: z.string().min(1, "Approver's name is required"),
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
        // API not available yet
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
      agreementNumber: `AGR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      startDate: new Date(),
      endDate: addDays(new Date(), 365), // Default to 1 year
      totalPositions: 1,
      termsAndConditions: "",
      status: "draft",
      specialRequirements: "",
      autoRenew: false,
      approvedBy: "",
    },
  });

  // Mutation for creating agreement
  const createAgreementMutation = useMutation({
    mutationFn: async (data: AgreementFormValues) => {
      return apiRequest("POST", "/api/agreements", {
        ...data,
        startDate: format(data.startDate, "yyyy-MM-dd"),
        endDate: format(data.endDate, "yyyy-MM-dd"),
      });
    },
    onSuccess: () => {
      toast({
        title: "Agreement created",
        description: "The host employer agreement has been created successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agreements"] });
      navigate("/hosts/agreements");
    },
    onError: (error) => {
      console.error("Failed to create agreement:", error);
      toast({
        title: "Failed to create agreement",
        description: "There was an error creating the agreement. Please try again.",
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
            Create a new formal agreement between your GTO and a host employer
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
                  name="agreementNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agreement Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        A unique identifier for this agreement
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
                        When this agreement becomes active
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      <FormDescription>
                        When this agreement expires
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalPositions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Positions</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum number of apprentices that can be placed with this employer
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
                            <SelectValue placeholder="Select agreement status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Current status of the agreement
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="approvedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approved By</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Name of the person who approved this agreement
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoRenew"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Auto Renewal
                        </FormLabel>
                        <FormDescription>
                          Automatically renew this agreement when it expires
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="termsAndConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms and Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the terms and conditions of this agreement..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The legally binding terms of this agreement
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
                      Any special requirements, conditions, or notes for this agreement
                    </FormDescription>
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
                      <FileText className="mr-2 h-4 w-4" /> Create Agreement
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
