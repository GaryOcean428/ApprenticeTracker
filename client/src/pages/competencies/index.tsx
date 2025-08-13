import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Target,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  BarChart3,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useToast } from '@/hooks/use-toast';
import type { Competency, ApprenticeCompetency, Apprentice } from '@shared/schema';

interface CompetencyWithProgress extends Competency {
  totalApprentices: number;
  competentCount: number;
  inProgressCount: number;
  notStartedCount: number;
  averageProgress: number;
}

interface ApprenticeCompetencyWithDetails extends ApprenticeCompetency {
  competency: Competency;
  apprentice: Apprentice;
}

export default function CompetencyManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTradeArea, setFilterTradeArea] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Fetch competencies with progress statistics
  const { data: competencies, isLoading: isLoadingCompetencies } = useQuery({
    queryKey: ['/api/competencies'],
    queryFn: async (): Promise<CompetencyWithProgress[]> => {
      const res = await fetch('/api/competencies');
      if (!res.ok) throw new Error('Failed to fetch competencies');
      return res.json();
    },
  });

  // Fetch apprentice competency progress
  const { data: apprenticeCompetencies, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['/api/apprentice-competencies'],
    queryFn: async (): Promise<ApprenticeCompetencyWithDetails[]> => {
      const res = await fetch('/api/apprentice-competencies');
      if (!res.ok) throw new Error('Failed to fetch apprentice competencies');
      return res.json();
    },
  });

  // Mock data for development
  const mockCompetencies: CompetencyWithProgress[] = [
    {
      id: 1,
      code: 'UEENEEE101A',
      title: 'Use basic computer applications relevant to a workplace',
      description: 'This unit covers the skills and knowledge required to use basic computer applications in the workplace.',
      category: 'Core',
      level: 'Beginner',
      tradeArea: 'Electrical',
      isActive: true,
      totalApprentices: 25,
      competentCount: 15,
      inProgressCount: 8,
      notStartedCount: 2,
      averageProgress: 72,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      code: 'UEENEEE102A',
      title: 'Fabricate, assemble and dismantle utilities infrastructure',
      description: 'This unit covers fabrication, assembly and dismantling of utilities infrastructure.',
      category: 'Core',
      level: 'Intermediate',
      tradeArea: 'Electrical',
      isActive: true,
      totalApprentices: 22,
      competentCount: 8,
      inProgressCount: 12,
      notStartedCount: 2,
      averageProgress: 58,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      code: 'CPC33020A',
      title: 'Lay bricks and blocks',
      description: 'This unit covers the skills required to lay bricks and blocks for various construction applications.',
      category: 'Specialist',
      level: 'Advanced',
      tradeArea: 'Construction',
      isActive: true,
      totalApprentices: 15,
      competentCount: 12,
      inProgressCount: 3,
      notStartedCount: 0,
      averageProgress: 85,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      code: 'MEM30319A',
      title: 'Use hand tools',
      description: 'This unit covers the selection and safe use of hand tools in engineering applications.',
      category: 'Core',
      level: 'Beginner',
      tradeArea: 'Engineering',
      isActive: true,
      totalApprentices: 18,
      competentCount: 16,
      inProgressCount: 2,
      notStartedCount: 0,
      averageProgress: 91,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Use mock data for development
  const displayCompetencies = competencies || mockCompetencies;

  // Filter competencies
  const filteredCompetencies = displayCompetencies.filter(comp => {
    const matchesSearch = 
      comp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTradeArea = filterTradeArea === 'all' || comp.tradeArea === filterTradeArea;
    const matchesCategory = filterCategory === 'all' || comp.category === filterCategory;

    return matchesSearch && matchesTradeArea && matchesCategory;
  });

  // Calculate statistics
  const stats = {
    totalCompetencies: displayCompetencies.length,
    totalApprentices: displayCompetencies.reduce((sum, c) => sum + c.totalApprentices, 0),
    totalCompetentCount: displayCompetencies.reduce((sum, c) => sum + c.competentCount, 0),
    averageCompletionRate: displayCompetencies.length > 0 
      ? displayCompetencies.reduce((sum, c) => sum + c.averageProgress, 0) / displayCompetencies.length 
      : 0,
    competenciesNeedingAttention: displayCompetencies.filter(c => c.averageProgress < 50).length,
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (competentCount: number, totalCount: number) => {
    const percentage = totalCount > 0 ? (competentCount / totalCount) * 100 : 0;
    
    if (percentage >= 80) {
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    } else if (percentage >= 60) {
      return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    } else if (percentage >= 40) {
      return <Badge className="bg-yellow-100 text-yellow-800">Needs Work</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Attention Required</Badge>;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-gray-100 text-gray-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competency Management</h1>
          <p className="text-muted-foreground">
            Track and manage apprentice competency development across all trade areas
          </p>
        </div>
        <Button asChild>
          <Link href="/competencies/create">
            <Target className="mr-2 h-4 w-4" />
            Add Competency
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Competencies</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompetencies}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all trade areas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Apprentices</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApprentices}</div>
            <p className="text-xs text-muted-foreground mt-1">Working on competencies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Competent Achievements</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompetentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully achieved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageCompletionRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all competencies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.competenciesNeedingAttention}</div>
            <p className="text-xs text-muted-foreground mt-1">Below 50% progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search competencies by code or title..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterTradeArea} onValueChange={setFilterTradeArea}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trade Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trade Areas</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="Carpentry">Carpentry</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Core">Core</SelectItem>
                  <SelectItem value="Elective">Elective</SelectItem>
                  <SelectItem value="Specialist">Specialist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competency Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competency</TableHead>
                      <TableHead>Trade Area</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Apprentices</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingCompetencies ? (
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={7} className="text-center py-4">
                            Loading competencies...
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredCompetencies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-3">
                            <Target className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-medium">No Competencies Found</h3>
                              <p className="text-muted-foreground">
                                {searchQuery ? 'Try adjusting your search criteria.' : 'Add competencies to start tracking apprentice progress.'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCompetencies.map((competency) => (
                        <TableRow key={competency.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{competency.code}</div>
                              <div className="text-sm text-muted-foreground max-w-md">
                                {competency.title}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{competency.tradeArea}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getLevelColor(competency.level || '')}>
                              {competency.level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Progress 
                                  value={competency.averageProgress} 
                                  className="flex-1 h-2"
                                />
                                <span className="text-sm text-muted-foreground w-12">
                                  {competency.averageProgress}%
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {competency.competentCount} of {competency.totalApprentices} competent
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span>{competency.competentCount} Competent</span>
                              </div>
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span>{competency.inProgressCount} In Progress</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                <span>{competency.notStartedCount} Not Started</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(competency.competentCount, competency.totalApprentices)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/competencies/${competency.id}`}>
                                  View
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Individual progress tracking view will show detailed apprentice-by-competency progress matrix.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Competency Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Performance analytics charts will be displayed here.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Progress Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Progress trend analysis will be displayed here.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}