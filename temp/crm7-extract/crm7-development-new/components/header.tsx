import * as React from 'react';
import { UserNav } from '@/components/dashboard/user-nav';
import Link from 'next/link';
import { Search, Globe, ShoppingCart, Maximize2, Bell, Moon, Sun } from 'lucide-react';

// Placeholder components for future implementation
function SearchOption(): React.ReactElement {
  return (
    <div className="relative ml-4 hidden md:block">
      <input
        type="text"
        placeholder="Search..."
        className="pl-10 pr-4 py-2 w-64 bg-muted rounded-full text-sm focus:outline-none 
          focus:ring-2 focus:ring-primary"
      />
      <Search 
      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" 
    />
    </div>
  );
}

function LanguageDropdown(): React.ReactElement {
  return (
    <button 
      className="ml-2 p-2 rounded-full text-muted-foreground hover:bg-muted" 
      aria-label="Language Selection"
    >
      <Globe className="h-5 w-5" />
    </button>
  );
}

function WebAppsDropdown(): React.ReactElement {
  return (
    <button 
      className="ml-2 p-2 rounded-full text-muted-foreground hover:bg-muted" 
      aria-label="Web Applications"
    >
      <span className="text-sm">Apps</span>
    </button>
  );
}

function MyCartDropdown(): React.ReactElement {
  return (
    <button 
      className="ml-2 p-2 rounded-full text-muted-foreground hover:bg-muted" 
      aria-label="Shopping Cart"
    >
      <ShoppingCart className="h-5 w-5" />
    </button>
  );
}

function FullScreenDropdown(): React.ReactElement {
  return (
    <button 
      className="ml-2 p-2 rounded-full text-muted-foreground hover:bg-muted" 
      aria-label="Full Screen Mode"
    >
      <Maximize2 className="h-5 w-5" />
    </button>
  );
}

function NotificationDropdown(): React.ReactElement {
  return (
    <button 
      className="ml-2 p-2 rounded-full text-muted-foreground hover:bg-muted" 
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
    </button>
  );
}

function LightDark({ onChangeLayoutMode, layoutMode }: { onChangeLayoutMode: () => void; layoutMode: string }): React.ReactElement {
  return (
    <button
      className="ml-2 p-2 rounded-full text-muted-foreground hover:bg-muted"
      onClick={onChangeLayoutMode}
      aria-label="Toggle Light/Dark Mode"
    >
      {layoutMode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

export function Header(): React.ReactElement {
  const [layoutMode, setLayoutMode] = React.useState('light');

  const handleLayoutModeChange = () => {
    setLayoutMode(layoutMode === 'dark' ? 'light' : 'dark');
    // Logic to toggle dark/light mode can be added here if needed
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur 
      supports-[backdrop-filter]:bg-background/60`}>
      <div className="container flex h-14 items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold">CRM7R</span>
          </Link>
          <SearchOption />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <LanguageDropdown />
          <WebAppsDropdown />
          <MyCartDropdown />
          <FullScreenDropdown />
          <LightDark onChangeLayoutMode={handleLayoutModeChange} layoutMode={layoutMode} />
          <NotificationDropdown />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
