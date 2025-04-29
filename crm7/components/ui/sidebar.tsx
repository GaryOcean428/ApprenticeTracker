'use client';

import { MAIN_NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Button } from './button';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Sidebar({ className, children, ...props }: SidebarProps): JSX.Element {
  const pathname = usePathname();

  return (
    <div className={cn('hidden border-r bg-background lg:block lg:w-64 lg:flex-none', className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Labour Hire CRM</h2>
          <div className="space-y-1">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-muted"
                  )}
                  asChild
                >
                  <Link href={item.href || '#'}>
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {item.title}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
