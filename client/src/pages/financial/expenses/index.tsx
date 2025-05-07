import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  SlidersHorizontal, 
  ChevronDown, 
  Calendar,
  DollarSign,
  MessageSquare,
  BadgeCheck,
  Clock
} from 'lucide-react';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DatePickerWithRange } from '@/components/date-range-picker';
import { useToast } from '@/hooks/use-toast';
import { ExpenseFormDialog } from '@/components/financial/expense-form-dialog';

// Types
type Expense = {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  submittedBy: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
  notes?: string;
};

// Dummy data for UI development
const DUMMY_EXPENSES: Expense[] = [
  {
    id: 1,
    description: 'Office supplies',
    amount: 156.78,
    category: 'Supplies',
    date: '2025-05-01',
    submittedBy: {
      id: 1,
      name: 'John Smith',
      avatarUrl: ''
    },
    status: 'approved',
    receiptUrl: '/receipts/receipt-123.pdf',
    notes: 'Monthly office supplies order'
  },
  {
    id: 2,
    description: 'Client meeting lunch',
    amount: 84.50,
    category: 'Meals',
    date: '2025-05-03',
    submittedBy: {
      id: 2,
      name: 'Sarah Johnson',
      avatarUrl: ''
    },
    status: 'pending',
    receiptUrl: '/receipts/receipt-124.pdf',
  },
  {
    id: 3,
    description: 'Travel to Sydney office',
    amount: 450.00,
    category: 'Travel',
    date: '2025-05-05',
    submittedBy: {
      id: 3,
      name: 'Michael Chen',
      avatarUrl: ''
    },
    status: 'pending',
    receiptUrl: '/receipts/receipt-125.pdf',
    notes: 'Flight and accommodation for apprentice site visit'
  },
  {
    id: 4,
    description: 'Software subscription',
    amount: 99.99,
    category: 'Software',
    date: '2025-05-07',
    submittedBy: {
      id: 1,
      name: 'John Smith',
      avatarUrl: ''
    },
    status: 'approved',
    receiptUrl: '/receipts/receipt-126.pdf',
  },
  {
    id: 5,
    description: 'Industry conference tickets',
    amount: 350.00,
    category: 'Professional Development',
    date: '2025-05-10',
    submittedBy: {
      id: 4,
      name: 'David Wilson',
      avatarUrl: ''
    },
    status: 'rejected',
    receiptUrl: '/receipts/receipt-127.pdf',
    notes: 'Rejected - needs manager approval for amounts over $300'
  }
];

// Expense status badge component
const ExpenseStatusBadge = ({ status }: { status: Expense['status'] }) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-success hover:bg-success/80">Approved</Badge>;
    case 'rejected':
      return <Badge className="bg-destructive hover:bg-destructive/80">Rejected</Badge>;
    case 'pending':
      return <Badge className="bg-warning hover:bg-warning/80">Pending</Badge>;
    default:
      return null;
  }
};

export default function ExpensesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);

  // This would be replaced with a real API query in production
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return DUMMY_EXPENSES;
    },
  });

  const handleExportExpenses = () => {
    toast({
      title: "Export Started",
      description: "Your expense report export has started and will be ready shortly.",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <ExpenseFormDialog open={expenseFormOpen} onOpenChange={setExpenseFormOpen} />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Tracking</h1>
          <p className="text-muted-foreground">
            Manage and track organization expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExpenses}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setExpenseFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Expenses</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search expenses..."
                className="w-60 pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Date</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DollarSign className="mr-2 h-4 w-4" />
                  <span>Amount</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  <span>Category</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Status</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Button variant="ghost" className="w-full justify-start p-0 h-auto font-normal">
                    Clear Filters
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader className="px-6 py-4">
              <div className="flex justify-between">
                <CardTitle className="text-xl">All Expenses</CardTitle>
                <DatePickerWithRange className="w-auto" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
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
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses?.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>${expense.amount.toFixed(2)}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={expense.submittedBy.avatarUrl} />
                              <AvatarFallback>{expense.submittedBy.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            {expense.submittedBy.name}
                          </div>
                        </TableCell>
                        <TableCell><ExpenseStatusBadge status={expense.status} /></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>View Receipt</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem disabled={expense.status !== 'pending'}>Approve</DropdownMenuItem>
                              <DropdownMenuItem disabled={expense.status !== 'pending'}>Reject</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <span className="text-destructive">Delete</span>
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
                Showing <strong>{expenses?.length || 0}</strong> expenses
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

        <TabsContent value="pending" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Pending Expenses</CardTitle>
              <CardDescription>
                Review and approve pending expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Pending expenses content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Approved Expenses</CardTitle>
              <CardDescription>
                All approved expense transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Approved expenses content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Expenses</CardTitle>
              <CardDescription>
                View rejected expenses and reasons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Rejected expenses content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$1,141.27</div>
            <p className="text-xs text-muted-foreground">For current period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$534.50</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-warning">2</span> expenses waiting for review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Travel</div>
            <p className="text-xs text-muted-foreground">39% of total expenses</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}