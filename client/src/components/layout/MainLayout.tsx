import React from 'react';
import { UnifiedNavigation } from '../navigation/UnifiedNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <UnifiedNavigation />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
};
