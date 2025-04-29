'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <AppHeader />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 30,
          }}
          className={cn(
            'flex-1 space-y-4 p-8 pt-6',
          )}
        >
          <div className="flex flex-col gap-4">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}
