import { SECTIONS } from '@/config/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { cn } from '@/lib/utils';
import { type Url } from 'next/dist/shared/lib/router/router';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="space-y-4">
      {SECTIONS.map((section) => (
        <div key={section.title} className="space-y-2">
          <h2 className="font-semibold">{section.title}</h2>
          <div className="space-y-1">
            {section.items.map((item) => (
              <Link
                key={item.href || ''}
                href={(item.href || '') as Url}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent',
                  pathname === item.href && 'bg-accent'
                )}
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default Navigation;
