import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useLMS } from '@/lib/hooks/use-lms';
import type { CourseCreate } from '@/lib/types/lms';

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  instructor: z.string().min(1, 'Instructor is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required')
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  courseId?: string;
  initialData?: CourseFormData;
  onSubmit: (data: CourseFormData) => Promise<void>;
}

export function CourseForm({ courseId, initialData, onSubmit }: CourseFormProps): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { createCourse, updateCourse } = useLMS();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      instructor: '',
      start_date: '',
      end_date: ''
    }
  });

  const handleSubmit = async (values: CourseFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      if (courseId) {
        await updateCourse({ 
          data: values,
          match: { id: courseId }
        });
      } else {
        await createCourse({ 
          data: values as Record<string, unknown>
        });
      }
      onSubmit(values);
    } catch (error) {
      console.error('Failed to submit course:', error);
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
            {isSubmitting ? 'Submitting...' : 'Submit Course'}
          </button>
        </form>
      </Form>
    </Card>
  );
}
