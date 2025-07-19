import { apiRequest } from './queryClient';
import { z } from 'zod';

/**
 * API response types and error handling
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

/**
 * Job listing type definition
 */
export interface JobListing {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  postedDate: string;
  category: string;
}

/**
 * Job application type definition
 */
export interface JobApplication {
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  experience?: string;
  interest: string;
}

/**
 * Host employer inquiry type definition
 */
export interface HostEmployerInquiry {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  employeeCount: string;
  message: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Parse API response with Zod schema validation
 */
export async function parseApiResponse<T>(response: Response, schema?: z.ZodType<T>): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.error || response.statusText || 'An unknown error occurred';
    throw new Error(errorMessage);
  }

  if (schema) {
    try {
      return schema.parse(data);
    } catch (err) {
      console.error('API response validation error:', err);
      throw new Error('The server returned invalid data');
    }
  }

  return data as T;
}

// API Configuration - use relative paths in production
const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return response;
  } catch (error: any) {
    console.error(`API request failed: ${error.message}`);
    throw error;
  }
}

/**
 * Generic API request functions with type safety
 */
export const api = {
  /**
   * GET request with automatic JSON parsing and validation
   */
  async get<T>(url: string, schema?: z.ZodType<T>): Promise<T> {
    const response = await apiRequest('GET', url);
    return parseApiResponse<T>(response, schema);
  },

  /**
   * POST request with automatic JSON parsing and validation
   */
  async post<T, D = unknown>(url: string, data: D, schema?: z.ZodType<T>): Promise<T> {
    const response = await apiRequest('POST', url, data);
    return parseApiResponse<T>(response, schema);
  },

  /**
   * PUT request with automatic JSON parsing and validation
   */
  async put<T, D = unknown>(url: string, data: D, schema?: z.ZodType<T>): Promise<T> {
    const response = await apiRequest('PUT', url, data);
    return parseApiResponse<T>(response, schema);
  },

  /**
   * PATCH request with automatic JSON parsing and validation
   */
  async patch<T, D = unknown>(url: string, data: D, schema?: z.ZodType<T>): Promise<T> {
    const response = await apiRequest('PATCH', url, data);
    return parseApiResponse<T>(response, schema);
  },

  /**
   * DELETE request with automatic JSON parsing and validation
   */
  async delete<T>(url: string, schema?: z.ZodType<T>): Promise<T> {
    const response = await apiRequest('DELETE', url);
    return parseApiResponse<T>(response, schema);
  },
};

/**
 * Create type-safe API endpoints for specific resource types
 */
export function createApiEndpoints<T, CreateType, UpdateType = Partial<CreateType>>(
  basePath: string,
  schemas?: {
    list?: z.ZodType<T[]>;
    single?: z.ZodType<T>;
    create?: z.ZodType<CreateType>;
    update?: z.ZodType<UpdateType>;
  }
) {
  return {
    /**
     * Get all items
     */
    getAll: () => api.get<T[]>(basePath, schemas?.list),

    /**
     * Get a single item by ID
     */
    getById: (id: number | string) => api.get<T>(`${basePath}/${id}`, schemas?.single),

    /**
     * Create a new item
     */
    create: (data: CreateType) => api.post<T, CreateType>(basePath, data, schemas?.single),

    /**
     * Update an existing item
     */
    update: (id: number | string, data: UpdateType) =>
      api.patch<T, UpdateType>(`${basePath}/${id}`, data, schemas?.single),

    /**
     * Delete an item
     */
    delete: (id: number | string) => api.delete<T>(`${basePath}/${id}`, schemas?.single),
  };
}

/**
 * Host employer API for employer inquiries
 */
export const hostEmployerApi = {
  /**
   * Submit a host employer inquiry
   */
  submitInquiry: async (
    inquiry: HostEmployerInquiry
  ): Promise<ApiSuccessResponse<{ id: string }>> => {
    // In a real application, this would submit to the backend
    // For now, just simulate a successful API call
    return {
      success: true,
      data: { id: 'inq-' + Math.floor(Math.random() * 1000) },
      message:
        'Your inquiry has been submitted successfully. Our team will contact you shortly to discuss how we can help your business.',
    };
  },
};

/**
 * Jobs API for apprenticeship listings and applications
 */
export const jobsApi = {
  /**
   * Get all job listings
   */
  getJobs: async (): Promise<JobListing[]> => {
    // Mock data for development - in production, this would be fetched from the server
    return [
      {
        id: 'job-1',
        title: 'Electrical Apprenticeship',
        location: 'Perth, WA',
        type: 'Full-time',
        description:
          'Join our team as an electrical apprentice and learn all aspects of the electrical trade while gaining valuable hands-on experience.',
        requirements: [
          'Year 12 completion or equivalent',
          'Basic knowledge of electrical systems',
          'Strong work ethic and willingness to learn',
          "Valid driver's license",
        ],
        postedDate: '2023-04-15',
        category: 'Electrical',
      },
      {
        id: 'job-2',
        title: 'Carpentry Apprenticeship',
        location: 'Fremantle, WA',
        type: 'Full-time',
        description:
          'Exciting opportunity to start your career in carpentry with on-the-job training and formal classroom instruction.',
        requirements: [
          'Year 10 completion or equivalent',
          'Good hand-eye coordination and practical skills',
          'Physically fit',
          'Reliable transportation',
        ],
        postedDate: '2023-04-12',
        category: 'Construction',
      },
      {
        id: 'job-3',
        title: 'Business Administration Traineeship',
        location: 'Joondalup, WA',
        type: 'Full-time',
        description:
          'Gain valuable skills in business administration, customer service, and office procedures in a supportive environment.',
        requirements: [
          'Year 12 completion or equivalent',
          'Basic computer skills',
          'Strong communication abilities',
          'Attention to detail',
        ],
        postedDate: '2023-04-10',
        category: 'Business',
      },
    ];
  },

  /**
   * Submit a job application
   */
  submitApplication: async (
    application: JobApplication
  ): Promise<ApiSuccessResponse<{ id: string }>> => {
    // In a real application, this would submit to the backend
    // For now, just simulate a successful API call
    return {
      success: true,
      data: { id: 'app-' + Math.floor(Math.random() * 1000) },
      message:
        'Your application has been submitted successfully. Our team will contact you shortly.',
    };
  },
};
