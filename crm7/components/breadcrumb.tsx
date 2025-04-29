import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  children: React.ReactNode;
}

interface BreadcrumbItemProps {
  href: string;
  children: React.ReactNode;
}

export function Breadcrumb({ children }: BreadcrumbProps): JSX.Element {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      {children}
    </nav>
  );
}

export function BreadcrumbItem({ href, children }: BreadcrumbItemProps): JSX.Element {
  return (
    <>
      <ChevronRight className="h-4 w-4" />
      <Link href={href} className="hover:text-foreground">
        {children}
      </Link>
    </>
  );
}
