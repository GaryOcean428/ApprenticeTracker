import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import {
  AlertTriangle,
  ShieldAlert,
  Clipboard,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BadgeAlert } from 'lucide-react';
import IncidentsList from '@/components/whs/incidents-list';
import RiskAssessmentsList from '@/components/whs/risk-assessments-list';
import SafetyPoliciesList from '@/components/whs/safety-policies-list';
import InspectionsList from '@/components/whs/inspections-list';

export default function WHSDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/whs/statistics'],
    retry: false,
  });
  
  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ['/api/whs/incidents', { limit: 5 }],
    retry: false,
  });
  
  const { data: riskAssessments, isLoading: risksLoading } = useQuery({
    queryKey: ['/api/whs/risk-assessments', { limit: 5 }],
    retry: false,
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Work Health & Safety</h1>
        <div className="flex gap-2">
          <Button variant="outline">Export Reports</Button>
          <Button>Create New</Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="incidents">Incidents & Hazards</TabsTrigger>
          <TabsTrigger value="risk-assessments">Risk Assessments</TabsTrigger>
          <TabsTrigger value="inspections">Site Inspections</TabsTrigger>
          <TabsTrigger value="policies">Safety Policies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Incidents Reported" 
              value={statsLoading ? undefined : statistics?.incidents?.total || 0} 
              change={statsLoading ? undefined : statistics?.incidents?.change || 0} 
              icon={<ShieldAlert className="h-8 w-8 text-red-500" />} 
              loading={statsLoading}
            />
            <StatCard 
              title="Open Issues" 
              value={statsLoading ? undefined : statistics?.openIssues?.total || 0} 
              change={statsLoading ? undefined : statistics?.openIssues?.change || 0} 
              icon={<AlertTriangle className="h-8 w-8 text-amber-500" />} 
              loading={statsLoading}
            />
            <StatCard 
              title="Inspections" 
              value={statsLoading ? undefined : statistics?.inspections?.total || 0} 
              change={statsLoading ? undefined : statistics?.inspections?.change || 0} 
              icon={<Clipboard className="h-8 w-8 text-blue-500" />} 
              loading={statsLoading}
            />
            <StatCard 
              title="Risk Assessments" 
              value={statsLoading ? undefined : statistics?.riskAssessments?.total || 0} 
              change={statsLoading ? undefined : statistics?.riskAssessments?.change || 0} 
              icon={<FileText className="h-8 w-8 text-green-500" />} 
              loading={statsLoading}
            />
          </div>
          
          {statsLoading ? null : (statistics?.urgentNotifications?.length > 0 ? (
            <Alert variant="destructive" className="mb-6">
              <BadgeAlert className="h-4 w-4" />
              <AlertTitle>Urgent Notifications</AlertTitle>
              <AlertDescription>
                There are {statistics.urgentNotifications.length} urgent safety notifications that require attention.
              </AlertDescription>
            </Alert>
          ) : null)}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Incidents</CardTitle>
                <CardDescription>Latest reported safety incidents and hazards</CardDescription>
              </CardHeader>
              <CardContent>
                {incidentsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incidents?.incidents?.slice(0, 5).map((incident: any) => (
                      <div key={incident.id} className="p-3 border rounded-md flex justify-between items-center">
                        <div>
                          <p className="font-medium">{incident.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(incident.date_reported).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          incident.severity === 'high' ? 'bg-red-100 text-red-800' :
                          incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                        </div>
                      </div>
                    ))}
                    {(!incidents?.incidents || incidents.incidents.length === 0) && 
                      <p className="text-center text-muted-foreground py-4">No recent incidents reported</p>
                    }
                  </div>
                )}
                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('incidents')}>
                    View All Incidents
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessments</CardTitle>
                <CardDescription>Latest workplace risk assessments</CardDescription>
              </CardHeader>
              <CardContent>
                {risksLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {riskAssessments?.assessments?.slice(0, 5).map((assessment: any) => (
                      <div key={assessment.id} className="p-3 border rounded-md flex justify-between items-center">
                        <div>
                          <p className="font-medium">{assessment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(assessment.assessment_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          assessment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          assessment.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {assessment.status.split('-').map((word: string) => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </div>
                      </div>
                    ))}
                    {(!riskAssessments?.assessments || riskAssessments.assessments.length === 0) && 
                      <p className="text-center text-muted-foreground py-4">No recent risk assessments</p>
                    }
                  </div>
                )}
                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('risk-assessments')}>
                    View All Risk Assessments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="incidents">
          <IncidentsList />
        </TabsContent>
        
        <TabsContent value="risk-assessments">
          <RiskAssessmentsList />
        </TabsContent>
        
        <TabsContent value="inspections">
          <InspectionsList />
        </TabsContent>
        
        <TabsContent value="policies">
          <SafetyPoliciesList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value?: number;
  change?: number;
  icon: React.ReactNode;
  loading?: boolean;
}

function StatCard({ title, value, change, icon, loading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <h3 className="text-2xl font-bold">{value}</h3>
            )}
            {loading ? (
              <Skeleton className="h-4 w-16 mt-2" />
            ) : change !== undefined ? (
              <p className={`text-xs font-medium mt-1 ${
                change > 0 ? 'text-green-600' : 
                change < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {change > 0 ? `+${change}%` : change < 0 ? `${change}%` : 'No change'} from last month
              </p>
            ) : null}
          </div>
          <div className="bg-muted p-2 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}