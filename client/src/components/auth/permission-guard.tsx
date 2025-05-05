import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * A component that renders its children only if the current user has the required permissions
 * 
 * @param children The content to render if the user has permission
 * @param permission A single permission to check
 * @param permissions An array of permissions to check
 * @param requireAll If true, the user must have all permissions in the array. If false, having any is sufficient.
 * @param fallback Optional content to render if the user lacks permission
 */
export function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const { user } = useAuth();
  
  // If there's no user, they don't have any permissions
  if (!user) {
    return <>{fallback}</>;
  }
  
  // Handle the case when a single permission is provided
  if (permission && !permissions.length) {
    return hasPermission(user.role, permission) ? <>{children}</> : <>{fallback}</>;
  }
  
  // Handle the case when multiple permissions are provided
  if (permissions.length) {
    const hasPermissions = requireAll
      ? hasAllPermissions(user.role, permissions)
      : hasAnyPermission(user.role, permissions);
      
    return hasPermissions ? <>{children}</> : <>{fallback}</>;
  }
  
  // If no permissions were specified, render the children
  return <>{children}</>;
}
