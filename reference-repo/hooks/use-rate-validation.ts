import { useState } from 'react';
import type { RateValidationRequest, RateValidationResponse } from '@/lib/services/fairwork/types';

interface UseRateValidationResult {
  validateRate: (
    awardCode: string,
    classificationCode: string,
    request: RateValidationRequest
  ) => Promise<void>;
  validationResult: RateValidationResponse | null;
  isValidating: boolean;
  error: string | null;
  reset: () => void;
}

export function useRateValidation(): UseRateValidationResult {
  const [validationResult, setValidationResult] = useState<RateValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setValidationResult(null);
    setError(null);
  };

  const validateRate = async (
    awardCode: string,
    classificationCode: string,
    request: RateValidationRequest
  ): Promise<void> => {
    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch(`/api/fairwork/${awardCode}/${classificationCode}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          // If we can't parse the error response, use a generic message
          throw new Error(`Failed to validate rate (${response.status})`);
        }
        throw new Error(errorData.message || `Failed to validate rate (${response.status})`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response from server');
      }

      const data = await response.json();
      setValidationResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate rate';
      setError(errorMessage);
      // Re-throw the error so the component can handle it if needed
      throw err;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateRate,
    validationResult,
    isValidating,
    error,
    reset,
  };
}
