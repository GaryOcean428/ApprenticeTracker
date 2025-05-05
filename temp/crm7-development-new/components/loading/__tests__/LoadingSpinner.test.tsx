import { render, screen } from '@testing-library/react';

import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders correctly', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="test-class" />);
    const spinner = screen.getByRole('status');
    expect(spinner.className).toContain('test-class');
  });

  it('has correct ARIA attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });
});
