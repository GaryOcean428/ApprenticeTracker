import { queryClient } from "./queryClient";

// Base API URLs
const API_BASE_URL = '/api';

// Types
export interface JobListing {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApprenticeApplication {
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

export interface HostEmployerInquiry {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  employeeCount: string;
  message: string;
}

// API functions for jobs
export const jobsApi = {
  // Get all job listings
  getJobs: async (): Promise<JobListing[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },
  
  // Get job by ID
  getJobById: async (id: string): Promise<JobListing> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error;
    }
  },
  
  // Submit job application
  submitApplication: async (application: ApprenticeApplication): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(application),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit application');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }
};

// API functions for host employers
export const hostEmployerApi = {
  // Submit host employer inquiry
  submitInquiry: async (inquiry: HostEmployerInquiry): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/host-inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiry),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      throw error;
    }
  }
};


