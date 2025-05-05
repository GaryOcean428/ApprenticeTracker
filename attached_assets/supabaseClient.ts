import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for Supabase tables
export type ApprenticeProfileRecord = {
  id: string;
  name: string;
  user_id?: string;
  year: number;
  base_pay_rate: number;
  award_id?: string;
  cost_config: any;
  work_config: any;
  billable_options: any;
  custom_settings: boolean;
  created_at: string;
  updated_at: string;
};

export type AwardRecord = {
  id: string;
  code: string;
  name: string;
  rates: {
    year1: number;
    year2: number;
    year3: number;
    year4: number;
    qualified: number;
  };
  industry: string;
  updated_at: string;
};

export type CalculationTemplateRecord = {
  id: string;
  name: string;
  description: string;
  apprentice_profiles: any[];
  user_id?: string;
  is_public: boolean;
  industry?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
};

// Supabase API functions

// Apprentice Profiles
export async function fetchApprenticeProfiles(userId?: string) {
  let query = supabase
    .from('apprentice_profiles')
    .select('*')
    .order('updated_at', { ascending: false });
    
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching apprentice profiles:', error);
    return [];
  }
  
  return data;
}

export async function saveApprenticeProfile(profile: Omit<ApprenticeProfileRecord, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('apprentice_profiles')
    .insert(profile)
    .select()
    .single();
    
  if (error) {
    console.error('Error saving apprentice profile:', error);
    return null;
  }
  
  return data;
}

export async function updateApprenticeProfile(id: string, updates: Partial<ApprenticeProfileRecord>) {
  const { data, error } = await supabase
    .from('apprentice_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating apprentice profile:', error);
    return null;
  }
  
  return data;
}

// Awards
export async function fetchAwards() {
  const { data, error } = await supabase
    .from('awards')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching awards:', error);
    return [];
  }
  
  return data;
}

// Templates
export async function fetchTemplates(isPublic: boolean = true) {
  let query = supabase
    .from('calculation_templates')
    .select('*')
    .order('name');
    
  if (isPublic) {
    query = query.eq('is_public', true);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
  
  return data;
}

export async function saveTemplate(template: Omit<CalculationTemplateRecord, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('calculation_templates')
    .insert(template)
    .select()
    .single();
    
  if (error) {
    console.error('Error saving template:', error);
    return null;
  }
  
  return data;
}

// Authentication
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Error signing in:', error);
    return null;
  }
  
  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error('Error signing up:', error);
    return null;
  }
  
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    return false;
  }
  
  return true;
}