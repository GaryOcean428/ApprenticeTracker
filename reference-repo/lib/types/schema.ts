export interface Schema {
  id: string;
  fields: Record<string, {
    type: string;
    required?: boolean;
    validation?: Record<string, unknown>;
  }>;
  version: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}
