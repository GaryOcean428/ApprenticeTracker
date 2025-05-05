'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  Building2,
  ChevronDown,
  Clock,
  DollarSign,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  status: 'open' | 'closed' | 'on-hold' | 'filled';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  applicants: number;
  posted: string;
  deadline: string;
}

const data: Job[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'full-time',
    status: 'open',
    salary: {
      min: 120000,
      max: 180000,
      currency: 'USD',
    },
    applicants: 45,
    posted: '2025-01-15',
    deadline: '2025-03-15',
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'InnovateLabs',
    location: 'New York, NY',
    type: 'full-time',
    status: 'open',
    salary: {
      min: 100000,
      max: 150000,
      currency: 'USD',
    },
    applicants: 32,
    posted: '2025-01-20',
    deadline: '2025-03-01',
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    company: 'CloudTech Solutions',
    location: 'Remote',
    type: 'contract',
    status: 'open',
    salary: {
      min: 90000,
      max: 140000,
      currency: 'USD',
    },
    applicants: 28,
    posted: '2025-01-25',
    deadline: '2025-02-28',
  },
];

const columns: ColumnDef<Job>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }): React.JSX.Element => (
      <div>
        <div className="font-medium">{row.getValue('title')}</div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Building2 className="mr-1 h-4 w-4" />
          {row.original.company}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }): React.JSX.Element => (
      <div className="flex items-center">
        <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
        {row.getValue('location')}
      </div>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }): React.JSX.Element => (
      <Badge variant="outline">{row.getValue('type')}</Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }): React.JSX.Element => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'open'
              ? 'success'
              : status === 'filled'
              ? 'default'
              : status === 'on-hold'
              ? 'warning'
              : 'secondary'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'salary',
    header: 'Salary Range',
    cell: ({ row }): React.JSX.Element => {
      const salary = row.getValue('salary') as Job['salary'];
      return (
        <div className="flex items-center">
          <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
          {salary.currency} {salary.min.toLocaleString()} -{' '}
          {salary.max.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: 'applicants',
    header: 'Applicants',
    cell: ({ row }): React.JSX.Element => (
      <div className="flex items-center">
        <Users className="mr-1 h-4 w-4 text-muted-foreground" />
        {row.getValue('applicants')}
      </div>
    ),
  },
  {
    accessorKey: 'deadline',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Deadline
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }): React.JSX.Element => {
      const deadline = new Date(row.getValue('deadline'));
      const daysLeft = Math.ceil(
        (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      );
      return (
        <div className="flex items-center">
          <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
          {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }): React.JSX.Element => {
      const job = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>View applicants</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit job</DropdownMenuItem>
            <DropdownMenuItem>Close job</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Delete job
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function JobList(): React.ReactElement {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Jobs</CardTitle>
            <CardDescription>
              Manage and track all job postings
            </CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <div className="flex flex-1 items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={globalFilter}
              onChange={(e): void => setGlobalFilter(e.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
