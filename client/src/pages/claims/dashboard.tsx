import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, FileText, DollarSign, Clock } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ClaimsMetrics {
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  paidClaims: number;
  totalRequested: number;
  totalApproved: number;
  approvalRate: number;
}

interface ChartData {
  statusDistribution: Array<{ status: string; count: number }>;
  typeDistribution: Array<{ type: string; count: number }>;
}

interface RecentClaim {
  id: string;
  claim_number: string;
  apprentice_name: string;
  claim_type: string;
  status: string;
  amount_requested: number;
  created_at: string;
}

const STATUS_COLORS = {
  draft: '#6b7280',
  pending: '#f59e0b',
  submitted: '#3b82f6',
  'in-review': '#8b5cf6',
  approved: '#10b981',
  rejected: '#ef4444',
  paid: '#059669',
  reconciled: '#065f46',
  cancelled: '#9ca3af',
};

const CLAIM_TYPE_COLORS = {
  commencement: '#3b82f6',
  completion: '#10b981',
  retention: '#f59e0b',
  restart: '#ef4444',
  'mid-point': '#8b5cf6',
  'rural-regional': '#06b6d4',
  disability: '#f97316',
  'mature-age': '#84cc16',
  other: '#6b7280',
};

export default function ClaimsDashboard() {
  const [metrics, setMetrics] = useState<ClaimsMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentClaim[]>([]);
  const [timeframe, setTimeframe] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_, navigate] = useLocation();

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/claims/dashboard?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setMetrics(data.metrics);
      setChartData(data.chartData);
      setRecentActivity(data.recentActivity);
    } catch (error) {
      console.error('Error fetching claims dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount / 100); // Assuming amounts are stored in cents
  };

  const handleCreateClaim = () => {
    navigate('/claims/new');
  };

  const handleViewAllClaims = () => {
    navigate('/claims/list');
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
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
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
        <h1 className="text-2xl font-bold">Government Claims Dashboard</h1>
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
            <Button variant="outline" onClick={handleViewAllClaims}>
              View All Claims
            </Button>
            <Button onClick={handleCreateClaim}>Create New Claim</Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold">{metrics?.totalClaims || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">{metrics?.pendingClaims || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-green-600">{metrics?.approvalRate || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Approved</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(metrics?.totalApproved || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Claims by Status</CardTitle>
            <CardDescription>Distribution of claim statuses</CardDescription>
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
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || '#6b7280'
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Claim Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Claims by Type</CardTitle>
            <CardDescription>Distribution of claim types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData?.typeDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="type"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Claims Activity</CardTitle>
          <CardDescription>Latest claim submissions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map(claim => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="font-medium">{claim.claim_number}</h4>
                        <p className="text-sm text-gray-600">
                          {claim.apprentice_name} • {claim.claim_type.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(claim.amount_requested)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(claim.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: STATUS_COLORS[claim.status as keyof typeof STATUS_COLORS],
                        color: STATUS_COLORS[claim.status as keyof typeof STATUS_COLORS],
                      }}
                    >
                      {claim.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent claims activity to display
              </div>
            )}
          </div>

          {recentActivity.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" onClick={handleViewAllClaims} className="w-full">
                View All Claims
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
