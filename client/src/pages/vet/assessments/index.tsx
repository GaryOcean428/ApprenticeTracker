import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  FileCheck,
  UserCheck,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Assessment Record interface
interface AssessmentRecord {
  id: number;
  apprenticeId: number;
  apprenticeName: string;
  unitId: number;
  unitCode: string;
  unitTitle: string;
  assessorId: number;
  assessorName: string;
  assessmentDate: string;
  status: 'pending' | 'in_progress' | 'competent' | 'not_yet_competent';
  assessmentType: string;
  assessmentMethod: string[];
  evidence: string[];
  comments: string;
  createdAt: string;
  updatedAt: string;
}

// Mock apprentices
const apprentices = [
  { id: 1, name: 'John Smith', trade: 'Electrical' },
  { id: 2, name: 'Sarah Johnson', trade: 'Plumbing' },
  { id: 3, name: 'Michael Brown', trade: 'Carpentry' },
  { id: 4, name: 'Emily Davis', trade: 'Automotive' },
  { id: 5, name: 'David Wilson', trade: 'Electrical' },
  { id: 6, name: 'Jessica Miller', trade: 'Business' },
  { id: 7, name: 'Robert Jones', trade: 'IT' },
];

// Mock units
const units = [
  {
    id: 1,
    code: 'UEENEEE101A',
    title: 'Apply Occupational Health and Safety regulations, codes and practices in the workplace',
  },
  {
    id: 2,
    code: 'UEENEEG101A',
    title: 'Solve problems in electromagnetic devices and related circuits',
  },
  { id: 3, code: 'BSBCMM401', title: 'Make a presentation' },
  { id: 4, code: 'CPCCCM1014A', title: 'Conduct workplace communication' },
  { id: 5, code: 'ICTICT203', title: 'Operate application software packages' },
  {
    id: 6,
    code: 'UEENEEE102A',
    title: 'Fabricate, assemble and dismantle utilities industry components',
  },
  { id: 7, code: 'AURAFA003', title: 'Communicate effectively in an automotive workplace' },
];

// Mock assessors
const assessors = [
  { id: 1, name: 'Dr. Mark Johnson', role: 'Senior Assessor' },
  { id: 2, name: 'Amanda Smith', role: 'Lead Trainer' },
  { id: 3, name: 'Peter Williams', role: 'Industry Expert' },
  { id: 4, name: 'Lisa Thompson', role: 'Trainer/Assessor' },
];

export default function AssessmentRecords() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');

  // Fetch assessment records
  const {
    data: assessments,
    isLoading,
    error,
    refetch,
  } = useQuery<AssessmentRecord[]>({
    queryKey: ['/api/vet/assessments'],
    queryFn: async () => {
      // This would normally fetch from an API endpoint
      // For now, return mock data
      return [
        {
          id: 1,
          apprenticeId: 1,
          apprenticeName: 'John Smith',
          unitId: 1,
          unitCode: 'UEENEEE101A',
          unitTitle:
            'Apply Occupational Health and Safety regulations, codes and practices in the workplace',
          assessorId: 1,
          assessorName: 'Dr. Mark Johnson',
          assessmentDate: '2024-05-15T09:00:00.000Z',
          status: 'pending',
          assessmentType: 'Practical Demonstration',
          assessmentMethod: ['Observation', 'Questioning'],
          evidence: ['Workplace Task', 'Knowledge Test'],
          comments: 'Initial assessment scheduled',
          createdAt: '2024-04-01T00:00:00.000Z',
          updatedAt: '2024-04-01T00:00:00.000Z',
        },
        {
          id: 2,
          apprenticeId: 2,
          apprenticeName: 'Sarah Johnson',
          unitId: 3,
          unitCode: 'BSBCMM401',
          unitTitle: 'Make a presentation',
          assessorId: 2,
          assessorName: 'Amanda Smith',
          assessmentDate: '2024-04-28T13:30:00.000Z',
          status: 'in_progress',
          assessmentType: 'Project',
          assessmentMethod: ['Presentation', 'Question and Answer'],
          evidence: ['Presentation Materials', 'Assessor Observation'],
          comments:
            'First assessment attempt in progress - presentation materials submitted and under review',
          createdAt: '2024-03-15T00:00:00.000Z',
          updatedAt: '2024-04-20T00:00:00.000Z',
        },
        {
          id: 3,
          apprenticeId: 3,
          apprenticeName: 'Michael Brown',
          unitId: 4,
          unitCode: 'CPCCCM1014A',
          unitTitle: 'Conduct workplace communication',
          assessorId: 4,
          assessorName: 'Lisa Thompson',
          assessmentDate: '2024-04-10T10:00:00.000Z',
          status: 'competent',
          assessmentType: 'Role Play',
          assessmentMethod: ['Observation', 'Questioning', 'Third Party Report'],
          evidence: ['Observation Checklist', 'Workplace Documents', 'Supervisor Report'],
          comments:
            'Demonstrated competence in all performance criteria. Strong communication skills shown.',
          createdAt: '2024-03-01T00:00:00.000Z',
          updatedAt: '2024-04-10T16:00:00.000Z',
        },
        {
          id: 4,
          apprenticeId: 4,
          apprenticeName: 'Emily Davis',
          unitId: 7,
          unitCode: 'AURAFA003',
          unitTitle: 'Communicate effectively in an automotive workplace',
          assessorId: 3,
          assessorName: 'Peter Williams',
          assessmentDate: '2024-04-05T14:00:00.000Z',
          status: 'not_yet_competent',
          assessmentType: 'Workplace Assessment',
          assessmentMethod: ['Observation', 'Portfolio', 'Questioning'],
          evidence: ['Workplace Tasks', 'Communication Logs', 'Supervisor Feedback'],
          comments:
            'Needs more practice in technical communication. Gap identified in explaining complex procedures to customers. Reassessment scheduled.',
          createdAt: '2024-02-20T00:00:00.000Z',
          updatedAt: '2024-04-05T17:00:00.000Z',
        },
        {
          id: 5,
          apprenticeId: 5,
          apprenticeName: 'David Wilson',
          unitId: 2,
          unitCode: 'UEENEEG101A',
          unitTitle: 'Solve problems in electromagnetic devices and related circuits',
          assessorId: 1,
          assessorName: 'Dr. Mark Johnson',
          assessmentDate: '2024-05-20T09:30:00.000Z',
          status: 'pending',
          assessmentType: 'Knowledge Test',
          assessmentMethod: ['Written Test', 'Problem Solving'],
          evidence: ['Test Results', 'Worked Examples'],
          comments: 'Assessment scheduled after completion of related training modules',
          createdAt: '2024-04-05T00:00:00.000Z',
          updatedAt: '2024-04-05T00:00:00.000Z',
        },
        {
          id: 6,
          apprenticeId: 6,
          apprenticeName: 'Jessica Miller',
          unitId: 5,
          unitCode: 'ICTICT203',
          unitTitle: 'Operate application software packages',
          assessorId: 2,
          assessorName: 'Amanda Smith',
          assessmentDate: '2024-04-15T11:00:00.000Z',
          status: 'competent',
          assessmentType: 'Project',
          assessmentMethod: ['Product Review', 'Questioning'],
          evidence: ['Project Files', 'Knowledge Test', 'Software Output'],
          comments:
            'Exceeded expectations in all criteria. Excellent understanding of software applications.',
          createdAt: '2024-03-10T00:00:00.000Z',
          updatedAt: '2024-04-15T15:00:00.000Z',
        },
        {
          id: 7,
          apprenticeId: 1,
          apprenticeName: 'John Smith',
          unitId: 6,
          unitCode: 'UEENEEE102A',
          unitTitle: 'Fabricate, assemble and dismantle utilities industry components',
          assessorId: 3,
          assessorName: 'Peter Williams',
          assessmentDate: '2024-06-10T13:00:00.000Z',
          status: 'pending',
          assessmentType: 'Practical Demonstration',
          assessmentMethod: ['Observation', 'Questioning'],
          evidence: ['Completed Task', 'Observation Checklist', 'Self-Assessment'],
          comments: 'Assessment scheduled after completion of workplace training',
          createdAt: '2024-04-10T00:00:00.000Z',
          updatedAt: '2024-04-10T00:00:00.000Z',
        },
      ];
    },
  });

  // Get status badge styling
  const getStatusBadge = status => {
    switch (status) {
      case 'competent':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" /> Competent
          </Badge>
        );
      case 'not_yet_competent':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" /> Not Yet Competent
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" /> In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Format date for display
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Format time for display
  const formatTime = dateString => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  };

  // Filter assessments based on search and filters
  const filteredAssessments = assessments?.filter(assessment => {
    // Apply search filter
    const matchesSearch =
      searchQuery === '' ||
      assessment.apprenticeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.unitCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.unitTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.assessorName.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply status filter
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;

    // Apply trade filter (would be based on apprentice.trade in a real app)
    const apprentice = apprentices.find(a => a.id === assessment.apprenticeId);
    const matchesTrade = tradeFilter === 'all' || (apprentice && apprentice.trade === tradeFilter);

    // Apply tab filter for date
    const assessmentDate = new Date(assessment.assessmentDate);
    const today = new Date();
    const isUpcoming = assessmentDate > today;
    const isPast = assessmentDate <= today;

    const matchesTab =
      (activeTab === 'upcoming' && isUpcoming) ||
      (activeTab === 'past' && isPast) ||
      activeTab === 'all';

    return matchesSearch && matchesStatus && matchesTrade && matchesTab;
  });

  // Get unique trades for filter
  const uniqueTrades = [...new Set(apprentices.map(a => a.trade))];

  // Calculate assessment statistics
  const calculateStatistics = () => {
    if (!assessments)
      return { pending: 0, inProgress: 0, competent: 0, notYetCompetent: 0, total: 0 };

    const total = assessments.length;
    const pending = assessments.filter(a => a.status === 'pending').length;
    const inProgress = assessments.filter(a => a.status === 'in_progress').length;
    const competent = assessments.filter(a => a.status === 'competent').length;
    const notYetCompetent = assessments.filter(a => a.status === 'not_yet_competent').length;

    return { pending, inProgress, competent, notYetCompetent, total };
  };

  const stats = calculateStatistics();

  // Get assessments for today
  const today = new Date().toDateString();
  const assessmentsToday =
    assessments?.filter(a => new Date(a.assessmentDate).toDateString() === today).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assessment Records</h2>
          <p className="text-muted-foreground">
            Manage and track assessments for units of competency
          </p>
        </div>
        <Button
          onClick={() =>
            toast({
              title: 'Create Assessment',
              description: 'Assessment creation form coming soon',
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Schedule Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Assessments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessmentsToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled for{' '}
              {new Date().toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Assessments awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Competent</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.competent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((stats.competent / (stats.competent + stats.notYetCompetent || 1)) * 100)}
              % success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Not Yet Competent</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notYetCompetent}</div>
            <p className="text-xs text-muted-foreground mt-1">Requiring reassessment or support</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-5 pt-5 pb-0">
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="upcoming" className="text-sm">
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="past" className="text-sm">
                  Past
                </TabsTrigger>
                <TabsTrigger value="all" className="text-sm">
                  All Records
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 mr-1"
                  >
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                  </svg>
                  Refresh
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Filter
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Filter Assessments</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <Label htmlFor="status-filter">Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger id="status-filter" className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="competent">Competent</SelectItem>
                          <SelectItem value="not_yet_competent">Not Yet Competent</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <Label htmlFor="trade-filter">Trade</Label>
                      <Select value={tradeFilter} onValueChange={setTradeFilter}>
                        <SelectTrigger id="trade-filter" className="mt-1">
                          <SelectValue placeholder="Select trade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Trades</SelectItem>
                          {uniqueTrades.map(trade => (
                            <SelectItem key={trade} value={trade}>
                              {trade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-4 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search assessments..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <TabsContent value="upcoming" className="pt-4 pb-0 px-0">
              <AssessmentTable
                assessments={filteredAssessments}
                isLoading={isLoading}
                error={error}
                getStatusBadge={getStatusBadge}
                formatDate={formatDate}
                formatTime={formatTime}
                toast={toast}
                navigate={navigate}
              />
            </TabsContent>

            <TabsContent value="past" className="pt-4 pb-0 px-0">
              <AssessmentTable
                assessments={filteredAssessments}
                isLoading={isLoading}
                error={error}
                getStatusBadge={getStatusBadge}
                formatDate={formatDate}
                formatTime={formatTime}
                toast={toast}
                navigate={navigate}
              />
            </TabsContent>

            <TabsContent value="all" className="pt-4 pb-0 px-0">
              <AssessmentTable
                assessments={filteredAssessments}
                isLoading={isLoading}
                error={error}
                getStatusBadge={getStatusBadge}
                formatDate={formatDate}
                formatTime={formatTime}
                toast={toast}
                navigate={navigate}
              />
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}

// Separate component for the assessment table
function AssessmentTable({
  assessments,
  isLoading,
  error,
  getStatusBadge,
  formatDate,
  formatTime,
  toast,
  navigate,
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Apprentice</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Assessor</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-16 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex flex-col items-center">
                  <p className="text-destructive mb-2">Error loading assessments</p>
                  <Button variant="outline">Retry</Button>
                </div>
              </TableCell>
            </TableRow>
          ) : assessments?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No assessment records found matching your criteria.
              </TableCell>
            </TableRow>
          ) : (
            assessments?.map(assessment => (
              <TableRow key={assessment.id}>
                <TableCell>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{assessment.apprenticeName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{assessment.unitCode}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                      {assessment.unitTitle}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{assessment.assessorName}</TableCell>
                <TableCell>
                  <div>
                    <p>{formatDate(assessment.assessmentDate)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(assessment.assessmentDate)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                <TableCell>{assessment.assessmentType}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          toast({
                            title: 'View Assessment',
                            description: `Viewing details for assessment #${assessment.id}`,
                          })
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      {assessment.status === 'pending' && (
                        <DropdownMenuItem
                          onClick={() =>
                            toast({
                              title: 'Record Assessment',
                              description: 'Assessment recording form coming soon',
                            })
                          }
                        >
                          <FileCheck className="mr-2 h-4 w-4" /> Record Assessment
                        </DropdownMenuItem>
                      )}
                      {assessment.status === 'in_progress' && (
                        <DropdownMenuItem
                          onClick={() =>
                            toast({
                              title: 'Complete Assessment',
                              description: 'Assessment completion form coming soon',
                            })
                          }
                        >
                          <UserCheck className="mr-2 h-4 w-4" /> Complete Assessment
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          toast({
                            title: 'Edit Assessment',
                            description: 'Edit functionality coming soon',
                          })
                        }
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() =>
                          toast({
                            title: 'Delete Assessment',
                            description: 'Delete functionality coming soon',
                            variant: 'destructive',
                          })
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Record
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
