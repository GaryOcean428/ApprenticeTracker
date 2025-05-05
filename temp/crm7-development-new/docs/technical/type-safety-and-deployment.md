# Type Safety and Deployment Guide

This document provides a comprehensive guide for type safety improvements, deployment readiness, and monitoring setup for our Next.js application.

## Table of Contents

1. [Type Safety Improvements](#type-safety-improvements)
1. [Deployment Configuration](#deployment-configuration)
1. [Monitoring and Error Handling](#monitoring-and-error-handling)
1. [Testing Strategy](#testing-strategy)

## Type Safety Improvements

### Component Types

#### Puck Component Types

```typescript
// In lib/puck/config.tsx
interface SchemaAwareComponentConfig {
  render: (props: ComponentProps) => React.ReactElement;
  validate?: (data: unknown) => boolean;
  [key: string]: any;
}

type SchemaAwarePuckConfig = {
  components: Record<string, SchemaAwareComponentConfig>;
}
```

#### Schema Component Field Types

```typescript
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'json'
  | 'array'
  | 'relation'
  | 'text'
  | 'textarea'
  | 'radio'
  | 'select';

const schema: SchemaComponentConfig = {
  dbTable: 'profiles',
  fields: {
    userId: {
      name: 'userId',
      type: 'text',
      label: 'User ID',
      validation: { required: true },
    },
  },
  preview: { fields: ['layout', 'showEmail'], template: 'User Profile ({{layout}})' },
};
```

### Service Layer Types

#### FairWork API Client

```typescript
export class FairWorkClient {
  async getActiveAwards(): Promise<{ items: Award[]; total: number }> {
    return Promise.resolve({ items: [], total: 0 });
  }
  async getCurrentRates(): Promise<RateRates> { /* ... */ }
  async getRatesForDate(): Promise<RateRates> { /* ... */ }
  async getClassifications(): Promise<any> { /* ... */ }
  async calculateRate(): Promise<any> { /* ... */ }
}
```

#### Cache Service

```typescript
export class MockCacheService extends CacheService {
  public override async get<T>(key: string): Promise<T | null> {
    // Custom mock logic here
  }
  public override async set<T>(key: string, value: T): Promise<void> {
    // Custom mock logic here
  }
}
```

### Auth Module Updates

```typescript
export async function getSession(req: NextRequest): Promise<AuthSession | null> {
  // Explicitly check the session and return with proper types
}
```

## Deployment Configuration

### Type Generation

Our project automatically generates and updates Supabase TypeScript definitions through GitHub Actions:

```bash
pnpm types        # Generate types
pnpm types:watch  # Watch mode for development
```

Review generated types in `lib/types/database.ts`.

### Environment Variables

- Variables are synced via sync-env.yml workflow
- Use Zod schema in `lib/config/environment.ts` for validation
- Ensure proper fallback handling for process.env usage

### Security Headers

- Verify headers in `next.config.js` and `vercel.json`
- Implement rate limiting in `lib/middleware/api-rate-limit.ts`
- Set up cache warming in `lib/services/cache/warming.ts`

## Monitoring and Error Handling

### Span Tracking

```typescript
export function startSpan(name: string, type: string, data?: Record<string, unknown>): MonitoringSpan {
  const span: MonitoringSpan = {
    name,
    type,
    startTime: Date.now(),
    tags: new Map(),
    status: SpanStatus.Ok
  };
  return span;
}

export function finishSpan(span: MonitoringSpan, status: SpanStatusType = SpanStatus.Ok, data?: Record<string, unknown>): void {
  const duration = Date.now() - span.startTime;
  span.status = status;
  span.tags.set('duration', String(duration));

  const breadcrumb: Breadcrumb = {
    category: 'monitoring',
    message: `Span ${span.name} finished`,
    data: { type: span.type, duration, status, ...Object.fromEntries(span.tags) },
    level: status === SpanStatus.Ok ? 'info' : 'error'
  };
  Sentry.addBreadcrumb(breadcrumb);
}
```

### Error Handling

```typescript
try {
  // operation
} catch (error) {
  captureError(error, { context: 'Operation X' });
  throw new ApiError('Operation failed', 500, { cause: error });
}
```

### Monitoring Types

```typescript
interface MonitoringSpan {
  name: string;
  type: string;
  startTime: number;
  tags: Map<string, string>;
  status: SpanStatusType;
}
```

## Testing Strategy

### Test Coverage Requirements

- API endpoints
- Middleware
- Components
- Error scenarios
- Performance metrics

### Mock Implementations

```typescript
// Example mock service
export class MockService extends BaseService {
  public override async getData(): Promise<ResponseType> {
    return { /* mock data */ };
  }
}
```

### Performance Testing

- Measure cache hit times
- Track API response times
- Set performance thresholds
- Simulate load conditions

## Action Items Checklist

- [ ] Update Puck component type definitions
- [ ] Implement proper service layer types
- [ ] Configure environment variable validation
- [ ] Set up monitoring and error tracking
- [ ] Complete test coverage
- [ ] Review security headers and rate limiting
- [ ] Validate cache warming implementation
- [ ] Set up monitoring alerts

This guide consolidates our type safety improvements and deployment readiness steps. Follow these guidelines to ensure robust type safety and reliable deployment processes.
