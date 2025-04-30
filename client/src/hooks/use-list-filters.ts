import { useState, useCallback, useMemo } from 'react';

/**
 * Generic interface for filter state with common filter properties
 */
export interface BaseFilterState {
  search: string;
  [key: string]: string | number | boolean;
}

/**
 * Hook to manage filter state and filtered data for list views
 */
export function useListFilters<TData, TFilter extends BaseFilterState>(
  initialFilter: TFilter,
  data: TData[] | undefined,
  filterFn: (item: TData, filter: TFilter) => boolean
) {
  // State for filter values
  const [filter, setFilter] = useState<TFilter>(initialFilter);
  
  // Update a single filter field
  const updateFilter = useCallback((field: keyof TFilter, value: any) => {
    setFilter(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Reset all filters to their initial state
  const resetFilters = useCallback(() => {
    setFilter(initialFilter);
  }, [initialFilter]);
  
  // Apply the filter function to the data
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(item => filterFn(item, filter));
  }, [data, filter, filterFn]);
  
  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filter).some(([key, value]) => {
      // Check if the filter has a non-default value
      if (key === 'search' && value !== '') return true;
      if (value === 'all_statuses' || value === 'all_types' || 
          value === 'all_apprentices' || value === 'all_hosts' || 
          value === 'all_industries' || value === 'all_trades') {
        return false;
      }
      return value !== initialFilter[key];
    });
  }, [filter, initialFilter]);
  
  return {
    filter,
    setFilter,
    updateFilter,
    resetFilters,
    filteredData,
    hasActiveFilters
  };
}

/**
 * Helper function to create a case-insensitive search filter
 * that checks multiple fields of an object
 */
export function createSearchFilter<T>(fields: (keyof T)[]) {
  return (item: T, search: string): boolean => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    
    return fields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchLower);
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchLower);
      }
      return false;
    });
  };
}