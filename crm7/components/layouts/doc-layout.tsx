'use client';

import { Breadcrumb } from '@/components/navigation/breadcrumb';
import { DocSearch } from '@/components/navigation/doc-search';
import { SectionSidebar, type sections } from '@/components/navigation/section-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePathname } from 'next/navigation';

interface DocLayoutProps {
  children: React.ReactNode;
  section?: keyof typeof sections;
}

export function DocLayout({ children, section }: DocLayoutProps): React.ReactElement {
  const pathname = usePathname();
  
  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <div className='hidden w-64 shrink-0 border-r bg-background lg:block'>
        <ScrollArea className='h-screen py-6 pr-6 lg:py-8'>
          <SectionSidebar section={section} />
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className='flex-1'>
        <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
          <div className='container flex h-14 items-center gap-4'>
            <Breadcrumb pathname={pathname || ''} />
            <div className='ml-auto flex items-center space-x-4'>
              <DocSearch />
            </div>
          </div>
        </header>

        <main className='container py-6 lg:py-8'>{children}</main>
      </div>
    </div>
  );
}
