'use client';

import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminFooter } from '@/components/layout/AdminFooter';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';

interface NavItem {
  href: string;
  label: string;
  items?: NavItem[];
}

interface NavSection {
  items: NavItem[];
}

const TRAINING_NAV: Record<string, NavSection> = {
  Overview: {
    items: [
      { href: '/training', label: 'Dashboard' },
      { href: '/training/reports', label: 'Reports' },
    ],
  },
  Management: {
    items: [
      { href: '/training/courses', label: 'Courses' },
      { href: '/training/assessments', label: 'Assessments' },
      { href: '/training/certifications', label: 'Certifications' },
      { href: '/training/development', label: 'Training & Development' },
    ],
  },
};

function NavItemComponent({ item, level = 0 }: { item: NavItem; level?: number }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const paddingLeft = level * 4;

  return (
    <div>
      <Link
        href={item.href}
        className={cn(
          'block rounded-md px-4 py-2 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isActive ? 'bg-accent text-accent-foreground' : 'text-foreground/70'
        )}
        style={{ paddingLeft: `${paddingLeft + 16}px` }}
      >
        {item.label}
      </Link>
      {item.items?.map((subItem) => (
        <NavItemComponent key={subItem.href} item={subItem} level={level + 1} />
      ))}
    </div>
  );
}

function Navigation() {
  return (
    <nav className="w-64 border-r bg-background">
      {Object.entries(TRAINING_NAV).map(([section, { items }]) => (
        <div key={section} className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">{section}</h2>
          <div className="space-y-1">
            {items.map((item) => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function NavigationSkeleton() {
  return (
    <div className="w-64 border-r bg-background p-4">
      <div className="space-y-6">
        {[1, 2].map((section) => (
          <div key={section} className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <div className="space-y-1">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-8 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrainingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <ErrorBoundary>
        <Suspense fallback={<NavigationSkeleton />}>
          <Navigation />
        </Suspense>
      </ErrorBoundary>
      <main className="flex-1 overflow-y-auto">
        <ErrorBoundary>
          {children}
          <AdminFooter />
        </ErrorBoundary>
      </main>
    </div>
  );
}
