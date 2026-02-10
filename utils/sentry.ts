/**
 * Sentry Frontend Monitoring
 * Initializes error tracking, performance monitoring, and session replay.
 * Set VITE_SENTRY_DSN in your environment to enable.
 */
import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

/**
 * Initialize Sentry. Call once at app startup (before React renders).
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    if (APP_ENV === 'development') {
      // Silent in dev — no DSN means no tracking
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENV,
    release: `anchor-ai-guard@${APP_VERSION}`,

    // Performance Monitoring
    tracesSampleRate: APP_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay (capture 1% of sessions, 100% on error)
    replaysSessionSampleRate: APP_ENV === 'production' ? 0.01 : 0,
    replaysOnErrorSampleRate: APP_ENV === 'production' ? 1.0 : 0,

    // Filter out noisy errors
    ignoreErrors: [
      // Browser extensions
      'chrome-extension://',
      'moz-extension://',
      // ResizeObserver noise
      'ResizeObserver loop',
      // Network errors (handled by our error handler)
      'Failed to fetch',
      'NetworkError',
      'Load failed',
      // AbortController
      'AbortError',
      // React dev overlay
      'ChunkLoadError',
    ],

    // Don't send PII
    beforeSend(event) {
      // Strip sensitive data from URLs
      if (event.request?.url) {
        const url = new URL(event.request.url);
        url.searchParams.delete('token');
        url.searchParams.delete('key');
        url.searchParams.delete('secret');
        event.request.url = url.toString();
      }

      // Strip auth headers
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }

      return event;
    },
  });
}

/**
 * Set the current user context for Sentry.
 * Call after login.
 */
export function setSentryUser(user: { id: string; email?: string; orgId?: string }): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    // Custom data
    orgId: user.orgId,
  } as Sentry.User & { orgId?: string });
}

/**
 * Clear user context. Call on logout.
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * Capture an exception manually.
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (!SENTRY_DSN) return;
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a breadcrumb for debugging context.
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info'
): void {
  if (!SENTRY_DSN) return;
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
  });
}

/**
 * Sentry ErrorBoundary component for React.
 * Wrap your app or sections to catch rendering errors.
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Re-export for convenience
export { Sentry };
