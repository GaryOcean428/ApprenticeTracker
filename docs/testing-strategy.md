# Testing Strategy

## Overview

This document outlines our comprehensive testing approach to ensure application quality, reliability, and maintainability.

## Testing Levels

### 1. Unit Tests

Unit tests focus on testing individual components, functions, and modules in isolation.

**Coverage Areas:**
- Utility functions
- Hooks
- Individual components
- API service functions
- Data transformations

**Tools:**
- Jest for test running and assertions
- React Testing Library for component testing
- Vitest for faster test execution

**Example Unit Test:**

```tsx
// Testing a utility function
import { formatCurrency } from '../utils/format-currency';

describe('formatCurrency', () => {
  it('formats numbers with the correct currency symbol', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });

  it('handles zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

// Testing a React component
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/button';

describe('Button component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 2. Integration Tests

Integration tests verify that different parts of the application work together correctly.

**Coverage Areas:**
- Component compositions
- API service interactions
- Form submissions
- State management
- Routing

**Tools:**
- Jest for test running
- React Testing Library for component interactions
- MSW (Mock Service Worker) for API mocking

**Example Integration Test:**

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApprenticeForm } from '../components/apprentices/apprentice-form';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';

// Mock the API service
jest.mock('../services/apprentice-service', () => ({
  createApprentice: jest.fn().mockResolvedValue({ id: 123, name: 'Test User' }),
}));

describe('ApprenticeForm', () => {
  it('submits the form correctly with valid data', async () => {
    const onSuccessMock = jest.fn();
    
    render(
      <QueryClientProvider client={queryClient}>
        <ApprenticeForm onSuccess={onSuccessMock} />
      </QueryClientProvider>
    );
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/first name/i), 'John');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
    await userEvent.selectOptions(screen.getByLabelText(/trade/i), ['Carpentry']);
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Verify success callback was called
    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledWith({ id: 123, name: 'Test User' });
    });
  });
  
  it('shows validation errors for invalid data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ApprenticeForm />
      </QueryClientProvider>
    );
    
    // Submit without filling form
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Check for validation messages
    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

### 3. End-to-End Tests

E2E tests verify the entire application workflow from start to finish.

**Coverage Areas:**
- Critical user journeys
- Authentication flows
- Form submissions with real API calls
- Navigation and routing

**Tools:**
- Cypress for browser-based E2E testing
- Playwright as an alternative E2E tool

**Example E2E Test:**

```javascript
// cypress/e2e/apprentice-management.cy.js
describe('Apprentice Management', () => {
  beforeEach(() => {
    // Set up authentication - either stub or real login
    cy.login('admin@example.com', 'password');
    cy.visit('/apprentices');
  });

  it('allows creating a new apprentice', () => {
    cy.get('[data-testid=add-apprentice-button]').click();
    
    // Fill out form
    cy.get('#firstName').type('John');
    cy.get('#lastName').type('Smith');
    cy.get('#email').type('john.smith@example.com');
    cy.get('#trade').select('Electrical');
    cy.get('#startDate').type('2023-01-15');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Verify success message and redirect
    cy.contains('Apprentice created successfully').should('be.visible');
    cy.url().should('include', '/apprentices');
    
    // Verify new apprentice appears in the list
    cy.contains('John Smith').should('be.visible');
  });

  it('allows editing an existing apprentice', () => {
    cy.contains('tr', 'John Smith')
      .find('[data-testid=edit-button]')
      .click();
    
    // Update information
    cy.get('#trade').select('Plumbing');
    cy.get('button[type="submit"]').click();
    
    // Verify success message
    cy.contains('Apprentice updated successfully').should('be.visible');
    
    // Verify updated information appears
    cy.contains('tr', 'John Smith')
      .should('contain', 'Plumbing');
  });
});
```

## Test Organization

### File Structure

```
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   ├── integration/
│   │   ├── features/
│   ├── e2e/
│   │   ├── journeys/
```

### Naming Conventions

- Unit tests: `[filename].test.ts(x)`
- Integration tests: `[feature].spec.ts(x)`
- E2E tests: `[journey].cy.ts`

## Testing Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Avoid testing implementation details

2. **Use Test-Driven Development when appropriate**
   - Write tests before implementing features
   - Red-Green-Refactor cycle

3. **Maintain Test Independence**
   - Tests should not rely on each other
   - Reset state between tests

4. **Use Realistic Test Data**
   - Create factories or fixtures for common data structures
   - Use realistic values that match production scenarios

5. **Keep Tests Fast**
   - Optimize tests for speed
   - Use mocks for external dependencies

## Code Coverage

We aim for the following code coverage targets:

- **Unit tests**: 80%+ coverage
- **Integration tests**: Cover all critical features
- **E2E tests**: Cover all main user journeys

## Continuous Integration

All tests run automatically on:
- Pull requests
- Merges to main branch
- Release tagging

Failing tests block merges to ensure code quality.

## Mock Strategy

1. **API Mocking**
   - Use MSW for API mocking in unit and integration tests
   - Create realistic response fixtures

2. **Environment Services**
   - Mock browser APIs when needed
   - Stub native features consistently

## Debugging Tests

1. **Visual Debugging**
   - Use Cypress's visual UI for E2E test debugging
   - Implement screenshots on test failures

2. **Logging**
   - Add debug logging for complex test scenarios
   - Use descriptive error messages
