/**
 * Logger Service
 * Provides structured logging with levels and context
 */

import { env } from '../config/env';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

class Logger {
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor() {
    this.logLevel = env.debugMode ? LogLevel.DEBUG : LogLevel.INFO;
  }

  /**
   * Set the minimum log level
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Debug log
   */
  public debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info log
   */
  public info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning log
   */
  public warn(message: unknown, context?: unknown): void {
    this.log(LogLevel.WARN, this.toMessage(message), this.toContext(context));
  }

  /**
   * Error log — accepts strings, Error objects, or unknown catch values
   */
  public error(message: unknown, context?: unknown): void {
    this.log(LogLevel.ERROR, this.toMessage(message), this.toContext(context));
  }

  /** Coerce unknown values to a log-friendly string */
  private toMessage(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.message;
    try { return String(value); } catch { return 'Unknown error'; }
  }

  /** Coerce unknown context values to Record */
  private toContext(value: unknown): Record<string, unknown> | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
    if (value instanceof Error) return { error: value.message, stack: value.stack };
    return { detail: String(value) };
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (level < this.logLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    // Store log entry
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    this.outputToConsole(entry);

    // Send to external services
    if (level >= LogLevel.ERROR) {
      this.sendToExternalServices(entry);
    }
  }

  /**
   * Output log to console
   */
  private outputToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${LogLevel[entry.level]}]`;
    const contextStr = entry.context ? `\n${JSON.stringify(entry.context, null, 2)}` : '';

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.log(`${prefix} ${entry.message}${contextStr}`);
        break;
      case LogLevel.INFO:
        console.log(`${prefix} ${entry.message}${contextStr}`);
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${entry.message}${contextStr}`);
        break;
      case LogLevel.ERROR:
        console.error(`${prefix} ${entry.message}${contextStr}`);
        break;
    }
  }

  /**
   * Send logs to external services
   */
  private sendToExternalServices(entry: LogEntry): void {
    if (env.gaId && typeof window !== 'undefined') {
      // Analytics integration — implement when analytics SDK is added
      void entry;
    }
  }

  /**
   * Get recent logs
   */
  public getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Performance timing utility
   */
  public time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.info(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (message: string, context?: Record<string, unknown>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, unknown>) => logger.info(message, context),
  warn: (message: unknown, context?: unknown) => logger.warn(message, context),
  error: (message: unknown, context?: unknown) => logger.error(message, context),
  time: (label: string) => logger.time(label),
};
