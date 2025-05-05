import { render, screen } from '@testing-library/react';
import SkeletonLoader from '../SkeletonLoader';

describe('SkeletonLoader', () => {
  it('renders with default props', () => {
    render(<SkeletonLoader />);
    const skeleton = screen.getByRole('status');
    const lines = skeleton.querySelectorAll('.bg-muted');
    expect(lines).toHaveLength(3);
  });

  it('renders with custom number of lines', () => {
    render(<SkeletonLoader lines={5} />);
    const skeleton = screen.getByRole('status');
    const lines = skeleton.querySelectorAll('.bg-muted');
    expect(lines).toHaveLength(5);
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonLoader className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies custom lineClassName', () => {
    render(<SkeletonLoader lineClassName="custom-line" />);
    const skeleton = screen.getByRole('status');
    const lines = skeleton.querySelectorAll('.bg-muted');
    lines.forEach(line => {
      expect(line.className).toContain('custom-line');
    });
  });

  it('has correct ARIA attributes', () => {
    render(<SkeletonLoader />);
    const loader = screen.getByRole('status');
    expect(loader).toHaveAttribute('aria-label', 'Loading content');
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });
});
