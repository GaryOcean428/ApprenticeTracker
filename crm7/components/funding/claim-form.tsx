'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/ui/file-uploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { FundingService } from '@/lib/services/funding';
import { createClient } from '@/lib/supabase/client';

interface ClaimFormProps {
  programs: Array<{ id: string; name: string }>;
  employees: Array<{ id: string; firstName: string; lastName: string }>;
  hostEmployers: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
  user: { org_id: string };
}

export function ClaimForm({ programs, employees, hostEmployers, onSuccess, user }: ClaimFormProps): React.ReactElement {
  const [programId, setProgramId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [hostEmployerId, setHostEmployerId] = useState('');
  const [amountClaimed, setAmountClaimed] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient() as any; // casting to bypass the type conflict for now
  const fundingService = new FundingService(supabase);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!programId || !employeeId || !amountClaimed) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      // Create the funding claim
      const claim = await fundingService.createClaim({
        org_id: user.org_id,
        claim_number: referenceNumber,
        amount: parseFloat(amountClaimed),
        metadata: {
          program_id: programId,
          employee_id: employeeId,
          host_employer_id: hostEmployerId || undefined,
          notes,
        },
      });

      // Upload documents if any
      if (files.length > 0) {
        await Promise.all(
          files.map((file: File) =>
            fundingService.uploadDocument({
              fundingClaimId: claim.id,
              documentType: 'supporting_document',
              file,
            })
          )
        );
      }

      toast({
        title: 'Success',
        description: 'Funding claim created successfully',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error creating funding claim:', error);
      toast({
        title: 'Error',
        description: 'Failed to create funding claim',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label>Funding Program</Label>
          <Select value={programId} onValueChange={setProgramId}>
            <SelectTrigger>
              <SelectValue placeholder='Select a program' />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Employee</Label>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder='Select an employee' />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label>Host Employer</Label>
          <Select value={hostEmployerId} onValueChange={setHostEmployerId}>
            <SelectTrigger>
              <SelectValue placeholder='Select a host employer' />
            </SelectTrigger>
            <SelectContent>
              {hostEmployers.map((employer) => (
                <SelectItem key={employer.id} value={employer.id}>
                  {employer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Amount Claimed</Label>
          <Input
            type='number'
            value={amountClaimed}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setAmountClaimed(e.target.value)}
            placeholder='Enter amount'
            min='0'
            step='0.01'
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label>Reference Number</Label>
        <Input
          value={referenceNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setReferenceNumber(e.target.value)}
          placeholder='Optional reference number'
        />
      </div>

      <div className='space-y-2'>
        <Label>Notes</Label>
        <Textarea
          value={notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => setNotes(e.target.value)}
          placeholder='Additional notes or comments'
        />
      </div>

      <div className='space-y-2'>
        <Label>Supporting Documents</Label>
        <FileUploader
          onFileSelect={(files: File[]): void => setFiles(files)}
          accept={{
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
          }}
          multiple={true}
        />
      </div>

      <Button type='submit' disabled={isLoading}>
        Submit Claim
      </Button>
    </form>
  );
}
