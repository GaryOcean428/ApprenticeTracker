'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const sections = {
  dashboard: [
    { title: 'Overview', href: '/dashboard' },
    { title: 'Quick Actions', href: '/dashboard/actions' },
    { title: 'Recent Activities', href: '/dashboard/activities' },
    { title: 'Notifications', href: '/dashboard/notifications' },
    { title: 'Alerts & Reminders', href: '/dashboard/alerts' },
    { title: 'Key Metrics', href: '/dashboard/metrics' },
    { title: 'Task List', href: '/dashboard/tasks' },
    { title: 'Calendar View', href: '/dashboard/calendar' },
  ],
  // ... other sections unchanged ...
} as const;

interface SectionSidebarProps {
  className?: string;
  section?: keyof typeof sections;
}

export function SectionSidebar({ className, section = 'dashboard' }: SectionSidebarProps): JSX.Element {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        className="absolute right-4 top-4 lg:hidden"
        onClick={(): void => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <nav className={cn('space-y-1', isMobileMenuOpen ? 'block' : 'hidden lg:block')}>
        {sections[section].map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
