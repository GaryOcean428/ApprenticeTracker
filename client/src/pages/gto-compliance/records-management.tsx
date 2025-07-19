import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Plus,
  FileCheck,
  Calendar,
  Search,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
  FileX,
  ArrowUpDown,
  AlarmClock,
  FileArchive,
  Archive,
  Folder,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { queryClient } from '@/lib/queryClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RecordsManagement() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Get GTO compliance standards related to Records Management
  const { data: standards, isLoading: standardsLoading } = useQuery({
    queryKey: ['/api/gto-compliance/standards', 'Records Management'],
    queryFn: async () => {
      const res = await fetch('/api/gto-compliance/standards?category=Records%20Management');
      if (!res.ok) throw new Error('Failed to fetch standards');
      return res.json();
    },
  });

  // Fetch assessment data
  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['/api/gto-compliance/assessments', 'Records Management'],
    queryFn: async () => {
      const res = await fetch('/api/gto-compliance/assessments?category=Records%20Management');
      if (!res.ok) throw new Error('Failed to fetch assessments');
      return res.json();
    },
  });

  // Fetch documents/records data (mock for now)
  const { data: records, isLoading: recordsLoading } = useQuery({
    queryKey: ['/api/documents/records-management'],
    queryFn: async () => {
      // This would be replaced with actual API fetch
      return [
        {
          id: 1,
          title: 'Records Management Policy',
          type: 'policy',
          createdAt: '2024-04-01T00:00:00.000Z',
          updatedAt: '2024-04-01T00:00:00.000Z',
          expiryDate: '2025-04-01T00:00:00.000Z',
          status: 'current',
          owner: 'Compliance Officer',
          location: 'Digital/Policies/Records',
          retentionPeriod: '7 years',
        },
        {
          id: 2,
          title: 'Document Control Procedure',
          type: 'procedure',
          createdAt: '2024-03-15T00:00:00.000Z',
          updatedAt: '2024-03-15T00:00:00.000Z',
          expiryDate: '2025-03-15T00:00:00.000Z',
          status: 'current',
          owner: 'Quality Manager',
          location: 'Digital/Procedures/Records',
          retentionPeriod: '7 years',
        },
        {
          id: 3,
          title: 'Records Storage Guidelines',
          type: 'guideline',
          createdAt: '2024-02-10T00:00:00.000Z',
          updatedAt: '2024-02-10T00:00:00.000Z',
          expiryDate: '2025-02-10T00:00:00.000Z',
          status: 'current',
          owner: 'Compliance Officer',
          location: 'Digital/Guidelines/Records',
          retentionPeriod: '7 years',
        },
        {
          id: 4,
          title: 'Apprentice Records Archiving Process',
          type: 'process',
          createdAt: '2023-11-01T00:00:00.000Z',
          updatedAt: '2024-01-20T00:00:00.000Z',
          expiryDate: '2025-01-20T00:00:00.000Z',
          status: 'current',
          owner: 'Records Manager',
          location: 'Digital/Processes/Archiving',
          retentionPeriod: '10 years',
        },
        {
          id: 5,
          title: 'Annual Records Audit Template',
          type: 'template',
          createdAt: '2023-09-15T00:00:00.000Z',
          updatedAt: '2023-09-15T00:00:00.000Z',
          expiryDate: '2024-09-15T00:00:00.000Z',
          status: 'review_due',
          owner: 'Compliance Officer',
          location: 'Digital/Templates/Audit',
          retentionPeriod: '3 years',
        },
        {
          id: 6,
          title: 'Digital Records Security Protocol',
          type: 'protocol',
          createdAt: '2023-06-20T00:00:00.000Z',
          updatedAt: '2023-06-20T00:00:00.000Z',
          expiryDate: '2024-06-20T00:00:00.000Z',
          status: 'review_due',
          owner: 'IT Security Manager',
          location: 'Digital/Protocols/Security',
          retentionPeriod: '5 years',
        },
        {
          id: 7,
          title: 'Historical Records Access Request Form',
          type: 'form',
          createdAt: '2023-03-10T00:00:00.000Z',
          updatedAt: '2023-03-10T00:00:00.000Z',
          expiryDate: '2024-05-10T00:00:00.000Z',
          status: 'expired',
          owner: 'Administrative Officer',
          location: 'Digital/Forms/Records',
          retentionPeriod: '2 years',
        },
      ];
    },
  });

  // Get status badge styling
  const getStatusBadge = status => {
    switch (status) {
      case 'current':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" /> Current
          </Badge>
        );
      case 'review_due':
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <Clock className="h-3 w-3 mr-1" /> Review Due
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-100 text-red-800">
            <FileX className="h-3 w-3 mr-1" /> Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Calculate retention metrics
  const calculateRetentionMetrics = () => {
    if (!records) return { current: 0, reviewDue: 0, expired: 0, total: 0 };

    const total = records.length;
    const current = records.filter(r => r.status === 'current').length;
    const reviewDue = records.filter(r => r.status === 'review_due').length;
    const expired = records.filter(r => r.status === 'expired').length;

    return { current, reviewDue, expired, total };
  };

  const metrics = calculateRetentionMetrics();

  // Filter records based on search and filters
  const filteredRecords = records?.filter(record => {
    // Apply search filter
    const matchesSearch =
      searchQuery === '' ||
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.owner.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply status filter
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    // Apply type filter
    const matchesType = typeFilter === 'all' || record.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Get unique record types for filter
  const recordTypes = records ? Array.from(new Set(records.map(r => r.type))) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Records Management</h2>
          <p className="text-muted-foreground">
            Manage compliance with records management standards for GTO operations
          </p>
        </div>
        <Button onClick={() => navigate('/gto-compliance/standard-assessment')}>
          <Plus className="mr-2 h-4 w-4" /> New Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Records Status</CardTitle>
            <CardDescription>Current status of controlled documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current</span>
                  <span className="font-medium">
                    {metrics.current}/{metrics.total}
                  </span>
                </div>
                <Progress value={(metrics.current / metrics.total) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Review Due</span>
                  <span className="font-medium">
                    {metrics.reviewDue}/{metrics.total}
                  </span>
                </div>
                <Progress value={(metrics.reviewDue / metrics.total) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Expired</span>
                  <span className="font-medium">
                    {metrics.expired}/{metrics.total}
                  </span>
                </div>
                <Progress value={(metrics.expired / metrics.total) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Records Due for Review</CardTitle>
            <CardDescription>Documents requiring review in next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recordsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                records
                  ?.filter(r => r.status === 'review_due')
                  .map(record => (
                    <div key={record.id} className="flex items-start">
                      <AlarmClock className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">{record.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(record.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
              )}

              {records?.filter(r => r.status === 'review_due').length === 0 && (
                <div className="flex flex-col items-center justify-center text-center h-20">
                  <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-muted-foreground">No documents due for review</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Storage Compliance</CardTitle>
            <CardDescription>Status of storage and retention compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                    <Folder className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="font-medium">Digital Records</p>
                    <p className="text-sm text-muted-foreground">Secure Cloud Storage</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" /> Compliant
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full mr-3">
                    <Archive className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <div>
                    <p className="font-medium">Physical Archives</p>
                    <p className="text-sm text-muted-foreground">Secure Facility</p>
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-800">
                  <Clock className="h-3 w-3 mr-1" /> Review Due
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full mr-3">
                    <FileArchive className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <p className="font-medium">Retention Schedules</p>
                    <p className="text-sm text-muted-foreground">Automated System</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" /> Compliant
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="records">Records Register</TabsTrigger>
          <TabsTrigger value="standards">Compliance Standards</TabsTrigger>
          <TabsTrigger value="assessments">Assessment History</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="p-0 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Records Register</CardTitle>
              <CardDescription>
                Manage controlled documents and records required for GTO compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by title, type, or owner..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex space-x-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                      <SelectItem value="review_due">Review Due</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Type filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {recordTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {recordsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No records found matching your filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRecords?.map(record => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.title}</TableCell>
                            <TableCell className="capitalize">{record.type}</TableCell>
                            <TableCell>{new Date(record.updatedAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {new Date(record.expiryDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                            <TableCell>{record.owner}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => navigate(`/gto-compliance/documents/${record.id}`)}
                              >
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredRecords?.length || 0} records found
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Record</DialogTitle>
                    <DialogDescription>
                      Add a new controlled document to the records management system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Document Title</Label>
                      <Input id="title" placeholder="Enter document title" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="type">Document Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="policy">Policy</SelectItem>
                            <SelectItem value="procedure">Procedure</SelectItem>
                            <SelectItem value="guideline">Guideline</SelectItem>
                            <SelectItem value="form">Form</SelectItem>
                            <SelectItem value="template">Template</SelectItem>
                            <SelectItem value="process">Process</SelectItem>
                            <SelectItem value="protocol">Protocol</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="retention">Retention Period</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Year</SelectItem>
                            <SelectItem value="2">2 Years</SelectItem>
                            <SelectItem value="3">3 Years</SelectItem>
                            <SelectItem value="5">5 Years</SelectItem>
                            <SelectItem value="7">7 Years</SelectItem>
                            <SelectItem value="10">10 Years</SelectItem>
                            <SelectItem value="permanent">Permanent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="owner">Document Owner</Label>
                      <Input id="owner" placeholder="Enter document owner" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="upload">Upload Document</Label>
                      <Input id="upload" type="file" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() =>
                        toast({
                          title: 'Coming soon',
                          description: 'Document upload feature coming soon',
                        })
                      }
                    >
                      Upload
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="standards" className="p-0 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Records Management Standards</CardTitle>
              <CardDescription>Compliance standards for records management in GTOs</CardDescription>
            </CardHeader>
            <CardContent>
              {standardsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : standards?.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-40">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No records management standards found</p>
                  <p className="text-muted-foreground">
                    Standards will be displayed here once added to the system
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Standard</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standards?.map(standard => (
                        <TableRow key={standard.id}>
                          <TableCell className="font-medium">
                            <div>
                              <p>{standard.standardName}</p>
                              <p className="text-sm text-muted-foreground">
                                {standard.standardNumber}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <p className="line-clamp-2">{standard.standardDescription}</p>
                          </TableCell>
                          <TableCell>
                            {assessments?.find(a => a.standardId === standard.id) ? (
                              <Badge
                                className={
                                  assessments.find(a => a.standardId === standard.id).status ===
                                  'compliant'
                                    ? 'bg-green-100 text-green-800'
                                    : assessments.find(a => a.standardId === standard.id).status ===
                                        'at_risk'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-800'
                                }
                              >
                                {assessments
                                  .find(a => a.standardId === standard.id)
                                  .status.replace('_', ' ')}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not assessed</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/gto-compliance/standard-assessment?standardId=${standard.id}`
                                )
                              }
                            >
                              <FileCheck className="h-4 w-4 mr-1" /> Assess
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="p-0 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>
                Historical assessments of records management compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assessmentsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : assessments?.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-40">
                  <FileCheck className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No assessments found</p>
                  <p className="text-muted-foreground">
                    Compliance assessments will be displayed here once completed
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Standard</TableHead>
                        <TableHead>Assessment Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assessor</TableHead>
                        <TableHead>Next Due</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessments?.map(assessment => (
                        <TableRow key={assessment.id}>
                          <TableCell className="font-medium">
                            {standards?.find(s => s.id === assessment.standardId)?.standardName ||
                              'Unknown Standard'}
                          </TableCell>
                          <TableCell>
                            {new Date(assessment.assessmentDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                assessment.status === 'compliant'
                                  ? 'bg-green-100 text-green-800'
                                  : assessment.status === 'at_risk'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                              }
                            >
                              {assessment.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{assessment.assessedBy || 'System'}</TableCell>
                          <TableCell>
                            {assessment.dueDate
                              ? new Date(assessment.dueDate).toLocaleDateString()
                              : 'Not scheduled'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/gto-compliance/assessment/${assessment.id}`)
                              }
                            >
                              <FileText className="h-4 w-4 mr-1" /> View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
