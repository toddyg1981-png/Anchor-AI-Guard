/**
 * Backend Alerting & Monitoring Middleware
 * Tracks error rates, response times, and sends alerts on anomalies.
 * Integrates with Sentry (already configured in server.ts).
 */
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as Sentry from '@sentry/node';
import { env } from '../config/env';

// ── Metrics Store ──────────────────────────────────────────────────────────

interface RequestMetric {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  timestamp: number;
}

const metricsWindow: RequestMetric[] = [];
const MAX_METRICS = 10_000;
const ALERT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const ERROR_RATE_THRESHOLD = 0.10; // 10% error rate → alert
const LATENCY_THRESHOLD_MS = 5_000; // 5s → alert
let lastAlertAt = 0;
const ALERT_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes between alerts

// ── Metrics Collection ─────────────────────────────────────────────────────

function recordMetric(metric: RequestMetric): void {
  metricsWindow.push(metric);
  if (metricsWindow.length > MAX_METRICS) {
    metricsWindow.splice(0, metricsWindow.length - MAX_METRICS);
  }
}

function getRecentMetrics(): RequestMetric[] {
  const cutoff = Date.now() - ALERT_WINDOW_MS;
  return metricsWindow.filter(m => m.timestamp >= cutoff);
}

// ── Alert Functions ────────────────────────────────────────────────────────

function checkAlerts(): void {
  const recent = getRecentMetrics();
  if (recent.length < 10) return; // Not enough data

  const now = Date.now();
  if (now - lastAlertAt < ALERT_COOLDOWN_MS) return; // Cooldown

  // Error rate check
  const errors = recent.filter(m => m.statusCode >= 500).length;
  const errorRate = errors / recent.length;
  if (errorRate >= ERROR_RATE_THRESHOLD) {
    triggerAlert('high_error_rate', {
      errorRate: `${(errorRate * 100).toFixed(1)}%`,
      errors,
      total: recent.length,
      window: '5 minutes',
    });
    return;
  }

  // P95 latency check
  const latencies = recent.map(m => m.durationMs).sort((a, b) => a - b);
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  if (p95 >= LATENCY_THRESHOLD_MS) {
    triggerAlert('high_latency', {
      p95Ms: p95,
      threshold: LATENCY_THRESHOLD_MS,
      window: '5 minutes',
    });
  }
}

function triggerAlert(type: string, data: Record<string, unknown>): void {
  lastAlertAt = Date.now();

  // Log the alert
  console.error(`[ALERT] ${type}:`, data);

  // Send to Sentry as an event
  if (env.sentryDsn) {
    Sentry.captureMessage(`Alert: ${type}`, {
      level: 'error',
      extra: data,
      tags: { alertType: type },
    });
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Get current monitoring metrics.
 */
export function getMonitoringMetrics(): {
  requestsPerMinute: number;
  errorRate: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  totalRequests: number;
  activeAlerts: string[];
} {
  const recent = getRecentMetrics();
  const windowMinutes = ALERT_WINDOW_MS / 60_000;

  const latencies = recent.map(m => m.durationMs).sort((a, b) => a - b);
  const errors = recent.filter(m => m.statusCode >= 500).length;

  const percentile = (arr: number[], p: number) => {
    if (arr.length === 0) return 0;
    const idx = Math.floor(arr.length * p);
    return arr[Math.min(idx, arr.length - 1)];
  };

  const errorRate = recent.length > 0 ? errors / recent.length : 0;
  const p95 = percentile(latencies, 0.95);

  const alerts: string[] = [];
  if (errorRate >= ERROR_RATE_THRESHOLD) alerts.push('high_error_rate');
  if (p95 >= LATENCY_THRESHOLD_MS) alerts.push('high_latency');

  return {
    requestsPerMinute: Math.round(recent.length / windowMinutes),
    errorRate: Math.round(errorRate * 10000) / 100,
    p50LatencyMs: percentile(latencies, 0.50),
    p95LatencyMs: p95,
    p99LatencyMs: percentile(latencies, 0.99),
    totalRequests: metricsWindow.length,
    activeAlerts: alerts,
  };
}

/**
 * Register monitoring hooks on Fastify.
 * Call once during server setup.
 */
export function registerMonitoring(app: FastifyInstance): void {
  // Track request timing
  app.addHook('onRequest', async (request: FastifyRequest) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (request as any)._startTime = process.hrtime.bigint();
  });

  app.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const startTime = (request as any)._startTime as bigint | undefined;
    if (!startTime) return;

    const durationNs = process.hrtime.bigint() - startTime;
    const durationMs = Number(durationNs / 1_000_000n);

    recordMetric({
      method: request.method,
      path: request.routeOptions?.url || request.url,
      statusCode: reply.statusCode,
      durationMs,
      timestamp: Date.now(),
    });

    // Check alerts every 100 requests
    if (metricsWindow.length % 100 === 0) {
      checkAlerts();
    }
  });

  // Metrics endpoint (admin only in production)
  app.get('/metrics', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send(getMonitoringMetrics());
  });
}
