/**
 * React hook for working with the Enhanced Rates Service
 * Provides client-side access to enhanced rates features
 */
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { useAuth } from '@/hooks/use-auth';
import { fetcher } from '@/lib/utils/fetcher';

interface UseEnhancedRatesOptions {
  orgId: string;
  startDate?: string;
  endDate?: string;
}

interface EnhancedRatesOperation {
  operation: string;
  params: Record<string, any>;
}

/**
 * Hook for accessing enhanced rate service features
 */
export function useEnhancedRates(options: UseEnhancedRatesOptions) {
  const { orgId, startDate, endDate } = options;
  const { session } = useAuth();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Error | null>(null);

  // URL params for analytics
  const urlParams = new URLSearchParams();
  urlParams.append('orgId', orgId);
  if (startDate) urlParams.append('startDate', startDate);
  if (endDate) urlParams.append('endDate', endDate);

  // Fetch enhanced analytics
  const { 
    data: enhancedAnalytics,
    error: analyticsError,
    isValidating: isLoadingAnalytics,
    mutate: refreshAnalytics
  } = useSWR(
    session?.user
      ? `/api/rates/enhanced?${urlParams.toString()}`
      : null,
    fetcher
  );

  // Execute an operation against the enhanced rates API
  async function executeOperation<T = unknown>(
    operation: EnhancedRatesOperation
  ): Promise<T> {
    try {
      setLoading({ ...loading, [operation.operation]: true });
      setError(null);

      const response = await fetch('/api/rates/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: operation.operation,
          orgId,
          params: operation.params,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform operation');
      }

      return await response.json();
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading({ ...loading, [operation.operation]: false });
    }
  }

  // Compare two rate templates
  async function compareTemplates(baseTemplateId: string, compareTemplateId: string) {
    return executeOperation({
      operation: 'compareTemplates',
      params: { baseTemplateId, compareTemplateId },
    });
  }

  // Validate a template against award compliance rules
  async function validateCompliance(templateId: string) {
    return executeOperation({
      operation: 'validateCompliance',
      params: { templateId },
    });
  }

  // Get suggested rates based on criteria
  async function getSuggestedRates(criteria: {
    industry?: string;
    role?: string;
    experience?: string;
  }) {
    return executeOperation({
      operation: 'getSuggestedRates',
      params: criteria,
    });
  }

  // Start a bulk validation operation
  async function bulkValidate(templateIds: string[]) {
    return executeOperation({
      operation: 'bulkValidate',
      params: { templateIds },
    });
  }

  // Restore a template to a previous version
  async function restoreVersion(templateId: string, version: number) {
    return executeOperation({
      operation: 'restoreVersion',
      params: { templateId, version },
    });
  }

  // Create return object with memoized values
  const enhancedRates = useMemo(() => ({
    enhancedAnalytics,
    isLoadingAnalytics,
    analyticsError,
    refreshAnalytics,
    compareTemplates,
    validateCompliance,
    getSuggestedRates,
    bulkValidate,
    restoreVersion,
    loading,
    error,
  }), [
    enhancedAnalytics,
    isLoadingAnalytics,
    analyticsError,
    loading,
    error
  ]);

  return enhancedRates;
}
