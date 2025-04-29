import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Timesheet, Apprentice } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  MoreHorizontal, 
  Plus, 
  Search,
  Filter,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from "lucide-react";

const TimesheetsList = () => {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const apprenticeId = searchParams.get('apprenticeId');
  
  const [filter, setFilter] = useState({
    search: "",
    status: "",
    apprenticeId: apprenticeId || ""
  });
  
  // Fetch all timesheets
  const { data: timesheets, isLoading: isLoadingTimesheets, error: timesheetsError } = useQuery({
    queryKey: [filter.apprenticeId 
      ? `/api/apprentices/${filter.apprenticeId}/timesheets` 
      : '/api/timesheets'],
    queryFn: async () => {
      const url = filter.apprenticeId 
        ? `/api/apprentices/${filter.apprenticeId}/timesheets` 
        : '/api/timesheets';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch timesheets');
      return res.json() as Promise<Timesheet[]>;
    }
  });
  
  // Fetch all apprentices
  const { data: apprentices, isLoading: isLoadingApprentices } = useQuery({
    queryKey: ['/api/apprentices'],
    queryFn: async () => {
      const res = await fetch('/api/apprentices');
      if (!res.ok) throw new Error('Failed to fetch apprentices');
      return res.json() as Promise<Apprentice[]>;
    },
    enabled: !filter.apprenticeId // Only fetch all apprentices if not filtering by apprentice
  });
  
  // Helper function to get apprentice name by ID
  const getApprenticeName = (apprenticeId: number) => {
    const apprentice = apprentices?.find(a => a.id === apprenticeId);
    return apprentice ? `${apprentice.firstName} ${apprentice.lastName}` : `Apprentice #${apprenticeId}`;
  };
  
  // Filter timesheets based on search and filters
  const filteredTimesheets = timesheets?.filter(timesheet => {
    const weekStartingStr = new Date(timesheet.weekStarting).toLocaleDateString();
    const matchesSearch = 
      filter.search === "" || 
      weekStartingStr.includes(filter.search);
    
    const matchesStatus = filter.status === "" || timesheet.status === filter.status;
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case "approved":
        return "bg-green-100 text-success";
      case "rejected":
        return "bg-red-100 text-destructive";
      case "pending":
        return "bg-yellow-100 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };
  
  // Format dates for display
  const formatDate = (dateString: Date | string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const isLoading = isLoadingTimesheets || (isLoadingApprentices && !filter.apprenticeId);
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          {filter.apprenticeId 
            ? `Timesheets for ${getApprenticeName(parseInt(filter.apprenticeId))}` 
            : "Timesheet Management"}
        </h2>
        <Button asChild>
          <Link href={`/timesheets/create${filter.apprenticeId ? `?apprenticeId=${filter.apprenticeId}` : ''}`}>
            <Plus className="mr-2 h-4 w-4" />
            New Timesheet
          </Link>
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Timesheets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by date..."
                className="pl-8"
                value={filter.search}
                onChange={(e) => setFilter({...filter, search: e.target.value})}
              />
            </div>
            <div className="flex gap-4 flex-wrap md:flex-nowrap">
              <div className="w-full md:w-48">
                <Select
                  value={filter.status}
                  onValueChange={(value) => setFilter({...filter, status: value})}
                >
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {!filter.apprenticeId && (
                <div className="w-full md:w-48">
                  <Select
                    value={filter.apprenticeId}
                    onValueChange={(value) => setFilter({...filter, apprenticeId: value})}
                  >
                    <SelectTrigger>
                      <User className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Apprentice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Apprentices</SelectItem>
                      {apprentices?.map((apprentice) => (
                        <SelectItem key={apprentice.id} value={apprentice.id.toString()}>
                          {apprentice.firstName} {apprentice.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : timesheetsError ? (
            <div className="py-8 text-center">
              <p className="text-destructive">Failed to load timesheets</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week Starting</TableHead>
                    {!filter.apprenticeId && <TableHead>Apprentice</TableHead>}
                    <TableHead>Hours</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTimesheets?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={filter.apprenticeId ? 5 : 6} className="h-24 text-center">
                        No timesheets found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTimesheets?.map((timesheet) => (
                      <TableRow key={timesheet.id}>
                        <TableCell>
                          <div className="font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formatDate(timesheet.weekStarting)}
                          </div>
                        </TableCell>
                        {!filter.apprenticeId && (
                          <TableCell>
                            {isLoadingApprentices ? (
                              <Skeleton className="h-5 w-24" />
                            ) : (
                              <Link href={`/apprentices/${timesheet.apprenticeId}`} className="text-primary hover:underline">
                                {getApprenticeName(timesheet.apprenticeId)}
                              </Link>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="font-medium">{timesheet.totalHours} hours</div>
                        </TableCell>
                        <TableCell>{formatDate(timesheet.submittedDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(timesheet.status)}
                            <Badge className={getStatusBadgeClass(timesheet.status)}>
                              {timesheet.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={`/timesheets/${timesheet.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                            {timesheet.status === "pending" && (
                              <Button size="icon" variant="ghost" asChild>
                                <Link href={`/timesheets/${timesheet.id}/edit`}>
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Link>
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">More</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/timesheets/${timesheet.id}`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                {timesheet.status === "pending" && (
                                  <>
                                    <DropdownMenuItem asChild>
                                      <Link href={`/timesheets/${timesheet.id}/approve`}>
                                        <CheckCircle className="mr-2 h-4 w-4 text-success" />
                                        Approve Timesheet
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href={`/timesheets/${timesheet.id}/reject`}>
                                        <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                        Reject Timesheet
                                      </Link>
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {timesheet.status === "pending" && (
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
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

export default TimesheetsList;
