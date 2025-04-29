'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SubNavItem {
  id: string;
  label: string;
  href: string;
  ariaLabel: string;
  icon?: React.ReactNode;
}

interface SubNavSection {
  id: string;
  label: string;
  items: SubNavItem[];
}

interface SubNavigationProps {
  section: string;
}

const subNavSections: Record<string, SubNavSection[]> = {
  dashboard: [
    {
      id: 'overview',
      label: 'Overview',
      items: [
        {
          id: 'quick-actions',
          label: 'Quick Actions',
          href: '/dashboard/quick-actions',
          ariaLabel: 'Access quick actions',
        },
        {
          id: 'recent-activities',
          label: 'Recent Activities',
          href: '/dashboard/activities',
          ariaLabel: 'View recent activities',
        },
        {
          id: 'notifications',
          label: 'Notifications',
          href: '/dashboard/notifications',
          ariaLabel: 'View notifications',
        },
        {
          id: 'alerts',
          label: 'Alerts & Reminders',
          href: '/dashboard/alerts',
          ariaLabel: 'View alerts and reminders',
        },
        {
          id: 'metrics',
          label: 'Key Metrics',
          href: '/dashboard/metrics',
          ariaLabel: 'View key metrics',
        },
        {
          id: 'tasks',
          label: 'Task List',
          href: '/dashboard/tasks',
          ariaLabel: 'View task list',
        },
        {
          id: 'calendar',
          label: 'Calendar View',
          href: '/dashboard/calendar',
          ariaLabel: 'View calendar',
        },
      ],
    },
  ],
  training: [
    {
      id: 'programs',
      label: 'Training Programs',
      items: [
        {
          id: 'apprentices',
          label: 'Apprentices',
          href: '/training/apprentices',
          ariaLabel: 'Manage apprentices',
        },
        {
          id: 'trainees',
          label: 'Trainees',
          href: '/training/trainees',
          ariaLabel: 'Manage trainees',
        },
        {
          id: 'courses',
          label: 'Course Catalog',
          href: '/training/courses',
          ariaLabel: 'Browse course catalog',
        },
        {
          id: 'calendar',
          label: 'Training Calendar',
          href: '/training/calendar',
          ariaLabel: 'View training calendar',
        },
      ],
    },
    {
      id: 'assessments',
      label: 'Assessments & Certifications',
      items: [
        {
          id: 'assessments',
          label: 'Assessments',
          href: '/training/assessments',
          ariaLabel: 'Manage assessments',
        },
        {
          id: 'certifications',
          label: 'Certifications',
          href: '/training/certifications',
          ariaLabel: 'Manage certifications',
        },
        {
          id: 'skills',
          label: 'Skills Matrix',
          href: '/training/skills',
          ariaLabel: 'View skills matrix',
        },
      ],
    },
  ],
  // Add other sections as needed
};

export function SubNavigation({ section }: SubNavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    return pathname === href;
  };

  const sections = subNavSections[section] || [];

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="space-y-4 py-4" role="navigation" aria-label="Sub Navigation">
        <Accordion type="single" collapsible className="w-full">
          {sections.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="text-sm">
                {section.label}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      aria-label={item.ariaLabel}
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        className={cn(
                          'flex items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                          isActive(item.href) && 'bg-accent text-accent-foreground'
                        )}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        <ChevronRight
                          className={cn(
                            'ml-auto h-4 w-4 transition-transform',
                            isActive(item.href) && 'rotate-90'
                          )}
                        />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ScrollArea>
  );
}
