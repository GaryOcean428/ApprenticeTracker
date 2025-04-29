import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface ComboboxProps {
  options: { label: string; value: string }[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchPlaceholder?: string;
  notFoundText?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  multiple = false,
  searchPlaceholder = 'Search...',
  notFoundText = 'No results found.',
}: ComboboxProps): JSX.Element {
  const [open, setOpen] = React.useState<boolean>(false);

  const getDisplayValue = (): string => {
    if (!value) return '';

    if (multiple && Array.isArray(value)) {
      const selectedLabels = value
        .map(v => options.find(option => option.value === v)?.label)
        .filter(Boolean);
      return selectedLabels.join(', ') || placeholder;
    }

    return options.find(option => option.value === value)?.label || placeholder;
  };

  const isSelected = (optionValue: string): boolean => {
    if (!value) return false;

    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }

    return value === optionValue;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {getDisplayValue()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{notFoundText}</CommandEmpty>
          <CommandGroup>
            {options.map(option => (
              <CommandItem
                key={option.value}
                onSelect={(): void => {
                  if (multiple && Array.isArray(value)) {
                    const newValue = isSelected(option.value)
                      ? value.filter(v => v !== option.value)
                      : [...value, option.value];
                    onChange(newValue);
                  } else {
                    onChange(option.value);
                    setOpen(false);
                  }
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    isSelected(option.value) ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
