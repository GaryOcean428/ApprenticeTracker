import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useLMS } from '@/lib/hooks/use-lms';

const enrollmentSchema = z.object({
  student_id: z.string().min(1, 'Student ID is required'),
  course_id: z.string().min(1, 'Course ID is required'),
  progress: z.number().min(0).max(100),
  grade: z.number().min(0).max(100).optional()
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

interface EnrollmentFormProps {
  enrollmentId?: string;
  initialData?: EnrollmentFormData;
  onSubmit: (data: EnrollmentFormData) => Promise<void>;
}

export function EnrollmentForm({ enrollmentId, initialData, onSubmit }: EnrollmentFormProps): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { updateEnrollment, createEnrollment } = useLMS();

  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: initialData || {
      student_id: '',
      course_id: '',
      progress: 0,
      grade: undefined
    }
  });

  const handleSubmit = async (values: EnrollmentFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      if (enrollmentId) {
        await updateEnrollment({ 
          data: values,
          match: { id: enrollmentId }
        });
      } else {
        await createEnrollment({ 
          data: values
        });
      }
      onSubmit(values);
    } catch (error) {
      console.error('Failed to submit enrollment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Form fields */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Enrollment'}
          </button>
        </form>
      </Form>
    </Card>
  );
}
