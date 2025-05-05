'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface Organization {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
}

interface DashboardHeaderProps {
  user: User;
  organizations: Organization[];
}

export function DashboardHeader({ user, organizations }: Readonly<DashboardHeaderProps>) {
  const [selectedOrg, setSelectedOrg] = useState<string>(
    organizations.length > 0 ? organizations[0].id : ''
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.email?.split('@')[0] || 'User'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {organizations.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2">
                <Select
                  value={selectedOrg}
                  onValueChange={(value) => setSelectedOrg(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={user.email || ''} />
            <AvatarFallback>
              {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
