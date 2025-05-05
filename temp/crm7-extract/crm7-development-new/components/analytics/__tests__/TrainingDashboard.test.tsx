import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useLMS } from '@/lib/hooks/use-lms';
import type { Course, Enrollment } from '@/lib/types/lms';
import { createMockQueryResult } from '@/lib/test-utils';
import { TrainingDashboard } from '@/components/analytics/training-dashboard';

vi.mock('@/lib/hooks/use-lms', () => ({
  useLMS: vi.fn()
}));

const mockCourses: Course[] = [
  {
    id: '1',
    org_id: 'org1',
    title: 'Test Course',
    description: 'Test Description',
    duration: 60,
    level: 'beginner',
    status: 'active',
    instructor: 'Test Instructor',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
];

const mockEnrollments: Enrollment[] = [
  {
    id: '1',
    org_id: 'org1',
    course_id: '1',
    user_id: 'user1',
    student_id: 'student1',
    status: 'active',
    progress: 50,
    start_date: '2025-01-01',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
];

describe('TrainingDashboard', () => {
  beforeEach(() => {
    vi.mocked(useLMS).mockReturnValue({
      courses: createMockQueryResult({
        data: mockCourses,
        isLoading: false,
        error: null,
      }),
      enrollments: createMockQueryResult({
        data: mockEnrollments,
        isLoading: false,
        error: null,
      }),
      createCourse: vi.fn(),
      updateCourse: vi.fn(),
      createEnrollment: vi.fn(),
      updateEnrollment: vi.fn(),
      isCreatingCourse: false,
      isUpdatingCourse: false,
      isCreatingEnrollment: false,
      isUpdatingEnrollment: false,
    } as any);
  });

  it('renders without crashing', () => {
    render(<TrainingDashboard courseId="test-course-1" />);
    expect(screen.getByText('Training Analytics')).toBeInTheDocument();
  });

  it('displays correct statistics', () => {
    render(<TrainingDashboard courseId="test-course-1" />);
    expect(screen.getByText('2')).toBeInTheDocument(); // Total Enrollments
    expect(screen.getByText('1')).toBeInTheDocument(); // Completed
    expect(screen.getByText('1')).toBeInTheDocument(); // In Progress
    expect(screen.getByText('50.0%')).toBeInTheDocument(); // Completion Rate
  });

  it('shows loading state', () => {
    vi.mocked(useLMS).mockReturnValue({
      courses: createMockQueryResult({
        data: undefined,
        isLoading: true,
        error: null,
      }),
      enrollments: createMockQueryResult({
        data: undefined,
        isLoading: true,
        error: null,
      }),
      createCourse: vi.fn(),
      updateCourse: vi.fn(),
      createEnrollment: vi.fn(),
      updateEnrollment: vi.fn(),
      isCreatingCourse: false,
      isUpdatingCourse: false,
      isCreatingEnrollment: false,
      isUpdatingEnrollment: false,
    } as any);

    render(<TrainingDashboard courseId="test-course-1" />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const error = new Error('Failed to load courses');
    vi.mocked(useLMS).mockReturnValue({
      courses: createMockQueryResult({
        data: [],
        isLoading: false,
        error,
      }),
      enrollments: createMockQueryResult({
        data: [],
        isLoading: false,
        error: null,
      }),
      createCourse: vi.fn(),
      updateCourse: vi.fn(),
      createEnrollment: vi.fn(),
      updateEnrollment: vi.fn(),
      isCreatingCourse: false,
      isUpdatingCourse: false,
      isCreatingEnrollment: false,
      isUpdatingEnrollment: false,
    } as any);

    render(<TrainingDashboard courseId="test-course-1" />);
    expect(screen.getByText(/Failed to load courses/i)).toBeInTheDocument();
  });
});
