import { type ReactNode, createContext, useContext, useState } from 'react';
import { createClient } from './config';

interface MFAContextType {
  isEnabled: boolean;
  isVerified: boolean;
  secret: string | null;
  qrCode: string | null;
  verify: (token: string) => Promise<boolean>;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
}

interface MFAProviderProps {
  children: React.ReactNode;
}

const MFAContext = createContext<MFAContextType | null>(null);

export function MFAProvider({ children }: MFAProviderProps): React.ReactElement {
  const supabase = createClient();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const checkMFAStatus = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) throw error;
      setIsEnabled(data.currentLevel === 'aal2');
    } catch (error) {
      console.error('Error checking MFA status:', error);
    }
  };

  const startMFAEnrollment = async (): Promise<any> => {
    try {
      setIsEnrolling(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting MFA enrollment:', error);
      throw error;
    }
  };

  const completeMFAEnrollment = async (code: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.mfa.challenge({ factorId: code });
      if (error) throw error;
      setIsEnabled(true);
      setIsEnrolling(false);
    } catch (error) {
      console.error('Error completing MFA enrollment:', error);
      throw error;
    }
  };

  const disableMFA = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: 'totp' });
      if (error) throw error;
      setIsEnabled(false);
    } catch (error) {
      console.error('Error disabling MFA:', error);
      throw error;
    }
  };

  return (
    <MFAContext.Provider
      value={{
        isEnabled,
        isVerified: false,
        secret: null,
        qrCode: null,
        verify: async (token: string) => {
          try {
            const { error } = await supabase.auth.mfa.challenge({ factorId: token });
            if (error) throw error;
            return true;
          } catch (error) {
            console.error('Error verifying MFA:', error);
            return false;
          }
        },
        enable: async () => {
          try {
            await startMFAEnrollment();
          } catch (error) {
            console.error('Error enabling MFA:', error);
            throw error;
          }
        },
        disable: disableMFA,
      }}
    >
      {children}
    </MFAContext.Provider>
  );
}

export function useMFA(): MFAContextType {
  const context = useContext(MFAContext);
  if (!context) {
    throw new Error('useMFA must be used within an MFAProvider');
  }
  return context;
}
