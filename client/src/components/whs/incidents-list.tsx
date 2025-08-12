import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  FileWarning,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Pencil,
  Trash,
} from 'lucide-react';
import NewIncidentForm from './new-incident-form';
import IncidentDetailsView from './incident-details-view';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export default function IncidentsList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [showNewIncidentForm, setShowNewIncidentForm] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/whs/incidents', { page, limit, search, type, severity, status }],
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const resetFilters = () => {
    setSearch('');
    setType(null);
    setSeverity(null);
    setStatus(null);
    refetch();
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reported':
        return <Badge variant="outline">Reported</Badge>;
      case 'investigating':
        return <Badge variant="secondary">Investigating</Badge>;
      case 'action-required':
        return <Badge variant="warning">Action Required</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'closed':
        return <Badge>Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'hazard':
        return <FileWarning className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Incidents & Hazards</CardTitle>
              <CardDescription>
                Manage and track all reported safety incidents and hazards
              </CardDescription>
            </div>
            <Dialog open={showNewIncidentForm} onOpenChange={setShowNewIncidentForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Report New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Report New Incident or Hazard</DialogTitle>
                  <DialogDescription>
                    Fill out the details of the incident or hazard that occurred.
                  </DialogDescription>
                </DialogHeader>
                <NewIncidentForm
                  onSuccess={() => {
                    setShowNewIncidentForm(false);
                    refetch();
                  }}
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
                  placeholder="Search incidents..."
                  className="pl-8"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <Select value={type || ''} onValueChange={value => setType(value || null)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="incident">Incident</SelectItem>
                  <SelectItem value="hazard">Hazard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severity || ''} onValueChange={value => setSeverity(value || null)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Severities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status || ''} onValueChange={value => setStatus(value || null)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="action-required">Action Required</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
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
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date Reported</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.incidents?.map((incident: any) => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {getTypeIcon(incident.type)}
                            <span className="ml-1 capitalize">{incident.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{incident.title}</TableCell>
                        <TableCell>{incident.location}</TableCell>
                        <TableCell>
                          {new Date(incident.date_reported).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                        <TableCell>{getStatusBadge(incident.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedIncidentId(incident.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Incident Details</DialogTitle>
                                </DialogHeader>
                                {selectedIncidentId && (
                                  <IncidentDetailsView incidentId={selectedIncidentId} />
                                )}
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
                    {(!data?.incidents || data.incidents.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No incidents found.
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
                  incidents
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
