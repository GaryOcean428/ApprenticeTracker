import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  ChevronRight,
  Building,
  GraduationCap,
  ClipboardList,
  Clock,
  Briefcase,
  Users,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function PortalPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Navigate to specific modules
  const navigateTo = (path: string) => {
    toast({
      title: 'Opening module',
      description: `Navigating to ${path.slice(1)}`,
    });
    setLocation(path);
  };

  // If still loading user data, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="ml-4 text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  // If no user is found, redirect to login
  if (!user) {
    setLocation('/auth/login');
    return null;
  }

  // Generate user-specific greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper to format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Check if user has specific roles
  const isAdmin = user?.role === 'admin' || user?.role === 'developer';
  const isApprentice = user?.role === 'apprentice';
  const isHost = user?.role === 'host_employer';
  const isFieldOfficer = user?.role === 'field_officer';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {getGreeting()}, {user?.firstName || user?.username}
            <span className="text-gray-400 text-base ml-2 font-normal">
              {formatDate(new Date())}
            </span>
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome to your CRM7 dashboard. Here's an overview of your recent activity.
          </p>
        </div>

        {/* Dashboard tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 lg:grid-cols-5 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
            {isApprentice && <TabsTrigger value="apprentice">Apprentice</TabsTrigger>}
            {isHost && <TabsTrigger value="host">Host Employer</TabsTrigger>}
            {isFieldOfficer && <TabsTrigger value="fieldOfficer">Field Officer</TabsTrigger>}
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Actions Card */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {isApprentice && (
                      <>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => navigateTo('/apprentices/timesheets/submit')}
                        >
                          <Clock className="mr-2 h-4 w-4" /> Submit Timesheet
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => navigateTo('/apprentices/qualifications')}
                        >
                          <GraduationCap className="mr-2 h-4 w-4" /> View Training Progress
                        </Button>
                      </>
                    )}

                    {isHost && (
                      <>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => navigateTo('/hosts/timesheets')}
                        >
                          <FileSpreadsheet className="mr-2 h-4 w-4" /> Approve Timesheets
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => navigateTo('/hosts/placements')}
                        >
                          <Users className="mr-2 h-4 w-4" /> View Placements
                        </Button>
                      </>
                    )}

                    {isFieldOfficer && (
                      <>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => navigateTo('/field-officers/visits/schedule')}
                        >
                          <Calendar className="mr-2 h-4 w-4" /> Schedule Visit
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => navigateTo('/field-officers/reviews')}
                        >
                          <ClipboardList className="mr-2 h-4 w-4" /> Progress Reviews
                        </Button>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => navigateTo('/admin/apprentices')}
                        >
                          <GraduationCap className="mr-2 h-4 w-4" /> Manage Apprentices
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => navigateTo('/admin/hosts')}
                        >
                          <Building className="mr-2 h-4 w-4" /> Manage Host Employers
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => navigateTo('/admin/compliance')}
                        >
                          <Shield className="mr-2 h-4 w-4" /> Compliance
                        </Button>
                      </>
                    )}

                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/profile')}
                    >
                      <Users className="mr-2 h-4 w-4" /> My Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Card */}
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>Your latest updates and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Activity items */}
                    <div className="flex items-start space-x-4 rounded-md p-3 bg-gray-50 border border-gray-100">
                      <CheckCircle className="mt-1 h-5 w-5 text-green-500" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Progress Review Completed</p>
                        <p className="text-xs text-gray-500">
                          Your quarterly progress review has been completed
                        </p>
                        <p className="text-xs text-gray-400">15 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 rounded-md p-3 bg-gray-50 border border-gray-100">
                      <Clock className="mt-1 h-5 w-5 text-blue-500" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Timesheet Submitted</p>
                        <p className="text-xs text-gray-500">
                          Your timesheet for week ending 03/05/2025 has been submitted for approval
                        </p>
                        <p className="text-xs text-gray-400">Yesterday</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 rounded-md p-3 bg-gray-50 border border-gray-100">
                      <Calendar className="mt-1 h-5 w-5 text-indigo-500" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Field Visit Scheduled</p>
                        <p className="text-xs text-gray-500">
                          Your field officer has scheduled a visit for 10/05/2025
                        </p>
                        <p className="text-xs text-gray-400">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="admin">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Shield className="mr-2 h-5 w-5" />
                    Administration
                  </CardTitle>
                  <CardDescription>Access the main administrative features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/admin')}
                    >
                      <Shield className="mr-2 h-4 w-4" /> Admin Dashboard
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/admin/users')}
                    >
                      <Users className="mr-2 h-4 w-4" /> User Management
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/admin/reports')}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" /> Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Apprentice Management
                  </CardTitle>
                  <CardDescription>Manage apprentices and their training</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/admin/apprentices')}
                    >
                      <Users className="mr-2 h-4 w-4" /> View All Apprentices
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/admin/qualifications')}
                    >
                      <GraduationCap className="mr-2 h-4 w-4" /> Qualifications
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/admin/progress-reviews')}
                    >
                      <ClipboardList className="mr-2 h-4 w-4" /> Progress Reviews
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="apprentice">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Your Training
                  </CardTitle>
                  <CardDescription>Access your training information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/apprentices/qualification')}
                    >
                      <GraduationCap className="mr-2 h-4 w-4" /> My Qualification
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/apprentices/reviews')}
                    >
                      <ClipboardList className="mr-2 h-4 w-4" /> Progress Reviews
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/apprentices/resources')}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" /> Learning Resources
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="mr-2 h-5 w-5" />
                    Timesheets
                  </CardTitle>
                  <CardDescription>Manage your work hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/apprentices/timesheets/submit')}
                    >
                      <Clock className="mr-2 h-4 w-4" /> Submit Timesheet
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/apprentices/timesheets')}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" /> View Timesheets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="host">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="mr-2 h-5 w-5" />
                    Apprentice Placements
                  </CardTitle>
                  <CardDescription>Manage your current apprentices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/hosts/apprentices')}
                    >
                      <Users className="mr-2 h-4 w-4" /> Current Apprentices
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/hosts/placements')}
                    >
                      <Building className="mr-2 h-4 w-4" /> Placement Details
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/hosts/request')}
                    >
                      <GraduationCap className="mr-2 h-4 w-4" /> Request New Apprentice
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="mr-2 h-5 w-5" />
                    Timesheets & Compliance
                  </CardTitle>
                  <CardDescription>Approve hours and access resources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/hosts/timesheets')}
                    >
                      <Clock className="mr-2 h-4 w-4" /> Approve Timesheets
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/hosts/compliance')}
                    >
                      <Shield className="mr-2 h-4 w-4" /> Compliance Resources
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/hosts/agreements')}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" /> Training Agreements
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fieldOfficer">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="mr-2 h-5 w-5" />
                    Apprentice Support
                  </CardTitle>
                  <CardDescription>Manage your assigned apprentices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/field-officers/apprentices')}
                    >
                      <Users className="mr-2 h-4 w-4" /> My Apprentices
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/field-officers/reviews')}
                    >
                      <ClipboardList className="mr-2 h-4 w-4" /> Progress Reviews
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/field-officers/support')}
                    >
                      <GraduationCap className="mr-2 h-4 w-4" /> Support Requests
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="mr-2 h-5 w-5" />
                    Site Visits & Activities
                  </CardTitle>
                  <CardDescription>Manage your field activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/field-officers/visits/schedule')}
                    >
                      <Calendar className="mr-2 h-4 w-4" /> Schedule Visit
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/field-officers/visits')}
                    >
                      <Clock className="mr-2 h-4 w-4" /> Visit History
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigateTo('/field-officers/hosts')}
                    >
                      <Building className="mr-2 h-4 w-4" /> Host Employers
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
