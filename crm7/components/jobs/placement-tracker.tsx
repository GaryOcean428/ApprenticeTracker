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
  DollarSign,
  MoreHorizontal,
  Search
} from 'lucide-react';
import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Placement {
  id: string;
  candidate: {
    id: string;
    name: string;
    avatar: string;
  };
  company: string;
  position: string;
  startDate: string;
  status: 'active' | 'completed' | 'terminated' | 'upcoming';
  type: 'permanent' | 'contract' | 'temporary';
  salary: {
    amount: number;
    currency: string;
    period: 'yearly' | 'monthly' | 'hourly';
  };
  duration?: string;
  billingRate?: {
    amount: number;
    currency: string;
    period: 'yearly' | 'monthly' | 'hourly';
  };
  feedback?: {
    client: number;
    candidate: number;
  };
}

const data: Placement[] = [
  {
    id: '1',
    candidate: {
      id: 'c1',
      name: 'John Smith',
      avatar: 'https://avatar.vercel.sh/1.png',
    },
    company: 'TechCorp Inc.',
    position: 'Senior Software Engineer',
    startDate: '2025-01-15',
    status: 'active',
    type: 'permanent',
    salary: {
      amount: 150000,
      currency: 'USD',
      period: 'yearly',
    },
    feedback: {
      client: 4.8,
      candidate: 4.5,
    },
  },
  {
    id: '2',
    candidate: {
      id: 'c2',
      name: 'Sarah Johnson',
      avatar: 'https://avatar.vercel.sh/2.png',
    },
    company: 'InnovateLabs',
    position: 'Product Manager',
    startDate: '2025-02-01',
    status: 'upcoming',
    type: 'permanent',
    salary: {
      amount: 130000,
      currency: 'USD',
      period: 'yearly',
    },
  },
  {
    id: '3',
    candidate: {
      id: 'c3',
      name: 'Michael Brown',
      avatar: 'https://avatar.vercel.sh/3.png',
    },
    company: 'CloudTech Solutions',
    position: 'DevOps Engineer',
    startDate: '2024-12-01',
    status: 'active',
    type: 'contract',
    salary: {
      amount: 100,
      currency: 'USD',
      period: 'hourly',
    },
    duration: '6 months',
    billingRate: {
      amount: 150,
      currency: 'USD',
      period: 'hourly',
    },
    feedback: {
      client: 4.9,
      candidate: 4.7,
    },
  },
];

const columns: ColumnDef<Placement>[] = [
  {
    accessorKey: 'candidate',
    header: 'Candidate',
    cell: ({ row }): React.JSX.Element => {
      const candidate = row.getValue('candidate') as Placement['candidate'];
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={candidate.avatar} alt={candidate.name} />
            <AvatarFallback>
              {candidate.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium">{candidate.name}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'company',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Company
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }): React.JSX.Element => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        {row.getValue('company')}
      </div>
    ),
  },
  {
    accessorKey: 'position',
    header: 'Position',
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
      const status = row.getValue('status') as Placement['status'];
      return (
        <Badge
          variant={
            status === 'active'
              ? 'success'
              : status === 'completed'
              ? 'default'
              : status === 'upcoming'
              ? 'warning'
              : 'destructive'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    cell: ({ row }): React.JSX.Element => {
      const salary = row.getValue('salary') as Placement['salary'];
      return (
        <div className="flex items-center">
          <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
          {salary.currency} {salary.amount.toLocaleString()}/{salary.period}
        </div>
      );
    },
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }): string => {
      return new Date(row.getValue('startDate')).toLocaleDateString();
    },
  },
  {
    id: 'actions',
    cell: ({ row }): React.JSX.Element => {
      const placement = row.original;

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
            <DropdownMenuItem>Edit placement</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View candidate</DropdownMenuItem>
            <DropdownMenuItem>Contact candidate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              End placement
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function PlacementTracker(): React.ReactElement {
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
            <CardTitle>Placements</CardTitle>
            <CardDescription>
              Track and manage all candidate placements
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Placements</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <div className="flex flex-1 items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search placements..."
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
