import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Plus, Pencil, Trash2, Check, X, Filter, FileDown, FileUp } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  category: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Role {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  createdAt: Date;
  updatedAt: Date;
  role?: Role;
  permission?: Permission;
}

const permissionFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  resource: z.string().min(2, { message: 'Resource is required' }),
  action: z.string().min(2, { message: 'Action is required' }),
  category: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

type PermissionFormValues = z.infer<typeof permissionFormSchema>;

const roleFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().nullable().optional(),
  isSystem: z.boolean().default(false),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

const PermissionRow = ({ permission, onEdit, onDelete }: { 
  permission: Permission;
  onEdit: (permission: Permission) => void;
  onDelete: (id: number) => void;
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{permission.name}</TableCell>
      <TableCell>
        <Badge variant="outline">{permission.resource}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{permission.action}</Badge>
      </TableCell>
      <TableCell>{permission.category || 'General'}</TableCell>
      <TableCell>{permission.description || '-'}</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => onEdit(permission)}>
          <Pencil className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(permission.id)}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </TableCell>
    </TableRow>
  );
};

const RoleRow = ({ role, onEdit, onDelete, onManagePermissions }: { 
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
  onManagePermissions: (role: Role) => void;
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{role.name}</TableCell>
      <TableCell>{role.description || '-'}</TableCell>
      <TableCell>
        {role.isSystem ? (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">System</Badge>
        ) : (
          <Badge variant="outline">Custom</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => onManagePermissions(role)}>
          <Shield className="h-4 w-4 mr-1" /> Permissions
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(role)}>
          <Pencil className="h-4 w-4 mr-1" /> Edit
        </Button>
        {!role.isSystem && (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(role.id)}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

const PermissionsManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('permissions');
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

  // Fetch role permissions when a role is selected
  const { data: rolePermissionsData, refetch: refetchRolePermissions } = useQuery<Permission[]>({
    queryKey: ['/api/roles', selectedRole?.id, 'permissions'],
    enabled: !!selectedRole,
  });

  // Update role permissions in state when data changes
  useEffect(() => {
    if (rolePermissionsData) {
      setRolePermissions(rolePermissionsData);
    }
  }, [rolePermissionsData]);

  // Create permission mutation
  const createPermissionMutation = useMutation({
    mutationFn: async (data: PermissionFormValues) => {
      const response = await apiRequest('POST', '/api/permissions', data);
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
    mutationFn: async (data: PermissionFormValues & { id: number }) => {
      const { id, ...permissionData } = data;
      const response = await apiRequest('PATCH', `/api/permissions/${id}`, permissionData);
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
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/permissions/${id}`);
      return await response.json();
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
    mutationFn: async (data: RoleFormValues) => {
      const response = await apiRequest('POST', '/api/roles', data);
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
    mutationFn: async (data: RoleFormValues & { id: number }) => {
      const { id, ...roleData } = data;
      const response = await apiRequest('PATCH', `/api/roles/${id}`, roleData);
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
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/roles/${id}`);
      return await response.json();
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

  // Update role permissions mutation
  const updateRolePermissionsMutation = useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) => {
      const response = await apiRequest('POST', `/api/roles/${roleId}/permissions`, { permissionIds });
      return await response.json();
    },
    onSuccess: () => {
      if (selectedRole) {
        queryClient.invalidateQueries({ queryKey: ['/api/roles', selectedRole.id, 'permissions'] });
      }
      setIsRolePermissionsDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Role permissions updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update role permissions: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmitPermission = (data: PermissionFormValues) => {
    if (selectedPermission) {
      updatePermissionMutation.mutate({ ...data, id: selectedPermission.id });
    } else {
      createPermissionMutation.mutate(data);
    }
  };

  const handleSubmitRole = (data: RoleFormValues) => {
    if (selectedRole) {
      updateRoleMutation.mutate({ ...data, id: selectedRole.id });
    } else {
      createRoleMutation.mutate(data);
    }
  };

  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    permissionForm.reset({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      category: permission.category || '',
      description: permission.description || '',
    });
    setIsPermissionDialogOpen(true);
  };

  const handleDeletePermission = (id: number) => {
    if (confirm('Are you sure you want to delete this permission?')) {
      deletePermissionMutation.mutate(id);
    }
  };

  const handleAddNewPermission = () => {
    setSelectedPermission(null);
    permissionForm.reset({
      name: '',
      resource: '',
      action: '',
      category: '',
      description: '',
    });
    setIsPermissionDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    roleForm.reset({
      name: role.name,
      description: role.description || '',
      isSystem: role.isSystem || false,
    });
    setIsRoleDialogOpen(true);
  };

  const handleDeleteRole = (id: number) => {
    if (confirm('Are you sure you want to delete this role?')) {
      deleteRoleMutation.mutate(id);
    }
  };

  const handleAddNewRole = () => {
    setSelectedRole(null);
    roleForm.reset({
      name: '',
      description: '',
      isSystem: false,
    });
    setIsRoleDialogOpen(true);
  };

  const handleManageRolePermissions = (role: Role) => {
    setSelectedRole(role);
    refetchRolePermissions();
    setIsRolePermissionsDialogOpen(true);
  };

  const handleSaveRolePermissions = () => {
    if (!selectedRole) return;
    
    const selectedPermissionIds = rolePermissions.map(p => p.id);
    updateRolePermissionsMutation.mutate({
      roleId: selectedRole.id,
      permissionIds: selectedPermissionIds,
    });
  };

  const togglePermissionForRole = (permission: Permission) => {
    const isSelected = rolePermissions.some(p => p.id === permission.id);
    
    if (isSelected) {
      setRolePermissions(rolePermissions.filter(p => p.id !== permission.id));
    } else {
      setRolePermissions([...rolePermissions, permission]);
    }
  };

  const isPermissionSelected = (permission: Permission) => {
    return rolePermissions.some(p => p.id === permission.id);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Permissions Management</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="permissions">
            <Shield className="h-4 w-4 mr-2" /> Permissions
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" /> Roles
          </TabsTrigger>
        </TabsList>
        
        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>System Permissions</span>
                <Button onClick={handleAddNewPermission}>
                  <Plus className="h-4 w-4 mr-2" /> Add New Permission
                </Button>
              </CardTitle>
              <CardDescription>
                Manage system permissions that can be assigned to roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search permissions..."
                    className="w-64"
                  />
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileDown className="h-4 w-4 mr-2" /> Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileUp className="h-4 w-4 mr-2" /> Import
                  </Button>
                </div>
              </div>
              
              <Table>
                <TableCaption>List of system permissions</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPermissions ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading permissions...
                      </TableCell>
                    </TableRow>
                  ) : permissions && permissions.length > 0 ? (
                    permissions.map((permission) => (
                      <PermissionRow
                        key={permission.id}
                        permission={permission}
                        onEdit={handleEditPermission}
                        onDelete={handleDeletePermission}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No permissions found. Add your first permission to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Roles Tab */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>System Roles</span>
                <Button onClick={handleAddNewRole}>
                  <Plus className="h-4 w-4 mr-2" /> Add New Role
                </Button>
              </CardTitle>
              <CardDescription>
                Manage roles and their assigned permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search roles..."
                    className="w-64"
                  />
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileDown className="h-4 w-4 mr-2" /> Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileUp className="h-4 w-4 mr-2" /> Import
                  </Button>
                </div>
              </div>
              
              <Table>
                <TableCaption>List of system roles</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
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
                    roles.map((role) => (
                      <RoleRow
                        key={role.id}
                        role={role}
                        onEdit={handleEditRole}
                        onDelete={handleDeleteRole}
                        onManagePermissions={handleManageRolePermissions}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No roles found. Add your first role to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Permission Form Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedPermission ? 'Edit Permission' : 'Add New Permission'}</DialogTitle>
            <DialogDescription>
              {selectedPermission
                ? 'Update the details of an existing permission'
                : 'Create a new permission in the system'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...permissionForm}>
            <form onSubmit={permissionForm.handleSubmit(handleSubmitPermission)} className="space-y-4">
              <FormField
                control={permissionForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., View Users" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this permission
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={permissionForm.control}
                  name="resource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., users" {...field} />
                      </FormControl>
                      <FormDescription>
                        The entity this permission applies to
                      </FormDescription>
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
                        <Input placeholder="e.g., view" {...field} />
                      </FormControl>
                      <FormDescription>
                        The operation allowed by this permission
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={permissionForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., User Management" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>
                      Group similar permissions together
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
                      <Input placeholder="Describe what this permission allows" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>
                      A clear explanation of what this permission does
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedPermission ? 'Update Permission' : 'Create Permission'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Role Form Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
            <DialogDescription>
              {selectedRole
                ? 'Update the details of an existing role'
                : 'Create a new role in the system'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...roleForm}>
            <form onSubmit={roleForm.handleSubmit(handleSubmitRole)} className="space-y-4">
              <FormField
                control={roleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Content Editor" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this role
                    </FormDescription>
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
                      <Input placeholder="Describe this role's responsibilities" {...field} value={field.value || ''} />
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
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        System Role
                      </FormLabel>
                      <FormDescription>
                        System roles cannot be deleted and are essential for application functionality
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedRole ? 'Update Role' : 'Create Role'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Role Permissions Dialog */}
      <Dialog open={isRolePermissionsDialogOpen} onOpenChange={setIsRolePermissionsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Manage Permissions for {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              Select the permissions to assign to this role. Users with this role will inherit all these permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Select</TableHead>
                  <TableHead>Permission</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPermissions ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Loading permissions...
                    </TableCell>
                  </TableRow>
                ) : permissions && permissions.length > 0 ? (
                  permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <Checkbox
                          checked={isPermissionSelected(permission)}
                          onCheckedChange={() => togglePermissionForRole(permission)}
                        />
                      </TableCell>
                      <TableCell>{permission.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{permission.resource}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{permission.action}</Badge>
                      </TableCell>
                      <TableCell>{permission.category || 'General'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No permissions available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsRolePermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRolePermissions}>
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermissionsManagement;