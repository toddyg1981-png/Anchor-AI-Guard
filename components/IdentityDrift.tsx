// ============================================================================
// IDENTITY DRIFT DETECTION — WORLD-FIRST AI IDENTITY INTEGRITY ENGINE
// Anchor is the first platform to detect identity drift — privilege creep,
// stale access, shadow accounts, session hijacking, and identity poisoning
// using AI-driven continuous identity verification and behavioral analysis.
// ============================================================================

import React, { useState, useEffect } from 'react';

const tabs = [
  { id: 'overview', label: 'Drift Overview' },
  { id: 'privilege', label: 'Privilege Creep' },
  { id: 'stale', label: 'Stale Access' },
  { id: 'shadow', label: 'Shadow Accounts' },
  { id: 'session', label: 'Session Intelligence' },
];

const riskBadge = (level: string) => {
  const colors: Record<string, string> = {
    Critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
    High: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    Low: 'bg-green-500/20 text-green-400 border border-green-500/30',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[level] || colors.Low}`}>
      {level}
    </span>
  );
};

const statusDot = (color: 'green' | 'yellow' | 'red') => {
  const cls: Record<string, string> = {
    green: 'bg-green-400 shadow-green-400/50',
    yellow: 'bg-yellow-400 shadow-yellow-400/50',
    red: 'bg-red-400 shadow-red-400/50',
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full shadow-lg ${cls[color]}`} />;
};

const progressBar = (value: number, max: number = 100, color: string = 'cyan') => {
  const pct = Math.min((value / max) * 100, 100);
  const barColor: Record<string, string> = {
    cyan: 'bg-cyan-400',
    pink: 'bg-pink-400',
    red: 'bg-red-400',
    green: 'bg-green-400',
    orange: 'bg-orange-400',
    yellow: 'bg-yellow-400',
  };
  return (
    <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-2.5 rounded-full transition-all duration-700 ${barColor[color] || barColor.cyan}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

// ── Mock Data ────────────────────────────────────────────────────────────────

const privilegeCreepUsers = [
  { name: 'Marcus Chen', email: 'm.chen@corp.io', avatar: '👤', originalRole: 'Junior Dev', currentPerms: 14, originalPerms: 4, risk: 'Critical', lastActivity: '2026-02-08', recommendation: 'Remove 8 excess permissions including prod-db-write, deploy-prod, iam-admin' },
  { name: 'Sara Okonkwo', email: 's.okonkwo@corp.io', avatar: '👩', originalRole: 'QA Analyst', currentPerms: 11, originalPerms: 3, risk: 'High', lastActivity: '2026-02-07', recommendation: 'Revoke admin-console, billing-read, and infra-modify permissions' },
  { name: 'James Thornton', email: 'j.thornton@corp.io', avatar: '🧑', originalRole: 'Support Engineer', currentPerms: 9, originalPerms: 5, risk: 'High', lastActivity: '2026-02-06', recommendation: 'Right-size to Support Tier-2 role, remove cloud-admin access' },
  { name: 'Priya Sharma', email: 'p.sharma@corp.io', avatar: '👩‍💻', originalRole: 'Data Analyst', currentPerms: 7, originalPerms: 3, risk: 'Medium', lastActivity: '2026-02-09', recommendation: 'Remove secrets-manager and k8s-namespace-admin grants' },
  { name: 'Leo Virtanen', email: 'l.virtanen@corp.io', avatar: '🧔', originalRole: 'Frontend Dev', currentPerms: 6, originalPerms: 4, risk: 'Medium', lastActivity: '2026-01-30', recommendation: 'Revoke CI/CD pipeline admin, limit to frontend-deploy only' },
  { name: 'Diana Reyes', email: 'd.reyes@corp.io', avatar: '👩‍🔬', originalRole: 'Intern', currentPerms: 8, originalPerms: 2, risk: 'Critical', lastActivity: '2026-02-05', recommendation: 'Intern account with prod write access — immediate remediation required' },
];

const staleAccounts = [
  { name: 'build-agent-legacy', type: 'Service Account', lastUsed: '2025-08-14', daysDormant: 179, permissions: 12, risk: 'Critical', owner: 'DevOps Team' },
  { name: 'jennifer.wu@corp.io', type: 'User Account', lastUsed: '2025-11-03', daysDormant: 98, permissions: 7, risk: 'High', owner: 'Engineering' },
  { name: 'ci-deploy-v1', type: 'Service Account', lastUsed: '2025-10-20', daysDormant: 112, permissions: 9, risk: 'High', owner: 'Platform Team' },
  { name: 'temp-contractor-alex', type: 'Contractor', lastUsed: '2025-12-01', daysDormant: 70, permissions: 5, risk: 'Medium', owner: 'HR / External' },
  { name: 'monitoring-bot-old', type: 'Service Account', lastUsed: '2025-09-22', daysDormant: 140, permissions: 4, risk: 'High', owner: 'SRE Team' },
  { name: 'ryan.departed@corp.io', type: 'Orphaned', lastUsed: '2025-07-10', daysDormant: 214, permissions: 11, risk: 'Critical', owner: 'Former Employee' },
  { name: 'staging-admin', type: 'Shared Account', lastUsed: '2025-12-25', daysDormant: 46, permissions: 15, risk: 'Medium', owner: 'QA Team' },
];

const shadowAccounts = [
  { identifier: 'rogue-svc-principal-9a3f', type: 'Service Principal', source: 'Azure AD', discoveredAt: '2026-02-01', risk: 'Critical', status: 'Unmanaged', detail: 'Created outside Terraform — has Contributor role on prod subscription' },
  { identifier: 'api-key-****-7xkm', type: 'API Key', source: 'AWS IAM', discoveredAt: '2026-01-28', risk: 'High', status: 'Unrotated', detail: 'Static key with S3 full access, no rotation in 340 days' },
  { identifier: 'shared-admin@corp.io', type: 'Shared Credential', source: 'Google Workspace', discoveredAt: '2026-01-15', risk: 'Critical', status: 'Shared', detail: '6 users sharing one admin credential — no MFA enforced' },
  { identifier: 'lambda-exec-role-legacy', type: 'IAM Role', source: 'AWS IAM', discoveredAt: '2026-02-04', risk: 'High', status: 'Shadow', detail: 'Assumed by 3 unknown principals, wildcard permissions on DynamoDB' },
  { identifier: 'dev-bot-token-slack', type: 'Bot Token', source: 'Slack API', discoveredAt: '2026-02-06', risk: 'Medium', status: 'Ungoverned', detail: 'Slack bot token with admin scopes, created by former employee' },
  { identifier: 'sa-gke-node-pool-2', type: 'Service Account', source: 'GCP IAM', discoveredAt: '2026-01-20', risk: 'High', status: 'Unmanaged', detail: 'GKE node SA with project-editor role, not in IaC' },
];

const sessionData = [
  { user: 'Marcus Chen', location: 'San Francisco, US', ip: '198.51.100.42', device: 'MacBook Pro', status: 'Active', anomaly: null, started: '08:14 AM' },
  { user: 'Sara Okonkwo', location: 'Lagos, NG → Stockholm, SE', ip: '203.0.113.77', device: 'Windows 11', status: 'Flagged', anomaly: 'Impossible Travel', started: '09:02 AM' },
  { user: 'James Thornton', location: 'London, UK', ip: '192.0.2.15', device: 'Chrome OS', status: 'Active', anomaly: null, started: '07:45 AM' },
  { user: 'Priya Sharma', location: 'Mumbai, IN', ip: '198.51.100.88', device: 'Ubuntu 22.04', status: 'Suspicious', anomaly: 'Concurrent Sessions (3)', started: '10:30 AM' },
  { user: 'Unknown Actor', location: 'Tor Exit Node', ip: '203.0.113.99', device: 'Unknown', status: 'Blocked', anomaly: 'Token Theft Detected', started: '11:15 AM' },
  { user: 'Leo Virtanen', location: 'Helsinki, FI', ip: '192.0.2.200', device: 'MacBook Air', status: 'Active', anomaly: null, started: '06:50 AM' },
  { user: 'Diana Reyes', location: 'Mexico City, MX', ip: '198.51.100.55', device: 'iPhone 15', status: 'Flagged', anomaly: 'Session Hijack Attempt', started: '12:01 PM' },
];

// ── Sub-components ───────────────────────────────────────────────────────────

const DriftOverview: React.FC = () => {
  const metrics = [
    { label: 'Identity Drift Score', value: 72, max: 100, color: 'orange', icon: '📊' },
    { label: 'Drifted Identities', value: 38, max: 200, color: 'pink', icon: '🔀' },
    { label: 'Privilege Creep Alerts', value: 24, max: 50, color: 'red', icon: '⚠️' },
    { label: 'Stale Access Count', value: 47, max: 100, color: 'yellow', icon: '🕸️' },
    { label: 'Shadow Accounts', value: 12, max: 30, color: 'red', icon: '👻' },
    { label: 'Identity Health Score', value: 64, max: 100, color: 'cyan', icon: '💚' },
  ];

  const recentEvents = [
    { time: '2 min ago', event: 'Privilege escalation detected for m.chen@corp.io', severity: 'Critical' },
    { time: '18 min ago', event: 'Stale service account ci-deploy-v1 accessed prod API', severity: 'High' },
    { time: '34 min ago', event: 'Shadow service principal discovered in Azure AD', severity: 'Critical' },
    { time: '1 hr ago', event: 'Impossible travel alert: s.okonkwo@corp.io', severity: 'High' },
    { time: '2 hrs ago', event: 'Orphaned account ryan.departed@corp.io still active', severity: 'Medium' },
    { time: '3 hrs ago', event: 'Token theft attempt blocked for d.reyes@corp.io', severity: 'Critical' },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">{m.label}</span>
              <span className="text-2xl">{m.icon}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {m.value}
              <span className="text-sm text-slate-500 font-normal ml-1">/ {m.max}</span>
            </div>
            {progressBar(m.value, m.max, m.color)}
            <div className="mt-2 text-xs text-slate-500 text-right">{Math.round((m.value / m.max) * 100)}%</div>
          </div>
        ))}
      </div>

      {/* Identity Health Gauge */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Overall Identity Health</h3>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#334155" strokeWidth="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#22d3ee" strokeWidth="10"
                strokeDasharray={`${64 * 3.27} ${326.7 - 64 * 3.27}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-cyan-400">64%</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-slate-400">Privilege Hygiene</span><span className="text-orange-400">58%</span></div>
            {progressBar(58, 100, 'orange')}
            <div className="flex justify-between text-sm"><span className="text-slate-400">Access Freshness</span><span className="text-yellow-400">71%</span></div>
            {progressBar(71, 100, 'yellow')}
            <div className="flex justify-between text-sm"><span className="text-slate-400">Governance Coverage</span><span className="text-cyan-400">82%</span></div>
            {progressBar(82, 100, 'cyan')}
            <div className="flex justify-between text-sm"><span className="text-slate-400">Session Security</span><span className="text-green-400">45%</span></div>
            {progressBar(45, 100, 'green')}
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Drift Events</h3>
        <div className="space-y-3">
          {recentEvents.map((evt, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
              {statusDot(evt.severity === 'Critical' ? 'red' : evt.severity === 'High' ? 'yellow' : 'green')}
              <div className="flex-1">
                <p className="text-sm text-white">{evt.event}</p>
                <p className="text-xs text-slate-500 mt-1">{evt.time}</p>
              </div>
              {riskBadge(evt.severity)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PrivilegeCreep: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-white">Privilege Creep Analysis</h3>
      <span className="text-xs text-slate-500">Showing {privilegeCreepUsers.length} drifted identities</span>
    </div>
    {privilegeCreepUsers.map((u, i) => (
      <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-pink-500/30 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="text-3xl">{u.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-white font-semibold">{u.name}</span>
              <span className="text-xs text-slate-500">{u.email}</span>
              {riskBadge(u.risk)}
            </div>

            {/* Privilege timeline bar */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Original: {u.originalPerms} permissions ({u.originalRole})</span>
                <span>Current: {u.currentPerms} permissions</span>
              </div>
              <div className="relative w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                <div className="absolute h-4 bg-green-500/40 rounded-l-full" style={{ width: `${(u.originalPerms / u.currentPerms) * 100}%` }} />
                <div className="absolute h-4 bg-red-400/60 rounded-r-full" style={{ left: `${(u.originalPerms / u.currentPerms) * 100}%`, width: `${100 - (u.originalPerms / u.currentPerms) * 100}%` }} />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                  +{u.currentPerms - u.originalPerms} excess
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
              <span>Last activity: <span className="text-slate-300">{u.lastActivity}</span></span>
              <span>Drift rate: <span className="text-pink-400">+{((u.currentPerms - u.originalPerms) / u.originalPerms * 100).toFixed(0)}%</span></span>
            </div>

            <div className="mt-2 p-2 bg-slate-900/60 rounded-lg border border-slate-700/50">
              <p className="text-xs text-cyan-400">💡 Recommendation: {u.recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const StaleAccess: React.FC = () => {
  const buckets = [
    { label: '30+ days', count: staleAccounts.filter(a => a.daysDormant >= 30 && a.daysDormant < 60).length, color: 'yellow' },
    { label: '60+ days', count: staleAccounts.filter(a => a.daysDormant >= 60 && a.daysDormant < 90).length, color: 'orange' },
    { label: '90+ days', count: staleAccounts.filter(a => a.daysDormant >= 90).length, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      {/* Dormancy buckets */}
      <div className="grid grid-cols-3 gap-4">
        {buckets.map((b, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <div className={`text-3xl font-bold ${b.color === 'red' ? 'text-red-400' : b.color === 'orange' ? 'text-orange-400' : 'text-yellow-400'}`}>{b.count}</div>
            <div className="text-xs text-slate-400 mt-1">Dormant {b.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-slate-400">
                <th className="p-4 font-medium">Account</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Last Used</th>
                <th className="p-4 font-medium">Dormant</th>
                <th className="p-4 font-medium">Permissions</th>
                <th className="p-4 font-medium">Risk</th>
                <th className="p-4 font-medium">Owner</th>
              </tr>
            </thead>
            <tbody>
              {staleAccounts.map((a, i) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {statusDot(a.daysDormant > 150 ? 'red' : a.daysDormant > 90 ? 'yellow' : 'green')}
                      <span className="text-white font-medium">{a.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${a.type === 'Orphaned' ? 'bg-red-500/20 text-red-400' : a.type === 'Service Account' ? 'bg-blue-500/20 text-blue-400' : a.type === 'Shared Account' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-600/40 text-slate-300'}`}>
                      {a.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{a.lastUsed}</td>
                  <td className="p-4">
                    <span className={`font-semibold ${a.daysDormant > 150 ? 'text-red-400' : a.daysDormant > 90 ? 'text-orange-400' : 'text-yellow-400'}`}>
                      {a.daysDormant} days
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{a.permissions}</td>
                  <td className="p-4">{riskBadge(a.risk)}</td>
                  <td className="p-4 text-slate-400">{a.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ShadowAccounts: React.FC = () => {
  const [actionStatus, setActionStatus] = useState<Record<string, string>>({});

  const handleAction = (id: string, _actionName: string, _successMessage: string) => {
    setActionStatus(prev => ({ ...prev, [id]: 'processing' }));
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, [id]: 'done' }));
      setTimeout(() => setActionStatus(prev => ({ ...prev, [id]: '' })), 2000);
    }, 1500);
  };

  return (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-white">Shadow Account Discovery</h3>
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
        {shadowAccounts.length} Unmanaged Identities
      </span>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {shadowAccounts.map((s, i) => (
        <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-red-500/30 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">👻</span>
              <div>
                <p className="text-white font-semibold text-sm">{s.identifier}</p>
                <p className="text-xs text-slate-500">{s.source}</p>
              </div>
            </div>
            {riskBadge(s.risk)}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'Unmanaged' ? 'bg-red-500/20 text-red-400' : s.status === 'Shared' ? 'bg-purple-500/20 text-purple-400' : s.status === 'Shadow' ? 'bg-pink-500/20 text-pink-400' : 'bg-orange-500/20 text-orange-400'}`}>
              {s.status}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{s.type}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{s.detail}</p>
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
            <span>Discovered: {s.discoveredAt}</span>
            <button
              className="text-cyan-400 hover:text-cyan-300 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
              onClick={() => handleAction(`investigate-shadow-${i}`, 'Investigate', 'Investigation started')}
              disabled={actionStatus[`investigate-shadow-${i}`] === 'processing'}
            >
              {actionStatus[`investigate-shadow-${i}`] === 'processing' ? '⏳ Processing...' : actionStatus[`investigate-shadow-${i}`] === 'done' ? '✓ Done' : 'Investigate →'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

const SessionIntelligence: React.FC = () => {
  const [actionStatus, setActionStatus] = useState<Record<string, string>>({});

  const handleAction = (id: string, _actionName: string, _successMessage: string) => {
    setActionStatus(prev => ({ ...prev, [id]: 'processing' }));
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, [id]: 'done' }));
      setTimeout(() => setActionStatus(prev => ({ ...prev, [id]: '' })), 2000);
    }, 1500);
  };

  const statusColors: Record<string, string> = {
    Active: 'bg-green-500/20 text-green-400 border-green-500/30',
    Flagged: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Suspicious: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const anomalyStats = [
    { label: 'Active Sessions', value: 142, icon: '🟢' },
    { label: 'Impossible Travel', value: 3, icon: '✈️' },
    { label: 'Concurrent Anomalies', value: 7, icon: '🔄' },
    { label: 'Token Theft Attempts', value: 2, icon: '🔑' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {anomalyStats.map((s, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center hover:border-cyan-500/40 transition-all">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Session Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-white font-semibold">Live Session Monitor</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-slate-400">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium">IP Address</th>
                <th className="p-4 font-medium">Device</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Anomaly</th>
                <th className="p-4 font-medium">Started</th>
              </tr>
            </thead>
            <tbody>
              {sessionData.map((s, i) => (
                <tr key={i} className={`border-b border-slate-700/50 transition-colors ${s.anomaly ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-slate-700/30'}`}>
                  <td className="p-4 text-white font-medium">{s.user}</td>
                  <td className="p-4 text-slate-300 text-xs">{s.location}</td>
                  <td className="p-4 font-mono text-xs text-slate-400">{s.ip}</td>
                  <td className="p-4 text-slate-400 text-xs">{s.device}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="p-4">
                    {s.anomaly ? (
                      <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                        ⚡ {s.anomaly}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">None</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400 text-xs">{s.started}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detection cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">✈️</span>
            <h4 className="text-white font-semibold text-sm">Impossible Travel</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            s.okonkwo@corp.io authenticated from Lagos, NG at 09:02 AM and Stockholm, SE at 09:14 AM — 
            physically impossible in 12 minutes. Session flagged for verification.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
              onClick={() => handleAction('revoke-travel', 'Revoke', 'Session revoked')}
              disabled={actionStatus['revoke-travel'] === 'processing'}
            >
              {actionStatus['revoke-travel'] === 'processing' ? '⏳ Processing...' : actionStatus['revoke-travel'] === 'done' ? '✓ Done' : 'Revoke'}
            </button>
            <button
              className="text-xs px-3 py-1 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
              onClick={() => handleAction('verify-travel', 'Verify', 'Verification sent')}
              disabled={actionStatus['verify-travel'] === 'processing'}
            >
              {actionStatus['verify-travel'] === 'processing' ? '⏳ Processing...' : actionStatus['verify-travel'] === 'done' ? '✓ Done' : 'Verify'}
            </button>
          </div>
        </div>
        <div className="bg-slate-800 border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔄</span>
            <h4 className="text-white font-semibold text-sm">Concurrent Sessions</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            p.sharma@corp.io has 3 concurrent active sessions from different devices and IPs. 
            Historical baseline is 1 session. Potential credential sharing or compromise.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              className="text-xs px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors disabled:opacity-50"
              onClick={() => handleAction('force-logout-concurrent', 'Force Logout', 'Sessions terminated')}
              disabled={actionStatus['force-logout-concurrent'] === 'processing'}
            >
              {actionStatus['force-logout-concurrent'] === 'processing' ? '⏳ Processing...' : actionStatus['force-logout-concurrent'] === 'done' ? '✓ Done' : 'Force Logout'}
            </button>
            <button
              className="text-xs px-3 py-1 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
              onClick={() => handleAction('monitor-concurrent', 'Monitor', 'Monitoring enabled')}
              disabled={actionStatus['monitor-concurrent'] === 'processing'}
            >
              {actionStatus['monitor-concurrent'] === 'processing' ? '⏳ Processing...' : actionStatus['monitor-concurrent'] === 'done' ? '✓ Done' : 'Monitor'}
            </button>
          </div>
        </div>
        <div className="bg-slate-800 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔑</span>
            <h4 className="text-white font-semibold text-sm">Token Theft</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Stolen refresh token detected from Tor exit node attempting to access d.reyes@corp.io session.
            Token fingerprint mismatch. Connection blocked automatically.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
              onClick={() => handleAction('rotate-tokens-theft', 'Rotate Tokens', 'Tokens rotated')}
              disabled={actionStatus['rotate-tokens-theft'] === 'processing'}
            >
              {actionStatus['rotate-tokens-theft'] === 'processing' ? '⏳ Processing...' : actionStatus['rotate-tokens-theft'] === 'done' ? '✓ Done' : 'Rotate Tokens'}
            </button>
            <button
              className="text-xs px-3 py-1 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
              onClick={() => handleAction('forensics-theft', 'Forensics', 'Forensics initiated')}
              disabled={actionStatus['forensics-theft'] === 'processing'}
            >
              {actionStatus['forensics-theft'] === 'processing' ? '⏳ Processing...' : actionStatus['forensics-theft'] === 'done' ? '✓ Done' : 'Forensics'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

const IdentityDrift: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          setIsScanning(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [isScanning]);

  const startScan = () => {
    setScanProgress(0);
    setIsScanning(true);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <DriftOverview />;
      case 'privilege': return <PrivilegeCreep />;
      case 'stale': return <StaleAccess />;
      case 'shadow': return <ShadowAccounts />;
      case 'session': return <SessionIntelligence />;
      default: return <DriftOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            Identity Drift Detection
          </h1>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-cyan-500/20 to-pink-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse">
            🌍 World First
          </span>
        </div>
        <p className="text-slate-400 text-sm max-w-2xl">
          AI-powered continuous identity verification detecting privilege creep, stale access, shadow accounts, 
          session hijacking, and identity poisoning in real-time across your entire identity fabric.
        </p>

        {/* Scan Button */}
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={startScan}
            disabled={isScanning}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? 'Scanning...' : '🔍 Run Identity Drift Scan'}
          </button>
          {isScanning && (
            <div className="flex items-center gap-3 flex-1 max-w-md">
              {progressBar(scanProgress, 100, 'cyan')}
              <span className="text-xs text-cyan-400 font-mono w-10">{scanProgress}%</span>
            </div>
          )}
          {scanProgress === 100 && !isScanning && (
            <span className="text-xs text-green-400 font-semibold">✓ Scan complete — 38 drift events detected</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-800/50 p-1 rounded-xl border border-slate-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-slate-700 text-cyan-400 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300">
        {renderTab()}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-600">
        <span>Anchor Identity Drift Engine v2.4.0 — Continuous monitoring active</span>
        <span>Last full scan: Feb 9, 2026 at 03:14 AM UTC</span>
      </div>
    </div>
  );
};

export default IdentityDrift;
