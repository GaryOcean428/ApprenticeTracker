import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { insertUnitOfCompetencySchema, type InsertUnitOfCompetency } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

// Extend the insert schema with additional validation
const createUnitSchema = insertUnitOfCompetencySchema.extend({
  unitCode: z.string().min(4, {
    message: "Unit code must be at least 4 characters.",
  }),
  unitTitle: z.string().min(5, {
    message: "Unit title must be at least 5 characters.",
  }),
  trainingPackage: z.string().min(2, {
    message: "Training package is required.",
  }),
});

export default function CreateUnitOfCompetency() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof createUnitSchema>>({
    resolver: zodResolver(createUnitSchema),
    defaultValues: {
      unitCode: "",
      unitTitle: "",
      unitDescription: "",
      releaseNumber: "",
      trainingPackage: "",
      trainingPackageRelease: "",
      elementSummary: [],
      performanceCriteria: [],
      assessmentRequirements: [],
      nominalHours: 0,
      isActive: true,
      isImported: false,
    },
  });
  
  // Create unit mutation
  const createUnitMutation = useMutation({
    mutationFn: async (data: InsertUnitOfCompetency) => {
      const response = await apiRequest("POST", "/api/vet/units", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vet/units'] });
      toast({
        title: "Success",
        description: "Unit of competency created successfully.",
        variant: "default",
      });
      navigate("/vet/units");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create unit of competency: " + (error as Error).message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });
  
  // Form submission handler
  const onSubmit = (values: z.infer<typeof createUnitSchema>) => {
    setIsSubmitting(true);
    
    // Process JSON fields if needed
    const data = {
      ...values,
      // Convert empty array to empty object for JSON fields
      elementSummary: values.elementSummary || [],
      performanceCriteria: values.performanceCriteria || [],
      assessmentRequirements: values.assessmentRequirements || [],
    };
    
    createUnitMutation.mutate(data);
  };
  
  return (
    <>
      <div className="flex items-center space-x-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/vet/units")}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Units
        </Button>
        <h2 className="text-2xl font-semibold">Create Unit of Competency</h2>
      </div>
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Unit of Competency Details</CardTitle>
          <CardDescription>
            Add a new Unit of Competency to the system. Units can be linked to qualifications and assigned to apprentices.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="unitCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. BSBTEC201" {...field} />
                      </FormControl>
                      <FormDescription>
                        The standard code for this unit of competency.
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
                        <Input placeholder="e.g. Release 1" {...field} />
                      </FormControl>
                      <FormDescription>
                        The release number of this unit of competency.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="unitTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Use business software applications" {...field} />
                    </FormControl>
                    <FormDescription>
                      The official title of this unit of competency.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unitDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a detailed description of the unit..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A comprehensive description of what this unit covers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="trainingPackage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training Package</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. BSB" {...field} />
                      </FormControl>
                      <FormDescription>
                        The training package this unit belongs to.
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
                      <FormLabel>Training Package Release</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 7.0" {...field} />
                      </FormControl>
                      <FormDescription>
                        The release version of the training package.
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
                    <FormLabel>Nominal Hours</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="e.g. 40"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      The estimated hours required to complete this unit.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <FormLabel>Active Unit</FormLabel>
                        <FormDescription>
                          Inactive units will not be available for new qualifications or enrollments.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isImported"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Imported Unit</FormLabel>
                        <FormDescription>
                          This unit is imported from another training package.
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
                onClick={() => navigate("/vet/units")}
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
                Save Unit
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
}