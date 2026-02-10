/**
 * Uptime & Health Check Monitor
 * Periodically pings the backend health endpoint and tracks availability.
 * Shows status in the admin dashboard.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const HEALTH_URL = API_BASE.replace(/\/api$/, '/health');

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface UptimeStats {
  current: HealthStatus;
  uptime24h: number; // percentage
  avgLatencyMs: number;
  checks: HealthStatus[];
  lastDownAt?: string;
}

const MAX_HISTORY = 120; // ~2 hours at 1min intervals
const checkHistory: HealthStatus[] = [];
let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Perform a single health check against the backend.
 */
export async function checkHealth(): Promise<HealthStatus> {
  const start = performance.now();
  try {
    const response = await fetch(HEALTH_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(10_000),
    });
    const latencyMs = Math.round(performance.now() - start);

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      const status: HealthStatus = {
        status: latencyMs > 5000 ? 'degraded' : 'healthy',
        latencyMs,
        timestamp: new Date().toISOString(),
        details: data,
      };
      recordCheck(status);
      return status;
    }

    const status: HealthStatus = {
      status: 'degraded',
      latencyMs,
      timestamp: new Date().toISOString(),
      details: { httpStatus: response.status },
    };
    recordCheck(status);
    return status;
  } catch {
    const status: HealthStatus = {
      status: 'down',
      latencyMs: Math.round(performance.now() - start),
      timestamp: new Date().toISOString(),
    };
    recordCheck(status);
    return status;
  }
}

function recordCheck(status: HealthStatus): void {
  checkHistory.push(status);
  if (checkHistory.length > MAX_HISTORY) {
    checkHistory.shift();
  }
}

/**
 * Get uptime statistics from collected health checks.
 */
export function getUptimeStats(): UptimeStats {
  const current = checkHistory.length > 0
    ? checkHistory[checkHistory.length - 1]
    : { status: 'down' as const, latencyMs: 0, timestamp: new Date().toISOString() };

  const totalChecks = checkHistory.length;
  const healthyChecks = checkHistory.filter(c => c.status === 'healthy').length;
  const uptime24h = totalChecks > 0 ? Math.round((healthyChecks / totalChecks) * 10000) / 100 : 0;
  const avgLatencyMs = totalChecks > 0
    ? Math.round(checkHistory.reduce((sum, c) => sum + c.latencyMs, 0) / totalChecks)
    : 0;

  const lastDown = [...checkHistory].reverse().find(c => c.status === 'down');

  return {
    current,
    uptime24h,
    avgLatencyMs,
    checks: checkHistory.slice(-30), // last 30 checks for sparkline
    lastDownAt: lastDown?.timestamp,
  };
}

/**
 * Start periodic health checks (every 60s by default).
 */
export function startUptimeMonitor(intervalMs = 60_000): void {
  if (intervalId) return; // Already running
  // Do an immediate check
  checkHealth();
  intervalId = setInterval(() => checkHealth(), intervalMs);
}

/**
 * Stop periodic health checks.
 */
export function stopUptimeMonitor(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
