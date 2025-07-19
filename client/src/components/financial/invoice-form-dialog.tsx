import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { CalendarIcon, Plus, Trash } from 'lucide-react';
import { format, addDays } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InvoiceItem {
  description: string;
  quantity: string;
  rate: string;
}

type FormValues = {
  hostEmployerId: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  notes?: string;
};

// Dummy host employers for the demo
const HOST_EMPLOYERS = [
  { id: '101', name: 'ABC Construction' },
  { id: '102', name: 'XYZ Electrical' },
  { id: '103', name: 'Brisbane Woodworking' },
  { id: '104', name: 'Gold Coast Plumbing' },
  { id: '105', name: 'Sunshine Coast Builders' },
];

export function InvoiceFormDialog({ open, onOpenChange }: InvoiceFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      hostEmployerId: '',
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30), // Default to 30 days due date
      items: [{ description: '', quantity: '1', rate: '' }],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Calculate total invoice amount
  const calculateTotal = () => {
    const items = form.getValues('items');
    return items.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return total + quantity * rate;
    }, 0);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Format the data for submission
      const formattedItems = data.items.map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity),
        rate: parseFloat(item.rate),
        amount: parseFloat(item.quantity) * parseFloat(item.rate),
      }));

      const totalAmount = calculateTotal();

      // In a real application, you would send this data to your backend
      console.log('Submitting invoice:', {
        ...data,
        items: formattedItems,
        totalAmount,
        issueDate: format(data.issueDate, 'yyyy-MM-dd'),
        dueDate: format(data.dueDate, 'yyyy-MM-dd'),
      });

      // Show success toast
      toast({
        title: 'Invoice created',
        description: 'Your invoice has been successfully created.',
      });

      // Reset form and close dialog
      form.reset();
      onOpenChange(false);

      // Invalidate invoices query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'There was a problem creating your invoice.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for a host employer. Click submit when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="hostEmployerId"
              rules={{ required: 'Host employer is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host Employer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select host employer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HOST_EMPLOYERS.map(employer => (
                        <SelectItem key={employer.id} value={employer.id}>
                          {employer.name}
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
                name="issueDate"
                rules={{ required: 'Issue date is required' }}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Issue Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
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
                name="dueDate"
                rules={{ required: 'Due date is required' }}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium">Invoice Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ description: '', quantity: '1', rate: '' })}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-4 p-4 border rounded-md relative"
                >
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  )}

                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    rules={{ required: 'Description is required' }}
                    render={({ field }) => (
                      <FormItem className="col-span-6">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Apprentice placement fees" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    rules={{
                      required: 'Quantity is required',
                      pattern: {
                        value: /^[0-9]*\.?[0-9]+$/,
                        message: 'Please enter a valid number',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.rate`}
                    rules={{
                      required: 'Rate is required',
                      pattern: {
                        value: /^[0-9]*\.?[0-9]+$/,
                        message: 'Please enter a valid amount',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormLabel>Rate ($)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                              $
                            </div>
                            <Input className="pl-7" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-1 flex items-end mb-1">
                    <div className="text-sm font-medium text-muted-foreground mt-2">
                      $
                      {(
                        parseFloat(form.watch(`items.${index}.quantity`) || '0') *
                        parseFloat(form.watch(`items.${index}.rate`) || '0')
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-2 border-t">
                <div className="text-base font-medium">Total: ${calculateTotal().toFixed(2)}</div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes or payment instructions"
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
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
