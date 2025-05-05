import { ManagementClient } from 'auth0';
import { logger } from '@/lib/logger';

/**
 * Creates an Auth0 Management API client.
 * This client is used for server-side operations like:
 * - Managing users
 * - Managing roles and permissions
 * - Managing organizations
 */
export const createManagementClient = (): ManagementClient => {
  if (!process.env.AUTH0_ADMIN_API_KEY || !process.env.AUTH0_API_TOKEN) {
    throw new Error('Missing required Auth0 environment variables');
  }

  try {
    return new ManagementClient({
      domain: 'dev-rkchrceel6xwqe2g.us.auth0.com',
      token: process.env.AUTH0_API_TOKEN,
    });
  } catch (error: unknown) {
    logger.error('Failed to create Auth0 Management client', { error });
    throw error;
  }
};

/**
 * Auth0 API endpoints for client-side operations.
 * These endpoints are protected by the Auth0 middleware.
 */
export const AUTH0_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  CALLBACK: '/api/auth/callback',
  ME: '/api/auth/me',
} as const;

/**
 * Auth0 configuration for the application.
 * These values are used by the Auth0 SDK.
 */
export const AUTH0_CONFIG = {
  baseURL: process.env.AUTH0_BASE_URL ?? 'http://localhost:4200',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL ?? 'https://dev-rkchrceel6xwqe2g.us.auth0.com',
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  routes: {
    callback: AUTH0_ENDPOINTS.CALLBACK,
    postLogoutRedirect: '/',
  },
  session: {
    absoluteDuration: 24 * 60 * 60, // 24 hours
    rolling: true,
    rollingDuration: 1 * 60 * 60, // 1 hour
  },
} as const;
