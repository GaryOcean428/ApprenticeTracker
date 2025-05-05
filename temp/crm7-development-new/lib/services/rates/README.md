<!-- markdownlint-disable MD029 -->

# Rate Service

A comprehensive service for managing employee and contractor rates, with robust lifecycle hooks, caching, metrics, and compliance features.

## Features

- **Rate Template Management**: Create, update, retrieve, and delete rate templates
- **Rate Calculation**: Calculate rates with various components (base rate, loadings, allowances)
- **Award Compliance**: Validate rates against Australian awards (via FairWork service)
- **Bulk Operations**: Perform operations on multiple templates with progress tracking
- **Analytics**: Get insights on rate usage, trends, and compliance
- **Activity Tracking**: Comprehensive audit logging of all operations
- **Caching**: Performance optimization through intelligent caching
- **Rate Limiting**: Protection against abuse and overload
- **Transaction Support**: Atomic operations for data consistency
- **Monitoring**: Detailed tracing and metrics collection
- **Enhanced Error Handling**: Structured errors with context and codes

## Architecture

The service uses a modular architecture with the following components:

1. **Core Service (RateServiceImpl)**: Main entry point implementing the `RatesService` interface
2. **Rate Management Service**: Handles data access and basic operations
3. **Lifecycle Hooks**: Extension points for customizing service behavior
4. **Configuration Provider**: Centralized configuration management
5. **Activity Tracking**: Records rate-related activities for audit and analytics
6. **Transaction Manager**: Handles database transactions
7. **Rate Cache**: Improves performance by caching frequently accessed data
8. **Rate Limiter**: Controls request frequency to prevent abuse
9. **Metrics Collector**: Gathers metrics for monitoring and observability
10. **Award Rate Validator**: Validates rates against FairWork awards
11. **Monitoring Integration**: Traces operations for performance monitoring

## Usage

```typescript
import { createConfiguredRateService } from '@/lib/services/rates/config';
import { fairWorkService } from '@/lib/services/fairwork';

// Create a configured service instance
const rateService = createConfiguredRateService(fairWorkService, {
  enableMetrics: true,
  enableActivityTracking: true,
  userId: 'user-123',
  orgId: 'org-456',
  enableCaching: true,
  enableRateLimiting: true
});

// Use the service
const templates = await rateService.getTemplates({ org_id: 'org-456' });
```

## Extension Points

The service can be extended in various ways:

1. **Custom Hooks**: Add custom logic to lifecycle methods

   ```typescript
   const customHooks = {
     beforeCreate: async (template) => {
       // Custom validation or enrichment
       return { ...template, metadata: { ...template.metadata, source: 'custom' } };
     }
   };
   
   const rateService = createConfiguredRateService(fairWorkService, {
     customHooks
   });
   ```

2. **Enhanced Error Handling**: Handle specific error types

   ```typescript
   try {
     await rateService.updateRateTemplate('template-id', { name: 'New Name' });
   } catch (error) {
     if (error instanceof RateError && error.code === RateErrorCode.NOT_FOUND) {
       // Handle not found specifically
     }
   }
   ```

3. **Activity Tracking**: Access rate activities

   ```typescript
   const activities = await getRateActivities(orgId, { type: ActivityType.TEMPLATE_UPDATED });
   ```

## Database Schema

The service uses the following tables:

- `rate_templates`: Core rate template data
- `rate_template_history`: Version history of templates
- `rate_calculations`: Individual rate calculations
- `bulk_calculations`: Bulk operation records
- `rate_activities`: Activity audit logs

## Database Views

- `rate_templates_summary`: Aggregated view of templates with additional metrics
- `rate_analytics`: Analytics data for reporting and dashboards
