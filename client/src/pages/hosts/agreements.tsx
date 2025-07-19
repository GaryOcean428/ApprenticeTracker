import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  CalendarCheck,
  HardHat,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

// Define types for host employer agreement data
interface HostEmployerAgreement {
  id: number;
  hostEmployerId: number;
  hostEmployerName: string;
  agreementDate: string;
  expiryDate: string;
  status: 'current' | 'expired' | 'pending';
  whsCompliance: 'compliant' | 'review_required' | 'non_compliant';
  documentUrl: string;
}

const HostAgreementsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Fetch all host employer agreements
  const { data: agreements, isLoading } = useQuery({
    queryKey: ['/api/host-agreements'],
    queryFn: async () => {
      const res = await fetch('/api/host-agreements');
      if (!res.ok) {
        // If the endpoint doesn't exist yet, return mock data
        console.warn('API endpoint not available, returning empty array');
        return [];
      }
      return res.json() as Promise<HostEmployerAgreement[]>;
    },
  });

  // Format date for display
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMM yyyy');
  };

  // Filter agreements based on search query and status filter
  const filteredAgreements = agreements
    ? agreements.filter(agreement => {
        const matchesSearch = agreement.hostEmployerName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const matchesStatus = !statusFilter || agreement.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  // Get status badge with appropriate color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'current':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" /> Current
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="mr-1 h-3 w-3" /> Expired
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <CalendarCheck className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get WHS compliance badge
  const getComplianceBadge = (compliance: string) => {
    switch (compliance) {
      case 'compliant':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" /> Compliant
          </Badge>
        );
      case 'review_required':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="mr-1 h-3 w-3" /> Review Required
          </Badge>
        );
      case 'non_compliant':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="mr-1 h-3 w-3" /> Non-Compliant
          </Badge>
        );
      default:
        return <Badge>{compliance}</Badge>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Host Employer Agreements</h1>
        <Link href="/hosts/agreements/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Agreement
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Agreements</CardTitle>
          <CardDescription>
            View and manage all host employer agreements in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by host employer name..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(null)}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'current' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('current')}
              >
                Current
              </Button>
              <Button
                variant={statusFilter === 'expired' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('expired')}
              >
                Expired
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
            </div>
          </div>

          {filteredAgreements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Host Employer</TableHead>
                  <TableHead>Agreement Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>WHS Compliance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgreements.map(agreement => (
                  <TableRow key={agreement.id}>
                    <TableCell>
                      <Link href={`/hosts/${agreement.hostEmployerId}`}>
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {agreement.hostEmployerName}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(agreement.agreementDate)}</TableCell>
                    <TableCell>{formatDate(agreement.expiryDate)}</TableCell>
                    <TableCell>{getStatusBadge(agreement.status)}</TableCell>
                    <TableCell>{getComplianceBadge(agreement.whsCompliance)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Link
                          href={`/hosts/${agreement.hostEmployerId}/agreements/${agreement.id}`}
                        >
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <HardHat className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No agreements found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || statusFilter
                  ? 'Try changing your search or filter criteria'
                  : 'Get started by creating your first host employer agreement'}
              </p>
              <Link href="/hosts/agreements/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> New Agreement
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HostAgreementsPage;
