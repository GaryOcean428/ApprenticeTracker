import React from 'react';
import {
  Controller,
  useFormContext,
  ControllerProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import {
  FormControl,
  FormDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shared props for all form field components
 */
interface FormFieldBaseProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Props for text input fields
 */
interface TextFieldProps extends FormFieldBaseProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  placeholder?: string;
  defaultValue?: string;
  autoComplete?: string;
}

/**
 * Props for textarea fields
 */
interface TextareaFieldProps extends FormFieldBaseProps {
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
}

/**
 * Option type for select, radio, and checkbox fields
 */
export interface FormFieldOption {
  label: string;
  value: string;
}

/**
 * Props for select fields
 */
interface SelectFieldProps extends FormFieldBaseProps {
  options: FormFieldOption[];
  placeholder?: string;
  defaultValue?: string;
}

/**
 * Props for radio group fields
 */
interface RadioFieldProps extends FormFieldBaseProps {
  options: FormFieldOption[];
  defaultValue?: string;
  inline?: boolean;
}

/**
 * Props for checkbox fields
 */
interface CheckboxFieldProps extends FormFieldBaseProps {
  defaultChecked?: boolean;
}

/**
 * Props for switch fields
 */
interface SwitchFieldProps extends FormFieldBaseProps {
  defaultChecked?: boolean;
}

/**
 * Props for date picker fields
 */
interface DatePickerFieldProps extends FormFieldBaseProps {
  placeholder?: string;
  defaultValue?: Date;
}

/**
 * Text input form field
 */
export function TextField({
  name,
  label,
  description,
  required = false,
  disabled = false,
  type = 'text',
  placeholder,
  defaultValue = '',
  autoComplete,
  className,
}: TextFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive"> *</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete={autoComplete}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Textarea form field
 */
export function TextareaField({
  name,
  label,
  description,
  required = false,
  disabled = false,
  placeholder,
  defaultValue = '',
  rows = 3,
  className,
}: TextareaFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive"> *</span>}
            </FormLabel>
          )}
          <FormControl>
            <Textarea {...field} placeholder={placeholder} disabled={disabled} rows={rows} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Select form field
 */
export function SelectField({
  name,
  label,
  description,
  required = false,
  disabled = false,
  options,
  placeholder,
  defaultValue = '',
  className,
}: SelectFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive"> *</span>}
            </FormLabel>
          )}
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Radio group form field
 */
export function RadioField({
  name,
  label,
  description,
  required = false,
  disabled = false,
  options,
  defaultValue = '',
  inline = false,
  className,
}: RadioFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive"> *</span>}
            </FormLabel>
          )}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={disabled}
              className={inline ? 'flex items-center space-x-4' : 'space-y-2'}
            >
              {options.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                  <label htmlFor={`${name}-${option.value}`} className="text-sm font-medium">
                    {option.label}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Checkbox form field
 */
export function CheckboxField({
  name,
  label,
  description,
  required = false,
  disabled = false,
  defaultChecked = false,
  className,
}: CheckboxFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      defaultValue={defaultChecked}
      render={({ field }) => (
        <FormItem className={cn('flex flex-row items-start space-x-3 space-y-0', className)}>
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && (
              <FormLabel className="text-sm font-medium">
                {label}
                {required && <span className="text-destructive"> *</span>}
              </FormLabel>
            )}
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Switch form field
 */
export function SwitchField({
  name,
  label,
  description,
  required = false,
  disabled = false,
  defaultChecked = false,
  className,
}: SwitchFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      defaultValue={defaultChecked}
      render={({ field }) => (
        <FormItem className={cn('flex flex-row items-center justify-between space-y-0', className)}>
          <div className="space-y-0.5">
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-destructive"> *</span>}
              </FormLabel>
            )}
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Date picker form field
 */
export function DatePickerField({
  name,
  label,
  description,
  required = false,
  disabled = false,
  placeholder = 'Select a date',
  defaultValue,
  className,
}: DatePickerFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive"> *</span>}
            </FormLabel>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground'
                  )}
                  disabled={disabled}
                >
                  {field.value ? format(new Date(field.value), 'PPP') : <span>{placeholder}</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={field.onChange}
                disabled={disabled}
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Custom form field with render prop for complete control
 */
export function CustomField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  required = false,
  children,
  className,
}: {
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  children: ControllerProps<TFieldValues, TName>['render'];
  className?: string;
}) {
  const form = useFormContext<TFieldValues>();

  return (
    <FormItem className={className}>
      {label && (
        <FormLabel>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </FormLabel>
      )}
      <Controller control={form.control} name={name} render={children} />
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
