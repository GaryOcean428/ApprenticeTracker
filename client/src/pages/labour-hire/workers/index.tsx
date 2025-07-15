import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MoreHorizontal, Plus, Search, Filter, ArrowUpDown, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { LabourHireWorker } from '@shared/schema';
import { PageHeader } from '@/components/page-header';
import { DashboardShell } from '@/components/dashboard-shell';
import { SkeletonTable } from '@/components/skeleton-table';

export default function LabourHireWorkersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');

  // Fetch labour hire workers data
  const {
    data: workers = [],
    isLoading,
    error,
  } = useQuery<LabourHireWorker[]>({
    queryKey: ['/api/labour-hire/workers'],
  });

  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load workers. Please try again.',
      variant: 'destructive',
    });
  }

  // Filter workers based on search query and filters
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch =
      searchQuery === '' ||
      worker.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.occupation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || worker.status === filterStatus;

    const matchesTab =
      selectedTab === 'all' ||
      (selectedTab === 'active' && worker.status === 'active') ||
      (selectedTab === 'inactive' && worker.status === 'inactive');

    return matchesSearch && matchesStatus && matchesTab;
  });

  // Calculate pagination
  const pageSize = 10;
  const totalPages = Math.ceil(filteredWorkers.length / pageSize);
  const paginatedWorkers = filteredWorkers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Render avatar with initials
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format date helper
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  return (
    <DashboardShell>
      <PageHeader heading="Labour Hire Workers" description="Manage your labour hire workers here.">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Worker</DialogTitle>
              <DialogDescription>
                Enter the details for the new labour hire worker.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col space-y-4 py-4">
              {/* Form elements will go here */}
              <p className="text-sm text-muted-foreground">Form coming soon...</p>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Tabs defaultValue="all" className="mt-6" onValueChange={setSelectedTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Workers</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search workers..."
                className="w-[200px] pl-8 md:w-[300px]"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <SkeletonTable columns={6} rows={5} />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Worker</TableHead>
                        <TableHead>Occupation</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Hourly Rate</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedWorkers.length > 0 ? (
                        paginatedWorkers.map(worker => (
                          <TableRow key={worker.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage
                                    src={worker.profileImage || ''}
                                    alt={`${worker.firstName} ${worker.lastName}`}
                                  />
                                  <AvatarFallback>
                                    {getInitials(worker.firstName, worker.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {worker.firstName} {worker.lastName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {worker.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{worker.occupation}</TableCell>
                            <TableCell>{getStatusBadge(worker.status)}</TableCell>
                            <TableCell>
                              {worker.startDate ? formatDate(worker.startDate) : 'N/A'}
                            </TableCell>
                            <TableCell>${worker.hourlyRate || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <Link href={`/labour-hire/workers/${worker.id}`}>
                                      View details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Edit worker</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Link href={`/labour-hire/placements?workerId=${worker.id}`}>
                                      View placements
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Link href={`/labour-hire/timesheets?workerId=${worker.id}`}>
                                      View timesheets
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Delete worker
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No workers found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {filteredWorkers.length > pageSize && (
                    <div className="flex items-center justify-end px-4 py-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={e => {
                                e.preventDefault();
                                setCurrentPage(prev => Math.max(prev - 1, 1));
                              }}
                            />
                          </PaginationItem>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={e => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={e => {
                                e.preventDefault();
                                setCurrentPage(prev => Math.min(prev + 1, totalPages));
                              }}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs have similar content but with different filters */}
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {/* Similar table structure for active workers */}
              {isLoading ? (
                <SkeletonTable columns={6} rows={5} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Worker</TableHead>
                      <TableHead>Occupation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Filtered for active workers */}
                    {paginatedWorkers.length > 0 ? (
                      paginatedWorkers.map(worker => (
                        <TableRow key={worker.id}>
                          {/* Same row structure as above */}
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage
                                  src={worker.profileImage || ''}
                                  alt={`${worker.firstName} ${worker.lastName}`}
                                />
                                <AvatarFallback>
                                  {getInitials(worker.firstName, worker.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {worker.firstName} {worker.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">{worker.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{worker.occupation}</TableCell>
                          <TableCell>{getStatusBadge(worker.status)}</TableCell>
                          <TableCell>
                            {worker.startDate ? formatDate(worker.startDate) : 'N/A'}
                          </TableCell>
                          <TableCell>${worker.hourlyRate || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Link href={`/labour-hire/workers/${worker.id}`}>
                                    View details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit worker</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Link href={`/labour-hire/placements?workerId=${worker.id}`}>
                                    View placements
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Link href={`/labour-hire/timesheets?workerId=${worker.id}`}>
                                    View timesheets
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Delete worker
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No active workers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {/* Similar table structure for inactive workers */}
              {isLoading ? (
                <SkeletonTable columns={6} rows={5} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Worker</TableHead>
                      <TableHead>Occupation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Filtered for inactive workers */}
                    {paginatedWorkers.length > 0 ? (
                      paginatedWorkers.map(worker => (
                        <TableRow key={worker.id}>
                          {/* Similar row structure with end date instead of hourly rate */}
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage
                                  src={worker.profileImage || ''}
                                  alt={`${worker.firstName} ${worker.lastName}`}
                                />
                                <AvatarFallback>
                                  {getInitials(worker.firstName, worker.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {worker.firstName} {worker.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">{worker.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{worker.occupation}</TableCell>
                          <TableCell>{getStatusBadge(worker.status)}</TableCell>
                          <TableCell>
                            {worker.startDate ? formatDate(worker.startDate) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {worker.endDate ? formatDate(worker.endDate) : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Link href={`/labour-hire/workers/${worker.id}`}>
                                    View details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>Reactivate worker</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Link href={`/labour-hire/placements?workerId=${worker.id}`}>
                                    View past placements
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Delete worker
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No inactive workers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
