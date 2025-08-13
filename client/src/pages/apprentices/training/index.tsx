import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  GraduationCap,
  FileText,
  BookOpen,
  Search,
  Filter,
  ChevronDown,
  BarChart,
  Clock,
  Target,
  Calendar,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import type { TrainingPlan, Apprentice } from '@shared/schema';

interface TrainingPlanWithApprentice extends TrainingPlan {
  apprentice: Apprentice;
}

export default function TrainingPlansManagement() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  // Fetch all training plans with apprentice details
  const { data: trainingPlans, isLoading } = useQuery({
    queryKey: ['/api/training-plans'],
    queryFn: async (): Promise<TrainingPlanWithApprentice[]> => {
      const res = await fetch('/api/training-plans');
      if (!res.ok) throw new Error('Failed to fetch training plans');
      return res.json();
    },
  });

  // Mock data for development - this would be replaced with real data
  const mockTrainingPlans = [
    {
      id: 1,
      apprenticeId: 1150540,
      planName: 'Electrical Installation Certification III',
      qualificationId: 'UEE30811',
      startDate: '2021-10-01',
      targetCompletionDate: '2026-07-02',
      status: 'active',
      overallProgress: 65,
      apprentice: {
        id: 1150540,
        firstName: 'Abdullah',
        lastName: 'Mohamed Osman Dihishi',
        email: 'abdullah.dihishi@example.com',
        trade: 'Electrical',
        status: 'active',
      },
    },
    {
      id: 2,
      apprenticeId: 1139497,
      planName: 'Bricklaying and Blocklaying Certification',
      qualificationId: 'CPC33020',
      startDate: '2021-10-04',
      targetCompletionDate: '2024-10-04',
      status: 'active',
      overallProgress: 42,
      apprentice: {
        id: 1139497,
        firstName: 'Billy',
        lastName: 'Douglas Carlton',
        email: 'billy.carlton@example.com',
        trade: 'Construction',
        status: 'active',
      },
    },
    {
      id: 3,
      apprenticeId: 479044,
      planName: 'Engineering Fabrication Trade Certificate',
      qualificationId: 'MEM30319',
      startDate: '2021-09-30',
      targetCompletionDate: '2027-02-27',
      status: 'active',
      overallProgress: 78,
      apprentice: {
        id: 479044,
        firstName: 'Sheldon',
        lastName: 'Douglas Taylor',
        email: 'sheldon.taylor@example.com',
        trade: 'Engineering',
        status: 'active',
      },
    },
  ];

  // Use mock data for now - replace with real data when available
  const displayPlans = trainingPlans || mockTrainingPlans;

  // Filter plans based on search and tab
  const filteredPlans = displayPlans.filter(plan => {
    const matchesSearch = 
      plan.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.apprentice.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.apprentice.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.qualificationId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = 
      activeTab === 'active' ? plan.status === 'active' :
      activeTab === 'completed' ? plan.status === 'completed' :
      activeTab === 'draft' ? plan.status === 'draft' :
      true;

    return matchesSearch && matchesTab;
  });

  // Calculate statistics
  const stats = {
    totalPlans: displayPlans.length,
    activePlans: displayPlans.filter(p => p.status === 'active').length,
    averageProgress: displayPlans.reduce((sum, p) => sum + (p.overallProgress || 0), 0) / displayPlans.length || 0,
    completedPlans: displayPlans.filter(p => p.status === 'completed').length,
    plansNeedingReview: displayPlans.filter(p => {
      const daysSinceLastUpdate = Math.floor((new Date().getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceLastUpdate > 30 && p.overallProgress < 100;
    }).length,
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-blue-600';
    if (progress >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.draft}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Plans</h1>
          <p className="text-muted-foreground">
            Manage and monitor comprehensive training plans for apprentices
          </p>
        </div>
        <Button
          onClick={() => navigate('/apprentices/training/create')}
        >
          <Plus className="mr-2 h-4 w-4" /> Create Training Plan
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlans}</div>
            <p className="text-xs text-muted-foreground mt-1">All training plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePlans}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all active plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Need Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.plansNeedingReview}</div>
            <p className="text-xs text-muted-foreground mt-1">Overdue for review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedPlans}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-5 pt-5 pb-0">
          <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="active" className="text-sm">
                  Active Plans
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-sm">
                  Completed
                </TabsTrigger>
                <TabsTrigger value="draft" className="text-sm">
                  Drafts
                </TabsTrigger>
                <TabsTrigger value="all" className="text-sm">
                  All Plans
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search training plans..."
                    className="pl-8 h-9 w-[250px]"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" /> Filter
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>All Trades</DropdownMenuItem>
                    <DropdownMenuItem>Electrical</DropdownMenuItem>
                    <DropdownMenuItem>Plumbing</DropdownMenuItem>
                    <DropdownMenuItem>Carpentry</DropdownMenuItem>
                    <DropdownMenuItem>Engineering</DropdownMenuItem>
                    <DropdownMenuItem>Construction</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <TabsContent value={activeTab} className="py-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Apprentice</TableHead>
                      <TableHead>Training Plan</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Target Completion</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-3">
                            <BookOpen className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-medium">No Training Plans Found</h3>
                              <p className="text-muted-foreground">
                                {searchQuery ? 'Try adjusting your search criteria.' : 'Create a new training plan to get started.'}
                              </p>
                            </div>
                            {!searchQuery && (
                              <Button onClick={() => navigate('/apprentices/training/create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Training Plan
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPlans.map((plan) => (
                        <TableRow key={plan.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {plan.apprentice.firstName} {plan.apprentice.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {plan.apprentice.trade}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{plan.planName}</div>
                              <div className="text-sm text-muted-foreground">
                                {plan.qualificationId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={plan.overallProgress} className="flex-1 h-2" />
                              <span className={`text-sm font-medium ${getProgressColor(plan.overallProgress)}`}>
                                {plan.overallProgress}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(plan.startDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(plan.targetCompletionDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(plan.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/apprentices/${plan.apprenticeId}`)}
                              >
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => navigate(`/training-plans/${plan.id}/edit`)}
                              >
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}
