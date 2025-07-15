import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageHeader } from '@/components/page-header';
import {
  GraduationCap,
  Briefcase,
  ClipboardList,
  FileText,
  Calendar,
  Award,
  BookOpen,
  ArrowRightCircle,
  UserPlus,
  Settings,
  School,
} from 'lucide-react';

export default function ExternalEmployeesApprenticePage() {
  return (
    <DashboardShell>
      <PageHeader
        heading="Apprentices & Trainees"
        description="Manage apprentices and trainees through their entire lifecycle"
      >
        <Button asChild>
          <Link href="/apprentices/create">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Apprentice
          </Link>
        </Button>
      </PageHeader>

      {/* Workflow Stage Visualization */}
      <div className="my-6">
        <h3 className="text-lg font-medium mb-4">Apprentice Workflow Stages</h3>
        <div className="flex flex-col md:flex-row gap-2 text-sm">
          <div className="flex-1 border rounded-lg p-3 bg-blue-50 border-blue-200">
            <div className="font-medium text-blue-800 mb-1">Applicant</div>
            <div className="text-blue-600">Initial candidate</div>
          </div>
          <div className="flex items-center justify-center text-muted-foreground px-1">
            <ArrowRightCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 border rounded-lg p-3 bg-indigo-50 border-indigo-200">
            <div className="font-medium text-indigo-800 mb-1">Shortlisted</div>
            <div className="text-indigo-600">Selected for interview</div>
          </div>
          <div className="flex items-center justify-center text-muted-foreground px-1">
            <ArrowRightCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 border rounded-lg p-3 bg-purple-50 border-purple-200">
            <div className="font-medium text-purple-800 mb-1">Interviewing</div>
            <div className="text-purple-600">Assessment phase</div>
          </div>
          <div className="flex items-center justify-center text-muted-foreground px-1">
            <ArrowRightCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 border rounded-lg p-3 bg-amber-50 border-amber-200">
            <div className="font-medium text-amber-800 mb-1">Registration</div>
            <div className="text-amber-600">Formal onboarding</div>
          </div>
          <div className="flex items-center justify-center text-muted-foreground px-1">
            <ArrowRightCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 border rounded-lg p-3 bg-green-50 border-green-200">
            <div className="font-medium text-green-800 mb-1">Current</div>
            <div className="text-green-600">Active apprentice</div>
          </div>
          <div className="flex items-center justify-center text-muted-foreground px-1">
            <ArrowRightCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 border rounded-lg p-3 bg-teal-50 border-teal-200">
            <div className="font-medium text-teal-800 mb-1">Completed</div>
            <div className="text-teal-600">Skilled worker</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Summary Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Apprentices</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">Active apprentices in the system</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Host Employers</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Current host employers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completions</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">This calendar year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Training Progress</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42%</div>
                <p className="text-xs text-muted-foreground">Average competency completion</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Apprentice Distribution */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Apprentice Status</CardTitle>
                <CardDescription>Current distribution by stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span>Current</span>
                    </div>
                    <span className="text-sm">60%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span>Recruitment</span>
                    </div>
                    <span className="text-sm">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                      <span>Onboarding</span>
                    </div>
                    <span className="text-sm">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                      <span>Completed</span>
                    </div>
                    <span className="text-sm">0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest apprentice-related updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-blue-100 p-2">
                      <UserPlus className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">New apprentice onboarded</p>
                      <p className="text-sm text-muted-foreground">
                        John Smith has been registered as a new apprentice
                      </p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-green-100 p-2">
                      <Briefcase className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">New placement created</p>
                      <p className="text-sm text-muted-foreground">
                        Sarah Johnson placed with BuildRight Construction
                      </p>
                      <p className="text-xs text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-purple-100 p-2">
                      <School className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Training progress updated</p>
                      <p className="text-sm text-muted-foreground">
                        Mike Chen completed 3 new units of competency
                      </p>
                      <p className="text-xs text-muted-foreground">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Button asChild variant="outline" className="md:flex-1">
              <Link href="/apprentices">
                <GraduationCap className="mr-2 h-4 w-4" />
                All Apprentices
              </Link>
            </Button>
            <Button asChild variant="outline" className="md:flex-1">
              <Link href="/placements">
                <Briefcase className="mr-2 h-4 w-4" />
                All Placements
              </Link>
            </Button>
            <Button asChild variant="outline" className="md:flex-1">
              <Link href="/progress-reviews">
                <ClipboardList className="mr-2 h-4 w-4" />
                Progress Reviews
              </Link>
            </Button>
            <Button asChild variant="outline" className="md:flex-1">
              <Link href="/apprentices/training">
                <BookOpen className="mr-2 h-4 w-4" />
                Training Records
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="recruitment" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Apprentice Recruitment</CardTitle>
              <CardDescription>Manage the recruitment pipeline for new apprentices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <div className="text-center">
                  <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Recruitment Management</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Manage applicants, interviews, assessments, and onboarding for new apprentices
                    and trainees.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/apprentices/recruitment">Go to Recruitment</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Plans</CardTitle>
              <CardDescription>Manage training plans and progress tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <div className="text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Training Management</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Create, update and monitor training plans and completion of competency units for
                    all apprentices.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/apprentices/training">Manage Training</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Placements & Rotations</CardTitle>
              <CardDescription>Manage host employer placements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <div className="text-center">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Placement Management</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Assign apprentices to host employers, manage rotations, and track placement
                    history and performance.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/placements">View Placements</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>Monitor apprentice progress and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <div className="text-center">
                  <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Progress Management</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Track apprentice progress through reviews, assessments, and competency
                    completions. Generate progress reports.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/progress-reviews">View Progress Reviews</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completion" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Completion & Transition</CardTitle>
              <CardDescription>
                Manage apprenticeship completions and worker transitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <div className="text-center">
                  <Award className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Completion Management</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Process apprenticeship completions, issue certifications, and transition
                    completed apprentices to skilled worker status.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/apprentices/completion">Manage Completions</Link>
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
