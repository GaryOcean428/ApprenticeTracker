# Performance Optimization Guidelines

## Overview

This document outlines techniques and best practices to ensure the Braden Group CRM7 platform maintains optimal performance while handling large datasets and complex operations.

## Frontend Performance

### 1. Virtualization for Large Lists

We've implemented virtualization for efficiently rendering large lists:

```typescript
// Usage example of our VirtualizedList component
<VirtualizedList
  items={apprentices}
  height={600}
  rowHeight={60}
  overscan={5}
  renderItem={(apprentice, index) => (
    <ApprenticeListItem 
      key={apprentice.id}
      apprentice={apprentice}
      isAlternate={index % 2 === 1}
    />
  )}
/>
```

Implementation details:
- Only renders items currently visible in the viewport
- Maintains a small buffer of items above and below (overscan)
- Significantly reduces DOM nodes for lists with hundreds/thousands of items
- Improves scrolling performance and reduces memory usage

### 2. Bundle Optimization

#### Code Splitting

Implement code splitting to reduce initial bundle size:

```typescript
// In routing configuration
import { lazy, Suspense } from 'react';

// Lazy-loaded components
const ApprenticeDetails = lazy(() => import('./pages/apprentices/ApprenticeDetails'));
const HostEmployerDetails = lazy(() => import('./pages/hosts/HostEmployerDetails'));

// In router
<Suspense fallback={<Skeleton />}>
  <Route path="/apprentice/:id" component={ApprenticeDetails} />
</Suspense>
```

#### Tree Shaking

Ensure proper tree shaking by:
- Using ES modules syntax
- Avoiding side effects in imports
- Properly configuring build tools

### 3. Memoization

Use memoization for expensive calculations and to prevent unnecessary re-renders:

```typescript
// Memoize expensive calculations
const filteredApprentices = useMemo(() => {
  return apprentices.filter(a => {
    return a.status === selectedStatus && 
           a.trade.includes(searchTerm) &&
           (!selectedLocation || a.location === selectedLocation);
  }).sort((a, b) => a.lastName.localeCompare(b.lastName));
}, [apprentices, selectedStatus, searchTerm, selectedLocation]);

// Memoize callback functions
const handleStatusChange = useCallback((status: string) => {
  setSelectedStatus(status);
  logUserAction('filter_status_changed', { status });
}, [logUserAction]);
```

### 4. Debouncing and Throttling

Apply debouncing and throttling to limit the frequency of expensive operations:

```typescript
// For search inputs, filtering, etc.
const debouncedSearch = useMemo(() => {
  return debounce((term: string) => {
    setSearchTerm(term);
  }, 300);
}, []);

// For scroll events, window resizing, etc.
const throttledResize = useMemo(() => {
  return throttle(() => {
    recalculateLayout();
  }, 100);
}, [recalculateLayout]);

// Clean up on unmount
useEffect(() => {
  return () => {
    debouncedSearch.cancel();
    throttledResize.cancel();
  };
}, [debouncedSearch, throttledResize]);
```

### 5. Optimizing React Components

- Avoid unnecessary re-renders
- Use React.memo() for pure components
- Keep component state as local as possible
- Avoid anonymous functions in render methods

```typescript
// Good component optimization
const ApprenticeCard = React.memo(({ apprentice, onSelect }: ApprenticeCardProps) => {
  // Component implementation
});
```

## Backend Performance

### 1. Efficient Database Queries

#### Query Optimization

- Use specific column selection instead of SELECT *
- Apply proper indexing on frequently searched fields
- Write efficient JOIN operations
- Use pagination for large result sets

```typescript
// Good database query example
async function getApprenticesByStatus(status: string, page: number, limit: number) {
  return await db
    .select({
      id: apprentices.id,
      firstName: apprentices.firstName,
      lastName: apprentices.lastName,
      email: apprentices.email,
      trade: apprentices.trade,
      status: apprentices.status,
      // Only select needed fields
    })
    .from(apprentices)
    .where(eq(apprentices.status, status))
    .orderBy(apprentices.lastName)
    .limit(limit)
    .offset((page - 1) * limit);
}
```

#### Indexing Strategy

Ensure appropriate indexes on:
- Primary keys (automatically indexed)
- Foreign keys
- Frequently filtered fields (status, organization_id, etc.)
- Sort fields in ORDER BY clauses

```typescript
// Proper indexing in schema definition
export const apprentices = pgTable(
  'apprentices',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    status: varchar('status', { length: 50 }).notNull().default('active'),
    organizationId: integer('organization_id').references(() => organizations.id),
    // other fields
  },
  (table) => ({
    statusIdx: index('apprentice_status_idx').on(table.status),
    orgIdx: index('apprentice_org_idx').on(table.organizationId),
    nameIdx: index('apprentice_name_idx').on(table.lastName, table.firstName),
  })
);
```

### 2. Caching Strategies

#### Server-Side Caching

Implement caching for expensive operations and frequently accessed data:

```typescript
// Example with a simple in-memory cache with TTL
const cache = new Map<string, { data: any; expires: number }>();

async function getCachedData(key: string, ttlMs: number, fetchFn: () => Promise<any>) {
  const now = Date.now();
  const cached = cache.get(key);
  
  if (cached && cached.expires > now) {
    return cached.data;
  }
  
  const data = await fetchFn();
  cache.set(key, { data, expires: now + ttlMs });
  return data;
}

// Usage
async function getAwardRates(awardCode: string) {
  return getCachedData(
    `award_rates_${awardCode}`,
    1000 * 60 * 60, // 1 hour TTL
    () => db.select().from(payRates).where(eq(payRates.awardCode, awardCode))
  );
}
```

#### Query Result Caching

Leverage React Query's built-in caching:

```typescript
// Client-side query caching
const { data, isLoading } = useQuery({
  queryKey: ['apprentices', status, page],
  queryFn: () => fetchApprentices(status, page),
  staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  cacheTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes
});
```

### 3. API Optimization

#### Pagination

Implement pagination for all list endpoints:

```typescript
// Pagination in API endpoint
app.get('/api/apprentices', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;
  
  try {
    const [data, total] = await Promise.all([
      getApprenticesByStatus(status, page, limit),
      getApprenticesCount(status)
    ]);
    
    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch apprentices' });
  }
});
```

#### Response Compression

Enable compression for API responses:

```typescript
// In server setup
import compression from 'compression';

app.use(compression());
```

#### Efficient Data Formats

- Only send required fields to the client
- Use pagination metadata consistently
- Consider using smaller data formats for specialized endpoints

### 4. Background Processing

Move heavy operations to background tasks:

```typescript
// Example for report generation
async function generateLargeReport(params: ReportParams) {
  // Create a report job
  const reportJob = await db.insert(reportJobs).values({
    status: 'processing',
    params: params,
    userId: params.userId,
    createdAt: new Date()
  }).returning().execute();
  
  // Process in background
  processReportInBackground(reportJob[0].id, params).catch(error => {
    console.error('Report generation failed:', error);
    updateReportJobStatus(reportJob[0].id, 'failed', { error: error.message });
  });
  
  return reportJob[0];
}

// Client can poll for status
app.get('/api/reports/:id/status', async (req, res) => {
  const reportId = parseInt(req.params.id);
  const report = await getReportStatus(reportId);
  res.json(report);
});
```

## Monitoring and Analysis

### 1. Performance Metrics

Key metrics to monitor:

- Page load time
- Time to interactive
- API response times
- Database query performance
- Memory usage
- Bundle size

### 2. Tools and Services

- Browser DevTools for frontend performance
- React DevTools for component profiling
- Database query analyzers
- Logging and monitoring services

### 3. Continuous Improvement

- Regularly analyze performance metrics
- Identify bottlenecks through profiling
- Set performance budgets for critical paths
- Address performance issues promptly

## Mobile Optimization

### 1. Responsive Design

- Use responsive design patterns
- Test on various device sizes
- Optimize image loading for mobile

### 2. Touch Interactions

- Ensure touch targets are appropriately sized
- Implement appropriate feedback for touch events
- Optimize for mobile gestures where appropriate

## Best Practices Summary

1. **Virtualize large lists** to reduce DOM nodes and improve scroll performance
2. **Split code** by routes and features to reduce initial load time
3. **Optimize database queries** with proper indexing and specific column selection
4. **Implement caching** at various levels (API, database, client)
5. **Use pagination** for all list endpoints
6. **Debounce user inputs** to reduce unnecessary processing
7. **Memoize expensive calculations** to avoid redundant work
8. **Move heavy operations** to background tasks
9. **Monitor performance metrics** to identify bottlenecks
10. **Continuously review and optimize** critical paths