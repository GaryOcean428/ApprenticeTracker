'use client';

import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  User,
  Search,
  Command,
  FileText,
  Building2,
  Users,
  Briefcase,
  BarChart3,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

export function CommandPalette(): JSX.Element {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect((): () => void => {
    const down = (e: KeyboardEvent): void => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open): boolean => !open);
      }
    };

    document.addEventListener('keydown', down);
    return (): void => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void): void => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={(): void => setOpen(true)}
        className="inline-flex items-center rounded-sm px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <Command className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-block">Command Menu</span>
        <kbd className="pointer-events-none ml-3 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={(): void => runCommand(() => router.push('/dashboard'))}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Go to Dashboard
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={(): void => runCommand(() => router.push('/candidates'))}
            >
              <Users className="mr-2 h-4 w-4" />
              View Candidates
              <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={(): void => runCommand(() => router.push('/clients'))}
            >
              <Building2 className="mr-2 h-4 w-4" />
              View Clients
              <CommandShortcut>⌘L</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={(): void => runCommand(() => router.push('/jobs'))}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              View Jobs
              <CommandShortcut>⌘J</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Tools">
            <CommandItem
              onSelect={(): void => runCommand(() => router.push('/calendar'))}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </CommandItem>
            <CommandItem
              onSelect={(): void => runCommand(() => router.push('/documents'))}
            >
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </CommandItem>
            <CommandItem
              onSelect={(): void => runCommand(() => router.push('/search'))}
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </CommandItem>
            <CommandItem
              onSelect={(): void => runCommand(() => router.push('/calculator'))}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Calculator
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Account">
            <CommandItem
              onSelect={(): void => runCommand(() => router.push('/settings'))}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={(): void => runCommand(() => router.push('/billing'))}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={(): void => runCommand(() => router.push('/profile'))}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
