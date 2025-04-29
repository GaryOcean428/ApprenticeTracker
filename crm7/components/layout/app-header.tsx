'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { UserNav } from '@/components/ui/user-nav';
import { useSidebarContext } from '@/lib/hooks/use-sidebar-context';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  className?: string;
}

export function AppHeader({ className = '' }: AppHeaderProps): JSX.Element {
  const { toggleSidebar } = useSidebarContext();

  return (
    <header className={cn('sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      <div className="flex h-16 items-center gap-4 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative flex flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0"
            >
              3
            </Badge>
          </Button>

          <Separator orientation="vertical" className="h-6" />
          
          <UserNav />
        </div>
      </div>
    </header>
  );
}
