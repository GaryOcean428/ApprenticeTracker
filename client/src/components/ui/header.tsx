import { useState } from "react";
import { Link } from "wouter";
import { Bell, Search, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Search initiated",
        description: `Searching for: ${searchQuery}`,
      });
    }
  };
  
  return (
    <header className="z-10 py-4 bg-white dark:bg-background shadow-sm">
      <div className="flex items-center justify-between h-full px-6 mx-auto">
        {/* Mobile hamburger */}
        <Button 
          variant="ghost" 
          size="icon"
          className="p-1 mr-5 -ml-1 rounded-md md:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        {/* Search bar */}
        <div className="flex justify-center flex-1 lg:mr-32">
          <form className="relative w-full max-w-xl mr-6" onSubmit={handleSearch}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search for apprentices, hosts, documents..."
              className="w-full pl-10 pr-4 py-2 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        
        <div className="flex items-center flex-shrink-0 space-x-6">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon"
            className="relative p-2 text-muted-foreground rounded-full hover:bg-muted hover:text-foreground"
            onClick={() => {
              toast({
                title: "Notifications",
                description: "You have 3 unread notifications",
              });
            }}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-destructive rounded-full border-2 border-white dark:border-background"></span>
          </Button>
          
          {/* Profile menu */}
          <div className="relative">
            <Link href="/profile">
              <Avatar className="cursor-pointer">
                <AvatarImage src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjE3Nzg0fQ" alt="Admin User" />
                <AvatarFallback>AU</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
