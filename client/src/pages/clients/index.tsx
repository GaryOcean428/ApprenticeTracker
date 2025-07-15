import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import {
  ChevronDown,
  Search,
  PlusCircle,
  Filter,
  Building,
  MoreHorizontal,
  Tag,
  Phone,
  Mail,
  Trash2,
  Edit,
  Eye,
  MessageSquare,
  Loader2,
  Users,
  Building2,
  ChevronRight,
  MapPin,
  Globe,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';

// Define types based on our backend schema
interface ClientType {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  isDefault: boolean;
}

interface Client {
  id: number;
  name: string;
  legalName: string | null;
  abn: string | null;
  clientTypeId: number;
  clientType: ClientType;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  status: 'active' | 'inactive' | 'prospect' | 'former';
  website: string | null;
  industry: string | null;
  notes: string | null;
  isHost: boolean;
  primaryContactId: number | null;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
  lastInteractionAt: string | null;
}

interface ClientContact {
  id: number;
  clientId: number;
  contactId: number;
  isPrimary: boolean;
  role: string | null;
  contact: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    mobile: string | null;
    position: string | null;
  };
}

interface NewClient {
  name: string;
  legalName?: string | null;
  abn?: string | null;
  clientTypeId: number;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  status: 'active' | 'inactive' | 'prospect' | 'former';
  website?: string | null;
  industry?: string | null;
  notes?: string | null;
  isHost: boolean;
  organizationId: number;
}

// Main component
export default function ClientsPage() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');

  // New client form state
  const [newClient, setNewClient] = useState<NewClient>({
    name: '',
    clientTypeId: 0, // Will be updated to default when types are loaded
    country: 'Australia',
    status: 'active',
    isHost: false,
    organizationId: 1, // Default organization ID, should be dynamic in real app
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Fetch client types
  const { data: clientTypes = [], isLoading: isTypesLoading } = useQuery<ClientType[]>({
    queryKey: ['/api/clients/types/all'],
  });

  // Set default client type when data is loaded
  useEffect(() => {
    if (newClient.clientTypeId === 0 && clientTypes.length > 0) {
      const defaultType = clientTypes.find(type => type.isDefault) || clientTypes[0];
      setNewClient(prev => ({
        ...prev,
        clientTypeId: defaultType.id,
      }));
    }
  }, [clientTypes]);

  // Fetch clients
  const {
    data: clients = [],
    isLoading: isClientsLoading,
    error: clientsError,
  } = useQuery<Client[]>({
    queryKey: [
      '/api/clients',
      { status: statusFilter, clientType: typeFilter, search: searchQuery, tab: currentTab },
    ],
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (client: NewClient) => {
      const res = await apiRequest('POST', '/api/clients', client);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsCreateDialogOpen(false);
      resetNewClientForm();
      toast({
        title: 'Client created',
        description: 'The client was created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating client',
        description: error.message || 'An error occurred while creating the client.',
        variant: 'destructive',
      });
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/clients/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: 'Client deleted',
        description: 'The client was deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting client',
        description: error.message || 'An error occurred while deleting the client.',
        variant: 'destructive',
      });
    },
  });

  // Handle tab change
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  // Reset new client form
  const resetNewClientForm = () => {
    const defaultType =
      clientTypes.find(type => type.isDefault) ||
      (clientTypes.length > 0 ? clientTypes[0] : { id: 0 });

    setNewClient({
      name: '',
      clientTypeId: defaultType.id,
      country: 'Australia',
      status: 'active',
      isHost: false,
      organizationId: 1, // Default organization ID
    });
    setFormErrors({});
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewClient(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const errors = { ...prev };
        delete errors[name];
        return errors;
      });
    }
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string | number | boolean) => {
    setNewClient(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const errors = { ...prev };
        delete errors[name];
        return errors;
      });
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!newClient.name.trim()) {
      errors.name = 'Client name is required';
    }

    if (!newClient.clientTypeId) {
      errors.clientTypeId = 'Client type is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      createClientMutation.mutate(newClient);
    }
  };

  // Get client type badge
  const getClientTypeBadge = (client: Client) => {
    const type = client.clientType;
    return (
      <Badge
        className="mr-1"
        style={{
          backgroundColor: type.color || '#888888',
          color: '#ffffff',
        }}
      >
        {type.name}
      </Badge>
    );
  };

  // Get client status badge
  const getClientStatusBadge = (status: string) => {
    let badgeStyle = {};

    switch (status) {
      case 'active':
        badgeStyle = { backgroundColor: '#10b981' }; // Green
        break;
      case 'inactive':
        badgeStyle = { backgroundColor: '#6b7280' }; // Gray
        break;
      case 'prospect':
        badgeStyle = { backgroundColor: '#3b82f6' }; // Blue
        break;
      case 'former':
        badgeStyle = { backgroundColor: '#ef4444' }; // Red
        break;
    }

    return (
      <Badge variant="secondary" style={badgeStyle}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Filter clients based on search query and filters
  const filteredClients = clients.filter(client => {
    const searchLower = searchQuery.toLowerCase();

    // Match search query
    const matchesSearch =
      searchQuery === '' ||
      client.name.toLowerCase().includes(searchLower) ||
      (client.legalName && client.legalName.toLowerCase().includes(searchLower)) ||
      (client.abn && client.abn.includes(searchQuery)) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.phone && client.phone.includes(searchQuery)) ||
      (client.industry && client.industry.toLowerCase().includes(searchLower));

    // Match status filter
    const matchesStatus = !statusFilter || client.status === statusFilter;

    // Match type filter
    const matchesType = !typeFilter || client.clientTypeId === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your organization's clients including host employers and other services.
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setLocation('/clients/types')}>
            <Tag className="mr-2 h-4 w-4" />
            Manage Types
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Building className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter by Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isTypesLoading ? (
                <div>Loading client types...</div>
              ) : (
                <>
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="all-types"
                      checked={!typeFilter}
                      onCheckedChange={() => setTypeFilter(null)}
                    />
                    <Label htmlFor="all-types">All Types</Label>
                  </div>

                  {clientTypes.map(type => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type.id}`}
                        checked={typeFilter === type.id}
                        onCheckedChange={() =>
                          setTypeFilter(typeFilter === type.id ? null : type.id)
                        }
                      />
                      <Label htmlFor={`type-${type.id}`} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: type.color || '#888888' }}
                        />
                        {type.name}
                      </Label>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filter by Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="all-status"
                  checked={!statusFilter}
                  onCheckedChange={() => setStatusFilter(null)}
                />
                <Label htmlFor="all-status">All Status</Label>
              </div>

              {['active', 'inactive', 'prospect', 'former'].map(status => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={statusFilter === status}
                    onCheckedChange={() => setStatusFilter(statusFilter === status ? null : status)}
                  />
                  <Label htmlFor={`status-${status}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Total Clients
                  </div>
                  <div className="text-2xl font-bold">{clients.length}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Host Employers
                  </div>
                  <div className="text-2xl font-bold">{clients.filter(c => c.isHost).length}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Prospects</div>
                  <div className="text-2xl font-bold">
                    {clients.filter(c => c.status === 'prospect').length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="md:col-span-3 space-y-6">
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search clients..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced Filters
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
                <DropdownMenuItem>Recently Added</DropdownMenuItem>
                <DropdownMenuItem>Last Interaction</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Industry</DropdownMenuLabel>
                <DropdownMenuItem>Construction</DropdownMenuItem>
                <DropdownMenuItem>Healthcare</DropdownMenuItem>
                <DropdownMenuItem>Information Technology</DropdownMenuItem>
                <DropdownMenuItem>Manufacturing</DropdownMenuItem>
                <DropdownMenuItem>Retail</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="all">All Clients</TabsTrigger>
              <TabsTrigger value="hosts">Host Employers</TabsTrigger>
              <TabsTrigger value="prospects">Prospects</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {renderClientsTable(filteredClients, 'all')}
            </TabsContent>

            <TabsContent value="hosts" className="mt-4">
              {renderClientsTable(
                filteredClients.filter(c => c.isHost),
                'hosts'
              )}
            </TabsContent>

            <TabsContent value="prospects" className="mt-4">
              {renderClientsTable(
                filteredClients.filter(c => c.status === 'prospect'),
                'prospects'
              )}
            </TabsContent>

            <TabsContent value="active" className="mt-4">
              {renderClientsTable(
                filteredClients.filter(c => c.status === 'active'),
                'active'
              )}
            </TabsContent>

            <TabsContent value="inactive" className="mt-4">
              {renderClientsTable(
                filteredClients.filter(c => c.status === 'inactive' || c.status === 'former'),
                'inactive'
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Client Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
            <DialogDescription>
              Add a new client to your organization's directory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newClient.name}
                    onChange={handleInputChange}
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Business Name</Label>
                  <Input
                    id="legalName"
                    name="legalName"
                    value={newClient.legalName || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abn">ABN</Label>
                  <Input
                    id="abn"
                    name="abn"
                    value={newClient.abn || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientTypeId">Client Type</Label>
                  <Select
                    value={newClient.clientTypeId.toString()}
                    onValueChange={value => handleSelectChange('clientTypeId', parseInt(value))}
                  >
                    <SelectTrigger
                      id="clientTypeId"
                      className={formErrors.clientTypeId ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientTypes.map(type => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.clientTypeId && (
                    <p className="text-sm text-red-500">{formErrors.clientTypeId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newClient.status}
                    onValueChange={value => handleSelectChange('status', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="former">Former</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={newClient.industry || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newClient.email || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newClient.phone || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={newClient.website || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={newClient.address || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={newClient.city || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={newClient.state || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={newClient.postalCode || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={newClient.country}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={newClient.notes || ''}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isHost"
                  checked={newClient.isHost}
                  onCheckedChange={checked =>
                    setNewClient(prev => ({ ...prev, isHost: !!checked }))
                  }
                />
                <Label htmlFor="isHost">This client is a Host Employer</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createClientMutation.isPending}>
                {createClientMutation.isPending ? 'Creating...' : 'Create Client'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Helper function to render clients table based on the current tab
  function renderClientsTable(clients: Client[], tabType: string) {
    if (isClientsLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading clients...</span>
          </div>
        </div>
      );
    }

    if (clientsError) {
      return (
        <div className="text-center py-8 text-red-500">
          Error loading clients. Please try again later.
        </div>
      );
    }

    if (clients.length === 0) {
      // Empty state with explanatory message based on tab
      let emptyMessage = 'No clients found.';
      let primaryAction = () => setIsCreateDialogOpen(true);
      let primaryActionText = 'Add New Client';

      switch (tabType) {
        case 'hosts':
          emptyMessage = 'No host employers found.';
          break;
        case 'prospects':
          emptyMessage = 'No prospects found.';
          break;
        case 'active':
          emptyMessage = 'No active clients found.';
          break;
        case 'inactive':
          emptyMessage = 'No inactive clients found.';
          break;
      }

      if (searchQuery || statusFilter || typeFilter) {
        emptyMessage = 'No clients match your current filters.';
        primaryAction = () => {
          setSearchQuery('');
          setStatusFilter(null);
          setTypeFilter(null);
        };
        primaryActionText = 'Clear Filters';
      }

      return (
        <div className="text-center py-12">
          <div className="mb-4">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">{emptyMessage}</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            {searchQuery || statusFilter || typeFilter
              ? "Try adjusting your search or filters to find what you're looking for."
              : 'Start by creating a new client to build your directory.'}
          </p>
          <Button onClick={primaryAction}>{primaryActionText}</Button>
        </div>
      );
    }

    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Type/Status</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map(client => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{client.name}</div>
                    {client.legalName && client.legalName !== client.name && (
                      <div className="text-sm text-muted-foreground">{client.legalName}</div>
                    )}
                    {client.abn && (
                      <div className="text-xs text-muted-foreground">ABN: {client.abn}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>{getClientTypeBadge(client)}</div>
                    <div>{getClientStatusBadge(client.status)}</div>
                    {client.isHost && (
                      <Badge variant="outline" className="bg-blue-50">
                        Host Employer
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {client.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <a href={`mailto:${client.email}`} className="hover:underline">
                          {client.email}
                        </a>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <a href={`tel:${client.phone}`} className="hover:underline">
                          {client.phone}
                        </a>
                      </div>
                    )}
                    {client.website && (
                      <div className="flex items-center text-sm">
                        <Globe className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <a
                          href={client.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {client.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {client.address && (
                    <div className="flex items-start text-sm">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground mt-0.5" />
                      <div>
                        <div>{client.address}</div>
                        {client.city && client.state && (
                          <div>
                            {client.city}, {client.state} {client.postalCode}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setLocation(`/clients/${client.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation(`/clients/${client.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Client
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setLocation(`/clients/${client.id}/contacts`)}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Manage Contacts
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          // Log interaction placeholder
                          toast({
                            title: 'Action completed',
                            description: 'Interaction logged successfully',
                          });
                        }}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Log Interaction
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this client?')) {
                            deleteClientMutation.mutate(client.id);
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}
