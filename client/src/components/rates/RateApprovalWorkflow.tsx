import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, X, AlertTriangle, Clock, ArrowRight, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface RateApprovalStep {
  id: string;
  name: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'not_started';
  completedBy?: string;
  completedAt?: string;
  comments?: string;
}

interface RateCalculation {
  id: number;
  apprenticeId: number;
  hostEmployerId: number;
  payRate: string;
  chargeRate: string;
  calculationDate: string;
  approved: boolean;
  approvalWorkflow?: RateApprovalStep[];
  rejectionReason?: string;
}

// Interface for the component props
interface RateApprovalWorkflowProps {
  calculation: RateCalculation;
  onApprovalComplete?: () => void;
  className?: string;
}

// Schema for approval form validation
const approveFormSchema = z.object({
  comments: z.string().optional(),
});

// Schema for rejection form validation
const rejectFormSchema = z.object({
  rejectionReason: z.string().min(10, {
    message: 'Rejection reason must be at least 10 characters',
  }),
});

export function RateApprovalWorkflow({
  calculation,
  onApprovalComplete,
  className,
}: RateApprovalWorkflowProps) {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Setup forms for approval and rejection
  const approveForm = useForm<z.infer<typeof approveFormSchema>>({
    resolver: zodResolver(approveFormSchema),
    defaultValues: {
      comments: '',
    },
  });

  const rejectForm = useForm<z.infer<typeof rejectFormSchema>>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: {
      rejectionReason: '',
    },
  });

  // Mutations for API interactions
  const approveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof approveFormSchema>) => {
      const response = await apiRequest(
        'POST',
        `/api/payroll/charge-rates/${calculation.id}/approve`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/charge-rates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/charge-rates', calculation.id] });
      toast({
        title: 'Calculation Approved',
        description: 'The charge rate calculation has been approved successfully',
      });
      setIsApproveDialogOpen(false);
      if (onApprovalComplete) onApprovalComplete();
    },
    onError: error => {
      toast({
        title: 'Approval Failed',
        description: error.message || 'Failed to approve the calculation',
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof rejectFormSchema>) => {
      const response = await apiRequest(
        'POST',
        `/api/payroll/charge-rates/${calculation.id}/reject`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/charge-rates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/charge-rates', calculation.id] });
      toast({
        title: 'Calculation Rejected',
        description: 'The charge rate calculation has been rejected',
      });
      setIsRejectDialogOpen(false);
      if (onApprovalComplete) onApprovalComplete();
    },
    onError: error => {
      toast({
        title: 'Rejection Failed',
        description: error.message || 'Failed to reject the calculation',
        variant: 'destructive',
      });
    },
  });

  // Handle form submissions
  const onApproveSubmit = (data: z.infer<typeof approveFormSchema>) => {
    approveMutation.mutate(data);
  };

  const onRejectSubmit = (data: z.infer<typeof rejectFormSchema>) => {
    rejectMutation.mutate(data);
  };

  // Determine if workflow is in the system
  const hasWorkflow = calculation.approvalWorkflow && calculation.approvalWorkflow.length > 0;

  // Get current step if workflow exists
  const getCurrentStep = () => {
    if (!hasWorkflow) return null;

    const pendingSteps = calculation.approvalWorkflow!.filter(step => step.status === 'pending');
    return pendingSteps.length > 0 ? pendingSteps[0] : null;
  };

  const currentStep = getCurrentStep();

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500">
            <Check className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Approval Status</CardTitle>
          {calculation.approved ? (
            <Badge className="bg-green-500">
              <Check className="h-3 w-3 mr-1" /> Approved
            </Badge>
          ) : calculation.rejectionReason ? (
            <Badge variant="destructive">
              <X className="h-3 w-3 mr-1" /> Rejected
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500 text-amber-500">
              <Clock className="h-3 w-3 mr-1" /> Pending Approval
            </Badge>
          )}
        </div>
        <CardDescription>
          {calculation.approved
            ? 'This charge rate has been approved and is ready for use.'
            : calculation.rejectionReason
              ? 'This charge rate has been rejected.'
              : 'This charge rate is pending approval.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Show workflow status if available */}
        {hasWorkflow && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Approval Workflow</h4>
            <div className="space-y-3">
              {calculation.approvalWorkflow!.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  {index > 0 && <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />}
                  <div className="flex-1 flex justify-between items-center bg-muted/30 p-2 rounded-md">
                    <div>
                      <span className="text-sm font-medium">{step.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">({step.role})</span>
                    </div>
                    {getStatusBadge(step.status)}
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setIsHistoryDialogOpen(true)}
            >
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
        )}

        {/* Show rejection reason if rejected */}
        {calculation.rejectionReason && (
          <div className="bg-destructive/10 p-3 rounded-md mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-destructive">Rejection Reason</h4>
                <p className="text-sm mt-1">{calculation.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current pending step info */}
        {currentStep && (
          <div className="bg-primary/5 p-3 rounded-md">
            <h4 className="text-sm font-medium">Current Approver</h4>
            <p className="text-sm mt-1">
              {currentStep.name} ({currentStep.role})
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        {!calculation.approved && !calculation.rejectionReason && (
          <>
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <X className="h-4 w-4 mr-2" /> Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Calculation</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting this calculation. This will be visible to
                    all stakeholders.
                  </DialogDescription>
                </DialogHeader>

                <Form {...rejectForm}>
                  <form onSubmit={rejectForm.handleSubmit(onRejectSubmit)} className="space-y-4">
                    <FormField
                      control={rejectForm.control}
                      name="rejectionReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rejection Reason</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please explain why this calculation is being rejected"
                              {...field}
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsRejectDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="destructive"
                        disabled={rejectMutation.isPending}
                      >
                        {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Check className="h-4 w-4 mr-2" /> Approve
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve Calculation</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to approve this charge rate calculation?
                  </DialogDescription>
                </DialogHeader>

                <Form {...approveForm}>
                  <form onSubmit={approveForm.handleSubmit(onApproveSubmit)} className="space-y-4">
                    <FormField
                      control={approveForm.control}
                      name="comments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comments (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add any comments about this approval"
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Any comments will be recorded in the approval history.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsApproveDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={approveMutation.isPending}>
                        {approveMutation.isPending ? 'Approving...' : 'Confirm Approval'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardFooter>

      {/* History dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approval History</DialogTitle>
            <DialogDescription>
              Complete history of the approval workflow for this charge rate calculation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {hasWorkflow &&
              calculation.approvalWorkflow!.map(step => {
                if (step.status === 'not_started') return null;

                return (
                  <div key={step.id} className="border-b pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium">{step.name}</h4>
                        <p className="text-xs text-muted-foreground">{step.role}</p>
                      </div>
                      {getStatusBadge(step.status)}
                    </div>

                    {step.completedBy && step.completedAt && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {step.status === 'approved' ? 'Approved' : 'Rejected'} by {step.completedBy}{' '}
                        on {new Date(step.completedAt).toLocaleString()}
                      </div>
                    )}

                    {step.comments && (
                      <div className="mt-2 bg-muted/30 p-2 rounded text-sm">{step.comments}</div>
                    )}
                  </div>
                );
              })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
