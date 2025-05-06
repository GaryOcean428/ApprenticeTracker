import {
  HomeIcon,
  Users,
  Building2,
  GraduationCap,
  Clock,
  ClipboardCheck,
  ShieldCheck,
  Briefcase,
  FileText,
  BarChart4,
  Files,
  Settings,
} from 'lucide-react';

// Define types for navigation items
export interface SubNavItem {
  title: string;
  href: string;
}

export interface NavSection {
  title: string;
  icon: any;
  href?: string;
  subItems?: SubNavItem[][];
}

// Main navigation sections
export const MAIN_NAV_SECTIONS: NavSection[] = [
  {
    title: 'Dashboard',
    icon: HomeIcon,
    href: '/dashboard',
  },
  {
    title: 'Apprentices & Trainees',
    icon: Users,
    href: '/apprentices',
    subItems: [
      [
        { title: 'All Apprentices', href: '/apprentices' },
        { title: 'Recruitment', href: '/apprentices/recruitment' },
        { title: 'Employment Records', href: '/apprentices/records' },
        { title: 'Training Plans', href: '/apprentices/training' },
        { title: 'Progress Reviews', href: '/apprentices/progress' },
      ],
    ],
  },
  {
    title: 'Host Employers',
    icon: Building2,
    href: '/hosts',
    subItems: [
      [
        { title: 'Employer Directory', href: '/hosts' },
        { title: 'Agreements', href: '/hosts/agreements' },
        { title: 'Workplace Monitoring', href: '/hosts/monitoring' },
        { title: 'Vacancy Management', href: '/hosts/vacancies' },
        { title: 'Performance Reports', href: '/hosts/reports' },
      ],
    ],
  },
  {
    title: 'Training',
    icon: GraduationCap,
    href: '/training/plans',
    subItems: [
      [
        { title: 'Training Plans', href: '/training/plans' },
        { title: 'Qualification Progress', href: '/training/qualifications' },
        { title: 'RTO Management', href: '/training/rtos' },
        { title: 'Off-Job Training', href: '/training/off-job' },
        { title: 'Competency Records', href: '/training/competency' },
      ],
    ],
  },
  {
    title: 'Timesheets & Payroll',
    icon: Clock,
    href: '/timesheets',
    subItems: [
      [
        { title: 'Timesheet Management', href: '/timesheets' },
        { title: 'Approval Workflow', href: '/timesheets/approvals' },
        { title: 'Pay Items & Awards', href: '/awards' },
        { title: 'Payroll Export', href: '/timesheets/payroll' },
        { title: 'Leave Management', href: '/timesheets/leave' },
      ],
    ],
  },
  {
    title: 'Compliance',
    icon: ClipboardCheck,
    href: '/compliance',
    subItems: [
      [
        { title: 'Evidence Collection', href: '/compliance' },
        { title: 'Standard 1 Requirements', href: '/compliance/standard-1' },
        { title: 'Standard 2 Requirements', href: '/compliance/standard-2' },
        { title: 'Standard 3 Requirements', href: '/compliance/standard-3' },
        { title: 'Audit Preparation', href: '/compliance/audit' },
      ],
    ],
  },
  {
    title: 'GTO Compliance',
    icon: ShieldCheck,
    href: '/gto-compliance',
    subItems: [
      [
        { title: 'Compliance Dashboard', href: '/gto-compliance' },
        { title: 'Standard Assessments', href: '/gto-compliance/standard-assessment' },
        { title: 'Complaints & Appeals', href: '/gto-compliance/complaints' },
        { title: 'Access & Equity', href: '/gto-compliance/access-equity' },
        { title: 'Continuous Improvement', href: '/gto-compliance/improvement' },
      ],
    ],
  },
  {
    title: 'VET Training',
    icon: GraduationCap,
    href: '/vet/units',
    subItems: [
      [
        { title: 'Units of Competency', href: '/vet/units' },
        { title: 'Qualifications', href: '/vet/qualifications' },
        { title: 'Training Packages', href: '/vet/training-packages' },
        { title: 'Progress Tracking', href: '/vet/progress' },
        { title: 'Assessment Records', href: '/vet/assessments' },
      ],
    ],
  },
  {
    title: 'Field Officer Activities',
    icon: Briefcase,
    href: '/field-officers',
    subItems: [
      [
        { title: 'Visit Scheduler', href: '/field-officers' },
        { title: 'Site Assessment', href: '/field-officers/site-assessment' },
        { title: 'Case Notes & Logs', href: '/field-officers/case-notes' },
        { title: 'Competency Review', href: '/field-officers/competency-review' },
        { title: 'Contact Reports', href: '/field-officers/contact-reports' },
      ],
    ],
  },
  {
    title: 'Governance',
    icon: FileText,
    href: '/governance/quality',
    subItems: [
      [
        { title: 'Quality Assurance', href: '/governance/quality' },
        { title: 'Business Planning', href: '/governance/planning' },
        { title: 'Risk Management', href: '/governance/risk' },
        { title: 'Financial Viability', href: '/governance/financial' },
      ],
    ],
  },
  {
    title: 'Reports',
    icon: BarChart4,
    href: '/reports/compliance',
    subItems: [
      [
        { title: 'Compliance Reports', href: '/reports/compliance' },
        { title: 'Financial Reports', href: '/reports/financial' },
        { title: 'Apprentice Progress', href: '/reports/apprentice' },
        { title: 'Host Employer Reports', href: '/reports/host' },
        { title: 'Custom Reports', href: '/reports/custom' },
      ],
    ],
  },
  {
    title: 'Documents',
    icon: Files,
    href: '/documents',
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings/users',
    subItems: [
      [
        { title: 'User Management', href: '/settings/users' },
        { title: 'Permissions & Roles', href: '/settings/permissions' },
        { title: 'Permissions Demo', href: '/settings/permissions-demo' },
        { title: 'System Configuration', href: '/settings/configuration' },
        { title: 'Integration Settings', href: '/settings/integrations' },
      ],
    ],
  },
];
