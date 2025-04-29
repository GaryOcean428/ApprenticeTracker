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
  Settings
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
    <li className="relative px-6 py-3">
      {isActive && (
        <span className="absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-lg rounded-br-lg" aria-hidden="true"></span>
      )}
      
      {hasChildren ? (
        <div>
          <button 
            onClick={handleToggle}
            className={cn(
              "inline-flex items-center justify-between w-full text-sm font-semibold transition-colors duration-150",
              isActive ? "text-primary" : "hover:text-primary"
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
            <ul className="p-2 mt-2 space-y-2 overflow-hidden text-sm rounded-md">
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
            isActive ? "text-primary" : "hover:text-primary"
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
    <aside className="z-20 hidden w-64 overflow-y-auto bg-white dark:bg-sidebar md:block flex-shrink-0 border-r border-border">
      <div className="py-4">
        <div className="px-6 py-3">
          <h2 className="text-2xl font-bold text-primary">CRM7</h2>
          <p className="text-xs text-muted-foreground">Workforce Management</p>
        </div>
        
        <ul className="mt-6">
          <SidebarItem 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label="Dashboard" 
            href="/" 
            active={location === '/'} 
          />
          
          <SidebarItem 
            icon={<Users className="h-5 w-5" />} 
            label="Apprentice Management" 
            active={location.startsWith('/apprentices')}
            children={[
              { label: "All Apprentices", href: "/apprentices" },
              { label: "Training Contracts", href: "/contracts" },
              { label: "Progress Monitoring", href: "/apprentices/progress" },
              { label: "Performance Tracking", href: "/apprentices/performance" }
            ]} 
          />
          
          <SidebarItem 
            icon={<Building2 className="h-5 w-5" />} 
            label="Host Management" 
            active={location.startsWith('/hosts')}
            children={[
              { label: "All Hosts", href: "/hosts" },
              { label: "Placements", href: "/placements" },
              { label: "Safety Compliance", href: "/hosts/safety" },
              { label: "Financial Arrangements", href: "/hosts/financial" }
            ]} 
          />
          
          <SidebarItem 
            icon={<ShieldCheck className="h-5 w-5" />} 
            label="Compliance System" 
            href="/compliance" 
            active={location === '/compliance'} 
          />
          
          <SidebarItem 
            icon={<DollarSign className="h-5 w-5" />} 
            label="Financial Operations" 
            href="/timesheets" 
            active={location === '/timesheets'} 
          />
          
          <SidebarItem 
            icon={<BarChart2 className="h-5 w-5" />} 
            label="Analytics & Reporting" 
            href="/reports" 
            active={location === '/reports'} 
          />
          
          <SidebarItem 
            icon={<FileText className="h-5 w-5" />} 
            label="Documents" 
            href="/documents" 
            active={location === '/documents'} 
          />
          
          <SidebarItem 
            icon={<Settings className="h-5 w-5" />} 
            label="Settings" 
            href="/settings" 
            active={location === '/settings'} 
          />
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
