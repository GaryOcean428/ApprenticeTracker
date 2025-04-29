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
      // For Stage 1 MVP, return static data if API fails
      return staticJobs;
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
      // For Stage 1 MVP, return static data if API fails
      const job = staticJobs.find(j => j.id === id);
      if (!job) throw new Error('Job not found');
      return job;
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
      // For Stage 1 MVP, simulate success response
      return { 
        success: true, 
        message: 'Your application has been received! We will contact you soon.' 
      };
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
      // For Stage 1 MVP, simulate success response
      return { 
        success: true, 
        message: 'Your inquiry has been received! Our team will contact you shortly.' 
      };
    }
  }
};

// Static data for Stage 1 MVP
// In Stage 2, this data would come from the CRM through API calls
const staticJobs: JobListing[] = [
  {
    id: "1",
    title: "Carpentry Apprentice",
    location: "Perth Metro",
    type: "Full-time",
    description:
      "Join a leading construction company as a Carpentry Apprentice. Learn all aspects of carpentry while earning. Perfect for someone with basic hand tool skills and a passion for building.",
    requirements: ["Driver's License", "Year 10 completion", "Physically fit", "Reliable transportation"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Electrical Apprentice",
    location: "Perth Metro",
    type: "Full-time",
    description:
      "Fantastic opportunity for a motivated individual to join a well-established electrical contracting business as an apprentice electrician. Work on residential and commercial projects.",
    requirements: ["Year 12 Maths & English", "Driver's License", "Basic technical understanding", "Good communication skills"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Plumbing Apprentice",
    location: "Joondalup",
    type: "Full-time",
    description:
      "Join our team as a Plumbing Apprentice. Learn all aspects of plumbing while working alongside experienced tradespeople. Great opportunity for someone looking to build a career in the trades.",
    requirements: ["Year 10 completion", "Good problem-solving skills", "Physically fit", "Willing to learn"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Business Traineeship",
    location: "Perth CBD",
    type: "Full-time",
    description:
      "Exciting opportunity for a business trainee to join our corporate office. Gain hands-on experience in administration, customer service, and office procedures while earning a qualification.",
    requirements: ["Year 12 completion", "Computer literacy", "Good communication skills", "Customer service focus"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
