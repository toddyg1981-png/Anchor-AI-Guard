import React, { useState, useEffect } from 'react';

// ============================================================================
// ANCHOR SELF-PROTECTION SYSTEM
// ============================================================================
// "A security company that gets hacked is dead. We protect ourselves FIRST."
// This module monitors Anchor's own infrastructure, code integrity, and defenses
// ============================================================================

interface SystemIntegrityCheck {
  id: string;
  name: string;
  category: 'code' | 'infrastructure' | 'access' | 'data' | 'network' | 'supply_chain';
  status: 'passed' | 'failed' | 'warning' | 'checking';
  lastCheck: string;
  details: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
}

interface ThreatAlert {
  id: string;
  timestamp: string;
  type: 'intrusion_attempt' | 'anomaly' | 'brute_force' | 'data_exfil' | 'insider_threat' | 'supply_chain';
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  description: string;
  status: 'active' | 'investigating' | 'mitigated' | 'false_positive';
  autoMitigated: boolean;
}

interface AccessLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
  location: string;
  riskScore: number;
  flagged: boolean;
}

interface DefenseLayer {
  name: string;
  status: 'active' | 'degraded' | 'offline';
  blockedToday: number;
  lastIncident?: string;
  icon: string;
}

export const SelfProtection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'integrity' | 'threats' | 'access' | 'lockdown'>('dashboard');
  const [panicMode, setPanicMode] = useState(false);
  const [lockdownLevel, setLockdownLevel] = useState<0 | 1 | 2 | 3>(0);
  const [isScanning, setIsScanning] = useState(false);

  // Defense layers
  const defenseLayers: DefenseLayer[] = [
    { name: 'Web Application Firewall', status: 'active', blockedToday: 1247, icon: '🛡️' },
    { name: 'DDoS Protection', status: 'active', blockedToday: 45892, icon: '🌊' },
    { name: 'API Rate Limiting', status: 'active', blockedToday: 8934, icon: '⚡' },
    { name: 'Intrusion Detection', status: 'active', blockedToday: 234, icon: '👁️' },
    { name: 'Data Loss Prevention', status: 'active', blockedToday: 12, icon: '🔒' },
    { name: 'Zero Trust Network', status: 'active', blockedToday: 567, icon: '🚧' },
    { name: 'Endpoint Protection', status: 'active', blockedToday: 89, icon: '💻' },
    { name: 'Email Security', status: 'active', blockedToday: 2341, icon: '📧' }
  ];

  // Integrity checks
  const integrityChecks: SystemIntegrityCheck[] = [
    { id: 'ic-1', name: 'Source Code Integrity', category: 'code', status: 'passed', lastCheck: '2026-02-04T11:59:00Z', details: 'All files match signed hashes', criticality: 'critical' },
    { id: 'ic-2', name: 'Dependency Verification', category: 'supply_chain', status: 'passed', lastCheck: '2026-02-04T11:55:00Z', details: '0 vulnerable packages, 0 tampered', criticality: 'critical' },
    { id: 'ic-3', name: 'Database Encryption', category: 'data', status: 'passed', lastCheck: '2026-02-04T11:58:00Z', details: 'AES-256 encryption verified', criticality: 'critical' },
    { id: 'ic-4', name: 'SSL/TLS Certificates', category: 'network', status: 'passed', lastCheck: '2026-02-04T11:50:00Z', details: 'Valid until 2027-01-15, TLS 1.3', criticality: 'critical' },
    { id: 'ic-5', name: 'API Authentication', category: 'access', status: 'passed', lastCheck: '2026-02-04T11:57:00Z', details: 'JWT tokens valid, no leaked keys', criticality: 'critical' },
    { id: 'ic-6', name: 'Infrastructure Config', category: 'infrastructure', status: 'passed', lastCheck: '2026-02-04T11:45:00Z', details: 'No drift detected from baseline', criticality: 'high' },
    { id: 'ic-7', name: 'Secrets Rotation', category: 'access', status: 'warning', lastCheck: '2026-02-04T11:30:00Z', details: '2 secrets due for rotation in 7 days', criticality: 'high' },
    { id: 'ic-8', name: 'Backup Integrity', category: 'data', status: 'passed', lastCheck: '2026-02-04T10:00:00Z', details: 'All backups verified, restore tested', criticality: 'high' },
    { id: 'ic-9', name: 'Container Images', category: 'infrastructure', status: 'passed', lastCheck: '2026-02-04T11:40:00Z', details: 'All images signed and scanned', criticality: 'high' },
    { id: 'ic-10', name: 'Network Segmentation', category: 'network', status: 'passed', lastCheck: '2026-02-04T11:35:00Z', details: 'All segments isolated correctly', criticality: 'medium' },
    { id: 'ic-11', name: 'Audit Log Integrity', category: 'data', status: 'passed', lastCheck: '2026-02-04T11:55:00Z', details: 'Tamper-proof logs verified', criticality: 'critical' },
    { id: 'ic-12', name: 'Admin Account Security', category: 'access', status: 'passed', lastCheck: '2026-02-04T11:58:00Z', details: 'MFA enforced, no stale accounts', criticality: 'critical' }
  ];

  // Mock threat alerts
  const [threatAlerts, setThreatAlerts] = useState<ThreatAlert[]>([
    { id: 'ta-1', timestamp: '2026-02-04T11:45:00Z', type: 'brute_force', severity: 'medium', source: '185.234.72.15', description: 'Brute force attempt on admin login - 50 failed attempts', status: 'mitigated', autoMitigated: true },
    { id: 'ta-2', timestamp: '2026-02-04T10:30:00Z', type: 'anomaly', severity: 'low', source: 'internal', description: 'Unusual API call pattern from service account', status: 'investigating', autoMitigated: false },
    { id: 'ta-3', timestamp: '2026-02-04T09:15:00Z', type: 'intrusion_attempt', severity: 'high', source: '103.45.67.89', description: 'SQL injection attempt on /api/users endpoint', status: 'mitigated', autoMitigated: true },
    { id: 'ta-4', timestamp: '2026-02-03T22:00:00Z', type: 'supply_chain', severity: 'medium', source: 'npm', description: 'Dependency update contains suspicious code pattern', status: 'investigating', autoMitigated: false }
  ]);

  // Mock access logs
  const accessLogs: AccessLog[] = [
    { id: 'al-1', timestamp: '2026-02-04T11:58:00Z', user: 'admin@anchor.security', action: 'VIEW_DASHBOARD', resource: '/dashboard', ip: '203.45.67.89', location: 'Brisbane, AU', riskScore: 5, flagged: false },
    { id: 'al-2', timestamp: '2026-02-04T11:55:00Z', user: 'dev@anchor.security', action: 'DEPLOY_UPDATE', resource: '/api/deploy', ip: '203.45.67.90', location: 'Brisbane, AU', riskScore: 15, flagged: false },
    { id: 'al-3', timestamp: '2026-02-04T11:50:00Z', user: 'unknown', action: 'LOGIN_FAILED', resource: '/auth/login', ip: '185.234.72.15', location: 'Russia', riskScore: 95, flagged: true },
    { id: 'al-4', timestamp: '2026-02-04T11:45:00Z', user: 'service-account', action: 'API_CALL', resource: '/api/scan', ip: '10.0.0.5', location: 'Internal', riskScore: 10, flagged: false },
    { id: 'al-5', timestamp: '2026-02-04T11:40:00Z', user: 'admin@anchor.security', action: 'EXPORT_DATA', resource: '/api/export', ip: '203.45.67.89', location: 'Brisbane, AU', riskScore: 25, flagged: false }
  ];

  // Simulate real-time scanning
  const runFullScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 5000);
  };

  // Lockdown system
  const activateLockdown = (level: 0 | 1 | 2 | 3) => {
    setLockdownLevel(level);
    if (level === 3) setPanicMode(true);
  };

  const lockdownDescriptions = {
    0: 'Normal Operations - All systems running normally',
    1: 'Elevated Alert - Enhanced monitoring, rate limits tightened',
    2: 'High Alert - External access restricted, admin-only mode',
    3: 'PANIC MODE - All external access blocked, forensics mode active'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': case 'active': case 'mitigated': return 'text-green-400 bg-green-500/10 border-green-500';
      case 'warning': case 'investigating': case 'degraded': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      case 'failed': case 'offline': return 'text-red-400 bg-red-500/10 border-red-500';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500';
    }
  };

  const passedChecks = integrityChecks.filter(c => c.status === 'passed').length;
  const warningChecks = integrityChecks.filter(c => c.status === 'warning').length;
  const failedChecks = integrityChecks.filter(c => c.status === 'failed').length;

  return (
    <div className={`min-h-screen ${panicMode ? 'bg-red-950' : 'bg-[#0a0a0f]'} text-white p-6 transition-colors duration-500`}>
      {/* Panic Mode Banner */}
      {panicMode && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-4 z-50 animate-pulse">
          <div className="flex items-center justify-center gap-4">
            <span className="text-2xl">🚨</span>
            <span className="font-bold text-xl">PANIC MODE ACTIVE - ALL EXTERNAL ACCESS BLOCKED</span>
            <button
              onClick={() => { setPanicMode(false); setLockdownLevel(0); }}
              className="px-4 py-1 bg-white text-red-600 rounded font-bold"
            >
              DEACTIVATE
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`flex items-center justify-between mb-8 ${panicMode ? 'mt-16' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold mb-2">🏰 Anchor Self-Protection</h1>
          <p className="text-gray-400">"We eat our own dog food" - Protecting ourselves first</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={runFullScan}
            disabled={isScanning}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              isScanning 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500 animate-pulse' 
                : 'bg-cyan-500 hover:bg-cyan-600 text-white'
            }`}
          >
            {isScanning ? '🔍 Scanning...' : '🔍 Full System Scan'}
          </button>
          <div className={`px-4 py-2 rounded-lg border ${
            lockdownLevel === 0 ? 'bg-green-500/10 border-green-500 text-green-400' :
            lockdownLevel === 1 ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' :
            lockdownLevel === 2 ? 'bg-orange-500/10 border-orange-500 text-orange-400' :
            'bg-red-500/10 border-red-500 text-red-400 animate-pulse'
          }`}>
            <span className="font-bold">DEFCON {3 - lockdownLevel}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{passedChecks}</div>
          <div className="text-sm text-gray-400">Checks Passed</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{warningChecks}</div>
          <div className="text-sm text-gray-400">Warnings</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{failedChecks}</div>
          <div className="text-sm text-gray-400">Failed</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">{defenseLayers.filter(d => d.status === 'active').length}/{defenseLayers.length}</div>
          <div className="text-sm text-gray-400">Defenses Active</div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-cyan-400">{defenseLayers.reduce((sum, d) => sum + d.blockedToday, 0).toLocaleString()}</div>
          <div className="text-sm text-gray-400">Blocked Today</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-400">{threatAlerts.filter(t => t.status === 'active' || t.status === 'investigating').length}</div>
          <div className="text-sm text-gray-400">Active Threats</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: '📊 Defense Status' },
          { id: 'integrity', label: '🔐 Integrity Checks' },
          { id: 'threats', label: '⚠️ Threat Alerts' },
          { id: 'access', label: '👁️ Access Logs' },
          { id: 'lockdown', label: '🚨 Lockdown Controls' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Defense Layers */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🛡️ Defense Layers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {defenseLayers.map((layer, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${getStatusColor(layer.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{layer.icon}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusColor(layer.status)}`}>
                      {layer.status}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm mb-1">{layer.name}</h3>
                  <div className="text-2xl font-bold">{layer.blockedToday.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">blocked today</div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Posture Score */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">📊 Security Posture Score</h2>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" fill="none" stroke="#1f2937" strokeWidth="12" />
                    <circle 
                      cx="96" cy="96" r="88" fill="none" 
                      stroke="url(#gradient)" strokeWidth="12" 
                      strokeLinecap="round"
                      strokeDasharray={`${(98 / 100) * 553} 553`}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-green-400">98</span>
                    <span className="text-sm text-gray-400">/ 100</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-bold">
                  EXCELLENT - HARDENED
                </span>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">🎯 Attack Surface</h2>
              <div className="space-y-3">
                {[
                  { name: 'Exposed Endpoints', value: 3, max: 100, color: 'bg-green-500' },
                  { name: 'Open Ports', value: 2, max: 50, color: 'bg-green-500' },
                  { name: 'Public APIs', value: 5, max: 20, color: 'bg-green-500' },
                  { name: 'Admin Accounts', value: 2, max: 10, color: 'bg-green-500' },
                  { name: 'Third-party Integrations', value: 8, max: 30, color: 'bg-yellow-500' }
                ].map((metric, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{metric.name}</span>
                      <span className="font-medium">{metric.value} / {metric.max} max</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${metric.color} rounded-full`}
                        style={{ width: `${(metric.value / metric.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Monitor */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📡 Real-time Security Monitor</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-black/30 rounded-lg">
                <div className="text-3xl mb-2">🌐</div>
                <div className="text-2xl font-bold text-cyan-400">847</div>
                <div className="text-xs text-gray-500">Active Connections</div>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-2xl font-bold text-green-400">12.4K</div>
                <div className="text-xs text-gray-500">Requests/min</div>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-2xl font-bold text-yellow-400">45ms</div>
                <div className="text-xs text-gray-500">Avg Response</div>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-2xl font-bold text-purple-400">100%</div>
                <div className="text-xs text-gray-500">TLS Encrypted</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integrity Checks Tab */}
      {activeTab === 'integrity' && (
        <div className="space-y-4">
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
            <h3 className="text-cyan-400 font-bold mb-1">🔐 Continuous Integrity Monitoring</h3>
            <p className="text-gray-400 text-sm">
              Every component of Anchor is continuously verified against known-good baselines. 
              Any tampering triggers immediate alerts.
            </p>
          </div>

          {Object.entries(
            integrityChecks.reduce((acc, check) => {
              if (!acc[check.category]) acc[check.category] = [];
              acc[check.category].push(check);
              return acc;
            }, {} as Record<string, SystemIntegrityCheck[]>)
          ).map(([category, checks]) => (
            <div key={category} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 capitalize">{category.replace(/_/g, ' ')} Checks</h3>
              <div className="space-y-3">
                {checks.map(check => (
                  <div key={check.id} className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${
                          check.status === 'passed' ? 'bg-green-400' :
                          check.status === 'warning' ? 'bg-yellow-400' :
                          check.status === 'failed' ? 'bg-red-400' : 'bg-gray-400 animate-pulse'
                        }`} />
                        <div>
                          <div className="font-medium">{check.name}</div>
                          <div className="text-sm text-gray-500">{check.details}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getSeverityColor(check.criticality)}`}>
                          {check.criticality}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(check.lastCheck).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Threats Tab */}
      {activeTab === 'threats' && (
        <div className="space-y-4">
          {threatAlerts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl">✅</span>
              <p className="mt-2">No active threats detected</p>
            </div>
          ) : (
            threatAlerts.map(alert => (
              <div key={alert.id} className={`p-6 rounded-xl border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {alert.type === 'intrusion_attempt' ? '🚨' :
                       alert.type === 'brute_force' ? '🔓' :
                       alert.type === 'data_exfil' ? '📤' :
                       alert.type === 'supply_chain' ? '📦' :
                       alert.type === 'insider_threat' ? '👤' : '⚠️'}
                    </span>
                    <div>
                      <div className="font-semibold">{alert.type.replace(/_/g, ' ').toUpperCase()}</div>
                      <div className="text-sm text-gray-500">{alert.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-500">
                    <span>🌐 Source: {alert.source}</span>
                    <span>🕐 {new Date(alert.timestamp).toLocaleString()}</span>
                    {alert.autoMitigated && (
                      <span className="text-green-400">✅ Auto-mitigated</span>
                    )}
                  </div>
                  {alert.status === 'investigating' && (
                    <button className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-sm">
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Access Logs Tab */}
      {activeTab === 'access' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-semibold">👁️ Access Audit Log</h3>
            <p className="text-sm text-gray-500">All access to Anchor systems is logged and monitored</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="p-4">Time</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Resource</th>
                <th className="p-4">Location</th>
                <th className="p-4">Risk</th>
              </tr>
            </thead>
            <tbody>
              {accessLogs.map(log => (
                <tr key={log.id} className={`border-b border-gray-800/50 ${log.flagged ? 'bg-red-500/10' : 'hover:bg-gray-800/30'}`}>
                  <td className="p-4 text-sm text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {log.flagged && <span className="text-red-400">🚨</span>}
                      <span className={`font-mono text-sm ${log.flagged ? 'text-red-400' : ''}`}>{log.user}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      log.action.includes('FAILED') ? 'bg-red-500/20 text-red-400' :
                      log.action.includes('EXPORT') ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm text-gray-400">{log.resource}</td>
                  <td className="p-4 text-sm">
                    <div>{log.location}</div>
                    <div className="text-xs text-gray-500">{log.ip}</div>
                  </td>
                  <td className="p-4">
                    <div className={`w-16 h-2 rounded-full overflow-hidden bg-gray-700`}>
                      <div 
                        className={`h-full rounded-full ${
                          log.riskScore > 80 ? 'bg-red-500' :
                          log.riskScore > 50 ? 'bg-orange-500' :
                          log.riskScore > 25 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${log.riskScore}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{log.riskScore}/100</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lockdown Tab */}
      {activeTab === 'lockdown' && (
        <div className="space-y-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-4">🚨 Emergency Lockdown Controls</h2>
            <p className="text-gray-400 mb-6">
              Use these controls to immediately lock down Anchor systems in case of a detected breach or ongoing attack.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { level: 0, name: 'Normal', color: 'green', description: 'All systems operational' },
                { level: 1, name: 'Elevated', color: 'yellow', description: 'Enhanced monitoring active' },
                { level: 2, name: 'High Alert', color: 'orange', description: 'Restrict external access' },
                { level: 3, name: 'PANIC', color: 'red', description: 'Complete lockdown' }
              ].map((option) => (
                <button
                  key={option.level}
                  onClick={() => activateLockdown(option.level as 0 | 1 | 2 | 3)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    lockdownLevel === option.level
                      ? `bg-${option.color}-500/20 border-${option.color}-500`
                      : 'border-gray-700 hover:border-gray-600'
                  } ${option.level === 3 ? 'hover:bg-red-500/30' : ''}`}
                >
                  <div className={`text-2xl font-bold mb-2 ${
                    option.color === 'green' ? 'text-green-400' :
                    option.color === 'yellow' ? 'text-yellow-400' :
                    option.color === 'orange' ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    DEFCON {3 - option.level}
                  </div>
                  <div className="font-medium">{option.name}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">📋 Current Lockdown Status</h3>
            <div className={`p-4 rounded-lg border-2 ${
              lockdownLevel === 0 ? 'border-green-500 bg-green-500/10' :
              lockdownLevel === 1 ? 'border-yellow-500 bg-yellow-500/10' :
              lockdownLevel === 2 ? 'border-orange-500 bg-orange-500/10' :
              'border-red-500 bg-red-500/10 animate-pulse'
            }`}>
              <div className="font-bold text-lg mb-2">DEFCON {3 - lockdownLevel}</div>
              <div className="text-gray-400">{lockdownDescriptions[lockdownLevel]}</div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-lg">
                <div className="text-2xl mb-2">🔌</div>
                <div className="text-sm font-medium">Kill All Sessions</div>
              </button>
              <button className="p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/50 rounded-lg">
                <div className="text-2xl mb-2">🔑</div>
                <div className="text-sm font-medium">Rotate All Secrets</div>
              </button>
              <button className="p-4 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <div className="text-2xl mb-2">📸</div>
                <div className="text-sm font-medium">Forensic Snapshot</div>
              </button>
              <button className="p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/50 rounded-lg">
                <div className="text-2xl mb-2">📞</div>
                <div className="text-sm font-medium">Alert IR Team</div>
              </button>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">📜 Incident Response Playbook</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded">
                <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Detect & Confirm - Verify the incident is real</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded">
                <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Contain - Activate appropriate lockdown level</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded">
                <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Eradicate - Remove attacker access, patch vulnerabilities</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded">
                <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Recover - Restore from clean backups if needed</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded">
                <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <span>Lessons Learned - Document and improve defenses</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfProtection;
