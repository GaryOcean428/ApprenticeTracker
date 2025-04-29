import { type ReactNode } from 'react';
import { SideNav } from '@/components/navigation/side-nav';
import { TopNav } from '@/components/navigation/top-nav';

interface LayoutProps {
  children: ReactNode;
}

export default function SectionsLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex">
      <SideNav />
      <div className="flex-1">
        <TopNav />
        <main className="pt-16 px-4 md:px-8">{children}</main>
      </div>
    </div>
  );
}
