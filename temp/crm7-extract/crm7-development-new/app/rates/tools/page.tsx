/**
 * Rate Service Dashboard
 * Shows enhanced analytics and provides access to rate tools
 */
import { Suspense } from 'react';
import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RateTemplateComparison } from '@/components/rates/rate-template-comparison';
import { RateComplianceValidator } from '@/components/rates/rate-compliance-validator';

import { getRateTemplates } from '@/lib/services/rates/client';
import type { RateTemplate } from '@/lib/services/rates/types';
import type { EnhancedRateAnalytics } from '@/lib/services/rates/enhanced-types';

export const metadata: Metadata = {
  title: 'Rate Tools & Analytics',
  description: 'Advanced rate service tools and analytics dashboard',
};

async function getRateData(orgId: string): Promise<{ templates: RateTemplate[] }> {
  try {
    const templatesResponse = await getRateTemplates(orgId);
    return {
      templates: templatesResponse.data ?? [],
    };
  } catch (error) {
    console.error('Failed to load rate data:', error);
    return {
      templates: [],
    };
  }
}

interface PageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function RateServiceDashboard({ searchParams }: PageProps): Promise<ReactElement> {
  const orgId = searchParams?.orgId as string | undefined;
  
  if (!orgId) {
    return <div>No organization selected</div>;
  }
  
  const { templates } = await getRateData(orgId);
  
  // Format templates for select dropdowns
  const templateOptions = templates.map(template => ({
    id: template.id,
    name: template.name,
  }));
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Rate Tools & Analytics</h2>
        <p className="text-muted-foreground">
          Enhanced tools for rate management, compliance, and analysis.
        </p>
      </div>
      
      <Tabs defaultValue="tools" className="space-y-8">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="analytics">Enhanced Analytics</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="tools" className="space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
              <RateTemplateComparison orgId={orgId} availableTemplates={templateOptions} />
            </Suspense>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <RateAnalyticsCard orgId={orgId} />
            <TopTemplatesCard orgId={orgId} />
            <ComplianceMetricsCard orgId={orgId} />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <RateDistributionCard orgId={orgId} />
            <ChangeFrequencyCard orgId={orgId} />
          </div>
        </TabsContent>
        
        <TabsContent value="compliance" className="space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
              <RateComplianceValidator orgId={orgId} availableTemplates={templateOptions} />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface CardProps {
  readonly orgId: string;
}

function RateAnalyticsCard({ orgId }: CardProps): ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Overview</CardTitle>
        <CardDescription>Summary of rate templates</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <EnhancedRateOverview orgId={orgId} />
        </Suspense>
      </CardContent>
    </Card>
  );
}

function TopTemplatesCard({ orgId }: CardProps): ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Templates</CardTitle>
        <CardDescription>Most frequently used templates</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <TopTemplatesOverview orgId={orgId} />
        </Suspense>
      </CardContent>
    </Card>
  );
}

function ComplianceMetricsCard({ orgId }: CardProps): ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance</CardTitle>
        <CardDescription>Award compliance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <ComplianceMetricsOverview orgId={orgId} />
        </Suspense>
      </CardContent>
    </Card>
  );
}

function RateDistributionCard({ orgId }: CardProps): ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Distribution</CardTitle>
        <CardDescription>Distribution of rates across templates</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
          <RateDistributionChart orgId={orgId} />
        </Suspense>
      </CardContent>
    </Card>
  );
}

function ChangeFrequencyCard({ orgId }: CardProps): ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Frequency</CardTitle>
        <CardDescription>Rate template update frequency</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
          <ChangeFrequencyChart orgId={orgId} />
        </Suspense>
      </CardContent>
    </Card>
  );
}

// Client components for data fetching
import { useEnhancedRates } from '@/hooks/use-enhanced-rates';

function EnhancedRateOverview({ orgId }: CardProps): ReactElement {
  const { enhancedAnalytics, isLoadingAnalytics, error } = useEnhancedRates({ orgId });
  
  if (isLoadingAnalytics) {
    return <Skeleton className="h-[200px] w-full" />;
  }
  
  if (error || !enhancedAnalytics) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        Failed to load analytics data
      </div>
    );
  }
  
  const analytics = enhancedAnalytics as EnhancedRateAnalytics;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="text-2xl font-bold">{analytics.totalTemplates}</div>
          <div className="text-xs text-muted-foreground">Total Templates</div>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="text-2xl font-bold">{analytics.activeTemplates}</div>
          <div className="text-xs text-muted-foreground">Active Templates</div>
        </div>
      </div>
      
      <div className="bg-muted/50 p-3 rounded-lg">
        <div className="text-2xl font-bold">
          {new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD'
          }).format(analytics.averageRate)}
        </div>
        <div className="text-xs text-muted-foreground">Average Rate</div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Template Status</h4>
        {analytics.templatesByStatus && (
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="text-xs">
              <div className="font-bold">{analytics.templatesByStatus.active}</div>
              <div className="text-muted-foreground">Active</div>
            </div>
            <div className="text-xs">
              <div className="font-bold">{analytics.templatesByStatus.draft}</div>
              <div className="text-muted-foreground">Draft</div>
            </div>
            <div className="text-xs">
              <div className="font-bold">{analytics.templatesByStatus.archived}</div>
              <div className="text-muted-foreground">Archived</div>
            </div>
            <div className="text-xs">
              <div className="font-bold">{analytics.templatesByStatus.deleted}</div>
              <div className="text-muted-foreground">Deleted</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Other client components would follow a similar pattern
// Implementation placeholders for the remaining components

function TopTemplatesOverview({ orgId: _orgId }: CardProps): ReactElement {
  // Implementation would use useEnhancedRates hook with _orgId when needed
  return <div className="h-[200px]">Top Templates Implementation</div>;
}

function ComplianceMetricsOverview({ orgId: _orgId }: CardProps): ReactElement {
  // Implementation would use useEnhancedRates hook with _orgId when needed
  return <div className="h-[200px]">Compliance Metrics Implementation</div>;
}

function RateDistributionChart({ orgId: _orgId }: CardProps): ReactElement {
  // Implementation would use useEnhancedRates hook with _orgId when needed
  return <div className="h-full">Rate Distribution Implementation</div>;
}

function ChangeFrequencyChart({ orgId: _orgId }: CardProps): ReactElement {
  // Implementation would use useEnhancedRates hook with _orgId when needed
  return <div className="h-full">Change Frequency Implementation</div>;
}
