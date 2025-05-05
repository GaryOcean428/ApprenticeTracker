import { supabase } from './supabaseClient';
import { ApprenticeYear } from '../types';

export interface CustomPayRate {
  id?: string;
  name: string;
  year1_rate: number;
  year2_rate: number;
  year3_rate: number;
  year4_rate: number;
  industry?: string;
  user_id?: string;
  is_public?: boolean;
  calendar_year?: number; // Calendar year the rates apply to
  created_at?: string;
  updated_at?: string;
}

// Local storage key
const LOCAL_PRESETS_KEY = 'r8calculator_pay_rate_presets';

// Default fallback data
const DEFAULT_PAY_RATE_PRESETS: CustomPayRate[] = [
  {
    id: 'preset-1',
    name: 'Construction Industry Standard',
    year1_rate: 21.50,
    year2_rate: 25.75,
    year3_rate: 29.90,
    year4_rate: 34.25,
    industry: 'Construction',
    is_public: true,
    calendar_year: new Date().getFullYear() // Current year
  },
  {
    id: 'preset-2',
    name: 'Electrical Apprentice Rates',
    year1_rate: 22.25,
    year2_rate: 26.50, 
    year3_rate: 31.75,
    year4_rate: 36.00,
    industry: 'Trades',
    is_public: true,
    calendar_year: new Date().getFullYear() // Current year
  }
];

/**
 * Fetch all custom pay rate presets
 * First tries from Supabase, falls back to local storage if needed
 */
export async function fetchCustomPayRates(): Promise<{ presets: CustomPayRate[], isLocal: boolean }> {
  try {
    // Check if user is authenticated
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    if (isAuthenticated) {
      try {
        // First try to get from Supabase
        const { data, error } = await supabase
          .from('custom_pay_rates')
          .select('*')
          .order('name');
        
        if (error) {
          // Handle permission denied specifically
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for custom_pay_rates table, using local storage');
            return { presets: await loadFromLocalStorage(), isLocal: true };
          }
          throw error;
        }
        
        if (data && data.length > 0) {
          // Also update local storage with the latest data
          saveToLocalStorage(data);
          return { presets: data, isLocal: false };
        } else {
          // If no data but authenticated, create default presets in db
          await createDefaultPresetsInDb(session.session.user.id);
          const { data: freshData } = await supabase
            .from('custom_pay_rates')
            .select('*')
            .order('name');
          
          if (freshData && freshData.length > 0) {
            return { presets: freshData, isLocal: false };
          }
        }
      } catch (error) {
        console.warn('Error fetching from Supabase:', error);
        // Fall back to local storage
        return { presets: await loadFromLocalStorage(), isLocal: true };
      }
    }
    
    // Not authenticated or no data from DB
    return { presets: await loadFromLocalStorage(), isLocal: true };
  } catch (error) {
    console.error('Error in fetchCustomPayRates:', error);
    // Last resort - return defaults
    return { presets: DEFAULT_PAY_RATE_PRESETS, isLocal: true };
  }
}

/**
 * Create default presets in the database for a new user
 */
async function createDefaultPresetsInDb(userId: string): Promise<void> {
  try {
    const presetsToCreate = DEFAULT_PAY_RATE_PRESETS.map(preset => ({
      ...preset,
      user_id: userId,
      is_public: false
    }));
    
    const { error } = await supabase
      .from('custom_pay_rates')
      .insert(presetsToCreate);
    
    if (error) {
      console.error('Error creating default presets in db:', error);
    }
  } catch (error) {
    console.error('Error creating default presets in db:', error);
  }
}

/**
 * Load pay rate presets from local storage
 */
async function loadFromLocalStorage(): Promise<CustomPayRate[]> {
  try {
    const storedPresets = localStorage.getItem(LOCAL_PRESETS_KEY);
    if (storedPresets) {
      return JSON.parse(storedPresets);
    }
  } catch (error) {
    console.error('Error loading presets from local storage:', error);
  }
  
  // If nothing in storage or error, use defaults and save them
  saveToLocalStorage(DEFAULT_PAY_RATE_PRESETS);
  return DEFAULT_PAY_RATE_PRESETS;
}

/**
 * Save pay rate presets to local storage
 */
export function saveToLocalStorage(presets: CustomPayRate[]): void {
  try {
    localStorage.setItem(LOCAL_PRESETS_KEY, JSON.stringify(presets));
  } catch (error) {
    console.error('Error saving presets to local storage:', error);
  }
}

/**
 * Fetch a custom pay rate by ID
 * Tries Supabase first, falls back to local storage
 */
export async function fetchCustomPayRateById(id: string): Promise<CustomPayRate | null> {
  try {
    // Check if user is authenticated
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    // If using a local ID format, get from local storage
    if (id.startsWith('preset-') || id.startsWith('local-')) {
      const { presets } = await fetchCustomPayRates();
      return presets.find(p => p.id === id) || null;
    }
    
    if (isAuthenticated) {
      try {
        const { data, error } = await supabase
          .from('custom_pay_rates')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for custom_pay_rates table, using local storage');
            const { presets } = await fetchCustomPayRates();
            return presets.find(p => p.id === id) || null;
          }
          throw error;
        }
        
        return data;
      } catch (error) {
        console.warn('Error fetching from Supabase:', error);
        // Fall back to local storage
        const { presets } = await fetchCustomPayRates();
        return presets.find(p => p.id === id) || null;
      }
    }
    
    // Not authenticated, use local storage
    const { presets } = await fetchCustomPayRates();
    return presets.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error in fetchCustomPayRateById:', error);
    return null;
  }
}

/**
 * Create a new custom pay rate preset
 * Tries to save to Supabase if authenticated, falls back to local storage
 */
export async function createCustomPayRate(
  payRate: Omit<CustomPayRate, 'id' | 'created_at' | 'updated_at'>
): Promise<{ preset: CustomPayRate | null, isLocal: boolean, error: any }> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    // Ensure calendar_year is set
    if (!payRate.calendar_year) {
      payRate.calendar_year = new Date().getFullYear();
    }
    
    if (isAuthenticated) {
      try {
        const { data, error } = await supabase
          .from('custom_pay_rates')
          .insert({
            ...payRate,
            user_id: session.session.user.id
          })
          .select()
          .single();
        
        if (error) {
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for custom_pay_rates table, using local storage');
            return await createInLocalStorage(payRate);
          }
          return { preset: null, isLocal: false, error };
        }
        
        // Also update local storage
        const { presets } = await fetchCustomPayRates();
        saveToLocalStorage([...presets, data]);
        
        return { preset: data, isLocal: false, error: null };
      } catch (error) {
        console.warn('Error creating in Supabase:', error);
        return await createInLocalStorage(payRate);
      }
    } else {
      return await createInLocalStorage(payRate);
    }
  } catch (error) {
    console.error('Error in createCustomPayRate:', error);
    return { preset: null, isLocal: true, error };
  }
}

/**
 * Create a custom pay rate in local storage
 */
async function createInLocalStorage(
  payRate: Omit<CustomPayRate, 'id' | 'created_at' | 'updated_at'>
): Promise<{ preset: CustomPayRate | null, isLocal: boolean, error: any }> {
  try {
    const { presets } = await fetchCustomPayRates();
    
    const newPreset: CustomPayRate = {
      ...payRate,
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const updatedPresets = [...presets, newPreset];
    saveToLocalStorage(updatedPresets);
    
    return { preset: newPreset, isLocal: true, error: null };
  } catch (error) {
    console.error('Error creating in local storage:', error);
    
    // Last resort - create without saving
    return { 
      preset: { 
        ...payRate, 
        id: `local-${Date.now()}` 
      }, 
      isLocal: true,
      error
    };
  }
}

/**
 * Update an existing custom pay rate preset
 * Tries Supabase first, falls back to local storage
 */
export async function updateCustomPayRate(
  id: string, 
  updates: Partial<CustomPayRate>
): Promise<{ preset: CustomPayRate | null, isLocal: boolean, error: any }> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    // If using a local ID format, update in local storage
    if (id.startsWith('preset-') || id.startsWith('local-')) {
      return await updateInLocalStorage(id, updates);
    }
    
    if (isAuthenticated) {
      try {
        // Don't send the id in the updates
        const { id: _, ...updateData } = updates;
        
        const { data, error } = await supabase
          .from('custom_pay_rates')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for custom_pay_rates table, using local storage');
            return await updateInLocalStorage(id, updates);
          }
          return { preset: null, isLocal: false, error };
        }
        
        // Also update local storage
        const { presets } = await fetchCustomPayRates();
        const updatedPresets = presets.map(p => p.id === id ? data : p);
        saveToLocalStorage(updatedPresets);
        
        return { preset: data, isLocal: false, error: null };
      } catch (error) {
        console.warn('Error updating in Supabase:', error);
        return await updateInLocalStorage(id, updates);
      }
    } else {
      return await updateInLocalStorage(id, updates);
    }
  } catch (error) {
    console.error('Error in updateCustomPayRate:', error);
    return { preset: null, isLocal: true, error };
  }
}

/**
 * Update a custom pay rate in local storage
 */
async function updateInLocalStorage(
  id: string, 
  updates: Partial<CustomPayRate>
): Promise<{ preset: CustomPayRate | null, isLocal: boolean, error: any }> {
  try {
    const { presets } = await fetchCustomPayRates();
    
    const index = presets.findIndex(p => p.id === id);
    if (index === -1) {
      return { preset: null, isLocal: true, error: 'Pay rate preset not found' };
    }
    
    const updatedPreset = {
      ...presets[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const updatedPresets = [
      ...presets.slice(0, index),
      updatedPreset,
      ...presets.slice(index + 1)
    ];
    
    saveToLocalStorage(updatedPresets);
    
    return { preset: updatedPreset, isLocal: true, error: null };
  } catch (error) {
    console.error('Error updating in local storage:', error);
    return { preset: null, isLocal: true, error };
  }
}

/**
 * Delete a custom pay rate preset
 * Tries Supabase first, falls back to local storage
 */
export async function deleteCustomPayRate(
  id: string
): Promise<{ success: boolean, isLocal: boolean, error: any }> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    // If using a local ID format, delete from local storage
    if (id.startsWith('preset-') || id.startsWith('local-')) {
      return await deleteFromLocalStorage(id);
    }
    
    if (isAuthenticated) {
      try {
        const { error } = await supabase
          .from('custom_pay_rates')
          .delete()
          .eq('id', id);
        
        if (error) {
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for custom_pay_rates table, using local storage');
            return await deleteFromLocalStorage(id);
          }
          return { success: false, isLocal: false, error };
        }
        
        // Also update local storage
        const { presets } = await fetchCustomPayRates();
        const updatedPresets = presets.filter(p => p.id !== id);
        saveToLocalStorage(updatedPresets);
        
        return { success: true, isLocal: false, error: null };
      } catch (error) {
        console.warn('Error deleting from Supabase:', error);
        return await deleteFromLocalStorage(id);
      }
    } else {
      return await deleteFromLocalStorage(id);
    }
  } catch (error) {
    console.error('Error in deleteCustomPayRate:', error);
    return { success: false, isLocal: true, error };
  }
}

/**
 * Delete a custom pay rate from local storage
 */
async function deleteFromLocalStorage(
  id: string
): Promise<{ success: boolean, isLocal: boolean, error: any }> {
  try {
    const { presets } = await fetchCustomPayRates();
    
    const updatedPresets = presets.filter(p => p.id !== id);
    if (updatedPresets.length === presets.length) {
      return { success: false, isLocal: true, error: 'Pay rate preset not found' }; // Nothing was deleted
    }
    
    saveToLocalStorage(updatedPresets);
    
    return { success: true, isLocal: true, error: null };
  } catch (error) {
    console.error('Error deleting from local storage:', error);
    return { success: false, isLocal: true, error };
  }
}

/**
 * Get the pay rate for a specific year from a custom pay rate preset
 */
export function getPayRateForYear(preset: CustomPayRate, year: ApprenticeYear): number {
  switch (year) {
    case 1:
      return preset.year1_rate;
    case 2:
      return preset.year2_rate;
    case 3:
      return preset.year3_rate;
    case 4:
      return preset.year4_rate;
    default:
      return 0;
  }
}

/**
 * Fetch custom pay rates for a specific calendar year
 */
export async function fetchCustomPayRatesByYear(year: number): Promise<CustomPayRate[]> {
  try {
    const { presets } = await fetchCustomPayRates();
    
    // Filter presets by calendar year
    return presets.filter(preset => 
      preset.calendar_year === year || !preset.calendar_year // Include presets without calendar_year
    );
  } catch (error) {
    console.error('Error fetching custom pay rates by year:', error);
    return DEFAULT_PAY_RATE_PRESETS.filter(preset => preset.calendar_year === year || !preset.calendar_year);
  }
}

export default {
  fetchCustomPayRates,
  fetchCustomPayRateById,
  createCustomPayRate,
  updateCustomPayRate,
  deleteCustomPayRate,
  getPayRateForYear,
  fetchCustomPayRatesByYear
};