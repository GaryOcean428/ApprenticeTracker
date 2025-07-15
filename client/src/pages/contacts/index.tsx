import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import {
  ChevronDown,
  Search,
  PlusCircle,
  Filter,
  UserPlus,
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
  UserX,
  ChevronRight,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiRequest } from '@/lib/queryClient';

// Define types based on our backend schema
interface ContactTag {
  id: number;
  name: string;
  color: string;
  description: string | null;
  isSystem: boolean;
}

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  mobile: string | null;
  position: string | null;
  primaryRole: string;
  notes: string | null;
  isActive: boolean;
  organizationId: number | null;
  createdAt: string;
  updatedAt: string;
  tags: ContactTag[];
  lastContactedAt: string | null;
  profileImage?: string | null;
}

interface ContactGroup {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NewContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  mobile: string | null;
  position: string | null;
  primaryRole: string;
  notes: string | null;
  organizationId?: number | null;
  isActive: boolean;
}

// Main component
export default function ContactsPage() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');

  // New contact form state
  const [newContact, setNewContact] = useState<NewContact>({
    firstName: '',
    lastName: '',
    email: '',
    phone: null,
    mobile: null,
    position: null,
    primaryRole: 'contact',
    notes: null,
    isActive: true,
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Fetch contact tags
  const { data: tags = [], isLoading: isTagsLoading } = useQuery<ContactTag[]>({
    queryKey: ['/api/contacts/tags'],
  });

  // Fetch contacts
  const {
    data: contacts = [],
    isLoading: isContactsLoading,
    error: contactsError,
  } = useQuery<Contact[]>({
    queryKey: ['/api/contacts', { tags: selectedTags, search: searchQuery, tab: currentTab }],
  });

  // Fetch contact groups
  const { data: groups = [], isLoading: isGroupsLoading } = useQuery<ContactGroup[]>({
    queryKey: ['/api/contacts/groups'],
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (contact: NewContact) => {
      const res = await apiRequest('POST', '/api/contacts', contact);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setIsCreateDialogOpen(false);
      resetNewContactForm();
      toast({
        title: 'Contact created',
        description: 'The contact was created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating contact',
        description: error.message || 'An error occurred while creating the contact.',
        variant: 'destructive',
      });
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/contacts/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: 'Contact deleted',
        description: 'The contact was deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting contact',
        description: error.message || 'An error occurred while deleting the contact.',
        variant: 'destructive',
      });
    },
  });

  // Handle tag selection
  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(tag => tag !== tagName) : [...prev, tagName]
    );
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  // Reset new contact form
  const resetNewContactForm = () => {
    setNewContact({
      firstName: '',
      lastName: '',
      email: '',
      phone: null,
      mobile: null,
      position: null,
      primaryRole: 'contact',
      notes: null,
      isActive: true,
    });
    setFormErrors({});
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewContact(prev => ({
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
  const handleSelectChange = (name: string, value: string) => {
    setNewContact(prev => ({
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

    if (!newContact.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!newContact.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!newContact.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContact.email)) {
      errors.email = 'Invalid email format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      createContactMutation.mutate(newContact);
    }
  };

  // Get contact role badges
  const getContactRoleBadges = (contact: Contact) => {
    if (!contact.tags || contact.tags.length === 0) {
      return <Badge variant="outline">{contact.primaryRole}</Badge>;
    }

    return contact.tags.map(tag => (
      <Badge
        key={tag.id}
        className="mr-1"
        style={{
          backgroundColor: tag.color || '#888888',
          color: '#ffffff',
        }}
      >
        {tag.name}
      </Badge>
    ));
  };

  // Filter contacts based on search query
  const filteredContacts = (Array.isArray(contacts) ? contacts : []).filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();

    return (
      fullName.includes(searchLower) ||
      (contact.email && contact.email.toLowerCase().includes(searchLower)) ||
      (contact.position && contact.position.toLowerCase().includes(searchLower)) ||
      (contact.phone && contact.phone.includes(searchQuery)) ||
      (contact.mobile && contact.mobile.includes(searchQuery))
    );
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your organization's contacts including apprentices, trainees, and labour hire
            workers.
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setLocation('/contacts/tags')}>
            <Tag className="mr-2 h-4 w-4" />
            Manage Tags
          </Button>
          <Button variant="outline" onClick={() => setLocation('/contacts/groups')}>
            <Users className="mr-2 h-4 w-4" />
            Manage Groups
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter by Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isTagsLoading ? (
                <div>Loading tags...</div>
              ) : (
                <>
                  {tags.map(tag => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={selectedTags.includes(tag.name)}
                        onCheckedChange={() => toggleTag(tag.name)}
                      />
                      <Label htmlFor={`tag-${tag.id}`} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: tag.color || '#888888' }}
                        />
                        {tag.name}
                      </Label>
                    </div>
                  ))}
                </>
              )}

              {selectedTags.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setSelectedTags([])}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isGroupsLoading ? (
                <div>Loading groups...</div>
              ) : groups.length > 0 ? (
                <div className="space-y-2">
                  {groups.map(group => (
                    <div key={group.id} className="flex justify-between items-center">
                      <span>{group.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation(`/contacts/groups/${group.id}`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">No contact groups created yet.</div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => setLocation('/contacts/groups/new')}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Group
              </Button>
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
                placeholder="Search contacts..."
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
                <DropdownMenuItem>Last Contacted</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Show Only</DropdownMenuLabel>
                <DropdownMenuItem>Active Contacts</DropdownMenuItem>
                <DropdownMenuItem>Inactive Contacts</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="all">All Contacts</TabsTrigger>
              <TabsTrigger value="apprentices">Apprentices</TabsTrigger>
              <TabsTrigger value="trainees">Trainees</TabsTrigger>
              <TabsTrigger value="labour-hire">Labour Hire</TabsTrigger>
              <TabsTrigger value="host-employers">Host Employers</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {renderContactsTable(filteredContacts, 'all')}
            </TabsContent>

            <TabsContent value="apprentices" className="mt-4">
              {renderContactsTable(
                filteredContacts.filter(c => c.tags?.some(tag => tag.name === 'Apprentice')),
                'apprentices'
              )}
            </TabsContent>

            <TabsContent value="trainees" className="mt-4">
              {renderContactsTable(
                filteredContacts.filter(c => c.tags?.some(tag => tag.name === 'Trainee')),
                'trainees'
              )}
            </TabsContent>

            <TabsContent value="labour-hire" className="mt-4">
              {renderContactsTable(
                filteredContacts.filter(c =>
                  c.tags?.some(tag => tag.name === 'Labour Hire Worker')
                ),
                'labour-hire'
              )}
            </TabsContent>

            <TabsContent value="host-employers" className="mt-4">
              {renderContactsTable(
                filteredContacts.filter(c => c.tags?.some(tag => tag.name === 'Host Employer')),
                'host-employers'
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Contact Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your organization's directory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={newContact.firstName}
                    onChange={handleInputChange}
                    className={formErrors.firstName ? 'border-red-500' : ''}
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-red-500">{formErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={newContact.lastName}
                    onChange={handleInputChange}
                    className={formErrors.lastName ? 'border-red-500' : ''}
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-red-500">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newContact.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? 'border-red-500' : ''}
                />
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newContact.phone || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    value={newContact.mobile || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position/Title</Label>
                <Input
                  id="position"
                  name="position"
                  value={newContact.position || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryRole">Primary Role</Label>
                <Select
                  value={newContact.primaryRole}
                  onValueChange={value => handleSelectChange('primaryRole', value)}
                >
                  <SelectTrigger id="primaryRole">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contact">General Contact</SelectItem>
                    <SelectItem value="apprentice">Apprentice</SelectItem>
                    <SelectItem value="trainee">Trainee</SelectItem>
                    <SelectItem value="labour-hire">Labour Hire Worker</SelectItem>
                    <SelectItem value="host-employer">Host Employer Contact</SelectItem>
                    <SelectItem value="client">Client Contact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={newContact.notes || ''}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={newContact.isActive}
                  onCheckedChange={checked =>
                    setNewContact(prev => ({ ...prev, isActive: !!checked }))
                  }
                />
                <Label htmlFor="isActive">Active Contact</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createContactMutation.isPending}>
                {createContactMutation.isPending ? 'Creating...' : 'Create Contact'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Helper function to render contacts table based on the current tab
  function renderContactsTable(contacts: Contact[], tabType: string) {
    if (isContactsLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading contacts...</span>
          </div>
        </div>
      );
    }

    if (contactsError) {
      return (
        <div className="text-center py-8 text-red-500">
          Error loading contacts. Please try again later.
        </div>
      );
    }

    if (contacts.length === 0) {
      // Empty state with explanatory message based on tab
      let emptyMessage = 'No contacts found.';
      let primaryAction = () => setIsCreateDialogOpen(true);
      let primaryActionText = 'Add New Contact';

      switch (tabType) {
        case 'apprentices':
          emptyMessage = 'No apprentice contacts found.';
          break;
        case 'trainees':
          emptyMessage = 'No trainee contacts found.';
          break;
        case 'labour-hire':
          emptyMessage = 'No labour hire worker contacts found.';
          break;
        case 'host-employers':
          emptyMessage = 'No host employer contacts found.';
          break;
      }

      if (searchQuery || selectedTags.length > 0) {
        emptyMessage = 'No contacts match your current filters.';
        primaryAction = () => {
          setSearchQuery('');
          setSelectedTags([]);
        };
        primaryActionText = 'Clear Filters';
      }

      return (
        <div className="text-center py-12">
          <div className="mb-4">
            <UserX className="mx-auto h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">{emptyMessage}</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            {searchQuery || selectedTags.length > 0
              ? "Try adjusting your search or filters to find what you're looking for."
              : 'Start by creating a new contact to build your directory.'}
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
              <TableHead>Name</TableHead>
              <TableHead>Role/Tags</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Last Contacted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map(contact => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-2">
                      <AvatarImage src={contact.profileImage || undefined} />
                      <AvatarFallback>
                        {`${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{`${contact.firstName} ${contact.lastName}`}</div>
                      <div className="text-sm text-muted-foreground">
                        {contact.position || 'No position'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">{getContactRoleBadges(contact)}</div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <a href={`mailto:${contact.email}`} className="hover:underline">
                        {contact.email}
                      </a>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <a href={`tel:${contact.phone}`} className="hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {contact.lastContactedAt ? (
                    <span title={new Date(contact.lastContactedAt).toLocaleString()}>
                      {formatDistanceToNow(new Date(contact.lastContactedAt), { addSuffix: true })}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Never</span>
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
                      <DropdownMenuItem onClick={() => setLocation(`/contacts/${contact.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation(`/contacts/${contact.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Contact
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
                          if (window.confirm('Are you sure you want to delete this contact?')) {
                            deleteContactMutation.mutate(contact.id);
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
