import { useState } from "react";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format, addMonths } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface BudgetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormValues = {
  name: string;
  period: string;
  startDate: Date;
  endDate: Date;
  totalAmount: string;
  description?: string;
};

const BUDGET_PERIODS = [
  { id: "monthly", name: "Monthly" },
  { id: "quarterly", name: "Quarterly" },
  { id: "annual", name: "Annual" },
  { id: "custom", name: "Custom" },
];

export function BudgetFormDialog({ open, onOpenChange }: BudgetFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      period: "",
      startDate: new Date(),
      endDate: addMonths(new Date(), 3), // Default to 3 months for quarterly budget
      totalAmount: "",
      description: "",
    },
  });

  // Update end date when period changes
  const handlePeriodChange = (value: string) => {
    const startDate = form.getValues('startDate');
    let endDate;
    
    switch (value) {
      case 'monthly':
        endDate = addMonths(startDate, 1);
        break;
      case 'quarterly':
        endDate = addMonths(startDate, 3);
        break;
      case 'annual':
        endDate = addMonths(startDate, 12);
        break;
      default:
        // For custom, don't change the end date
        return;
    }
    
    form.setValue('endDate', endDate);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Format the data for submission
      const formattedAmount = parseFloat(data.totalAmount);
      
      // In a real application, you would send this data to your backend
      console.log("Submitting budget:", {
        ...data,
        totalAmount: formattedAmount,
        startDate: format(data.startDate, "yyyy-MM-dd"),
        endDate: format(data.endDate, "yyyy-MM-dd"),
      });

      // Show success toast
      toast({
        title: "Budget created",
        description: "Your budget has been successfully created.",
      });

      // Reset form and close dialog
      form.reset();
      onOpenChange(false);

      // Invalidate budgets query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    } catch (error) {
      console.error("Error creating budget:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your budget.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
          <DialogDescription>
            Set up a new budget for your organization. Click submit when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Budget name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Q2 2025 Operating Budget" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              rules={{ required: "Budget period is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Period</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handlePeriodChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUDGET_PERIODS.map((period) => (
                        <SelectItem 
                          key={period.id} 
                          value={period.id}
                        >
                          {period.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                rules={{ required: "Start date is required" }}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                rules={{ required: "End date is required" }}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="totalAmount"
              rules={{ 
                required: "Total amount is required",
                pattern: {
                  value: /^[0-9]*\.?[0-9]+$/,
                  message: "Please enter a valid amount"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Budget Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">$</div>
                      <Input 
                        type="text" 
                        className="pl-7" 
                        placeholder="0.00" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional details about this budget"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Budget"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}