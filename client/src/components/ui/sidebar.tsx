import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  LayoutDashboard,
  Users,
  Building2, 
  ShieldCheck,
  DollarSign,
  BarChart2,
  FileText,
  Settings,
  GraduationCap,
  ClipboardCheck,
  Calendar,
  UserCog,
  Briefcase,
  FileHeart,
  Network,
  ExternalLink,
  Award,
  ClipboardList,
  BookOpen,
  GanttChart,
  Medal
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
  active?: boolean;
}

const SidebarItem = ({ icon, label, href, children, active }: SidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(active);
  const [location] = useLocation();
  
  const isActive = href ? location === href : false;
  const hasChildren = children && children.length > 0;
  
  const handleToggle = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };
  
  return (
    <li className="relative px-6 py-2">
      {isActive && (
        <span className="absolute inset-y-0 left-0 w-1 bg-[#0070F3] rounded-tr-lg rounded-br-lg" aria-hidden="true"></span>
      )}
      
      {hasChildren ? (
        <div>
          <button 
            onClick={handleToggle}
            className={cn(
              "inline-flex items-center justify-between w-full text-sm font-semibold transition-colors duration-150",
              isActive ? "text-[#0070F3]" : "hover:text-[#0070F3]"
            )}
          >
            <span className="inline-flex items-center">
              {icon}
              <span className="ml-3">{label}</span>
            </span>
            <ChevronDown 
              className={cn(
                "h-4 w-4 transition-transform duration-200", 
                isOpen ? "transform rotate-180" : ""
              )} 
            />
          </button>
          
          {isOpen && (
            <ul className="pl-2 pt-1 pb-1 mt-1 space-y-1 overflow-hidden text-xs rounded-md">
              {children?.map((child, index) => {
                const childActive = location === child.href;
                return (
                  <li key={index} className="px-2 py-1 transition-colors duration-150 hover:text-primary">
                    <Link 
                      href={child.href} 
                      className={cn(
                        "w-full inline-block",
                        childActive ? "text-primary font-medium" : ""
                      )}
                    >
                      {child.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <Link 
          href={href || '#'} 
          className={cn(
            "inline-flex items-center w-full text-sm font-semibold transition-colors duration-150",
            isActive ? "text-[#0070F3]" : "hover:text-[#0070F3]"
          )}
        >
          {icon}
          <span className="ml-3">{label}</span>
        </Link>
      )}
    </li>
  );
};

const Sidebar = () => {
  const [location] = useLocation();
  
  return (
    <aside className="z-20 hidden w-64 overflow-y-auto bg-white dark:bg-[#111827] md:block flex-shrink-0 border-r border-border">
      <div className="py-4 max-h-screen overflow-y-auto">
        <div className="px-6 py-3">
          <h2 className="text-2xl font-bold text-[#0070F3]">CRM7</h2>
          <p className="text-xs text-muted-foreground">Workforce Management</p>
        </div>
        
        <ul className="mt-6">
          <SidebarItem 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label="Dashboard" 
            href="/admin" 
            active={location === '/admin'} 
          />
          
          <SidebarItem 
            icon={<Users className="h-5 w-5" />} 
            label="Apprentices & Trainees" 
            active={location.startsWith('/apprentices')}
            children={[
              { label: "All Apprentices", href: "/apprentices" },
              { label: "Recruitment", href: "/apprentices/recruitment" },
              { label: "Employment Records", href: "/apprentices/records" },
              { label: "Training Plans", href: "/apprentices/training" },
              { label: "Progress Tracking", href: "/apprentices/progress" },
              { label: "Rotations & Placements", href: "/placements" },
              { label: "Completion", href: "/apprentices/completion" }
            ]} 
          />
          
          <SidebarItem 
            icon={<Building2 className="h-5 w-5" />} 
            label="Host Employers" 
            active={location.startsWith('/hosts')}
            children={[
              { label: "Employer Directory", href: "/hosts" },
              { label: "Agreements", href: "/hosts/agreements" },
              { label: "Workplace Monitoring", href: "/hosts/monitoring" },
              { label: "Vacancy Management", href: "/hosts/vacancies" },
              { label: "Performance Reports", href: "/hosts/reports" }
            ]} 
          />
          
          <SidebarItem 
            icon={<GraduationCap className="h-5 w-5" />} 
            label="Training" 
            active={location.startsWith('/training')}
            children={[
              { label: "Training Plans", href: "/training/plans" },
              { label: "Qualification Progress", href: "/training/qualifications" },
              { label: "RTO Management", href: "/training/rtos" },
              { label: "Off-Job Training", href: "/training/off-job" },
              { label: "Competency Records", href: "/training/competencies" }
            ]} 
          />
          
          <SidebarItem 
            icon={<ClipboardCheck className="h-5 w-5" />} 
            label="Timesheets & Payroll" 
            active={location.startsWith('/timesheets')}
            children={[
              { label: "Timesheet Management", href: "/timesheets" },
              { label: "Approval Workflow", href: "/timesheets/approvals" },
              { label: "Pay Items & Awards", href: "/awards" },
              { label: "Payroll Export", href: "/timesheets/payroll" },
              { label: "Leave Management", href: "/timesheets/leave" }
            ]} 
          />
          
          <SidebarItem 
            icon={<ShieldCheck className="h-5 w-5" />} 
            label="Compliance" 
            active={location.startsWith('/compliance')}
            children={[
              { label: "Evidence Collection", href: "/compliance" },
              { label: "Standard 1 Requirements", href: "/compliance/standard-1" },
              { label: "Standard 2 Requirements", href: "/compliance/standard-2" },
              { label: "Standard 3 Requirements", href: "/compliance/standard-3" },
              { label: "Standard 4 Requirements", href: "/compliance/standard-4" },
              { label: "Audit Preparation", href: "/compliance/audit" }
            ]} 
          />
          
          <SidebarItem 
            icon={<Award className="h-5 w-5" />} 
            label="GTO Compliance" 
            active={location.startsWith('/gto-compliance')}
            children={[
              { label: "Compliance Dashboard", href: "/gto-compliance" },
              { label: "Standard Assessments", href: "/gto-compliance/standard-assessment" },
              { label: "Complaints & Appeals", href: "/gto-compliance/complaints" },
              { label: "Access & Equity", href: "/gto-compliance/access-equity" },
              { label: "Records Management", href: "/gto-compliance/records" },
              { label: "Risk Management", href: "/gto-compliance/risk" }
            ]} 
          />
          
          <SidebarItem 
            icon={<BookOpen className="h-5 w-5" />} 
            label="VET Training" 
            active={location.startsWith('/vet')}
            children={[
              { label: "Units of Competency", href: "/vet/units" },
              { label: "Qualifications", href: "/vet/qualifications" },
              { label: "Training Packages", href: "/vet/packages" },
              { label: "Progress Tracking", href: "/vet/progress" },
              { label: "Assessment Records", href: "/vet/assessments" }
            ]} 
          />
          
          <SidebarItem 
            icon={<Calendar className="h-5 w-5" />} 
            label="Field Officer Activities" 
            active={location.startsWith('/field-officers')}
            children={[
              { label: "Visit Scheduler", href: "/field-officers" },
              { label: "Site Assessment", href: "/field-officers/site-assessment" },
              { label: "Case Notes & Logs", href: "/field-officers/case-notes" },
              { label: "Competency Review", href: "/field-officers/competency" },
              { label: "Incident Tracking", href: "/field-officers/incidents" },
              { label: "Action Items", href: "/field-officers/actions" }
            ]} 
          />
          
          <SidebarItem 
            icon={<Briefcase className="h-5 w-5" />} 
            label="Governance" 
            active={location.startsWith('/governance')}
            children={[
              { label: "Quality Assurance", href: "/governance/quality" },
              { label: "Business Planning", href: "/governance/planning" },
              { label: "Risk Management", href: "/governance/risk" },
              { label: "Financial Viability", href: "/governance/financial" }
            ]} 
          />
          
          <SidebarItem 
            icon={<BarChart2 className="h-5 w-5" />} 
            label="Reports" 
            active={location.startsWith('/reports')}
            children={[
              { label: "Compliance Reports", href: "/reports/compliance" },
              { label: "Financial Reports", href: "/reports/financial" },
              { label: "Apprentice Progress", href: "/reports/apprentice" },
              { label: "Host Employer Reports", href: "/reports/host" },
              { label: "Custom Reports", href: "/reports/custom" },
              { label: "Export Options", href: "/reports/export" }
            ]} 
          />
          
          <SidebarItem 
            icon={<FileText className="h-5 w-5" />} 
            label="Documents" 
            href="/documents" 
            active={location === '/documents'} 
          />
          
          <SidebarItem 
            icon={<UserCog className="h-5 w-5" />} 
            label="Settings" 
            active={location.startsWith('/settings')}
            children={[
              { label: "User Management", href: "/settings/users" },
              { label: "Permissions & Roles", href: "/settings/permissions" },
              { label: "System Configuration", href: "/settings/configuration" },
              { label: "Integrations", href: "/settings/integrations" },
              { label: "Import/Export", href: "/settings/import-export" }
            ]} 
          />
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
