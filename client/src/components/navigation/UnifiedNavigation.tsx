import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { MAIN_NAV_SECTIONS } from '../../config/unified-navigation';
import { ChevronDown } from 'lucide-react';

export const UnifiedNavigation: React.FC = () => {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    // Default to first section expanded
    'Apprentices & Trainees': true,
  });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (href: string) => {
    return location === href || location.startsWith(`${href}/`);
  };

  return (
    <div className="unified-navigation bg-background border-r border-border h-full w-64 flex flex-col overflow-auto">
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-bold">CRM7</h1>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {MAIN_NAV_SECTIONS.map(section => {
            const SectionIcon = section.icon;
            const hasSubItems = section.subItems && section.subItems.length > 0;
            const isExpanded = expandedSections[section.title] || false;
            const sectionActive = section.href ? isActive(section.href) : false;

            return (
              <li key={section.title} className="rounded-lg overflow-hidden">
                <div
                  className={`flex items-center justify-between p-2 cursor-pointer hover:bg-muted ${sectionActive ? 'bg-muted' : ''}`}
                  onClick={() => hasSubItems && toggleSection(section.title)}
                >
                  <div className="flex items-center">
                    {SectionIcon && <SectionIcon className="h-5 w-5 mr-2" />}
                    {section.href ? (
                      <Link
                        href={section.href}
                        className={`flex-1 ${sectionActive ? 'font-medium' : ''}`}
                        onClick={e => hasSubItems && e.preventDefault()}
                      >
                        {section.title}
                      </Link>
                    ) : (
                      <span className="flex-1">{section.title}</span>
                    )}
                  </div>
                  {hasSubItems && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                    />
                  )}
                </div>

                {hasSubItems && isExpanded && section.subItems && (
                  <div className="pl-8 bg-background/50">
                    {section.subItems?.map((subItemGroup, groupIndex) => (
                      <div key={groupIndex} className="py-1">
                        {subItemGroup.map(subItem => {
                          const subItemActive = isActive(subItem.href);
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`block py-1 px-2 text-sm rounded hover:bg-muted ${subItemActive ? 'bg-muted/70 font-medium' : ''}`}
                            >
                              {subItem.title}
                            </Link>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        <p>CRM7 Workforce Management</p>
        <p>Version 1.0</p>
      </div>
    </div>
  );
};
