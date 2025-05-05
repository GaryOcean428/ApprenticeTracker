'use client';

import { Sidebar } from '@/components/ui/sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useAuth } from '@/lib/auth/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: Readonly<AppLayoutProps>) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        <TopBar />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
