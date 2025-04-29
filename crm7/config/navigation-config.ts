import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboardIcon,
  GraduationCapIcon,
  ShieldAlertIcon,
  DollarSignIcon,
  UsersIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  ClipboardCheckIcon,
  SettingsIcon,
  FileTextIcon,
  BellIcon,
  HelpCircleIcon,
  CalendarIcon,
} from 'lucide-react';

export type UserRole = 'admin' | 'manager' | 'staff' | 'apprentice' | 'host';

export interface NavItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  roles?: UserRole[];
  children?: NavItem[];
}

export interface CoreSection {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  roles: UserRole[];
  items: NavItem[];
}

export const CORE_SECTIONS: CoreSection[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboardIcon,
    description: 'Overview and quick access to key features',
    roles: ['admin', 'manager', 'staff', 'apprentice', 'host'],
    items: [
      {
        title: 'Overview',
        href: '/dashboard',
        roles: ['admin', 'manager', 'staff', 'apprentice', 'host'],
      },
      {
        title: 'Reports',
        href: '/dashboard/reports',
        roles: ['admin', 'manager', 'staff'],
      },
      {
        title: 'Analytics',
        href: '/dashboard/analytics',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    id: 'training',
    title: 'Training & Development',
    icon: GraduationCapIcon,
    description: 'Manage training programs and professional development',
    roles: ['admin', 'manager', 'staff'],
    items: [
      {
        title: 'Programs',
        href: '/training/programs',
        roles: ['admin', 'manager', 'staff'],
      },
      {
        title: 'Assessments',
        href: '/training/assessments',
        roles: ['admin', 'manager', 'staff'],
      },
      {
        title: 'Resources',
        href: '/training/resources',
        roles: ['admin', 'manager', 'staff'],
      },
    ],
  },
  {
    id: 'safety',
    title: 'Safety & WHS',
    icon: ShieldAlertIcon,
    description: 'Workplace health and safety management',
    roles: ['admin', 'manager', 'staff'],
    items: [
      {
        title: 'Incidents',
        href: '/safety/incidents',
        roles: ['admin', 'manager', 'staff'],
      },
      {
        title: 'Risk Assessments',
        href: '/safety/risk-assessments',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Safety Documents',
        href: '/safety/documents',
        roles: ['admin', 'manager', 'staff'],
      },
    ],
  },
  {
    id: 'payroll',
    title: 'Payroll & Finance',
    icon: DollarSignIcon,
    description: 'Manage payroll and financial operations',
    roles: ['admin', 'manager'],
    items: [
      {
        title: 'Payroll',
        href: '/payroll',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Invoicing',
        href: '/payroll/invoicing',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Reports',
        href: '/payroll/reports',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    id: 'hr',
    title: 'Human Resources',
    icon: UsersIcon,
    description: 'Manage employees and HR operations',
    roles: ['admin', 'manager'],
    items: [
      {
        title: 'Employees',
        href: '/hr/employees',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Recruitment',
        href: '/hr/recruitment',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Performance',
        href: '/hr/performance',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    id: 'clients',
    title: 'Client Management',
    icon: BriefcaseIcon,
    description: 'Manage client relationships and contracts',
    roles: ['admin', 'manager', 'staff'],
    items: [
      {
        title: 'Clients',
        href: '/clients',
        roles: ['admin', 'manager', 'staff'],
      },
      {
        title: 'Contracts',
        href: '/clients/contracts',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Opportunities',
        href: '/clients/opportunities',
        roles: ['admin', 'manager', 'staff'],
      },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing & Sales',
    icon: TrendingUpIcon,
    description: 'Manage marketing campaigns and sales',
    roles: ['admin', 'manager', 'staff'],
    items: [
      {
        title: 'Campaigns',
        href: '/marketing/campaigns',
        roles: ['admin', 'manager', 'staff'],
      },
      {
        title: 'Leads',
        href: '/marketing/leads',
        roles: ['admin', 'manager', 'staff'],
      },
      {
        title: 'Analytics',
        href: '/marketing/analytics',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance & Quality',
    icon: ClipboardCheckIcon,
    description: 'Manage compliance requirements and quality standards',
    roles: ['admin', 'manager'],
    items: [
      {
        title: 'Overview',
        href: '/compliance',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Documents',
        href: '/compliance/documents',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Audits',
        href: '/compliance/audits',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Reports',
        href: '/compliance/reports',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    id: 'system',
    title: 'System',
    icon: SettingsIcon,
    description: 'System settings and utilities',
    roles: ['admin', 'manager', 'staff'],
    items: [
      {
        title: 'Documents',
        href: '/documents',
        icon: FileTextIcon,
        roles: ['admin', 'manager', 'staff'],
      },
      {
        title: 'Calendar',
        href: '/calendar',
        icon: CalendarIcon,
        roles: ['admin', 'manager', 'staff'],
      },
      {
        title: 'Notifications',
        href: '/notifications',
        icon: BellIcon,
        roles: ['admin', 'manager', 'staff'],
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: SettingsIcon,
        roles: ['admin', 'manager'],
      },
      {
        title: 'Help',
        href: '/help',
        icon: HelpCircleIcon,
        roles: ['admin', 'manager', 'staff', 'apprentice', 'host'],
      },
    ],
  },
];
