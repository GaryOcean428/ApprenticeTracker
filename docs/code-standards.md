# Code Standards

## Overview

This document outlines our coding standards to ensure consistency, maintainability, and quality across the Braden Group CRM7 codebase.

## TypeScript Guidelines

### 1. Type Safety

- Always use TypeScript's static type checking to its fullest extent
- Minimize use of `any` - use specific types or `unknown` when appropriate
- Use interface for object shapes that represent entities or API responses
- Use type for unions, intersections, and utility types

```typescript
// Good
interface Apprentice {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: 'active' | 'inactive' | 'completed' | 'withdrawn';
}

// Avoid
const getApprentice = (id: any): any => {
  // ...
};

// Good
const getApprentice = (id: number): Promise<Apprentice> => {
  // ...
};
```

### 2. Nullability

- Be explicit about nullability with union types (`T | null`)
- Use optional chaining (`?.`) and nullish coalescing (`??`) for handling nullable values
- Avoid defensive programming patterns with excessive null checks

```typescript
// Good
function getUserName(user: User | null): string {
  return user?.name ?? 'Guest';
}

// Avoid
function getUserName(user: User): string {
  if (user && user.name) {
    return user.name;
  }
  return 'Guest';
}
```

### 3. Async Code

- Always use async/await for asynchronous code
- Properly handle errors in async functions with try/catch blocks
- Return consistent types from async functions (Promise<T>)

```typescript
// Good
async function fetchApprentices(): Promise<Apprentice[]> {
  try {
    const response = await fetch('/api/apprentices');
    if (!response.ok) throw new Error('Failed to fetch apprentices');
    return await response.json();
  } catch (error) {
    errorService.logError(error);
    return [];
  }
}

// Avoid
function fetchApprentices() {
  return fetch('/api/apprentices')
    .then(res => res.json())
    .then(data => data)
    .catch(err => console.error(err));
}
```

## React Best Practices

### 1. Component Structure

- Use functional components with hooks
- Keep components small and focused on a single responsibility
- Extract complex logic into custom hooks
- Use TypeScript props interfaces for component props

```typescript
// Good
interface UserProfileProps {
  userId: number;
  showDetails?: boolean;
}

function UserProfile({ userId, showDetails = false }: UserProfileProps) {
  const { user, isLoading } = useUser(userId);
  
  if (isLoading) return <Skeleton />;
  if (!user) return <UserNotFound />;
  
  return (
    <div>
      <h2>{user.name}</h2>
      {showDetails && <UserDetails user={user} />}
    </div>
  );
}
```

### 2. State Management

- Use React Query for server state
- Use React's built-in state management (useState, useReducer) for UI state
- Keep state as close as possible to where it's used
- Use context sparingly for truly global state

```typescript
// Local state
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}

// Server state with React Query
function ApprenticeList() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/apprentices'],
    // Use the default fetcher
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <ul>
      {data?.map(apprentice => (
        <li key={apprentice.id}>{apprentice.firstName} {apprentice.lastName}</li>
      ))}
    </ul>
  );
}
```

### 3. Performance Optimization

- Use memoization appropriately (useMemo, useCallback)
- Implement virtualization for long lists
- Avoid unnecessary re-renders with React.memo when appropriate
- Use code splitting with dynamic imports for large components

```typescript
// Memoizing expensive calculations
function DataAnalytics({ data }) {
  const processedData = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);
  
  return <Chart data={processedData} />;
}

// Virtualized list for performance
function ApprenticeDirectory({ apprentices }) {
  return (
    <VirtualizedList
      items={apprentices}
      height={600}
      rowHeight={50}
      renderItem={(apprentice) => (
        <ApprenticeRow apprentice={apprentice} />
      )}
    />
  );
}
```

## Error Handling

### 1. Centralized Error Handling

- Use the error handling service for consistent error processing
- Categorize errors by type for appropriate user feedback
- Log errors with context for debugging

```typescript
// Good
import { errorService } from '@/lib/error-service';
import { useErrorHandler } from '@/hooks/use-error-handler';

function ApprenticeForm() {
  const { handleError, tryCatch } = useErrorHandler();
  
  const handleSubmit = async (data) => {
    await tryCatch(
      async () => {
        const result = await createApprentice(data);
        toast({ title: 'Success', description: 'Apprentice created successfully' });
        return result;
      },
      { context: 'ApprenticeForm.handleSubmit' }
    );
  };
  
  // ...
}
```

### 2. User Feedback

- Show appropriate error messages to users
- Use toast notifications for temporary feedback
- Implement error boundaries for UI recovery
- Provide actionable error messages

```tsx
// Good
function SubmitButton({ isLoading, errorMessage }) {
  return (
    <div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </Button>
      {errorMessage && (
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
```

## API Integration

### 1. API Client Structure

- Use React Query for data fetching and caching
- Implement consistent error handling for API requests
- Type API responses and requests

```typescript
// Good API integration
interface ApprenticeResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  // other fields...
}

interface ApprenticeRequest {
  firstName: string;
  lastName: string;
  email: string;
  // other fields...
}

// Using apiRequest utility from queryClient.ts
async function createApprentice(data: ApprenticeRequest): Promise<ApprenticeResponse> {
  const response = await apiRequest('POST', '/api/apprentices', data);
  return await response.json();
}

// In component
function CreateApprenticeForm() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: createApprentice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/apprentices'] });
    },
  });
  
  // Form implementation...
}
```

### 2. Mock Testing

- Use MSW for API mocking in tests
- Create realistic fixtures for test data
- Test error states and loading states

```typescript
// API mock with MSW
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const apprenticesMock = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
];

const server = setupServer(
  rest.get('/api/apprentices', (req, res, ctx) => {
    return res(ctx.json(apprenticesMock));
  }),
  
  rest.post('/api/apprentices', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: 3, ...req.body }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Code Organization

### 1. Folder Structure

```
/client
  /src
    /components
      /ui           # Reusable UI components
      /common       # Common components used across features
      /layouts      # Layout components
      /<feature>    # Feature-specific components
    /hooks          # Custom React hooks
    /lib            # Utilities and services
    /pages          # Page components
    /tests          # Test files
    /types          # TypeScript type definitions
/server
  /api              # API routes
  /middleware       # Express middleware
  /services         # Business logic
/shared             # Shared between client and server
  /schema.ts        # Database schema and types
```

### 2. Naming Conventions

- **Files:**
  - React components: PascalCase (e.g., `UserProfile.tsx`)
  - Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
  - Utilities: kebab-case (e.g., `date-utils.ts`)
  - API routes: kebab-case (e.g., `apprentice-routes.ts`)

- **Variables and Functions:**
  - Use descriptive, meaningful names
  - camelCase for variables and functions
  - PascalCase for types, interfaces, and classes
  - ALL_CAPS for constants

```typescript
// Good
const MAX_RETRY_ATTEMPTS = 3;
function calculateTotalHours(timesheet: Timesheet): number { /* ... */ }
interface UserPreferences { /* ... */ }
class AppError extends Error { /* ... */ }

// Avoid
const x = 3;
function calc(t: any): number { /* ... */ }
```

## Documentation

### 1. Code Comments

- Document complex business logic with clear comments
- Use JSDoc for functions and components
- Avoid obvious comments that duplicate code

```typescript
/**
 * Calculates the pro-rated pay amount based on hours worked and rate
 * @param hours - Total hours worked in the pay period
 * @param rate - Hourly rate in AUD
 * @param allowances - Array of allowances to apply
 * @returns The calculated pay amount in cents
 */
function calculateProRatedPay(hours: number, rate: number, allowances: Allowance[]): number {
  // Apply Australian tax regulations for casual loading
  const casualLoading = isCasual ? CASUAL_LOADING_RATE : 0;
  
  // ... rest of function
}
```

### 2. README Files

- Maintain comprehensive README files for major components
- Include setup instructions, usage examples, and API documentation
- Document known issues and limitations

## Testing

### 1. Unit Testing

- Test individual functions and components in isolation
- Use Jest and React Testing Library
- Focus on behavior, not implementation details

```typescript
// Good unit test
describe('formatCurrency', () => {
  it('formats currency with dollar sign', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1000.5)).toBe('$1,000.50');
  });
  
  it('handles negative values', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });
});
```

### 2. Integration Testing

- Test component interactions and workflows
- Mock external dependencies appropriately
- Test form submissions and user interactions

```typescript
// Good integration test
describe('ApprenticeForm', () => {
  it('submits the form with valid data', async () => {
    render(<ApprenticeForm />);
    
    await userEvent.type(screen.getByLabelText(/first name/i), 'John');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Smith');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Assert form submission behavior
    await waitFor(() => {
      expect(screen.getByText(/apprentice created/i)).toBeInTheDocument();
    });
  });
});
```

## Performance

### 1. Frontend Performance

- Implement code splitting for large applications
- Use virtualization for long lists
- Optimize images and assets
- Monitor and reduce bundle size

### 2. Backend Performance

- Use efficient database queries
- Implement appropriate caching strategies
- Monitor API response times
- Use pagination for large data sets

## Accessibility

### 1. WCAG Compliance

- Follow WCAG 2.1 AA standards
- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation

```tsx
// Good accessibility practices
<button
  aria-label="Close dialog"
  onClick={onClose}
  disabled={isSubmitting}
>
  <span className="sr-only">Close</span>
  <XIcon aria-hidden="true" />
</button>
```

### 2. Color and Contrast

- Ensure sufficient color contrast
- Don't rely solely on color for conveying information
- Test with screen readers and keyboard navigation

## Security

### 1. Data Protection

- Sanitize user inputs
- Implement proper authentication and authorization
- Use HTTPS for all requests
- Apply proper content security policies

### 2. Vulnerability Prevention

- Regularly update dependencies
- Implement CSRF protection
- Apply rate limiting for API requests
- Conduct security audits

## Continuous Improvement

- Conduct regular code reviews
- Refactor code when technical debt accumulates
- Update documentation as the system evolves
- Stay updated with latest best practices and security recommendations