import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { userRolesQuery, userOrganizationsQuery } from './supabase-utils';
import { SupabaseClient } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'manager' | 'user';

/**
 * Check if the current user has a specific role
 * This is cached within a request to avoid duplicate database calls
 */
export const hasRole = cache(async (role: UserRole, request: Request): Promise<boolean> => {
  const supabase = await createClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  // Check user metadata first (faster)
  if (user.app_metadata?.roles && Array.isArray(user.app_metadata.roles)) {
    return user.app_metadata.roles.includes(role);
  }
  
  try {
    // Try first with RPC if it's available
    try {
      const { data, error } = await supabase
        .rpc('has_role', { 
          p_user_id: user.id, 
          p_role: role 
        });
      
      if (!error) return !!data;
    } catch {
      // RPC might not exist, continue with direct query
    }
    
    // If RPC fails or not available, use our typed query helper
    const typedSupabase = supabase as unknown as SupabaseClient<import('@/lib/database.types').Database>;
    const query = userRolesQuery(typedSupabase);
    
    const { data, error } = await query
      .select('role')
      .eq('user_id', user.id)
      .eq('role', role)
      .maybeSingle();
      
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
});

/**
 * Get all roles for the current user
 * This is cached within a request to avoid duplicate database calls
 */
export const getUserRoles = cache(async (request: Request): Promise<UserRole[]> => {
  const supabase = await createClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  // Check user metadata first (faster)
  if (user.app_metadata?.roles && Array.isArray(user.app_metadata.roles)) {
    return user.app_metadata.roles as UserRole[];
  }
  
  try {
    // Try first with RPC if it's available
    try {
      const rpcResult = await supabase
        .rpc('get_user_roles', { p_user_id: user.id });
      
      if (!rpcResult.error && rpcResult.data) {
        // Cast the data to array of objects with role property
        const roleData = rpcResult.data as { role: string }[];
        return roleData.map((r: { role: string }) => r.role as UserRole);
      }
    } catch {
      // RPC might not exist, continue with direct query
    }
    
    // Fallback to direct query if RPC not available
    const res = await supabase.from('user_roles')
      .select('role') as unknown as { 
        data: { role: string }[] | null; 
        error: unknown 
      };
    
    if (res.error) throw res.error;
    
    return Array.isArray(res.data) ? res.data.map((r: { role: string }) => r.role as UserRole) : [];
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
});

/**
 * Get organizations the user belongs to
 * This is cached within a request to avoid duplicate database calls
 */
export const getUserOrganizations = cache(async (request: Request) => {
  const supabase = await createClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  try {
    // Using any is necessary here to bridge the gap between the DB schema and the client
    const typedSupabase = supabase as unknown as SupabaseClient<import('@/lib/database.types').Database>;
    const query = userOrganizationsQuery(typedSupabase);
    const { data, error } = await query
      .select('organization_id, organization:organizations(name)')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    return [];
  }
});

/**
 * Require user to be authenticated and redirect if not
 */
export async function requireAuth(request: Request) {
  const supabase = await createClient(request);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/login');
  }
  
  return user;
}

/**
 * Require a specific role and redirect if user doesn't have it
 */
export async function requireRole(role: UserRole | UserRole[], request: Request) {
  const user = await requireAuth(request);
  const roles = Array.isArray(role) ? role : [role];

  const hasRequiredRole = await Promise.all(
    roles.map(r => hasRole(r, request))
  ).then(results => results.some(Boolean));

  if (!hasRequiredRole) {
    redirect('/unauthorized');
  }

  return user;
}
