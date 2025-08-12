import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import type { DateRange } from 'react-day-picker';
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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ReportFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormValues = {
  title: string;
  type: string;
  period: string;
  dateRange: DateRange;
  includeChart: boolean;
  recipients: string[];
  format: string;
  notes?: string;
};

const REPORT_TYPES = [
  { id: 'profit-loss', name: 'Profit & Loss' },
  { id: 'balance-sheet', name: 'Balance Sheet' },
  { id: 'cash-flow', name: 'Cash Flow' },
  { id: 'tax', name: 'Tax' },
  { id: 'custom', name: 'Custom' },
];

const REPORT_PERIODS = [
  { id: 'current-month', name: 'Current Month' },
  { id: 'current-quarter', name: 'Current Quarter' },
  { id: 'ytd', name: 'Year to Date' },
  { id: 'last-month', name: 'Last Month' },
  { id: 'last-quarter', name: 'Last Quarter' },
  { id: 'last-year', name: 'Last Year' },
  { id: 'custom', name: 'Custom Period' },
];

const REPORT_FORMATS = [
  { id: 'pdf', name: 'PDF' },
  { id: 'excel', name: 'Excel' },
  { id: 'csv', name: 'CSV' },
];

const RECIPIENTS = [
  { id: 'executive', name: 'Executive Team' },
  { id: 'finance', name: 'Finance Department' },
  { id: 'management', name: 'Management Team' },
  { id: 'board', name: 'Board of Directors' },
];

export function ReportFormDialog({ open, onOpenChange }: ReportFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDateRange, setShowDateRange] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      title: '',
      type: '',
      period: '',
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
      includeChart: true,
      recipients: [],
      format: 'pdf',
      notes: '',
    },
  });

  const watchReportPeriod = form.watch('period');

  // Update UI based on selected period
  if (watchReportPeriod === 'custom' && !showDateRange) {
    setShowDateRange(true);
  } else if (watchReportPeriod !== 'custom' && showDateRange) {
    setShowDateRange(false);
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Format the date range
      const formattedDateRange = {
        from: data.dateRange.from ? format(data.dateRange.from, 'yyyy-MM-dd') : null,
        to: data.dateRange.to ? format(data.dateRange.to, 'yyyy-MM-dd') : null,
      };

      // In a real application, you would send this data to your backend
      console.log('Generating report:', {
        ...data,
        dateRange: formattedDateRange,
      });

      // Show success toast
      toast({
        title: 'Report generated',
        description: 'Your financial report has been successfully generated.',
      });

      // Reset form and close dialog
      form.reset();
      onOpenChange(false);

      // Invalidate reports query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['financial-reports'] });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'There was a problem generating your report.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Financial Report</DialogTitle>
          <DialogDescription>
            Select the parameters for your financial report. Click generate when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: 'Report title is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Q2 2025 Financial Report" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                rules={{ required: 'Report type is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REPORT_TYPES.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
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
                name="period"
                rules={{ required: 'Report period is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Period</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REPORT_PERIODS.map(period => (
                          <SelectItem key={period.id} value={period.id}>
                            {period.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {showDateRange && (
              <FormField
                control={form.control}
                name="dateRange"
                rules={{ required: 'Date range is required for custom period' }}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Custom Date Range</FormLabel>
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
                            {field.value?.from ? (
                              field.value.to ? (
                                <>
                                  {format(field.value.from, 'PPP')} -{' '}
                                  {format(field.value.to, 'PPP')}
                                </>
                              ) : (
                                format(field.value.from, 'PPP')
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={field.value?.from}
                          selected={field.value}
                          onSelect={field.onChange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="includeChart"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Include charts and visualizations</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Add visual representations of data to enhance readability
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipients"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Recipients (Optional)</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Select departments that should receive this report
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {RECIPIENTS.map(recipient => (
                      <FormItem
                        key={recipient.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(recipient.id)}
                            onCheckedChange={checked => {
                              if (checked) {
                                field.onChange([...field.value, recipient.id]);
                              } else {
                                field.onChange(
                                  field.value?.filter(value => value !== recipient.id)
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{recipient.name}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="format"
              rules={{ required: 'Export format is required' }}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Export Format</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      {REPORT_FORMATS.map(format => (
                        <FormItem key={format.id} className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value={format.id} />
                          </FormControl>
                          <FormLabel className="font-normal">{format.name}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes or analysis to include in the report"
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
                {isSubmitting ? 'Generating...' : 'Generate Report'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
