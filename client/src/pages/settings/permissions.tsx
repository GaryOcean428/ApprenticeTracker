import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PlusCircle, Trash2, Edit, Shield, Lock, Layers } from 'lucide-react';

// Define types based on schema
interface Role {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  action: string;
  resource: string;
  createdAt: string;
  updatedAt: string;
}

// Form schemas
const permissionFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  resource: z.string().min(2, 'Resource is required'),
  action: z.string().min(2, 'Action is required'),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const roleFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional().nullable(),
  isSystem: z.boolean().default(false),
});

type PermissionFormValues = z.infer<typeof permissionFormSchema>;
type RoleFormValues = z.infer<typeof roleFormSchema>;

const PermissionsManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('roles');
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isRolePermissionsDialogOpen, setIsRolePermissionsDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);

  // Permission form
  const permissionForm = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: '',
      resource: '',
      action: '',
      category: '',
      description: '',
    },
  });

  // Role form
  const roleForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      isSystem: false,
    },
  });

  // Fetch permissions
  const { data: permissions, isLoading: isLoadingPermissions } = useQuery<Permission[]>({
    queryKey: ['/api/permissions'],
  });

  // Fetch roles
  const { data: roles, isLoading: isLoadingRoles } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
  });

  // Create permission mutation
  const createPermissionMutation = useMutation({
    mutationFn: async (permissionData: PermissionFormValues) => {
      const response = await apiRequest('POST', '/api/permissions', permissionData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/permissions'] });
      permissionForm.reset();
      setIsPermissionDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Permission created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create permission: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async (data: { id: number; permissionData: PermissionFormValues }) => {
      const response = await apiRequest(
        'PATCH',
        `/api/permissions/${data.id}`,
        data.permissionData
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/permissions'] });
      permissionForm.reset();
      setSelectedPermission(null);
      setIsPermissionDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Permission updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update permission: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete permission mutation
  const deletePermissionMutation = useMutation({
    mutationFn: async (permissionId: number) => {
      await apiRequest('DELETE', `/api/permissions/${permissionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/permissions'] });
      toast({
        title: 'Success',
        description: 'Permission deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete permission: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: RoleFormValues) => {
      const response = await apiRequest('POST', '/api/roles', roleData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      roleForm.reset();
      setIsRoleDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Role created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create role: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: { id: number; roleData: RoleFormValues }) => {
      const response = await apiRequest('PATCH', `/api/roles/${data.id}`, data.roleData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      roleForm.reset();
      setSelectedRole(null);
      setIsRoleDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update role: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: number) => {
      await apiRequest('DELETE', `/api/roles/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      toast({
        title: 'Success',
        description: 'Role deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete role: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Fetch role permissions
  const fetchRolePermissions = async (roleId: number) => {
    try {
      const response = await apiRequest('GET', `/api/roles/${roleId}/permissions`);
      const permissions = await response.json();
      setRolePermissions(permissions);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch role permissions',
        variant: 'destructive',
      });
    }
  };

  // Assign permission to role mutation
  const assignPermissionMutation = useMutation({
    mutationFn: async (data: { roleId: number; permissionId: number }) => {
      const response = await apiRequest('POST', `/api/roles/${data.roleId}/permissions`, {
        permissionId: data.permissionId,
      });
      return await response.json();
    },
    onSuccess: () => {
      if (selectedRole) {
        fetchRolePermissions(selectedRole.id);
      }
      toast({
        title: 'Success',
        description: 'Permission assigned to role',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to assign permission: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Remove permission from role mutation
  const removePermissionMutation = useMutation({
    mutationFn: async (data: { roleId: number; permissionId: number }) => {
      await apiRequest('DELETE', `/api/roles/${data.roleId}/permissions/${data.permissionId}`);
    },
    onSuccess: () => {
      if (selectedRole) {
        fetchRolePermissions(selectedRole.id);
      }
      toast({
        title: 'Success',
        description: 'Permission removed from role',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to remove permission: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle form submissions
  const onPermissionSubmit = (data: PermissionFormValues) => {
    if (selectedPermission) {
      updatePermissionMutation.mutate({ id: selectedPermission.id, permissionData: data });
    } else {
      createPermissionMutation.mutate(data);
    }
  };

  const onRoleSubmit = (data: RoleFormValues) => {
    if (selectedRole) {
      updateRoleMutation.mutate({ id: selectedRole.id, roleData: data });
    } else {
      createRoleMutation.mutate(data);
    }
  };

  // Handle edit permission
  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    permissionForm.reset({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      category: permission.category,
      description: permission.description,
    });
    setIsPermissionDialogOpen(true);
  };

  // Handle delete permission
  const handleDeletePermission = (permissionId: number) => {
    if (confirm('Are you sure you want to delete this permission?')) {
      deletePermissionMutation.mutate(permissionId);
    }
  };

  // Handle edit role
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    roleForm.reset({
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
    });
    setIsRoleDialogOpen(true);
  };

  // Handle delete role
  const handleDeleteRole = (roleId: number) => {
    if (confirm('Are you sure you want to delete this role?')) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  // Handle open role permissions dialog
  const handleManageRolePermissions = (role: Role) => {
    setSelectedRole(role);
    fetchRolePermissions(role.id);
    setIsRolePermissionsDialogOpen(true);
  };

  // Handle assign permission to role
  const handleAssignPermission = (permissionId: number) => {
    if (!selectedRole) return;
    assignPermissionMutation.mutate({ roleId: selectedRole.id, permissionId });
  };

  // Handle remove permission from role
  const handleRemovePermission = (permissionId: number) => {
    if (!selectedRole) return;
    removePermissionMutation.mutate({ roleId: selectedRole.id, permissionId });
  };

  // Check if permission is assigned to role
  const isPermissionAssigned = (permissionId: number) => {
    return rolePermissions.some(permission => permission.id === permissionId);
  };

  // Render permission row
  const PermissionRow = ({ permission }: { permission: Permission }) => (
    <TableRow key={permission.id}>
      <TableCell className="font-medium">{permission.name}</TableCell>
      <TableCell>{permission.category || 'General'}</TableCell>
      <TableCell>
        <Badge variant="outline">{permission.action}</Badge>
      </TableCell>
      <TableCell>{permission.resource}</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => handleEditPermission(permission)}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => handleDeletePermission(permission.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </TableCell>
    </TableRow>
  );

  // Render role row
  const RoleRow = ({ role }: { role: Role }) => (
    <TableRow key={role.id}>
      <TableCell className="font-medium">{role.name}</TableCell>
      <TableCell>{role.description || '-'}</TableCell>
      <TableCell>
        {role.isSystem ? <Badge>System Role</Badge> : <Badge variant="outline">Custom Role</Badge>}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleManageRolePermissions(role)}
          className="mr-2"
        >
          <Lock className="h-4 w-4 mr-1" /> Permissions
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        {!role.isSystem && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => handleDeleteRole(role.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        )}
      </TableCell>
    </TableRow>
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Permissions Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" /> Roles
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Layers className="h-4 w-4 mr-2" /> Permissions
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Role Management</span>
                <Button
                  onClick={() => {
                    setSelectedRole(null);
                    roleForm.reset();
                    setIsRoleDialogOpen(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Add New Role
                </Button>
              </CardTitle>
              <CardDescription>
                Manage user roles and their associated permissions within the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of available roles</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingRoles ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        Loading roles...
                      </TableCell>
                    </TableRow>
                  ) : roles && roles.length > 0 ? (
                    roles.map(role => <RoleRow key={role.id} role={role} />)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No roles found. Add a new role to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Permission Management</span>
                <Button
                  onClick={() => {
                    setSelectedPermission(null);
                    permissionForm.reset();
                    setIsPermissionDialogOpen(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Add New Permission
                </Button>
              </CardTitle>
              <CardDescription>
                Define granular permissions that control access to system resources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of available permissions</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPermissions ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading permissions...
                      </TableCell>
                    </TableRow>
                  ) : permissions && permissions.length > 0 ? (
                    permissions.map(permission => (
                      <PermissionRow key={permission.id} permission={permission} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No permissions found. Add a new permission to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Permission Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedPermission ? 'Edit Permission' : 'Add New Permission'}
            </DialogTitle>
            <DialogDescription>
              {selectedPermission
                ? 'Update the permission details below'
                : 'Fill in the details to create a new permission'}
            </DialogDescription>
          </DialogHeader>
          <Form {...permissionForm}>
            <form onSubmit={permissionForm.handleSubmit(onPermissionSubmit)} className="space-y-4">
              <FormField
                control={permissionForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., view-users" {...field} />
                    </FormControl>
                    <FormDescription>A unique name for this permission</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={permissionForm.control}
                name="resource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., users" {...field} />
                    </FormControl>
                    <FormDescription>The resource that this permission applies to</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={permissionForm.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., read, create, update, delete" {...field} />
                    </FormControl>
                    <FormDescription>The action allowed on the resource</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={permissionForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., user-management"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional category to group related permissions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={permissionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Describe what this permission allows"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsPermissionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">{selectedPermission ? 'Update' : 'Create'} Permission</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
            <DialogDescription>
              {selectedRole
                ? 'Update the role details below'
                : 'Fill in the details to create a new role'}
            </DialogDescription>
          </DialogHeader>
          <Form {...roleForm}>
            <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-4">
              <FormField
                control={roleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Field Officer" {...field} />
                    </FormControl>
                    <FormDescription>A unique name for this role</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={roleForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Describe this role's responsibilities"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      A clear explanation of what users with this role can do
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={roleForm.control}
                name="isSystem"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>System Role</FormLabel>
                      <FormDescription>
                        System roles cannot be deleted and have special privileges
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsRoleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{selectedRole ? 'Update' : 'Create'} Role</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Role Permissions Dialog */}
      <Dialog open={isRolePermissionsDialogOpen} onOpenChange={setIsRolePermissionsDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Manage Permissions: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              Select permissions to assign to this role. Users with this role will inherit all
              assigned permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permission</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPermissions ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading permissions...
                    </TableCell>
                  </TableRow>
                ) : permissions && permissions.length > 0 ? (
                  permissions.map(permission => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.name}</TableCell>
                      <TableCell>{permission.resource}</TableCell>
                      <TableCell>{permission.action}</TableCell>
                      <TableCell className="text-right">
                        <Checkbox
                          checked={isPermissionAssigned(permission.id)}
                          onCheckedChange={checked => {
                            if (checked) {
                              handleAssignPermission(permission.id);
                            } else {
                              handleRemovePermission(permission.id);
                            }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No permissions available. Create permissions first.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsRolePermissionsDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermissionsManagement;
