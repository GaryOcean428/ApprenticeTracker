import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import type { ComplianceRecord } from '@shared/schema';
import {
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const ComplianceList = () => {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const relatedTo = searchParams.get('relatedTo');
  const relatedId = searchParams.get('relatedId');

  const [filter, setFilter] = useState({
    search: '',
    type: '',
    status: '',
    relatedTo: relatedTo || '',
    relatedId: relatedId || '',
  });

  // Fetch compliance records
  const {
    data: complianceRecords,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      filter.relatedTo && filter.relatedId
        ? `/api/compliance/related/${filter.relatedTo}/${filter.relatedId}`
        : '/api/compliance',
    ],
    queryFn: async () => {
      const url =
        filter.relatedTo && filter.relatedId
          ? `/api/compliance/related/${filter.relatedTo}/${filter.relatedId}`
          : '/api/compliance';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch compliance records');
      return res.json() as Promise<ComplianceRecord[]>;
    },
  });

  // Filter compliance records based on search and filters
  const filteredRecords = complianceRecords?.filter(record => {
    const matchesSearch =
      filter.search === '' ||
      record.notes?.toLowerCase().includes(filter.search.toLowerCase()) ||
      record.type.toLowerCase().includes(filter.search.toLowerCase()) ||
      record.relatedTo.toLowerCase().includes(filter.search.toLowerCase());

    const matchesType = filter.type === 'all_types' || record.type === filter.type;
    const matchesStatus = filter.status === 'all_statuses' || record.status === filter.status;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Get unique compliance record types for the filter dropdown
  const recordTypes = complianceRecords
    ? Array.from(new Set(complianceRecords.map(record => record.type)))
    : [];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-success';
      case 'non-compliant':
        return 'bg-red-100 text-destructive';
      case 'pending':
        return 'bg-yellow-100 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'non-compliant':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  // Format dates for display
  const formatDate = (dateString?: Date | string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Compliance Management</h2>
        <Button asChild>
          <Link
            href={`/compliance/create${filter.relatedTo && filter.relatedId ? `?relatedTo=${filter.relatedTo}&relatedId=${filter.relatedId}` : ''}`}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Compliance Record
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Compliance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search compliance records..."
                className="pl-8"
                value={filter.search}
                onChange={e => setFilter({ ...filter, search: e.target.value })}
              />
            </div>
            <div className="flex gap-4 flex-wrap md:flex-nowrap">
              <div className="w-full md:w-48">
                <Select
                  value={filter.type}
                  onValueChange={value => setFilter({ ...filter, type: value })}
                >
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Record Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_types">All Types</SelectItem>
                    {recordTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={filter.status}
                  onValueChange={value => setFilter({ ...filter, status: value })}
                >
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_statuses">All Statuses</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-destructive">Failed to load compliance records</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Related To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Completion Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No compliance records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords?.map(record => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="font-medium capitalize">{record.type}</div>
                        </TableCell>
                        <TableCell>
                          <div className="capitalize">{record.relatedTo}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {record.relatedId}
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.dueDate ? (
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(record.dueDate)}
                            </div>
                          ) : (
                            'No due date'
                          )}
                        </TableCell>
                        <TableCell>
                          {record.completionDate
                            ? formatDate(record.completionDate)
                            : 'Not completed'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(record.status)}
                            <Badge className={getStatusBadgeClass(record.status)}>
                              {record.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={`/compliance/${record.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={`/compliance/${record.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">More</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/${record.relatedTo}s/${record.relatedId}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Related{' '}
                                    {record.relatedTo.charAt(0).toUpperCase() +
                                      record.relatedTo.slice(1)}
                                  </Link>
                                </DropdownMenuItem>
                                {record.status !== 'compliant' && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/compliance/${record.id}/mark-compliant`}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Mark as Compliant
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ComplianceList;
