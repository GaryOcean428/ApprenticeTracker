import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { TrainingContract, Apprentice } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  FileText,
  Download,
} from 'lucide-react';

const ContractsList = () => {
  const [filter, setFilter] = useState({
    search: '',
    status: '',
  });

  // Fetch all training contracts
  const {
    data: contracts,
    isLoading: isLoadingContracts,
    error: contractsError,
  } = useQuery({
    queryKey: ['/api/contracts'],
    queryFn: async () => {
      const res = await fetch('/api/contracts');
      if (!res.ok) throw new Error('Failed to fetch contracts');
      return res.json() as Promise<TrainingContract[]>;
    },
  });

  // Fetch all apprentices (for displaying names)
  const { data: apprentices, isLoading: isLoadingApprentices } = useQuery({
    queryKey: ['/api/apprentices'],
    queryFn: async () => {
      const res = await fetch('/api/apprentices');
      if (!res.ok) throw new Error('Failed to fetch apprentices');
      return res.json() as Promise<Apprentice[]>;
    },
  });

  // Helper function to get apprentice name by ID
  const getApprenticeName = (apprenticeId: number) => {
    const apprentice = apprentices?.find(a => a.id === apprenticeId);
    return apprentice
      ? `${apprentice.firstName} ${apprentice.lastName}`
      : `Apprentice #${apprenticeId}`;
  };

  // Filter contracts based on search and filters
  const filteredContracts = contracts?.filter(contract => {
    const matchesSearch =
      filter.search === '' ||
      contract.contractNumber.toLowerCase().includes(filter.search.toLowerCase()) ||
      (apprentices &&
        getApprenticeName(contract.apprenticeId)
          .toLowerCase()
          .includes(filter.search.toLowerCase()));

    const matchesStatus = filter.status === '' || contract.status === filter.status;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-success';
      case 'expired':
        return 'bg-red-100 text-destructive';
      case 'on_hold':
        return 'bg-yellow-100 text-warning';
      case 'completed':
        return 'bg-blue-100 text-info';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Format dates for display
  const formatDate = (dateString: Date | string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isLoading = isLoadingContracts || isLoadingApprentices;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Training Contracts</h2>
        <Button asChild>
          <Link href="/contracts/create">
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Training Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by contract number or apprentice..."
                className="pl-8"
                value={filter.search}
                onChange={e => setFilter({ ...filter, search: e.target.value })}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={filter.status}
                onValueChange={value => setFilter({ ...filter, status: value })}
              >
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_statuses">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : contractsError ? (
            <div className="py-8 text-center">
              <p className="text-destructive">Failed to load contracts</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract Number</TableHead>
                    <TableHead>Apprentice</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No contracts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContracts?.map(contract => (
                      <TableRow key={contract.id}>
                        <TableCell>
                          <div className="font-medium">{contract.contractNumber}</div>
                        </TableCell>
                        <TableCell>
                          {isLoadingApprentices ? (
                            <Skeleton className="h-5 w-24" />
                          ) : (
                            getApprenticeName(contract.apprenticeId)
                          )}
                        </TableCell>
                        <TableCell>{formatDate(contract.startDate)}</TableCell>
                        <TableCell>{formatDate(contract.endDate)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(contract.status)}>
                            {contract.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={`/contracts/${contract.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={`/contracts/${contract.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">More</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/contracts/${contract.id}`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                {contract.documentUrl && (
                                  <DropdownMenuItem asChild>
                                    <a
                                      href={contract.documentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Download className="mr-2 h-4 w-4" />
                                      Download Document
                                    </a>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
    </>
  );
};

export default ContractsList;
