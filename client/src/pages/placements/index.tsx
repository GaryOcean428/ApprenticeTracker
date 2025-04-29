import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Placement, Apprentice, HostEmployer } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  MoreHorizontal, 
  Plus, 
  Search,
  Filter,
  User,
  Building2,
  CalendarRange
} from "lucide-react";

const PlacementsList = () => {
  const [location, params] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const apprenticeIdParam = searchParams.get('apprenticeId');
  const hostIdParam = searchParams.get('hostId');
  
  const [filter, setFilter] = useState({
    search: "",
    status: "",
    apprenticeId: apprenticeIdParam || "",
    hostEmployerId: hostIdParam || ""
  });
  
  // Fetch all placements
  const { data: placements, isLoading: isLoadingPlacements, error: placementsError } = useQuery({
    queryKey: ['/api/placements'],
    queryFn: async () => {
      const res = await fetch('/api/placements');
      if (!res.ok) throw new Error('Failed to fetch placements');
      return res.json() as Promise<Placement[]>;
    }
  });
  
  // Fetch all apprentices
  const { data: apprentices, isLoading: isLoadingApprentices } = useQuery({
    queryKey: ['/api/apprentices'],
    queryFn: async () => {
      const res = await fetch('/api/apprentices');
      if (!res.ok) throw new Error('Failed to fetch apprentices');
      return res.json() as Promise<Apprentice[]>;
    }
  });
  
  // Fetch all hosts
  const { data: hosts, isLoading: isLoadingHosts } = useQuery({
    queryKey: ['/api/hosts'],
    queryFn: async () => {
      const res = await fetch('/api/hosts');
      if (!res.ok) throw new Error('Failed to fetch hosts');
      return res.json() as Promise<HostEmployer[]>;
    }
  });
  
  // Helper functions to get apprentice and host names by ID
  const getApprenticeName = (apprenticeId: number) => {
    const apprentice = apprentices?.find(a => a.id === apprenticeId);
    return apprentice ? `${apprentice.firstName} ${apprentice.lastName}` : `Apprentice #${apprenticeId}`;
  };
  
  const getHostName = (hostEmployerId: number) => {
    const host = hosts?.find(h => h.id === hostEmployerId);
    return host ? host.name : `Host #${hostEmployerId}`;
  };
  
  // Filter placements based on search and filters
  const filteredPlacements = placements?.filter(placement => {
    const matchesSearch = 
      filter.search === "" || 
      placement.position.toLowerCase().includes(filter.search.toLowerCase()) ||
      (apprentices && getApprenticeName(placement.apprenticeId).toLowerCase().includes(filter.search.toLowerCase())) ||
      (hosts && getHostName(placement.hostEmployerId).toLowerCase().includes(filter.search.toLowerCase()));
    
    const matchesStatus = filter.status === "" || placement.status === filter.status;
    const matchesApprentice = filter.apprenticeId === "" || placement.apprenticeId === parseInt(filter.apprenticeId);
    const matchesHost = filter.hostEmployerId === "" || placement.hostEmployerId === parseInt(filter.hostEmployerId);
    
    return matchesSearch && matchesStatus && matchesApprentice && matchesHost;
  });
  
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case "active":
        return "bg-green-100 text-success";
      case "completed":
        return "bg-blue-100 text-info";
      case "on_hold":
        return "bg-yellow-100 text-warning";
      case "cancelled":
        return "bg-red-100 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  // Format dates for display
  const formatDate = (dateString?: Date | string | null) => {
    if (!dateString) return "Present";
    return new Date(dateString).toLocaleDateString();
  };
  
  const isLoading = isLoadingPlacements || isLoadingApprentices || isLoadingHosts;
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          {filter.apprenticeId 
            ? `Placements for ${getApprenticeName(parseInt(filter.apprenticeId))}` 
            : filter.hostEmployerId 
              ? `Placements at ${getHostName(parseInt(filter.hostEmployerId))}` 
              : "Apprentice Placements"}
        </h2>
        <Button asChild>
          <Link href={`/placements/create${
            filter.apprenticeId ? `?apprenticeId=${filter.apprenticeId}` : 
            filter.hostEmployerId ? `?hostId=${filter.hostEmployerId}` : ''
          }`}>
            <Plus className="mr-2 h-4 w-4" />
            New Placement
          </Link>
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Placements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search placements..."
                className="pl-8"
                value={filter.search}
                onChange={(e) => setFilter({...filter, search: e.target.value})}
              />
            </div>
            <div className="flex gap-4 flex-wrap md:flex-nowrap">
              <div className="w-full md:w-48">
                <Select
                  value={filter.status}
                  onValueChange={(value) => setFilter({...filter, status: value})}
                >
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {!filter.apprenticeId && (
                <div className="w-full md:w-48">
                  <Select
                    value={filter.apprenticeId}
                    onValueChange={(value) => setFilter({...filter, apprenticeId: value})}
                  >
                    <SelectTrigger>
                      <User className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Apprentice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Apprentices</SelectItem>
                      {apprentices?.map((apprentice) => (
                        <SelectItem key={apprentice.id} value={apprentice.id.toString()}>
                          {apprentice.firstName} {apprentice.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {!filter.hostEmployerId && (
                <div className="w-full md:w-48">
                  <Select
                    value={filter.hostEmployerId}
                    onValueChange={(value) => setFilter({...filter, hostEmployerId: value})}
                  >
                    <SelectTrigger>
                      <Building2 className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Host Employer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Hosts</SelectItem>
                      {hosts?.map((host) => (
                        <SelectItem key={host.id} value={host.id.toString()}>
                          {host.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : placementsError ? (
            <div className="py-8 text-center">
              <p className="text-destructive">Failed to load placements</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    {!filter.apprenticeId && <TableHead>Apprentice</TableHead>}
                    {!filter.hostEmployerId && <TableHead>Host Employer</TableHead>}
                    <TableHead>Duration</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlacements?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={filter.apprenticeId || filter.hostEmployerId ? 5 : 7} className="h-24 text-center">
                        No placements found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPlacements?.map((placement) => (
                      <TableRow key={placement.id}>
                        <TableCell>
                          <div className="font-medium">{placement.position}</div>
                        </TableCell>
                        {!filter.apprenticeId && (
                          <TableCell>
                            {isLoadingApprentices ? (
                              <Skeleton className="h-5 w-24" />
                            ) : (
                              <Link href={`/apprentices/${placement.apprenticeId}`} className="text-primary hover:underline">
                                {getApprenticeName(placement.apprenticeId)}
                              </Link>
                            )}
                          </TableCell>
                        )}
                        {!filter.hostEmployerId && (
                          <TableCell>
                            {isLoadingHosts ? (
                              <Skeleton className="h-5 w-24" />
                            ) : (
                              <Link href={`/hosts/${placement.hostEmployerId}`} className="text-primary hover:underline">
                                {getHostName(placement.hostEmployerId)}
                              </Link>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center">
                            <CalendarRange className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{formatDate(placement.startDate)} - {formatDate(placement.endDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {placement.supervisor || "Not assigned"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(placement.status)}>
                            {placement.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={`/placements/${placement.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={`/placements/${placement.id}/edit`}>
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
                                {filter.apprenticeId === "" && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/apprentices/${placement.apprenticeId}`}>
                                      <User className="mr-2 h-4 w-4" />
                                      View Apprentice
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                {filter.hostEmployerId === "" && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/hosts/${placement.hostEmployerId}`}>
                                      <Building2 className="mr-2 h-4 w-4" />
                                      View Host
                                    </Link>
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

export default PlacementsList;
