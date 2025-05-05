declare global {
  interface Window {
    // Add any custom window properties here
  }

  namespace App {
    interface User {
      id: string;
      email: string;
      name: string;
      role: 'admin' | 'user' | 'guest';
      avatar?: string;
      preferences?: UserPreferences;
      lastLogin?: Date;
    }

    interface UserPreferences {
      theme: 'light' | 'dark' | 'system';
      notifications: {
        email: boolean;
        push: boolean;
        desktop: boolean;
      };
      language: string;
      timezone: string;
    }

    interface ApiResponse<T> {
      data: T;
      status: number;
      message: string;
      timestamp: string;
    }

    interface PaginatedResponse<T> extends ApiResponse<T[]> {
      pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasMore: boolean;
      };
    }

    interface ErrorResponse {
      status: number;
      message: string;
      code?: string;
      details?: Record<string, unknown>;
    }

    type SortDirection = 'asc' | 'desc';

    interface SortOptions {
      field: string;
      direction: SortDirection;
    }

    interface FilterOptions {
      field: string;
      operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
      value: unknown;
    }

    interface QueryOptions {
      page?: number;
      pageSize?: number;
      sort?: SortOptions[];
      filters?: FilterOptions[];
      search?: string;
    }
  }

  // Add any other global type declarations here
}

export { };
