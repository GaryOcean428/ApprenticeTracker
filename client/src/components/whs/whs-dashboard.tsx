import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, FileText, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface WHSMetrics {
  totalIncidents: number;
  openIncidents: number;
  highSeverityIncidents: number;
  incidentTrend: number;
  resolvedRate: number;
}

interface ChartData {
  timeline: Array<{ date: string; incidents: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
  severityDistribution: Array<{ severity: string; count: number }>;
}

interface RecentActivity {
  id: string;
  title: string;
  status: string;
  severity: string;
  date_occurred: string;
}

const STATUS_COLORS = {
  reported: '#f59e0b',
  investigating: '#3b82f6',
  'action-required': '#ef4444',
  'remediation-in-progress': '#8b5cf6',
  'pending-review': '#f97316',
  resolved: '#10b981',
  closed: '#6b7280',
  escalated: '#dc2626',
  'requires-followup': '#f59e0b'
};

const SEVERITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b', 
  high: '#ef4444'
};

export default function WHSDashboard() {
  const [metrics, setMetrics] = useState<WHSMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [timeframe, setTimeframe] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/whs/incidents/metrics?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setMetrics(data.metrics);
      setChartData(data.chartData);
      setRecentActivity(data.recentActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/whs/incidents/reports?format=${format}&timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error(`Failed to download ${format} report`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `whs-incidents-report-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${format} report:`, error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <div className="text-lg font-semibold text-gray-900">Error Loading Dashboard</div>
          <div className="text-gray-600">{error}</div>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">WHS Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadReport('pdf')}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadReport('excel')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Excel Report
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold">{metrics?.totalIncidents || 0}</p>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                {metrics?.incidentTrend ? (
                  metrics.incidentTrend > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-500">+{metrics.incidentTrend}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500">{metrics.incidentTrend}</span>
                    </>
                  )
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Incidents</p>
              <p className="text-2xl font-bold text-orange-600">{metrics?.openIncidents || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">High Severity</p>
              <p className="text-2xl font-bold text-red-600">{metrics?.highSeverityIncidents || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-bold text-green-600">{metrics?.resolvedRate || 0}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Incident Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Timeline</CardTitle>
            <CardDescription>Daily incident reports over selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData?.timeline || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any) => [value, 'Incidents']}
                  />
                  <Line type="monotone" dataKey="incidents" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Status Distribution</CardTitle>
            <CardDescription>Current status of all incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData?.statusDistribution || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {(chartData?.statusDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest incident reports and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(activity.date_occurred).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      style={{ 
                        borderColor: SEVERITY_COLORS[activity.severity as keyof typeof SEVERITY_COLORS],
                        color: SEVERITY_COLORS[activity.severity as keyof typeof SEVERITY_COLORS]
                      }}
                    >
                      {activity.severity}
                    </Badge>
                    <Badge
                      variant="outline"
                      style={{ 
                        borderColor: STATUS_COLORS[activity.status as keyof typeof STATUS_COLORS],
                        color: STATUS_COLORS[activity.status as keyof typeof STATUS_COLORS]
                      }}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activity to display
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}