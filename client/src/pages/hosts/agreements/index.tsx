import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Download,
  FilePlus,
  FileText,
  Pencil,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export default function HostAgreements() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for agreements
  const agreements = [
    {
      id: 1,
      hostName: 'ABC Construction',
      title: 'Standard Host Agreement',
      startDate: '2023-01-15',
      endDate: '2024-01-14',
      status: 'active',
      documents: ['agreement_v1.2.pdf', 'risk_assessment.pdf'],
      maxApprentices: 5,
      currApprentices: 3,
    },
    {
      id: 2,
      hostName: 'XYZ Engineering',
      title: 'Extended Work Placement',
      startDate: '2023-03-22',
      endDate: '2024-03-21',
      status: 'active',
      documents: ['agreement_v1.2.pdf', 'host_induction.pdf'],
      maxApprentices: 8,
      currApprentices: 5,
    },
    {
      id: 3,
      hostName: 'City Electrical',
      title: 'Electrician Apprentice Agreement',
      startDate: '2023-06-10',
      endDate: '2023-12-10',
      status: 'expiring',
      documents: ['agreement_v1.1.pdf'],
      maxApprentices: 3,
      currApprentices: 3,
    },
    {
      id: 4,
      hostName: 'Riverside Plumbing',
      title: 'Plumber Training Agreement',
      startDate: '2022-11-05',
      endDate: '2023-11-04',
      status: 'expired',
      documents: ['agreement_v1.0.pdf', 'safety_checklist.pdf'],
      maxApprentices: 2,
      currApprentices: 0,
    },
    {
      id: 5,
      hostName: 'Metro Office Solutions',
      title: 'Business Admin Placement',
      startDate: '2023-05-01',
      endDate: '2024-04-30',
      status: 'active',
      documents: ['agreement_v1.2.pdf'],
      maxApprentices: 4,
      currApprentices: 2,
    },
  ];

  const filteredAgreements = agreements.filter(
    agreement =>
      agreement.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRenewalSubmit = () => {
    toast({
      title: 'Agreement Renewal Initiated',
      description:
        'The renewal process has been started. The host will be contacted for confirmation.',
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Host Employer Agreements</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <FilePlus className="mr-2 h-4 w-4" />
              New Agreement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Host Agreement</DialogTitle>
              <DialogDescription>
                Enter the details for the new host employer agreement.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="host" className="text-right">
                  Host Employer
                </label>
                <div className="col-span-3">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a host employer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abc">ABC Construction</SelectItem>
                      <SelectItem value="xyz">XYZ Engineering</SelectItem>
                      <SelectItem value="city">City Electrical</SelectItem>
                      <SelectItem value="riverside">Riverside Plumbing</SelectItem>
                      <SelectItem value="metro">Metro Office Solutions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="title" className="text-right">
                  Agreement Title
                </label>
                <Input id="title" placeholder="Enter agreement title" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="startDate" className="text-right">
                  Start Date
                </label>
                <Input id="startDate" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="endDate" className="text-right">
                  End Date
                </label>
                <Input id="endDate" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="maxApprentices" className="text-right">
                  Max Apprentices
                </label>
                <Input
                  id="maxApprentices"
                  type="number"
                  min="1"
                  defaultValue="1"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="notes" className="text-right">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  placeholder="Additional agreement notes"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="upload" className="text-right">
                  Upload Documents
                </label>
                <div className="col-span-3">
                  <div className="border-2 border-dashed rounded-md p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Drop files here or click to browse
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Select Files
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button
                onClick={() => {
                  toast({
                    title: 'Agreement Created',
                    description: 'New host agreement has been successfully created',
                  });
                }}
              >
                Create Agreement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Agreement Management</CardTitle>
          <CardDescription>View and manage all host employer agreements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search agreements..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1 flex justify-end space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Agreements</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="all">All Agreements</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Host Employer</TableHead>
                    <TableHead>Agreement</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Apprentices</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgreements
                    .filter(agreement => agreement.status === 'active')
                    .map(agreement => (
                      <TableRow key={agreement.id}>
                        <TableCell className="font-medium">{agreement.hostName}</TableCell>
                        <TableCell>{agreement.title}</TableCell>
                        <TableCell>
                          {new Date(agreement.startDate).toLocaleDateString()} -{' '}
                          {new Date(agreement.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {agreement.currApprentices} / {agreement.maxApprentices}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(agreement.status)}`}
                          >
                            Active
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {agreement.documents.map((doc, idx) => (
                              <Button key={idx} variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                {doc.split('_')[0]}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/hosts/agreements/${agreement.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Host Employer</TableHead>
                    <TableHead>Agreement</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Apprentices</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgreements
                    .filter(agreement => agreement.status === 'expiring')
                    .map(agreement => (
                      <TableRow key={agreement.id}>
                        <TableCell className="font-medium">{agreement.hostName}</TableCell>
                        <TableCell>{agreement.title}</TableCell>
                        <TableCell>
                          {new Date(agreement.startDate).toLocaleDateString()} -{' '}
                          {new Date(agreement.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {agreement.currApprentices} / {agreement.maxApprentices}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(agreement.status)}`}
                          >
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            Expiring Soon
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {agreement.documents.map((doc, idx) => (
                              <Button key={idx} variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                {doc.split('_')[0]}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Renew
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Renew Agreement</DialogTitle>
                                  <DialogDescription>
                                    Extend the agreement with {agreement.hostName}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right">Current End Date</label>
                                    <div className="col-span-3">
                                      <Input
                                        value={new Date(agreement.endDate).toLocaleDateString()}
                                        readOnly
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right">New End Date</label>
                                    <div className="col-span-3">
                                      <Input type="date" />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right">Max Apprentices</label>
                                    <div className="col-span-3">
                                      <Input
                                        type="number"
                                        defaultValue={agreement.maxApprentices}
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right">Notes</label>
                                    <div className="col-span-3">
                                      <Textarea placeholder="Renewal notes" />
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline">Cancel</Button>
                                  <Button onClick={handleRenewalSubmit}>Submit Renewal</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/hosts/agreements/${agreement.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Host Employer</TableHead>
                    <TableHead>Agreement</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgreements
                    .filter(agreement => agreement.status === 'expired')
                    .map(agreement => (
                      <TableRow key={agreement.id}>
                        <TableCell className="font-medium">{agreement.hostName}</TableCell>
                        <TableCell>{agreement.title}</TableCell>
                        <TableCell>
                          {new Date(agreement.startDate).toLocaleDateString()} -{' '}
                          {new Date(agreement.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(agreement.status)}`}
                          >
                            Expired
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {agreement.documents.map((doc, idx) => (
                              <Button key={idx} variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                {doc.split('_')[0]}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Reactivate
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reactivate Agreement</DialogTitle>
                                  <DialogDescription>
                                    Create a new agreement based on the expired one with{' '}
                                    {agreement.hostName}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right">Start Date</label>
                                    <div className="col-span-3">
                                      <Input type="date" />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right">End Date</label>
                                    <div className="col-span-3">
                                      <Input type="date" />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right">Max Apprentices</label>
                                    <div className="col-span-3">
                                      <Input
                                        type="number"
                                        defaultValue={agreement.maxApprentices}
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right">Notes</label>
                                    <div className="col-span-3">
                                      <Textarea placeholder="Reactivation notes" />
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline">Cancel</Button>
                                  <Button
                                    onClick={() => {
                                      toast({
                                        title: 'Agreement Reactivated',
                                        description:
                                          'A new agreement has been created based on the expired one.',
                                      });
                                    }}
                                  >
                                    Create New Agreement
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/hosts/agreements/${agreement.id}`}>
                                <FileText className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Host Employer</TableHead>
                    <TableHead>Agreement</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Apprentices</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgreements.map(agreement => (
                    <TableRow key={agreement.id}>
                      <TableCell className="font-medium">{agreement.hostName}</TableCell>
                      <TableCell>{agreement.title}</TableCell>
                      <TableCell>
                        {new Date(agreement.startDate).toLocaleDateString()} -{' '}
                        {new Date(agreement.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {agreement.currApprentices} / {agreement.maxApprentices}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(agreement.status)}`}
                        >
                          {agreement.status === 'active' && 'Active'}
                          {agreement.status === 'expired' && 'Expired'}
                          {agreement.status === 'expiring' && (
                            <>
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                              Expiring Soon
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {agreement.documents.map((doc, idx) => (
                            <Button key={idx} variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              {doc.split('_')[0]}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/hosts/agreements/${agreement.id}`}>
                              {agreement.status === 'active' || agreement.status === 'expiring' ? (
                                <Pencil className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                            </Link>
                          </Button>
                          {agreement.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: 'Compliance Check',
                                  description:
                                    'Compliance check initiated for ' + agreement.hostName,
                                });
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
