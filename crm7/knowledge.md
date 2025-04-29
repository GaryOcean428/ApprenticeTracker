## Version Requirements

- Next.js version: 15.1.6 (required)
- Node.js: 20.11.1 (LTS version)
  - Use LTS version for production stability
  - Avoid latest versions (e.g., 23.x) until LTS
  - Update within 3 months of new LTS release
  - Test against both current and previous LTS
- TypeScript: ^5.0.0
- Package manager: pnpm (version 10.2.1)

### Node.js Version Management
- Use fnm for version switching
- Keep .nvmrc in sync with package.json engines
- CI must match local development version
- All environments (dev, CI, prod) must use same version
- Version must be specified exactly (e.g., "20.11.1" not "^20.11.1")

## Project Path

- Project must be initialized with correct base path: /home/braden/Desktop/Dev/crm7r
- All file access and operations must be relative to this path
- Project is part of the Desktop/Dev directory containing multiple projects

## Build Tools

- Uses Next.js for development and production builds
- Package manager: pnpm (version 10.2.1)
- Node version: 20.11.1

## Version Management

### Next.js 15.1.6 Features

- Uses modern image optimization with remotePatterns
- Enables optimized package imports for better performance
- Supports modern CSS features with modernBrowsers flag
- Implements incremental TypeScript checking
- Enhanced security headers configuration
- Improved server actions with origin validation

### Version Control

- Check Next.js version staleness warnings
- Monitor Next.js releases for security updates
- Test shadcn/ui and Lucide React compatibility with each upgrade
- Run comprehensive tests after version updates
- Use canary releases when reporting bugs or testing cutting-edge features
- Reference: <https://nextjs.org/docs/messages/version-staleness>

### Compatibility Notes

- All @radix-ui components are optimized for tree-shaking
- Lucide React icons are bundled efficiently
- Server actions are properly typed and validated
- Security headers are automatically applied
- Image optimization uses modern patterns
- TypeScript strict mode is enforced

### Development Guidelines

- Use server actions with proper origin validation
- Implement proper error boundaries for async components
- Follow Next.js App Router best practices
- Use modern image optimization patterns
- Implement proper security headers
- Monitor bundle size with built-in analyzer

### Testing Requirements

- Run full test suite before version updates
- Test server actions in development and production
- Verify image optimization with different devices
- Check bundle size changes after updates
- Validate security headers in production
- Test canary releases when needed

### Mocking Axios Errors
When testing Axios error handling, create mock errors with isAxiosError property:
```typescript
const mockError = Object.assign(
  new Error('Error message'),
  {
    isAxiosError: true,
    response: {
      status: 404,
      data: { message: 'Error message' }
    }
  }
);
```

### Supabase Integration

- Use @supabase/ssr for server-side rendering
- Implement createServerClient for server components
- Use createBrowserClient for client components
- Local development requires Docker and Supabase CLI
- Enforce type safety with generated types
- Reference: <https://supabase.com/docs/guides/local-development>

### Route Handler Requirements

- Route handlers must use typed params interface
- Context params are no longer Promise types in App Router
- Route handler functions must be async
- Route handler functions should use NextRequest type
- Each route file should export a single HTTP method handler
- Route params must be Promise<T> in Next.js 15.1.6+
- Tests must wrap route params in Promise.resolve()
- Each route handler should have its own params schema
- Route handlers should await context.params before validation

## Package Management

- Use pnpm as the package manager
- Version: 10.2.1
- No npm lock files allowed
- Use .npmrc for configuration
- Use pnpm-lock.yaml for dependency locking
- Use `engine-strict=true` for Node version enforcement
- Initial package installation may take several minutes due to large dependency tree
- Command timeouts during installation are normal - installation continues in background

## Git Hooks and Code Quality

- Uses Husky for Git hooks management
- lint-staged for pre-commit code quality checks
- Enforces ESLint and Prettier on staged files
- Pre-commit hook runs automatically on staged files
- Requires proper Node and pnpm versions

## Vercel Deployment Requirements

- Use `engines` in package.json for Node.js version specification
- Do not use `use-node-version` in .npmrc
- Node.js version must be specified exactly (e.g., "20.11.1" not ">=20.11.1")
- PNPM version must be specified exactly
- Reference: <http://vercel.link/node-version>

## Authentication

- Uses Supabase for authentication and database
- Direct integration with Next.js App Router
- PKCE flow for secure authentication
- Session management via cookies
- Row Level Security (RLS) for data access control
- Real-time subscription support
- Type-safe database queries

### Authentication Flow

1. User signs in/up via email + password
2. Supabase handles authentication
3. Session stored in cookies
4. RLS policies control data access
5. Real-time updates via subscriptions

### Security Features

- PKCE authentication flow
- Secure session management
- HTTP-only cookies
- Automatic token refresh
- Rate limiting
- Row Level Security
- Input validation
- XSS protection

## Project Configuration

### Port Usage
- Development server runs on port 3001 to avoid congestion
- Test environment uses same port configuration
- Port can be configured via PORT environment variable
- Default port is 3001 if not specified

### ECMAScript Target
- Use ES2024 as target in .swcrc and tsconfig.json
- Matches our Node.js 22.x runtime capabilities
- Enables modern JavaScript features
- Required for optimal performance and code clarity

### Testing Framework
- Use Vitest as the sole testing framework
- Remove all Jest dependencies and configurations
- Use vi.fn() instead of jest.fn()
- Use vi.mock() instead of jest.mock()
- Use vi.spyOn() instead of jest.spyOn()
- Tests should be in __tests__ directories or *.test.ts files
- Run tests with `pnpm vitest run --coverage`
- Use Vitest's built-in coverage reporting
- Take advantage of Vitest's better TypeScript support
- Use Vitest's superior snapshot testing

### Testing Best Practices
- Use Vitest's globals (vi) for all mocking/spying
- Take advantage of Vitest's async handling
- Use Vitest's built-in DOM testing utilities
- Leverage Vitest's better error messages
- Use Vitest's test filtering capabilities
- Utilize Vitest's watch mode for development
- Take advantage of Vitest's parallel test execution
- Use Vitest's built-in assertion library
- Leverage Vitest's TypeScript integration
- Use Vitest's snapshot testing for UI components

### Next.js App Router Types
- Route handlers must use explicit RouteContext type
- Params should be validated with Zod schemas
- Response type must be Promise<Response>
- Environment checks should map to correct client config
- Toast descriptions can accept ReactNode for rich content
- Route handler params must be destructured in function parameters
- Route context types must match Next.js internal types
- Route params must be Promise<T> in Next.js 15.1.6+
- Tests must wrap route params in Promise.resolve()
- Each route handler should have its own params schema
- Route handlers should await context.params before validation

## Common Type Safety Patterns

### Service Methods
- Return explicit response types, never void
- Define interfaces for all request/response pairs
- Use discriminated unions for error handling
- Avoid type assertions (as) in service calls
- Always define error types with proper inheritance

### Class Inheritance
- Extend base classes rather than implementing interfaces when mocking
- Preserve access modifiers (private/protected) in derived classes
- Call super() with required configuration
- Override only necessary methods
- Use proper generic constraints

### Environment Variables
- Use strict null checks for process.env
- Provide fallback values or throw early
- Type environment variables explicitly
- Validate at startup
- Use constants for defaults

### API Routes
- Use Promise<RouteParams> for Next.js 15.1.6+ context params
- Define explicit response types
- Use NextResponse instead of Response
- Handle undefined values in request data
- Validate params before use

### Testing Patterns
- Mock services by extending base classes
- Use Partial<T> for complex type overrides
- Include all required status flags in mocks
- Avoid type assertions in tests
- Use proper generic constraints

### Common Mistakes to Avoid
1. Void Return Types
   - Always define explicit return types
   - Never use void for async functions that return data
   - Use Promise<T> with specific type

2. Type Assertions
   - Avoid 'as' keyword
   - Use type guards instead
   - Define proper interfaces
   - Use discriminated unions

3. Environment Variables
   - Never use process.env without checks
   - Define fallbacks
   - Validate at startup
   - Use type guards

4. Class Inheritance
   - Extend don't implement for mocks
   - Preserve access modifiers
   - Call super() properly
   - Override only what's needed

5. Response Types
   - Use NextResponse not Response
   - Define explicit types
   - Handle all error cases
   - Validate inputs

### AI Assistant Usage Guidelines
1. Always provide explicit return types
2. Never use type assertions without explanation
3. Handle undefined/null cases explicitly
4. Use proper error inheritance
5. Preserve access modifiers in mocks
6. Define request/response pairs as interfaces
7. Validate environment variables
8. Use type guards over assertions
9. Follow Next.js 15.1.6+ patterns
10. Extend base classes for mocks

## Common AI Assistant Issues and Solutions

### Type Safety
1. Return Type Mismatches
   - Issue: AI suggests void returns for async functions
   - Solution: Require explicit Promise<T> returns
   - Example: `async getAnalytics(): Promise<AnalyticsResponse>`

2. Access Modifier Conflicts
   - Issue: AI implements interfaces instead of extending classes
   - Solution: Always extend base classes for mocks
   - Example: `class MockService extends BaseService`

3. Type Assertion Overuse
   - Issue: AI uses type assertions to fix errors
   - Solution: Use type guards and proper interfaces
   - Example: `if ('data' in response)` vs `as ResponseType`

4. Environment Variable Handling
   - Issue: Undefined cases not handled properly
   - Solution: Add explicit validation and fallbacks
   - Example: Use constants for defaults, validate at startup

5. Response Type Mixing
   - Issue: Inconsistent use of Response/NextResponse
   - Solution: Standardize on NextResponse
   - Example: Use createApiResponse helper

### Best Practices for AI Development
1. Type Definition Review
   - Review all type definitions before implementation
   - Ensure interfaces are complete and accurate
   - Use strict type checking options

2. Mock Implementation
   - Extend base classes instead of implementing interfaces
   - Preserve access modifiers (private/protected)
   - Call super() with proper configuration
   - Mock only necessary methods

3. Error Handling
   - Use proper error inheritance chain
   - Define custom error classes
   - Include error context and metadata
   - Proper async/await error handling

4. Environment Configuration
   - Validate all env vars at startup
   - Provide type-safe defaults
   - Use constants for configuration
   - Document required env vars

5. Response Standardization
   - Use consistent response patterns
   - Define reusable response types
   - Validate response data
   - Handle all error cases

## Common Type Safety Issues with Node.js 20

1. Return Type Consistency
   - Functions returning Promise must specify exact type
   - Avoid void returns for async functions
   - Use explicit Promise<T> return types

2. Environment Variables
   - Node.js 20 requires explicit undefined checks
   - Use ?? operator with fallback values
   - Validate at startup
   - Type as string | undefined

3. Module Imports
   - Use type imports for interfaces/types
   - Avoid mixing default and named imports
   - Keep import styles consistent

4. Class Inheritance
   - Private fields require careful mocking
   - Extend base classes in tests
   - Preserve access modifiers
   - Call super() with proper config

### Service Layer Type Safety
- Always explicitly type service method returns to avoid void inference
- Use explicit type annotations when destructuring service responses
- When setting React state from async data, use arrow function form to avoid stale closures
- Ensure service implementations match their interfaces exactly
- Add type guards for error handling in service methods
