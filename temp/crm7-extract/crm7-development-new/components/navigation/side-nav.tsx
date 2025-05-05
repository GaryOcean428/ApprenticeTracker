'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BarChart, FileText, Home, Settings, Shield, Users, Calendar, Bell, HelpCircle } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/reports', label: 'Reports', icon: BarChart },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/compliance', label: 'Compliance', icon: Shield },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

export function SideNav() {
  const pathname = usePathname() ?? '/';

  return (
    <nav className="flex h-screen w-64 flex-col border-r bg-card px-3 py-4">
      <div className="mb-8 px-4 py-3">
        <h1 className="text-xl font-bold">CRM7</h1>
      </div>
      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
