import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * A component that conditionally renders its children based on user permissions
 *
 * @param permission A single permission to check
 * @param permissions Multiple permissions to check
 * @param requireAll Whether all permissions are required (defaults to false)
 * @param fallback Content to show when user lacks permission
 * @param children Content to show when user has permission
 */
export function PermissionGuard({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { can, canAny, canAll } = usePermissions();

  // Check if the user has the required permissions
  let hasAccess = true;

  if (permission) {
    hasAccess = can(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  }

  // If the user doesn't have access, show the fallback or nothing
  if (!hasAccess) {
    return <>{fallback}</>;
  }

  // Otherwise, render the children
  return <>{children}</>;
}
