import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isThisWeek, isThisMonth, differenceInDays } from "date-fns";
import { PlusCircle, Search, AlertTriangle, Calendar, Filter, User, Building2, Tag, SlidersHorizontal, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CaseNote {
  id: number;
  timestamp: string;
  type: string;
  content: string;
  apprenticeId: number;
  hostId: number;
  createdBy: string;
  visibility: string;
  requiresFollowUp: boolean;
  followUpDate?: string;
  apprenticeName: string;
  hostName: string;
}

export default function CaseNotesLogs() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState<CaseNote | null>(null);
  const [filter, setFilter] = useState<{
    apprenticeId: string;
    hostId: string;
    type: string;
    dateRange: string;
  }>({
    apprenticeId: "all",
    hostId: "all-hosts",
    type: "all-types",
    dateRange: "all-time",
  });

  const { data: caseNotes, isLoading, error } = useQuery<CaseNote[]>({
    queryKey: ["/api/field-officers/case-notes"],
  });

  const { toast } = useToast();

  if (error) {
    toast({
      variant: "destructive",
      title: "Error loading case notes",
      description: "There was a problem loading the case notes data.",
    });
  }

  const filteredCaseNotes = caseNotes?.filter((note) => {
    const matchesSearch =
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.apprenticeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.hostName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesApprentice = filter.apprenticeId === "all" || 
      note.apprenticeId.toString() === filter.apprenticeId;
    const matchesHost = filter.hostId === "all-hosts" || 
      note.hostId.toString() === filter.hostId;
    const matchesType = filter.type === "all-types" || 
      note.type === filter.type;

    // Date filter logic
    const matchesDateRange = filter.dateRange === "all-time" ? true : 
      filter.dateRange === "today" ? isToday(new Date(note.timestamp)) :
      filter.dateRange === "this-week" ? isThisWeek(new Date(note.timestamp)) :
      filter.dateRange === "this-month" ? isThisMonth(new Date(note.timestamp)) :
      filter.dateRange === "last-90-days" ? (
        differenceInDays(new Date(), new Date(note.timestamp)) <= 90
      ) : true;

    return matchesSearch && matchesApprentice && matchesHost && matchesType && matchesDateRange;
  });

  // Extract unique values for filters
  const uniqueApprentices = [
    ...new Set((caseNotes || []).map((note) => ({ id: note.apprenticeId, name: note.apprenticeName }))),
  ];
  const uniqueHosts = [
    ...new Set((caseNotes || []).map((note) => ({ id: note.hostId, name: note.hostName }))),
  ];
  const uniqueTypes = [...new Set((caseNotes || []).map((note) => note.type))];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Case Notes & Logs</h1>
          <p className="text-muted-foreground">
            Record and manage field officer case notes and follow-up actions
          </p>
        </div>
        <Button onClick={() => navigate("/field-officers/case-notes/create")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Case Note
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search case notes..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filter.apprenticeId}
            onValueChange={(value) => setFilter({ ...filter, apprenticeId: value })}
          >
            <SelectTrigger className="w-[180px]">
              <span className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Apprentice</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Apprentices</SelectItem>
              {uniqueApprentices.map((apprentice) => (
                <SelectItem key={apprentice.id} value={apprentice.id.toString()}>
                  {apprentice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.hostId}
            onValueChange={(value) => setFilter({ ...filter, hostId: value })}
          >
            <SelectTrigger className="w-[180px]">
              <span className="flex items-center">
                <Building2 className="mr-2 h-4 w-4" />
                <span>Host Employer</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-hosts">All Hosts</SelectItem>
              {uniqueHosts.map((host) => (
                <SelectItem key={host.id} value={host.id.toString()}>
                  {host.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.type}
            onValueChange={(value) => setFilter({ ...filter, type: value })}
          >
            <SelectTrigger className="w-[150px]">
              <span className="flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                <span>Note Type</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.dateRange}
            onValueChange={(value) => setFilter({ ...filter, dateRange: value })}
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

          {(filter.apprenticeId || filter.hostId || filter.type || filter.dateRange) && (
            <Button
              variant="outline"
              onClick={() =>
                setFilter({
                  apprenticeId: "all",
                  hostId: "all-hosts",
                  type: "all-types",
                  dateRange: "all-time",
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
          <CardTitle className="text-md">Case Notes</CardTitle>
          <CardDescription>
            Total: {filteredCaseNotes?.length || 0} notes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Apprentice</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Note Preview</TableHead>
                  <TableHead>Follow-Up</TableHead>
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
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-9 w-20" />
                        </TableCell>
                      </TableRow>
                    ))}

                {!isLoading && filteredCaseNotes?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No case notes found.{" "}
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => navigate("/field-officers/case-notes/create")}
                      >
                        Create one
                      </Button>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  filteredCaseNotes?.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(note.timestamp), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={note.type === "Welfare" ? "secondary" : "outline"}>
                          {note.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{note.apprenticeName}</TableCell>
                      <TableCell>{note.hostName}</TableCell>
                      <TableCell className="max-w-md truncate">{note.content}</TableCell>
                      <TableCell>
                        {note.requiresFollowUp ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {note.followUpDate
                              ? format(new Date(note.followUpDate), "yyyy-MM-dd")
                              : "Required"}
                          </Badge>
                        ) : (
                          <Badge variant="outline">None</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedNote(note)}
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
                              <DropdownMenuItem onClick={() => setSelectedNote(note)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/field-officers/case-notes/${note.id}/edit`)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/field-officers/actions/create?noteId=${note.id}`)}>
                                Create Action Item
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Archive
                              </DropdownMenuItem>
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
            Showing {filteredCaseNotes?.length || 0} of {caseNotes?.length || 0} case notes
          </div>
        </CardFooter>
      </Card>

      {/* Case Note Detail Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant={selectedNote?.type === "Welfare" ? "secondary" : "outline"}>
                {selectedNote?.type}
              </Badge>
              <span>Case Note Details</span>
            </DialogTitle>
            <DialogDescription>
              Created on {selectedNote && format(new Date(selectedNote.timestamp), "PPP 'at' p")}
              {" by "} {selectedNote?.createdBy}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Apprentice</h4>
                <p className="text-sm">{selectedNote?.apprenticeName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Host Employer</h4>
                <p className="text-sm">{selectedNote?.hostName}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Case Note</h4>
              <div className="p-3 bg-muted rounded-md text-sm">
                {selectedNote?.content}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <h4 className="text-sm font-medium mb-1">Visibility</h4>
                <p className="text-sm">{selectedNote?.visibility}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Follow-Up Required</h4>
                <div className="flex items-center gap-2">
                  {selectedNote?.requiresFollowUp ? (
                    <>
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {selectedNote.followUpDate
                          ? format(new Date(selectedNote.followUpDate), "PPP")
                          : "Required"}
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="outline">None</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setSelectedNote(null)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/field-officers/case-notes/${selectedNote?.id}/edit`)}
              >
                Edit Note
              </Button>
              <Button
                onClick={() => navigate(`/field-officers/actions/create?noteId=${selectedNote?.id}`)}
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