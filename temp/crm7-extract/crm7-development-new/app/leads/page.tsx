import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  Phone,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function LeadsPage(): React.ReactElement {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<{
    id: string;
    name: string;
    email: string;
    company: string;
    status: string;
    created: string;
  } | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [checkAll, setCheckAll] = useState(false);

  const leadsData = [
    {
      id: 'L-001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      company: 'Acme Inc',
      status: 'Qualified',
      created: 'Apr 5, 2025',
    },
    {
      id: 'L-002',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      company: 'XYZ Corp',
      status: 'New',
      created: 'Apr 6, 2025',
    },
    {
      id: 'L-003',
      name: 'Michael Brown',
      email: 'michael@example.com',
      company: 'ABC Ltd',
      status: 'Contacted',
      created: 'Apr 7, 2025',
    },
  ];

  const handleCheckAll = (): void => {
    setCheckAll(!checkAll);
    if (!checkAll) {
      setSelectedLeads(leadsData.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleCheckboxChange = (id: string): void => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(leadId => leadId !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleDeleteMultiple = (): void => {
    // Logic to delete selected leads would go here
    setSelectedLeads([]);
    setCheckAll(false);
    setIsDeleteModalOpen(false);
  };

  // Helper function to determine badge class based on status
  const getBadgeClass = (status: string): string => {
    if (status === 'Qualified') {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    if (status === 'New') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  // Helper function to get lead text safely with nullish handling
  const getSafeLeadText = (text: string | undefined | null): string => {
    return text ?? '';
  };

  // Helper for delete text - shortened to comply with line length
  const getDeleteConfirmText = (): string => {
    if (selectedLeads.length > 1) {
      return `${selectedLeads.length} leads`;
    }
    
    // Fixing line length issue by breaking into multiple lines
    const unknownName = 'Unknown Lead';
    const leadName = selectedLead?.name ?? unknownName;
    return `the lead "${leadName}"`;
  };

  // Close modal handler to fix the ReactNode error
  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
        <div className="flex items-center space-x-2">
          <Link href="/leads/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lead Management</CardTitle>
          <CardDescription>
            View and manage all leads in your pipeline. Filter, sort, and search to find specific leads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-y-2 mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search leads..."
                  className="w-[300px] pl-8"
                  aria-label="Search leads"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            {selectedLeads.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedLeads.length})
              </Button>
            )}
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={checkAll}
                      onChange={handleCheckAll}
                      aria-label="Select all leads"
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Created</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadsData.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleCheckboxChange(lead.id)}
                        aria-label={`Select lead ${lead.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{lead.id}</TableCell>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getBadgeClass(lead.status)}
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.created}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" title="Call">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Message">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Link href={`/leads/${lead.id.split('-')[1]}`}>
                          <Button variant="ghost" size="sm" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit"
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Adding/Editing Leads */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedLead !== null ? 'Edit Lead' : 'Add Lead'}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4 pt-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                defaultValue={getSafeLeadText(selectedLead?.name)}
                placeholder="Enter name"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                defaultValue={getSafeLeadText(selectedLead?.email)}
                placeholder="Enter email"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="company" className="text-sm font-medium">Company</label>
              <Input
                id="company"
                defaultValue={getSafeLeadText(selectedLead?.company)}
                placeholder="Enter company"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Input
                id="status"
                defaultValue={getSafeLeadText(selectedLead?.status)}
                placeholder="Enter status"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleCloseModal}>
                {selectedLead !== null ? 'Update Lead' : 'Add Lead'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal for Deletion Confirmation */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedLeads.length > 1 ? 'Delete Multiple Leads' : 'Delete Lead'}
            </DialogTitle>
          </DialogHeader>
          <p className="pt-4">
            Are you sure you want to delete {getDeleteConfirmText()}?
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedLeads.length > 1) {
                  handleDeleteMultiple();
                } else {
                  // Logic to delete single lead would go here
                  setIsDeleteModalOpen(false);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
