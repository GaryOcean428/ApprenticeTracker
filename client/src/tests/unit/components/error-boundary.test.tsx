import { describe, it, expect, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import type { ReactElement } from 'react';
import ErrorBoundary, { withErrorBoundary } from '@/components/error-boundary';

function render(ui: ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return {
    container,
    unmount: () => {
      root.unmount();
      document.body.removeChild(container);
    },
  };
}

function getByText(container: HTMLElement, text: string) {
  const el = Array.from(container.querySelectorAll('*')).find(
    node => node.textContent?.trim() === text
  );
  if (!el) {
    throw new Error(`Unable to find text: ${text}`);
  }
  return el as HTMLElement;
}

function queryByText(container: HTMLElement, text: string) {
  return (
    Array.from(container.querySelectorAll('*')).find(node => node.textContent?.trim() === text) ||
    null
  );
}

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal component</div>;
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const { container, unmount } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(getByText(container, 'Test content')).toBeTruthy();
    unmount();
  });

  it('renders error UI when child component throws', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchSpy = vi.spyOn(global, 'fetch' as any).mockResolvedValue({} as Response);

    const { container, unmount } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText(container, 'Something went wrong')).toBeTruthy();
    expect(getByText(container, 'Try Again')).toBeTruthy();
    expect(getByText(container, 'Reload Page')).toBeTruthy();

    unmount();
    fetchSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const customFallback = <div>Custom error message</div>;
    const fetchSpy = vi.spyOn(global, 'fetch' as any).mockResolvedValue({} as Response);

    const { container, unmount } = render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText(container, 'Custom error message')).toBeTruthy();
    expect(queryByText(container, 'Something went wrong')).toBeNull();

    unmount();
    fetchSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('calls onError callback when error occurs', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onErrorSpy = vi.fn();
    const fetchSpy = vi.spyOn(global, 'fetch' as any).mockResolvedValue({} as Response);

    const { unmount } = render(
      <ErrorBoundary onError={onErrorSpy}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onErrorSpy).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );

    unmount();
    fetchSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});

describe('withErrorBoundary', () => {
  it('wraps component with error boundary', () => {
    const TestComponent = () => <div>Wrapped component</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    const { container, unmount } = render(<WrappedComponent />);

    expect(getByText(container, 'Wrapped component')).toBeTruthy();
    unmount();
  });

  it('sets correct display name', () => {
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';

    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });
});
