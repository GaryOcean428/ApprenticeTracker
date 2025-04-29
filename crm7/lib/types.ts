// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface Apprentice {
  id: string;
  name: string;
  email: string;
  phone: string;
  trade: string;
  employer: string;
  startDate: string;
  status: 'active' | 'completed' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
}

// MFA Types
export interface MFASetupProps {
  userId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface MFAVerifyProps {
  userId: string;
  token: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export type MFAStatus = 'disabled' | 'pending' | 'enabled';

// Training Types
export interface Training {
  id: string;
  title: string;
  description: string;
  modules: TrainingModule[];
  createdAt: string;
  updatedAt: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number; // in minutes
}

export interface TrainingEnrollment {
  id: string;
  userId: string;
  trainingId: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt: string;
  completedAt?: string;
}

export interface TrainingStats {
  totalEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
  averageCompletionTime: number;
}

// Transaction Types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// Financial Stats
export interface FinancialStats {
  revenue: number;
  expenses: number;
  profit: number;
}

// Performance
export interface Performance {
  id: string;
  period: string;
  revenue: number;
  growth: number;
  margin: number;
  status: 'approved' | 'submitted' | 'draft';
}

export interface PerformanceStats {
  revenue: number;
  growth: number;
  margin: number;
}

export interface PerformanceState {
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
  timing: {
    loadTime: number;
    domContentLoaded: number;
  } | null;
  navigation: {
    ttfb: number;
    fcp: number;
  } | null;
}

export type PerformanceAction =
  | {
      type: 'UPDATE_MEMORY';
      payload: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    }
  | {
      type: 'UPDATE_TIMING';
      payload: {
        loadTime: number;
        domContentLoaded: number;
      };
    }
  | {
      type: 'UPDATE_NAVIGATION';
      payload: {
        ttfb: number;
        fcp: number;
      };
    };

export interface PerformanceContextType {
  state: PerformanceState;
  dispatch: React.Dispatch<PerformanceAction>;
  startMonitoring: () => NodeJS.Timer;
  stopMonitoring: () => void;
}

// Employee
export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  startDate: string;
  status: 'active' | 'inactive' | 'on_leave';
}

// Attendance
export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  checkIn?: string;
  checkOut?: string;
}

export interface AttendanceStats {
  attendanceRate: number;
  totalPresent?: number;
  totalAbsent?: number;
  totalLate?: number;
  totalOnLeave?: number;
}

// Compliance Record
export interface ComplianceRecord {
  id: string;
  status: 'compliant' | 'warning' | 'violation';
  category: string;
  description: string;
  date: string;
  resolution?: string;
}
