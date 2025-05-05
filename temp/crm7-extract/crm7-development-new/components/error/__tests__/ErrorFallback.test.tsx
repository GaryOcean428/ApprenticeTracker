import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorFallback } from '../ErrorFallback';

describe('ErrorFallback', () => {
  const mockResetErrorBoundary = vi.fn();

  beforeEach(() => {
    mockResetErrorBoundary.mockClear();
  });

  it('renders error message and try again button', () => {
    const error = new Error('Test error');

    render(
      <ErrorFallback
        error={error}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows generic error message for unexpected errors', () => {
    render(
      <ErrorFallback
        error={new Error('Test error')}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls resetErrorBoundary when try again button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ErrorFallback
        error={new Error('Test error')}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockResetErrorBoundary).toHaveBeenCalled();
  });
});
