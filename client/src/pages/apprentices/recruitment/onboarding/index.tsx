import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  ClipboardCheck,
  FileText,
  UserPlus,
  ChevronLeft,
  Clock,
  Shield,
  Briefcase,
  GraduationCap,
  CheckCheck,
  AlertCircle,
  ChevronRight,
  Calendar,
} from 'lucide-react';

export default function ApprenticeOnboarding() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Sample data from CSV files in attached_assets
  const onboardingCandidates = [
    {
      id: 8294,
      name: 'Sarah Johnson',
      qualification: 'Apprentice Carpenter',
      employer: 'BuildWell Construction',
      progress: 80,
      startDate: '01/06/2025',
      documents: ['Contract', 'ID Verification', 'Qualification'],
      stage: 'Registration',
      status: 'Active',
      tasks: [
        { task: 'Contract signing', completed: true },
        { task: 'Induction', completed: true },
        { task: 'Uniform & PPE', completed: true },
        { task: 'Training plan', completed: false },
        { task: 'Host employer assignment', completed: true },
      ],
    },
    {
      id: 7651,
      name: 'Michael Chen',
      qualification: 'Apprentice Plumber',
      employer: 'MainFlow Plumbing',
      progress: 60,
      startDate: '15/06/2025',
      documents: ['Contract', 'ID Verification'],
      stage: 'Induction',
      status: 'Active',
      tasks: [
        { task: 'Contract signing', completed: true },
        { task: 'Induction', completed: false },
        { task: 'Uniform & PPE', completed: true },
        { task: 'Training plan', completed: false },
        { task: 'Host employer assignment', completed: true },
      ],
    },
    {
      id: 11382,
      name: 'Tamir Abfahr',
      qualification: 'Electrician',
      employer: 'Mayvis Electrical',
      progress: 40,
      startDate: '10/07/2025',
      documents: ['Contract'],
      stage: 'Documentation',
      status: 'Pending',
      tasks: [
        { task: 'Contract signing', completed: true },
        { task: 'Induction', completed: false },
        { task: 'Uniform & PPE', completed: false },
        { task: 'Training plan', completed: false },
        { task: 'Host employer assignment', completed: false },
      ],
    },
  ];

  return (
    <DashboardShell>
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/apprentices/recruitment">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Recruitment
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/apprentices/recruitment/selections">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Selections
          </Link>
        </Button>
      </div>

      <PageHeader
        heading="Apprentice Onboarding"
        description="Manage the onboarding process for new apprentices"
      >
        <Button asChild>
          <Link href="/apprentices/create">
            <UserPlus className="mr-2 h-4 w-4" />
            New Apprentice
          </Link>
        </Button>
      </PageHeader>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Process</CardTitle>
            <CardDescription>
              Track apprentice progression through the onboarding workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative my-8">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
              <div className="relative flex justify-between">
                <div className="flex flex-col items-center z-10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-xs font-medium">Selected</div>
                </div>
                <div className="flex flex-col items-center z-10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-xs font-medium">Documentation</div>
                </div>
                <div className="flex flex-col items-center z-10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-xs font-medium">Induction</div>
                </div>
                <div className="flex flex-col items-center z-10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary bg-background">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="mt-2 text-xs font-medium">Compliance</div>
                </div>
                <div className="flex flex-col items-center z-10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-muted bg-background">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="mt-2 text-xs font-medium text-muted-foreground">Placement</div>
                </div>
                <div className="flex flex-col items-center z-10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-muted bg-background">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="mt-2 text-xs font-medium text-muted-foreground">Training</div>
                </div>
                <div className="flex flex-col items-center z-10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-muted bg-background">
                    <CheckCheck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="mt-2 text-xs font-medium text-muted-foreground">Active</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Onboarding Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Active onboardings in progress</p>
              <div className="mt-4 space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div>Completed</div>
                    <div className="font-medium">0</div>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div>In Progress</div>
                    <div className="font-medium">3</div>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8/15</div>
              <p className="text-xs text-muted-foreground">53% completion rate</p>
              <Progress value={53} className="h-2 mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Start Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {onboardingCandidates.map(candidate => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between text-sm pb-2 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{candidate.startDate}</span>
                    </div>
                    <Badge variant="outline">{candidate.name}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Onboardings</CardTitle>
            <CardDescription>
              Manage apprentices currently in the onboarding process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {onboardingCandidates.map(candidate => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-sm text-muted-foreground">{candidate.employer}</div>
                    </TableCell>
                    <TableCell>{candidate.qualification}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{candidate.stage}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={candidate.progress} className="h-2 w-[100px]" />
                        <span className="text-sm text-muted-foreground">{candidate.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{candidate.startDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/apprentices/recruitment/onboarding/${candidate.id}`}>
                            View
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toast({
                              title: 'Progress Updated',
                              description: `${candidate.name}'s onboarding progress updated`,
                            })
                          }
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Update
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Tabs defaultValue="checklists">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="checklists">Checklists</TabsTrigger>
            <TabsTrigger value="documents">Required Documents</TabsTrigger>
            <TabsTrigger value="approval">Approval Process</TabsTrigger>
          </TabsList>

          <TabsContent value="checklists" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Checklists</CardTitle>
                <CardDescription>Standard checklists for the onboarding process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    Documentation Checklist
                  </h3>
                  <div className="bg-muted p-4 rounded-md">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-sm">Contract Documents</span>
                          <p className="text-sm text-muted-foreground">
                            Training contract signed by all parties
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-sm">Identification Verification</span>
                          <p className="text-sm text-muted-foreground">
                            ID, citizenship or work rights verified
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-sm">Qualification Documentation</span>
                          <p className="text-sm text-muted-foreground">
                            Previous education and qualifications
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 text-orange-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-sm">Bank Details</span>
                          <p className="text-sm text-muted-foreground">
                            Payment information collection
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <ClipboardCheck className="h-4 w-4 mr-2 text-primary" />
                    Induction Checklist
                  </h3>
                  <div className="bg-muted p-4 rounded-md">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-sm">Company Induction</span>
                          <p className="text-sm text-muted-foreground">
                            Introduction to GTO policies and procedures
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 text-orange-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-sm">WHS Induction</span>
                          <p className="text-sm text-muted-foreground">
                            Workplace health and safety training
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 text-orange-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-sm">Equipment Issue</span>
                          <p className="text-sm text-muted-foreground">
                            Uniform, PPE, tools, and equipment
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2 text-primary" />
                    Training Checklist
                  </h3>
                  <div className="bg-muted p-4 rounded-md">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 text-orange-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-sm">Training Plan</span>
                          <p className="text-sm text-muted-foreground">
                            Development of formal training plan
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 text-orange-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-sm">RTO Registration</span>
                          <p className="text-sm text-muted-foreground">
                            Enrollment with registered training organization
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast({
                      title: 'Checklist',
                      description: 'Downloading onboarding checklist template',
                    })
                  }
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Download Checklist Template
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Required Documentation</CardTitle>
                <CardDescription>
                  Essential documents needed for apprentice onboarding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        Legal Documentation
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Photo ID (drivers license or passport)
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Tax file number declaration
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Superannuation form
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Work rights verification (if applicable)
                        </li>
                      </ul>
                    </div>

                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-purple-500" />
                        Training Documentation
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Training contract
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Education certificates
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Prior qualification transcripts
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Training plan acknowledgment
                        </li>
                      </ul>
                    </div>

                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-green-500" />
                        Employment Documentation
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Employment contract
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Policy acknowledgments
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Bank account details
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Emergency contact information
                        </li>
                      </ul>
                    </div>

                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-red-500" />
                        Health & Safety Documentation
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Medical declaration
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          WHS induction certificate
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          PPE acknowledgment
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          First aid requirements
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-4">Document Upload Status</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Apprentice</TableHead>
                          <TableHead>Legal Docs</TableHead>
                          <TableHead>Training Docs</TableHead>
                          <TableHead>Employment Docs</TableHead>
                          <TableHead>Health & Safety</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {onboardingCandidates.map(candidate => (
                          <TableRow key={candidate.id}>
                            <TableCell>{candidate.name}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  candidate.documents.includes('ID Verification')
                                    ? 'outline'
                                    : 'secondary'
                                }
                                className={
                                  candidate.documents.includes('ID Verification')
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : ''
                                }
                              >
                                {candidate.documents.includes('ID Verification')
                                  ? 'Complete'
                                  : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  candidate.documents.includes('Qualification')
                                    ? 'outline'
                                    : 'secondary'
                                }
                                className={
                                  candidate.documents.includes('Qualification')
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : ''
                                }
                              >
                                {candidate.documents.includes('Qualification')
                                  ? 'Complete'
                                  : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  candidate.documents.includes('Contract') ? 'outline' : 'secondary'
                                }
                                className={
                                  candidate.documents.includes('Contract')
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : ''
                                }
                              >
                                {candidate.documents.includes('Contract') ? 'Complete' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">Pending</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toast({
                                    title: 'Document Upload',
                                    description: `Upload documents for ${candidate.name}`,
                                  })
                                }
                              >
                                Upload
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approval" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Approval Process</CardTitle>
                <CardDescription>
                  Multi-step approval workflow for apprentice onboarding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute left-9 top-0 bottom-0 w-px bg-muted" />
                    <div className="space-y-6 relative">
                      <div className="flex">
                        <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground mr-4 shrink-0">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Initial Review</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Documentation verification and compliance check
                          </p>
                          <Badge
                            variant="outline"
                            className="mt-2 bg-green-50 text-green-700 border-green-200"
                          >
                            Completed
                          </Badge>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground mr-4 shrink-0">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Department Manager</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Team allocation and resource assignment
                          </p>
                          <Badge
                            variant="outline"
                            className="mt-2 bg-green-50 text-green-700 border-green-200"
                          >
                            Completed
                          </Badge>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary bg-background mr-4 shrink-0">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Financial Approval</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Compensation and budget authorization
                          </p>
                          <Badge variant="outline" className="mt-2">
                            In Progress
                          </Badge>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-muted bg-background mr-4 shrink-0">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">Training Manager</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Training plan and RTO coordination
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            Pending
                          </Badge>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-muted bg-background mr-4 shrink-0">
                          <CheckCheck className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">Final Authorization</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Executive approval and activation
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            Pending
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-md mt-6">
                    <h3 className="text-sm font-medium mb-2">Current Approvals Pending</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Apprentice</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead>Waiting On</TableHead>
                          <TableHead>Since</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {onboardingCandidates.map(candidate => (
                          <TableRow key={candidate.id}>
                            <TableCell>{candidate.name}</TableCell>
                            <TableCell>{candidate.stage}</TableCell>
                            <TableCell>
                              {candidate.stage === 'Registration'
                                ? 'Training Manager'
                                : candidate.stage === 'Induction'
                                  ? 'Financial Approval'
                                  : 'Department Manager'}
                            </TableCell>
                            <TableCell>2 days</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  toast({
                                    title: 'Reminder Sent',
                                    description: `Reminder sent for ${candidate.name}'s approval`,
                                  })
                                }
                              >
                                Send Reminder
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() =>
                    toast({
                      title: 'Process',
                      description: 'Approval process documentation downloaded',
                    })
                  }
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Download Process Document
                </Button>
                <Button
                  onClick={() => toast({ title: 'Access', description: 'Approval portal opened' })}
                >
                  Approval Portal
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
