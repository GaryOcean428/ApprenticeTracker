import {
  CreditCard,
  LogOut,
  Settings,
  User,
  Moon,
  Sun,
  Keyboard,
  UserCircle,
  Bell,
  Shield,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function UserNav(): JSX.Element {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full border border-gray-200 bg-white/90 shadow-sm hover:bg-gray-100"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage
              src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjE3Nzg0fQ"
              alt="@admin"
            />
            <AvatarFallback>AU</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 user-profile-menu" align="end" forceMount>
        <div className="user-profile-header p-4">
          <div className="flex items-center gap-3 pb-3">
            <Avatar className="h-12 w-12 border-2 border-white shadow-md">
              <AvatarImage
                src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjE3Nzg0fQ"
                alt="@admin"
              />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-medium text-gray-800">Admin User</p>
              <p className="text-sm text-gray-500">admin@crm7.com</p>
              <Badge
                variant="outline"
                className="mt-1 text-xs bg-green-50 text-green-700 border-green-200"
              >
                <Shield className="h-3 w-3 mr-1" /> Administrator
              </Badge>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuGroup>
          <DropdownMenuItem className="user-profile-item">
            <UserCircle className="mr-2 h-4 w-4 text-gray-600" />
            <span>View Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="user-profile-item">
            <CreditCard className="mr-2 h-4 w-4 text-gray-600" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="user-profile-item">
            <Bell className="mr-2 h-4 w-4 text-gray-600" />
            <span>Notifications</span>
            <Badge className="ml-auto text-xs py-0 px-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200">
              3
            </Badge>
          </DropdownMenuItem>
          <DropdownMenuItem className="user-profile-item">
            <Settings className="mr-2 h-4 w-4 text-gray-600" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="user-profile-item">
            <Keyboard className="mr-2 h-4 w-4 text-gray-600" />
            <span>Keyboard shortcuts</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="user-profile-item">
            <div className="flex items-center">
              {theme === 'dark' ? (
                <Moon className="mr-2 h-4 w-4 text-indigo-500" />
              ) : (
                <Sun className="mr-2 h-4 w-4 text-amber-500" />
              )}
              <span>Theme</span>
              <span className="ml-auto text-xs text-gray-500 capitalize">{theme}</span>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={(): void => setTheme('light')} className="user-profile-item">
              <Sun className="mr-2 h-4 w-4 text-amber-500" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(): void => setTheme('dark')} className="user-profile-item">
              <Moon className="mr-2 h-4 w-4 text-indigo-500" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(): void => setTheme('system')}
              className="user-profile-item"
            >
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="user-profile-item text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
