export interface SidebarSection {
  title: string;
  items: Array<{
    title: string;
    href: string;
    icon?: React.ComponentType;
  }>;
}
