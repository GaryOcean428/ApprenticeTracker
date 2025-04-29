'use client';

import { Edit2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAdminAccess } from '@/lib/hooks/useAdminAccess';
import { createClient } from '@/lib/supabase/client';
import * as React from 'react';
import { type Database } from '@/lib/types/database';

interface FieldEditorProps {
  table: keyof Database['public']['Tables'];
  column: string;
  recordId: string;
  value: unknown;
  onUpdate: (newValue: unknown) => void;
}

export function FieldEditor({ table, column, recordId, value, onUpdate }: FieldEditorProps): React.ReactElement | null {
  const { isAdmin } = useAdminAccess();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<unknown>(value);
  const { toast } = useToast();
  const supabase = createClient();

  if (!isAdmin) return null;

  const handleSave = async (): Promise<void> => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ [column]: editValue })
        .eq('id', recordId);

      if (error) throw error;

      onUpdate(editValue);
      setIsOpen(false);
      toast({
        title: 'Field updated',
        description: 'The changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update field. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2 h-4 w-4">
          <Edit2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Field</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Value</Label>
            <Input 
              value={editValue as string} 
              onChange={(e) => setEditValue(e.target.value)} 
            />
          </div>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
