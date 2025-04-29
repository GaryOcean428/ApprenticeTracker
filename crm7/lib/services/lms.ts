import { logger } from '@/lib/services/logger';
import { createClient } from '@/lib/supabase/client';

export interface Course {
  id: string;
  org_id: string;
  title: string;
  description: string;
  instructor: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  org_id: string;
  course_id: string;
  student_id: string;
  status: 'active' | 'completed' | 'withdrawn';
  progress: number;
  grade?: number;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  org_id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  total_points: number;
  weight: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  metadata?: {
    passing_grade: number;
  };
}

export interface Unit {
  id: string;
  org_id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export type CourseUpdate = Partial<Course>;
export type EnrollmentUpdate = Partial<Enrollment>;
export type AssessmentUpdate = Partial<Assessment>;
export type UnitUpdate = Partial<Unit>;

export class LMSService {
  private supabase = createClient();

  // Course Management
  async getCourses(params: {
    category?: string;
    level?: Course['difficulty'];
    status?: Course['status'];
  }): Promise<Course[]> {
    try {
      let query = this.supabase.from('courses').select('*');

      if (params.category) {
        query = query.eq('category', params.category);
      }
      if (params.level) {
        query = query.eq('level', params.level);
      }
      if (params.status) {
        query = query.eq('status', params.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Course[];
    } catch (error) {
      logger.error('Failed to fetch courses', error as Error);
      throw error;
    }
  }

  async getCourseById(id: string): Promise<Course> {
    try {
      const { data, error } = await this.supabase.from('courses').select('*').eq('id', id).single();

      if (error) throw error;
      return data as Course;
    } catch (error) {
      logger.error('Failed to fetch course', error as Error, { id });
      throw error;
    }
  }

  // Enrollment Management
  async enrollUser(userId: string, courseId: string): Promise<Enrollment> {
    try {
      const { data, error } = await this.supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          status: 'enrolled',
          progress: 0,
          start_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as Enrollment;
    } catch (error) {
      logger.error('Failed to enroll user', error as Error, { userId, courseId });
      throw error;
    }
  }

  async updateProgress(enrollmentId: string, progress: number): Promise<{ data: Enrollment }> {
    try {
      const { data, error } = await this.supabase
        .from('enrollments')
        .update({
          progress,
          status: progress === 100 ? 'completed' : 'in_progress',
          completion_date: progress === 100 ? new Date().toISOString() : null,
        })
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Enrollment };
    } catch (error) {
      logger.error('Failed to update progress', error as Error, { enrollmentId, progress });
      throw error;
    }
  }

  // Assessment Management
  async getAssessments(courseId: string): Promise<Assessment[]> {
    try {
      const { data, error } = await this.supabase
        .from('assessments')
        .select('*')
        .eq('course_id', courseId);

      if (error) throw error;
      return data as Assessment[];
    } catch (error) {
      logger.error('Failed to fetch assessments', error as Error, { courseId });
      throw error;
    }
  }

  async submitAssessment(params: {
    enrollment_id: string;
    assessment_id: string;
    answers: Record<string, unknown>;
    grade: number;
  }): Promise<Assessment> {
    try {
      const { data, error } = await this.supabase
        .from('assessment_submissions')
        .insert({
          ...params,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const assessment = await this.getAssessmentById(params.assessment_id);
      if (params.grade >= (assessment.metadata?.passing_grade || 70)) {
        await this.updateProgress(params.enrollment_id, 100);
      }

      return data;
    } catch (error) {
      logger.error('Failed to submit assessment', error as Error, { params });
      throw error;
    }
  }

  async getAssessmentById(id: string): Promise<Assessment> {
    const { data, error } = await this.supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Assessment;
  }

  // Analytics
  async getEnrollmentStats(courseId: string): Promise<Record<string, unknown>> {
    try {
      const { data, error } = await this.supabase.rpc('get_enrollment_stats', {
        course_id: courseId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to fetch enrollment stats', error as Error, { courseId });
      throw error;
    }
  }

  async getUserProgress(userId: string): Promise<Record<string, unknown>> {
    try {
      const { data, error } = await this.supabase.rpc('get_user_progress', {
        user_id: userId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to fetch user progress', error as Error, { userId });
      throw error;
    }
  }
}

export const lmsService = new LMSService();
