'use client';

import { Menu } from 'lucide-react';

import { SearchBar } from './dashboard/search';
import { UserNav } from './dashboard/user-nav';
import { Button } from './ui/button';
import { Sidebar } from './ui/sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps): React.ReactElement {
  return (
    <div className='flex min-h-screen bg-background'>
      <Sidebar />
      <div className='flex-1'>
        <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
          <div className='container flex h-14 items-center'>
            <Button
              variant='ghost'
              size='icon'
              className='md:hidden'
            >
              <Menu className='h-5 w-5' />
              <span className='sr-only'>Toggle menu</span>
            </Button>
            <div className='flex flex-1 items-center justify-between space-x-2 md:justify-end'>
              <div className='w-full flex-1 md:w-auto md:flex-none'>
                <SearchBar />
              </div>
              <UserNav />
            </div>
          </div>
        </header>
        <main className='flex-1 space-y-4 p-8 pt-6'>{children}</main>
      </div>
    </div>
  );
}
