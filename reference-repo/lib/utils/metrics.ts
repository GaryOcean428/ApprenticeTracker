export interface MetricsService {
  recordServiceMethodDuration(
    methodName: string,
    duration: number,
    context?: Record<string, unknown>
  ): void;
}

export class NoopMetricsService implements MetricsService {
  recordServiceMethodDuration(): void {
    // No-op implementation
  }
}

export const metrics = new NoopMetricsService();
