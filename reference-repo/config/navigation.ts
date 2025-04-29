import type { LucideIcon } from 'lucide-react';
import {
  HomeIcon,
  BookOpenIcon,
  ClipboardCheckIcon,
  AwardIcon,
  GraduationCapIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  FileTextIcon,
  ShieldAlertIcon,
  DollarSignIcon,
  UsersIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  BarChart2Icon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  slug?: string;
  label?: string;
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    slug: 'dashboard',
    label: 'Dashboard',
  },
  {
    title: 'Training & Development',
    href: '/training',
    icon: BookOpenIcon,
    slug: 'training',
    label: 'Training & Development',
  },
  {
    title: 'Safety & WHS',
    href: '/safety',
    icon: ShieldAlertIcon,
    slug: 'safety',
    label: 'Safety & WHS',
  },
  {
    title: 'Payroll & Finance',
    href: '/payroll',
    icon: DollarSignIcon,
    slug: 'payroll',
    label: 'Payroll & Finance',
  },
  {
    title: 'Human Resources',
    href: '/hr',
    icon: UsersIcon,
    slug: 'hr',
    label: 'Human Resources',
  },
  {
    title: 'Client Management',
    href: '/clients',
    icon: BriefcaseIcon,
    slug: 'clients',
    label: 'Client Management',
  },
  {
    title: 'Marketing & Sales',
    href: '/marketing',
    icon: TrendingUpIcon,
    slug: 'marketing',
    label: 'Marketing & Sales',
  },
  {
    title: 'Compliance & Quality',
    href: '/compliance',
    icon: FileTextIcon,
    slug: 'compliance',
    label: 'Compliance & Quality',
  },
  {
    title: 'Reports & Analytics',
    href: '/reports',
    icon: BarChart2Icon,
    slug: 'reports',
    label: 'Reports & Analytics',
  },
];

export const SECTIONS: NavSection[] = [
  {
    title: 'Training',
    items: [
      {
        title: 'Dashboard',
        href: '/training',
        icon: HomeIcon,
      },
      {
        title: 'Courses',
        href: '/training/courses',
        icon: BookOpenIcon,
      },
      {
        title: 'Assessments',
        href: '/training/assessments',
        icon: ClipboardCheckIcon,
      },
      {
        title: 'Certifications',
        href: '/training/certifications',
        icon: AwardIcon,
      },
      {
        title: 'Qualifications',
        href: '/training/qualifications',
        icon: GraduationCapIcon,
      },
      {
        title: 'Reports',
        href: '/training/reports',
        icon: ChartBarIcon,
      },
    ],
  },
  {
    title: 'Compliance',
    items: [
      {
        title: 'Overview',
        href: '/compliance',
        icon: ShieldCheckIcon,
      },
      {
        title: 'Documents',
        href: '/documents',
        icon: FileTextIcon,
      },
    ],
  },
];
