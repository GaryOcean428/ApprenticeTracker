import { z } from 'zod';

/**
 * Comprehensive validation schemas and utilities for CRUD operations
 * Ensures data integrity and consistency across the application
 */

// Common validation patterns
export const emailSchema = z.string().email('Invalid email format');
export const phoneSchema = z
  .string()
  .regex(/^[\+]?[\d\s\-\(\)]{10,}$/, 'Invalid phone number format');
export const positiveNumberSchema = z.number().positive('Must be a positive number');
export const percentageSchema = z
  .number()
  .min(0, 'Must be at least 0%')
  .max(100, 'Must be at most 100%');
export const hourlyRateSchema = z
  .number()
  .min(0.01, 'Hourly rate must be at least $0.01')
  .max(1000, 'Hourly rate cannot exceed $1000');

// Date validation schemas
export const futureDateSchema = z
  .date()
  .refine(date => date > new Date(), 'Date must be in the future');

export const pastOrPresentDateSchema = z
  .date()
  .refine(date => date <= new Date(), 'Date cannot be in the future');

export const dateRangeSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine(data => data.endDate >= data.startDate, 'End date must be after or equal to start date');

// Business validation schemas
export const apprenticeStatusSchema = z.enum([
  'applicant',
  'recruitment',
  'pre-commencement',
  'active',
  'suspended',
  'withdrawn',
  'completed',
]);

export const timesheetStatusSchema = z.enum(['pending', 'approved', 'rejected']);

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export const complianceStatusSchema = z.enum(['compliant', 'non-compliant', 'pending']);

// Validation utilities
export function validateApprenticeTransition(fromStatus: string, toStatus: string): boolean {
  const validTransitions: Record<string, string[]> = {
    applicant: ['recruitment', 'withdrawn'],
    recruitment: ['pre-commencement', 'withdrawn'],
    'pre-commencement': ['active', 'withdrawn'],
    active: ['suspended', 'completed', 'withdrawn'],
    suspended: ['active', 'withdrawn'],
    withdrawn: [], // Terminal state
    completed: [], // Terminal state
  };

  return validTransitions[fromStatus]?.includes(toStatus) || false;
}

export function validateBusinessHours(startTime: string, endTime: string): boolean {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);

  // Check if end time is after start time (same day) or next day
  return end > start || (end < start && end.getHours() < 12); // Allow overnight shifts
}

export function validateWorkingHours(hoursWorked: number, breakDuration: number = 0): boolean {
  const totalTime = hoursWorked + breakDuration;

  // Maximum 12 hours including breaks in a single day
  if (totalTime > 12) return false;

  // Must have breaks for long shifts
  if (hoursWorked > 5 && breakDuration < 0.5) return false; // 30 min break for 5+ hours
  if (hoursWorked > 8 && breakDuration < 1) return false; // 1 hour break for 8+ hours

  return true;
}

export function validateAwardRate(hourlyRate: number, awardCode: string): boolean {
  // Minimum wage validation (simplified - should use actual award rates)
  const minimumWages: Record<string, number> = {
    MA000003: 23.23, // Manufacturing Award
    MA000010: 24.0, // Clerks Award
    MA000020: 25.41, // Building and Construction Award
    // Add more as needed
  };

  const minimumWage = minimumWages[awardCode] || 21.38; // National minimum wage fallback
  return hourlyRate >= minimumWage;
}

export function validateAustralianPhoneNumber(phone: string): boolean {
  // Australian phone number patterns
  const mobilePattern = /^(\+61|0)[4-5]\d{8}$/;
  const landlinePattern = /^(\+61|0)[2-8]\d{8}$/;

  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return mobilePattern.test(cleanPhone) || landlinePattern.test(cleanPhone);
}

export function validateABN(abn: string): boolean {
  // Simplified ABN validation
  const cleanABN = abn.replace(/\s/g, '');

  if (!/^\d{11}$/.test(cleanABN)) return false;

  // ABN checksum validation
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const abnArray = cleanABN.split('').map(Number);
  abnArray[0] -= 1; // Subtract 1 from first digit

  const sum = abnArray.reduce((total, digit, index) => total + digit * weights[index], 0);
  return sum % 89 === 0;
}

// Enhanced validation schemas for complex business rules
export const createApprenticeValidationSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: emailSchema,
    phone: z
      .string()
      .optional()
      .refine(
        phone => !phone || validateAustralianPhoneNumber(phone),
        'Invalid Australian phone number'
      ),
    dateOfBirth: z.date().refine(date => {
      const age = new Date().getFullYear() - date.getFullYear();
      return age >= 15 && age <= 65;
    }, 'Apprentice must be between 15 and 65 years old'),
    trade: z.string().min(2, 'Trade must be specified'),
    status: apprenticeStatusSchema,
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    progress: percentageSchema.optional(),
  })
  .refine(
    data => !data.endDate || !data.startDate || data.endDate >= data.startDate,
    'End date must be after start date'
  );

export const createTimesheetDetailValidationSchema = z
  .object({
    date: pastOrPresentDateSchema,
    hoursWorked: z
      .number()
      .min(0.1, 'Hours worked must be at least 0.1')
      .max(12, 'Hours worked cannot exceed 12 per day'),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    breakDuration: z.number().min(0).max(4).optional(),
    description: z.string().min(5, 'Description must be at least 5 characters').optional(),
  })
  .refine(
    data => validateBusinessHours(data.startTime, data.endTime),
    'End time must be after start time'
  )
  .refine(
    data => validateWorkingHours(data.hoursWorked, data.breakDuration || 0),
    'Working hours and break duration are invalid'
  );

export const createPayRateValidationSchema = z
  .object({
    classificationId: z.number().positive('Classification ID is required'),
    hourlyRate: hourlyRateSchema,
    effectiveFrom: z.date(),
    effectiveTo: z.date().optional(),
    payRateType: z.enum(['award', 'EBA', 'individual_agreement']),
    isApprenticeRate: z.boolean().optional(),
    apprenticeshipYear: z.number().min(1).max(4).optional(),
  })
  .refine(
    data => !data.effectiveTo || data.effectiveTo >= data.effectiveFrom,
    'Effective to date must be after effective from date'
  )
  .refine(
    data => !data.isApprenticeRate || data.apprenticeshipYear,
    'Apprenticeship year is required for apprentice rates'
  );

export const createHostEmployerValidationSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().min(2, 'Industry must be specified'),
  contactPerson: z.string().min(2, 'Contact person name must be at least 2 characters'),
  email: emailSchema,
  phone: z
    .string()
    .optional()
    .refine(
      phone => !phone || validateAustralianPhoneNumber(phone),
      'Invalid Australian phone number'
    ),
  address: z.string().min(10, 'Address must be at least 10 characters').optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
  safetyRating: z.number().min(1).max(5).optional(),
  complianceStatus: complianceStatusSchema,
  employerIdentifier: z
    .string()
    .optional()
    .refine(abn => !abn || validateABN(abn), 'Invalid ABN format'),
});

// Validation middleware factory
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      next(error);
    }
  };
}

// Data sanitization utilities
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('0')) {
    return '+61' + cleaned.substring(1);
  }
  return cleaned.startsWith('+61') ? cleaned : '+61' + cleaned;
}

// Business rule validators
export class BusinessRuleValidator {
  static validateTimesheetApproval(
    timesheet: any,
    user: any
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (timesheet.status !== 'pending') {
      errors.push('Only pending timesheets can be approved');
    }

    if (timesheet.totalHours <= 0) {
      errors.push('Timesheet must have positive hours');
    }

    if (!user.permissions?.includes('timesheet.approve')) {
      errors.push('User does not have permission to approve timesheets');
    }

    return { valid: errors.length === 0, errors };
  }

  static validatePlacementCreation(
    apprentice: any,
    hostEmployer: any
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (apprentice.status !== 'active') {
      errors.push('Apprentice must be active to create placement');
    }

    if (hostEmployer.status !== 'active') {
      errors.push('Host employer must be active to create placement');
    }

    if (hostEmployer.complianceStatus !== 'compliant') {
      errors.push('Host employer must be compliant to host apprentices');
    }

    return { valid: errors.length === 0, errors };
  }

  static validateProgressReviewScheduling(
    apprentice: any,
    reviewer: any,
    reviewDate: Date
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (apprentice.status !== 'active') {
      errors.push('Can only schedule reviews for active apprentices');
    }

    if (reviewDate <= new Date()) {
      errors.push('Review date must be in the future');
    }

    // Check if apprentice has a review in the last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // This would need to check database for recent reviews
    // For now, just validate the basic requirements

    return { valid: errors.length === 0, errors };
  }
}

export default {
  emailSchema,
  phoneSchema,
  positiveNumberSchema,
  percentageSchema,
  hourlyRateSchema,
  futureDateSchema,
  pastOrPresentDateSchema,
  dateRangeSchema,
  apprenticeStatusSchema,
  timesheetStatusSchema,
  taskPrioritySchema,
  complianceStatusSchema,
  validateApprenticeTransition,
  validateBusinessHours,
  validateWorkingHours,
  validateAwardRate,
  validateAustralianPhoneNumber,
  validateABN,
  createApprenticeValidationSchema,
  createTimesheetDetailValidationSchema,
  createPayRateValidationSchema,
  createHostEmployerValidationSchema,
  createValidationMiddleware,
  sanitizeString,
  sanitizeEmail,
  formatPhoneNumber,
  BusinessRuleValidator,
};
