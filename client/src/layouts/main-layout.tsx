import { useState } from "react";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile unless toggled */}
      <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} md:block md:static fixed inset-0 z-40 md:z-auto`}>
        <Sidebar />
        {/* Close overlay for mobile */}
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[-1]"
          onClick={toggleMobileSidebar}
        ></div>
      </div>
      
      <div className="flex flex-col flex-1 w-full">
        <Header onMenuToggle={toggleMobileSidebar} />
        
        <main className="h-full overflow-y-auto bg-dark-50">
          <div className="container px-6 mx-auto py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
