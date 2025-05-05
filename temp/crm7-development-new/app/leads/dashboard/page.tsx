import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowUpRight, Users, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

// Sample data for lead status distribution
const leadStatusData = [
  { name: 'New', value: 12, color: '#3b82f6' },
  { name: 'Contacted', value: 8, color: '#f59e0b' },
  { name: 'Qualified', value: 6, color: '#10b981' },
  { name: 'Proposal', value: 4, color: '#6366f1' },
  { name: 'Negotiation', value: 3, color: '#8b5cf6' },
  { name: 'Won', value: 2, color: '#22c55e' },
  { name: 'Lost', value: 1, color: '#ef4444' },
];

// Sample data for lead source distribution
const leadSourceData = [
  { name: 'Website', value: 18, color: '#3b82f6' },
  { name: 'Referral', value: 7, color: '#10b981' },
  { name: 'Social', value: 5, color: '#f59e0b' },
  { name: 'Email', value: 4, color: '#8b5cf6' },
  { name: 'Event', value: 2, color: '#6366f1' },
];

// Sample data for monthly lead trends
const monthlyLeadData = [
  { month: 'Jan', count: 8 },
  { month: 'Feb', count: 12 },
  { month: 'Mar', count: 15 },
  { month: 'Apr', count: 10 },
  { month: 'May', count: 18 },
  { month: 'Jun', count: 20 },
];

export default function LeadsDashboard() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Lead Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link href="/leads">
            <div className="flex items-center text-primary hover:underline">
              View All Leads
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads (This Week)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.4% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-up Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              5 due today
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lead Status Distribution</CardTitle>
                <CardDescription>
                  Current distribution of leads by status
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {leadStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Lead Source Distribution</CardTitle>
                <CardDescription>
                  Where your leads are coming from
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadSourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {leadSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Lead Trends</CardTitle>
              <CardDescription>
                Number of new leads per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyLeadData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="New Leads" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Analytics</CardTitle>
              <CardDescription>
                Detailed metrics and conversion analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                More detailed analytics will be implemented in the next phase.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Lead Activity</CardTitle>
              <CardDescription>
                Latest interactions with leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      New Lead: Sarah Johnson
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted contact form on website
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Today at 10:23 AM
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Status Change: John Smith
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status changed from Contacted to Qualified
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Yesterday at 2:45 PM
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Task Completed: Follow-up Call
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Completed follow-up call with Michael Brown
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Yesterday at 11:30 AM
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      New Lead: David Wilson
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Referred by existing client
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Apr 6, 2025 at 9:15 AM
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
