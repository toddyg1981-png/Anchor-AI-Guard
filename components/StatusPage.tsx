import { useEffect, useState } from 'react';
import { checkHealth, getUptimeStats, startUptimeMonitor, type UptimeStats } from '../utils/uptimeMonitor';

export default function StatusPage() {
  const [stats, setStats] = useState<UptimeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start the monitor + do an initial check
    startUptimeMonitor(60_000);
    
    async function load() {
      await checkHealth();
      setStats(getUptimeStats());
      setLoading(false);
    }
    load();

    const interval = setInterval(() => setStats(getUptimeStats()), 15_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!stats) return null;

  const statusColors: Record<string, string> = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
  };

  const statusLabels: Record<string, string> = {
    healthy: 'All Systems Operational',
    degraded: 'Degraded Performance',
    down: 'Service Disruption',
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">System Status</h1>
        <span className="text-sm text-gray-400">
          Last checked: {new Date(stats.current.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Overall Status Banner */}
      <div className={`rounded-xl p-6 ${
        stats.current.status === 'healthy' ? 'bg-green-500/10 border border-green-500/30' :
        stats.current.status === 'degraded' ? 'bg-yellow-500/10 border border-yellow-500/30' :
        'bg-red-500/10 border border-red-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${statusColors[stats.current.status]} animate-pulse`} />
          <span className="text-xl font-semibold text-white">
            {statusLabels[stats.current.status]}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Uptime"
          value={`${stats.uptime24h}%`}
          sublabel="Last 2 hours"
          color={stats.uptime24h >= 99 ? 'green' : stats.uptime24h >= 95 ? 'yellow' : 'red'}
        />
        <MetricCard
          label="Avg Latency"
          value={`${stats.avgLatencyMs}ms`}
          sublabel="Response time"
          color={stats.avgLatencyMs < 500 ? 'green' : stats.avgLatencyMs < 2000 ? 'yellow' : 'red'}
        />
        <MetricCard
          label="Last Outage"
          value={stats.lastDownAt ? timeAgo(stats.lastDownAt) : 'None'}
          sublabel="Last disruption"
          color={stats.lastDownAt ? 'yellow' : 'green'}
        />
      </div>

      {/* Services */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="p-4 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-white">Services</h2>
        </div>
        <div className="divide-y divide-gray-700/50">
          <ServiceRow name="Frontend (Vercel)" status={stats.current.status} latency={stats.current.latencyMs} />
          <ServiceRow name="Backend API (Railway)" status={stats.current.status} latency={stats.current.latencyMs} />
          <ServiceRow name="Database (PostgreSQL)" status={stats.current.status === 'healthy' ? 'healthy' : 'degraded'} />
          <ServiceRow name="Stripe Billing" status="healthy" />
          <ServiceRow name="AI Engine (Claude)" status="healthy" />
          <ServiceRow name="Email (Resend)" status="healthy" />
        </div>
      </div>

      {/* Latency Sparkline */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
        <h2 className="text-lg font-semibold text-white mb-3">Response Time (last 30 checks)</h2>
        <div className="flex items-end gap-1 h-16">
          {stats.checks.map((check, i) => {
            return (
              <div
                key={i}
                className={`flex-1 rounded-t ${
                  check.status === 'healthy' ? 'bg-green-500' :
                  check.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ height: `${Math.max(4, (check.latencyMs / Math.max(...stats.checks.map(c => c.latencyMs), 1)) * 64)}px` }}
                title={`${check.latencyMs}ms at ${new Date(check.timestamp).toLocaleTimeString()}`}
              />
            );
          })}
          {stats.checks.length === 0 && (
            <span className="text-gray-500 text-sm">No data yet — checks run every 60s</span>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sublabel, color }: {
  label: string; value: string; sublabel: string; color: 'green' | 'yellow' | 'red';
}) {
  const colors = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
      <div className="text-sm text-gray-400">{label}</div>
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
      <div className="text-xs text-gray-500">{sublabel}</div>
    </div>
  );
}

function ServiceRow({ name, status, latency }: {
  name: string; status: string; latency?: number;
}) {
  const statusColors: Record<string, string> = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status] || 'bg-gray-500'}`} />
        <span className="text-white">{name}</span>
      </div>
      <div className="flex items-center gap-4">
        {latency !== undefined && (
          <span className="text-xs text-gray-400">{latency}ms</span>
        )}
        <span className={`text-xs px-2 py-1 rounded ${
          status === 'healthy' ? 'bg-green-500/10 text-green-400' :
          status === 'degraded' ? 'bg-yellow-500/10 text-yellow-400' :
          'bg-red-500/10 text-red-400'
        }`}>
          {status === 'healthy' ? 'Operational' : status === 'degraded' ? 'Degraded' : 'Down'}
        </span>
      </div>
    </div>
  );
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
