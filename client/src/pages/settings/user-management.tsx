import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { User } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, UserPlus, Edit, Users, Settings, Shield, KeyRound, CreditCard } from 'lucide-react';

const userRoleOptions = [
  { value: 'developer', label: 'Developer', description: 'Platform-level access to all organizations' },
  { value: 'admin', label: 'Admin', description: 'Organization-level administrator access' },
  { value: 'field_officer', label: 'Field Officer', description: 'Manages host employers and apprentices' },
  { value: 'host_employer', label: 'Host Employer', description: 'Access to manage assigned apprentices' },
  { value: 'apprentice', label: 'Apprentice', description: 'Limited access to own profile and training' },
  { value: 'rto', label: 'RTO/TAFE', description: 'Access to update training results' },
];

const userFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().email('Please enter a valid email'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  role: z.string(),
  organizationId: z.number().optional(),
  isActive: z.boolean().default(true),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}

const UserRow = ({ user, onEdit, onDelete }: UserRowProps) => {
  return (
    <TableRow key={user.id}>
      <TableCell className="font-medium">{user.username}</TableCell>
      <TableCell>{user.firstName} {user.lastName}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Badge variant={user.role === 'developer' ? 'default' : 
               user.role === 'admin' ? 'secondary' : 
               'outline'}>
          {user.role}
        </Badge>
      </TableCell>
      <TableCell>
        {user.organizationId ? user.organizationId : 'Platform-wide'}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(user.id)}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </TableCell>
    </TableRow>
  );
};

const UserManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  
  // User form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'apprentice',
      isActive: true,
    },
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormValues) => {
      const response = await apiRequest('POST', '/api/users', userData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      form.reset();
      setIsUserDialogOpen(false);
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create user: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<UserFormValues> & { id: number }) => {
      const { id, ...data } = userData;
      const response = await apiRequest('PATCH', `/api/users/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      form.reset();
      setSelectedUser(null);
      setIsUserDialogOpen(false);
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update user: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('DELETE', `/api/users/${userId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete user: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: UserFormValues) => {
    if (selectedUser) {
      // Only include password in update if it was changed
      const updateData: Partial<UserFormValues> & { id: number } = {
        id: selectedUser.id,
        ...data,
      };
      
      if (!data.password) {
        delete updateData.password;
      }
      
      updateUserMutation.mutate(updateData);
    } else {
      createUserMutation.mutate(data);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    form.reset({
      username: user.username,
      password: '', // Don't pre-fill password
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId || undefined,
      isActive: user.isActive || true,
    });
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleAddNewUser = () => {
    setSelectedUser(null);
    form.reset({
      username: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'apprentice',
      isActive: true,
    });
    setIsUserDialogOpen(true);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">User & Access Management</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" /> Users
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" /> Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="access">
            <KeyRound className="h-4 w-4 mr-2" /> Access Controls
          </TabsTrigger>
          <TabsTrigger value="subscriptions">
            <CreditCard className="h-4 w-4 mr-2" /> Subscription Plans
          </TabsTrigger>
        </TabsList>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>User Management</span>
                <Button onClick={handleAddNewUser}>
                  <UserPlus className="h-4 w-4 mr-2" /> Add New User
                </Button>
              </CardTitle>
              <CardDescription>
                Manage users and their account settings. Assign roles and organization access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Active users in the system</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : users && users.length > 0 ? (
                    users.map((user) => (
                      <UserRow 
                        key={user.id} 
                        user={user} 
                        onEdit={handleEditUser} 
                        onDelete={handleDeleteUser} 
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No users found. Add a new user to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Roles & Permissions Tab */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Roles & Permissions</span>
                <div>
                  <Button variant="outline" className="mr-2" onClick={() => setIsPermissionDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Permission
                  </Button>
                  <Button onClick={() => setIsRoleDialogOpen(true)}>
                    <Shield className="h-4 w-4 mr-2" /> Add Role
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Manage roles and their permissions. Configure what users can access in the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4">Available Roles</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>System Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Role management is under development. You'll be able to create custom roles with specific permissions here.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <h3 className="text-lg font-semibold mt-8 mb-4">Available Permissions</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Permission management is under development. You'll be able to define granular permissions here.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Access Controls Tab */}
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Access Controls</CardTitle>
              <CardDescription>
                Configure organization-specific access controls and field officer assignments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This page is under development. Soon you'll be able to configure organization-specific access 
                controls and field officer assignments here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Subscription Plans Tab */}
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>
                Manage available subscription plans and their features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This page is under development. Soon you'll be able to create and manage subscription plans 
                with Stripe integration here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {selectedUser ? 'Edit user details below.' : 'Fill in the user details to create a new account.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{selectedUser ? 'New Password (leave blank to keep current)' : 'Password'}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userRoleOptions.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {userRoleOptions.find(r => r.value === field.value)?.description || ''}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Active Account
                      </FormLabel>
                      <FormDescription>
                        Inactive accounts cannot log in to the system
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                  {(createUserMutation.isPending || updateUserMutation.isPending) ? 'Saving...' : selectedUser ? 'Update User' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Role Dialog placeholder */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role and its permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Role management functionality coming soon. This will allow creating and managing custom roles with specific permissions.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsRoleDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Permission Dialog placeholder */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Permission</DialogTitle>
            <DialogDescription>
              Define a new permission that can be assigned to roles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Permission management functionality coming soon. This will allow creating granular permissions for different resources.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPermissionDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
