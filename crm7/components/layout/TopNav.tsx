'use client';

import {
  LayoutGrid,
  Users,
  Building2,
  Briefcase,
  Clock,
  Shield,
  BarChart2,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { type NavigationItem } from '@/lib/types/navigation';
import { type Url } from 'next/dist/shared/lib/router/router';

interface TopNavProps {
  items: NavigationItem[];
}

export function TopNav({ items }: { items: NavigationItem[] }): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4">
      {items.map((item) => {
        const isActive = pathname?.startsWith(item.href || '') ?? false;
        return (
          <Link
            key={item.href || ''}
            href={item.href as Url || ''}
            className={cn(
              'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent',
              isActive && 'bg-accent'
            )}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

const topNavItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Candidates & Employees',
    href: '/candidates',
    icon: Users,
  },
  {
    title: 'Clients / Host Employers',
    href: '/clients',
    icon: Building2,
  },
  {
    title: 'Jobs & Placements',
    href: '/jobs',
    icon: Briefcase,
  },
  {
    title: 'Timesheets & Payroll',
    href: '/timesheets',
    icon: Clock,
  },
  {
    title: 'Compliance & Training',
    href: '/compliance',
    icon: Shield,
  },
  {
    title: 'Reporting & Analytics',
    href: '/reporting',
    icon: BarChart2,
  },
  {
    title: 'Settings & Admin',
    href: '/settings',
    icon: Settings,
  },
];

export default TopNav;
