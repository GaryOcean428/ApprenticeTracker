export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  active: boolean;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  status: 'active' | 'completed' | 'withdrawn';
  progress: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'exam';
  dueDate?: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type CourseUpdate = Partial<Omit<Course, 'id' | 'createdAt' | 'updatedAt'>>;
export type EnrollmentUpdate = Partial<Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>>;
export type AssessmentUpdate = Partial<Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>>;
export type UnitUpdate = Partial<Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>>;
