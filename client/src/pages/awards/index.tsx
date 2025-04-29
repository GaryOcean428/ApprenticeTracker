import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Plus, Edit, Trash2, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";

const AwardsList = () => {
  const [filter, setFilter] = useState({
    search: "",
    status: "all_statuses",
  });
  
  // Fetch awards
  const { data: awards, isLoading, error } = useQuery({
    queryKey: ['/api/awards'],
    queryFn: async () => {
      const res = await fetch('/api/awards');
      if (!res.ok) throw new Error('Failed to fetch awards');
      return res.json();
    }
  });
  
  // Filter awards based on search and filters
  const filteredAwards = awards?.filter(award => {
    const matchesSearch = 
      filter.search === "" || 
      award.name?.toLowerCase().includes(filter.search.toLowerCase()) ||
      award.code?.toLowerCase().includes(filter.search.toLowerCase()) ||
      award.fairWorkTitle?.toLowerCase().includes(filter.search.toLowerCase());
    
    const matchesStatus = filter.status === "all_statuses" || 
      (filter.status === "active" && award.isActive) ||
      (filter.status === "inactive" && !award.isActive);
    
    return matchesSearch && matchesStatus;
  });
  
  // Format dates for display
  const formatDate = (dateString?: Date | string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  // Handle award deletion
  const deleteAward = async (id: number) => {
    try {
      const res = await fetch(`/api/awards/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete award');
      }
      
      toast.success('Award deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/awards'] });
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading awards...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Failed to load awards"}
          </p>
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/awards'] })}
            className="mt-4"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Fair Work Awards</h2>
        <Button asChild>
          <Link href="/awards/create">
            <Plus className="mr-2 h-4 w-4" />
            New Award
          </Link>
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Modern Awards Management</CardTitle>
          <CardDescription>
            Manage Fair Work Modern Awards and their classifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search awards..."
                className="pl-8"
                value={filter.search}
                onChange={(e) => setFilter({...filter, search: e.target.value})}
              />
            </div>
            <Select
              value={filter.status}
              onValueChange={(value) => setFilter({...filter, status: value})}
            >
              <SelectTrigger className="w-full md:w-48">
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
          
          {filteredAwards && filteredAwards.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Fair Work Reference</TableHead>
                    <TableHead className="hidden md:table-cell">Effective Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAwards.map((award) => (
                    <TableRow key={award.id}>
                      <TableCell className="font-medium">{award.code}</TableCell>
                      <TableCell>{award.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{award.fairWorkReference || 'N/A'}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(award.effectiveDate)}</TableCell>
                      <TableCell>
                        {award.isActive ? (
                          <Badge variant="default" className="bg-green-100 text-success">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/awards/${award.id}/classifications`}>
                              <CalendarClock className="h-4 w-4" />
                              <span className="sr-only">View classifications</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/awards/${award.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit award</span>
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete award</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Award</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the award "{award.name}"? This action cannot be undone and may affect apprentices, host employers, and payroll data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteAward(award.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-md">
              <p className="text-muted-foreground mb-4">No awards found.</p>
              <Button asChild>
                <Link href="/awards/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Award
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AwardsList;