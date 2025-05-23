import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Search, Calendar, Filter, Tag, User, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

interface ApprenticeProgress {
  id: number;
  apprenticeId: number;
  apprenticeName: string;
  qualificationCode: string;
  qualificationName: string;
  startDate: string;
  targetDate: string;
  progress: number;
  status: string;
  lastUpdated: string;
}

export default function ProgressTracking() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({
    qualification: "all-qualifications",
    status: "all-statuses",
    progressRange: "all",
    startDateRange: { start: "", end: "" },
    targetDateRange: { start: "", end: "" },
  });
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });

  const { data: progressData, isLoading, error } = useQuery<ApprenticeProgress[]>({
    queryKey: ["/api/apprentices/progress"],
  });

  const { toast } = useToast();

  if (error) {
    toast({
      variant: "destructive",
      title: "Error loading progress data",
      description: "There was a problem loading the apprentice progress data.",
    });
  }

  // Filter data based on search and filters
  const filteredData = progressData?.filter((item) => {
    const matchesSearch =
      item.apprenticeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.qualificationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.qualificationCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesQualification =
      filter.qualification === "all-qualifications" || 
      item.qualificationCode === filter.qualification;
    
    const matchesStatus =
      filter.status === "all-statuses" || 
      item.status === filter.status;
    
    const matchesProgressRange = 
      filter.progressRange === "all" ? true :
      filter.progressRange === "0-25" ? item.progress <= 25 :
      filter.progressRange === "26-50" ? (item.progress > 25 && item.progress <= 50) :
      filter.progressRange === "51-75" ? (item.progress > 50 && item.progress <= 75) :
      filter.progressRange === "76-99" ? (item.progress > 75 && item.progress < 100) :
      filter.progressRange === "completed" ? item.progress === 100 : true;

    const matchesStartDateRange =
      (!filter.startDateRange.start || new Date(item.startDate) >= new Date(filter.startDateRange.start)) &&
      (!filter.startDateRange.end || new Date(item.startDate) <= new Date(filter.startDateRange.end));

    const matchesTargetDateRange =
      (!filter.targetDateRange.start || new Date(item.targetDate) >= new Date(filter.targetDateRange.start)) &&
      (!filter.targetDateRange.end || new Date(item.targetDate) <= new Date(filter.targetDateRange.end));

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "at-risk" && 
        (item.status === "At Risk" || (item.progress < 50 && new Date(item.targetDate) < new Date()))) ||
      (activeTab === "on-track" && 
        (item.status === "On Track" || (item.progress >= 50 && new Date(item.targetDate) > new Date()))) ||
      (activeTab === "completed" && 
        (item.status === "Completed" || item.progress === 100));

    return matchesSearch && matchesQualification && matchesStatus && matchesProgressRange && matchesStartDateRange && matchesTargetDateRange && matchesTab;
  });

  // Sort data
  const sortedData = filteredData?.sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key as keyof ApprenticeProgress];
      const bValue = b[sortConfig.key as keyof ApprenticeProgress];
      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
    }
    return 0;
  });

  // Paginate data
  const paginatedData = sortedData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Extract unique values for filters
  const uniqueQualifications = [
    ...new Set((progressData || []).map((item) => ({
      code: item.qualificationCode,
      name: item.qualificationName
    }))),
  ];
  const uniqueStatuses = [...new Set((progressData || []).map((item) => item.status))];

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "On Track":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">On Track</Badge>;
      case "At Risk":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">At Risk</Badge>;
      case "Behind":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Behind</Badge>;
      case "Completed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Progress color helper
  const getProgressColor = (progress: number, status: string) => {
    if (status === "Completed" || progress === 100) return "bg-green-500";
    if (status === "At Risk" || status === "Behind") return "bg-yellow-500";
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Handle sorting
  const handleSort = (key: string) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Apprentice Progress Tracking</h1>
          <p className="text-muted-foreground">
            Monitor and manage progress of apprentices in their qualifications
          </p>
        </div>
        <Button onClick={() => navigate("/apprentices/progress/review")}>
          <Calendar className="mr-2 h-4 w-4" />
          Progress Review
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="on-track">On Track</TabsTrigger>
          <TabsTrigger value="at-risk">At Risk</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by apprentice or qualification..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filter.qualification}
            onValueChange={(value) => setFilter({ ...filter, qualification: value })}
          >
            <SelectTrigger className="w-[180px]">
              <span className="flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                <span>Qualification</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-qualifications">All Qualifications</SelectItem>
              {uniqueQualifications.map((qual) => (
                <SelectItem key={qual.code} value={qual.code}>
                  {qual.code} - {qual.name.length > 20 ? qual.name.substring(0, 20) + '...' : qual.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.status}
            onValueChange={(value) => setFilter({ ...filter, status: value })}
          >
            <SelectTrigger className="w-[150px]">
              <span className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <span>Status</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.progressRange}
            onValueChange={(value) => setFilter({ ...filter, progressRange: value })}
          >
            <SelectTrigger className="w-[180px]">
              <span className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Progress Range</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Progress Levels</SelectItem>
              <SelectItem value="0-25">0-25% Complete</SelectItem>
              <SelectItem value="26-50">26-50% Complete</SelectItem>
              <SelectItem value="51-75">51-75% Complete</SelectItem>
              <SelectItem value="76-99">76-99% Complete</SelectItem>
              <SelectItem value="completed">100% Complete</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              placeholder="Start Date From"
              value={filter.startDateRange.start}
              onChange={(e) => setFilter({ ...filter, startDateRange: { ...filter.startDateRange, start: e.target.value } })}
            />
            <Input
              type="date"
              placeholder="Start Date To"
              value={filter.startDateRange.end}
              onChange={(e) => setFilter({ ...filter, startDateRange: { ...filter.startDateRange, end: e.target.value } })}
            />
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              placeholder="Target Date From"
              value={filter.targetDateRange.start}
              onChange={(e) => setFilter({ ...filter, targetDateRange: { ...filter.targetDateRange, start: e.target.value } })}
            />
            <Input
              type="date"
              placeholder="Target Date To"
              value={filter.targetDateRange.end}
              onChange={(e) => setFilter({ ...filter, targetDateRange: { ...filter.targetDateRange, end: e.target.value } })}
            />
          </div>

          {(filter.qualification !== "all-qualifications" || filter.status !== "all-statuses" || filter.progressRange !== "all" || filter.startDateRange.start || filter.startDateRange.end || filter.targetDateRange.start || filter.targetDateRange.end) && (
            <Button
              variant="outline"
              onClick={() =>
                setFilter({
                  qualification: "all-qualifications",
                  status: "all-statuses",
                  progressRange: "all",
                  startDateRange: { start: "", end: "" },
                  targetDateRange: { start: "", end: "" },
                })
              }
              className="flex gap-1 items-center"
            >
              <Filter className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-md">Apprentice Progress</CardTitle>
          <CardDescription>
            Total: {filteredData?.length || 0} records
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("apprenticeName")}>
                    Apprentice
                    {sortConfig.key === "apprenticeName" && (sortConfig.direction === "ascending" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />)}
                  </TableHead>
                  <TableHead onClick={() => handleSort("qualificationName")}>
                    Qualification
                    {sortConfig.key === "qualificationName" && (sortConfig.direction === "ascending" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />)}
                  </TableHead>
                  <TableHead onClick={() => handleSort("progress")}>
                    Progress
                    {sortConfig.key === "progress" && (sortConfig.direction === "ascending" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />)}
                  </TableHead>
                  <TableHead onClick={() => handleSort("startDate")}>
                    Start Date
                    {sortConfig.key === "startDate" && (sortConfig.direction === "ascending" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />)}
                  </TableHead>
                  <TableHead onClick={() => handleSort("targetDate")}>
                    Target Date
                    {sortConfig.key === "targetDate" && (sortConfig.direction === "ascending" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />)}
                  </TableHead>
                  <TableHead onClick={() => handleSort("status")}>
                    Status
                    {sortConfig.key === "status" && (sortConfig.direction === "ascending" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />)}
                  </TableHead>
                  <TableHead onClick={() => handleSort("lastUpdated")}>
                    Last Updated
                    {sortConfig.key === "lastUpdated" && (sortConfig.direction === "ascending" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />)}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-48" />
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
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                      </TableRow>
                    ))}

                {!isLoading && paginatedData?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No progress records found.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  paginatedData?.map((item) => (
                    <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/apprentices/${item.apprenticeId}`)}>
                      <TableCell className="font-medium">{item.apprenticeName}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.qualificationName}</div>
                          <div className="text-xs text-muted-foreground">{item.qualificationCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="space-y-1">
                                <Progress value={item.progress} className={`h-2 ${getProgressColor(item.progress, item.status)}`} />
                                <div className="text-xs text-muted-foreground">{item.progress}% Complete</div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{item.progress}% Complete</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>{new Date(item.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(item.targetDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Pagination className="mt-6">
        <PaginationPrevious onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} />
        <PaginationContent>
          {Array(Math.ceil((filteredData?.length || 0) / itemsPerPage))
            .fill(0)
            .map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
        </PaginationContent>
        <PaginationNext onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil((filteredData?.length || 0) / itemsPerPage)))} />
      </Pagination>
    </>
  );
}
