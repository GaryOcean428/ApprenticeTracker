import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission, UserRole } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertCircle,
  CheckCircle,
  Info,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react';

export default function PermissionsDemo() {
  const { user } = useAuth();
  const { can, canAny, canAll, cannot } = usePermissions();
  const [selectedPermission, setSelectedPermission] = useState<string>(Permission.VIEW_DASHBOARD);
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || UserRole.APPRENTICE);
  const [multiplePermissions, setMultiplePermissions] = useState<string[]>([
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_APPRENTICES,
  ]);
  const [requireAll, setRequireAll] = useState<boolean>(false);

  // Group permissions by category
  const permissionCategories = {
    Admin: [
      Permission.MANAGE_USERS,
      Permission.MANAGE_ROLES,
      Permission.MANAGE_SYSTEM,
      Permission.MANAGE_ORGANIZATIONS,
    ],
    Dashboard: [Permission.VIEW_DASHBOARD, Permission.VIEW_ANALYTICS],
    Apprentices: [
      Permission.VIEW_APPRENTICES,
      Permission.MANAGE_APPRENTICES,
      Permission.CREATE_APPRENTICE,
      Permission.EDIT_APPRENTICE,
      Permission.DELETE_APPRENTICE,
      Permission.ARCHIVE_APPRENTICE,
    ],
    Hosts: [
      Permission.VIEW_HOSTS,
      Permission.MANAGE_HOSTS,
      Permission.CREATE_HOST,
      Permission.EDIT_HOST,
      Permission.DELETE_HOST,
    ],
    Contracts: [
      Permission.VIEW_CONTRACTS,
      Permission.MANAGE_CONTRACTS,
      Permission.CREATE_CONTRACT,
      Permission.EDIT_CONTRACT,
      Permission.DELETE_CONTRACT,
    ],
    Placements: [
      Permission.VIEW_PLACEMENTS,
      Permission.MANAGE_PLACEMENTS,
      Permission.CREATE_PLACEMENT,
      Permission.EDIT_PLACEMENT,
      Permission.DELETE_PLACEMENT,
    ],
    Timesheets: [
      Permission.VIEW_TIMESHEETS,
      Permission.MANAGE_TIMESHEETS,
      Permission.SUBMIT_TIMESHEETS,
      Permission.APPROVE_TIMESHEETS,
    ],
    Documents: [
      Permission.VIEW_DOCUMENTS,
      Permission.MANAGE_DOCUMENTS,
      Permission.UPLOAD_DOCUMENT,
      Permission.DELETE_DOCUMENT,
    ],
    Compliance: [Permission.VIEW_COMPLIANCE, Permission.MANAGE_COMPLIANCE],
    Reports: [Permission.VIEW_REPORTS, Permission.GENERATE_REPORT, Permission.EXPORT_DATA],
  };

  // Update selected role when user changes
  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

  // Toggle a permission in the multiple permissions list
  const togglePermission = (permission: string) => {
    if (multiplePermissions.includes(permission)) {
      setMultiplePermissions(multiplePermissions.filter(p => p !== permission));
    } else {
      setMultiplePermissions([...multiplePermissions, permission]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions Demo</h1>
          <p className="text-muted-foreground mt-2">
            Explore and test the permission system for different user roles.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <UserCog className="h-5 w-5 text-muted-foreground" />
          <span>Current User Role: </span>
          <Badge variant="outline" className="font-mono">
            {user?.role || 'Not logged in'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="single">
        <TabsList>
          <TabsTrigger value="single">Single Permission</TabsTrigger>
          <TabsTrigger value="multiple">Multiple Permissions</TabsTrigger>
          <TabsTrigger value="components">UI Components</TabsTrigger>
        </TabsList>

        {/* Single Permission Testing */}
        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Single Permission</CardTitle>
              <CardDescription>
                Check if a specific role has a particular permission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Select Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(UserRole).map(role => (
                          <SelectItem key={role} value={role}>
                            {role.replace('_', ' ').charAt(0).toUpperCase() +
                              role.replace('_', ' ').slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="permission">Select Permission</Label>
                    <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                      <SelectTrigger id="permission">
                        <SelectValue placeholder="Select a permission" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(permissionCategories).map(([category, permissions]) => (
                          <div key={category}>
                            <div className="px-2 py-1.5 text-sm font-semibold">{category}</div>
                            {permissions.map(permission => (
                              <SelectItem key={permission} value={permission}>
                                {permission.replace(':', ': ')}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  {can(selectedPermission) ? (
                    <Alert
                      variant="default"
                      className="border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-900"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <AlertTitle className="flex gap-2 items-center text-green-800 dark:text-green-300">
                        Permission Granted
                      </AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-400">
                        Users with the{' '}
                        <Badge variant="outline" className="font-mono">
                          {selectedRole}
                        </Badge>{' '}
                        role can <strong>{selectedPermission.replace(':', ': ')}</strong>.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <ShieldAlert className="h-5 w-5" />
                      <AlertTitle className="flex gap-2 items-center">Permission Denied</AlertTitle>
                      <AlertDescription>
                        Users with the{' '}
                        <Badge variant="outline" className="font-mono">
                          {selectedRole}
                        </Badge>{' '}
                        role cannot <strong>{selectedPermission.replace(':', ': ')}</strong>.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multiple Permissions Testing */}
        <TabsContent value="multiple" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Multiple Permissions</CardTitle>
              <CardDescription>
                Check if a role has any or all of a set of permissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="multiRole">Select Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger id="multiRole">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(UserRole).map(role => (
                          <SelectItem key={role} value={role}>
                            {role.replace('_', ' ').charAt(0).toUpperCase() +
                              role.replace('_', ' ').slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Permissions</Label>
                    <div className="border rounded-md p-4 space-y-4 max-h-[300px] overflow-y-auto">
                      {Object.entries(permissionCategories).map(([category, permissions]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="text-sm font-semibold">{category}</h4>
                          <div className="space-y-1">
                            {permissions.map(permission => (
                              <div key={permission} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`permission-${permission}`}
                                  checked={multiplePermissions.includes(permission)}
                                  onChange={() => togglePermission(permission)}
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor={`permission-${permission}`} className="text-sm">
                                  {permission.replace(':', ': ')}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Permission Logic</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant={requireAll ? 'outline' : 'default'}
                        onClick={() => setRequireAll(false)}
                      >
                        Any Permission (OR)
                      </Button>
                      <Button
                        variant={requireAll ? 'default' : 'outline'}
                        onClick={() => setRequireAll(true)}
                      >
                        All Permissions (AND)
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  {requireAll ? (
                    canAll(multiplePermissions) ? (
                      <Alert
                        variant="default"
                        className="border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-900"
                      >
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <AlertTitle className="flex gap-2 items-center text-green-800 dark:text-green-300">
                          All Permissions Granted
                        </AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-400">
                          Users with the{' '}
                          <Badge variant="outline" className="font-mono">
                            {selectedRole}
                          </Badge>{' '}
                          role have <strong>all {multiplePermissions.length}</strong> selected
                          permissions.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <ShieldAlert className="h-5 w-5" />
                        <AlertTitle className="flex gap-2 items-center">
                          Not All Permissions Granted
                        </AlertTitle>
                        <AlertDescription>
                          Users with the{' '}
                          <Badge variant="outline" className="font-mono">
                            {selectedRole}
                          </Badge>{' '}
                          role do not have all {multiplePermissions.length} selected permissions.
                        </AlertDescription>
                      </Alert>
                    )
                  ) : canAny(multiplePermissions) ? (
                    <Alert
                      variant="default"
                      className="border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-900"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <AlertTitle className="flex gap-2 items-center text-green-800 dark:text-green-300">
                        Some Permissions Granted
                      </AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-400">
                        Users with the{' '}
                        <Badge variant="outline" className="font-mono">
                          {selectedRole}
                        </Badge>{' '}
                        role have at least one of the {multiplePermissions.length} selected
                        permissions.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <ShieldAlert className="h-5 w-5" />
                      <AlertTitle className="flex gap-2 items-center">
                        No Permissions Granted
                      </AlertTitle>
                      <AlertDescription>
                        Users with the{' '}
                        <Badge variant="outline" className="font-mono">
                          {selectedRole}
                        </Badge>{' '}
                        role don't have any of the {multiplePermissions.length} selected
                        permissions.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UI Components Testing */}
        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission-Based UI Components</CardTitle>
              <CardDescription>
                Test the PermissionGuard and ActionButton components that conditionally render based
                on permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">PermissionGuard Component</h3>
                    <p className="text-sm text-muted-foreground">
                      Only renders its children if the user has the required permission.
                    </p>

                    <div className="rounded-md border p-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Admin Permission Example:</Label>
                        <div className="p-3 bg-muted rounded-md">
                          <PermissionGuard permission={Permission.MANAGE_USERS}>
                            <div className="flex items-center gap-2 text-green-600">
                              <UserCog className="h-5 w-5" />
                              <span>
                                This content is only visible to users with the{' '}
                                <code className="text-xs bg-muted-foreground/20 rounded p-1">
                                  manage:users
                                </code>{' '}
                                permission.
                              </span>
                            </div>
                          </PermissionGuard>

                          <PermissionGuard
                            permission={Permission.MANAGE_USERS}
                            fallback={
                              <div className="flex items-center gap-2 text-destructive">
                                <Lock className="h-5 w-5" />
                                <span>You don't have permission to manage users.</span>
                              </div>
                            }
                          >
                            <div></div>
                          </PermissionGuard>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Multiple Permissions Example:</Label>
                        <div className="p-3 bg-muted rounded-md">
                          <PermissionGuard
                            permissions={[Permission.VIEW_APPRENTICES, Permission.VIEW_HOSTS]}
                            requireAll={false}
                          >
                            <div className="flex items-center gap-2 text-green-600">
                              <Users className="h-5 w-5" />
                              <span>
                                This content is visible to users with EITHER{' '}
                                <code className="text-xs bg-muted-foreground/20 rounded p-1">
                                  view:apprentices
                                </code>{' '}
                                OR{' '}
                                <code className="text-xs bg-muted-foreground/20 rounded p-1">
                                  view:hosts
                                </code>{' '}
                                permission.
                              </span>
                            </div>
                          </PermissionGuard>

                          <PermissionGuard
                            permissions={[Permission.MANAGE_APPRENTICES, Permission.MANAGE_HOSTS]}
                            requireAll={true}
                            fallback={
                              <div className="flex items-center gap-2 text-amber-600 mt-3">
                                <Info className="h-5 w-5" />
                                <span>
                                  You need both apprentice AND host management permissions to see
                                  this content.
                                </span>
                              </div>
                            }
                          >
                            <div className="flex items-center gap-2 text-green-600 mt-3">
                              <Shield className="h-5 w-5" />
                              <span>You have both apprentice AND host management permissions.</span>
                            </div>
                          </PermissionGuard>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">ActionButton Component</h3>
                    <p className="text-sm text-muted-foreground">
                      Button that only renders if the user has the required permission.
                    </p>

                    <div className="rounded-md border p-4 space-y-6">
                      <div className="space-y-3">
                        <Label>Single Permission Buttons:</Label>
                        <div className="flex flex-wrap gap-3">
                          <ActionButton
                            permission={Permission.CREATE_APPRENTICE}
                            label="Add Apprentice"
                            variant="default"
                          />

                          <ActionButton
                            permission={Permission.EDIT_APPRENTICE}
                            label="Edit Apprentice"
                            variant="outline"
                          />

                          <ActionButton
                            permission={Permission.DELETE_APPRENTICE}
                            label="Delete Apprentice"
                            variant="destructive"
                          />

                          <ActionButton
                            permission={Permission.APPROVE_TIMESHEETS}
                            label="Approve Timesheet"
                            variant="secondary"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Multiple Permission Buttons:</Label>
                        <div className="flex flex-wrap gap-3">
                          <ActionButton
                            permissions={[Permission.CREATE_HOST, Permission.EDIT_HOST]}
                            requireAll={false} // Either permission works
                            label="Manage Host"
                            variant="default"
                          />

                          <ActionButton
                            permissions={[
                              Permission.MANAGE_SYSTEM,
                              Permission.MANAGE_ORGANIZATIONS,
                            ]}
                            requireAll={true} // Both permissions required
                            label="Advanced Settings"
                            variant="outline"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Role-specific Buttons:</Label>
                        <div className="space-y-2">
                          <div>
                            <Badge className="mb-2">Admin Only</Badge>
                            <div className="flex flex-wrap gap-3">
                              <ActionButton
                                permission={Permission.MANAGE_SYSTEM}
                                label="System Configuration"
                                variant="destructive"
                              />
                            </div>
                          </div>

                          <div>
                            <Badge className="mb-2">Field Officer</Badge>
                            <div className="flex flex-wrap gap-3">
                              <ActionButton
                                permission={Permission.APPROVE_TIMESHEETS}
                                label="Review Timesheets"
                                variant="secondary"
                              />
                            </div>
                          </div>

                          <div>
                            <Badge className="mb-2">Apprentice</Badge>
                            <div className="flex flex-wrap gap-3">
                              <ActionButton
                                permission={Permission.SUBMIT_TIMESHEETS}
                                label="Submit Timesheet"
                                variant="default"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
