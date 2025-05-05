'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { useAuth } from '@/lib/auth/context';

import { Button } from './button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
import { Sidebar } from './sidebar';
import { ThemeToggle } from './theme-toggle';

// Change Navbar’s return type from void to JSX.Element.
export function Navbar(): JSX.Element {
  const { signOut } = useAuth();

  return (
    <header className='sticky top-0 z-40 w-full border-b bg-background'>
      <div className='container flex h-16 items-center'>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='ghost' size='icon' className='md:hidden'>
              <Menu className='h-5 w-5' />
              <span className='sr-only'>Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='w-64 p-0'>
            <SheetHeader className='border-b p-4'>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <Sidebar />
          </SheetContent>
        </Sheet>

        <div className='flex flex-1 items-center justify-between space-x-2 md:justify-end'>
          <div className='w-full flex-1 md:w-auto md:flex-none'>
            <Link href='/' className='mr-6 flex items-center space-x-2'>
              <span className='hidden font-bold sm:inline-block'>CRM System</span>
            </Link>
          </div>

          <div className='flex items-center space-x-2'>
            <ThemeToggle />
            <Button variant='ghost' className='text-sm' onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
