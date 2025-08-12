import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { TagIcon, PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/page-header';
import { DashboardShell } from '@/components/dashboard-shell';
import { SkeletonTable } from '@/components/skeleton-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Define type for contact tag
type ContactTag = {
  id: number;
  name: string;
  description: string | null;
  color: string;
  organizationId: number | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};

// Form schema for creating/editing a tag
const tagFormSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  description: z.string().optional(),
  color: z.string().default('#6366F1'),
});

type TagFormValues = z.infer<typeof tagFormSchema>;

export default function ContactTagsPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch contact tags
  const { data: tags, isLoading } = useQuery<ContactTag[]>({
    queryKey: ['/api/contacts/contact-tags'],
  });

  // Form for adding new tag
  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#6366F1',
    },
  });

  // Mutation for adding new tag
  const addTagMutation = useMutation({
    mutationFn: async (values: TagFormValues) => {
      const res = await apiRequest('POST', '/api/contacts/tags', values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts/contact-tags'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: 'Success',
        description: 'Contact tag created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create contact tag: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation for deleting a tag
  const deleteTagMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/contacts/tags/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts/contact-tags'] });
      toast({
        title: 'Success',
        description: 'Contact tag deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete contact tag: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: TagFormValues) => {
    addTagMutation.mutate(values);
  };

  const handleDelete = (tag: ContactTag) => {
    if (tag.isSystem) {
      toast({
        title: 'Cannot Delete',
        description: 'System tags cannot be deleted',
        variant: 'destructive',
      });
      return;
    }

    if (confirm('Are you sure you want to delete this contact tag?')) {
      deleteTagMutation.mutate(tag.id);
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        heading="Contact Tags"
        description="Manage tags to categorize and organize your contacts"
      >
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Contact Tag</DialogTitle>
              <DialogDescription>Add a new tag to categorize your contacts</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tag Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., VIP" {...field} />
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
                        <Textarea
                          placeholder="What does this tag represent?"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input type="color" {...field} className="w-16 h-10 p-1" />
                        </FormControl>
                        <Input {...field} placeholder="#6366F1" className="w-24" />
                      </div>
                      <FormDescription>Choose a color for the tag</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={addTagMutation.isPending}>
                    {addTagMutation.isPending ? 'Creating...' : 'Create Tag'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mt-6">
        {isLoading ? (
          <SkeletonTable columns={4} rows={5} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Tags</CardTitle>
              <CardDescription>Manage your contact tags</CardDescription>
            </CardHeader>
            <CardContent>
              {tags && tags.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags.map(tag => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="font-medium">{tag.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{tag.description || 'No description'}</TableCell>
                        <TableCell>
                          {tag.isSystem ? (
                            <Badge variant="secondary">System</Badge>
                          ) : (
                            <Badge variant="outline">Custom</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(tag)}
                              disabled={deleteTagMutation.isPending || tag.isSystem}
                            >
                              <TrashIcon className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-6">
                  <TagIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <p className="text-center text-muted-foreground mb-4">
                    No tags found. Create your first tag to get started.
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create Your First Tag
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">How to use tags effectively:</h3>
                <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground ml-4 space-y-1">
                  <li>Create tags that represent meaningful categories</li>
                  <li>Use consistent naming conventions for related tags</li>
                  <li>Assign colors that make logical sense (e.g., red for urgent)</li>
                  <li>Don't create too many overlapping tags</li>
                  <li>Review and clean up unused tags periodically</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium">System Tags:</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  System tags are pre-defined and cannot be deleted. They ensure consistent
                  categorization across the platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
