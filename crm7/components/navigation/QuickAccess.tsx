'use client';

import { Bell, Plus, Search, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  className?: string;
}

interface QuickAction {
  id: string;
  label: string;
  shortcut?: string;
  href: string;
  icon?: LucideIcon;
}

const quickActions: QuickAction[] = [
  {
    id: 'new-candidate',
    label: 'New Candidate',
    shortcut: 'ctrl+shift+c',
    href: '/candidates/new',
    icon: Plus,
  },
  {
    id: 'new-job',
    label: 'New Job',
    shortcut: 'ctrl+shift+j',
    href: '/jobs/new',
    icon: Plus,
  },
  {
    id: 'schedule',
    label: 'Schedule',
    shortcut: 'ctrl+shift+s',
    href: '/schedule',
    icon: Plus,
  },
];

export function QuickAccess() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [notifications] = React.useState<Notification[]>([]);
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  // Quick action shortcuts
  quickActions.forEach((action) => {
    if (action.shortcut) {
      useHotkeys(action.shortcut, (event: KeyboardEvent) => {
        event.preventDefault();
        router.push(action.href);
        toast({
          title: action.label,
          description: 'Shortcut activated',
        });
      });
    }
  });

  return (
    <div className="flex items-center gap-2">
      {/* Global Search */}
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Quick Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Plus className="h-4 w-4" />
            <span className="sr-only">Quick actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {quickActions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => router.push(action.href)}
            >
              {action.icon && React.createElement(action.icon, {
                className: cn("mr-2 h-4 w-4")
              })}
              <span>{action.label}</span>
              {action.shortcut && (
                <kbd className="ml-auto text-xs">{action.shortcut}</kbd>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Favorites */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Star className="h-4 w-4" />
            <span className="sr-only">Favorites</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {favorites.length === 0 ? (
            <DropdownMenuItem disabled>No favorites yet</DropdownMenuItem>
          ) : (
            favorites.map((id) => {
              const action = quickActions.find((a) => a.id === id);
              if (!action) return null;
              return (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => router.push(action.href)}
                >
                  {action.icon && React.createElement(action.icon, {
                    className: cn("mr-2 h-4 w-4")
                  })}
                  <span>{action.label}</span>
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute right-1 top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            View all notifications ({notifications.length})
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Global Search Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a command or search..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => (
              <CommandItem
                key={action.id}
                onSelect={() => {
                  router.push(action.href);
                  setOpen(false);
                }}
              >
                {action.icon && React.createElement(action.icon, {
                  className: cn("mr-2 h-4 w-4")
                })}
                <span>{action.label}</span>
                {action.shortcut && (
                  <kbd className="ml-auto text-xs">{action.shortcut}</kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recent">
            {/* Add recent items here */}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
