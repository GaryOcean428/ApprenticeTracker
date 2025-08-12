declare module 'node-cron' {
  namespace cron {
    interface ScheduledTask {
      start: () => void;
      stop: () => void;
    }

    export function schedule(
      expression: string,
      func: () => void,
      options?: {
        scheduled?: boolean;
        timezone?: string;
      }
    ): ScheduledTask;

    export function validate(expression: string): boolean;
  }

  export = cron;
}
