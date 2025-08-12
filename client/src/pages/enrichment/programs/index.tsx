import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Filter, Plus, Search, Tag, Users } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Loader,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/common';

interface EnrichmentProgram {
  id: number;
  name: string;
  description: string;
  category: string;
  status: string;
  startDate: string;
  endDate: string | null;
  participantCount: number;
  tags: string[];
}

const EnrichmentProgramsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    data: programs = [],
    isLoading,
    error,
  } = useQuery<EnrichmentProgram[]>({
    queryKey: ['/api/enrichment/programs'],
  });

  // Filter programs based on search term, category, and status
  const filteredPrograms = programs.filter(program => {
    const matchesSearch =
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || program.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || program.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(programs.map(program => program.category))];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Enrichment Programs</h1>
          <p className="text-muted-foreground mt-2">
            Manage ongoing enrichment programs for apprentices
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Program
        </Button>
      </div>

      {error ? (
        <Alert variant="error" className="mb-6">
          <AlertTitle>Error Loading Programs</AlertTitle>
          <AlertDescription>
            There was a problem loading the enrichment programs. Please try again later.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle>Programs</CardTitle>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search programs..."
                  className="pl-8 w-full h-9 rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="h-9 rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">All Categories</option>
                {categories
                  .filter(cat => cat !== 'all')
                  .map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" text="Loading programs..." />
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'No programs matching your filters'
                : 'No programs found. Create a new program to get started.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map(program => (
                <Card
                  key={program.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className={`h-2 w-full 
                    ${program.status === 'active' ? 'bg-green-500' : ''}
                    ${program.status === 'upcoming' ? 'bg-blue-500' : ''}
                    ${program.status === 'completed' ? 'bg-gray-500' : ''}
                    ${program.status === 'cancelled' ? 'bg-red-500' : ''}
                  `}
                  ></div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{program.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{program.category}</p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                        ${program.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${program.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        ${program.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' : ''}
                        ${program.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                      `}
                      >
                        {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 mb-4">{program.description}</p>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>
                          {new Date(program.startDate).toLocaleDateString()}
                          {program.endDate
                            ? ` - ${new Date(program.endDate).toLocaleDateString()}`
                            : ''}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        <span>{program.participantCount}</span>
                      </div>
                    </div>

                    {program.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4">
                        {program.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
                          >
                            <Tag className="mr-1 h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end mt-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrichmentProgramsPage;
