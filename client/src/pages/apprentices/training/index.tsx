import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Plus,
  GraduationCap,
  FileText,
  BookOpen,
  Search,
  Filter,
  ChevronDown,
  BarChart,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function ApprenticeTrainingPlans() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Training Plans</h2>
          <p className="text-muted-foreground">Manage and monitor training plans for apprentices</p>
        </div>
        <Button
          onClick={() =>
            toast({
              title: 'Coming Soon',
              description: 'Training plan creation feature coming soon',
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> New Training Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Training Plans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall progress across all plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plans Requiring Review</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled for review in 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Plans</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">Fully completed training plans</p>
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
                <TabsTrigger value="review" className="text-sm">
                  Requiring Review
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-sm">
                  Completed
                </TabsTrigger>
                <TabsTrigger value="templates" className="text-sm">
                  Plan Templates
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search training plans..."
                    className="pl-8 h-9 w-[200px]"
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
                    <DropdownMenuItem>All Plans</DropdownMenuItem>
                    <DropdownMenuItem>Electrical</DropdownMenuItem>
                    <DropdownMenuItem>Plumbing</DropdownMenuItem>
                    <DropdownMenuItem>Carpentry</DropdownMenuItem>
                    <DropdownMenuItem>Business</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <TabsContent value="active" className="py-4">
              <div className="rounded-md border divide-y">
                {/* Training plan items from real data */}
                {[
                  {
                    id: 1150540,
                    name: 'Abdullah Mohamed Osman Dihishi',
                    qualification: 'UEE30811: Electrotechnology Electrician',
                    progress: 65,
                    trade: 'Electrical',
                    start: '01/10/2021',
                    end: '02/07/2026',
                    status: 'Active',
                  },
                  {
                    id: 1139497,
                    name: 'Billy Douglas Carlton',
                    qualification: 'CPC33020: Bricklaying and Blocklaying',
                    progress: 42,
                    trade: 'Construction',
                    start: '04/10/2021',
                    end: '04/10/2024',
                    status: 'Active',
                  },
                  {
                    id: 479044,
                    name: 'Sheldon Douglas Taylor',
                    qualification: 'MEM30319: Engineering - Fabrication Trade',
                    progress: 78,
                    trade: 'Engineering',
                    start: '30/09/2021',
                    end: '27/02/2027',
                    status: 'Active',
                  },
                  {
                    id: 1143049,
                    name: 'Aaron Glen Ford',
                    qualification: 'UEE30811: Electrotechnology Electrician',
                    progress: 52,
                    trade: 'Electrical',
                    start: '06/09/2021',
                    end: '06/09/2025',
                    status: 'Active',
                  },
                  {
                    id: 447528,
                    name: 'Kyle Thomas Baker',
                    qualification: 'CPC30220: Carpentry',
                    progress: 84,
                    trade: 'Carpentry',
                    start: '20/09/2021',
                    end: '20/09/2025',
                    status: 'Active',
                  },
                  {
                    id: 1196048,
                    name: 'Shanae Olivia-Anne Miller',
                    qualification: 'BSB20120: Workplace Skills',
                    progress: 15,
                    trade: 'Business',
                    start: '22/02/2024',
                    end: '22/08/2025',
                    status: 'Active',
                  },
                ].map(plan => (
                  <div key={plan.id} className="p-4 flex items-center">
                    <div className="flex-1">
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.qualification}</p>
                      <div className="text-xs text-muted-foreground mt-1 mb-1">
                        <span>
                          Start: {plan.start} • End: {plan.end}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Progress value={plan.progress} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground">{plan.progress}%</span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <Badge>{plan.trade}</Badge>
                      <span className="text-xs mt-1">{plan.status}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2"
                        onClick={() => navigate(`/apprentices/${plan.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center py-8">
                <h3 className="text-lg font-medium">More Plans Coming Soon</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  The training plans module is under development. Additional features will be
                  available soon.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/apprentices')}>
                  View Apprentice List
                </Button>
              </div>
            </TabsContent>

            {['review', 'completed', 'templates'].map(tab => (
              <TabsContent key={tab} value={tab} className="py-4">
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium">Coming Soon</h3>
                  <p className="text-muted-foreground mt-2">
                    This section is currently under development.
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}
