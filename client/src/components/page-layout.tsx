import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useRoute } from 'wouter';

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Description text to display below the title */
  description?: string;
  /** Actions to display in the header */
  actions?: ReactNode;
  /** Whether to show a back button */
  showBackButton?: boolean;
  /** URL to navigate to when back button is clicked */
  backUrl?: string;
  /** Whether to disable the back button */
  backDisabled?: boolean;
}

/**
 * Standard page header component with title, description, and actions
 */
export function PageHeader({
  title,
  description,
  actions,
  showBackButton = false,
  backUrl,
  backDisabled = false,
}: PageHeaderProps) {
  const [_, navigate] = useRoute('/dummy');

  const handleBack = () => {
    if (backUrl) {
      window.location.href = backUrl;
    } else {
      window.history.back();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="outline" size="icon" onClick={handleBack} disabled={backDisabled}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

interface PageContentProps {
  /** Content to display */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Standard page content container
 */
export function PageContent({ children, className = '' }: PageContentProps) {
  return <div className={className}>{children}</div>;
}

interface PageLayoutProps {
  /** Page title */
  title: string;
  /** Description text to display below the title */
  description?: string;
  /** Actions to display in the header */
  actions?: ReactNode;
  /** Whether to show a back button */
  showBackButton?: boolean;
  /** URL to navigate to when back button is clicked */
  backUrl?: string;
  /** Whether to disable the back button */
  backDisabled?: boolean;
  /** Content to display */
  children: ReactNode;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Error object if data loading failed */
  error?: Error | null;
  /** Additional CSS classes for the content container */
  className?: string;
}

/**
 * Complete page layout component with header and content
 */
export function PageLayout({
  title,
  description,
  actions,
  showBackButton = false,
  backUrl,
  backDisabled = false,
  children,
  isLoading = false,
  error = null,
  className = '',
}: PageLayoutProps) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={actions}
        showBackButton={showBackButton}
        backUrl={backUrl}
        backDisabled={backDisabled}
      />

      {isLoading ? (
        <Card className="p-4">
          <Skeleton className="h-8 w-full mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      ) : error ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center">
            <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error Loading Data</h2>
            <p className="text-muted-foreground mb-4">
              {error.message || 'An error occurred while loading the data.'}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </Card>
      ) : (
        <PageContent className={className}>{children}</PageContent>
      )}
    </>
  );
}
