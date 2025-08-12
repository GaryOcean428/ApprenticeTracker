import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Check, X, RefreshCw, ExternalLink, BrainCircuit } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AwardAnalysisPanel } from '@/components/fair-work/AwardAnalysisPanel';

interface AwardUpdate {
  id: string;
  awardCode: string;
  awardName: string;
  checkDate: string;
  currentVersion: string;
  latestVersion: string | null;
  updateAvailable: boolean;
  updateUrl: string | null;
  lastNotifiedDate: string | null;
  status: 'pending' | 'notified' | 'updated' | 'ignored';
  aiAnalysis: string | null;
  notificationMessage: string | null;
  impactLevel: 'low' | 'medium' | 'high' | null;
  createdAt: string;
  updatedAt: string;
}

export default function AwardUpdatesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('notified');
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<AwardUpdate | null>(null);
  const [viewingUpdate, setViewingUpdate] = useState<AwardUpdate | null>(null);
  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    url: '',
    version: '',
    effectiveDate: '',
  });

  const { data: updates, isLoading } = useQuery({
    queryKey: ['/api/fairwork/award-updates', activeTab],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/fairwork/award-updates?status=${activeTab}`);
      return response.json();
    },
  });

  const checkUpdatesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/fairwork/award-updates/check');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fairwork/award-updates'] });
      toast({
        title: 'Update Check Completed',
        description: 'Checked for award updates successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Check Failed',
        description: error.message || 'An error occurred while checking for updates',
        variant: 'destructive',
      });
    },
  });

  const ignoreUpdateMutation = useMutation({
    mutationFn: async (updateId: string) => {
      return await apiRequest('POST', `/api/fairwork/award-updates/${updateId}/ignore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fairwork/award-updates'] });
      toast({
        title: 'Update Ignored',
        description: 'Award update has been ignored successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Ignore Update',
        description: error.message || 'An error occurred while ignoring the update',
        variant: 'destructive',
      });
    },
  });

  const updateAwardMutation = useMutation({
    mutationFn: async (data: { awardCode: string; payload: any }) => {
      return await apiRequest('PATCH', `/api/fairwork/awards/${data.awardCode}`, data.payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fairwork/award-updates'] });
      setUpdateDialogOpen(false);
      toast({
        title: 'Award Updated',
        description: 'Award has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Update Award',
        description: error.message || 'An error occurred while updating the award',
        variant: 'destructive',
      });
    },
  });

  const handleUpdateClick = (update: AwardUpdate) => {
    setSelectedUpdate(update);
    setUpdateFormData({
      name: update.awardName,
      url: update.updateUrl || '',
      version: update.latestVersion || '',
      effectiveDate: new Date().toISOString().split('T')[0],
    });
    setUpdateDialogOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUpdate) return;

    updateAwardMutation.mutate({
      awardCode: selectedUpdate.awardCode,
      payload: {
        name: updateFormData.name,
        url: updateFormData.url,
        version: updateFormData.version,
        effectiveDate: updateFormData.effectiveDate,
      },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateFormData({
      ...updateFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleViewDetails = (update: AwardUpdate) => {
    setViewingUpdate(update);
  };

  const handleCloseDetails = () => {
    setViewingUpdate(null);
  };

  const handleAnalysisComplete = () => {
    // Refetch the data to get updated analysis
    queryClient.invalidateQueries({ queryKey: ['/api/fairwork/award-updates', activeTab] });
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Award Updates Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage Fair Work award updates</p>
        </div>

        <Button
          onClick={() => checkUpdatesMutation.mutate()}
          disabled={checkUpdatesMutation.isPending}
        >
          {checkUpdatesMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Check for Updates
        </Button>
      </div>

      <Tabs defaultValue="notified" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="notified">Notified Updates</TabsTrigger>
          <TabsTrigger value="pending">Pending Updates</TabsTrigger>
          <TabsTrigger value="updated">Updated Awards</TabsTrigger>
          <TabsTrigger value="ignored">Ignored Updates</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>
              {activeTab === 'notified' && 'Award Updates Requiring Action'}
              {activeTab === 'pending' && 'Pending Award Updates'}
              {activeTab === 'updated' && 'Updated Awards History'}
              {activeTab === 'ignored' && 'Ignored Award Updates'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'notified' &&
                'These award updates have been detected and require your review and action'}
              {activeTab === 'pending' &&
                'These award updates have been detected but not yet notified'}
              {activeTab === 'updated' &&
                'History of award updates that have been applied to the system'}
              {activeTab === 'ignored' && 'Award updates that have been reviewed and ignored'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !updates?.data?.length ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>No {activeTab} award updates available</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Award Code</TableHead>
                    <TableHead>Award Name</TableHead>
                    <TableHead>Current Version</TableHead>
                    <TableHead>New Version</TableHead>
                    <TableHead>Date Detected</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updates.data.map((update: AwardUpdate) => (
                    <TableRow key={update.id}>
                      <TableCell>{update.awardCode}</TableCell>
                      <TableCell>{update.awardName}</TableCell>
                      <TableCell>{update.currentVersion}</TableCell>
                      <TableCell>
                        {update.latestVersion || 'Unknown'}
                        {update.currentVersion !== update.latestVersion && (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-amber-100 text-amber-800 border-amber-200"
                          >
                            New
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(update.checkDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {activeTab === 'notified' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleUpdateClick(update)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Update
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => ignoreUpdateMutation.mutate(update.id)}
                                disabled={ignoreUpdateMutation.isPending}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Ignore
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-primary border-primary/20 hover:bg-primary/10"
                            onClick={() => handleViewDetails(update)}
                          >
                            <BrainCircuit className="h-4 w-4 mr-1" />
                            Details
                          </Button>

                          {update.updateUrl && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={update.updateUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Tabs>

      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Award</DialogTitle>
            <DialogDescription>
              Apply the new award version and update your system records.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="awardCode">Award Code</Label>
                <Input id="awardCode" value={selectedUpdate?.awardCode || ''} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Award Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={updateFormData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  name="version"
                  value={updateFormData.version}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Effective Date</Label>
                <Input
                  id="effectiveDate"
                  name="effectiveDate"
                  type="date"
                  value={updateFormData.effectiveDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Award URL</Label>
                <Input
                  id="url"
                  name="url"
                  value={updateFormData.url}
                  onChange={handleInputChange}
                  placeholder="https://www.fwc.gov.au/documents/awards/..."
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateAwardMutation.isPending}>
                {updateAwardMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Apply Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Award Details Dialog with AI Analysis */}
      <Dialog open={!!viewingUpdate} onOpenChange={open => !open && handleCloseDetails()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Award Update Details</DialogTitle>
            <DialogDescription>
              View detailed information about this award update and AI analysis
            </DialogDescription>
          </DialogHeader>

          {viewingUpdate && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Award Code</Label>
                  <p className="font-medium">{viewingUpdate.awardCode}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Award Name</Label>
                  <p className="font-medium">{viewingUpdate.awardName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Current Version</Label>
                  <p className="font-medium">{viewingUpdate.currentVersion}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">New Version</Label>
                  <p className="font-medium">{viewingUpdate.latestVersion || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date Detected</Label>
                  <p className="font-medium">
                    {new Date(viewingUpdate.checkDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <p className="font-medium capitalize">{viewingUpdate.status}</p>
                </div>
              </div>

              {/* AI Analysis Panel */}
              <AwardAnalysisPanel
                awardUpdate={viewingUpdate}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button type="button" onClick={handleCloseDetails}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
