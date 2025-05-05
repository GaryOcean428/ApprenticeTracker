import { AuthForm } from '@/components/auth/auth-form';
import { createClient } from '@supabase/supabase-js';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
  })),
}));

describe('AuthForm', () => {
  const mockSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sign in form when mode is signin', () => {
    render(<AuthForm mode="signin" />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<AuthForm mode="signin" />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('validates password requirements', async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'weak');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('handles successful sign in', async () => {
    const user = userEvent.setup();
    const mockSignIn = jest.fn().mockResolvedValue({ error: null });
    mockSupabase.auth.signInWithPassword = mockSignIn;

    render(<AuthForm mode="signin" />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'StrongP@ss1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'StrongP@ss1',
      });
    });
  });

  it('handles sign in errors', async () => {
    const user = userEvent.setup();
    const mockError = { message: 'Invalid credentials' };
    mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue({ error: mockError });

    render(<AuthForm mode="signin" />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'StrongP@ss1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(mockError.message)).toBeInTheDocument();
    });
  });

  it('renders signup form when mode is signup', () => {
    render(<AuthForm mode="signup" />);
    expect(screen.getByText('Create an Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
