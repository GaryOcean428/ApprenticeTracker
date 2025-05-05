import { ActionButton } from '@/components/ui/action-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { usePermissions } from '@/hooks/use-permissions';
import { UserRole } from '@/lib/permissions';
import { useAuth } from '@/hooks/use-auth';

/**
 * A demonstration page showing how the permission system works
 */
export default function PermissionsDemo() {
  const { user } = useAuth();
  const { can, canAny, canAll } = usePermissions();
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Permissions System Demo</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current User</CardTitle>
          <CardDescription>Information about the current user and their role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div><strong>Username:</strong> {user?.username}</div>
            <div><strong>Role:</strong> {user?.role}</div>
            <div><strong>Email:</strong> {user?.email}</div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Simple Permission Checks */}
        <Card>
          <CardHeader>
            <CardTitle>Simple Permission Checks</CardTitle>
            <CardDescription>Using the usePermissions hook directly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium mb-2">Can view dashboard?</div>
              <div className={`px-3 py-1 rounded-full inline-block ${can('view:dashboard') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {can('view:dashboard') ? 'Yes' : 'No'}
              </div>
            </div>
            
            <div>
              <div className="font-medium mb-2">Can manage hosts?</div>
              <div className={`px-3 py-1 rounded-full inline-block ${can('manage:hosts') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {can('manage:hosts') ? 'Yes' : 'No'}
              </div>
            </div>
            
            <div>
              <div className="font-medium mb-2">Can view or manage apprentices?</div>
              <div className={`px-3 py-1 rounded-full inline-block ${canAny(['view:apprentices', 'manage:apprentices']) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {canAny(['view:apprentices', 'manage:apprentices']) ? 'Yes' : 'No'}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Permission-Based UI */}
        <Card>
          <CardHeader>
            <CardTitle>Permission-Based UI</CardTitle>
            <CardDescription>UI elements conditionally rendered based on permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium mb-2">ActionButton Component</div>
              <div className="space-x-2">
                <ActionButton permission="view:hosts" variant="secondary">
                  View Hosts
                </ActionButton>
                
                <ActionButton permission="manage:hosts" variant="default">
                  Manage Hosts
                </ActionButton>
                
                <ActionButton permissions={['view:apprentices', 'manage:apprentices']} variant="outline">
                  Apprentices
                </ActionButton>
              </div>
            </div>
            
            <div>
              <div className="font-medium mb-2">PermissionGuard Component</div>
              <div className="space-y-2">
                <PermissionGuard permission="view:dashboard">
                  <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                    This content is only visible to users with dashboard access
                  </div>
                </PermissionGuard>
                
                <PermissionGuard permission="manage:system" fallback={
                  <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                    You need system management permission to view this content
                  </div>
                }>
                  <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                    This content requires system management permission
                  </div>
                </PermissionGuard>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Role-Specific Content</CardTitle>
          <CardDescription>Content tailored to specific user roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Admin Content */}
            <PermissionGuard permission="manage:users">
              <Card>
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-700">Admin Tools</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm mb-4">Administrative tools for system management</p>
                  <Button className="w-full" variant="outline">User Management</Button>
                </CardContent>
              </Card>
            </PermissionGuard>
            
            {/* Field Officer Content */}
            <PermissionGuard permission="view:apprentices">
              <Card>
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-700">Field Officer Tools</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm mb-4">Tools for managing apprentices and visits</p>
                  <Button className="w-full" variant="outline">Schedule Visits</Button>
                </CardContent>
              </Card>
            </PermissionGuard>
            
            {/* Host Employer Content */}
            <PermissionGuard permission="approve:timesheets">
              <Card>
                <CardHeader className="bg-amber-50">
                  <CardTitle className="text-amber-700">Host Employer Tools</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm mb-4">Tools for host employers to manage apprentices</p>
                  <Button className="w-full" variant="outline">Approve Timesheets</Button>
                </CardContent>
              </Card>
            </PermissionGuard>
            
            {/* Apprentice Content */}
            <PermissionGuard permission="submit:timesheets">
              <Card>
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-purple-700">Apprentice Tools</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm mb-4">Tools for apprentices to manage their work</p>
                  <Button className="w-full" variant="outline">Submit Timesheet</Button>
                </CardContent>
              </Card>
            </PermissionGuard>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
