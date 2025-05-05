import { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface AuthContextType {
  user: any;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { error, user } = await supabase.auth.signIn({ email, password });
      if (error) throw error;
      setUser(user);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const refreshToken = async () => {
    try {
      const { error, user } = await supabase.auth.refreshSession();
      if (error) throw error;
      setUser(user);
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signOut, login, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};
