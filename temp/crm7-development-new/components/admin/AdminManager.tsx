import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

type Admin = {
  email: string;
  role: 'super_admin' | 'editor';
  created_at: string;
  added_by: string;
};

export function AdminManager() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const { user } = useAuth();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { toast } = useToast();

  const loadAdmins = useCallback(async () => {
    const { data: admins } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });
    setAdmins(admins || []);
  }, [supabase]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const addAdmin = async () => {
    if (!newAdminEmail) return;

    const { error } = await supabase.from('admins').insert({
      email: newAdminEmail,
      role: 'editor',
      added_by: user?.email,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add admin',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Admin added successfully',
    });
    setNewAdminEmail('');
    loadAdmins();
  };

  const removeAdmin = async (email: string) => {
    if (email === 'braden.lang77@gmail.com') {
      toast({
        title: 'Error',
        description: 'Cannot remove super admin',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('admins').delete().eq('email', email);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove admin',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Admin removed successfully',
    });
    loadAdmins();
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Manage Admins</h2>
        <div className="flex gap-4 items-end mb-6">
          <div className="flex-1">
            <Label htmlFor="newAdminEmail">Add New Admin</Label>
            <Input
              id="newAdminEmail"
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <Button onClick={addAdmin}>Add Admin</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Added By</TableHead>
            <TableHead>Added On</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.email}>
              <TableCell>{admin.email}</TableCell>
              <TableCell>{admin.role}</TableCell>
              <TableCell>{admin.added_by}</TableCell>
              <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                {admin.email !== 'braden.lang77@gmail.com' && (
                  <Button variant="destructive" size="sm" onClick={() => removeAdmin(admin.email)}>
                    Remove
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
