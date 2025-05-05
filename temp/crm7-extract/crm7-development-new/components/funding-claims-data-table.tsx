'use client';

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
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

const data: FundingClaim[] = [
  {
    id: '1',
    programCode: 'AAIP-2023',
    apprenticeName: 'John Smith',
    employerName: 'TechCorp Pty Ltd',
    claimDate: '2023-06-15',
    amount: 4000,
    status: 'Approved',
  },
  {
    id: '2',
    programCode: 'NSW-AWS-2023',
    apprenticeName: 'Sarah Johnson',
    employerName: 'BuildRight Construction',
    claimDate: '2023-07-01',
    amount: 3000,
    status: 'Pending',
  },
  {
    id: '3',
    programCode: 'QLD-ATB-2023',
    apprenticeName: 'Michael Brown',
    employerName: 'Queensland Electrics',
    claimDate: '2023-07-10',
    amount: 2500,
    status: 'Under Review',
  },
  {
    id: '4',
    programCode: 'VIC-JSI-2023',
    apprenticeName: 'Emily Taylor',
    employerName: 'Melbourne Plumbing Services',
    claimDate: '2023-06-30',
    amount: 3500,
    status: 'Approved',
  },
  {
    id: '5',
    programCode: 'RRSSI-2023',
    apprenticeName: 'David Wilson',
    employerName: 'Rural Mechanics Ltd',
    claimDate: '2023-07-05',
    amount: 5000,
    status: 'Pending',
  },
];

export type FundingClaim = {
  id: string;
  programCode: string;
  apprenticeName: string;
  employerName: string;
  claimDate: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
};

export const columns: ColumnDef<FundingClaim>[] = [
  {
    accessorKey: 'programCode',
    header: 'Program Code',
    cell: ({ row }): React.JSX.Element => <div>{row.getValue('programCode')}</div>,
  },
  {
    accessorKey: 'apprenticeName',
    header: 'Apprentice Name',
    cell: ({ row }): React.JSX.Element => <div>{row.getValue('apprenticeName')}</div>,
  },
  {
    accessorKey: 'employerName',
    header: 'Employer Name',
    cell: ({ row }): React.JSX.Element => <div>{row.getValue('employerName')}</div>,
  },
  {
    accessorKey: 'claimDate',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Claim Date
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }): React.JSX.Element => <div>{row.getValue('claimDate')}</div>,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }): React.JSX.Element => <div>${row.getValue('amount')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }): React.JSX.Element => <div className='capitalize'>{row.getValue('status')}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const claim = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='h-8 w-8 p-0'
            >
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={(): Promise<void> => navigator.clipboard.writeText(claim.id)}>
              Copy claim ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Update status</DropdownMenuItem>
            <DropdownMenuItem>View supporting documents</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function FundingClaimsDataTable(): React.ReactElement {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter claims..."
          value={(table.getColumn('apprenticeName')?.getFilterValue() as string) ?? ''}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            table.getColumn('apprenticeName')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
