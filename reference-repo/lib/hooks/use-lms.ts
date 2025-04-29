import { type Course, type Enrollment } from '@/lib/types/lms';
import { createClient } from '@supabase/supabase-js';
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query';
import { type Database } from '@/types/supabase';
import { useToast } from '@/components/ui/use-toast';

export function useLMS() {
  const { toast } = useToast();
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const courses = useSupabaseQuery<Course>(
    supabase,
    'courses'
  );

  const enrollments = useSupabaseQuery<Enrollment>(
    supabase,
    'enrollments'
  );

  const createCourseMutation = useSupabaseMutation<Course>(
    supabase,
    'courses'
  );

  const updateCourseMutation = useSupabaseMutation<Course>(
    supabase,
    'courses'
  );

  const createEnrollmentMutation = useSupabaseMutation<Enrollment>(
    supabase,
    'enrollments'
  );

  const updateEnrollmentMutation = useSupabaseMutation<Enrollment>(
    supabase,
    'enrollments'
  );

  const deleteEnrollment = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Enrollment deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete enrollment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete enrollment',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    courses,
    enrollments,
    createCourse: createCourseMutation.mutateAsync,
    updateCourse: updateCourseMutation.mutateAsync,
    createEnrollment: createEnrollmentMutation.mutateAsync,
    updateEnrollment: updateEnrollmentMutation.mutateAsync,
    deleteEnrollment,
    isCreatingCourse: createCourseMutation.isPending,
    isUpdatingCourse: updateCourseMutation.isPending,
    isCreatingEnrollment: createEnrollmentMutation.isPending,
    isUpdatingEnrollment: updateEnrollmentMutation.isPending,
  };
}
