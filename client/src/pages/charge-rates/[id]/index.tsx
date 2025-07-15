import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Printer, Mail, Download, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChargeRateVisualizer } from '@/components/rates/ChargeRateVisualizer';
import { RateApprovalWorkflow } from '@/components/rates/RateApprovalWorkflow';
import { MainLayout } from '@/components/layout/MainLayout';

export default function ChargeRateDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch charge rate calculation details
  const {
    data: calculation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/payroll/charge-rates', id],
    select: data => data?.data,
  });

  // Fetch related apprentice details if available
  const { data: apprentice } = useQuery({
    queryKey: ['/api/apprentices', calculation?.apprenticeId],
    enabled: !!calculation?.apprenticeId,
    select: data => data?.data,
  });

  // Fetch related host employer details if available
  const { data: hostEmployer } = useQuery({
    queryKey: ['/api/host-employers', calculation?.hostEmployerId],
    enabled: !!calculation?.hostEmployerId,
    select: data => data?.data,
  });

  // Construct full names if available
  const apprenticeName = apprentice
    ? `${apprentice.firstName || ''} ${apprentice.lastName || ''}`.trim()
    : undefined;

  const hostEmployerName = hostEmployer
    ? hostEmployer.companyName || hostEmployer.businessName
    : undefined;

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/charge-rates">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Charge Rates
              </Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isLoading ? <Skeleton className="h-9 w-64" /> : `Charge Rate Calculation ${id}`}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isLoading ? (
                  <Skeleton className="h-5 w-72" />
                ) : (
                  'Detailed breakdown of charge rate calculation and approval status.'
                )}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load charge rate calculation. Please try again later.
            </AlertDescription>
          </Alert>
        ) : calculation ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1">
              <RateApprovalWorkflow calculation={calculation} className="sticky top-6" />
            </div>

            <div className="col-span-1 md:col-span-3 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Calculation Details</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <ChargeRateVisualizer
                    calculation={calculation}
                    apprenticeName={apprenticeName}
                    hostEmployerName={hostEmployerName}
                    awardName={calculation.awardName}
                    classificationName={calculation.classificationName}
                    calculationId={parseInt(id!)}
                    calculationDate={calculation.calculationDate}
                    approved={calculation.approved}
                    showExportOptions={false}
                  />
                </TabsContent>

                <TabsContent value="details" className="space-y-6">
                  <div className="prose max-w-none">
                    <h2>Calculation Formula and Methodology</h2>
                    <p>
                      This calculation uses the R8 rate calculation system to determine the
                      appropriate charge rate for the host employer. The calculation takes into
                      account the base pay rate, on-costs, and a profit margin.
                    </p>

                    <h3>Calculation Steps</h3>
                    <ol>
                      <li>
                        <strong>Base Wage Calculation:</strong> Pay rate × Total annual hours
                        <br />
                        <code>
                          ${calculation.payRate} × {calculation.totalHours} = $
                          {calculation.baseWage}
                        </code>
                      </li>
                      <li>
                        <strong>On-costs Calculation:</strong> Various statutory and operational
                        costs
                        <br />
                        <ul>
                          <li>Superannuation: {calculation.oncosts.superannuation}</li>
                          <li>Workers Compensation: {calculation.oncosts.workersComp}</li>
                          <li>Payroll Tax: {calculation.oncosts.payrollTax}</li>
                          <li>Leave Loading: {calculation.oncosts.leaveLoading}</li>
                          <li>Study Costs: {calculation.oncosts.studyCost}</li>
                          <li>PPE Costs: {calculation.oncosts.ppeCost}</li>
                          <li>Administration: {calculation.oncosts.adminCost}</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Total Cost Calculation:</strong> Base wage + Total on-costs
                        <br />
                        <code>
                          ${calculation.baseWage} + $
                          {Object.values(calculation.oncosts).reduce((a, b) => a + b, 0)} = $
                          {calculation.totalCost}
                        </code>
                      </li>
                      <li>
                        <strong>Cost Per Hour:</strong> Total cost ÷ Billable hours
                        <br />
                        <code>
                          ${calculation.totalCost} ÷ {calculation.billableHours} = $
                          {calculation.costPerHour}
                        </code>
                      </li>
                      <li>
                        <strong>Charge Rate Calculation:</strong> Cost per hour × (1 + Margin)
                        <br />
                        <code>
                          ${calculation.costPerHour} × (1 +{' '}
                          {(calculation.chargeRate / calculation.costPerHour - 1).toFixed(4)}) = $
                          {calculation.chargeRate}
                        </code>
                      </li>
                    </ol>

                    <h3>Modern Award Connection</h3>
                    <p>
                      This calculation is based on the pay rates and conditions specified in the
                      relevant modern award.
                      {calculation.awardName && (
                        <span>
                          {' '}
                          The applicable award is the <strong>{calculation.awardName}</strong>.
                        </span>
                      )}
                      {calculation.classificationName && (
                        <span>
                          {' '}
                          The classification used is{' '}
                          <strong>{calculation.classificationName}</strong>.
                        </span>
                      )}
                    </p>

                    <h3>Penalty Rate Estimates</h3>
                    <p>
                      The calculation includes estimates for additional costs due to penalty rates
                      that may apply based on the modern award rules. These are provided for
                      reference only, and actual costs will depend on the specific work patterns and
                      timesheets.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                  <div className="prose max-w-none">
                    <h2>Calculation History</h2>
                    <p>
                      This section shows the complete history of changes, updates, and approval
                      workflow for this charge rate calculation.
                    </p>

                    <h3>Creation</h3>
                    <p>
                      This calculation was created on{' '}
                      {new Date(calculation.calculationDate).toLocaleDateString()}
                      for apprentice {apprenticeName || 'N/A'} and host employer{' '}
                      {hostEmployerName || 'N/A'}.
                    </p>

                    <h3>Approval Workflow</h3>
                    {calculation.approvalWorkflow && calculation.approvalWorkflow.length > 0 ? (
                      <div className="not-prose">
                        <ul className="space-y-4">
                          {calculation.approvalWorkflow.map((step, index) => (
                            <li
                              key={step.id}
                              className="border-l-2 pl-4 pb-4 border-muted-foreground"
                            >
                              <div className="flex justify-between">
                                <div>
                                  <span className="font-bold">{step.name}</span>
                                  <span className="ml-2 text-muted-foreground">({step.role})</span>
                                </div>
                                <div>
                                  {step.status === 'approved' && (
                                    <span className="text-green-500">Approved</span>
                                  )}
                                  {step.status === 'rejected' && (
                                    <span className="text-red-500">Rejected</span>
                                  )}
                                  {step.status === 'pending' && (
                                    <span className="text-amber-500">Pending</span>
                                  )}
                                  {step.status === 'not_started' && (
                                    <span className="text-muted-foreground">Not Started</span>
                                  )}
                                </div>
                              </div>

                              {step.completedAt && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {step.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                                  {new Date(step.completedAt).toLocaleString()}
                                </div>
                              )}

                              {step.comments && (
                                <div className="mt-2 bg-muted p-2 rounded-md text-sm">
                                  {step.comments}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p>No approval workflow data available for this calculation.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <Alert>
            <Calculator className="h-4 w-4" />
            <AlertTitle>No calculation found</AlertTitle>
            <AlertDescription>
              The charge rate calculation you are looking for was not found.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </MainLayout>
  );
}
