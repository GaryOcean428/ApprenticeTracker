import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Loader2, Edit, ArrowLeft, Clock, Clipboard, Tag, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const AwardDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');

  const { data: award, isLoading, error } = useQuery({
    queryKey: [`/api/awards/${id}`],
  });

  const { data: classifications, isLoading: classificationsLoading } = useQuery({
    queryKey: [`/api/awards/${id}/classifications`],
    enabled: !!id,
  });

  const { data: penalties, isLoading: penaltiesLoading } = useQuery({
    queryKey: [`/api/awards/${id}/penalties`],
    enabled: !!id,
  });

  const { data: allowances, isLoading: allowancesLoading } = useQuery({
    queryKey: [`/api/awards/${id}/allowances`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !award) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-xl font-semibold mb-2">Award Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested award could not be found or there was an error loading it.</p>
        <Button asChild>
          <Link href="/awards">Return to Awards List</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/awards">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Awards
            </Link>
          </Button>
        </div>
        <Button asChild>
          <Link href={`/awards/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Award
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{award.name}</CardTitle>
              <CardDescription>Award Code: {award.code}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Description</h3>
                <p>{award.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Industry</h3>
                  <p>{award.industry || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Sector</h3>
                  <p>{award.sector || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="classifications">Classifications</TabsTrigger>
              <TabsTrigger value="penalties">Penalties</TabsTrigger>
              <TabsTrigger value="allowances">Allowances</TabsTrigger>
            </TabsList>

            <TabsContent value="classifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Award Classifications</CardTitle>
                  <CardDescription>Pay levels and classifications defined in this award</CardDescription>
                </CardHeader>
                <CardContent>
                  {classificationsLoading ? (
                    <div className="py-4 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : !classifications || classifications.length === 0 ? (
                    <div className="py-4 text-center">
                      <p className="text-muted-foreground">No classifications found for this award.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {classifications.map((classification) => (
                        <div key={classification.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{classification.name}</h3>
                            <Badge>{classification.level}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                            <Tag className="h-4 w-4" />
                            <span>{classification.code || 'No code'}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Hourly Rate</p>
                              <p className="font-medium">${classification.hourlyRate?.toFixed(2) || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Weekly Rate</p>
                              <p className="font-medium">${classification.weeklyRate?.toFixed(2) || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="penalties" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Penalty Rates</CardTitle>
                  <CardDescription>Additional rates for overtime, weekends, and public holidays</CardDescription>
                </CardHeader>
                <CardContent>
                  {penaltiesLoading ? (
                    <div className="py-4 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : !penalties || penalties.length === 0 ? (
                    <div className="py-4 text-center">
                      <p className="text-muted-foreground">No penalty rates found for this award.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {penalties.map((penalty) => (
                        <div key={penalty.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{penalty.name}</h3>
                            <Badge variant={penalty.type === 'overtime' ? 'destructive' : penalty.type === 'weekend' ? 'secondary' : 'outline'}>
                              {penalty.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{penalty.description || 'No description'}</p>
                          <div className="text-sm flex items-center gap-1 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Multiplier: {penalty.multiplier}x</span>
                          </div>
                          {penalty.dayOfWeek && (
                            <div className="text-sm flex items-center gap-1">
                              <Clipboard className="h-4 w-4 text-muted-foreground" />
                              <span>Day: {penalty.dayOfWeek}</span>
                            </div>
                          )}
                          {(penalty.startTime || penalty.endTime) && (
                            <div className="text-sm flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>Time: {penalty.startTime || ''} - {penalty.endTime || ''}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="allowances" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Allowances</CardTitle>
                  <CardDescription>Additional payments for specific conditions or responsibilities</CardDescription>
                </CardHeader>
                <CardContent>
                  {allowancesLoading ? (
                    <div className="py-4 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : !allowances || allowances.length === 0 ? (
                    <div className="py-4 text-center">
                      <p className="text-muted-foreground">No allowances found for this award.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allowances.map((allowance) => (
                        <div key={allowance.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{allowance.name}</h3>
                            <Badge variant="secondary">{allowance.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{allowance.description || 'No description'}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Amount</p>
                              <p className="font-medium">${allowance.amount?.toFixed(2) || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Calculation Basis</p>
                              <p className="font-medium">{allowance.calculationBasis || 'Fixed amount'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Award Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p>{new Date(award.updatedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Effective Date</h3>
                <p>{award.effectiveDate ? new Date(award.effectiveDate).toLocaleDateString() : 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <Badge variant={award.isActive ? 'default' : 'secondary'} className="mt-1">
                  {award.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/awards/${id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Award Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AwardDetail;
