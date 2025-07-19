import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Props for LoadingSpinner component
 */
interface LoadingSpinnerProps {
  /** Size of the spinner in pixels */
  size?: number;
  /** Text to display below the spinner */
  text?: string;
  /** CSS classes to apply to the container */
  className?: string;
}

/**
 * Simple loading spinner with optional text
 */
export function LoadingSpinner({ size = 24, text, className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Loader2 className="animate-spin text-primary" style={{ width: size, height: size }} />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

/**
 * Props for LoadingCard component
 */
interface LoadingCardProps {
  /** Title of the card */
  title?: string;
  /** Number of skeleton items to display */
  items?: number;
  /** Height of each skeleton item in pixels */
  itemHeight?: number;
  /** CSS classes to apply to the container */
  className?: string;
}

/**
 * Card with loading skeleton UI for table data
 */
export function LoadingCard({
  title = 'Loading...',
  items = 5,
  itemHeight = 16,
  className,
}: LoadingCardProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: items }).map((_, i) => (
            <Skeleton key={i} className="w-full" style={{ height: `${itemHeight}px` }} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Props for LoadingOverlay component
 */
interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Text to display below the spinner */
  text?: string;
  /** Whether to blur the background */
  blur?: boolean;
  /** CSS classes to apply to the container */
  className?: string;
}

/**
 * Full-screen loading overlay with spinner
 */
export function LoadingOverlay({
  visible,
  text = 'Loading...',
  blur = true,
  className,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        blur ? 'backdrop-blur-sm' : 'bg-background/80',
        className
      )}
    >
      <div className="rounded-lg bg-card p-6 shadow-lg">
        <LoadingSpinner size={32} text={text} />
      </div>
    </div>
  );
}

/**
 * Props for ItemsSkeleton component
 */
interface ItemsSkeletonProps {
  /** Number of skeleton items to display */
  count?: number;
  /** Height of each skeleton item in pixels */
  height?: number;
  /** Whether to show varied widths for more natural look */
  varied?: boolean;
  /** CSS classes to apply to the container */
  className?: string;
}

/**
 * Multiple skeleton items for list/grid loading states
 */
export function ItemsSkeleton({
  count = 3,
  height = 20,
  varied = true,
  className,
}: ItemsSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={varied ? `w-${[100, 70, 85, 90, 80][i % 5]}%` : 'w-full'}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}

/**
 * Props for CardSkeleton component
 */
interface CardSkeletonProps {
  /** Whether to show a header skeleton */
  hasHeader?: boolean;
  /** Whether to show an image skeleton */
  hasImage?: boolean;
  /** Number of text line skeletons */
  lines?: number;
  /** Whether to show footer buttons */
  hasFooter?: boolean;
  /** CSS classes to apply to the container */
  className?: string;
}

/**
 * Skeleton for a standard content card
 */
export function CardSkeleton({
  hasHeader = true,
  hasImage = false,
  lines = 3,
  hasFooter = false,
  className,
}: CardSkeletonProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 shadow-sm', className)}>
      {hasHeader && (
        <div className="mb-4 flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      )}

      {hasImage && <Skeleton className="mb-4 h-48 w-full rounded-md" />}

      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={`h-4 w-${i === lines - 1 ? '3/4' : 'full'}`} />
        ))}
      </div>

      {hasFooter && (
        <div className="mt-4 flex justify-end gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      )}
    </div>
  );
}
