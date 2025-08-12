import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import type { UnitOfCompetency } from '@shared/schema';
import {
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Plus,
  Search,
  CheckCircle,
  XCircle,
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

export default function UnitsOfCompetencyList() {
  const { toast } = useToast();
  const [filter, setFilter] = useState({
    search: '',
    trainingPackage: '',
    isActive: '',
  });

  // Fetch units of competency
  const {
    data: units,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/vet/units'],
    queryFn: async () => {
      const res = await fetch('/api/vet/units');
      if (!res.ok) throw new Error('Failed to fetch units of competency');
      return res.json() as Promise<UnitOfCompetency[]>;
    },
  });

  // Fetch training packages for filter
  const { data: trainingPackages } = useQuery({
    queryKey: ['/api/vet/training-packages'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/vet/training-packages');
        if (!res.ok) throw new Error('Failed to fetch training packages');
        return res.json() as Promise<string[]>;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch training packages.',
          variant: 'destructive',
        });
        return [];
      }
    },
  });

  // Filter units based on search and filters
  const filteredUnits = units?.filter(unit => {
    const matchesSearch =
      filter.search === '' ||
      (unit.unitCode?.toLowerCase() || '').includes(filter.search.toLowerCase()) ||
      (unit.unitTitle?.toLowerCase() || '').includes(filter.search.toLowerCase());

    const matchesTrainingPackage =
      filter.trainingPackage === '' || unit.trainingPackage === filter.trainingPackage;

    const matchesStatus =
      filter.isActive === '' ||
      (filter.isActive === 'active' && unit.isActive) ||
      (filter.isActive === 'inactive' && !unit.isActive);

    return matchesSearch && matchesTrainingPackage && matchesStatus;
  });

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Units of Competency</h2>
        <Button asChild>
          <Link href="/vet/units/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Unit of Competency
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Units of Competency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by code or title..."
                className="pl-8"
                value={filter.search}
                onChange={e => setFilter({ ...filter, search: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <Select
                value={filter.trainingPackage}
                onValueChange={value => setFilter({ ...filter, trainingPackage: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Training Package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-packages">All Training Packages</SelectItem>
                  {trainingPackages?.map(tp => (
                    <SelectItem key={tp} value={tp}>
                      {tp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filter.isActive}
                onValueChange={value => setFilter({ ...filter, isActive: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-statuses">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-destructive">Failed to load units of competency</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit Code</TableHead>
                    <TableHead>Unit Title</TableHead>
                    <TableHead>Training Package</TableHead>
                    <TableHead>Release</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No units of competency found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUnits?.map(unit => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">{unit.unitCode}</TableCell>
                        <TableCell>{unit.unitTitle}</TableCell>
                        <TableCell>{unit.trainingPackage}</TableCell>
                        <TableCell>{unit.releaseNumber}</TableCell>
                        <TableCell>
                          {unit.isActive ? (
                            <Badge className="bg-green-100 text-success">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-destructive text-destructive"
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/vet/units/${unit.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/vet/units/${unit.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Unit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  toast({
                                    title: 'Not Implemented',
                                    description: 'Delete functionality will be implemented soon.',
                                    variant: 'default',
                                  });
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Unit
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
    </>
  );
}
