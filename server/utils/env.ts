import { log } from '../vite';

/**
 * Ensures required environment variables are present at runtime.
 * Throws an error during startup if any are missing.
 */
export function assertEnvVars(vars: string[]): void {
  const missing = vars.filter(name => !process.env[name]);
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    log(message, 'env');
    throw new Error(message);
  }
}
