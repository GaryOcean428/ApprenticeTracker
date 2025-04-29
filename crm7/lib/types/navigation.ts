import { type LucideIcon } from 'lucide-react';

export interface NavigationItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  label?: string;
  slug?: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}
