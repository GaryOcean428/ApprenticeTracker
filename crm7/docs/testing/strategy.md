# Testing Strategy

## Unified Testing Framework

To maintain consistency and leverage modern testing capabilities, we have standardized on Vitest as our single testing solution for unit, integration, and component tests. All new tests must:
- Use Vitest's globals (e.g., use "vi" for mocking and spying) rather than any legacy Jest APIs
- Be executed via the command: `pnpm vitest run --coverage`
- Follow the practices outlined below to ensure our critical paths achieve 100% coverage

### Migration from Jest
- Remove all Jest dependencies
- Replace jest.fn() with vi.fn()
- Replace jest.mock() with vi.mock()
- Replace jest.spyOn() with vi.spyOn()
- Update test configuration to use vitest.config.ts
- Use Vitest's superior TypeScript integration
- Take advantage of Vitest's better performance
- Leverage Vitest's improved watch mode
- Use Vitest's better error messages
- Utilize Vitest's test filtering

### Route Handler Testing
- Route params must be wrapped in Promise.resolve() for Next.js 15.1.6+
- Mock external clients and services using vi.mock()
- Use NextRequest and proper context types
- Validate both success and error cases
- Test param validation thoroughly

### API Client Testing
- Mock axios responses using vi.mock()
- Test error handling with proper error types
- Validate configuration requirements
- Test all client methods independently
- Use proper typing for mock data

## Testing Levels

### Unit Testing
- Component testing with React Testing Library
- Utility function testing with Vitest
- Hook testing with custom test utils
- Context testing with providers
- Type testing with TypeScript

### Integration Testing
- API integration tests
- Database integration with Supabase
- External service mocking
- Component integration
- State management testing

### End-to-End Testing
- Critical user flows
- Cross-browser testing
- Mobile responsiveness
- Accessibility testing
- Performance testing

## Testing Tools

### Frontend Testing
- Vitest for unit and integration tests
- React Testing Library
- Playwright for E2E testing
- Testing Library User Event

### API Testing
- Supertest
- MSW for mocking
- API documentation tests
- Contract testing
- Type safety tests

### Performance Testing
- Lighthouse CI
- Web Vitals tracking
- Load testing with k6
- Bundle size analysis
- Runtime performance

### Accessibility Testing
- Axe-core integration
- Manual testing
- Screen reader testing
- Keyboard navigation
- Color contrast

### Visual Testing
- Storybook
- Visual regression
- Component documentation
- Interactive examples
- Design system testing

## Test Coverage Goals

### Critical Paths
- Authentication flows: 100%
- Financial transactions: 100%
- Data mutations: 100%
- Form submissions: 100%
- Error handling: 100%

### Component Coverage
- UI components: 90%
- Business logic: 95%
- Utility functions: 90%
- Custom hooks: 95%
- API integrations: 90%

## Testing Practices

### Code Quality
- Test-driven development
- Continuous integration
- Automated testing using Vitest
- Code review process
- Performance budgets

### Documentation
- Test documentation
- Testing patterns
- Best practices
- Setup guides
- Troubleshooting

### Monitoring
- Test metrics
- Coverage reports
- Performance tracking
- Error tracking
- Test analytics

## Continuous Improvement

### Regular Reviews
- Coverage analysis
- Performance metrics
- Test maintenance
- Pattern updates
- Tool evaluation

### Team Training
- Testing workshops
- Documentation updates
- Best practices sharing
- Code reviews
- Pair testing

## Type Safety Requirements

### Route Handler Types
- Use Promise<RouteParams> for Next.js 15.1.6+ context params
- Validate params with Zod schemas before use
- Use proper NextRequest and NextResponse types
- Handle all error cases with typed responses
- Use strict TypeScript checking

### Component Types
- Use proper generic constraints
- Avoid type assertions (as) where possible
- Define prop interfaces explicitly
- Use strict null checks
- Handle loading and error states with proper types

### API Types
- Define request/response types
- Use Zod for runtime validation
- Handle all error cases
- Use proper HTTP status codes
- Document API types

## Mocking Patterns

### Service Mocks
- Extend base service classes instead of implementing interfaces
- Use vi.fn() for method mocks
- Preserve private/protected access modifiers
- Call super() with required config in constructor
- Mock only the methods needed for tests

### Query Result Mocks
- Type overrides as Partial<UseQueryResult<T>>
- Include all required status flags
- Match loading/error/success states exactly
- Use proper type constraints
- Avoid type assertions when possible

## Type Safety in Tests

### Common Patterns
1. Service Mocking
   - Extend base classes instead of implementing interfaces
   - Preserve access modifiers (private/protected)
   - Call super() with proper configuration
   - Mock only required methods
   - Use proper generic constraints

2. Response Mocking
   - Use Partial<T> for complex types
   - Include all required status flags
   - Match exact state types (loading/error)
   - Avoid type assertions
   - Define explicit interfaces

3. Environment Handling
   - Mock process.env properly
   - Provide test-specific values
   - Handle undefined cases
   - Validate at setup
   - Clean up after tests

4. Error Testing
   - Use proper error inheritance
   - Test all error paths
   - Validate error types
   - Check error messages
   - Verify error handling

### AI Assistant Testing Guidelines
1. Mock Setup
   - Extend base classes
   - Preserve access modifiers
   - Use proper configuration
   - Mock minimum required
   - Follow inheritance patterns

2. Type Safety
   - Use explicit types
   - Avoid assertions
   - Handle null/undefined
   - Validate inputs
   - Check error cases

3. State Management
   - Match exact states
   - Include all flags
   - Use proper constraints
   - Follow framework patterns
   - Test transitions
