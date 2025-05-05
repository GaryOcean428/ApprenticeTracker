import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  children: React.ReactNode;
  title?: string;
  pageTitle?: string;
}

interface BreadcrumbItemProps {
  href: string;
  children: React.ReactNode;
}

export function Breadcrumb({ children, title, pageTitle }: BreadcrumbProps): JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
      {title !== undefined &&
        title !== null &&
        title !== '' &&
        <h4 className="text-xl font-semibold text-foreground mb-2 sm:mb-0">{title}</h4>}
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
        {pageTitle !== undefined &&
          pageTitle !== null &&
          pageTitle !== '' && (
            <Link href="#" className="hover:text-foreground">
              {pageTitle}
            </Link>
          )}
        {children}
      </nav>
    </div>
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
