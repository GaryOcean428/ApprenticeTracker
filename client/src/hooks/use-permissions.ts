import { useAuth } from '@/hooks/use-auth';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissions';

/**
 * Custom hook for checking user permissions
 * 
 * @returns Object with permission checking functions
 */
export function usePermissions() {
  const { user } = useAuth();
  
  /**
   * Check if the current user has a specific permission
   * 
   * @param permission The permission to check
   * @returns boolean indicating if the user has the permission
   */
  const can = (permission: string): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };
  
  /**
   * Check if the current user has any of the specified permissions
   * 
   * @param permissions Array of permissions to check
   * @returns boolean indicating if the user has any of the permissions
   */
  const canAny = (permissions: string[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissions);
  };
  
  /**
   * Check if the current user has all of the specified permissions
   * 
   * @param permissions Array of permissions to check
   * @returns boolean indicating if the user has all of the permissions
   */
  const canAll = (permissions: string[]): boolean => {
    if (!user) return false;
    return hasAllPermissions(user.role, permissions);
  };
  
  /**
   * Check if the current user cannot perform a specific action
   * 
   * @param permission The permission to check
   * @returns boolean indicating if the user lacks the permission
   */
  const cannot = (permission: string): boolean => {
    return !can(permission);
  };
  
  return {
    can,
    canAny,
    canAll,
    cannot,
  };
}
