'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ARCH_NAV_SECTIONS, ArchNavSection } from '@/config/arch-navigation';
import { useAuth } from '@/lib/auth/context';

export function ArchitectureNavigation(): React.ReactElement {
  const { user } = useAuth();
  const pathname = usePathname();
  // Assume the user object has a role property; if not, default to 'user'
  const userRole = user?.role || 'user';

  // Filter the main navigation sections based on the allowedRoles property
  const filteredSections: ArchNavSection[] = useMemo(() => {
    return ARCH_NAV_SECTIONS.filter(section =>
      !section.allowedRoles || section.allowedRoles.includes(userRole)
    );
  }, [userRole]);

  // Determine the active section by matching the current path with section hrefs
  const activeSection = useMemo(() => {
    return pathname ? (
      filteredSections.find(section => pathname.startsWith(section.href)) ||
      filteredSections[0]
    ) : filteredSections[0];
  }, [pathname, filteredSections]);

  // Mobile nav open/close state
  const [isMobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-background border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link href="/" className="text-xl font-bold">
            CRM7
          </Link>
          {/* Desktop Top Nav */}
          <nav className="hidden md:flex space-x-4">
            {filteredSections.map(section => (
              <Link
                key={section.key}
                href={section.href}
                className={cn(
                  'px-3 py-2 rounded transition',
                  pathname?.startsWith(section.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent'
                )}
              >
                <section.icon className="inline h-4 w-4 mr-1" />
                {section.title}
              </Link>
            ))}
          </nav>
          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded hover:bg-accent"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden bg-background border-t">
            <div className="flex flex-col">
              {filteredSections.map(section => (
                <Link
                  key={section.key}
                  href={section.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-2 border-b',
                    pathname?.startsWith(section.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent'
                  )}
                >
                  <section.icon className="inline h-4 w-4 mr-2" />
                  {section.title}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <div className="flex flex-1">
        {/* Sidebar for Desktop Sub-navigation */}
        <aside className="hidden md:block w-64 border-r bg-background">
          <nav className="p-4">
            <ul className="space-y-2">
              {activeSection?.items
                ?.filter(item => !item.allowedRoles || item.allowedRoles.includes(userRole))
                .map(item => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className={cn(
                        'block px-3 py-2 rounded transition',
                        pathname?.startsWith(item.href)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent'
                      )}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 p-6">
          {/* The page content will be rendered here */}
        </main>
      </div>
    </div>
  );
}

export default ArchitectureNavigation;
