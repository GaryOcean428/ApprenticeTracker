import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Plus, 
  Users, 
  Clock, 
  Calendar, 
  Star, 
  MessageSquare, 
  Target, 
  TrendingUp,
  UserCheck,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Mentor, MentorAssignment, Apprentice } from '@shared/schema';

interface MentorWithAssignments extends Mentor {
  assignments: (MentorAssignment & { apprentice: Apprentice })[];
}

interface AssignmentWithDetails extends MentorAssignment {
  mentor: Mentor;
  apprentice: Apprentice;
}

export default function MentorManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newAssignmentDialog, setNewAssignmentDialog] = useState(false);

  // Fetch all mentors with their assignments
  const { data: mentors, isLoading: isLoadingMentors } = useQuery({
    queryKey: ['/api/mentors'],
    queryFn: async (): Promise<MentorWithAssignments[]> => {
      const res = await fetch('/api/mentors');
      if (!res.ok) throw new Error('Failed to fetch mentors');
      return res.json();
    },
  });

  // Fetch all apprentices for assignment dropdown
  const { data: apprentices } = useQuery({
    queryKey: ['/api/apprentices'],
    queryFn: async (): Promise<Apprentice[]> => {
      const res = await fetch('/api/apprentices');
      if (!res.ok) throw new Error('Failed to fetch apprentices');
      return res.json();
    },
  });

  // Create new mentor assignment
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const res = await fetch('/api/mentor-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData),
      });
      if (!res.ok) throw new Error('Failed to create assignment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mentors'] });
      setNewAssignmentDialog(false);
      toast({
        title: 'Assignment Created',
        description: 'Mentor assignment has been created successfully.',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create mentor assignment.',
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate mentor statistics
  const mentorStats = mentors ? {
    totalMentors: mentors.length,
    activeMentors: mentors.filter(m => m.availability === 'active').length,
    totalActiveAssignments: mentors.reduce((sum, m) => 
      sum + m.assignments.filter(a => a.status === 'active').length, 0
    ),
    averageRating: mentors.reduce((sum, m) => 
      sum + (parseFloat(m.rating?.toString() || '0')), 0
    ) / mentors.length || 0
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentor Management</h1>
          <p className="text-muted-foreground">
            Manage mentors and their apprentice assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={newAssignmentDialog} onOpenChange={setNewAssignmentDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Mentor Assignment</DialogTitle>
                <DialogDescription>
                  Assign a mentor to an apprentice to begin their mentoring relationship.
                </DialogDescription>
              </DialogHeader>
              <AssignmentForm
                mentors={mentors || []}
                apprentices={apprentices || []}
                onSubmit={(data) => createAssignmentMutation.mutate(data)}
                isLoading={createAssignmentMutation.isPending}
              />
            </DialogContent>
          </Dialog>
          <Button variant="outline" asChild>
            <Link href="/mentors/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Mentor
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {mentorStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Mentors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mentorStats.totalMentors}</div>
              <p className="text-xs text-muted-foreground">
                {mentorStats.activeMentors} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mentorStats.totalActiveAssignments}</div>
              <p className="text-xs text-muted-foreground">
                Currently mentoring
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mentorStats.averageRating.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of 5.0
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mentorStats.totalMentors > 0 
                  ? Math.round((mentorStats.totalActiveAssignments / (mentorStats.totalMentors * 10)) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average capacity used
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="mentors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
          <TabsTrigger value="assignments">Active Assignments</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="mentors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Mentors</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMentors ? (
                <div className="text-center py-6">Loading mentors...</div>
              ) : !mentors?.length ? (
                <div className="text-center py-6 text-muted-foreground">
                  No mentors found. Add a mentor to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mentor</TableHead>
                      <TableHead>Specializations</TableHead>
                      <TableHead>Active Assignments</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mentors.map((mentor) => (
                      <TableRow key={mentor.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {mentor.firstName[0]}{mentor.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {mentor.firstName} {mentor.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {mentor.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {JSON.parse(mentor.specializations || '[]').map((spec: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">
                              {mentor.assignments.filter(a => a.status === 'active').length}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              of {mentor.maxApprentices}
                            </div>
                            <Progress 
                              value={((mentor.assignments.filter(a => a.status === 'active').length) / (mentor.maxApprentices || 10)) * 100} 
                              className="h-1 mt-1"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            <span className="text-sm">
                              {mentor.rating ? parseFloat(mentor.rating.toString()).toFixed(1) : 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getAvailabilityColor(mentor.availability)}>
                            {mentor.availability}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/mentors/${mentor.id}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Mentor Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Active assignments view will be populated with real data.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Mentoring Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Recent sessions view will be populated with real data.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AssignmentForm({ 
  mentors, 
  apprentices, 
  onSubmit, 
  isLoading 
}: {
  mentors: MentorWithAssignments[];
  apprentices: Apprentice[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    mentorId: '',
    apprenticeId: '',
    startDate: new Date().toISOString().split('T')[0],
    assignmentType: 'primary',
    goals: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goals = formData.goals.split(',').map(g => g.trim()).filter(Boolean);
    onSubmit({
      ...formData,
      mentorId: parseInt(formData.mentorId),
      apprenticeId: parseInt(formData.apprenticeId),
      goals: JSON.stringify(goals),
      createdBy: 1, // Placeholder for current user ID
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mentor">Mentor</Label>
          <Select value={formData.mentorId} onValueChange={(value) => setFormData({...formData, mentorId: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select mentor" />
            </SelectTrigger>
            <SelectContent>
              {mentors.filter(m => m.availability === 'active').map((mentor) => (
                <SelectItem key={mentor.id} value={mentor.id.toString()}>
                  {mentor.firstName} {mentor.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apprentice">Apprentice</Label>
          <Select value={formData.apprenticeId} onValueChange={(value) => setFormData({...formData, apprenticeId: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select apprentice" />
            </SelectTrigger>
            <SelectContent>
              {apprentices.filter(a => a.status === 'active').map((apprentice) => (
                <SelectItem key={apprentice.id} value={apprentice.id.toString()}>
                  {apprentice.firstName} {apprentice.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignmentType">Assignment Type</Label>
          <Select value={formData.assignmentType} onValueChange={(value) => setFormData({...formData, assignmentType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary Mentor</SelectItem>
              <SelectItem value="secondary">Secondary Mentor</SelectItem>
              <SelectItem value="specialist">Specialist Mentor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goals">Mentoring Goals (comma-separated)</Label>
        <Textarea
          placeholder="Improve communication skills, Develop leadership abilities, Technical expertise..."
          value={formData.goals}
          onChange={(e) => setFormData({...formData, goals: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          placeholder="Additional notes about this mentoring assignment..."
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading || !formData.mentorId || !formData.apprenticeId}>
          {isLoading ? 'Creating...' : 'Create Assignment'}
        </Button>
      </div>
    </form>
  );
}