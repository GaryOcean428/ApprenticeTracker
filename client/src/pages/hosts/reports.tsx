import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  BarChart3,
  Calendar,
  Download,
  FileDown,
  Filter,
  Printer,
  Receipt,
  Search,
  User,
  Users
} from "lucide-react";

// Define types for reports data
interface Apprentice {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qualification: string;
  status: string;
  startDate: string;
  expectedEndDate: string | null;
}

interface Report {
  id: string;
  title: string;
  description: string;
  type: string; // 'attendance', 'progress', 'compliance', 'financial'
  dateRange: string;
  generatedAt: string;
  downloadUrl: string;
}

interface Timesheet {
  id: number;
  apprenticeId: number;
  weekStartDate: string;
  weekEndDate: string;
  status: 'pending' | 'approved' | 'rejected';
  totalHours: number;
  submittedAt: string;
  apprentice?: {
    firstName: string;
    lastName: string;
  };
  details: {
    day: string;
    date: string;
    hoursWorked: number;
    startTime: string;
    endTime: string;
    breaks: number;
    notes: string;
  }[];
}

interface HostStats {
  totalApprentices: number;
  activeApprentices: number;
  completedApprentices: number;
  terminatedApprentices: number;
  averageCompletionRate: number;
  complianceRate: number;
  pendingTimesheets: number;
}

const HostReportsPage = () => {
  const params = useParams<{ id?: string }>();
  const hostId = params.id ? parseInt(params.id) : undefined;
  const [activeTab, setActiveTab] = useState("overview");
  const [timesheetFilter, setTimesheetFilter] = useState({
    status: "",
    search: "",
    dateRange: "current"
  });
  const [reportFilter, setReportFilter] = useState({
    type: "",
    search: "",
    dateRange: "all"
  });

  // Fetch host employer details
  const { data: host, isLoading: hostLoading } = useQuery({
    queryKey: ["/api/hosts", hostId],
    queryFn: async () => {
      if (!hostId) return null;
      const res = await fetch(`/api/hosts/${hostId}`);
      if (!res.ok) throw new Error("Failed to fetch host employer");
      return res.json();
    },
    enabled: !!hostId,
  });

  // Fetch host apprentices
  const { data: apprentices, isLoading: apprenticesLoading } = useQuery({
    queryKey: ["/api/hosts", hostId, "apprentices"],
    queryFn: async () => {
      if (!hostId) return [];
      const res = await fetch(`/api/hosts/${hostId}/apprentices`);
      if (!res.ok) throw new Error("Failed to fetch apprentices");
      return res.json() as Promise<Apprentice[]>;
    },
    enabled: !!hostId,
  });

  // Fetch host timesheets
  const { data: timesheets, isLoading: timesheetsLoading } = useQuery({
    queryKey: ["/api/hosts", hostId, "timesheets"],
    queryFn: async () => {
      if (!hostId) return [];
      const res = await fetch(`/api/hosts/${hostId}/timesheets`);
      if (!res.ok) throw new Error("Failed to fetch timesheets");
      return res.json() as Promise<Timesheet[]>;
    },
    enabled: !!hostId,
  });

  // Fetch host reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/hosts", hostId, "reports"],
    queryFn: async () => {
      if (!hostId) return [];
      const res = await fetch(`/api/hosts/${hostId}/reports`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json() as Promise<Report[]>;
    },
    enabled: !!hostId,
  });

  // Fetch host stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/hosts", hostId, "stats"],
    queryFn: async () => {
      if (!hostId) return null;
      const res = await fetch(`/api/hosts/${hostId}/stats`);
      if (!res.ok) throw new Error("Failed to fetch host stats");
      return res.json() as Promise<HostStats>;
    },
    enabled: !!hostId,
  });

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return format(new Date(dateStr), "dd MMM yyyy");
  };

  // Filter timesheets based on the filter criteria
  const filteredTimesheets = timesheets?.filter(timesheet => {
    const matchesStatus = !timesheetFilter.status || timesheet.status === timesheetFilter.status;
    
    const matchesSearch = !timesheetFilter.search || (
      timesheet.apprentice && 
      `${timesheet.apprentice.firstName} ${timesheet.apprentice.lastName}`
        .toLowerCase()
        .includes(timesheetFilter.search.toLowerCase())
    );
    
    const now = new Date();
    let matchesDateRange = true;
    
    if (timesheetFilter.dateRange === "current") {
      // Current week
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
      
      const timesheetDate = new Date(timesheet.weekStartDate);
      matchesDateRange = timesheetDate >= weekStart && timesheetDate <= weekEnd;
    } else if (timesheetFilter.dateRange === "previous") {
      // Previous week
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - 7); // Start of previous week
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of previous week
      
      const timesheetDate = new Date(timesheet.weekStartDate);
      matchesDateRange = timesheetDate >= weekStart && timesheetDate <= weekEnd;
    } else if (timesheetFilter.dateRange === "month") {
      // Current month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const timesheetDate = new Date(timesheet.weekStartDate);
      matchesDateRange = timesheetDate >= monthStart && timesheetDate <= monthEnd;
    }
    
    return matchesStatus && matchesSearch && matchesDateRange;
  }) || [];

  // Filter reports based on the filter criteria
  const filteredReports = reports?.filter(report => {
    const matchesType = !reportFilter.type || report.type === reportFilter.type;
    const matchesSearch = !reportFilter.search || 
      report.title.toLowerCase().includes(reportFilter.search.toLowerCase()) || 
      report.description.toLowerCase().includes(reportFilter.search.toLowerCase());
    
    // Date filtering logic for reports would go here if needed
    
    return matchesType && matchesSearch;
  }) || [];

  // Loading state
  if (hostLoading || apprenticesLoading || timesheetsLoading || reportsLoading || statsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {host ? `${host.name} - Reports` : "Host Employer Reports"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="overview" className="mt-0">
            {stats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Apprentices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalApprentices}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.activeApprentices} active, {stats.completedApprentices} completed, {stats.terminatedApprentices} terminated
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.averageCompletionRate}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Industry average: 72%
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Compliance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.complianceRate}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on latest compliance assessments
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-semibold mb-4">Apprentice Status</h3>
                  <div className="aspect-[2/1] bg-muted/20 rounded-md flex items-center justify-center">
                    <div className="text-center text-muted-foreground flex flex-col items-center">
                      <BarChart3 className="h-10 w-10 mb-2" />
                      <p>Apprentice status chart would appear here</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Pending Approvals</h3>
                  {stats.pendingTimesheets > 0 ? (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Receipt className="h-5 w-5 mr-2 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Timesheets Requiring Approval</p>
                              <p className="text-sm text-muted-foreground">
                                {stats.pendingTimesheets} pending timesheet{stats.pendingTimesheets !== 1 ? "s" : ""} need your attention
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" onClick={() => setActiveTab("timesheets")}>
                            Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <p className="text-muted-foreground">No pending items requiring your approval</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No statistical data available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="timesheets" className="mt-0">
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search apprentice..."
                  className="pl-8 w-full"
                  value={timesheetFilter.search}
                  onChange={(e) => setTimesheetFilter({...timesheetFilter, search: e.target.value})}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={timesheetFilter.status}
                  onValueChange={(value) => setTimesheetFilter({...timesheetFilter, status: value})}
                >
                  <SelectTrigger className="w-[140px]">
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
                
                <Select
                  value={timesheetFilter.dateRange}
                  onValueChange={(value) => setTimesheetFilter({...timesheetFilter, dateRange: value})}
                >
                  <SelectTrigger className="w-[140px]">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Week</SelectItem>
                    <SelectItem value="previous">Previous Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {filteredTimesheets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apprentice</TableHead>
                    <TableHead>Week Period</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTimesheets.map((timesheet) => (
                    <TableRow key={timesheet.id}>
                      <TableCell>
                        {timesheet.apprentice ? (
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            {timesheet.apprentice.firstName} {timesheet.apprentice.lastName}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="whitespace-nowrap">
                          {formatDate(timesheet.weekStartDate)} - {formatDate(timesheet.weekEndDate)}
                        </div>
                      </TableCell>
                      <TableCell>{timesheet.totalHours} hrs</TableCell>
                      <TableCell>{formatDate(timesheet.submittedAt)}</TableCell>
                      <TableCell>
                        <Badge
                          className={{
                            "bg-yellow-100 text-yellow-800": timesheet.status === "pending",
                            "bg-green-100 text-green-800": timesheet.status === "approved",
                            "bg-red-100 text-red-800": timesheet.status === "rejected",
                          }}
                        >
                          {timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" disabled={timesheet.status !== "pending"}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" disabled={timesheet.status !== "pending"}>
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No timesheets found matching your filter criteria
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reports" className="mt-0">
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reports..."
                  className="pl-8 w-full"
                  value={reportFilter.search}
                  onChange={(e) => setReportFilter({...reportFilter, search: e.target.value})}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={reportFilter.type}
                  onValueChange={(value) => setReportFilter({...reportFilter, type: value})}
                >
                  <SelectTrigger className="w-[140px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={reportFilter.dateRange}
                  onValueChange={(value) => setReportFilter({...reportFilter, dateRange: value})}
                >
                  <SelectTrigger className="w-[140px]">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                    <SelectItem value="quarter">Past Quarter</SelectItem>
                    <SelectItem value="year">Past Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {filteredReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{report.title}</CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className="bg-muted text-foreground">
                          {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {report.dateRange}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Generated: {formatDate(report.generatedAt)}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full">
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No reports found matching your filter criteria
                </p>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
};

export default HostReportsPage;