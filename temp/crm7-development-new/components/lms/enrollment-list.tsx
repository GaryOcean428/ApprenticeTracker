import { type Enrollment } from '@/lib/types/lms';
import { useLMS } from '@/lib/hooks/use-lms';

interface EnrollmentListProps {
  enrollments: Enrollment[];
  onUpdate: () => void;
}

export function EnrollmentList({ enrollments, onUpdate }: EnrollmentListProps): JSX.Element {
  const { deleteEnrollment } = useLMS();

  const handleUnenroll = async (enrollmentId: string): Promise<void> => {
    try {
      await deleteEnrollment(enrollmentId);
      onUpdate();
    } catch (error) {
      console.error('Failed to unenroll:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Enrollment list implementation */}
    </div>
  );
}
