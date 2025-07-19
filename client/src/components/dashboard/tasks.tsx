import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Task } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  relatedTo: z.string().optional(),
  relatedId: z.number().optional().nullable(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const TaskList = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json() as Promise<Task[]>;
    },
  });

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      relatedTo: '',
      relatedId: null,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      return apiRequest('POST', '/api/tasks', {
        ...data,
        assignedTo: 1, // Assign to current user (admin for now)
        createdBy: 1, // Created by current user (admin for now)
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setCreateDialogOpen(false);
      form.reset();
      toast({
        title: 'Task created',
        description: 'Your task has been created successfully',
      });
    },
    onError: error => {
      toast({
        title: 'Failed to create task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PATCH', `/api/tasks/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: 'Task updated',
        description: 'Task status updated successfully',
      });
    },
    onError: error => {
      toast({
        title: 'Failed to update task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateTask = (data: TaskFormValues) => {
    createTaskMutation.mutate(data);
  };

  const handleTaskStatusChange = (id: number, checked: boolean | 'indeterminate') => {
    if (checked !== 'indeterminate') {
      updateTaskStatusMutation.mutate({
        id,
        status: checked ? 'completed' : 'pending',
      });
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="ml-auto text-xs text-destructive px-2 py-1 rounded-full bg-red-100">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="ml-auto text-xs text-warning px-2 py-1 rounded-full bg-yellow-100">
            High
          </span>
        );
      case 'low':
        return (
          <span className="ml-auto text-xs text-success px-2 py-1 rounded-full bg-green-100">
            Low
          </span>
        );
      default:
        return <span className="ml-auto text-xs text-muted-foreground">Medium</span>;
    }
  };

  const getDueDate = (dueDate: Date | null) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const now = new Date();
    const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) {
      return <span className="ml-auto text-xs text-destructive">Overdue</span>;
    } else if (diffInDays === 0) {
      return <span className="ml-auto text-xs text-warning">Due today</span>;
    } else if (diffInDays === 1) {
      return <span className="ml-auto text-xs text-muted-foreground">Due tomorrow</span>;
    } else if (diffInDays < 7) {
      return (
        <span className="ml-auto text-xs text-muted-foreground">Due in {diffInDays} days</span>
      );
    } else {
      return (
        <span className="ml-auto text-xs text-muted-foreground">
          Due in {Math.floor(diffInDays / 7)} week(s)
        </span>
      );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tasks</CardTitle>
          <Button size="sm" disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-4 w-4 mr-4 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-1/5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load tasks</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tasks</CardTitle>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden">
            <ul className="divide-y divide-border">
              {tasks?.map(task => (
                <li key={task.id} className="py-3">
                  <label className="flex items-center">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={checked => handleTaskStatusChange(task.id, checked)}
                      className="h-4 w-4"
                    />
                    <span
                      className={`ml-2 text-sm ${task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                    >
                      {task.title}
                    </span>
                    {task.status === 'completed' ? (
                      <span className="ml-auto text-xs text-success px-2 py-1 rounded-full bg-green-100">
                        Completed
                      </span>
                    ) : (
                      <>
                        {getPriorityBadge(task.priority)}
                        {getDueDate(task.dueDate)}
                      </>
                    )}
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Link href="/tasks" className="text-sm font-medium text-primary hover:underline">
                View all tasks
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new task</DialogTitle>
            <DialogDescription>Add a new task to your list.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateTask)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Task description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskList;
