import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { PlusCircle, FileText, Sliders, Filter, Search, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
// We don't need MainLayout as it's handled by the App.tsx route wrapper

export default function ChargeRatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('calculationDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Fetch charge rate calculations
  const { data: chargeRates, isLoading } = useQuery({
    queryKey: ['/api/payroll/charge-rates'],
    select: (data: any) => data?.data || [],
  });

  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format currency
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(numValue);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter and sort calculations
  const filteredAndSortedCalculations = React.useMemo(() => {
    if (!chargeRates) return [];

    // Filter by search term and status
    let filtered = [...chargeRates];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(calc => {
        return (
          calc.apprenticeName?.toLowerCase().includes(searchLower) ||
          calc.hostEmployerName?.toLowerCase().includes(searchLower) ||
          calc.id.toString().includes(searchLower)
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(calc => {
        if (statusFilter === 'approved') return calc.approved;
        if (statusFilter === 'rejected') return !!calc.rejectionReason;
        if (statusFilter === 'pending') return !calc.approved && !calc.rejectionReason;
        return true;
      });
    }

    // Sort
    return filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof typeof a];
      let bValue: any = b[sortField as keyof typeof b];

      // Handle string values that represent numbers
      if (sortField === 'payRate' || sortField === 'chargeRate') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      // Handle date values
      if (sortField === 'calculationDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [chargeRates, searchTerm, statusFilter, sortField, sortDirection]);

  // Status badge component
  const StatusBadge = ({ calculation }: { calculation: any }) => {
    if (calculation.approved) {
      return <Badge className="bg-green-500">Approved</Badge>;
    } else if (calculation.rejectionReason) {
      return <Badge variant="destructive">Rejected</Badge>;
    } else {
      return <Badge variant="outline" className="border-amber-500 text-amber-500">Pending</Badge>;
    }
  };

  return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Charge Rate Calculations</h1>
            <p className="text-muted-foreground mt-1">
              Manage and review charge rate calculations for apprentices and host employers.
            </p>
          </div>
          <Button asChild>
            <Link href="/charge-rates/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Calculation
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Calculation History</CardTitle>
            <CardDescription>
              View, filter, and manage charge rate calculations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search calculations..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex space-x-2">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 font-medium"
                          onClick={() => handleSort('id')}
                        >
                          ID
                          {sortField === 'id' && (
                            <ArrowUpDown className={`h-3 w-3 ml-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 font-medium text-left"
                          onClick={() => handleSort('apprenticeName')}
                        >
                          Apprentice
                          {sortField === 'apprenticeName' && (
                            <ArrowUpDown className={`h-3 w-3 ml-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 font-medium text-left"
                          onClick={() => handleSort('hostEmployerName')}
                        >
                          Host Employer
                          {sortField === 'hostEmployerName' && (
                            <ArrowUpDown className={`h-3 w-3 ml-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 font-medium"
                          onClick={() => handleSort('payRate')}
                        >
                          Pay Rate
                          {sortField === 'payRate' && (
                            <ArrowUpDown className={`h-3 w-3 ml-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 font-medium"
                          onClick={() => handleSort('chargeRate')}
                        >
                          Charge Rate
                          {sortField === 'chargeRate' && (
                            <ArrowUpDown className={`h-3 w-3 ml-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 font-medium text-left"
                          onClick={() => handleSort('calculationDate')}
                        >
                          Date
                          {sortField === 'calculationDate' && (
                            <ArrowUpDown className={`h-3 w-3 ml-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedCalculations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          No charge rate calculations found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedCalculations.map((calculation) => (
                        <TableRow key={calculation.id}>
                          <TableCell className="font-medium">{calculation.id}</TableCell>
                          <TableCell>{calculation.apprenticeName || 'N/A'}</TableCell>
                          <TableCell>{calculation.hostEmployerName || 'N/A'}</TableCell>
                          <TableCell className="text-right">{formatCurrency(calculation.payRate)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(calculation.chargeRate)}</TableCell>
                          <TableCell>{formatDate(calculation.calculationDate)}</TableCell>
                          <TableCell>
                            <StatusBadge calculation={calculation} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <Sliders className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/charge-rates/${calculation.id}`}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
