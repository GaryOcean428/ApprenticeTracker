# Monitoring Service Type Fix Plan

This document outlines the required changes across the monitoring service files to eliminate transaction-related code, resolve Sentry type issues, and update span tracking with proper types. Please follow the steps below:

---

## 1. Remove Transaction-Related Code

• In lib/monitoring/index.ts:
  - Review and remove any code blocks that reference transaction functionality (e.g. variables, functions, or comments that indicate transaction handling).  
  - Ensure that any functionality that creates or manipulates transactions (e.g. Sentry.startTransaction or transaction context) is removed, leaving only span tracking based on our MonitoringSpan interface.

• In lib/monitoring/types.ts:
  - Remove (or deprecate) interfaces and types specifically for transactions (e.g. SentryTransaction, TransactionContext).  
  - Retain the MonitoringSpan and SpanStatus types as they are used for span tracking.

---

## 2. Fix Sentry Type Issues

• In files using Sentry (lib/monitoring/index.ts, sentry.client.config.ts, sentry.server.config.ts):
  - Use type-only imports for Sentry types. For example, replace:
    • import * as Sentry from '@sentry/nextjs';
  with additional type-only imports if needed (e.g. “import type { Integration } from '@sentry/nextjs'”).
  
• Remove any explicit transaction-related Sentry type references or adjust them to match the updated transaction-free model.

• Ensure that methods such as Sentry.captureException and Sentry.addBreadcrumb are passed the correct error types and data objects without unnecessary type assertions.

---

## 3. Update Span Tracking with Proper Types

• In lib/monitoring/index.ts:
  - Update the startSpan function signature. Ensure it returns a MonitoringSpan (from our types) with explicit field types:
    • Example:
      function startSpan(name: string, type: string, data?: Record<string, unknown>): MonitoringSpan {
          const span: MonitoringSpan = {
            name,
            type,
            startTime: Date.now(),
            tags: new Map(),
            status: SpanStatus.Ok,
          };
          // Optionally add provided data as tags
          if (data) {
            Object.entries(data).forEach(([key, value]) => {
              span.tags.set(key, String(value));
            });
          }
          return span;
      }

  - Update the finishSpan function to:
    • Calculate the duration with Date.now() (or keep it consistent with startSpan if you decide to use performance.now() across both files).
    • Update the status and tags, ensuring that the breadcrumb data built from Object.fromEntries(span.tags) is correctly passed to Sentry.addBreadcrumb.
    • Provide an explicit return type (void).

• In lib/monitoring/performance.ts:
  - Ensure that startPerformanceSpan and finishPerformanceSpan use similar explicit types (e.g. return and parameter types of PerformanceSpan defined in this file).
  - Update the type of “status” in finishPerformanceSpan to use the SpanStatus enum from our imported types.
  - Use explicit types for error metadata conversions and status when calling finishPerformanceSpan.

---

## 4. Preserve Error Tracking Functionality

• In lib/error-tracking.ts:
  - Confirm that the error tracking logic (e.g. trackError, getUserFriendlyMessage, and sendToErrorService) continues to work without transaction code.
  - Validate that Sentry.init in this file matches the revised Sentry type usage (if any adjustments are needed based on the removals in the monitoring files).

---

## 5. Testing and Backward Compatibility

• After making all changes:
  - Run the full test suite to verify no type errors or breaking behavior.
  - Check that both client and server Sentry initializations (in sentry.client.config.ts, sentry.server.config.ts, and sentry.edge.config.ts) function correctly.
  - Verify that span tracking and breadcrumb reporting remain intact during runtime.

---

## Pseudocode Summary of Changes

// In lib/monitoring/index.ts
// Remove any transaction-related code
// Update startSpan:
function startSpan(name: string, type: string, data?: Record<string, unknown>): MonitoringSpan {
  const span: MonitoringSpan = {
    name,
    type,
    startTime: Date.now(), // or performance.now() if using that consistently
    tags: new Map(),
    status: SpanStatus.Ok,
  };

  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      span.tags.set(key, String(value));
    });
  }

  return span;
}

// Update finishSpan:
function finishSpan(span: MonitoringSpan, status: SpanStatusType = SpanStatus.Ok, data?: Record<string, unknown>): void {
  const duration = Date.now() - span.startTime;
  span.status = status;
  span.tags.set('duration', String(duration));
  
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      span.tags.set(key, String(value));
    });
  }
  
  Sentry.addBreadcrumb({
    category: 'monitoring',
    message: `Span ${span.name} finished`,
    data: {
      type: span.type,
      duration,
      status,
      ...Object.fromEntries(span.tags),
    },
  });
}

// In lib/monitoring/types.ts
// Remove the following (or mark as deprecated):
//   interface SentryTransaction { ... }
//   type TransactionContext = ... 
// Retain:
//   interface MonitoringSpan { name: string; type: string; startTime: number; tags: Map<string, string>; status: SpanStatusType; }
//   const SpanStatus = { ... }  

---

Following this plan will address the type issues present in the monitoring service, align Sentry integrations with proper typings, and ensure the span tracking logic is robust. All changes should be reviewed and tested to maintain backward compatibility and ensure error tracking remains effective.
