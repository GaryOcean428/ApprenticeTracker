import { type SidebarSection } from '@/lib/types/sidebar';
import { useState } from 'react';

interface SidebarProps {
  sections: Record<string, SidebarSection[]>;
  pathname: string;
}

export function Sidebar(): React.ReactElement {
  const [_section, setSection] = useState<string>('dashboard');

  return (
    <div className="h-screen w-64 border-r bg-background">
      {/* Sidebar implementation */}
    </div>
  );
}
