import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart2, 
  PieChart, 
  Users, 
  Building2, 
  ShieldCheck, 
  FileText,
  Download,
  Printer,
  Share2,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock chart component since we can't use Chart.js directly
const ChartPlaceholder = ({ title, icon: Icon, description }: { title: string, icon: any, description: string }) => {
  return (
    <div className="h-64 bg-muted border border-border rounded-lg flex items-center justify-center">
      <div className="text-center px-4">
        <Icon className="mx-auto h-16 w-16 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

const ReportsList = () => {
  const [timeframe, setTimeframe] = useState("month");
  
  // Fetch dashboard metrics
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/metrics');
      if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
      return res.json();
    }
  });
  
  // Fetch recent activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['/api/activities/recent'],
    queryFn: async () => {
      const res = await fetch('/api/activities/recent?limit=5');
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json();
    }
  });
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Analytics & Reporting</h2>
        <div className="flex gap-2">
          <Select
            value={timeframe}
            onValueChange={setTimeframe}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="apprentices">Apprentices</TabsTrigger>
          <TabsTrigger value="hosts">Host Employers</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {isLoadingMetrics ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-card rounded-lg shadow-sm p-4">
                  <div className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-full mr-4" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-6 w-1/4" />
                      <Skeleton className="h-3 w-2/5 mt-1" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 mr-4 rounded-full bg-primary-100 text-primary">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                          Total Apprentices
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {metrics?.totalApprentices || 0}
                        </p>
                        <p className="text-xs flex items-center mt-1 text-success">
                          <span className="mr-1">↑</span>
                          12% since last {timeframe}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 mr-4 rounded-full bg-secondary-100 text-secondary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                          Active Hosts
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {metrics?.activeHosts || 0}
                        </p>
                        <p className="text-xs flex items-center mt-1 text-success">
                          <span className="mr-1">↑</span>
                          5% since last {timeframe}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 mr-4 rounded-full bg-yellow-100 text-warning">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                          Compliance Rate
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          87%
                        </p>
                        <p className="text-xs flex items-center mt-1 text-success">
                          <span className="mr-1">↑</span>
                          3% since last {timeframe}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 mr-4 rounded-full bg-accent-100 text-accent">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                          Completion Rate
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          71%
                        </p>
                        <p className="text-xs flex items-center mt-1 text-destructive">
                          <span className="mr-1">↓</span>
                          2% since last {timeframe}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Apprentice Progress</CardTitle>
                <CardDescription>
                  Average progress by trade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder 
                  title="Apprentice Progress" 
                  icon={BarChart2}
                  description="Apprentice progress chart would appear here"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Placement Distribution</CardTitle>
                <CardDescription>
                  Distribution of placements by industry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder 
                  title="Placement Distribution" 
                  icon={PieChart}
                  description="Placement distribution chart would appear here"
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Compliance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
              <CardDescription>
                Compliance status across different areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Document Compliance</div>
                    <Badge className="bg-success text-success-foreground">93%</Badge>
                  </div>
                  <Progress value={93} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Safety Compliance</div>
                    <Badge className="bg-warning text-warning-foreground">78%</Badge>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Contract Compliance</div>
                    <Badge className="bg-success text-success-foreground">100%</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Training Compliance</div>
                    <Badge className="bg-success text-success-foreground">89%</Badge>
                  </div>
                  <Progress value={89} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Host Employer Compliance</div>
                    <Badge className="bg-warning text-warning-foreground">82%</Badge>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <ShieldCheck className="w-4 h-4 mr-2" />
                View Full Compliance Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="apprentices" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Apprentice Performance</CardTitle>
              <CardDescription>
                Performance metrics for all apprentices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder 
                title="Apprentice Performance" 
                icon={BarChart2}
                description="Apprentice performance chart would appear here"
              />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Apprentice Report
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Progress by Trade</CardTitle>
                <CardDescription>
                  Average progress percentage by trade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder 
                  title="Progress by Trade" 
                  icon={BarChart2}
                  description="Progress by trade chart would appear here"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Completion Rates</CardTitle>
                <CardDescription>
                  Apprenticeship completion rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder 
                  title="Completion Rates" 
                  icon={PieChart}
                  description="Completion rates chart would appear here"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="hosts" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Host Employer Distribution</CardTitle>
              <CardDescription>
                Distribution of host employers by industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder 
                title="Host Distribution" 
                icon={PieChart}
                description="Host employer distribution chart would appear here"
              />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Host Report
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Safety Ratings</CardTitle>
                <CardDescription>
                  Average safety ratings by industry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder 
                  title="Safety Ratings" 
                  icon={BarChart2}
                  description="Safety ratings chart would appear here"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Placement Capacity</CardTitle>
                <CardDescription>
                  Current vs. maximum placement capacity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder 
                  title="Placement Capacity" 
                  icon={BarChart2}
                  description="Placement capacity chart would appear here"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="compliance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trends</CardTitle>
              <CardDescription>
                Compliance rate trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder 
                title="Compliance Trends" 
                icon={BarChart2}
                description="Compliance trends chart would appear here"
              />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Compliance Report
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Issues by Type</CardTitle>
                <CardDescription>
                  Distribution of compliance issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder 
                  title="Compliance Issues" 
                  icon={PieChart}
                  description="Compliance issues chart would appear here"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resolution Time</CardTitle>
                <CardDescription>
                  Average time to resolve compliance issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder 
                  title="Resolution Time" 
                  icon={BarChart2}
                  description="Resolution time chart would appear here"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>
                Overview of financial performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder 
                title="Financial Summary" 
                icon={BarChart2}
                description="Financial summary chart would appear here"
              />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Financial Report
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>
                  Distribution of revenue sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder 
                  title="Revenue Sources" 
                  icon={PieChart}
                  description="Revenue sources chart would appear here"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
                <CardDescription>
                  Distribution of expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder 
                  title="Expenses" 
                  icon={PieChart}
                  description="Expenses chart would appear here"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ReportsList;
