'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  GraduationCap,
  ShieldCheck,
  DollarSign,
  Users,
  Building2,
  Target,
  ClipboardCheck,
  LineChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import React from 'react';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<any>;
  shortcut?: string;
  description?: string;
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart,
    shortcut: 'Alt+D',
    description: 'Overview and key metrics'
  },
  {
    title: 'Training & Development',
    href: '/training',
    icon: GraduationCap,
    description: 'Training program management'
  },
  {
    title: 'Safety & WHS',
    href: '/safety',
    icon: ShieldCheck,
    description: 'Workplace health and safety'
  },
  {
    title: 'Payroll & Finance',
    href: '/payroll',
    icon: DollarSign,
    description: 'Financial operations'
  },
  {
    title: 'Human Resources',
    href: '/hr',
    icon: Users,
    description: 'HR operations'
  },
  {
    title: 'Client Management',
    href: '/clients',
    icon: Building2,
    description: 'Client relationships'
  },
  {
    title: 'Marketing & Sales',
    href: '/marketing',
    icon: Target,
    description: 'Marketing campaigns'
  },
  {
    title: 'Compliance & Quality',
    href: '/compliance',
    icon: ClipboardCheck,
    description: 'Compliance monitoring'
  },
  {
    title: 'Reports & Analytics',
    href: '/reports',
    icon: LineChart,
    description: 'Data analysis'
  }
];

export function MainNavigation() {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <nav
      className="flex flex-col space-y-1"
      role="navigation"
      aria-label="Main Navigation"
    >
      {mainNavItems.map((item) => (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                isActive(item.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'transparent'
              )}
            >
              {item.icon && (
                React.createElement(item.icon as React.ElementType<{ className?: string; "aria-hidden"?: string }>, { 
                  className: cn("mr-2 h-4 w-4"), 
                  "aria-hidden": "true" 
                })
              )}
              <span>{item.title}</span>
              {item.shortcut && (
                <kbd className="ml-auto text-xs text-muted-foreground">
                  {item.shortcut}
                </kbd>
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.description}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </nav>
  );
}
