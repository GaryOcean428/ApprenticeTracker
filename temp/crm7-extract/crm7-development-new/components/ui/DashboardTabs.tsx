interface Tab {
  id: string;
  label: string;
}

interface DashboardTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function DashboardTabs({ tabs, activeTab, onTabChange }: DashboardTabsProps): JSX.Element {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={(): void => onTabChange(tab.id)}
            className={`
              whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium
              ${tab.id === activeTab
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
