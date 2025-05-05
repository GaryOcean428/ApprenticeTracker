// Permission utility for role-based access control

/**
 * User roles in the system
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
 * Permission map defining what actions each role can perform
 */
export const rolePermissions: Record<string, string[]> = {
  // Developer has all permissions
  [UserRole.DEVELOPER]: ['*'],
  
  // Admin has all permissions except developer-specific ones
  [UserRole.ADMIN]: [
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
    'manage:vet_qualifications',
    'view:fair_work',
    'manage:fair_work',
    'view:organization_settings',
    'manage:organization_settings',
    'manage:users',
  ],
  
  // Organization admin can manage their organization
  [UserRole.ORGANIZATION_ADMIN]: [
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
    'view:organization_settings',
    'manage:users',
  ],
  
  // Field officer permissions
  [UserRole.FIELD_OFFICER]: [
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
  ],
  
  // Host employer permissions
  [UserRole.HOST_EMPLOYER]: [
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
  ],
  
  // Apprentice permissions
  [UserRole.APPRENTICE]: [
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
  ],
  
  // RTO admin permissions
  [UserRole.RTO_ADMIN]: [
    'view:dashboard',
    'view:apprentices',
    'view:vet_qualifications',
    'manage:vet_qualifications',
    'view:documents',
    'manage:documents',
  ],
};

/**
 * Check if a user has a specific permission
 * @param userRole The user's role
 * @param permission The permission to check
 * @returns boolean indicating if the user has the permission
 */
export function hasPermission(userRole: string, permission: string): boolean {
  // If user role doesn't exist in our map, they have no permissions
  if (!rolePermissions[userRole]) {
    return false;
  }
  
  // Developer and wildcard permissions grant access to everything
  if (userRole === UserRole.DEVELOPER || rolePermissions[userRole].includes('*')) {
    return true;
  }
  
  // Check if the user's role permissions include the specified permission
  return rolePermissions[userRole].includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 * @param userRole The user's role
 * @param permissions Array of permissions to check
 * @returns boolean indicating if the user has any of the permissions
 */
export function hasAnyPermission(userRole: string, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if a user has all of the specified permissions
 * @param userRole The user's role
 * @param permissions Array of permissions to check
 * @returns boolean indicating if the user has all of the permissions
 */
export function hasAllPermissions(userRole: string, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}
