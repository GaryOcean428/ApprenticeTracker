import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Apprentice } from "@shared/schema";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  MoreHorizontal, 
  FileText, 
  Plus, 
  Search,
  Filter
} from "lucide-react";

const ApprenticesList = () => {
  const [filter, setFilter] = useState({
    search: "",
    status: "",
    trade: ""
  });
  
  const { data: apprentices, isLoading, error } = useQuery({
    queryKey: ['/api/apprentices'],
    queryFn: async () => {
      const res = await fetch('/api/apprentices');
      if (!res.ok) throw new Error('Failed to fetch apprentices');
      return res.json() as Promise<Apprentice[]>;
    }
  });
  
  // Filter apprentices based on search and filters
  const filteredApprentices = apprentices?.filter(apprentice => {
    const matchesSearch = 
      filter.search === "" || 
      apprentice.firstName.toLowerCase().includes(filter.search.toLowerCase()) ||
      apprentice.lastName.toLowerCase().includes(filter.search.toLowerCase()) ||
      apprentice.email.toLowerCase().includes(filter.search.toLowerCase()) ||
      apprentice.trade.toLowerCase().includes(filter.search.toLowerCase());
    
    const matchesStatus = filter.status === "" || apprentice.status === filter.status;
    const matchesTrade = filter.trade === "" || apprentice.trade === filter.trade;
    
    return matchesSearch && matchesStatus && matchesTrade;
  });
  
  // Extract unique trades for filter dropdown
  const trades = apprentices 
    ? [...new Set(apprentices.map(apprentice => apprentice.trade))]
    : [];
  
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case "active":
        return "bg-green-100 text-success";
      case "on_hold":
        return "bg-red-100 text-destructive";
      case "completed":
        return "bg-blue-100 text-info";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Apprentice Management</h2>
        <Button asChild>
          <Link href="/apprentices/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Apprentice
          </Link>
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Apprentices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search apprentices..."
                className="pl-8"
                value={filter.search}
                onChange={(e) => setFilter({...filter, search: e.target.value})}
              />
            </div>
            <div className="flex gap-4">
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
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={filter.trade}
                  onValueChange={(value) => setFilter({...filter, trade: value})}
                >
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Trade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Trades</SelectItem>
                    {trades.map((trade) => (
                      <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-destructive">Failed to load apprentices</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Trade</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApprentices?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No apprentices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApprentices?.map((apprentice) => (
                      <TableRow key={apprentice.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage 
                                src={apprentice.profileImage || ""} 
                                alt={`${apprentice.firstName} ${apprentice.lastName}`} 
                              />
                              <AvatarFallback>
                                {apprentice.firstName.charAt(0) + apprentice.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{apprentice.firstName} {apprentice.lastName}</div>
                              <div className="text-sm text-muted-foreground">{apprentice.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{apprentice.trade}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Progress value={apprentice.progress || 0} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              {apprentice.progress || 0}% Complete
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {apprentice.startDate ? new Date(apprentice.startDate).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(apprentice.status)} capitalize`}>
                            {apprentice.status.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={`/apprentices/${apprentice.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={`/apprentices/${apprentice.id}/edit`}>
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
                                  <Link href={`/contracts?apprenticeId=${apprentice.id}`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Contracts
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/placements?apprenticeId=${apprentice.id}`}>
                                    <Building2 className="mr-2 h-4 w-4" />
                                    View Placements
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/timesheets?apprenticeId=${apprentice.id}`}>
                                    <Clock className="mr-2 h-4 w-4" />
                                    View Timesheets
                                  </Link>
                                </DropdownMenuItem>
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

import { Building2, Clock } from "lucide-react";

export default ApprenticesList;
