import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PlusCircle,
  ChevronDown,
  Download,
  Calendar,
  BarChart3,
  ArrowRightLeft,
  Save,
  FileEdit,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Target,
  Mail,
  Share2,
  DollarSign
} from 'lucide-react';
import { BudgetFormDialog } from '@/components/financial/budget-form-dialog';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DatePickerWithRange } from '@/components/date-range-picker';
import { useToast } from '@/hooks/use-toast';

// Types
type BudgetCategory = {
  id: string;
  name: string;
  planned: number;
  actual: number;
  variance: number;
  percentUsed: number;
  status: 'under' | 'over' | 'on-track';
  subCategories?: BudgetCategory[];
};

type Budget = {
  id: string;
  name: string;
  period: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed';
  totalPlanned: number;
  totalActual: number;
  totalVariance: number;
  categories: BudgetCategory[];
};

// Dummy data for UI development
const DUMMY_BUDGETS: Budget[] = [
  {
    id: 'budget-2025-q2',
    name: 'Q2 2025 Operating Budget',
    period: 'Q2 2025',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    status: 'active',
    totalPlanned: 450000,
    totalActual: 325780.45,
    totalVariance: 124219.55,
    categories: [
      {
        id: 'cat-payroll',
        name: 'Payroll & Benefits',
        planned: 280000,
        actual: 210450.75,
        variance: 69549.25,
        percentUsed: 75.2,
        status: 'under',
        subCategories: [
          {
            id: 'subcat-salaries',
            name: 'Salaries',
            planned: 230000,
            actual: 175200.50,
            variance: 54799.50,
            percentUsed: 76.2,
            status: 'under'
          },
          {
            id: 'subcat-benefits',
            name: 'Benefits',
            planned: 50000,
            actual: 35250.25,
            variance: 14749.75,
            percentUsed: 70.5,
            status: 'under'
          }
        ]
      },
      {
        id: 'cat-operations',
        name: 'Operations',
        planned: 85000,
        actual: 67890.20,
        variance: 17109.80,
        percentUsed: 79.9,
        status: 'under',
        subCategories: [
          {
            id: 'subcat-office',
            name: 'Office Expenses',
            planned: 35000,
            actual: 28950.75,
            variance: 6049.25,
            percentUsed: 82.7,
            status: 'under'
          },
          {
            id: 'subcat-equipment',
            name: 'Equipment',
            planned: 50000,
            actual: 38939.45,
            variance: 11060.55,
            percentUsed: 77.9,
            status: 'under'
          }
        ]
      },
      {
        id: 'cat-training',
        name: 'Training & Development',
        planned: 45000,
        actual: 38750.50,
        variance: 6249.50,
        percentUsed: 86.1,
        status: 'on-track'
      },
      {
        id: 'cat-marketing',
        name: 'Marketing & Advertising',
        planned: 40000,
        actual: 8689.00,
        variance: 31311.00,
        percentUsed: 21.7,
        status: 'under'
      }
    ]
  },
  {
    id: 'budget-2025-q1',
    name: 'Q1 2025 Operating Budget',
    period: 'Q1 2025',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    status: 'completed',
    totalPlanned: 425000,
    totalActual: 438950.30,
    totalVariance: -13950.30,
    categories: []
  },
  {
    id: 'budget-2025-capital',
    name: '2025 Capital Expenditure Budget',
    period: 'FY 2025',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'active',
    totalPlanned: 250000,
    totalActual: 85230.75,
    totalVariance: 164769.25,
    categories: []
  },
  {
    id: 'budget-2025-q3-draft',
    name: 'Q3 2025 Operating Budget',
    period: 'Q3 2025',
    startDate: '2025-07-01',
    endDate: '2025-09-30',
    status: 'draft',
    totalPlanned: 470000,
    totalActual: 0,
    totalVariance: 470000,
    categories: []
  }
];

// Budget status badge component
const BudgetStatusBadge = ({ status }: { status: Budget['status'] }) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-success hover:bg-success/80">Active</Badge>;
    case 'completed':
      return <Badge className="bg-secondary hover:bg-secondary/80">Completed</Badge>;
    case 'draft':
      return <Badge variant="outline">Draft</Badge>;
    default:
      return null;
  }
};

// Category status component
const CategoryStatus = ({ status, percentUsed }: { status: BudgetCategory['status'], percentUsed: number }) => {
  let color = 'bg-success';
  
  if (status === 'over') {
    color = 'bg-destructive';
  } else if (status === 'on-track') {
    color = 'bg-warning';
  }
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{percentUsed}% Used</span>
        <span>
          {status === 'under' && <span className="text-success">Under Budget</span>}
          {status === 'on-track' && <span className="text-warning">On Track</span>}
          {status === 'over' && <span className="text-destructive">Over Budget</span>}
        </span>
      </div>
      <Progress value={percentUsed} className={color} />
    </div>
  );
};

export default function BudgetPlanningPage() {
  const { toast } = useToast();
  const [selectedBudgetId, setSelectedBudgetId] = useState('budget-2025-q2');
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  
  // This would be replaced with a real API query in production
  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return DUMMY_BUDGETS;
    },
  });

  const selectedBudget = budgets?.find(b => b.id === selectedBudgetId);

  const handleExportBudget = (id: string) => {
    toast({
      title: "Export Started",
      description: `Budget ${id} is being exported. It will be ready shortly.`,
    });
  };

  const handleCopyBudget = (id: string) => {
    toast({
      title: "Budget Copied",
      description: `A copy of budget ${id} has been created as a draft.`,
    });
  };

  const handleShareBudget = (id: string) => {
    toast({
      title: "Share Budget",
      description: "Please select users or departments to share this budget with.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6">
      <BudgetFormDialog open={budgetFormOpen} onOpenChange={setBudgetFormOpen} />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Planning</h1>
          <p className="text-muted-foreground">
            Plan, track, and analyze your organization's budget
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setBudgetFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Budget
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Current Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(450000)}</div>
            <p className="text-xs text-muted-foreground">Q2 2025 Operating Budget</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Spent to Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(325780)}</div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>72% of budget</span>
              <span>67% of time elapsed</span>
            </div>
            <Progress value={72} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Remaining Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(124220)}</div>
            <p className="text-xs text-muted-foreground">28% remaining for this period</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Budget List</CardTitle>
              <CardDescription>
                Select a budget to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {budgets?.map((budget) => (
                    <div
                      key={budget.id}
                      className={`p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                        selectedBudgetId === budget.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedBudgetId(budget.id)}
                    >
                      <div className="font-medium">{budget.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {budget.period} • <BudgetStatusBadge status={budget.status} />
                      </div>
                      <div className="mt-2 text-sm">
                        {formatCurrency(budget.totalPlanned)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Budget
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{selectedBudget?.name}</CardTitle>
                  <CardDescription>
                    {selectedBudget?.period} • {new Date(selectedBudget?.startDate as string).toLocaleDateString()} to {new Date(selectedBudget?.endDate as string).toLocaleDateString()}
                  </CardDescription>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Actions <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => handleExportBudget(selectedBudgetId)}>
                      <Download className="mr-2 h-4 w-4" />
                      <span>Export Budget</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileEdit className="mr-2 h-4 w-4" />
                      <span>Edit Budget</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyBudget(selectedBudgetId)}>
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Copy Budget</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareBudget(selectedBudgetId)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      <span>Share Budget</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Delete Budget
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="py-2">
                        <CardTitle className="text-sm font-medium">Planned</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(selectedBudget?.totalPlanned || 0)}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-2">
                        <CardTitle className="text-sm font-medium">Actual</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(selectedBudget?.totalActual || 0)}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-2">
                        <CardTitle className="text-sm font-medium">Variance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${(selectedBudget?.totalVariance || 0) < 0 ? 'text-destructive' : 'text-success'}`}>
                          {formatCurrency(selectedBudget?.totalVariance || 0)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="h-72 bg-muted flex items-center justify-center rounded-lg mb-6">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mb-2 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">Budget Overview Chart</p>
                      <p className="text-xs text-muted-foreground">Planned vs. Actual by Category</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Categories</h3>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Category</TableHead>
                          <TableHead>Planned</TableHead>
                          <TableHead>Actual</TableHead>
                          <TableHead>Variance</TableHead>
                          <TableHead className="w-[200px]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedBudget?.categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{formatCurrency(category.planned)}</TableCell>
                            <TableCell>{formatCurrency(category.actual)}</TableCell>
                            <TableCell className={category.variance < 0 ? 'text-destructive' : 'text-success'}>
                              {formatCurrency(category.variance)}
                            </TableCell>
                            <TableCell>
                              <CategoryStatus status={category.status} percentUsed={category.percentUsed} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="categories">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Budget Categories</h3>
                      <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Category
                      </Button>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Category</TableHead>
                          <TableHead>Planned</TableHead>
                          <TableHead>Actual</TableHead>
                          <TableHead>Variance</TableHead>
                          <TableHead className="w-[200px]">Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedBudget?.categories.map((category) => (
                          <>
                            <TableRow key={category.id}>
                              <TableCell className="font-medium">{category.name}</TableCell>
                              <TableCell>{formatCurrency(category.planned)}</TableCell>
                              <TableCell>{formatCurrency(category.actual)}</TableCell>
                              <TableCell className={category.variance < 0 ? 'text-destructive' : 'text-success'}>
                                {formatCurrency(category.variance)}
                              </TableCell>
                              <TableCell>
                                <CategoryStatus status={category.status} percentUsed={category.percentUsed} />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">View</Button>
                              </TableCell>
                            </TableRow>
                            
                            {category.subCategories?.map((subCategory) => (
                              <TableRow key={subCategory.id} className="bg-muted/40">
                                <TableCell className="pl-8">
                                  <span className="text-muted-foreground">└</span> {subCategory.name}
                                </TableCell>
                                <TableCell>{formatCurrency(subCategory.planned)}</TableCell>
                                <TableCell>{formatCurrency(subCategory.actual)}</TableCell>
                                <TableCell className={subCategory.variance < 0 ? 'text-destructive' : 'text-success'}>
                                  {formatCurrency(subCategory.variance)}
                                </TableCell>
                                <TableCell>
                                  <CategoryStatus status={subCategory.status} percentUsed={subCategory.percentUsed} />
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm">View</Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="timeline">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Budget Timeline</h3>
                    <p className="text-muted-foreground">Track budget progress over time</p>
                    
                    <div className="h-80 bg-muted flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <ArrowRightLeft className="h-16 w-16 mb-2 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Budget Timeline Chart</p>
                        <p className="text-xs text-muted-foreground">{selectedBudget?.period}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reports">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Budget Reports</h3>
                      <Button size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Monthly Variance Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Track monthly variance between planned and actual budget
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" size="sm">View Report</Button>
                        </CardFooter>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Category Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Detailed breakdown of spending by category
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" size="sm">View Report</Button>
                        </CardFooter>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Year-to-Date Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Track year-to-date budget performance and projections
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" size="sm">View Report</Button>
                        </CardFooter>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Comparative Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Compare current budget with previous periods
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" size="sm">View Report</Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}