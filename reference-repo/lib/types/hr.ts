export interface Employee {
  id: string;
  orgId: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  status: 'active' | 'inactive';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
}

export interface ComplianceRecord {
  id: string;
  employeeId: string;
  type: string;
  status: 'compliant' | 'non_compliant' | 'pending';
  dueDate: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  employeeId: string;
  type: 'salary' | 'bonus' | 'reimbursement' | 'deduction';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Performance {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  rating: number;
  goals: string[];
  achievements: string[];
  feedback: string;
  status: 'draft' | 'submitted' | 'approved';
  createdAt: string;
  updatedAt: string;
}
