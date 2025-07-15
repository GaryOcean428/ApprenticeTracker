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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CheckCircle,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  FileText,
  UserPlus,
  Check,
  X,
  MessageSquare,
  ArrowRight,
  ChevronLeft,
  Clock,
} from 'lucide-react';

export default function ApprenticeSelections() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for shortlisted candidates
  const shortlistedCandidates = [
    {
      id: 11382,
      name: 'Tamir Abfahr',
      qualification: 'Electrician',
      contact: '0415 952 046',
      dateOfBirth: '17/04/2002',
      employer: 'Mayvis Electrical',
      status: 'Shortlisted',
      interviewDate: '23/05/2025',
      resume: true,
      assessment: true,
      notes: 'Strong technical skills, good communication',
    },
    {
      id: 9716,
      name: 'Abdullahi Ali Mohamed',
      qualification: 'Apprentice Electrician',
      contact: '0423 337 066',
      dateOfBirth: '02/06/2003',
      employer: 'Curtin University',
      status: 'Shortlisted',
      interviewDate: '24/05/2025',
      resume: true,
      assessment: false,
      notes: 'Previous work experience in related field',
    },
    {
      id: 8294,
      name: 'Sarah Johnson',
      qualification: 'Apprentice Carpenter',
      contact: '0412 456 789',
      dateOfBirth: '05/11/2001',
      employer: 'BuildWell Construction',
      status: 'Shortlisted',
      interviewDate: '22/05/2025',
      resume: true,
      assessment: true,
      notes: 'TAFE pre-apprenticeship course completed',
    },
    {
      id: 7651,
      name: 'Michael Chen',
      qualification: 'Apprentice Plumber',
      contact: '0422 987 654',
      dateOfBirth: '12/08/2002',
      employer: 'MainFlow Plumbing',
      status: 'Shortlisted',
      interviewDate: '25/05/2025',
      resume: true,
      assessment: true,
      notes: 'Excellent practical assessment results',
    },
    {
      id: 10257,
      name: 'Emma Wilson',
      qualification: 'Apprentice Metal Fabricator',
      contact: '0433 222 111',
      dateOfBirth: '29/03/2004',
      employer: 'MetalWorks Industries',
      status: 'Shortlisted',
      interviewDate: '26/05/2025',
      resume: true,
      assessment: false,
      notes: 'Strong interest in welding, needs assessment',
    },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return <Badge className="bg-yellow-500">Shortlisted</Badge>;
      case 'Selected':
        return <Badge className="bg-green-500">Selected</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredCandidates = shortlistedCandidates.filter(
    candidate =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.employer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Link href="/external-employees/apprentices">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Apprentice Dashboard
          </Link>
        </Button>
      </div>

      <PageHeader
        heading="Candidate Selections"
        description="Manage shortlisted candidates and interview scheduling"
      >
        <Button
          onClick={() =>
            toast({ title: 'Coming Soon', description: 'Interview scheduling feature coming soon' })
          }
        >
          <Calendar className="mr-2 h-4 w-4" /> Schedule Interviews
        </Button>
      </PageHeader>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search candidates..."
                className="pl-8 w-[300px]"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    toast({
                      title: 'Bulk Email',
                      description: 'Sending emails to selected candidates',
                    })
                  }
                >
                  Send Bulk Email
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toast({
                      title: 'Assessment',
                      description: 'Schedule assessments for candidates',
                    })
                  }
                >
                  Schedule Assessments
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toast({ title: 'Export', description: 'Exporting candidate data' })
                  }
                >
                  Export Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shortlisted Candidates</CardTitle>
            <CardDescription>
              Candidates who have passed initial screening and ready for interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Interview Date</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map(candidate => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground">{candidate.contact}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{candidate.qualification}</div>
                        <div className="text-sm text-muted-foreground">{candidate.employer}</div>
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(candidate.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{candidate.interviewDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {candidate.resume && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Resume
                          </Badge>
                        )}
                        {candidate.assessment && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Assessment
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/apprentices/${candidate.id}`)}
                          title="View profile"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            toast({
                              title: 'Selected',
                              description: `${candidate.name} selected for next stage`,
                            })
                          }
                          title="Select candidate"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            toast({
                              title: 'Rejected',
                              description: `${candidate.name} removed from selection`,
                            })
                          }
                          title="Reject candidate"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            toast({
                              title: 'Add Note',
                              description: 'Add notes for this candidate',
                            })
                          }
                          title="Add note"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(`/apprentices/recruitment/onboarding/${candidate.id}`)
                          }
                          title="Move to onboarding"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredCandidates.length} of {shortlistedCandidates.length} candidates
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/apprentices/recruitment/onboarding')}
            >
              View Onboarding Process
            </Button>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Selection Criteria</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Technical aptitude assessment
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Communication skills
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Previous experience
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Educational background
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Interest in trade
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Interview Schedule</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <div>
                    <p className="font-medium">22 May, 2025</p>
                    <p className="text-muted-foreground">3 interviews</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <div>
                    <p className="font-medium">23 May, 2025</p>
                    <p className="text-muted-foreground">2 interviews</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">24 May, 2025</p>
                    <p className="text-muted-foreground">1 interview</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="space-y-4">
                <Button className="w-full" asChild>
                  <Link href="/apprentices/recruitment/onboarding">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Start Onboarding
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    toast({
                      title: 'Bulk Actions',
                      description: 'Bulk actions for selected candidates',
                    })
                  }
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Process Selected
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toast({ title: 'Export', description: 'Export candidate data' })}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
