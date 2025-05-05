'use client';

import { Bell, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: '1',
    title: 'New Candidate Application',
    description: 'John Smith has applied for the Senior Developer position',
    timestamp: '5 minutes ago',
    type: 'info',
    read: false,
  },
  {
    id: '2',
    title: 'Document Expiring Soon',
    description: 'Work permit for Sarah Johnson expires in 30 days',
    timestamp: '2 hours ago',
    type: 'warning',
    read: false,
  },
  {
    id: '3',
    title: 'Interview Scheduled',
    description: 'Technical interview scheduled with Mike Brown',
    timestamp: '1 day ago',
    type: 'success',
    read: true,
  },
];

export function Notifications(): JSX.Element {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[380px]" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Notifications</p>
            <p className="text-xs leading-none text-muted-foreground">
              You have {unreadCount} unread messages
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          <DropdownMenuGroup>
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="cursor-pointer">
                <Card className="w-full border-0 shadow-none">
                  <CardHeader className="p-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {notification.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Badge variant="secondary" className="h-5 rounded-sm px-1">
                            New
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="mt-1 text-xs">
                      {notification.timestamp}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                  </CardContent>
                  {!notification.read && (
                    <CardFooter className="p-0 pt-2">
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Check className="mr-1 h-4 w-4" />
                        Mark as read
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="outline" className="w-full justify-center">
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
