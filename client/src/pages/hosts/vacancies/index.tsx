import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { MapPin, Users, CalendarClock, BriefcaseBusiness, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Vacancy {
  id: number;
  hostEmployerId: number;
  title: string;
  location: string;
  startDate: string;
  status: string;
  positionCount: number;
  description: string;
  requirements?: string;
  specialRequirements?: string;
  isRemote?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HostEmployer {
  id: number;
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-200 text-gray-800',
  open: 'bg-green-100 text-green-800',
  filled: 'bg-blue-100 text-blue-800',
  closed: 'bg-red-100 text-red-800',
};

const VacancyCard = ({ vacancy }: { vacancy: Vacancy }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold">{vacancy.title}</h3>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{vacancy.location}</span>
                {vacancy.isRemote && (
                  <Badge variant="outline" className="ml-2">
                    Remote
                  </Badge>
                )}
              </div>
            </div>
            <Badge className={`${statusColors[vacancy.status] || 'bg-gray-100'}`}>
              {vacancy.status.charAt(0).toUpperCase() + vacancy.status.slice(1)}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {vacancy.positionCount} {vacancy.positionCount === 1 ? 'Position' : 'Positions'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <span>Starts {format(new Date(vacancy.startDate), 'MMM d, yyyy')}</span>
            </div>
          </div>

          <p className="text-sm line-clamp-2 text-muted-foreground">{vacancy.description}</p>
        </div>

        <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Created {format(new Date(vacancy.createdAt), 'MMM d, yyyy')}
          </div>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SkeletonVacancyCard = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>

          <div className="flex gap-3 mb-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>

          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </CardContent>
    </Card>
  );
};

const VacanciesPage = () => {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Get all vacancies
  const { data: vacancies, isLoading } = useQuery({
    queryKey: ['/api/vacancies'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/vacancies');
        if (!res.ok) {
          throw new Error('Failed to fetch vacancies');
        }
        return (await res.json()) as Vacancy[];
      } catch (error) {
        console.error('Error fetching vacancies:', error);
        return [];
      }
    },
  });

  // Filter vacancies based on search term and status
  const filteredVacancies = vacancies?.filter(vacancy => {
    const matchesSearch =
      searchTerm === '' ||
      vacancy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || vacancy.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Job Vacancies</h1>
          <p className="text-muted-foreground">Manage your job vacancies and open positions</p>
        </div>
        <Button onClick={() => navigate('/hosts/vacancies/new')}>
          <Plus className="h-4 w-4 mr-2" /> Add Vacancy
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filter Vacancies</CardTitle>
          <CardDescription>
            Narrow down the list of vacancies using the filters below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="mb-2 block">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search titles, locations..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status" className="mb-2 block">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-statuses">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <SkeletonVacancyCard key={index} />
          ))}
        </div>
      ) : filteredVacancies && filteredVacancies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVacancies.map(vacancy => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <BriefcaseBusiness className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No vacancies found</h3>
          <p className="text-muted-foreground mt-2 mb-4 max-w-md mx-auto">
            {searchTerm || statusFilter
              ? 'No vacancies match your filters. Try adjusting your search criteria.'
              : "You haven't created any vacancies yet. Click the button below to get started."}
          </p>
          {!searchTerm && !statusFilter && (
            <Button onClick={() => navigate('/hosts/vacancies/new')}>
              <Plus className="h-4 w-4 mr-2" /> Create Your First Vacancy
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default VacanciesPage;
