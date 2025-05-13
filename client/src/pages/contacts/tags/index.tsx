import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, 
  PlusCircle, 
  Tag, 
  Edit, 
  Trash2, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define types
interface ContactTag {
  id: number;
  name: string;
  color: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NewTag {
  name: string;
  color: string;
  description: string | null;
  isSystem?: boolean;
}

// Main component
export default function ContactTagsPage() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<ContactTag | null>(null);
  
  // Form state
  const [tagForm, setTagForm] = useState<NewTag>({
    name: '',
    color: '#3b82f6', // Default blue color
    description: '',
    isSystem: false
  });
  
  // Fetch contact tags
  const { 
    data: tags = [], 
    isLoading: isTagsLoading,
    error: tagsError,
  } = useQuery<ContactTag[]>({
    queryKey: ['/api/tags'],
  });
  
  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: async (tag: NewTag) => {
      const res = await apiRequest('POST', '/api/contacts/tags', tag);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: 'Tag created',
        description: 'Contact tag was created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating tag',
        description: error.message || 'An error occurred while creating the tag.',
        variant: 'destructive',
      });
    }
  });
  
  // Update tag mutation
  const updateTagMutation = useMutation({
    mutationFn: async ({ id, tag }: { id: number; tag: Partial<NewTag> }) => {
      const res = await apiRequest('PUT', `/api/contacts/tags/${id}`, tag);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      setIsEditDialogOpen(false);
      setSelectedTag(null);
      toast({
        title: 'Tag updated',
        description: 'Contact tag was updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating tag',
        description: error.message || 'An error occurred while updating the tag.',
        variant: 'destructive',
      });
    }
  });
  
  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/contacts/tags/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      setIsDeleteDialogOpen(false);
      setSelectedTag(null);
      toast({
        title: 'Tag deleted',
        description: 'Contact tag was deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting tag',
        description: error.message || 'An error occurred while deleting the tag.',
        variant: 'destructive',
      });
    }
  });
  
  // Reset form
  const resetForm = () => {
    setTagForm({
      name: '',
      color: '#3b82f6',
      description: '',
      isSystem: false
    });
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTagForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle system flag toggle
  const handleSystemToggle = (checked: boolean) => {
    setTagForm(prev => ({
      ...prev,
      isSystem: checked
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTagMutation.mutate(tagForm);
  };
  
  // Handle edit form submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTag) {
      updateTagMutation.mutate({ id: selectedTag.id, tag: tagForm });
    }
  };
  
  // Open edit dialog
  const openEditDialog = (tag: ContactTag) => {
    setSelectedTag(tag);
    setTagForm({
      name: tag.name,
      color: tag.color,
      description: tag.description || '',
      isSystem: tag.isSystem
    });
    setIsEditDialogOpen(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (tag: ContactTag) => {
    setSelectedTag(tag);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedTag) {
      deleteTagMutation.mutate(selectedTag.id);
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/contacts')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Contacts
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contact Tags</h1>
            <p className="text-muted-foreground">
              Manage tags for categorizing contacts in the system.
            </p>
          </div>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Tag
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tag Management</CardTitle>
          <CardDescription>
            Tags help categorize and filter contacts based on their roles or characteristics.
            System tags are used by the application and cannot be deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTagsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : tagsError ? (
            <div className="text-center py-8 text-destructive">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Error loading tags. Please try again later.</p>
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">No tags found</h3>
              <p className="text-muted-foreground">
                Create your first tag to start organizing contacts.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Create Tag
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
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
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 mr-2 rounded-full"
                            style={{ backgroundColor: tag.color || '#888888' }}
                          />
                          <span className="font-medium">{tag.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {tag.description || <span className="text-muted-foreground">No description</span>}
                      </TableCell>
                      <TableCell>
                        {tag.isSystem ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-md">
                            System
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                            Custom
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(tag)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() => openDeleteDialog(tag)}
                                    disabled={tag.isSystem}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TooltipTrigger>
                              {tag.isSystem && (
                                <TooltipContent>
                                  System tags cannot be deleted
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create Tag Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Add a new tag for categorizing contacts.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tag Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={tagForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Tag Color</Label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="color" 
                    id="color"
                    name="color"
                    value={tagForm.color}
                    onChange={handleInputChange}
                    className="w-10 h-10 border-0 p-0 cursor-pointer"
                  />
                  <Input
                    value={tagForm.color}
                    onChange={handleInputChange}
                    name="color"
                    maxLength={7}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={tagForm.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isSystem"
                  checked={tagForm.isSystem}
                  onCheckedChange={handleSystemToggle}
                />
                <Label htmlFor="isSystem">System Tag</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTagMutation.isPending}>
                {createTagMutation.isPending ? 'Creating...' : 'Create Tag'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Tag Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update the properties of this tag.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tag Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={tagForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-color">Tag Color</Label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="color" 
                    id="edit-color"
                    name="color"
                    value={tagForm.color}
                    onChange={handleInputChange}
                    className="w-10 h-10 border-0 p-0 cursor-pointer"
                  />
                  <Input
                    value={tagForm.color}
                    onChange={handleInputChange}
                    name="color"
                    maxLength={7}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={tagForm.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isSystem"
                  checked={tagForm.isSystem}
                  onCheckedChange={handleSystemToggle}
                  disabled={selectedTag?.isSystem}
                />
                <Label htmlFor="edit-isSystem" className={selectedTag?.isSystem ? 'text-muted-foreground' : ''}>
                  System Tag
                  {selectedTag?.isSystem && <span className="ml-2 text-xs">(Cannot be changed)</span>}
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateTagMutation.isPending}>
                {updateTagMutation.isPending ? 'Updating...' : 'Update Tag'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tag
              "{selectedTag?.name}" and remove it from all associated contacts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTagMutation.isPending ? 'Deleting...' : 'Delete Tag'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}