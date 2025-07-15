import { z } from 'zod';

/**
 * Common validation functions and error messages
 */

// Common validation error messages
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  url: 'Please enter a valid URL',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  integer: 'Must be a whole number',
  positive: 'Must be a positive number',
  dateFormat: 'Please enter a valid date (YYYY-MM-DD)',
  australianPostcode: 'Please enter a valid Australian postcode',
  abn: 'Please enter a valid ABN',
  tfn: 'Please enter a valid TFN',
};

// Common validation patterns
export const validationPatterns = {
  // Australian phone number (mobile or landline)
  phone: /^(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}$/,
  // Australian ABN (11 digits)
  abn: /^\d{11}$/,
  // Australian TFN (8 or 9 digits)
  tfn: /^\d{8,9}$/,
  // Australian postcodes (4 digits)
  postcode: /^\d{4}$/,
  // Simple URL validation
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};

/**
 * Common field validators for reuse in Zod schemas
 */
export const validators = {
  // User profile and account validators
  email: z.string().email(validationMessages.email),
  password: z.string().min(8, validationMessages.minLength(8)),
  name: z
    .string()
    .min(2, validationMessages.minLength(2))
    .max(100, validationMessages.maxLength(100)),

  // Contact information validators
  phone: z.string().regex(validationPatterns.phone, validationMessages.phone),

  // Address validators
  streetAddress: z
    .string()
    .min(5, validationMessages.minLength(5))
    .max(100, validationMessages.maxLength(100)),
  city: z
    .string()
    .min(2, validationMessages.minLength(2))
    .max(50, validationMessages.maxLength(50)),
  state: z
    .string()
    .min(2, validationMessages.minLength(2))
    .max(50, validationMessages.maxLength(50)),
  postcode: z.string().regex(validationPatterns.postcode, validationMessages.australianPostcode),

  // Business identifiers
  abn: z.string().regex(validationPatterns.abn, validationMessages.abn),

  // Dates and times
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: validationMessages.dateFormat,
  }),

  // Numbers
  integer: z.number().int(validationMessages.integer),
  positiveInteger: z.number().int(validationMessages.integer).positive(validationMessages.positive),
};

/**
 * Reusable address schema
 */
export const addressSchema = z.object({
  streetAddress: validators.streetAddress,
  streetAddress2: z.string().optional(),
  city: validators.city,
  state: validators.state,
  postcode: validators.postcode,
});

/**
 * Reusable contact information schema
 */
export const contactSchema = z.object({
  email: validators.email,
  phone: validators.phone,
});

/**
 * Validate form data and return any errors
 */
export function validateForm<T>(
  schema: z.ZodType<T>,
  data: unknown
): { valid: boolean; errors?: Record<string, string> } {
  try {
    schema.parse(data);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { _form: 'Form validation failed' } };
  }
}
