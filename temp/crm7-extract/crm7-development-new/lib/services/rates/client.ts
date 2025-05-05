/**
 * Rate Service Client API
 * Provides client-side methods for accessing rate service features
 */

/**
 * Get all rate templates for an organization
 */
export async function getRateTemplates(orgId: string) {
  const response = await fetch(`/api/rates?orgId=${encodeURIComponent(orgId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch rate templates');
  }

  return await response.json();
}

/**
 * Get a single rate template by ID
 */
export async function getRateTemplate(templateId: string) {
  const response = await fetch(`/api/rates/${encodeURIComponent(templateId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch rate template');
  }

  return await response.json();
}

/**
 * Create a new rate template
 */
export async function createRateTemplate(template: any) {
  const response = await fetch('/api/rates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });

  if (!response.ok) {
    throw new Error('Failed to create rate template');
  }

  return await response.json();
}

/**
 * Update an existing rate template
 */
export async function updateRateTemplate(templateId: string, template: any) {
  const response = await fetch(`/api/rates/${encodeURIComponent(templateId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });

  if (!response.ok) {
    throw new Error('Failed to update rate template');
  }

  return await response.json();
}

/**
 * Delete a rate template
 */
export async function deleteRateTemplate(templateId: string) {
  const response = await fetch(`/api/rates/${encodeURIComponent(templateId)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete rate template');
  }

  return await response.json();
}

/**
 * Get rate template history
 */
export async function getRateTemplateHistory(templateId: string) {
  const response = await fetch(`/api/rates/${encodeURIComponent(templateId)}/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch rate template history');
  }

  return await response.json();
}

/**
 * Calculate rates for a template
 */
export async function calculateRates(templateId: string, params: any = {}) {
  const response = await fetch(`/api/rates/${encodeURIComponent(templateId)}/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to calculate rates');
  }

  return await response.json();
}

/**
 * Get rate analytics
 */
export async function getRateAnalytics(orgId: string) {
  const response = await fetch(`/api/rates/analytics?orgId=${encodeURIComponent(orgId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch rate analytics');
  }

  return await response.json();
}

/**
 * Enhanced rate operations via the enhanced API endpoint
 */

/**
 * Compare two rate templates
 */
export async function compareRateTemplates(orgId: string, baseTemplateId: string, compareTemplateId: string) {
  const response = await fetch('/api/rates/enhanced', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operation: 'compareTemplates',
      orgId,
      params: {
        baseTemplateId,
        compareTemplateId,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to compare rate templates');
  }

  return await response.json();
}

/**
 * Validate template compliance
 */
export async function validateTemplateCompliance(orgId: string, templateId: string) {
  const response = await fetch('/api/rates/enhanced', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operation: 'validateCompliance',
      orgId,
      params: {
        templateId,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to validate template compliance');
  }

  return await response.json();
}

/**
 * Get suggested rates
 */
export async function getSuggestedRates(orgId: string, criteria: {
  industry?: string;
  role?: string;
  experience?: string;
}) {
  const response = await fetch('/api/rates/enhanced', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operation: 'getSuggestedRates',
      orgId,
      params: criteria,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get suggested rates');
  }

  return await response.json();
}

/**
 * Get enhanced analytics
 */
export async function getEnhancedAnalytics(orgId: string, params: {
  startDate?: string;
  endDate?: string;
} = {}) {
  const urlParams = new URLSearchParams();
  urlParams.append('orgId', orgId);
  if (params.startDate) urlParams.append('startDate', params.startDate);
  if (params.endDate) urlParams.append('endDate', params.endDate);

  const response = await fetch(`/api/rates/enhanced?${urlParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch enhanced analytics');
  }

  return await response.json();
}
