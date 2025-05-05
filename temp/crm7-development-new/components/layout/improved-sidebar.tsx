'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, JSX, useContext, useState, type ReactElement, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { MAIN_NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/utils';

import type { NavItem } from '@/config/navigation';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextType {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

function renderIcon(icon: LucideIcon | undefined): React.ReactNode {
  if (!icon) return null;
  const Icon = icon;
  return <Icon className="h-4 w-4" />;
}

export const Sidebar = (): ReactElement => {
  const { isCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();

  const handleLinkClick = (): void => {
    if (typeof isMobileOpen !== "undefined" && isMobileOpen !== null) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col',
          isCollapsed ? 'lg:w-16' : 'lg:w-64',
          'border-r bg-background transition-all duration-300'
        )}
      >
        <ScrollArea className='flex-1'>
          <nav className='space-y-1 px-2 py-4'>
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive = item.href ? pathname?.startsWith(item.href) : false;
              return (
                <div key={item.slug || item.href} className='space-y-1'>
                  <Link
                    href={item.href ?? '#'}
                    className={cn(
                      'flex items-center rounded-lg px-3 py-2 text-sm font-medium',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    onClick={handleLinkClick}
                  >
                    {renderIcon(item.icon)}
                    {!isCollapsed && <span>{item.label ?? item.title}</span>}
                  </Link>
                  {!isCollapsed && item.children && isActive && (
                    <div className='ml-4 space-y-1'>
                      {item.children.map((child: NavItem) => (
                        <Link
                          key={child.href}
                          href={child.href ?? '#'}
                          className={cn(
                            'flex items-center rounded-lg px-3 py-2 text-sm font-medium',
                            pathname === child.href
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                          )}
                          onClick={handleLinkClick}
                        >
                          {child.label ?? child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isMobileOpen ? 0 : '-100%' }}
        transition={{ duration: 0.2 }}
        className='fixed inset-y-0 left-0 z-50 w-64 border-r bg-background lg:hidden'
      >
        <ScrollArea className='flex-1'>
          <nav className='space-y-1 px-2 py-4'>
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive = item.href ? pathname?.startsWith(item.href) : false;
              return (
                <div key={item.slug || item.href} className='space-y-1'>
                  <Link
                    href={item.href ?? '#'}
                    className={cn(
                      'flex items-center rounded-lg px-3 py-2 text-sm font-medium',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    onClick={handleLinkClick}
                  >
                    {renderIcon(item.icon)}
                    <span>{item.label ?? item.title}</span>
                  </Link>
                  {item.children && isActive && (
                    <div className='ml-4 space-y-1'>
                      {item.children.map((child: NavItem) => (
                        <Link
                          key={child.href}
                          href={child.href ?? '#'}
                          className={cn(
                            'flex items-center rounded-lg px-3 py-2 text-sm font-medium',
                            pathname === child.href
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                          )}
                          onClick={handleLinkClick}
                        >
                          {child.label ?? child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </ScrollArea>
      </motion.aside>
    </>
  );
};

export const SidebarContent = ({ children }: { children: ReactNode }): ReactElement => {
  return <div className='flex-1'>{children}</div>;
};
