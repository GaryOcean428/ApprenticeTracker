import { Button, ButtonProps } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { ReactNode } from 'react';

interface ActionButtonProps extends ButtonProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * A button that is conditionally rendered based on user permissions
 * 
 * @param permission A single permission to check
 * @param permissions Multiple permissions to check
 * @param requireAll Whether all permissions are required (defaults to false)
 * @param fallback Content to show when user lacks permission
 * @param children Button contents
 * @param ...props Other button props
 */
export function ActionButton({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  children,
  ...props
}: ActionButtonProps) {
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
  
  // Otherwise, render the button
  return <Button {...props}>{children}</Button>;
}
