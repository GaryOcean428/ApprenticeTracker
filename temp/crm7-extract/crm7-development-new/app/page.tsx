import { redirect } from 'next/navigation';
import React from 'react';
import { createClient } from '@/utils/supabase/client';

export default async function Home(): Promise<React.ReactElement> {
  const supabase = createClient();
  
  // Check if the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (user) {
    return redirect('/dashboard');
  }
  
  return redirect('/auth/login');
}
