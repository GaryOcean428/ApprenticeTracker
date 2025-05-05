'use client';

import { PlusIcon, UserPlusIcon, CalendarIcon, DollarSignIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QuickActions(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button asChild className="w-full justify-start">
          <Link href="/candidates/new">
            <UserPlusIcon className="mr-2 h-4 w-4" />
            Add Candidate
          </Link>
        </Button>
        <Button asChild className="w-full justify-start">
          <Link href="/schedule">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Schedule
          </Link>
        </Button>
        <Button asChild className="w-full justify-start">
          <Link href="/submit-claim">
            <DollarSignIcon className="mr-2 h-4 w-4" />
            Submit Claim
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
