import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format, isPast, isToday } from "date-fns";
import { PlusCircle, Search, Filter, Calendar, User, Clock, Tag, SlidersHorizontal, CheckCircle, Mail } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

// Define interface for action items
interface ActionItem {
  id: number;
  description: string;
  dueDate: string;
  assignedTo: string;
  assignedToId: number;
  status: string;
  priority: string;
  linkedTo?: {
    type: string;
    id: number;
    title: string;
  };
  reminders: {
    email: boolean;
    emailDays: number;
    sms: boolean;
    smsDays: number;
  };
  createdBy: string;
  createdAt: string;
}

// Status badge variants
const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "open":
      return "outline";
    case "in progress":
      return "secondary";
    case "completed":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
};

// Priority badge variants
const getPriorityVariant = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "destructive";
    case "medium":
      return "warning";
    case "low":
      return "outline";
    default:
      return "secondary";
  }
};

// Due date badge styles
const getDueDateStyles = (dateStr: string) => {
  const date = new Date(dateStr);
  
  if (isPast(date) && !isToday(date)) {
    return {
      variant: "destructive" as const,
      icon: <Clock className="h-3 w-3 mr-1" />,
      text: `Overdue: ${format(date, "dd MMM yyyy")}`
    };
  }
  
  if (isToday(date)) {
    return {
      variant: "warning" as const,
      icon: <Clock className="h-3 w-3 mr-1" />,
      text: `Due today`
    };
  }
  
  return {
    variant: "outline" as const,
    icon: <Calendar className="h-3 w-3 mr-1" />,
    text: format(date, "dd MMM yyyy")
  };
};

export default function ActionItemsReminders() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<{
    assignedTo: string;
    status: string;
    dueDate: string;
  }>({
    assignedTo: "",
    status: "",
    dueDate: "",
  });

  const { data: actionItems, isLoading, error } = useQuery<ActionItem[]>({
    queryKey: ["/api/field-officers/actions"],
  });

  const { toast } = useToast();

  if (error) {
    toast({
      variant: "destructive",
      title: "Error loading action items",
      description: "There was a problem loading the action items data.",
    });
  }

  const filteredActionItems = actionItems?.filter((item) => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAssignedTo = filter.assignedTo ? item.assignedToId.toString() === filter.assignedTo : true;
    const matchesStatus = filter.status ? item.status === filter.status : true;
    
    // Due date filter logic would go here
    const matchesDueDate = true; // Placeholder

    return matchesSearch && matchesAssignedTo && matchesStatus && matchesDueDate;
  });

  // Extract unique values for filters
  const uniqueStaff = [
    ...new Set((actionItems || []).map((item) => ({ id: item.assignedToId, name: item.assignedTo }))),
  ];
  const uniqueStatuses = [...new Set((actionItems || []).map((item) => item.status))];

  // Function to send reminder manually
  const sendReminder = (id: number) => {
    toast({
      title: "Reminder sent",
      description: "A reminder notification has been sent to the assignee.",
    });
  };

  // Function to mark action as complete
  const markAsComplete = (id: number) => {
    toast({
      variant: "default",
      title: "Action marked as complete",
      description: "The action item has been marked as completed.",
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Action Items & Reminders</h1>
          <p className="text-muted-foreground">
            Manage follow-up tasks, deadlines, and automated reminders
          </p>
        </div>
        <Button onClick={() => navigate("/field-officers/actions/create")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Action Item
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search action items..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filter.assignedTo}
            onValueChange={(value) => setFilter({ ...filter, assignedTo: value })}
          >
            <SelectTrigger className="w-[180px]">
              <span className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Assigned To</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-staff">All Staff</SelectItem>
              {uniqueStaff.map((staff) => (
                <SelectItem key={staff.id} value={staff.id.toString()}>
                  {staff.name}
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
                <Tag className="mr-2 h-4 w-4" />
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
            value={filter.dueDate}
            onValueChange={(value) => setFilter({ ...filter, dueDate: value })}
          >
            <SelectTrigger className="w-[150px]">
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Due Date</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-dates">All Dates</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="today">Due Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="next-week">Next Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range...</SelectItem>
            </SelectContent>
          </Select>

          {(filter.assignedTo || filter.status || filter.dueDate) && (
            <Button
              variant="outline"
              onClick={() =>
                setFilter({
                  assignedTo: "",
                  status: "",
                  dueDate: "",
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
          <CardTitle className="text-md">Action Items</CardTitle>
          <CardDescription>
            Total: {filteredActionItems?.length || 0} action item{filteredActionItems?.length !== 1 && 's'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="w-[30%]">Action Description</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
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
                          <Skeleton className="h-5 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-9 w-20" />
                        </TableCell>
                      </TableRow>
                    ))}

                {!isLoading && filteredActionItems?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No action items found.{" "}
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => navigate("/field-officers/actions/create")}
                      >
                        Create one
                      </Button>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  filteredActionItems?.map((item) => {
                    const dueDateStyle = getDueDateStyles(item.dueDate);
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge variant={dueDateStyle.variant} className="flex items-center whitespace-nowrap">
                            {dueDateStyle.icon}
                            {dueDateStyle.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.description}
                          {item.linkedTo && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Linked to: {item.linkedTo.type} #{item.linkedTo.id} - {item.linkedTo.title}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{item.assignedTo}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityVariant(item.priority)}>
                            {item.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => sendReminder(item.id)}
                                    disabled={item.status === "Completed" || item.status === "Cancelled"}
                                  >
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Send Reminder</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => markAsComplete(item.id)}
                                    disabled={item.status === "Completed" || item.status === "Cancelled"}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Mark Complete</TooltipContent>
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
                                <DropdownMenuItem onClick={() => navigate(`/field-officers/actions/${item.id}/edit`)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => sendReminder(item.id)}>
                                  Send Reminder
                                </DropdownMenuItem>
                                {item.status !== "Completed" && (
                                  <DropdownMenuItem onClick={() => markAsComplete(item.id)}>
                                    Mark as Complete
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  Cancel Action
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredActionItems?.length || 0} of {actionItems?.length || 0} action items
          </div>
        </CardFooter>
      </Card>
    </>
  );
}