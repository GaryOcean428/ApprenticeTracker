import React, { Fragment, useEffect, useState } from 'react';
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  Table as ReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { rankItem } from '@tanstack/match-sorter-utils';

import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

// Column Filter component
interface FilterProps {
  column: Column<Record<string, unknown>, unknown>;
  table: ReactTable<Record<string, unknown>>;
}

const Filter = ({
  column,
  table: _table,
}: FilterProps): React.ReactElement => {
  const columnFilterValue = column.getFilterValue();

  return (
    <>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder="Search..."
        className="w-36 border shadow rounded"
        list={column.id + 'list'}
      />
      <div className="h-1" />
    </>
  );
};

// Global Filter / Debounced Input component
interface DebouncedInputProps 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: DebouncedInputProps): React.ReactElement => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [debounce, onChange, value]);

  return (
    <Input 
      {...props} 
      value={value} 
      id="search-bar-0" 
      className="form-control search" 
      onChange={(e) => setValue(e.target.value)} 
    />
  );
};

// TableContainer props interface
interface TableContainerProps {
  columns: ColumnDef<Record<string, unknown>, unknown>[];
  data: Record<string, unknown>[];
  isGlobalFilter?: boolean;
  customPageSize?: number;
  tableClass?: string;
  theadClass?: string;
  trClass?: string;
  thClass?: string;
  divClass?: string;
  SearchPlaceholder?: string;
}

// Helper for safe stringification
const safeToString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'object') {
    // Properly handle objects to prevent [object Object] stringification
    try {
      // For arrays and objects that can be serialized
      return JSON.stringify(value);
    } catch {
      // If serialization fails, return a more descriptive string
      return `[${typeof value}]`;
    }
  }
  
  return String(value);
};

// Fuzzy filter function
const fuzzyFilter: FilterFn<Record<string, unknown>> = (
  row, 
  columnId, 
  value, 
  addMeta
) => {
  // Convert value to string to ensure compatibility with rankItem
  const safeValue = value ?? '';
  const stringValue = safeToString(safeValue);
  
  const cellValue = row.getValue(columnId);
  const safeCellValue = cellValue ?? '';
  const stringCellValue = safeToString(safeCellValue);
  
  // Use rankItem to get the ranking info
  const rankResult = rankItem(stringCellValue, stringValue);
  
  // For third-party library integration - disable eslint for this specific operation
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  addMeta(rankResult);
  
  // Return the passed result
  return rankResult.passed;
};

const TableContainer = ({
  columns,
  data,
  isGlobalFilter,
  customPageSize,
  tableClass,
  theadClass,
  trClass,
  thClass,
  divClass,
  SearchPlaceholder,
}: TableContainerProps): React.ReactElement => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    columns,
    data,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const {
    getHeaderGroups,
    getRowModel,
    getCanPreviousPage,
    getCanNextPage,
    getPageOptions,
    setPageIndex,
    nextPage,
    previousPage,
    setPageSize,
    getState,
  } = table;

  useEffect(() => {
    // Set custom page size if provided and valid
    if (typeof customPageSize === 'number' && customPageSize > 0) {
      setPageSize(customPageSize);
    }
  }, [customPageSize, setPageSize]);

  return (
    <Fragment>
      {isGlobalFilter === true && (
        <div className="mb-3">
          <div className="border border-dashed border-x-0">
            <div className="p-3">
              <div className="flex">
                <div className="search-box me-2 mb-2 inline-block">
                  <DebouncedInput
                    value={globalFilter ?? ''}
                    onChange={(value) => setGlobalFilter(String(value))}
                    placeholder={SearchPlaceholder}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={divClass}>
        <Table className={tableClass}>
          <TableHeader className={theadClass}>
            {getHeaderGroups().map((headerGroup) => (
              <TableRow className={trClass} key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className={thClass} 
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {!header.isPlaceholder && (
                      <Fragment>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="ml-1">
                            {{
                              asc: ' ▲',
                              desc: ' ▼',
                            }[header.column.getIsSorted() as string] ?? ' ◦'}
                          </span>
                        )}
                        {header.column.getCanFilter() && (
                          <div>
                            <Filter column={header.column} table={table} />
                          </div>
                        )}
                      </Fragment>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center mt-2 g-3 text-center text-sm-start">
        <div className="flex-1">
          <div className="text-muted">
            Showing <span className="fw-semibold ms-1">
              {getState().pagination.pageSize}
            </span> of <span className="fw-semibold">
              {data.length}
            </span> Results
          </div>
        </div>
        <div className="flex-auto">
          <ul className="flex space-x-1 justify-center sm:justify-start mb-0">
            <li>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => previousPage()} 
                disabled={!getCanPreviousPage()}
              >
                Previous
              </Button>
            </li>
            {getPageOptions().map((pageIndex) => (
              <li key={`page-${pageIndex}`}>
                <Button 
                  variant={getState().pagination.pageIndex === pageIndex 
                    ? 'default' 
                    : 'outline'
                  } 
                  size="sm" 
                  onClick={() => setPageIndex(pageIndex)}
                >
                  {pageIndex + 1}
                </Button>
              </li>
            ))}
            <li>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => nextPage()} 
                disabled={!getCanNextPage()}
              >
                Next
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </Fragment>
  );
};

export default TableContainer;
