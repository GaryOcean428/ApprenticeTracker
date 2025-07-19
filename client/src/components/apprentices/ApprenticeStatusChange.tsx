import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ApprenticeStatusChangeProps {
  apprenticeId: number;
  currentStatus: string;
  apprenticeName: string;
  onStatusChanged?: () => void;
}

export function ApprenticeStatusChange({
  apprenticeId,
  currentStatus,
  apprenticeName,
  onStatusChanged,
}: ApprenticeStatusChangeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const statusOptions = [
    { value: 'applicant', label: 'Applicant' },
    { value: 'recruitment', label: 'Recruitment' },
    { value: 'pre-commencement', label: 'Pre-Commencement' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'withdrawn', label: 'Withdrawn' },
    { value: 'completed', label: 'Completed' },
  ];

  const statusChangeDescription = {
    applicant: 'Initial application received',
    recruitment: 'In the recruitment/selection process',
    'pre-commencement': 'Selected but not yet started',
    active: 'Currently active in the program',
    suspended: 'Temporarily suspended',
    withdrawn: 'Withdrawn from program',
    completed: 'Successfully completed the program',
  };

  // Remove current status from options
  const filteredOptions = statusOptions.filter(option => option.value !== currentStatus);

  const statusChangeMutation = useMutation({
    mutationFn: async (data: { status: string; notes?: string }) => {
      const res = await apiRequest('PATCH', `/api/apprentices/${apprenticeId}/status`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Status Changed',
        description: `${apprenticeName}'s status changed successfully to ${status}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/apprentices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/apprentices', apprenticeId] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      setIsOpen(false);
      if (onStatusChanged) {
        onStatusChanged();
      }
    },
    onError: error => {
      toast({
        title: 'Error',
        description: `Failed to change status: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) {
      toast({
        title: 'Missing Information',
        description: 'Please select a status',
        variant: 'destructive',
      });
      return;
    }

    statusChangeMutation.mutate({ status, notes });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Change Status</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Apprentice Status</DialogTitle>
          <DialogDescription>
            Update the status of {apprenticeName} from{' '}
            <span className="font-medium">{currentStatus}</span> to a new stage.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">New Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {filteredOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {status && (
                <p className="text-sm text-muted-foreground mt-1">
                  {statusChangeDescription[status as keyof typeof statusChangeDescription]}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Enter any notes about this status change"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={statusChangeMutation.isPending || !status}>
              {statusChangeMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
