import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { type DateRange } from 'react-day-picker';

interface DateRangePickerProps {
  onRangeSelect: (range: DateRange) => void;
  initialRange?: DateRange;
}

export function DateRangePicker({ onRangeSelect, initialRange }: DateRangePickerProps) {
  const [range, setRange] = useState<DateRange | undefined>(initialRange);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setRange(range);
      onRangeSelect(range);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('justify-start text-left font-normal', !range && 'text-muted-foreground')}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {range?.from ? (
            range.to ? (
              <>
                {format(range.from, 'LLL dd, y')} - {format(range.to, 'LLL dd, y')}
              </>
            ) : (
              format(range.from, 'LLL dd, y')
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={range?.from}
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
