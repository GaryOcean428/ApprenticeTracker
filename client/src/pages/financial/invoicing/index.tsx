import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PlusCircle,
  FileText,
  Mail,
  Calendar,
  Download,
  Printer,
  Eye,
  Edit,
  Copy,
  FilePlus,
  ArrowUp,
  ArrowDown,
  Search,
  ChevronDown,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  BanknoteIcon,
  FileCheck,
  RefreshCcw,
} from 'lucide-react';
import { InvoiceFormDialog } from '@/components/financial/invoice-form-dialog';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DatePickerWithRange } from '@/components/date-range-picker';
import { useToast } from '@/hooks/use-toast';

// Types
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

type Invoice = {
  id: string;
  number: string;
  hostEmployer: {
    id: number;
    name: string;
    logo?: string;
  };
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  amount: number;
  amountPaid: number;
  balance: number;
  items: InvoiceItem[];
};

// Dummy data for UI development
const DUMMY_INVOICES: Invoice[] = [
  {
    id: 'inv-8001',
    number: 'INV-8001',
    hostEmployer: {
      id: 101,
      name: 'ABC Construction',
      logo: '',
    },
    issueDate: '2025-05-01',
    dueDate: '2025-05-31',
    status: 'sent',
    amount: 12850.0,
    amountPaid: 0,
    balance: 12850.0,
    items: [
      {
        id: 'item-1',
        description: 'Apprentice placement fees - May 2025',
        quantity: 5,
        rate: 1950.0,
        amount: 9750.0,
      },
      {
        id: 'item-2',
        description: 'Administrative fees',
        quantity: 1,
        rate: 1500.0,
        amount: 1500.0,
      },
      {
        id: 'item-3',
        description: 'Safety training - Group session',
        quantity: 1,
        rate: 1600.0,
        amount: 1600.0,
      },
    ],
  },
  {
    id: 'inv-7999',
    number: 'INV-7999',
    hostEmployer: {
      id: 102,
      name: 'XYZ Electrical',
      logo: '',
    },
    issueDate: '2025-04-15',
    dueDate: '2025-05-15',
    status: 'paid',
    amount: 4850.0,
    amountPaid: 4850.0,
    balance: 0,
    items: [
      {
        id: 'item-1',
        description: 'Apprentice placement fees - April 2025',
        quantity: 2,
        rate: 1950.0,
        amount: 3900.0,
      },
      {
        id: 'item-2',
        description: 'Administrative fees',
        quantity: 1,
        rate: 950.0,
        amount: 950.0,
      },
    ],
  },
  {
    id: 'inv-7995',
    number: 'INV-7995',
    hostEmployer: {
      id: 103,
      name: 'Brisbane Woodworking',
      logo: '',
    },
    issueDate: '2025-04-01',
    dueDate: '2025-05-01',
    status: 'overdue',
    amount: 7800.0,
    amountPaid: 3500.0,
    balance: 4300.0,
    items: [
      {
        id: 'item-1',
        description: 'Apprentice placement fees - April 2025',
        quantity: 3,
        rate: 1950.0,
        amount: 5850.0,
      },
      {
        id: 'item-2',
        description: 'Equipment charges',
        quantity: 1,
        rate: 1950.0,
        amount: 1950.0,
      },
    ],
  },
  {
    id: 'inv-8002',
    number: 'INV-8002',
    hostEmployer: {
      id: 104,
      name: 'Gold Coast Plumbing',
      logo: '',
    },
    issueDate: '2025-05-05',
    dueDate: '2025-06-04',
    status: 'draft',
    amount: 3900.0,
    amountPaid: 0,
    balance: 3900.0,
    items: [
      {
        id: 'item-1',
        description: 'Apprentice placement fees - May 2025',
        quantity: 2,
        rate: 1950.0,
        amount: 3900.0,
      },
    ],
  },
];

// Invoice status badge component
const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => {
  switch (status) {
    case 'draft':
      return <Badge variant="outline">Draft</Badge>;
    case 'sent':
      return <Badge className="bg-info hover:bg-info/80">Sent</Badge>;
    case 'paid':
      return <Badge className="bg-success hover:bg-success/80">Paid</Badge>;
    case 'overdue':
      return <Badge className="bg-destructive hover:bg-destructive/80">Overdue</Badge>;
    case 'cancelled':
      return <Badge className="bg-secondary hover:bg-secondary/80">Cancelled</Badge>;
    default:
      return null;
  }
};

export default function InvoicingPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);

  // This would be replaced with a real API query in production
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return DUMMY_INVOICES;
    },
  });

  const selectedInvoice = invoices?.find(inv => inv.id === selectedInvoiceId);

  const handleSendInvoice = (id: string) => {
    toast({
      title: 'Invoice Sent',
      description: `Invoice ${id} has been sent to the client.`,
    });
  };

  const handleMarkAsPaid = (id: string) => {
    toast({
      title: 'Invoice Marked as Paid',
      description: `Invoice ${id} has been marked as paid.`,
    });
  };

  const handleDownloadInvoice = (id: string) => {
    toast({
      title: 'Invoice Downloaded',
      description: `Invoice ${id} has been downloaded.`,
    });
  };

  const handlePrintInvoice = (id: string) => {
    toast({
      title: 'Printing Invoice',
      description: `Invoice ${id} has been sent to the printer.`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6">
      <InvoiceFormDialog open={invoiceFormOpen} onOpenChange={setInvoiceFormOpen} />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoicing</h1>
          <p className="text-muted-foreground">
            Create, send, and manage invoices for host employers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Batch Export
          </Button>
          <Button onClick={() => setInvoiceFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(17150.0)}</div>
            <p className="text-xs text-muted-foreground">From 2 unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{formatCurrency(4300.0)}</div>
            <p className="text-xs text-muted-foreground">1 invoice past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Paid (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{formatCurrency(4850.0)}</div>
            <p className="text-xs text-muted-foreground">1 invoice paid</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search invoices..."
                className="w-60 pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <DatePickerWithRange className="w-auto" />
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader className="px-6 py-4">
              <div className="flex justify-between">
                <CardTitle className="text-xl">All Invoices</CardTitle>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="amount-high">Amount (High-Low)</SelectItem>
                    <SelectItem value="amount-low">Amount (Low-High)</SelectItem>
                    <SelectItem value="due-date">Due Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                      <Skeleton className="ml-auto h-4 w-[100px]" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Host Employer</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices?.map(invoice => (
                      <TableRow
                        key={invoice.id}
                        className={`cursor-pointer ${selectedInvoiceId === invoice.id ? 'bg-muted' : ''}`}
                        onClick={() => setSelectedInvoiceId(invoice.id)}
                      >
                        <TableCell className="font-medium">{invoice.number}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={invoice.hostEmployer.logo} />
                              <AvatarFallback>
                                {invoice.hostEmployer.name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {invoice.hostEmployer.name}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>
                          <InvoiceStatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedInvoiceId(invoice.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice.id)}>
                                <Download className="mr-2 h-4 w-4" />
                                <span>Download</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrintInvoice(invoice.id)}>
                                <Printer className="mr-2 h-4 w-4" />
                                <span>Print</span>
                              </DropdownMenuItem>
                              {invoice.status === 'draft' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSendInvoice(invoice.id)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    <span>Send</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                              {invoice.status === 'sent' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    <span>Mark as Paid</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSendInvoice(invoice.id)}>
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    <span>Send Reminder</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                              {invoice.status === 'overdue' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    <span>Mark as Paid</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSendInvoice(invoice.id)}>
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    <span>Send Reminder</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Duplicate</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{invoices?.length || 0}</strong> invoices
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="draft" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Draft Invoices</CardTitle>
              <CardDescription>Create and modify draft invoices before sending</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Draft invoices content */}
              <p>Draft invoices content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Sent Invoices</CardTitle>
              <CardDescription>Invoices that have been sent to clients</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Sent invoices content */}
              <p>Sent invoices content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Paid Invoices</CardTitle>
              <CardDescription>Invoices that have been paid by clients</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Paid invoices content */}
              <p>Paid invoices content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Invoices</CardTitle>
              <CardDescription>Invoices that are past their due date</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Overdue invoices content */}
              <p>Overdue invoices content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedInvoice && (
        <Card className="mb-6">
          <CardHeader className="pb-2 border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{selectedInvoice.number}</CardTitle>
                <CardDescription>
                  Host Employer: {selectedInvoice.hostEmployer.name}
                </CardDescription>
              </div>
              <InvoiceStatusBadge status={selectedInvoice.status} />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-sm font-medium mb-1">Issue Date</div>
                <div>{new Date(selectedInvoice.issueDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Due Date</div>
                <div>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Total Amount</div>
                <div className="text-lg font-bold">{formatCurrency(selectedInvoice.amount)}</div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">Invoice Items</h3>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedInvoice.items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.rate)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Total:
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(selectedInvoice.amount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">Payment Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Amount:</span>
                    <span className="font-medium">{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Amount Paid:</span>
                    <span className="font-medium">
                      {formatCurrency(selectedInvoice.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Balance Due:</span>
                    <span className="font-medium">{formatCurrency(selectedInvoice.balance)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedInvoice.status === 'draft' && (
                    <>
                      <Button size="sm" onClick={() => handleSendInvoice(selectedInvoice.id)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Invoice
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Invoice
                      </Button>
                    </>
                  )}
                  {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
                    <>
                      <Button size="sm" onClick={() => handleMarkAsPaid(selectedInvoice.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Paid
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendInvoice(selectedInvoice.id)}
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Send Reminder
                      </Button>
                      <Button size="sm" variant="outline">
                        <BanknoteIcon className="mr-2 h-4 w-4" />
                        Record Payment
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadInvoice(selectedInvoice.id)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrintInvoice(selectedInvoice.id)}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
