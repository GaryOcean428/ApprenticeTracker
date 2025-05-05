import { z } from 'zod';

/**
 * Classification schema
 */
export const ClassificationSchema = z.object({
  code: z.string(),
  name: z.string(),
  level: z.string().optional(),
  grade: z.string().optional(),
  yearOfExperience: z.number().optional(),
  qualifications: z.array(z.string()).optional(),
  parentCode: z.string().optional(),
  validFrom: z.string(),
  validTo: z.string().optional(),
  baseRate: z.number(),
});

/**
 * Award schema
 */
export const AwardSchema = z.object({
  code: z.string(),
  name: z.string(),
  industry: z.string(),
  occupation: z.string().optional(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
  description: z.string().optional(),
  coverage: z.string().optional(),
  classifications: z.array(ClassificationSchema),
});

/**
 * Rate template schema
 */
export const RateTemplateSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  baseRate: z.number(),
  baseMargin: z.number(),
  superRate: z.number(),
  leaveLoading: z.number(),
  workersCompRate: z.number(),
  payrollTaxRate: z.number(),
  trainingCostRate: z.number(),
  otherCostsRate: z.number(),
  casualLoading: z.number(),
  fundingOffset: z.number(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
});

/**
 * Rate validation response schema
 */
export const RateValidationResponseSchema = z.object({
  isValid: z.boolean(),
  minimumRate: z.number(),
  difference: z.number(),
});

/**
 * Pay rate schema
 */
export const PayRateSchema = z.object({
  baseRate: z.number(),
  casualLoading: z.number().optional(),
  penalties: z
    .array(
      z.object({
        code: z.string(),
        rate: z.number(),
        description: z.string(),
      }),
    )
    .optional(),
  allowances: z
    .array(
      z.object({
        code: z.string(),
        amount: z.number(),
        description: z.string(),
      }),
    )
    .optional(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
});

/**
 * Pay calculation schema
 */
export const PayCalculationSchema = z.object({
  baseRate: z.number(),
  casualLoading: z.number().optional(),
  penalties: z.array(
    z.object({
      code: z.string(),
      rate: z.number(),
      amount: z.number(),
      description: z.string(),
    }),
  ),
  allowances: z.array(
    z.object({
      code: z.string(),
      amount: z.number(),
      description: z.string(),
    }),
  ),
  total: z.number(),
  breakdown: z.object({
    base: z.number(),
    loading: z.number().optional(),
    penalties: z.number(),
    allowances: z.number(),
  }),
  metadata: z.object({
    calculatedAt: z.string(),
    effectiveDate: z.string(),
    source: z.enum(['fairwork', 'cached']),
  }),
});

/**
 * Penalty schema
 */
export const PenaltySchema = z.object({
  code: z.string(),
  name: z.string(),
  rate: z.number(),
  description: z.string().optional(),
});

/**
 * Allowance schema
 */
export const AllowanceSchema = z.object({
  code: z.string(),
  name: z.string(),
  amount: z.number(),
  description: z.string().optional(),
});

/**
 * Leave entitlement schema
 */
export const LeaveEntitlementSchema = z.object({
  type: z.string(),
  amount: z.number(),
  unit: z.enum(['days', 'weeks', 'hours']),
  conditions: z.string().optional(),
  accrualMethod: z.string().optional(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
});

/**
 * Public holiday schema
 */
export const PublicHolidaySchema = z.object({
  date: z.string(),
  name: z.string(),
  state: z.string().optional(),
  description: z.string().optional(),
});

// Define types from schemas
export type Award = z.infer<typeof AwardSchema>;
export type Classification = z.infer<typeof ClassificationSchema>;
export type RateTemplate = z.infer<typeof RateTemplateSchema>;
export type RateValidationResponse = z.infer<typeof RateValidationResponseSchema>;
export type LeaveEntitlement = z.infer<typeof LeaveEntitlementSchema>;
export type PublicHoliday = z.infer<typeof PublicHolidaySchema>;
export type Penalty = z.infer<typeof PenaltySchema>;
export type Allowance = z.infer<typeof AllowanceSchema>;

// Define interfaces that don't have schemas
export interface ClassificationHierarchy {
  code: string;
  name: string;
  children?: ClassificationHierarchy[];
}

export interface PayCalculation {
  baseRate: number;
  casualLoading?: number;
  total: number;
  components: Array<{
    type: string;
    amount: number;
  }>;
}

export interface PayRate {
  baseRate: number;
  casualLoading?: number;
  penalties?: Array<{
    code: string;
    rate: number;
    description: string;
  }>;
  allowances?: Array<{
    code: string;
    amount: number;
    description: string;
  }>;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface RateValidationRequest {
  rate: number;
  awardCode: string;
  classificationCode: string;
  date?: string;
}
