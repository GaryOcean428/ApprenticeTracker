'use client';

import { Sidebar } from './Sidebar';
import TopNav from './TopNav';
import { MAIN_NAV_ITEMS } from '@/config/navigation';

export default function Layout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className='min-h-screen bg-gray-50'>
      <TopNav items={MAIN_NAV_ITEMS} />
      <Sidebar />
      <main className='ml-64 pt-14'>{children}</main>
    </div>
  );
}
