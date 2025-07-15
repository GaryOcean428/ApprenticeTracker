/**
 * Permission utility functions for checking user access rights
 */

/**
 * Defines the available user roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  ORGANIZATION_ADMIN = 'organization_admin',
  FIELD_OFFICER = 'field_officer',
  HOST_EMPLOYER = 'host_employer',
  APPRENTICE = 'apprentice',
  RTO_ADMIN = 'rto_admin',
}

/**
 * Defines the available permissions in the system
 */
export enum Permission {
  // Admin permissions
  MANAGE_USERS = 'manage:users',
  MANAGE_ROLES = 'manage:roles',
  MANAGE_SYSTEM = 'manage:system',
  MANAGE_ORGANIZATIONS = 'manage:organizations',

  // Dashboard permissions
  VIEW_DASHBOARD = 'view:dashboard',
  VIEW_ANALYTICS = 'view:analytics',

  // Apprentice permissions
  VIEW_APPRENTICES = 'view:apprentices',
  MANAGE_APPRENTICES = 'manage:apprentices',
  CREATE_APPRENTICE = 'create:apprentice',
  EDIT_APPRENTICE = 'edit:apprentice',
  DELETE_APPRENTICE = 'delete:apprentice',
  ARCHIVE_APPRENTICE = 'archive:apprentice',

  // Host permissions
  VIEW_HOSTS = 'view:hosts',
  MANAGE_HOSTS = 'manage:hosts',
  CREATE_HOST = 'create:host',
  EDIT_HOST = 'edit:host',
  DELETE_HOST = 'delete:host',

  // Contract permissions
  VIEW_CONTRACTS = 'view:contracts',
  MANAGE_CONTRACTS = 'manage:contracts',
  CREATE_CONTRACT = 'create:contract',
  EDIT_CONTRACT = 'edit:contract',
  DELETE_CONTRACT = 'delete:contract',

  // Placement permissions
  VIEW_PLACEMENTS = 'view:placements',
  MANAGE_PLACEMENTS = 'manage:placements',
  CREATE_PLACEMENT = 'create:placement',
  EDIT_PLACEMENT = 'edit:placement',
  DELETE_PLACEMENT = 'delete:placement',

  // Timesheet permissions
  VIEW_TIMESHEETS = 'view:timesheets',
  MANAGE_TIMESHEETS = 'manage:timesheets',
  SUBMIT_TIMESHEETS = 'submit:timesheets',
  APPROVE_TIMESHEETS = 'approve:timesheets',

  // Document permissions
  VIEW_DOCUMENTS = 'view:documents',
  MANAGE_DOCUMENTS = 'manage:documents',
  UPLOAD_DOCUMENT = 'upload:document',
  DELETE_DOCUMENT = 'delete:document',

  // GTO Compliance permissions
  VIEW_COMPLIANCE = 'view:compliance',
  MANAGE_COMPLIANCE = 'manage:compliance',

  // Reporting permissions
  VIEW_REPORTS = 'view:reports',
  GENERATE_REPORT = 'generate:report',
  EXPORT_DATA = 'export:data',
}

/**
 * Role-permission mapping that defines which permissions each role has
 */
const rolePermissions: Record<string, string[]> = {
  // Admin has all permissions
  [UserRole.ADMIN]: Object.values(Permission),

  // Developer has all permissions (for development/testing)
  [UserRole.DEVELOPER]: Object.values(Permission),

  // Organization Admin can manage their organization
  [UserRole.ORGANIZATION_ADMIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_APPRENTICES,
    Permission.MANAGE_APPRENTICES,
    Permission.CREATE_APPRENTICE,
    Permission.EDIT_APPRENTICE,
    Permission.ARCHIVE_APPRENTICE,
    Permission.VIEW_HOSTS,
    Permission.MANAGE_HOSTS,
    Permission.CREATE_HOST,
    Permission.EDIT_HOST,
    Permission.VIEW_CONTRACTS,
    Permission.MANAGE_CONTRACTS,
    Permission.CREATE_CONTRACT,
    Permission.EDIT_CONTRACT,
    Permission.VIEW_PLACEMENTS,
    Permission.MANAGE_PLACEMENTS,
    Permission.CREATE_PLACEMENT,
    Permission.EDIT_PLACEMENT,
    Permission.VIEW_TIMESHEETS,
    Permission.MANAGE_TIMESHEETS,
    Permission.APPROVE_TIMESHEETS,
    Permission.VIEW_DOCUMENTS,
    Permission.MANAGE_DOCUMENTS,
    Permission.UPLOAD_DOCUMENT,
    Permission.VIEW_COMPLIANCE,
    Permission.MANAGE_COMPLIANCE,
    Permission.VIEW_REPORTS,
    Permission.GENERATE_REPORT,
    Permission.EXPORT_DATA,
  ],

  // Field Officer can perform apprentice-related activities
  [UserRole.FIELD_OFFICER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_APPRENTICES,
    Permission.EDIT_APPRENTICE,
    Permission.VIEW_HOSTS,
    Permission.VIEW_CONTRACTS,
    Permission.VIEW_PLACEMENTS,
    Permission.VIEW_TIMESHEETS,
    Permission.APPROVE_TIMESHEETS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENT,
    Permission.VIEW_COMPLIANCE,
    Permission.VIEW_REPORTS,
  ],

  // Host Employer can view apprentices & approve timesheets
  [UserRole.HOST_EMPLOYER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_APPRENTICES,
    Permission.VIEW_PLACEMENTS,
    Permission.VIEW_TIMESHEETS,
    Permission.APPROVE_TIMESHEETS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENT,
  ],

  // Apprentice can view their own data & submit timesheets
  [UserRole.APPRENTICE]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CONTRACTS,
    Permission.VIEW_PLACEMENTS,
    Permission.VIEW_TIMESHEETS,
    Permission.SUBMIT_TIMESHEETS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENT,
  ],

  // RTO Admin can view training data and upload evidence
  [UserRole.RTO_ADMIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_APPRENTICES,
    Permission.VIEW_CONTRACTS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENT,
  ],
};

/**
 * Check if a role has a specific permission
 *
 * @param role The user role to check
 * @param permission The permission to check for
 * @returns boolean indicating if the role has the permission
 */
export function checkPermission(role: string, permission: string): boolean {
  // Admin and Developer roles have all permissions
  if (role === UserRole.ADMIN || role === UserRole.DEVELOPER) {
    return true;
  }

  // Check if the role exists in our mapping
  if (!rolePermissions[role]) {
    return false;
  }

  // Check if the role has the specific permission
  return rolePermissions[role].includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 *
 * @param role The user role to check
 * @param permissions Array of permissions to check
 * @returns boolean indicating if the role has any of the permissions
 */
export function checkAnyPermission(role: string, permissions: string[]): boolean {
  // Admin and Developer roles have all permissions
  if (role === UserRole.ADMIN || role === UserRole.DEVELOPER) {
    return true;
  }

  // Check if the role exists in our mapping
  if (!rolePermissions[role]) {
    return false;
  }

  // Check if the role has any of the specified permissions
  return permissions.some(permission => rolePermissions[role].includes(permission));
}

/**
 * Check if a role has all of the specified permissions
 *
 * @param role The user role to check
 * @param permissions Array of permissions to check
 * @returns boolean indicating if the role has all of the permissions
 */
export function checkAllPermissions(role: string, permissions: string[]): boolean {
  // Admin and Developer roles have all permissions
  if (role === UserRole.ADMIN || role === UserRole.DEVELOPER) {
    return true;
  }

  // Check if the role exists in our mapping
  if (!rolePermissions[role]) {
    return false;
  }

  // Check if the role has all of the specified permissions
  return permissions.every(permission => rolePermissions[role].includes(permission));
}
