import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { HostEmployer } from "@shared/schema";
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
  Users,
  FileText
} from "lucide-react";

const HostsList = () => {
  const [filter, setFilter] = useState({
    search: "",
    status: "",
    industry: ""
  });
  
  const { data: hosts, isLoading, error } = useQuery({
    queryKey: ['/api/hosts'],
    queryFn: async () => {
      const res = await fetch('/api/hosts');
      if (!res.ok) throw new Error('Failed to fetch hosts');
      return res.json() as Promise<HostEmployer[]>;
    }
  });
  
  // Filter hosts based on search and filters
  const filteredHosts = hosts?.filter(host => {
    const matchesSearch = 
      filter.search === "" || 
      host.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      host.contactPerson.toLowerCase().includes(filter.search.toLowerCase()) ||
      host.email.toLowerCase().includes(filter.search.toLowerCase()) ||
      host.industry.toLowerCase().includes(filter.search.toLowerCase());
    
    const matchesStatus = filter.status === "all_statuses" || host.status === filter.status;
    const matchesIndustry = filter.industry === "all_industries" || host.industry === filter.industry;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });
  
  // Extract unique industries for filter dropdown
  const industries = hosts 
    ? hosts.map(host => host.industry)
      .filter((industry, index, self) => self.indexOf(industry) === index)
    : [];
  
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case "active":
        return "bg-green-100 text-success";
      case "inactive":
        return "bg-red-100 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  const getComplianceBadgeClass = (status: string) => {
    switch(status) {
      case "compliant":
        return "bg-green-100 text-success";
      case "non-compliant":
        return "bg-red-100 text-destructive";
      case "pending":
        return "bg-yellow-100 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Host Management</h2>
        <Button asChild>
          <Link href="/hosts/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Host Employer
          </Link>
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Host Employers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search hosts..."
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
                    <SelectItem value="all_statuses">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={filter.industry}
                  onValueChange={(value) => setFilter({...filter, industry: value})}
                >
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_industries">All Industries</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
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
              <p className="text-destructive">Failed to load host employers</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Host Employer</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Safety Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHosts?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No host employers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHosts?.map((host) => (
                      <TableRow key={host.id}>
                        <TableCell>
                          <div className="font-medium">{host.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {host.address || "No address provided"}
                          </div>
                        </TableCell>
                        <TableCell>{host.industry}</TableCell>
                        <TableCell>
                          <div>{host.contactPerson}</div>
                          <div className="text-sm text-muted-foreground">{host.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getComplianceBadgeClass(host.complianceStatus)}>
                            {host.complianceStatus.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < (host.safetyRating || 0) / 2 
                                    ? "text-yellow-400" 
                                    : "text-gray-300"
                                }`}
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 22 20"
                              >
                                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                              </svg>
                            ))}
                            <span className="ml-1 text-sm">{host.safetyRating || 0}/10</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(host.status)}>
                            {host.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={`/hosts/${host.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={`/hosts/${host.id}/edit`}>
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
                                  <Link href={`/placements?hostId=${host.id}`}>
                                    <Users className="mr-2 h-4 w-4" />
                                    View Placements
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/documents?relatedTo=host&relatedId=${host.id}`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Documents
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

export default HostsList;
