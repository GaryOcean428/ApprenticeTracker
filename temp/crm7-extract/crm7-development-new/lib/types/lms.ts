import type { Json } from './supabase';

export interface Course {
  id: string;
  org_id: string;
  title: string;
  description: string;
  instructor: string;
  start_date: string;
  end_date: string;
  duration: number;
  level: string;
  status: 'active' | 'inactive';
  metadata?: Json;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentBase {
  id: string;
  org_id: string;
  course_id: string;
  user_id: string;
  status: string;
  progress: number;
  start_date: string;
  completion_date?: string;
  metadata?: Json;
  created_at: string;
  updated_at: string;
}

export interface Enrollment extends EnrollmentBase {
  id: string;
  org_id: string;
  course_id: string;
  user_id: string;
  student_id: string;
  status: 'active' | 'completed' | 'withdrawn';
  progress: number;
  grade?: number;
  start_date: string;
  completion_date?: string;
  metadata?: Json;
  created_at: string;
  updated_at: string;
}

export type CourseCreate = Omit<Course, 'id' | 'created_at' | 'updated_at'>;
export type EnrollmentCreate = Omit<Enrollment, 'id' | 'created_at' | 'updated_at'>;
