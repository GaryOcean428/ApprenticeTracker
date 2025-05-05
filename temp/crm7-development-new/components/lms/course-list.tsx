import type { Course } from '@/lib/types/lms';
import { useLMS } from '@/lib/hooks/use-lms';

interface CourseListProps {
  courses: Course[];
  onUpdate: () => void;
}

export function CourseList({ courses, onUpdate }: CourseListProps): JSX.Element {
  const { updateCourse } = useLMS();

  const handleDeactivate = async (courseId: string): Promise<void> => {
    try {
      await updateCourse({ 
        data: { status: 'inactive' },
        match: { id: courseId }
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to deactivate course:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Course list implementation */}
    </div>
  );
}
