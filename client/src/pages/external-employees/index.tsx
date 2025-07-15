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
import { PageHeader } from '@/components/page-header';
import { DashboardShell } from '@/components/dashboard-shell';
import {
  Briefcase,
  GraduationCap,
  UserPlus,
  FileText,
  CheckCircle2,
  Calendar,
  ClipboardList,
  Building2,
} from 'lucide-react';

export default function ExternalEmployeesPage() {
  return (
    <DashboardShell>
      <PageHeader
        heading="External Employees"
        description="Manage apprentices, trainees, and labour hire workers"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {/* Apprentices & Trainees Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Apprentices & Trainees</CardTitle>
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <CardDescription>Manage your apprentices and trainees</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <UserPlus className="h-4 w-4 mr-2 text-muted-foreground" />
                <Link href="/apprentices/recruitment" className="hover:underline text-blue-600">
                  Recruitment & onboarding
                </Link>
              </li>
              <li className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <Link href="/apprentices/training" className="hover:underline text-blue-600">
                  Training plans & progress
                </Link>
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <Link href="/apprentices/progress" className="hover:underline text-blue-600">
                  Competency tracking
                </Link>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" asChild>
              <Link href="/apprentices">View All Apprentices</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/external-employees/apprentices">Manage</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Labour Hire Workers Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Labour Hire Workers</CardTitle>
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <CardDescription>Manage your labour hire workforce</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <Link href="/labour-hire/placements" className="hover:underline text-blue-600">
                  Placements & assignments
                </Link>
              </li>
              <li className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <Link href="/labour-hire/timesheets" className="hover:underline text-blue-600">
                  Timesheets & attendance
                </Link>
              </li>
              <li className="flex items-center">
                <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                <Link href="/labour-hire/workers" className="hover:underline text-blue-600">
                  Skills & qualifications
                </Link>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" asChild>
              <Link href="/labour-hire/workers">View All Workers</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/external-employees/workers">Manage</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Workflow Progress Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Workflow Progress</CardTitle>
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
            </div>
            <CardDescription>Track progress through each stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Apprentice Workflow</div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground">Applicant → Worker</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Training Completion</div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground">Skill acquisition tracking</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Worker Transitions</div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '28%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground">Apprentice to skilled worker</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="sm" className="w-full" asChild>
              <Link href="/external-employees/workflow">View Workflow Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Separator className="my-6" />

      <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {/* Recent Apprentice Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Apprentice Updates</CardTitle>
            <CardDescription>Recent apprentice activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-blue-100 p-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">John Smith completed Certificate III</p>
                  <p className="text-sm text-muted-foreground">Today at 10:45 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-green-100 p-2">
                  <UserPlus className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Sarah Johnson entered probation period</p>
                  <p className="text-sm text-muted-foreground">Yesterday at 2:30 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-amber-100 p-2">
                  <Building2 className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Michael Chen assigned to new host employer</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Worker Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Worker Updates</CardTitle>
            <CardDescription>Recent labour hire activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-purple-100 p-2">
                  <Briefcase className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">David Wilson started new placement</p>
                  <p className="text-sm text-muted-foreground">Today at 9:15 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-red-100 p-2">
                  <Calendar className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">5 timesheets pending approval</p>
                  <p className="text-sm text-muted-foreground">Due by end of day</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-teal-100 p-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium">Emily Lee added to skilled worker pool</p>
                  <p className="text-sm text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
