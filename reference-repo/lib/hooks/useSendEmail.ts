import { useState } from 'react';

interface UseSendEmailReturn {
  sendEmail: (params: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useSendEmail(): UseSendEmailReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendEmail = async (params: Record<string, unknown>): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send email');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendEmail,
    isLoading,
    error,
  };
}
