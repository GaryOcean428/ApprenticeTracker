import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Building2, 
  AlertTriangle, 
  FileWarning,
  BarChart2, 
  PieChart,
  FileText
} from "lucide-react";
import { Link } from "wouter";
import StatCard from "@/components/dashboard/stat-card";
import ChartPlaceholder from "@/components/dashboard/chart-placeholder";
import RecentActivity from "@/components/dashboard/recent-activity";
import TaskList from "@/components/dashboard/tasks";
import ApprenticeTable from "@/components/dashboard/apprentice-table";
import QuickAccess from "@/components/dashboard/quick-access";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardMetrics {
  totalApprentices: number;
  activeHosts: number;
  complianceAlerts: number;
  pendingApprovals: number;
}

const Dashboard = () => {
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/metrics');
      if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
      return res.json() as Promise<DashboardMetrics>;
    }
  });
  
  return (
    <>
      <h2 className="my-6 text-2xl font-semibold text-foreground">Dashboard</h2>
      
      {/* Metrics Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {isLoadingMetrics ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-card rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-full mr-4" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-3 w-2/5 mt-1" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Total Apprentices"
              value={metrics?.totalApprentices || 0}
              icon={Users}
              iconColor="text-primary"
              iconBgColor="bg-primary-100"
              change={{
                value: "12%",
                positive: true,
                text: "since last month"
              }}
            />
            
            <StatCard
              title="Active Hosts"
              value={metrics?.activeHosts || 0}
              icon={Building2}
              iconColor="text-secondary"
              iconBgColor="bg-secondary-100"
              change={{
                value: "5%",
                positive: true,
                text: "since last month"
              }}
            />
            
            <StatCard
              title="Compliance Alerts"
              value={metrics?.complianceAlerts || 0}
              icon={AlertTriangle}
              iconColor="text-warning"
              iconBgColor="bg-yellow-100"
              change={{
                value: "3 new",
                positive: false,
                text: "since yesterday"
              }}
            />
            
            <StatCard
              title="Pending Approvals"
              value={metrics?.pendingApprovals || 0}
              icon={FileWarning}
              iconColor="text-accent"
              iconBgColor="bg-accent-100"
              change={{
                value: "8",
                text: "require immediate action"
              }}
            />
          </>
        )}
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <ChartPlaceholder 
          title="Apprentice Progress" 
          icon={BarChart2}
          description="Apprentice progress chart would appear here"
        />
        
        <ChartPlaceholder 
          title="Financial Summary" 
          icon={PieChart}
          description="Financial summary chart would appear here"
        />
      </div>
      
      {/* Recent Activities & Tasks */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <RecentActivity />
        <TaskList />
      </div>
      
      {/* Apprentice Table */}
      <div className="mb-8">
        <ApprenticeTable />
      </div>
      
      {/* Quick Access Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <div className="min-w-0 p-4 bg-white dark:bg-card rounded-lg shadow-sm">
          <h4 className="mb-4 font-semibold text-foreground flex items-center">
            <AlertTriangle className="text-primary mr-2 h-5 w-5" /> Compliance Center
          </h4>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Document Compliance</span>
              <span className="text-xs font-medium text-success">93%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full">
              <div className="h-2 bg-success rounded-full" style={{ width: "93%" }}></div>
            </div>
          </div>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Safety Compliance</span>
              <span className="text-xs font-medium text-warning">78%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full">
              <div className="h-2 bg-warning rounded-full" style={{ width: "78%" }}></div>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Contract Compliance</span>
              <span className="text-xs font-medium text-success">100%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full">
              <div className="h-2 bg-success rounded-full" style={{ width: "100%" }}></div>
            </div>
          </div>
          <Link href="/compliance" className="text-sm font-medium text-primary hover:underline">
            View compliance dashboard
          </Link>
        </div>
        
        <div className="min-w-0 p-4 bg-white dark:bg-card rounded-lg shadow-sm">
          <h4 className="mb-4 font-semibold text-foreground flex items-center">
            <FileText className="text-secondary mr-2 h-5 w-5" /> Document Center
          </h4>
          <ul className="space-y-3 mb-4">
            <li className="flex items-center">
              <div className="text-destructive mr-2">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-sm text-muted-foreground">Safety Manual v2.3</span>
              <span className="text-xs ml-auto text-muted-foreground">2d ago</span>
            </li>
            <li className="flex items-center">
              <div className="text-success mr-2">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-sm text-muted-foreground">Monthly Progress Report</span>
              <span className="text-xs ml-auto text-muted-foreground">1w ago</span>
            </li>
            <li className="flex items-center">
              <div className="text-info mr-2">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-sm text-muted-foreground">Contract Template</span>
              <span className="text-xs ml-auto text-muted-foreground">2w ago</span>
            </li>
            <li className="flex items-center">
              <div className="text-destructive mr-2">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-sm text-muted-foreground">Training Guidelines</span>
              <span className="text-xs ml-auto text-muted-foreground">1m ago</span>
            </li>
          </ul>
          <Link href="/documents" className="text-sm font-medium text-primary hover:underline">
            View document library
          </Link>
        </div>
        
        <QuickAccess />
      </div>
    </>
  );
};

export default Dashboard;
