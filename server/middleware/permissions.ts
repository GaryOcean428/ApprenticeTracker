import type { Request, Response, NextFunction } from 'express';

/**
 * Authentication middleware to ensure the user is logged in
 *
 * @returns Middleware function
 */
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  // If no user is attached to the request, they're not authenticated
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  next();
}

/**
 * Permission check middleware to ensure the user has the required permission on a resource
 *
 * @param action The action being performed (e.g. 'read', 'update', 'delete')
 * @param resource The resource being accessed (e.g. 'award', 'classification')
 * @returns Middleware function
 */
export function requirePermission(action: string, resource: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    // If no user is attached to the request, they're not authenticated
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Developer role has all permissions
    if (user.role === 'developer') {
      return next();
    }

    // Format the permission string
    const permission = `${action}:${resource}`;

    // Check if the user's role has the required permission
    const hasAccess = checkPermission(user.role, permission);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
}

/**
 * Middleware to check if the user has the required permission
 *
 * @param permission The permission to check
 * @returns Middleware function
 */
export function hasPermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    // If no user is attached to the request, they're not authenticated
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Developer role has all permissions
    if (user.role === 'developer') {
      return next();
    }

    // Check if the user's role has the required permission
    // This would ideally query a permissions database or cache
    const hasAccess = checkPermission(user.role, permission);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
}

/**
 * Check if a role has a specific permission
 *
 * @param role The user role
 * @param permission The permission to check
 * @returns boolean indicating if the role has the permission
 */
function checkPermission(role: string, permission: string): boolean {
  // Define role permissions - this would ideally come from a database
  const permissions: Record<string, string[]> = {
    admin: ['*'], // Admin has all permissions
    developer: ['*'], // Developer has all permissions
    organization_admin: [
      'view:dashboard',
      'view:apprentices',
      'manage:apprentices',
      'view:hosts',
      'manage:hosts',
      'view:contracts',
      'manage:contracts',
      'view:placements',
      'manage:placements',
      'view:field_officers',
      'manage:field_officers',
      'view:activities',
      'manage:activities',
      'view:compliance',
      'manage:compliance',
      'view:documents',
      'manage:documents',
      'view:timesheets',
      'manage:timesheets',
      'view:reports',
      'generate:reports',
      'view:vet_qualifications',
      'view:fair_work',
      'read:award',
      'update:award',
      'view:organization_settings',
      'manage:users',
      // Labour hire worker permissions
      'read:labour_hire_worker',
      'create:labour_hire_worker',
      'update:labour_hire_worker',
      'delete:labour_hire_worker',
      'read:labour_hire_placement',
      'create:labour_hire_placement',
      'update:labour_hire_placement',
      'delete:labour_hire_placement',
      'read:labour_hire_timesheet',
      'create:labour_hire_timesheet',
      'update:labour_hire_timesheet',
      'approve:labour_hire_timesheet',
      'read:labour_hire_worker_document',
      'create:labour_hire_worker_document',
      'verify:labour_hire_worker_document',
    ],
    field_officer: [
      'view:dashboard',
      'view:apprentices',
      'view:hosts',
      'view:contracts',
      'view:placements',
      'view:activities',
      'manage:activities',
      'view:compliance',
      'manage:compliance',
      'view:documents',
      'manage:documents',
      'view:timesheets',
      'manage:timesheets',
      'view:reports',
      'view:vet_qualifications',
      'view:fair_work',
      'read:award',
      // Labour hire worker permissions
      'read:labour_hire_worker',
      'create:labour_hire_worker',
      'update:labour_hire_worker',
      'read:labour_hire_placement',
      'create:labour_hire_placement',
      'update:labour_hire_placement',
      'read:labour_hire_timesheet',
      'create:labour_hire_timesheet',
      'update:labour_hire_timesheet',
      'approve:labour_hire_timesheet',
      'read:labour_hire_worker_document',
      'create:labour_hire_worker_document',
      'verify:labour_hire_worker_document',
    ],
    host_employer: [
      'view:dashboard',
      'view:apprentices',
      'view:contracts',
      'view:placements',
      'view:activities',
      'view:compliance',
      'view:documents',
      'upload:documents',
      'view:timesheets',
      'approve:timesheets',
      'view:vet_qualifications',
      'read:award',
      // Labour hire worker permissions (limited)
      'read:labour_hire_worker',
      'read:labour_hire_placement',
      'read:labour_hire_timesheet',
      'approve:labour_hire_timesheet',
      'read:labour_hire_worker_document',
    ],
    apprentice: [
      'view:dashboard',
      'view:contracts',
      'view:placements',
      'view:activities',
      'view:documents',
      'upload:documents',
      'view:timesheets',
      'submit:timesheets',
      'view:vet_qualifications',
      'view:fair_work',
      'read:award',
    ],
    rto_admin: [
      'view:dashboard',
      'view:apprentices',
      'view:vet_qualifications',
      'manage:vet_qualifications',
      'view:documents',
      'manage:documents',
      'read:award',
    ],
    labour_hire_worker: [
      'view:dashboard',
      'view:documents',
      'upload:documents',
      'view:timesheets',
      'submit:timesheets',
      'view:fair_work',
      'read:award',
      // Labour hire specific permissions
      'read:labour_hire_placement',
      'read:labour_hire_timesheet',
      'create:labour_hire_timesheet',
      'update:labour_hire_timesheet',
      'read:labour_hire_worker_document',
      'create:labour_hire_worker_document',
    ],
  };

  // If the role doesn't exist in our permissions map
  if (!permissions[role]) {
    return false;
  }

  // Check for wildcard permission
  if (permissions[role].includes('*')) {
    return true;
  }

  // Check for specific permission
  return permissions[role].includes(permission);
}

/**
 * Middleware to check if the user has any of the required permissions
 *
 * @param permissionList Array of permissions to check
 * @returns Middleware function
 */
export function hasAnyPermission(permissionList: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    // If no user is attached to the request, they're not authenticated
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Developer role has all permissions
    if (user.role === 'developer') {
      return next();
    }

    // Check if the user has any of the required permissions
    const hasAccess = permissionList.some(permission => checkPermission(user.role, permission));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
}
