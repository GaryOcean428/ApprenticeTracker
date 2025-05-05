# Component Library Documentation

## Component Development Guidelines

This document outlines the standards and best practices for component development in our application.

### Component Structure

All components should follow these guidelines:

1. **Single Responsibility Principle**: Each component should do one thing and do it well
2. **Props Interface**: Every component should have a clearly defined props interface
3. **Default Props**: Provide sensible defaults where applicable
4. **Error Handling**: Components should gracefully handle edge cases
5. **Accessibility**: Components should be accessible (keyboard navigation, ARIA attributes, etc.)

### Component Organization

Components are organized into the following categories:

#### Atomic Components (`components/common`)
- Buttons
- Inputs
- Typography
- Icons
- Cards

#### Feature Components (`components/{feature-name}`)
- Feature-specific components that compose atomic components
- Business logic contained in hooks, not in the components themselves

#### Page Components (`pages/{feature-name}`)
- Top-level components that represent a full page
- Compose feature components
- Handle routing concerns

### Example Component Structure

```tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { ApprenticeData } from '@/types';

interface ApprenticeCardProps {
  apprentice: ApprenticeData;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  isLoading?: boolean;
}

export function ApprenticeCard({
  apprentice,
  onView,
  onEdit,
  isLoading = false,
}: ApprenticeCardProps) {
  const { toast } = useToast();
  
  const handleError = (action: string) => {
    toast({
      title: 'Error',
      description: `Failed to ${action} apprentice`,
      variant: 'destructive',
    });
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-medium">
        {apprentice.firstName} {apprentice.lastName}
      </h3>
      <p className="text-sm text-muted-foreground">{apprentice.trade}</p>
      
      <div className="mt-4 flex space-x-2">
        <Button 
          variant="outline" 
          onClick={() => onView?.(apprentice.id)}
          disabled={isLoading}
        >
          View Details
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onEdit?.(apprentice.id)}
          disabled={isLoading}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}
```

### Component Error Boundaries

All page components should be wrapped in an error boundary to prevent entire application crashes:

```tsx
import { ErrorBoundary } from '@/components/error-boundary';

export default function ApprenticesPage() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong loading apprentices</div>}>
      <ApprenticesList />
    </ErrorBoundary>
  );
}
```

### Performance Considerations

1. **Memoization**: Use React.memo for components that render often but rarely change
2. **Virtualization**: Use virtualization for long lists (e.g., react-window)
3. **Code Splitting**: Use dynamic imports for large components
4. **Lazy Loading**: Use React.lazy for route-based code splitting

### Testing Components

Components should have associated tests that verify:

1. Rendering without errors
2. Correct behavior when given valid props
3. Graceful handling of edge cases (empty data, etc.)
4. Interaction handling (clicks, form submissions, etc.)

See the testing documentation for specific examples.
