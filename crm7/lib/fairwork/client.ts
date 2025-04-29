export class FairWorkApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'FairWorkApiError';
  }
}

export interface LeaveEntitlement {
  type: string;
  amount: number;
  unit: string;
  description?: string;
}

export interface FairWorkClientConfig {
  apiUrl?: string;
  apiKey?: string;
  environment?: 'sandbox' | 'production';
}

export class FairWorkClient {
  private apiUrl: string;
  private apiKey?: string;
  private environment?: string;

  constructor(config?: FairWorkClientConfig) {
    this.apiUrl = config?.apiUrl || process.env.FAIRWORK_API_URL || '';
    this.apiKey = config?.apiKey || process.env.FAIRWORK_API_KEY;
    this.environment = config?.environment || process.env.FAIRWORK_ENVIRONMENT;
  }

  async getLeaveEntitlements(
    awardCode: string,
    classificationCode: string,
    query?: { date?: string; employmentType?: string }
  ): Promise<any> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) {
        headers.Authorization = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(
        `${this.apiUrl}/awards/${awardCode}/classifications/${classificationCode}/leave-entitlements`,
        {
          headers,
          ...query ? { params: query } : {},
        }
      );

      if (!response.ok) {
        throw new FairWorkApiError('Failed to fetch leave entitlements', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof FairWorkApiError) {
        throw error;
      }
      throw new FairWorkApiError('Failed to fetch leave entitlements', 500, { error });
    }
  }

  async getRates(
    awardCode: string,
    classificationCode: string,
    query?: { date?: string; employmentType?: string }
  ): Promise<any> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) {
        headers.Authorization = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(
        `${this.apiUrl}/awards/${awardCode}/classifications/${classificationCode}/rates`,
        {
          headers,
          ...query ? { params: query } : {},
        }
      );

      if (!response.ok) {
        throw new FairWorkApiError('Failed to fetch rates', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof FairWorkApiError) {
        throw error;
      }
      throw new FairWorkApiError('Failed to fetch rates', 500, { error });
    }
  }

  async getAllowances(
    awardCode: string,
    query?: { date?: string }
  ): Promise<any> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) {
        headers.Authorization = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(
        `${this.apiUrl}/awards/${awardCode}/allowances`,
        {
          headers,
          ...query ? { params: query } : {},
        }
      );

      if (!response.ok) {
        throw new FairWorkApiError('Failed to fetch allowances', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof FairWorkApiError) {
        throw error;
      }
      throw new FairWorkApiError('Failed to fetch allowances', 500, { error });
    }
  }

  async validatePayRate(
    awardCode: string,
    classificationCode: string,
    rate: number
  ): Promise<boolean> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) {
        headers.Authorization = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(
        `${this.apiUrl}/awards/${awardCode}/classifications/${classificationCode}/validate`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ rate }),
        }
      );

      if (!response.ok) {
        throw new FairWorkApiError('Failed to validate pay rate', response.status);
      }

      const data = await response.json();
      return data.valid;
    } catch (error) {
      if (error instanceof FairWorkApiError) {
        throw error;
      }
      throw new FairWorkApiError('Failed to validate pay rate', 500, { error });
    }
  }
}
