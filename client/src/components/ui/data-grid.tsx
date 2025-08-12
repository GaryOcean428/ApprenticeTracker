import type { ReactNode } from 'react';
import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export interface DataGridColumn<T> {
  /** Unique identifier for the column */
  id: string;
  /** Header text */
  header: string;
  /** Function to get the cell value */
  cell: (item: T) => ReactNode;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Custom class names for the cells in this column */
  className?: string;
}

export interface DataGridProps<T> {
  /** The data to display */
  data: T[] | undefined;
  /** Column definitions */
  columns: DataGridColumn<T>[];
  /** Title shown in the card header */
  title: string;
  /** Whether data is currently loading */
  isLoading?: boolean;
  /** Error message if data loading failed */
  error?: Error | null;
  /** Function to render the filter panel */
  renderFilters?: () => ReactNode;
  /** Whether filters are currently active */
  hasActiveFilters?: boolean;
  /** Function to reset all filters */
  onResetFilters?: () => void;
  /** Function to handle search input */
  onSearch?: (search: string) => void;
  /** Current search value */
  searchValue?: string;
  /** Message to show when there is no data */
  emptyMessage?: string;
  /** Key function to identify each item */
  keyExtractor?: (item: T) => string | number;
  /** Additional action buttons to render in the header */
  actions?: ReactNode;
}

/**
 * DataGrid component for displaying tabular data with filtering, sorting, and pagination
 */
export function DataGrid<T>({
  data,
  columns,
  title,
  isLoading = false,
  error = null,
  renderFilters,
  hasActiveFilters = false,
  onResetFilters,
  onSearch,
  searchValue = '',
  emptyMessage = 'No data found.',
  keyExtractor = (item: any) => item.id,
  actions,
}: DataGridProps<T>) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-y-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">{actions}</div>
      </CardHeader>

      <CardContent>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search input */}
          {onSearch && (
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 dark:bg-[#1f2937] dark:border-[#374151]"
                value={searchValue}
                onChange={e => onSearch(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter toggle button */}
            {renderFilters && (
              <Button
                variant="outline"
                size="sm"
                className={hasActiveFilters ? 'border-primary' : ''}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {hasActiveFilters && <span className="ml-1 rounded-full bg-primary w-2 h-2" />}
              </Button>
            )}

            {/* Reset filters button */}
            {hasActiveFilters && onResetFilters && (
              <Button variant="ghost" size="sm" onClick={onResetFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && renderFilters && (
          <div className="mb-4 rounded-md border p-4">{renderFilters()}</div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : /* Error state */
        error ? (
          <div className="py-8 text-center">
            <p className="text-destructive">{error.message || 'An error occurred'}</p>
          </div>
        ) : (
          /* Data table */
          <div className="rounded-md border dark:border-[#374151]">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(column => (
                    <TableHead key={column.id} className={column.className}>
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data || data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map(item => (
                    <TableRow key={keyExtractor(item)}>
                      {columns.map(column => (
                        <TableCell
                          key={`${keyExtractor(item)}-${column.id}`}
                          className={column.className}
                        >
                          {column.cell(item)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
