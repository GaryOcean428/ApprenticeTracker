'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { type NavigationItem } from '@/lib/types/navigation';

interface HeaderProps {
  items: NavigationItem[];
}

export function Header({ items }: HeaderProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {items.map((item) => {
            const isActive = item.href ? pathname?.startsWith(item.href) : false;
            const href = item.href ?? '#';
            const key = item.slug ?? item.href ?? item.title;

            return (
              <Link
                key={key}
                href={href}
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-foreground' : 'text-foreground/60'
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.label ?? item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
