import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import {
  Loader2,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Clock,
  Paperclip,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ComplaintsManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    submittedBy: '',
    contactInfo: '',
  });

  // Fetch complaints
  const { data: complaints, isLoading } = useQuery({
    queryKey: ['/api/gto-compliance/complaints'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/gto-compliance/complaints');
        if (!response.ok) {
          throw new Error('Failed to fetch complaints');
        }
        return await response.json();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch complaints',
          variant: 'destructive',
        });
        return [];
      }
    },
  });

  // Create complaint mutation
  const createComplaintMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/gto-compliance/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newComplaint,
          dateSubmitted: new Date().toISOString(),
          status: 'open',
          organizationId: 1, // Default organization for now
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create complaint');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Complaint created successfully',
      });
      setIsDialogOpen(false);
      setNewComplaint({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium',
        submittedBy: '',
        contactInfo: '',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gto-compliance/complaints'] });
    },
    onError: error => {
      toast({
        title: 'Error',
        description: 'Failed to create complaint',
        variant: 'destructive',
      });
    },
  });

  // Update complaint status mutation
  type UpdateStatusParams = {
    id: number;
    status: string;
  };

  const updateComplaintStatusMutation = useMutation<any, Error, UpdateStatusParams>({
    mutationFn: async ({ id, status }: UpdateStatusParams) => {
      const response = await fetch(`/api/gto-compliance/complaints/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update complaint status');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Complaint status updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gto-compliance/complaints'] });
    },
    onError: error => {
      toast({
        title: 'Error',
        description: 'Failed to update complaint status',
        variant: 'destructive',
      });
    },
  });

  const handleNewComplaintChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewComplaint({
      ...newComplaint,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewComplaint({
      ...newComplaint,
      [name]: value,
    });
  };

  const handleCreateComplaint = () => {
    createComplaintMutation.mutate();
  };

  const handleUpdateStatus = (id: number, status: string) => {
    updateComplaintStatusMutation.mutate({ id, status });
  };

  // Define a basic complaint type
  interface Complaint {
    id: number;
    title: string;
    description: string;
    submittedBy: string;
    status: string;
    category: string;
    priority: string;
    dateSubmitted: string;
  }

  // Filter complaints based on search query and status filter
  const filteredComplaints = complaints
    ? complaints.filter((complaint: Complaint) => {
        const matchesSearch =
          complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          complaint.submittedBy.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'open':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            <Clock className="h-3 w-3 mr-1" /> Open
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <AlertCircle className="h-3 w-3 mr-1" /> Under Review
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" /> Closed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: string }) => {
    switch (priority) {
      case 'high':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            High
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-10 mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Complaints & Appeals Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage and resolve apprentice and employer complaints
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Complaint
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Log New Complaint</DialogTitle>
                <DialogDescription>
                  Enter the details of the complaint from an apprentice, trainee, or employer.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Complaint Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newComplaint.title}
                    onChange={handleNewComplaintChange}
                    placeholder="Brief summary of the complaint"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Complaint Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newComplaint.description}
                    onChange={handleNewComplaintChange}
                    placeholder="Detailed description of the complaint"
                    rows={5}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newComplaint.category}
                      onValueChange={value => handleSelectChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="workplace">Workplace</SelectItem>
                        <SelectItem value="supervision">Supervision</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="discrimination">Discrimination</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newComplaint.priority}
                      onValueChange={value => handleSelectChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="submittedBy">Submitted By</Label>
                  <Input
                    id="submittedBy"
                    name="submittedBy"
                    value={newComplaint.submittedBy}
                    onChange={handleNewComplaintChange}
                    placeholder="Name of person submitting complaint"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactInfo">Contact Information</Label>
                  <Input
                    id="contactInfo"
                    name="contactInfo"
                    value={newComplaint.contactInfo}
                    onChange={handleNewComplaintChange}
                    placeholder="Email or phone number"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleCreateComplaint}
                  disabled={createComplaintMutation.isPending}
                >
                  {createComplaintMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Create Complaint
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complaints List</CardTitle>
            <CardDescription>
              View and manage all complaints from apprentices, trainees, and employers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="complaints">
              <TabsList className="mb-4">
                <TabsTrigger value="complaints">Complaints</TabsTrigger>
                <TabsTrigger value="appeals">Appeals</TabsTrigger>
              </TabsList>

              <TabsContent value="complaints">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center w-full max-w-sm space-x-2">
                    <div className="relative w-full">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search complaints..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Complaint</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredComplaints.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                            No complaints found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredComplaints.map((complaint: Complaint) => (
                          <TableRow key={complaint.id}>
                            <TableCell>
                              <div className="font-medium">{complaint.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {complaint.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              {complaint.category.charAt(0).toUpperCase() +
                                complaint.category.slice(1)}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={complaint.status} />
                            </TableCell>
                            <TableCell>
                              <PriorityBadge priority={complaint.priority} />
                            </TableCell>
                            <TableCell>
                              {formatDistanceToNow(new Date(complaint.dateSubmitted), {
                                addSuffix: true,
                              })}
                            </TableCell>
                            <TableCell>{complaint.submittedBy}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  {complaint.status === 'open' && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateStatus(complaint.id, 'under_review')
                                      }
                                    >
                                      Mark as Under Review
                                    </DropdownMenuItem>
                                  )}
                                  {complaint.status === 'under_review' && (
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(complaint.id, 'closed')}
                                    >
                                      Mark as Closed
                                    </DropdownMenuItem>
                                  )}
                                  {complaint.status === 'closed' && (
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(complaint.id, 'open')}
                                    >
                                      Reopen Complaint
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="appeals">
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Appeals management functionality will be implemented in the next phase.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
