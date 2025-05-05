import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

// Define types for navigation items
interface NavItemBase {
  label: string;
}

interface NavHeader extends NavItemBase {
  isHeader: true;
}

interface NavLink extends NavItemBase {
  isHeader?: false;
  icon?: string;
  link: string;
  subItems?: never;
}

interface NavDropdown extends NavItemBase {
  isHeader?: false;
  icon?: string;
  link?: never;
  subItems: NavLink[];
}

type NavItem = NavHeader | NavLink | NavDropdown;

// Simplified menu data structure
const navData: NavItem[] = [
  {
    isHeader: true,
    label: 'Menu',
  },
  {
    label: 'Dashboards',
    icon: 'lucide-react/Home', // Placeholder for icon class
    link: '/dashboard',
  },
  {
    label: 'CRM',
    icon: 'lucide-react/Users', // Placeholder for icon class
    subItems: [
      {
        label: 'Leads',
        link: '/leads',
      },
      {
        label: 'Contacts',
        link: '/contacts',
      },
      {
        label: 'Companies',
        link: '/companies',
      },
    ],
  },
  // Add more menu items as needed
];

// Type for DOM menu item
interface DOMMenuItem {
  href?: string;
  classList?: {
    add: (className: string) => void;
    remove: (className: string) => void;
  };
}

const VerticalSidebarLayout = (): React.ReactElement => {
  const pathname = usePathname();

  // Simplified resize logic (adapt as needed for Tailwind/CSS)
  const resizeSidebarMenu = useCallback((): void => {
    const windowSize = document.documentElement.clientWidth;
    
    // Logic is shared through conditions - simplified to single check
    if (windowSize <= 767) {
      // Small screens logic
      // Implementation left empty as unused
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', resizeSidebarMenu, true);
    return () => {
      window.removeEventListener('resize', resizeSidebarMenu, true);
    };
  }, [resizeSidebarMenu]);

  useEffect(() => {
    // Logic to highlight active menu item based on pathname
    const initMenu = (): void => {
      const ul = document.getElementById('navbar-nav');
      if (ul) {
        const items = ul.getElementsByTagName('a');
        const itemsArray = Array.from(items) as DOMMenuItem[];
        
        itemsArray.forEach(item => {
          const itemHref = item.href ?? '';
          if (itemHref === window.location.href) {
            item.classList?.add('active');
            // Add logic to open parent dropdowns
          } else {
            item.classList?.remove('active');
          }
        });
      }
    };
    initMenu();
  }, [pathname]);

  // Helper for rendering menu item - handles the nested ternaries
  const renderMenuItem = (item: NavItem, idx: number): JSX.Element => {
    if ('isHeader' in item && item.isHeader === true) {
      return (
        <li 
          key={`header-${idx}`} 
          className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase"
        >
          {item.label}
        </li>
      );
    }
    
    if ('subItems' in item && Array.isArray(item.subItems)) {
      return (
        <li key={`menu-${idx}`} className="nav-item">
          <button 
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-white 
              rounded-md hover:bg-gray-700"
          >
            <span className="ml-3">{item.label}</span>
            <ChevronDown 
              className="ml-auto h-4 w-4 transform transition-transform duration-200" 
            />
          </button>
          <ul className="ml-4 space-y-1">
            {item.subItems.map((subItem, subIdx) => (
              <li key={`submenu-${idx}-${subIdx}`}>
                <Link 
                  href={subItem.link} 
                  className="flex items-center px-3 py-2 text-sm font-medium 
                    text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
                >
                  {subItem.label}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      );
    }
    
    // Must be a NavLink by this point
    const linkItem = item as NavLink;
    return (
      <li key={`link-${idx}`} className="nav-item">
        <Link 
          href={linkItem.link} 
          className="flex items-center px-3 py-2 text-sm font-medium 
            text-white rounded-md hover:bg-gray-700"
        >
          <span className="ml-3">{linkItem.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="bg-gray-800 text-white w-64 flex flex-col">
        <div className="p-4 text-center border-b border-gray-700">
          <span className="text-xl font-semibold">CRM7R</span>
        </div>
        <nav className="flex-1 px-2 py-4" id="navbar-nav">
          <ul className="space-y-1">
            {navData.map((item, idx) => renderMenuItem(item, idx))}
          </ul>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header (can integrate the enhanced Header component here) */}
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Children prop to render page content */}
        </main>
      </div>
    </div>
  );
};

export default VerticalSidebarLayout;
