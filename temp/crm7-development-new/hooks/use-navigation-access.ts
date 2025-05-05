import { useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/auth/context';
import type { CoreSection, NavItem, UserRole } from '@/config/navigation-config';

export function useNavigationAccess() {
  const { user } = useAuth();

  const userRoles = useMemo<UserRole[]>(() => {
    if (!user) return [];
    return (user.app_metadata?.roles as UserRole[]) || ['staff'];
  }, [user]);

  const hasAccess = useCallback((roles?: UserRole[]) => {
    if (!roles || roles.length === 0) return true;
    if (!user) return false;
    return roles.some(role => userRoles.includes(role));
  }, [user, userRoles]);

  const filterNavItems = useCallback((items: NavItem[]): NavItem[] => {
    return items.filter(item => hasAccess(item.roles)).map(item => ({
      ...item,
      children: item.children ? filterNavItems(item.children) : undefined,
    }));
  }, [hasAccess]);

  const filterCoreSections = useCallback((sections: CoreSection[]): CoreSection[] => {
    return sections.filter(section => hasAccess(section.roles)).map(section => ({
      ...section,
      items: filterNavItems(section.items),
    }));
  }, [hasAccess, filterNavItems]);

  return {
    hasAccess,
    filterNavItems,
    filterCoreSections,
    userRoles,
  };
}
