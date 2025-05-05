export interface Award {
  id: string;
  code: string;
  name: string;
  description?: string;
  baseRate: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  classifications: Classification[];
}

export interface Classification {
  id: string;
  code: string;
  name: string;
  level: string;
  baseRate: number;
}

export interface FairWorkError extends Error {
  code?: string;
  details?: unknown;
}
