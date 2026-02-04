/**
 * Centralized Error Handler
 * Provides consistent error handling, logging, and user-friendly error messages
 */

import { env } from '../config/env';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorDetails {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  context?: Record<string, unknown>;
  stack?: string;
  timestamp: string;
  userId?: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON(): ErrorDetails {
    return {
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: this.context,
      stack: this.stack,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Predefined error types for common scenarios
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed', context?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', ErrorSeverity.MEDIUM, context);
    this.name = 'NetworkError';
  }
}

export class APIError extends AppError {
  constructor(
    message: string = 'API request failed',
    statusCode?: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'API_ERROR', ErrorSeverity.MEDIUM, { ...context, statusCode });
    this.name = 'APIError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', ErrorSeverity.LOW, context);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', ErrorSeverity.HIGH, context);
    this.name = 'AuthenticationError';
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string = 'Configuration error', context?: Record<string, unknown>) {
    super(message, 'CONFIG_ERROR', ErrorSeverity.CRITICAL, context);
    this.name = 'ConfigurationError';
  }
}

/**
 * Error Handler Class
 */
class ErrorHandler {
  private errorListeners: Array<(error: ErrorDetails) => void> = [];

  /**
   * Register an error listener
   */
  public addListener(listener: (error: ErrorDetails) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Remove an error listener
   */
  public removeListener(listener: (error: ErrorDetails) => void): void {
    this.errorListeners = this.errorListeners.filter((l) => l !== listener);
  }

  /**
   * Handle an error
   */
  public handle(error: Error | AppError, context?: Record<string, unknown>): void {
    const errorDetails = this.normalizeError(error, context);

    // Log to console in development
    if (env.debugMode) {
      console.error('Error handled:', errorDetails);
    }

    // Notify listeners
    this.errorListeners.forEach((listener) => {
      try {
        listener(errorDetails);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });

    // Send to external error tracking (Sentry, LogRocket, etc.)
    this.reportToExternalServices(errorDetails);
  }

  /**
   * Convert any error to ErrorDetails
   */
  private normalizeError(error: Error | AppError, context?: Record<string, unknown>): ErrorDetails {
    if (error instanceof AppError) {
      return {
        ...error.toJSON(),
        context: { ...error.context, ...context },
      };
    }

    return {
      message: error.message || 'An unknown error occurred',
      code: 'UNHANDLED_ERROR',
      severity: ErrorSeverity.MEDIUM,
      context,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Report error to external services
   */
  private reportToExternalServices(error: ErrorDetails): void {
    // Integration with Sentry
    if (env.sentryDsn && typeof window !== 'undefined') {
      // Sentry.captureException would go here
      console.log('Would send to Sentry:', error);
    }

    // Integration with LogRocket
    if (env.logRocketId && typeof window !== 'undefined') {
      // LogRocket.captureException would go here
      console.log('Would send to LogRocket:', error);
    }

    // Custom analytics
    this.sendToAnalytics(error);
  }

  /**
   * Send error metrics to analytics
   */
  private sendToAnalytics(error: ErrorDetails): void {
    if (env.gaId && typeof window !== 'undefined') {
      // Google Analytics event tracking
      console.log('Would send to GA:', {
        event: 'error',
        error_code: error.code,
        error_severity: error.severity,
      });
    }
  }

  /**
   * Get user-friendly error message
   */
  public getUserMessage(error: Error | AppError): string {
    if (error instanceof AppError) {
      return error.message;
    }

    // Generic messages for different error types
    if (error.message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    if (error.message.includes('timeout')) {
      return 'The request took too long to complete. Please try again.';
    }

    return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

/**
 * Global error handlers
 */
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handle(
      new AppError(
        event.reason?.message || 'Unhandled promise rejection',
        'UNHANDLED_REJECTION',
        ErrorSeverity.HIGH
      )
    );
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    errorHandler.handle(
      new AppError(event.message || 'Global error', 'GLOBAL_ERROR', ErrorSeverity.HIGH, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    );
  });
}
