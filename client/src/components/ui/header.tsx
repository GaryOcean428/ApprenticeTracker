import { useState } from "react";
import { Link } from "wouter";
import { Bell, Search, Menu, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import UserNav from "@/components/ui/user-nav";

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
    <header className="z-10 py-4 bg-white dark:bg-[#111827] shadow-sm">
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
              className="w-full pl-10 pr-4 py-2 text-sm dark:bg-[#1f2937] dark:border-[#374151]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        
        <div className="flex items-center flex-shrink-0 space-x-6">
          {/* Quick Links */}
          <div className="hidden md:flex space-x-4">
            <Link href="/fair-work-demo">
              <Button variant="outline" size="sm" className="text-primary flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>Fair Work Award Interpreter</span>
              </Button>
            </Link>
          </div>

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
          
          {/* User Navigation */}
          <UserNav />
        </div>
      </div>
    </header>
  );
};

export default Header;
