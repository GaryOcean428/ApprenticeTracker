import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useQuery, useMutation, QueryKey } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleId?: number;
  organizationId?: number;
  profileImage?: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  roleId?: number;
  organizationId?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const userQueryKey: QueryKey = ['/api/auth/user'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Check for saved token and set headers on first load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Trigger a refetch instead of setting undefined
      queryClient.invalidateQueries({ queryKey: userQueryKey });
    }
  }, []);

  // Query to fetch current user
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: userQueryKey,
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      try {
        const response = await apiRequest('GET', '/api/auth/verify');
        if (!response.ok) {
          if (response.status === 401) {
            // Clear invalid token
            localStorage.removeItem('authToken');
            return null;
          }
          throw new Error('Failed to verify authentication');
        }

        const data = await response.json();
        return data.user;
      } catch (err) {
        localStorage.removeItem('authToken');
        throw err;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: null
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      console.log('Attempting login with endpoint: /api/auth/login');
      
      try {
        const response = await apiRequest('POST', '/api/auth/login', credentials);
        
        console.log('Login response status:', response.status);
        
        if (!response.ok) {
          let errorMessage = 'Login failed';
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            // If JSON parsing fails, it's likely an HTML error page
            const text = await response.text();
            console.error('Failed to parse JSON error response:', text);
            errorMessage = `Login failed (${response.status}): Server error`;
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Login successful, storing token');
        
        // Store the token in localStorage
        localStorage.setItem('authToken', data.token);
      return data.user;
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await apiRequest('POST', '/api/auth/register', userData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem('authToken');
      queryClient.setQueryData(userQueryKey, null);
    },
  });

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      const user = await loginMutation.mutateAsync(credentials);
      queryClient.setQueryData(userQueryKey, user);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.firstName}!`,
      });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      await registerMutation.mutateAsync(userData);
      toast({
        title: 'Registration successful',
        description: 'Your account has been created. You can now log in.',
      });
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}