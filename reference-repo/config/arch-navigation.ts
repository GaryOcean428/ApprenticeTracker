import { Home, User, Building, Shield, DollarSign, BarChart, Lock } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface ArchNavItem {
  key: string;
  title: string;
  href: string;
  allowedRoles?: string[];
}

export interface ArchNavSection {
  key: string;
  title: string;
  href: string;
  icon: LucideIcon;
  allowedRoles?: string[];
  items?: ArchNavItem[];
}

// This configuration is aligned with the architecture documentation.
// Note that allowedRoles is optional. If omitted the item is always visible.
export const ARCH_NAV_SECTIONS: ArchNavSection[] = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    allowedRoles: ['admin', 'user', 'manager'],
    items: [] // Additional dashboard links can be added here if needed.
  },
  {
    key: 'apprentice',
    title: 'Apprentice Management',
    href: '/apprentice',
    icon: User,
    allowedRoles: ['admin', 'training'],
    items: [
      { key: 'profile', title: 'Profile Management', href: '/apprentice/profile', allowedRoles: ['admin', 'training'] },
      { key: 'training-contracts', title: 'Training Contracts', href: '/apprentice/training-contracts', allowedRoles: ['admin', 'training'] },
      { key: 'progress', title: 'Progress Monitoring', href: '/apprentice/progress', allowedRoles: ['admin', 'training'] },
      { key: 'documents', title: 'Document Management', href: '/apprentice/documents', allowedRoles: ['admin', 'training'] },
    ]
  },
  {
    key: 'host',
    title: 'Host Management',
    href: '/host',
    icon: Building,
    allowedRoles: ['admin', 'host'],
    items: [
      { key: 'companies', title: 'Company Profiles', href: '/host/companies', allowedRoles: ['admin', 'host'] },
      { key: 'placements', title: 'Placement Management', href: '/host/placements', allowedRoles: ['admin', 'host'] },
      { key: 'safety', title: 'Safety Compliance', href: '/host/safety', allowedRoles: ['admin', 'host'] },
      { key: 'finance', title: 'Financial Arrangements', href: '/host/finance', allowedRoles: ['admin', 'host'] },
      { key: 'capacity', title: 'Capacity Tracking', href: '/host/capacity', allowedRoles: ['admin', 'host'] },
    ]
  },
  {
    key: 'compliance',
    title: 'Compliance System',
    href: '/compliance',
    icon: Shield,
    allowedRoles: ['admin', 'compliance'],
    items: [
      { key: 'doc-storage', title: 'Document Storage', href: '/compliance/document-storage', allowedRoles: ['admin', 'compliance'] },
      { key: 'monitoring', title: 'Automated Monitoring', href: '/compliance/monitoring', allowedRoles: ['admin', 'compliance'] },
      { key: 'alerts', title: 'Alert System', href: '/compliance/alerts', allowedRoles: ['admin', 'compliance'] },
      { key: 'audit', title: 'Audit Trail', href: '/compliance/audit', allowedRoles: ['admin', 'compliance'] },
      { key: 'reporting', title: 'Regulatory Reporting', href: '/compliance/reporting', allowedRoles: ['admin', 'compliance'] },
    ]
  },
  {
    key: 'financial',
    title: 'Financial Operations',
    href: '/financial',
    icon: DollarSign,
    allowedRoles: ['admin', 'finance'],
    items: [
      { key: 'timesheets', title: 'Timesheet Processing', href: '/financial/timesheets', allowedRoles: ['admin', 'finance'] },
      { key: 'awards', title: 'Award Interpretation', href: '/financial/awards', allowedRoles: ['admin', 'finance'] },
      { key: 'payroll', title: 'Payroll Integration', href: '/financial/payroll', allowedRoles: ['admin', 'finance'] },
      { key: 'billing', title: 'Host Billing', href: '/financial/billing', allowedRoles: ['admin', 'finance'] },
      { key: 'government', title: 'Government Funding', href: '/financial/government', allowedRoles: ['admin', 'finance'] },
    ]
  },
  {
    key: 'analytics',
    title: 'Analytics & Reporting',
    href: '/analytics',
    icon: BarChart,
    allowedRoles: ['admin', 'analytics'],
    items: [
      { key: 'operational', title: 'Operational Metrics', href: '/analytics/operational', allowedRoles: ['admin', 'analytics'] },
      { key: 'compliance-reporting', title: 'Compliance Reporting', href: '/analytics/compliance', allowedRoles: ['admin', 'analytics'] },
      { key: 'financial-analytics', title: 'Financial Analytics', href: '/analytics/financial', allowedRoles: ['admin', 'analytics'] },
      { key: 'performance', title: 'Performance Tracking', href: '/analytics/performance', allowedRoles: ['admin', 'analytics'] },
      { key: 'government-reporting', title: 'Government Reporting', href: '/analytics/government', allowedRoles: ['admin', 'analytics'] },
    ]
  },
  {
    key: 'access',
    title: 'Access Control',
    href: '/access',
    icon: Lock,
    allowedRoles: ['admin'],
    items: [
      { key: 'role-auth', title: 'Role-based Authentication', href: '/access/role-auth', allowedRoles: ['admin'] },
      { key: 'multi-tenant', title: 'Multi-tenant Security', href: '/access/multi-tenant', allowedRoles: ['admin'] },
      { key: 'permissions', title: 'Document Permissions', href: '/access/permissions', allowedRoles: ['admin'] },
      { key: 'audit-logging', title: 'Audit Logging', href: '/access/audit-logging', allowedRoles: ['admin'] },
      { key: 'communication', title: 'Communication System', href: '/access/communication', allowedRoles: ['admin'] },
    ]
  },
];
