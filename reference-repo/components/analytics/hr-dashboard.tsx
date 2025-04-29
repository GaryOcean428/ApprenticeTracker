'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Employee, Attendance, AttendanceStats } from '@/lib/types';

export function HRDashboard(): React.ReactElement {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    attendanceRate: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    totalOnLeave: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*');

        if (employeeError) throw employeeError;

        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*');

        if (attendanceError) throw attendanceError;

        setEmployees(employeeData as Employee[]);
        setAttendance(attendanceData as Attendance[]);
        calculateStats(attendanceData as Attendance[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch HR data'));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [supabase]);

  if (isLoading) {
    return <div>Loading HR data...</div>;
  }

  if (error) {
    return <div>Error loading HR data: {error.message}</div>;
  }

  const calculateStats = (attendanceData: Attendance[]): void => {
    const totalRecords = attendanceData.length;
    const present = attendanceData.filter(a => a.status === 'present').length;
    const absent = attendanceData.filter(a => a.status === 'absent').length;
    const late = attendanceData.filter(a => a.status === 'late').length;
    const onLeave = attendanceData.filter(a => a.status === 'leave').length;

    setStats({
      attendanceRate: totalRecords > 0 ? (present / totalRecords) * 100 : 0,
      totalPresent: present,
      totalAbsent: absent,
      totalLate: late,
      totalOnLeave: onLeave
    });
  };

  const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const formatPercent = (value: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  const getStatusColor = (status: Employee['status'] | Attendance['status']): string => {
    switch (status) {
      case 'active':
      case 'present':
        return 'text-green-600';
      case 'inactive':
      case 'absent':
        return 'text-red-600';
      case 'on_leave':
      case 'leave':
        return 'text-yellow-600';
      case 'late':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Attendance Rate</h3>
          <p className="text-2xl font-bold">{formatPercent(stats.attendanceRate)}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Present</h3>
          <p className="text-2xl font-bold text-green-600">{stats.totalPresent}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Absent</h3>
          <p className="text-2xl font-bold text-red-600">{stats.totalAbsent}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Late</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.totalLate}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">On Leave</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.totalOnLeave}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow">
        <h3 className="p-4 text-lg font-medium border-b">Employee Status</h3>
        <div className="divide-y">
          {employees.map((employee) => (
            <div key={employee.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{employee.name}</p>
                <p className="text-sm text-muted-foreground">{employee.position}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{employee.department}</p>
                <p className={`text-sm ${getStatusColor(employee.status)}`}>
                  {employee.status.replace('_', ' ').charAt(0).toUpperCase() + employee.status.slice(1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg shadow">
        <h3 className="p-4 text-lg font-medium border-b">Recent Attendance</h3>
        <div className="divide-y">
          {attendance.slice(0, 10).map((record) => {
            const employee = employees.find(e => e.id === record.employeeId);
            return (
              <div key={record.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{employee?.name || 'Unknown Employee'}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(record.date)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getStatusColor(record.status)}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </p>
                  {record.checkIn && record.checkOut && (
                    <p className="text-sm text-muted-foreground">
                      {record.checkIn} - {record.checkOut}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
