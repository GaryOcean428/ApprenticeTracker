import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Pencil,
  Trash,
  Calendar,
} from 'lucide-react';
import NewRiskAssessmentForm from './new-risk-assessment-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function RiskAssessmentsList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [hostEmployerId, setHostEmployerId] = useState<string | null>(null);
  const [newAssessmentDialogOpen, setNewAssessmentDialogOpen] = useState(false);

  interface RiskAssessment {
    id: string;
    title: string;
    location: string;
    assessment_date: string;
    review_date?: string;
    status: string;
    description: string;
    created_at: string;
    updated_at: string;
  }

  interface RiskAssessmentResponse {
    assessments: RiskAssessment[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }

  const { data, isLoading, refetch } = useQuery<RiskAssessmentResponse>({
    queryKey: ['/api/whs/risk-assessments', { page, limit, search, status, hostEmployerId }],
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const resetFilters = () => {
    setSearch('');
    setStatus(null);
    setHostEmployerId(null);
    refetch();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'in-progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'review-required':
        return <Badge variant="warning">Review Required</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Risk Assessments</CardTitle>
              <CardDescription>Workplace risk assessments and evaluations</CardDescription>
            </div>
            <Dialog open={newAssessmentDialogOpen} onOpenChange={setNewAssessmentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Assessment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create New Risk Assessment</DialogTitle>
                  <DialogDescription>
                    Document a workplace hazard assessment to identify and control risks
                  </DialogDescription>
                </DialogHeader>
                <NewRiskAssessmentForm
                  onSuccess={() => {
                    setNewAssessmentDialogOpen(false);
                    refetch();
                  }}
                  onCancel={() => setNewAssessmentDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assessments..."
                  className="pl-8"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <Select value={status || ''} onValueChange={value => setStatus(value || null)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="review-required">Review Required</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={resetFilters} className="flex gap-1">
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Assessment Date</TableHead>
                      <TableHead>Review Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.assessments?.map((assessment: any) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                            {assessment.title}
                          </div>
                        </TableCell>
                        <TableCell>{assessment.location}</TableCell>
                        <TableCell>
                          {new Date(assessment.assessment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {assessment.review_date ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {new Date(assessment.review_date).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not set</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Risk Assessment Details</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                  <p className="text-center text-muted-foreground">
                                    Risk assessment details view to be implemented.
                                  </p>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!data?.assessments || data.assessments.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No risk assessments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing{' '}
                  {data?.pagination?.total
                    ? `${(page - 1) * limit + 1}-${Math.min(page * limit, data.pagination.total)} of ${data.pagination.total}`
                    : '0'}{' '}
                  assessments
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!data?.pagination?.totalPages || page >= data.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
