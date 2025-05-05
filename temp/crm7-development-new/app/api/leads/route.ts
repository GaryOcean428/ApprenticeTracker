import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { hasRole } from '@/lib/auth/rbac';
import type { Database } from '@/lib/database.types';

type Lead = Database['Tables']['app_leads']['Insert'];

export async function GET(request: Request) {
  const supabase = await createClient(request);
  
  // Always validate authentication with getUser()
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Query includes organizationId for proper RLS filtering
  // No need for explicit filtering since RLS handles this
  const { data, error } = await supabase
    .from('app_leads')
    .select('*');
  
  if (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient(request);
  
  // Always validate authentication with getUser()
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Additional role check for creating leads
  const canCreateLeads = await hasRole('manager', request);
  if (!canCreateLeads) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  try {
    const body = await request.json() as Lead;
    
    // Insert data - RLS will ensure user can only insert into their organizations
    const { data, error } = await supabase
      .from('app_leads')
      .insert([body])
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
