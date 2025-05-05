export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, any>;
}

export interface ValidationRule<T> {
  validate: (value: T) => ValidationResult;
  message: string;
  severity: 'error' | 'warning';
}
