import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  FileText,
  Download,
  Filter,
  Printer,
  Mail,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpDown,
  ChevronDown,
  Calendar,
  Share2
} from 'lucide-react';
import { ReportFormDialog } from '@/components/financial/report-form-dialog';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Types
type FinancialReport = {
  id: string;
  title: string;
  type: 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'tax' | 'custom';
  period: string;
  createdAt: string;
  status: 'draft' | 'final';
  revenue?: number;
  expenses?: number;
  profit?: number;
};

// Dummy data for UI development
const DUMMY_REPORTS: FinancialReport[] = [
  {
    id: 'fin-2025-q1',
    title: 'Quarterly Financial Report - Q1 2025',
    type: 'profit-loss',
    period: 'Q1 2025',
    createdAt: '2025-04-15',
    status: 'final',
    revenue: 527850.00,
    expenses: 412635.45,
    profit: 115214.55
  },
  {
    id: 'fin-2025-q1-bal',
    title: 'Balance Sheet - Q1 2025',
    type: 'balance-sheet',
    period: 'Q1 2025',
    createdAt: '2025-04-15',
    status: 'final'
  },
  {
    id: 'fin-2025-cf-q1',
    title: 'Cash Flow Statement - Q1 2025',
    type: 'cash-flow',
    period: 'Q1 2025',
    createdAt: '2025-04-15',
    status: 'final'
  },
  {
    id: 'fin-2025-mar',
    title: 'Monthly Financial Report - March 2025',
    type: 'profit-loss',
    period: 'March 2025',
    createdAt: '2025-04-05',
    status: 'final',
    revenue: 185320.25,
    expenses: 142745.88,
    profit: 42574.37
  },
  {
    id: 'fin-2025-apr-draft',
    title: 'Monthly Financial Report - April 2025',
    type: 'profit-loss',
    period: 'April 2025',
    createdAt: '2025-05-01',
    status: 'draft',
    revenue: 192482.75,
    expenses: 151230.20,
    profit: 41252.55
  }
];

export default function FinancialReportsPage() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('reports');
  const [reportFormOpen, setReportFormOpen] = useState(false);
  
  // This would be replaced with a real API query in production
  const { data: reports, isLoading } = useQuery({
    queryKey: ['financial-reports'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return DUMMY_REPORTS;
    },
  });

  const handleExportReport = (id: string) => {
    toast({
      title: "Export Started",
      description: `Report ${id} is being exported. It will be ready shortly.`,
    });
  };

  const handlePrintReport = (id: string) => {
    toast({
      title: "Print Job Started",
      description: `Report ${id} has been sent to the printer.`,
    });
  };

  const handleEmailReport = (id: string) => {
    toast({
      title: "Email Ready",
      description: `Report ${id} is ready to email. Please configure recipients.`,
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
      <ReportFormDialog open={reportFormOpen} onOpenChange={setReportFormOpen} />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            Generate and view financial reports for your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Report
          </Button>
          <Button onClick={() => setReportFormOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="reports" value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="reports">All Reports</TabsTrigger>
            <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
            <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
            <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
            <TabsTrigger value="tax">Tax Reports</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Select defaultValue="current-quarter">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="current-quarter">Current Quarter</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Period</SelectItem>
              </SelectContent>
            </Select>
            
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
                  <span>Date Created</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Report Type</span>
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

        <TabsContent value="reports" className="mt-0">
          <Card>
            <CardHeader className="px-6 py-4">
              <div className="flex justify-between">
                <CardTitle className="text-xl">Financial Reports</CardTitle>
                <DatePickerWithRange className="w-auto" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10" />
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
                      <TableHead className="w-[300px]">Report Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports?.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.title}</TableCell>
                        <TableCell>
                          {report.type === 'profit-loss' && 'Profit & Loss'}
                          {report.type === 'balance-sheet' && 'Balance Sheet'}
                          {report.type === 'cash-flow' && 'Cash Flow'}
                          {report.type === 'tax' && 'Tax Report'}
                          {report.type === 'custom' && 'Custom Report'}
                        </TableCell>
                        <TableCell>{report.period}</TableCell>
                        <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {report.status === 'draft' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Draft
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Final
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleExportReport(report.id)}
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handlePrintReport(report.id)}
                            >
                              <Printer className="h-4 w-4" />
                              <span className="sr-only">Print</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEmailReport(report.id)}
                            >
                              <Mail className="h-4 w-4" />
                              <span className="sr-only">Email</span>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <ChevronDown className="h-4 w-4" />
                                  <span className="sr-only">More</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Report</DropdownMenuItem>
                                <DropdownMenuItem>Edit Report</DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="mr-2 h-4 w-4" />
                                  <span>Share Report</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  Delete Report
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{reports?.length || 0}</strong> reports
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

        <TabsContent value="profit-loss" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Reports</CardTitle>
              <CardDescription>
                View your organization's revenue, expenses, and profitability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(527850.00)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-success">+5.2%</span> from previous period
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Total Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(412635.45)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-destructive">+7.1%</span> from previous period
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Net Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(115214.55)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-warning">-1.8%</span> from previous period
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="h-80 bg-muted flex items-center justify-center rounded-lg mb-4">
                <div className="text-center">
                  <LineChart className="h-16 w-16 mb-2 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Revenue vs. Expenses Chart</p>
                  <p className="text-xs text-muted-foreground">Q1 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet</CardTitle>
              <CardDescription>
                View your organization's assets, liabilities, and equity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-muted flex items-center justify-center rounded-lg mb-4">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mb-2 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Assets vs. Liabilities Chart</p>
                  <p className="text-xs text-muted-foreground">Q1 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow</CardTitle>
              <CardDescription>
                View your organization's cash inflows and outflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-muted flex items-center justify-center rounded-lg mb-4">
                <div className="text-center">
                  <LineChart className="h-16 w-16 mb-2 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Cash Flow Chart</p>
                  <p className="text-xs text-muted-foreground">Q1 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Tax Reports</CardTitle>
              <CardDescription>
                View tax-related reports and summaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-muted flex items-center justify-center rounded-lg mb-4">
                <div className="text-center">
                  <PieChart className="h-16 w-16 mb-2 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Tax Breakdown Chart</p>
                  <p className="text-xs text-muted-foreground">Financial Year 2024-2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}