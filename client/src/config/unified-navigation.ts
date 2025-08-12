import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  BarChart2,
  FileText,
  Settings,
  GraduationCap,
  ClipboardCheck,
  Calendar,
  Award,
  DollarSign,
  Search,
  Globe,
  Contact,
  Building,
} from 'lucide-react';

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

export const MAIN_NAV_SECTIONS: NavSection[] = [
  // Dashboard section
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
  },

  // Unified Contacts System
  {
    title: 'Contacts',
    icon: Contact,
    href: '/contacts',
    subItems: [
      [
        { title: 'All Contacts', href: '/contacts' },
        { title: 'Apprentices', href: '/contacts?tab=apprentices' },
        { title: 'Trainees', href: '/contacts?tab=trainees' },
        { title: 'Labour Hire Workers', href: '/contacts?tab=labour-hire' },
        { title: 'Host Contacts', href: '/contacts?tab=host-employers' },
        { title: 'Contact Tags', href: '/contacts/tags' },
        { title: 'Contact Groups', href: '/contacts/groups' },
      ],
    ],
  },

  // Client Management
  {
    title: 'Clients',
    icon: Building,
    href: '/clients',
    subItems: [
      [
        { title: 'All Clients', href: '/clients' },
        { title: 'Host Employers', href: '/clients?tab=hosts' },
        { title: 'Prospects', href: '/clients?tab=prospects' },
        { title: 'Client Types', href: '/clients/types' },
        { title: 'Client Services', href: '/clients/services' },
      ],
    ],
  },

  // External Employees (Main Parent Section)
  {
    title: 'External Employees',
    icon: Users,
    subItems: [
      // Apprentices & Trainees Sub-section
      [
        { title: 'Apprentices & Trainees', href: '/external-employees/apprentices' },
        { title: 'All Apprentices', href: '/apprentices' },
        { title: 'Recruitment', href: '/apprentices/recruitment' },
        { title: 'Employment Records', href: '/apprentices/records' },
        { title: 'Training Plans', href: '/apprentices/training' },
        { title: 'Progress Tracking', href: '/apprentices/progress' },
        { title: 'Completion', href: '/apprentices/completion' },
      ],
      // Workers Sub-section
      [
        { title: 'Workers', href: '/external-employees/workers' },
        { title: 'All Workers', href: '/labour-hire/workers' },
        { title: 'Placements', href: '/labour-hire/placements' },
        { title: 'Timesheets', href: '/labour-hire/timesheets' },
        { title: 'Skills & Qualifications', href: '/labour-hire/skills' },
        { title: 'Worker Pool', href: '/labour-hire/pool' },
      ],
      // Shared Sub-section
      [
        { title: 'Placements & Rotations', href: '/placements' },
        { title: 'Progress Reviews', href: '/progress-reviews' },
        { title: 'Review Templates', href: '/progress-reviews/templates' },
      ],
    ],
  },

  // Host Employers
  {
    title: 'Host Employers',
    icon: Building2,
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

  // Training & VET
  {
    title: 'Training & VET',
    icon: GraduationCap,
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

  // Timesheets & Payroll
  {
    title: 'Timesheets & Payroll',
    icon: ClipboardCheck,
    subItems: [
      [
        { title: 'Timesheet Management', href: '/timesheets' },
        { title: 'Approval Workflow', href: '/timesheets/approvals' },
        { title: 'Pay Awards & Rates', href: '/awards' },
        { title: 'Award Interpreter', href: '/fair-work-demo' },
        { title: 'Payroll Export', href: '/timesheets/payroll' },
        { title: 'Leave Management', href: '/timesheets/leave' },
      ],
    ],
  },

  // Field Officer Activities
  {
    title: 'Field Officer Activities',
    icon: Calendar,
    subItems: [
      [
        { title: 'Visit Scheduler', href: '/field-officers' },
        { title: 'Site Assessment', href: '/field-officers/site-assessment' },
        { title: 'Case Notes & Logs', href: '/field-officers/case-notes' },
        { title: 'Competency Review', href: '/field-officers/competency' },
        { title: 'Incident Tracking', href: '/field-officers/incidents' },
        { title: 'Action Items', href: '/field-officers/actions' },
      ],
    ],
  },

  // Compliance
  {
    title: 'Compliance',
    icon: ShieldCheck,
    subItems: [
      [
        { title: 'Evidence Collection', href: '/compliance' },
        { title: 'Standard 1 Requirements', href: '/compliance/standard-1' },
        { title: 'Standard 2 Requirements', href: '/compliance/standard-2' },
        { title: 'Standard 3 Requirements', href: '/compliance/standard-3' },
        { title: 'Standard 4 Requirements', href: '/compliance/standard-4' },
        { title: 'Audit Preparation', href: '/compliance/audit' },
      ],
      [
        { title: 'GTO Compliance Dashboard', href: '/gto-compliance' },
        { title: 'Standard Assessments', href: '/gto-compliance/standard-assessment' },
        { title: 'Complaints & Appeals', href: '/gto-compliance/complaints' },
        { title: 'Access & Equity', href: '/gto-compliance/access-equity' },
        { title: 'Records Management', href: '/gto-compliance/records-management' },
        { title: 'Risk Management', href: '/gto-compliance/risk-management' },
      ],
    ],
  },

  // Reports & Analytics
  {
    title: 'Reports & Analytics',
    icon: BarChart2,
    subItems: [
      [
        { title: 'Compliance Reports', href: '/reports/compliance' },
        { title: 'Financial Reports', href: '/reports/financial' },
        { title: 'Apprentice Progress', href: '/reports/apprentice' },
        { title: 'Host Employer Reports', href: '/reports/host' },
        { title: 'Custom Reports', href: '/reports/custom' },
        { title: 'Export Options', href: '/reports/export' },
      ],
    ],
  },

  // Accounts & Finance
  {
    title: 'Accounts & Finance',
    icon: DollarSign,
    subItems: [
      [
        { title: 'Charge Rates', href: '/charge-rates' },
        { title: 'Invoicing', href: '/financial/invoicing' },
        { title: 'Financial Reports', href: '/financial/reports' },
        { title: 'Budget Planning', href: '/financial/budget' },
        { title: 'Expense Tracking', href: '/financial/expenses' },
      ],
    ],
  },

  // Documents & Resources
  {
    title: 'Documents & Resources',
    icon: FileText,
    href: '/documents',
  },

  // Tools & Utilities
  {
    title: 'Tools',
    icon: Award,
    subItems: [
      [
        { title: 'Fair Work Award Interpreter', href: '/fair-work-demo' },
        { title: 'Charge Rate Calculator', href: '/charge-rates' },
      ],
    ],
  },

  // Settings & Configuration
  {
    title: 'Settings',
    icon: Settings,
    subItems: [
      [
        { title: 'User Management', href: '/settings/users' },
        { title: 'Permissions & Roles', href: '/settings/permissions' },
        { title: 'System Configuration', href: '/settings/configuration' },
        { title: 'Award Updates', href: '/admin/award-updates' },
        { title: 'Integrations', href: '/settings/integrations' },
        { title: 'Import/Export', href: '/settings/import-export' },
      ],
    ],
  },

  // Portals
  {
    title: 'Portal Access',
    icon: Globe,
    href: '/portal',
  },

  // Public Site
  {
    title: 'Public Website',
    icon: Search,
    subItems: [
      [
        { title: 'Home', href: '/' },
        { title: 'About', href: '/about' },
        { title: 'Services', href: '/services' },
        { title: 'Find Apprenticeship', href: '/find-apprenticeship' },
        { title: 'Host an Apprentice', href: '/host-apprentice' },
        { title: 'Contact', href: '/contact' },
      ],
    ],
  },
];
