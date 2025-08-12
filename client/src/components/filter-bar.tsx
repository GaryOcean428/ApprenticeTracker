import type { ReactNode } from 'react';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FilterOption {
  /** Value of the option */
  value: string;
  /** Display label */
  label: string;
  /** Optional icon to display before the label */
  icon?: ReactNode;
}

export interface FilterGroupProps {
  /** Title for this filter group */
  title: string;
  /** Current selected value */
  value: string;
  /** Options to display in the dropdown */
  options: FilterOption[];
  /** Function to call when value changes */
  onChange: (value: string) => void;
  /** Optional icon to display in the trigger */
  icon?: ReactNode;
  /** CSS classes to apply to the container */
  className?: string;
  /** Optional placeholder text */
  placeholder?: string;
}

/**
 * FilterGroup component for creating consistent filter dropdowns
 */
export function FilterGroup({
  title,
  value,
  options,
  onChange,
  icon,
  className = 'w-full md:w-48',
  placeholder,
}: FilterGroupProps) {
  return (
    <div className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          {icon && <span className="mr-2">{icon}</span>}
          <SelectValue placeholder={placeholder || title} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center">
                {option.icon && <span className="mr-2">{option.icon}</span>}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export interface FilterBarProps {
  /** Filter groups to display */
  children: ReactNode;
  /** CSS classes to apply to the container */
  className?: string;
}

/**
 * FilterBar component for wrapping multiple filter groups
 */
export function FilterBar({ children, className = '' }: FilterBarProps) {
  return <div className={`flex flex-wrap md:flex-nowrap gap-4 ${className}`}>{children}</div>;
}
