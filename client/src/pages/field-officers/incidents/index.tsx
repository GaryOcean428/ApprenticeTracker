import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isThisWeek, isThisMonth, differenceInDays } from 'date-fns';
import {
  AlertCircle,
  PlusCircle,
  Search,
  Calendar,
  Building2,
  Tag,
  SlidersHorizontal,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Define interface for incidents
interface Incident {
  id: number;
  date: string;
  apprenticeId: number;
  apprenticeName: string;
  hostId: number;
  hostName: string;
  type: string;
  severity: string;
  status: string;
  description: string;
  immediateActions: string;
  escalatedTo?: string;
  insuranceClaim?: string;
  createdBy: string;
}

// Status badge variants
const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'destructive';
    case 'in progress':
      return 'warning';
    case 'resolved':
      return 'success';
    case 'closed':
      return 'outline';
    default:
      return 'secondary';
  }
};

// Severity badge variants
const getSeverityVariant = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'warning';
    case 'low':
      return 'outline';
    default:
      return 'secondary';
  }
};

export default function IncidentTracking() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filter, setFilter] = useState<{
    hostId: string;
    type: string;
    status: string;
    dateRange: string;
  }>({
    hostId: 'all-hosts',
    type: 'all-types',
    status: 'all-statuses',
    dateRange: 'all-time',
  });

  const {
    data: incidents,
    isLoading,
    error,
  } = useQuery<Incident[]>({
    queryKey: ['/api/field-officers/incidents'],
  });

  const { toast } = useToast();

  if (error) {
    toast({
      variant: 'destructive',
      title: 'Error loading incidents',
      description: 'There was a problem loading the incident data.',
    });
  }

  const filteredIncidents = incidents?.filter(incident => {
    const matchesSearch =
      incident.apprenticeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHost =
      filter.hostId === 'all-hosts' || incident.hostId.toString() === filter.hostId;
    const matchesType = filter.type === 'all-types' || incident.type === filter.type;
    const matchesStatus = filter.status === 'all-statuses' || incident.status === filter.status;

    // Date filter logic
    const matchesDateRange =
      filter.dateRange === 'all-time'
        ? true
        : filter.dateRange === 'today'
          ? isToday(new Date(incident.date))
          : filter.dateRange === 'this-week'
            ? isThisWeek(new Date(incident.date))
            : filter.dateRange === 'this-month'
              ? isThisMonth(new Date(incident.date))
              : filter.dateRange === 'last-90-days'
                ? differenceInDays(new Date(), new Date(incident.date)) <= 90
                : true;

    return matchesSearch && matchesHost && matchesType && matchesStatus && matchesDateRange;
  });

  // Extract unique values for filters
  const uniqueHosts = [
    ...new Set(
      (incidents || []).map(incident => ({ id: incident.hostId, name: incident.hostName }))
    ),
  ];
  const uniqueTypes = [...new Set((incidents || []).map(incident => incident.type))];
  const uniqueStatuses = [...new Set((incidents || []).map(incident => incident.status))];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incident Tracking</h1>
          <p className="text-muted-foreground">
            Track and manage incidents, issues, and events requiring intervention
          </p>
        </div>
        <Button onClick={() => navigate('/field-officers/incidents/create')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Incident
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search incidents..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filter.hostId}
            onValueChange={value => setFilter({ ...filter, hostId: value })}
          >
            <SelectTrigger className="w-[180px]">
              <span className="flex items-center">
                <Building2 className="mr-2 h-4 w-4" />
                <span>Host Employer</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-hosts">All Hosts</SelectItem>
              {uniqueHosts.map(host => (
                <SelectItem key={host.id} value={host.id.toString()}>
                  {host.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.type}
            onValueChange={value => setFilter({ ...filter, type: value })}
          >
            <SelectTrigger className="w-[150px]">
              <span className="flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                <span>Type</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              {uniqueTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.status}
            onValueChange={value => setFilter({ ...filter, status: value })}
          >
            <SelectTrigger className="w-[150px]">
              <span className="flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>Status</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.dateRange}
            onValueChange={value => setFilter({ ...filter, dateRange: value })}
          >
            <SelectTrigger className="w-[150px]">
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Date Range</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range...</SelectItem>
            </SelectContent>
          </Select>

          {(filter.hostId || filter.type || filter.status || filter.dateRange) && (
            <Button
              variant="outline"
              onClick={() =>
                setFilter({
                  hostId: 'all-hosts',
                  type: 'all-types',
                  status: 'all-statuses',
                  dateRange: 'all-time',
                })
              }
              className="flex gap-1 items-center"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-md">Incidents</CardTitle>
          <CardDescription>
            Total: {filteredIncidents?.length || 0} incident{filteredIncidents?.length !== 1 && 's'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Apprentice</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-5 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-9 w-20" />
                        </TableCell>
                      </TableRow>
                    ))}

                {!isLoading && filteredIncidents?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No incidents found.{' '}
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => navigate('/field-officers/incidents/create')}
                      >
                        Create one
                      </Button>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  filteredIncidents?.map(incident => (
                    <TableRow key={incident.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(incident.date), 'yyyy-MM-dd')}
                      </TableCell>
                      <TableCell>{incident.apprenticeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{incident.type}</Badge>
                      </TableCell>
                      <TableCell>{incident.hostName}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(incident.severity)}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(incident.status)}>{incident.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedIncident(incident)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <span className="sr-only">Open menu</span>
                                <SlidersHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setSelectedIncident(incident)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/field-officers/incidents/${incident.id}/edit`)
                                }
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(
                                    `/field-officers/actions/create?incidentId=${incident.id}`
                                  )
                                }
                              >
                                Create Action Item
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {incident.status !== 'Closed' ? (
                                <DropdownMenuItem>Mark as Closed</DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>Reopen Incident</DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredIncidents?.length || 0} of {incidents?.length || 0} incidents
          </div>
        </CardFooter>
      </Card>

      {/* Incident Detail Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={open => !open && setSelectedIncident(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Incident #{selectedIncident?.id}</span>
              <Badge variant={getStatusVariant(selectedIncident?.status || '')}>
                {selectedIncident?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Reported on {selectedIncident && format(new Date(selectedIncident.date), 'PPP')}
              {' by '} {selectedIncident?.createdBy}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Apprentice</h4>
                <p className="text-sm">{selectedIncident?.apprenticeName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Host Employer</h4>
                <p className="text-sm">{selectedIncident?.hostName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Type</h4>
                <Badge variant="outline">{selectedIncident?.type}</Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Severity</h4>
                <Badge variant={getSeverityVariant(selectedIncident?.severity || '')}>
                  {selectedIncident?.severity}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <div className="p-3 bg-muted rounded-md text-sm">{selectedIncident?.description}</div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Immediate Actions Taken</h4>
              <div className="p-3 bg-muted rounded-md text-sm">
                {selectedIncident?.immediateActions}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Escalated To</h4>
                <p className="text-sm">{selectedIncident?.escalatedTo || 'Not escalated'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Insurance Claim</h4>
                <p className="text-sm">{selectedIncident?.insuranceClaim || 'No claim filed'}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setSelectedIncident(null)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/field-officers/incidents/${selectedIncident?.id}/edit`)}
              >
                Edit Incident
              </Button>
              <Button
                onClick={() =>
                  navigate(`/field-officers/actions/create?incidentId=${selectedIncident?.id}`)
                }
              >
                Create Action Item
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
