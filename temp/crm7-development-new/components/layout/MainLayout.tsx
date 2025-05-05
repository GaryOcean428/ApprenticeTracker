import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Sidebar, SidebarProvider } from './improved-sidebar';
import { MAIN_NAV_ITEMS } from '@/config/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps): JSX.Element {
  return (
    <div className='min-h-screen bg-background'>
      <ErrorBoundary>
        <SidebarProvider>
          <Sidebar />
          <div
            className={cn(
              'flex flex-col transition-all duration-300 ease-in-out',
              'lg:ml-[theme(spacing.sidebar-width)]',
              className,
            )}
          >
            <Header items={MAIN_NAV_ITEMS} />
            <main className='container mx-auto p-6 pt-[calc(theme(spacing.header-height)+1.5rem)]'>
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </div>
        </SidebarProvider>
      </ErrorBoundary>
    </div>
  );
}
