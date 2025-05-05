import { supabase } from './supabaseClient';

export interface UserSettings {
  fullName?: string;
  email?: string;
  settings?: {
    darkMode?: boolean;
    notifications?: {
      email?: boolean;
      updates?: boolean;
      calculations?: boolean;
    };
  };
}

/**
 * Fetch the user's settings from Supabase
 */
export async function fetchUserSettings(): Promise<UserSettings | null> {
  try {
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser.user) {
      throw new Error('User is not authenticated');
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('full_name, email, settings')
      .eq('id', authUser.user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is the "no rows returned" error code, which we'll handle by returning null
      throw error;
    }
    
    if (!data) {
      // No profile exists yet, return basic info from auth
      return {
        fullName: '',
        email: authUser.user.email,
        settings: {
          darkMode: false,
          notifications: {
            email: true,
            updates: true,
            calculations: true
          }
        }
      };
    }
    
    return {
      fullName: data.full_name,
      email: data.email || authUser.user.email,
      settings: data.settings || {
        darkMode: false,
        notifications: {
          email: true,
          updates: true,
          calculations: true
        }
      }
    };
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
}

/**
 * Update the user's settings in Supabase
 */
export async function updateUserSettings(settings: UserSettings): Promise<boolean> {
  try {
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser.user) {
      throw new Error('User is not authenticated');
    }
    
    // Check if the user has a profile already
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', authUser.user.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: settings.fullName,
          settings: settings.settings
        })
        .eq('id', authUser.user.id);
      
      if (error) throw error;
    } else {
      // Create new profile
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: authUser.user.id,
          full_name: settings.fullName,
          email: settings.email || authUser.user.email,
          settings: settings.settings
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return false;
  }
}

/**
 * Toggle dark mode for the user
 */
export async function toggleDarkMode(): Promise<boolean> {
  try {
    const userSettings = await fetchUserSettings();
    
    if (!userSettings) {
      throw new Error('Could not fetch user settings');
    }
    
    const currentDarkMode = userSettings.settings?.darkMode || false;
    
    return await updateUserSettings({
      ...userSettings,
      settings: {
        ...userSettings.settings,
        darkMode: !currentDarkMode
      }
    });
  } catch (error) {
    console.error('Error toggling dark mode:', error);
    return false;
  }
}

export default {
  fetchUserSettings,
  updateUserSettings,
  toggleDarkMode
};