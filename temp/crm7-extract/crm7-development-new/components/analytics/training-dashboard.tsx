'use client';

import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface TrainingStats {
  totalEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
  averageCompletionTime: number;
  completionRate: number;
}

interface TrainingDashboardProps {
  courseId: string;
  onDataChange?: (stats: TrainingStats) => void;
}

export function TrainingDashboard({ courseId, onDataChange }: TrainingDashboardProps) {
  const supabase = createClient();
  const [stats, setStats] = useState<TrainingStats>({
    totalEnrollments: 0,
    completedEnrollments: 0,
    averageProgress: 0,
    averageCompletionTime: 0,
    completionRate: 0,
  });
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('training_enrollments')
          .select('*');

        if (enrollmentError) throw enrollmentError;

        const totalEnrollments = enrollmentData.length;
        const completedEnrollments = enrollmentData.filter(e => e.status === 'completed').length;

        const completionRate = (completedEnrollments / totalEnrollments) * 100;

        setStats({
          totalEnrollments,
          completedEnrollments,
          averageProgress: 0,
          averageCompletionTime: 0,
          completionRate,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch training data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, courseId]);

  useEffect(() => {
    if (stats && onDataChange) {
      onDataChange(stats);
    }
  }, [stats, onDataChange]);

  if (isLoading) {
    return <div>Loading training statistics...</div>;
  }

  if (error) {
    return <div>Error loading training data: {error.message}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium">Completion Rate</h3>
          <p className="text-2xl font-bold">{stats.completionRate}%</p>
        </div>
      </Card>
      {/* Add more stats cards as needed */}
    </div>
  );
}
