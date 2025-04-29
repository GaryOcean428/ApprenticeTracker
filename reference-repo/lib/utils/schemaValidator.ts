import { type Schema, type ValidationResult } from '@/lib/types/schema';

export function validateSchema(schema: Schema): ValidationResult {
  if (!schema.id || !schema.fields || typeof schema.version !== 'number') {
    return {
      isValid: false,
      errors: ['Invalid schema structure']
    };
  }
  return { isValid: true };
}
