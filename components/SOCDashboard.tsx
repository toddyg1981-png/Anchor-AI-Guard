import React, { useState, useEffect } from 'react';

// ============================================================================
// SECURITY OPERATIONS CENTER (SOC) - 24/7 MONITORING
// ============================================================================
// The nerve center for all Anchor security - combining all monitoring into one view
// Glass-table style incident management and threat intelligence
// ============================================================================

interface SecurityEvent {
  id: string;
  timestamp: string;
  category: 'attack' | 'anomaly' | 'compliance' | 'system' | 'intel';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  source: string;
  title: string;
  description: string;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved';
  assignee?: string;
}

interface ThreatIntel {
  id: string;
  name: string;
  type: 'APT' | 'Ransomware' | 'Phishing' | 'DDoS' | 'Malware';
  relevance: 'targeting_us' | 'industry' | 'general';
  lastUpdated: string;
  iocs: number;
}

interface SystemHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  latency: number;
  uptime: number;
  lastCheck: string;
}

export const SOCDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alertSound, setAlertSound] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Security events
  const [events, setEvents] = useState<SecurityEvent[]>([
    { id: 'evt-1', timestamp: '2026-02-04T11:59:30Z', category: 'attack', severity: 'high', source: 'WAF', title: 'SQL Injection Blocked', description: 'Attempted SQL injection on /api/users from 185.234.72.15', status: 'resolved', assignee: 'Auto' },
    { id: 'evt-2', timestamp: '2026-02-04T11:58:00Z', category: 'anomaly', severity: 'medium', source: 'UEBA', title: 'Unusual Login Time', description: 'Service account logged in outside business hours', status: 'investigating' },
    { id: 'evt-3', timestamp: '2026-02-04T11:55:00Z', category: 'intel', severity: 'info', source: 'ThreatFeed', title: 'New IOCs Published', description: 'ACSC published 45 new IOCs for LockBit 3.0', status: 'acknowledged' },
    { id: 'evt-4', timestamp: '2026-02-04T11:50:00Z', category: 'system', severity: 'low', source: 'Monitor', title: 'Certificate Expiry Warning', description: 'SSL certificate expires in 45 days', status: 'new' },
    { id: 'evt-5', timestamp: '2026-02-04T11:45:00Z', category: 'compliance', severity: 'medium', source: 'Compliance', title: 'Essential Eight Gap', description: 'Maturity Level 3 gap detected in patching', status: 'investigating' }
  ]);

  // Threat intelligence
  const threatIntel: ThreatIntel[] = [
    { id: 't1', name: 'LockBit 3.0', type: 'Ransomware', relevance: 'industry', lastUpdated: '2026-02-04', iocs: 156 },
    { id: 't2', name: 'APT29', type: 'APT', relevance: 'general', lastUpdated: '2026-02-03', iocs: 89 },
    { id: 't3', name: 'AsyncRAT', type: 'Malware', relevance: 'industry', lastUpdated: '2026-02-04', iocs: 234 },
    { id: 't4', name: 'Emotet', type: 'Malware', relevance: 'general', lastUpdated: '2026-02-02', iocs: 567 }
  ];

  // System health
  const systemHealth: SystemHealth[] = [
    { name: 'Anchor API', status: 'healthy', latency: 45, uptime: 99.99, lastCheck: '2026-02-04T11:59:00Z' },
    { name: 'Database', status: 'healthy', latency: 12, uptime: 99.99, lastCheck: '2026-02-04T11:59:00Z' },
    { name: 'Auth Service', status: 'healthy', latency: 23, uptime: 99.99, lastCheck: '2026-02-04T11:59:00Z' },
    { name: 'Scanner Engine', status: 'healthy', latency: 156, uptime: 99.95, lastCheck: '2026-02-04T11:59:00Z' },
    { name: 'AI Service', status: 'healthy', latency: 234, uptime: 99.90, lastCheck: '2026-02-04T11:59:00Z' },
    { name: 'CDN', status: 'healthy', latency: 8, uptime: 99.99, lastCheck: '2026-02-04T11:59:00Z' }
  ];

  // Real-time metrics
  const metrics = {
    requestsPerSecond: 847,
    blockedThreats: 12456,
    activeConnections: 234,
    dataProcessed: '4.5 TB',
    alertsToday: 23,
    meanTimeToDetect: '< 1 min',
    meanTimeToRespond: '< 5 min'
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attack': return '⚔️';
      case 'anomaly': return '📊';
      case 'compliance': return '📋';
      case 'system': return '⚙️';
      case 'intel': return '🔍';
      default: return '📌';
    }
  };

  const criticalCount = events.filter(e => e.severity === 'critical' && e.status !== 'resolved').length;
  const highCount = events.filter(e => e.severity === 'high' && e.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-[#050508] text-white p-4">
      {/* SOC Header - Always visible */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-cyan-500/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🛡️</span>
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">ANCHOR SOC</h1>
              <p className="text-xs text-gray-500">Security Operations Center</p>
            </div>
          </div>
          <div className="ml-8 px-4 py-2 bg-green-500/10 border border-green-500 rounded-lg animate-pulse">
            <span className="text-green-400 font-mono">● OPERATIONAL</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Alert Summary */}
          <div className="flex items-center gap-4">
            {criticalCount > 0 && (
              <div className="px-3 py-1 bg-red-500/20 border border-red-500 rounded animate-pulse">
                <span className="text-red-400 font-bold">{criticalCount} CRITICAL</span>
              </div>
            )}
            {highCount > 0 && (
              <div className="px-3 py-1 bg-orange-500/20 border border-orange-500 rounded">
                <span className="text-orange-400 font-bold">{highCount} HIGH</span>
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setAlertSound(!alertSound)}
            className={`p-2 rounded ${alertSound ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}
          >
            {alertSound ? '🔔' : '🔕'}
          </button>

          {/* Clock */}
          <div className="text-right">
            <div className="font-mono text-2xl text-cyan-400">{currentTime.toLocaleTimeString()}</div>
            <div className="text-xs text-gray-500">{currentTime.toLocaleDateString()} AEST</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - Event Feed */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="bg-gray-900/80 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-cyan-400">📡 Live Event Feed</h2>
              <span className="text-xs text-gray-500">{events.length} events</span>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {events.map((event, idx) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event.id === selectedEvent ? null : event.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    idx === 0 ? 'border-cyan-500/50 bg-cyan-500/5' :
                    event.id === selectedEvent ? 'border-cyan-500 bg-cyan-500/10' :
                    'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span>{getCategoryIcon(event.category)}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${getSeverityColor(event.severity)}`}>
                        {event.severity.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{event.source}</div>
                  </div>
                  {event.id === selectedEvent && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">{event.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${
                          event.status === 'resolved' ? 'text-green-400' :
                          event.status === 'investigating' ? 'text-yellow-400' : 'text-gray-400'
                        }`}>
                          Status: {event.status}
                        </span>
                        {event.status !== 'resolved' && (
                          <button className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs">
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Key Metrics */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Real-time Metrics */}
          <div className="bg-gray-900/80 border border-cyan-500/30 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">📊 Real-time Metrics</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-black/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-cyan-400">{metrics.requestsPerSecond}</div>
                <div className="text-xs text-gray-500">Requests/sec</div>
              </div>
              <div className="p-3 bg-black/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">{metrics.blockedThreats.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Blocked Today</div>
              </div>
              <div className="p-3 bg-black/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">{metrics.activeConnections}</div>
                <div className="text-xs text-gray-500">Active Connections</div>
              </div>
              <div className="p-3 bg-black/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400">{metrics.dataProcessed}</div>
                <div className="text-xs text-gray-500">Data Processed</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg text-center">
                <div className="text-lg font-bold text-green-400">{metrics.meanTimeToDetect}</div>
                <div className="text-xs text-gray-500">MTTD</div>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg text-center">
                <div className="text-lg font-bold text-green-400">{metrics.meanTimeToRespond}</div>
                <div className="text-xs text-gray-500">MTTR</div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-gray-900/80 border border-cyan-500/30 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">💚 System Health</h2>
            <div className="space-y-2">
              {systemHealth.map((system, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-black/30 rounded">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      system.status === 'healthy' ? 'bg-green-400' :
                      system.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></span>
                    <span className="text-sm">{system.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-500">{system.latency}ms</span>
                    <span className={getStatusColor(system.status)}>{system.uptime}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Threat Intel */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="bg-gray-900/80 border border-cyan-500/30 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">🔍 Active Threat Intel</h2>
            <div className="space-y-3">
              {threatIntel.map(threat => (
                <div key={threat.id} className={`p-3 rounded-lg border ${
                  threat.relevance === 'targeting_us' ? 'border-red-500 bg-red-500/10' :
                  threat.relevance === 'industry' ? 'border-orange-500/50 bg-orange-500/5' :
                  'border-gray-700'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{threat.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      threat.type === 'Ransomware' ? 'bg-red-500/20 text-red-400' :
                      threat.type === 'APT' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {threat.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{threat.iocs} IOCs</span>
                    <span>{threat.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900/80 border border-cyan-500/30 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">⚡ Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-lg text-xs">
                🚨 PANIC
              </button>
              <button className="p-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-xs">
                🔒 Lockdown
              </button>
              <button className="p-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-xs">
                🔍 Full Scan
              </button>
              <button className="p-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/50 rounded-lg text-xs">
                📞 Alert Team
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="mt-4 pt-4 border-t border-cyan-500/30 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>🟢 All systems operational</span>
          <span>📡 Feed connected</span>
          <span>🔐 TLS 1.3 secured</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Last threat update: 2 min ago</span>
          <span>Anchor SOC v1.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default SOCDashboard;
