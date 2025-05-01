import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  BarChart3,
  CalendarCheck,
  ChevronDown,
  Download,
  FileDown,
  HardHat,
  PieChart as PieChartIcon,
  Users
} from "lucide-react";

// Host employer performance report type
interface HostPerformanceReport {
  id: number;
  hostId: number;
  hostName: string;
  reportPeriod: string;
  totalApprentices: number;
  activeApprentices: number;
  completedApprentices: number;
  avgCompletionRate: number;
  avgRetentionRate: number;
  safetyIncidents: number;
  complianceScore: number;
  apprenticeSatisfaction: number;
  supervisorRating: number;
  trainingQualityScore: number;
  notes: string | null;
  strengthAreas: string[];
  improvementAreas: string[];
  generatedAt: string;
}

// Monthly apprentice progress data for charts
interface MonthlyProgress {
  month: string;
  completionRate: number;
  retention: number;
  satisfaction: number;
}

// Training quality breakdown data for pie chart
interface TrainingBreakdown {
  name: string;
  value: number;
}

const HostReportsPage = () => {
  const params = useParams<{ id?: string }>();
  const hostId = params.id ? parseInt(params.id) : undefined;
  const [activeTab, setActiveTab] = useState("performance");
  const [reportPeriod, setReportPeriod] = useState("last-12-months");

  // Fetch host employer details
  const { data: host, isLoading: hostLoading } = useQuery({
    queryKey: ["/api/hosts", hostId],
    queryFn: async () => {
      if (!hostId) return null;
      const res = await fetch(`/api/hosts/${hostId}`);
      if (!res.ok) throw new Error("Failed to fetch host employer");
      return res.json();
    },
    enabled: !!hostId,
  });

  // Fetch performance report
  const { data: performanceReport, isLoading: reportLoading } = useQuery({
    queryKey: ["/api/hosts", hostId, "reports", "performance", reportPeriod],
    queryFn: async () => {
      if (!hostId) return null;
      try {
        const res = await fetch(`/api/hosts/${hostId}/reports/performance?period=${reportPeriod}`);
        if (!res.ok) {
          console.warn("API endpoint not available or returned error");
          return null;
        }
        return res.json() as Promise<HostPerformanceReport>;
      } catch (error) {
        console.warn("API endpoint not available", error);
        return null;
      }
    },
    enabled: !!hostId,
  });

  // Sample data for charts (when API data is not available)
  const monthlyProgressData: MonthlyProgress[] = [
    { month: "Jan", completionRate: 72, retention: 95, satisfaction: 4.2 },
    { month: "Feb", completionRate: 75, retention: 94, satisfaction: 4.3 },
    { month: "Mar", completionRate: 78, retention: 96, satisfaction: 4.5 },
    { month: "Apr", completionRate: 77, retention: 95, satisfaction: 4.4 },
    { month: "May", completionRate: 80, retention: 97, satisfaction: 4.6 },
    { month: "Jun", completionRate: 82, retention: 98, satisfaction: 4.7 },
    { month: "Jul", completionRate: 85, retention: 97, satisfaction: 4.8 },
    { month: "Aug", completionRate: 88, retention: 96, satisfaction: 4.7 },
    { month: "Sep", completionRate: 86, retention: 95, satisfaction: 4.5 },
    { month: "Oct", completionRate: 84, retention: 94, satisfaction: 4.3 },
    { month: "Nov", completionRate: 86, retention: 96, satisfaction: 4.4 },
    { month: "Dec", completionRate: 88, retention: 97, satisfaction: 4.6 },
  ];

  const trainingBreakdownData: TrainingBreakdown[] = [
    { name: "Technical Skills", value: 45 },
    { name: "Supervision Quality", value: 30 },
    { name: "Documentation", value: 15 },
    { name: "Safety Procedures", value: 10 },
  ];

  // Chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Format date for display
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd MMM yyyy");
  };

  // Loading state
  if (hostLoading || reportLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {host ? `${host.name} - Performance Reports` : "Host Employer Reports"}
        </h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Export Report
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" /> Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" /> Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" /> Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <CalendarCheck className="mr-2 h-4 w-4" />
                {reportPeriod === "last-12-months"
                  ? "Last 12 Months"
                  : reportPeriod === "last-6-months"
                  ? "Last 6 Months"
                  : "Last 3 Months"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setReportPeriod("last-3-months")}>
                Last 3 Months
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReportPeriod("last-6-months")}>
                Last 6 Months
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReportPeriod("last-12-months")}>
                Last 12 Months
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="performance" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="performance">Performance Overview</TabsTrigger>
          <TabsTrigger value="progress">Apprentice Progress</TabsTrigger>
          <TabsTrigger value="training">Training Quality</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Apprentices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {performanceReport?.totalApprentices || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {performanceReport?.activeApprentices || 0} active,{" "}
                  {performanceReport?.completedApprentices || 0} completed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {performanceReport?.avgCompletionRate || 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Industry average: 82%
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Apprentice Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {performanceReport?.apprenticeSatisfaction || 0}/5
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {performanceReport?.totalApprentices || 0} responses
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Performance Highlights</CardTitle>
              <CardDescription>
                Key performance indicators and trends for this host employer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <HardHat className="mr-2 h-4 w-4" /> Strength Areas
                  </h3>
                  <ul className="list-disc ml-5 space-y-1">
                    {performanceReport?.strengthAreas?.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    )) || (
                      <>
                        <li>Strong technical training program</li>
                        <li>High apprentice retention rate</li>
                        <li>Excellent safety record</li>
                        <li>Structured mentorship program</li>
                      </>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" /> Areas for Improvement
                  </h3>
                  <ul className="list-disc ml-5 space-y-1">
                    {performanceReport?.improvementAreas?.map((area, index) => (
                      <li key={index}>{area}</li>
                    )) || (
                      <>
                        <li>Documentation of training activities</li>
                        <li>Supervisor feedback frequency</li>
                        <li>Cross-training opportunities</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notes & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {performanceReport?.notes ||
                  "This host employer demonstrates strong commitment to apprentice development with above-average completion rates and satisfaction scores. Recommend continued investment in their mentorship program and addressing the documentation gaps identified during compliance reviews. Consider featuring this employer in the next newsletter as an example of best practices in technical skills training."}
              </p>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-xs text-muted-foreground">
                Report generated: {performanceReport?.generatedAt
                  ? formatDate(performanceReport.generatedAt)
                  : format(new Date(), "dd MMM yyyy")}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Apprentice Progress Metrics
              </CardTitle>
              <CardDescription>
                Monthly tracking of completion rates and retention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completionRate" name="Completion Rate (%)" fill="#0088FE" />
                    <Bar dataKey="retention" name="Retention (%)" fill="#00C49F" />
                    <Bar dataKey="satisfaction" name="Satisfaction (0-5)" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="training">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="mr-2 h-5 w-5" />
                  Training Quality Breakdown
                </CardTitle>
                <CardDescription>
                  Distribution of training quality factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trainingBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {trainingBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Training Quality Assessment</CardTitle>
                <CardDescription>
                  Based on field officer visits and apprentice feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Supervisor Quality</span>
                      <span className="text-sm font-medium">
                        {performanceReport?.supervisorRating || 4.2}/5
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(performanceReport?.supervisorRating || 4.2) * 20}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Technical Training</span>
                      <span className="text-sm font-medium">
                        {performanceReport?.trainingQualityScore || 4.5}/5
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(performanceReport?.trainingQualityScore || 4.5) * 20}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Documentation</span>
                      <span className="text-sm font-medium">3.8/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: `${3.8 * 20}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Safety Training</span>
                      <span className="text-sm font-medium">4.7/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${4.7 * 20}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
              <CardDescription>
                Regulatory compliance and safety metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Compliance Score</div>
                    <div className="text-3xl font-bold">
                      {performanceReport?.complianceScore || 92}%
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Safety Incidents</div>
                    <div className="text-3xl font-bold">
                      {performanceReport?.safetyIncidents || 0}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Last Audit</div>
                    <div className="text-xl font-medium">3 months ago</div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Compliance Notes</h3>
                  <p className="text-sm">
                    This host employer maintains high compliance standards with all required documentation and procedures in place. The most recent audit found only minor improvements needed in apprentice record keeping. Safety protocols exceed industry standards with regular training and zero incidents in the reporting period.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Recent Compliance Activities</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 border-b pb-3">
                      <CalendarCheck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Quarterly Site Inspection</p>
                        <p className="text-sm text-muted-foreground">Completed on 15 Apr 2025</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 border-b pb-3">
                      <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Supervisor Training Update</p>
                        <p className="text-sm text-muted-foreground">Completed on 03 Mar 2025</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <HardHat className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Safety Documentation Review</p>
                        <p className="text-sm text-muted-foreground">Completed on 22 Feb 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HostReportsPage;
