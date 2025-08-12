import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  FileText,
  Plus,
  FileCheck,
  AlertTriangle,
  HelpCircle,
  ClipboardList,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccessEquityCompliance() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('policies');

  // Get GTO compliance standards related to Access & Equity
  const { data: standards, isLoading } = useQuery({
    queryKey: ['/api/gto-compliance/standards', 'Access & Equity'],
    queryFn: async () => {
      const res = await fetch('/api/gto-compliance/standards?category=Access%20%26%20Equity');
      if (!res.ok) throw new Error('Failed to fetch standards');
      return res.json();
    },
  });

  // Fetch assessment data
  const { data: assessments } = useQuery({
    queryKey: ['/api/gto-compliance/assessments', 'Access & Equity'],
    queryFn: async () => {
      const res = await fetch('/api/gto-compliance/assessments?category=Access%20%26%20Equity');
      if (!res.ok) throw new Error('Failed to fetch assessments');
      return res.json();
    },
  });

  const getStatusColor = status => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'at_risk':
        return 'bg-amber-100 text-amber-800';
      case 'non-compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      case 'non-compliant':
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return <HelpCircle className="h-4 w-4 mr-1" />;
    }
  };

  // Function to calculate overall compliance
  const calculateComplianceScore = () => {
    if (!assessments || assessments.length === 0) return { score: 0, total: 0, percentage: 0 };

    const total = assessments.length;
    const compliant = assessments.filter(a => a.status === 'compliant').length;
    const percentage = Math.round((compliant / total) * 100);

    return { score: compliant, total, percentage };
  };

  const compliance = calculateComplianceScore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Access & Equity Compliance</h2>
          <p className="text-muted-foreground">
            Manage and monitor compliance with Access & Equity standards for GTO operations
          </p>
        </div>
        <Button onClick={() => navigate('/gto-compliance/standard-assessment')}>
          <Plus className="mr-2 h-4 w-4" /> New Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Compliance Score</CardTitle>
            <CardDescription>Current compliance with standards</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <div className="text-5xl font-bold">{compliance.percentage}%</div>
            <p className="text-muted-foreground mt-2">
              {compliance.score} of {compliance.total} standards compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Required Actions</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
              <span className="text-xl font-semibold">
                {assessments ? assessments.filter(a => a.status === 'at_risk').length : '...'} at
                risk
              </span>
            </div>
            <div className="flex items-center mt-2">
              <XCircle className="h-6 w-6 text-red-500 mr-2" />
              <span className="text-xl font-semibold">
                {assessments ? assessments.filter(a => a.status === 'non-compliant').length : '...'}{' '}
                non-compliant
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Next Review</CardTitle>
            <CardDescription>Upcoming review requirements</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <div className="flex items-center">
              <FileCheck className="h-6 w-6 text-blue-500 mr-2" />
              <span className="text-xl font-semibold">Access & Equity Policy</span>
            </div>
            <p className="text-muted-foreground mt-2">Due in 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="policies" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="policies">Policies & Procedures</TabsTrigger>
          <TabsTrigger value="assessments">Assessment History</TabsTrigger>
          <TabsTrigger value="records">Documentation</TabsTrigger>
        </TabsList>
        <TabsContent value="policies" className="p-0 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Access & Equity Policies</CardTitle>
              <CardDescription>
                Review and manage policies and procedures related to access and equity standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Standard</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standards?.map(standard => (
                      <TableRow key={standard.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-start">
                            <FileText className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                            <div>
                              <p>{standard.standardName}</p>
                              <p className="text-sm text-muted-foreground">
                                {standard.standardNumber}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {assessments?.find(a => a.standardId === standard.id) ? (
                            <Badge
                              className={getStatusColor(
                                assessments.find(a => a.standardId === standard.id).status
                              )}
                            >
                              {getStatusIcon(
                                assessments.find(a => a.standardId === standard.id).status
                              )}
                              {assessments
                                .find(a => a.standardId === standard.id)
                                .status.replace('_', ' ')}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not assessed</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {assessments?.find(a => a.standardId === standard.id)
                            ? new Date(
                                assessments.find(a => a.standardId === standard.id).assessmentDate
                              ).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/gto-compliance/standard-assessment?standardId=${standard.id}`
                              )
                            }
                          >
                            <FileCheck className="h-4 w-4 mr-1" /> Assess
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assessments" className="p-0 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>
                Review historical compliance assessments for access and equity standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Standard</TableHead>
                      <TableHead>Assessment Date</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Assessed By</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments?.map(assessment => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">
                          {standards?.find(s => s.id === assessment.standardId)?.standardName ||
                            'Unknown Standard'}
                        </TableCell>
                        <TableCell>
                          {new Date(assessment.assessmentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(assessment.status)}>
                            {getStatusIcon(assessment.status)}
                            {assessment.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{assessment.assessedBy || 'System'}</TableCell>
                        <TableCell>
                          {assessment.dueDate
                            ? new Date(assessment.dueDate).toLocaleDateString()
                            : 'Not scheduled'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/gto-compliance/assessment/${assessment.id}`)}
                          >
                            <FileText className="h-4 w-4 mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="records" className="p-0 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentation & Records</CardTitle>
              <CardDescription>
                Essential documentation and records for access and equity compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 p-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">Access & Equity Policy</h3>
                    <p className="text-sm text-muted-foreground my-2">Last updated: May 1, 2024</p>
                    <div className="flex justify-between items-center mt-4">
                      <Badge variant="outline" className="rounded-full text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" /> Current
                      </Badge>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 p-4">
                    <ClipboardList className="h-8 w-8 text-primary" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">Diversity & Inclusion Plan</h3>
                    <p className="text-sm text-muted-foreground my-2">
                      Last updated: April 15, 2024
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <Badge variant="outline" className="rounded-full text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" /> Current
                      </Badge>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-950 dark:to-yellow-950 p-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">Reasonable Adjustment Procedure</h3>
                    <p className="text-sm text-muted-foreground my-2">
                      Last updated: March 20, 2024
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <Badge variant="outline" className="rounded-full text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" /> Current
                      </Badge>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950 p-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">Disability Access Plan</h3>
                    <p className="text-sm text-muted-foreground my-2">
                      Last updated: February 10, 2024
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <Badge variant="outline" className="rounded-full text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Review required
                      </Badge>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Document
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
