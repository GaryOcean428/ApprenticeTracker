import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function GtoComplianceDashboard() {
  const { toast } = useToast();
  const [selectedGtoId, setSelectedGtoId] = useState<number | null>(1); // Default to first GTO for now
  
  // Fetch GTO organizations
  const { data: gtoOrganizations, isLoading: isLoadingGtos } = useQuery({
    queryKey: ['/api/gto-organizations'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/gto-organizations');
        if (!response.ok) {
          throw new Error('Failed to fetch GTO organizations');
        }
        return await response.json();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch GTO organizations.',
          variant: 'destructive',
        });
        return [];
      }
    },
  });

  // Fetch compliance dashboard data for selected GTO
  const { 
    data: dashboardData, 
    isLoading: isLoadingDashboard 
  } = useQuery({
    queryKey: ['/api/gto-compliance/dashboard', selectedGtoId],
    queryFn: async () => {
      if (!selectedGtoId) return null;
      
      try {
        const response = await fetch(`/api/gto-compliance/dashboard/${selectedGtoId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch compliance dashboard data');
        }
        return await response.json();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch compliance dashboard data.',
          variant: 'destructive',
        });
        return null;
      }
    },
    enabled: !!selectedGtoId,
  });

  // Fetch all compliance standards
  const { data: standards, isLoading: isLoadingStandards } = useQuery({
    queryKey: ['/api/gto-compliance/standards'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/gto-compliance/standards');
        if (!response.ok) {
          throw new Error('Failed to fetch compliance standards');
        }
        return await response.json();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch compliance standards.',
          variant: 'destructive',
        });
        return [];
      }
    },
  });

  if (isLoadingGtos || isLoadingDashboard || isLoadingStandards) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate compliance score
  const calculateComplianceScore = () => {
    if (!dashboardData?.complianceStatus) return 0;
    
    const { compliant, total } = dashboardData.complianceStatus;
    if (total === 0) return 0;
    
    return Math.round((compliant / total) * 100);
  };

  // Group standards by category
  const standardsByCategory = standards
    ? standards.reduce((acc, standard) => {
        const { category } = standard;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(standard);
        return acc;
      }, {})
    : {};

  return (
    <div className="container py-10 mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">GTO Compliance Dashboard</h1>
          <Button>
            Export Compliance Report
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Compliance Score Card */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Compliance
              </CardTitle>
              <CardDescription>
                Based on assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="text-4xl font-bold">{calculateComplianceScore()}%</div>
                <Progress 
                  value={calculateComplianceScore()} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status Card */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Compliance Status
              </CardTitle>
              <CardDescription>
                Assessment distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Compliant: {dashboardData?.complianceStatus?.compliant || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>At Risk: {dashboardData?.complianceStatus?.atRisk || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>Non-Compliant: {dashboardData?.complianceStatus?.nonCompliant || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>In Progress: {dashboardData?.complianceStatus?.inProgress || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complaints Card */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Complaints
              </CardTitle>
              <CardDescription>
                Current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <span>Open: {dashboardData?.complaints?.open || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Under Review: {dashboardData?.complaints?.underReview || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Closed: {dashboardData?.complaints?.closed || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Total: {dashboardData?.complaints?.total || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appeals Card */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Appeals
              </CardTitle>
              <CardDescription>
                Current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <span>Pending: {dashboardData?.appeals?.pending || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Approved: {dashboardData?.appeals?.approved || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Rejected: {dashboardData?.appeals?.rejected || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Total: {dashboardData?.appeals?.total || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Standards and Assessments Tab */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Compliance Standards</CardTitle>
            <CardDescription>
              National Standards for Group Training Organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recruitment">
              <TabsList className="mb-4">
                <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                <TabsTrigger value="governance">Governance</TabsTrigger>
              </TabsList>
              
              {Object.keys(standardsByCategory).map(category => (
                <TabsContent key={category} value={category.toLowerCase()}>
                  <div className="space-y-4">
                    {standardsByCategory[category].map(standard => {
                      // Find assessment for this standard if any
                      const assessment = dashboardData?.upcomingAssessments?.find(
                        a => a.standard.id === standard.id
                      );
                      
                      let statusColor = 'bg-gray-200';
                      if (assessment) {
                        switch (assessment.assessment.status) {
                          case 'compliant':
                            statusColor = 'bg-green-100 text-green-800';
                            break;
                          case 'at_risk':
                            statusColor = 'bg-yellow-100 text-yellow-800';
                            break;
                          case 'non_compliant':
                            statusColor = 'bg-red-100 text-red-800';
                            break;
                          case 'in_progress':
                            statusColor = 'bg-blue-100 text-blue-800';
                            break;
                        }
                      }
                      
                      return (
                        <div key={standard.id} className="border rounded-lg p-4">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-semibold">
                                {standard.standardNumber}: {standard.standardName}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {standard.standardDescription}
                              </p>
                            </div>
                            <div>
                              <Badge 
                                className={statusColor}
                              >
                                {assessment
                                  ? assessment.assessment.status.replace('_', ' ')
                                  : 'Not Assessed'}
                              </Badge>
                            </div>
                          </div>
                          
                          {standard.requiredEvidence && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium">Required Evidence:</h4>
                              <ul className="text-sm mt-1 list-disc pl-4">
                                {standard.requiredEvidence.map((evidence, i) => (
                                  <li key={i}>{evidence}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                            >
                              {assessment ? 'Update Assessment' : 'Create Assessment'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}