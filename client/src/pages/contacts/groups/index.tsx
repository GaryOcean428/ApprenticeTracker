import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { SkeletonTable } from "@/components/skeleton-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Users2Icon as UserGroupIcon, 
  UsersIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserPlusIcon 
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Define type for contact group
type ContactGroup = {
  id: number;
  name: string;
  description: string | null;
  organizationId: number | null;
  isPrivate: boolean;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
  };
};

// Form schema for creating/editing a group
const groupFormSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

export default function ContactGroupsPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Fetch contact groups
  const { data: groups, isLoading } = useQuery<ContactGroup[]>({
    queryKey: ['/api/contacts/groups'],
  });

  // Form for adding new group
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
    },
  });

  // Mutation for adding new group
  const addGroupMutation = useMutation({
    mutationFn: async (values: GroupFormValues) => {
      const res = await apiRequest("POST", "/api/contacts/groups", values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts/groups'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Contact group created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create contact group: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a group
  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contacts/groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts/groups'] });
      toast({
        title: "Success",
        description: "Contact group deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete contact group: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: GroupFormValues) => {
    addGroupMutation.mutate(values);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this contact group?")) {
      deleteGroupMutation.mutate(id);
    }
  };
  
  return (
    <DashboardShell>
      <PageHeader
        heading="Contact Groups"
        description="Manage and organize your contacts in groups"
      >
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Contact Group</DialogTitle>
              <DialogDescription>
                Add a new group to organize your contacts
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Apprentice Coordinators" {...field} />
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
                          placeholder="Describe the purpose of this group..." 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* <FormField
                  control={form.control}
                  name="isPrivate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel>Private Group</FormLabel>
                        <FormDescription>
                          Private groups are only visible to you
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                /> */}
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={addGroupMutation.isPending}>
                    {addGroupMutation.isPending ? "Creating..." : "Create Group"}
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
          <>
            {groups && groups.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                  <Card key={group.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{group.name}</CardTitle>
                        <UserGroupIcon className="h-5 w-5 text-primary" />
                      </div>
                      <CardDescription>
                        {group.description || "No description provided"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm">
                        <UsersIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {group._count?.members || 0} members
                        </span>
                      </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="pt-3 flex justify-between">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/contacts/groups/${group.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/contacts/groups/${group.id}/edit`}>
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(group.id)}
                          disabled={deleteGroupMutation.isPending}
                        >
                          <TrashIcon className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Contact Groups Found</CardTitle>
                  <CardDescription>
                    You haven't created any contact groups yet
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <UserGroupIcon className="h-20 w-20 text-muted-foreground/30 mb-4" />
                  <p className="text-center text-muted-foreground mb-4">
                    Contact groups help you organize and manage your contacts more efficiently.
                    Create your first group to get started.
                  </p>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="w-full max-w-xs"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create Your First Group
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
      
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Add Contacts to Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Organize your contacts by adding them to relevant groups
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/contacts">
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Manage Contacts
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Tag Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create and assign tags to better categorize your contacts
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/contacts/tags">
                  <span className="mr-2">#</span>
                  Manage Tags
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Report Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate reports based on contact groups and interactions
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/reports/contacts">
                  Generate Reports
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}