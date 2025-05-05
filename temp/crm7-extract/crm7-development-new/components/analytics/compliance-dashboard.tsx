import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface ComplianceStats {
  totalRecords: number;
  compliantCount: number;
  nonCompliantCount: number;
  complianceRate: number;
  lastUpdated: string;
}

export function ComplianceDashboard(): React.ReactElement {
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const calculateStats = (data: any[]): ComplianceStats => {
    const totalRecords = data.length;
    const compliantCount = data.filter(record => record.status === 'compliant').length;
    const nonCompliantCount = totalRecords - compliantCount;
    const complianceRate = totalRecords > 0 ? (compliantCount / totalRecords) * 100 : 0;

    return {
      totalRecords,
      compliantCount,
      nonCompliantCount,
      complianceRate,
      lastUpdated: new Date().toISOString()
    };
  };

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase.from('compliance_records').select('*');

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const calculatedStats: ComplianceStats = calculateStats(data);
      setStats(calculatedStats);

      toast({
        title: 'Dashboard Updated',
        description: 'Latest compliance data loaded successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch compliance data';
      setError(errorMessage);
      console.error('Error in fetchData:', err);

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    void fetchData();

    // Set up real-time subscription
    const subscription = supabase
      .channel('compliance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'compliance_records',
        },
        () => {
          void fetchData();
        }
      )
      .subscribe();

    return () => {
      void subscription.unsubscribe();
    };
  }, [fetchData, supabase]);

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => void fetchData()} className="w-full">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const StatCard = ({
    title,
    value,
    className = '',
  }: {
    title: string;
    value: React.ReactNode;
    className?: string;
  }) => (
    <div className="bg-card p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${className}`}>
        {loading ? <Skeleton className="h-8 w-24" /> : value}
      </p>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Compliance Dashboard</h2>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {stats?.lastUpdated && `Last updated: ${new Date(stats.lastUpdated).toLocaleString()}`}
          </p>
          <Button variant="ghost" size="sm" onClick={() => void fetchData()} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Document Storage & Versioning</h3>
          <p>Manage and store compliance-related documents with version control.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Automated Monitoring</h3>
          <p>Continuously monitor compliance requirements and statuses.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Alert System</h3>
          <p>Generate alerts for compliance issues, such as missing or expiring certifications.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Audit Trail</h3>
          <p>Maintain a detailed log of compliance-related activities and changes.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Regulatory Reporting</h3>
          <p>Generate reports to meet regulatory requirements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Compliance Rate"
          value={stats ? `${(stats.complianceRate * 100).toFixed(1)}%` : '-'}
          className="text-primary"
        />
        <StatCard title="Total Records" value={stats?.totalRecords ?? '-'} />
        <StatCard
          title="Compliant Records"
          value={stats?.compliantCount ?? '-'}
          className="text-green-500"
        />
        <StatCard
          title="Non-Compliant Records"
          value={stats?.nonCompliantCount ?? '-'}
          className="text-red-500"
        />
        <StatCard
          title="Compliance Trend"
          value={stats ? 'View Chart' : '-'}
          className="text-blue-500"
        />
        <StatCard
          title="Action Items"
          value={stats ? `${stats.nonCompliantCount} pending` : '-'}
          className="text-amber-500"
        />
      </div>
    </div>
  );
}
