import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Users,
  Briefcase,
  ClipboardList,
  Calendar,
  UserPlus,
  Award,
  CheckSquare,
  ArrowRightCircle,
} from 'lucide-react';
import type { LabourHireWorker } from '@shared/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { DashboardShell } from '@/components/dashboard-shell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Workflow stages component
const WorkflowStages = () => {
  return (
    <div className="my-6">
      <h3 className="text-lg font-medium mb-4">Worker Workflow Stages</h3>
      <div className="flex flex-col md:flex-row gap-2 text-sm">
        <div className="flex-1 border rounded-lg p-3 bg-blue-50 border-blue-200">
          <div className="font-medium text-blue-800 mb-1">Applicant</div>
          <div className="text-blue-600">Initial candidate evaluation</div>
        </div>
        <div className="flex items-center justify-center text-muted-foreground px-1">
          <ArrowRightCircle className="h-5 w-5" />
        </div>
        <div className="flex-1 border rounded-lg p-3 bg-indigo-50 border-indigo-200">
          <div className="font-medium text-indigo-800 mb-1">Shortlisted</div>
          <div className="text-indigo-600">Selected for consideration</div>
        </div>
        <div className="flex items-center justify-center text-muted-foreground px-1">
          <ArrowRightCircle className="h-5 w-5" />
        </div>
        <div className="flex-1 border rounded-lg p-3 bg-purple-50 border-purple-200">
          <div className="font-medium text-purple-800 mb-1">Interviewing</div>
          <div className="text-purple-600">Assessment in progress</div>
        </div>
        <div className="flex items-center justify-center text-muted-foreground px-1">
          <ArrowRightCircle className="h-5 w-5" />
        </div>
        <div className="flex-1 border rounded-lg p-3 bg-amber-50 border-amber-200">
          <div className="font-medium text-amber-800 mb-1">Offer → Registration</div>
          <div className="text-amber-600">Employment in process</div>
        </div>
        <div className="flex items-center justify-center text-muted-foreground px-1">
          <ArrowRightCircle className="h-5 w-5" />
        </div>
        <div className="flex-1 border rounded-lg p-3 bg-green-50 border-green-200">
          <div className="font-medium text-green-800 mb-1">Active Worker</div>
          <div className="text-green-600">Fully employed</div>
        </div>
      </div>
    </div>
  );
};

export default function ExternalEmployeesWorkersPage() {
  const { toast } = useToast();

  // Fetch labour hire workers count (if needed)
  const {
    data: workers = [],
    isLoading,
    error,
  } = useQuery<LabourHireWorker[]>({
    queryKey: ['/api/labour-hire/workers'],
  });

  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load workers data. Please try again.',
      variant: 'destructive',
    });
  }

  // Worker counts by status (would be calculated from actual data)
  const workerStats = {
    total: workers.length,
    active: workers.filter(w => w.status === 'active').length,
    inactive: workers.filter(w => w.status === 'inactive').length,
    pending: workers.filter(w => w.status === 'pending').length,
  };

  return (
    <DashboardShell>
      <PageHeader
        heading="Workers Management"
        description="Manage your labour hire workers and their placements"
      >
        <Button asChild>
          <Link href="/labour-hire/workers">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Worker
          </Link>
        </Button>
      </PageHeader>

      <Tabs defaultValue="dashboard" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="skills">Skills & Qualifications</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <WorkflowStages />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Worker Stats Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '...' : workerStats.total}</div>
                <p className="text-xs text-muted-foreground">Labour hire workers in the system</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Placements</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '...' : workerStats.active}</div>
                <p className="text-xs text-muted-foreground">Workers currently on assignment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Timesheets</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '...' : '12'}</div>
                <p className="text-xs text-muted-foreground">Timesheets awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Workers</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '...' : workerStats.inactive}</div>
                <p className="text-xs text-muted-foreground">Workers available for placement</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Worker Categories */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Worker Categories</CardTitle>
                <CardDescription>Types of labour hire workers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span>General Labour</span>
                    </div>
                    <span className="text-sm">{isLoading ? '-' : '35%'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span>Skilled Trades</span>
                    </div>
                    <span className="text-sm">{isLoading ? '-' : '25%'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span>Administrative</span>
                    </div>
                    <span className="text-sm">{isLoading ? '-' : '20%'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                      <span>Specialized</span>
                    </div>
                    <span className="text-sm">{isLoading ? '-' : '15%'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                      <span>Other</span>
                    </div>
                    <span className="text-sm">{isLoading ? '-' : '5%'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Actions */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Actions</CardTitle>
                <CardDescription>Latest worker-related activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">New placement created for David Wilson</p>
                      <p className="text-sm text-muted-foreground">Today at 10:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-green-100 p-2">
                      <CheckSquare className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">5 timesheets approved for weekly payroll</p>
                      <p className="text-sm text-muted-foreground">Yesterday at 4:15 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-purple-100 p-2">
                      <Award className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Emily Lee completed qualification verification</p>
                      <p className="text-sm text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Button asChild variant="outline" className="md:flex-1">
              <Link href="/labour-hire/workers">
                <Users className="mr-2 h-4 w-4" />
                View All Workers
              </Link>
            </Button>
            <Button asChild variant="outline" className="md:flex-1">
              <Link href="/labour-hire/placements">
                <Briefcase className="mr-2 h-4 w-4" />
                Manage Placements
              </Link>
            </Button>
            <Button asChild variant="outline" className="md:flex-1">
              <Link href="/labour-hire/timesheets">
                <ClipboardList className="mr-2 h-4 w-4" />
                View Timesheets
              </Link>
            </Button>
            <Button asChild variant="outline" className="md:flex-1">
              <Link href="/labour-hire/skills">
                <Award className="mr-2 h-4 w-4" />
                Skills Database
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="placements">
          <Card>
            <CardHeader>
              <CardTitle>Placements & Assignments</CardTitle>
              <CardDescription>View and manage worker placements at host employers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <div className="text-center">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Placement Management</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Manage all aspects of worker placements, including assignment matching, contract
                    administration, and performance monitoring.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/labour-hire/placements">Go to Placements</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timesheets">
          <Card>
            <CardHeader>
              <CardTitle>Timesheet Management</CardTitle>
              <CardDescription>Track and approve worker timesheets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <div className="text-center">
                  <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Timesheet Processing</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Submit, review, and approve timesheets for all workers. Generate payroll reports
                    and manage timesheet-based billing.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/labour-hire/timesheets">Manage Timesheets</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Qualifications</CardTitle>
              <CardDescription>Record and verify worker skills and certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <div className="text-center">
                  <Award className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Skills Database</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Track and validate worker qualifications, skills, and certifications. Match
                    workers to roles based on their verified skill profiles.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/labour-hire/skills">View Skills Database</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
