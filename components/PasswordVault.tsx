import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

const PasswordVault: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [activeTab, setActiveTab] = useState<'secrets' | 'vaults' | 'requests' | 'audit'>('secrets');

  const [secrets, setSecrets] = useState([
    { id: 's-1', name: 'Prod Database', type: 'DB Cred', rotation: '14d', status: 'Healthy', lastRotated: '2026-01-12', accessors: 4 },
    { id: 's-2', name: 'Stripe API Key', type: 'API Key', rotation: '30d', status: 'Rotating', lastRotated: '2025-12-28', accessors: 2 },
    { id: 's-3', name: 'Admin Break-glass', type: 'Password', rotation: '7d', status: 'Guarded', lastRotated: '2026-01-18', accessors: 1 },
    { id: 's-4', name: 'AWS Root Key', type: 'IAM Key', rotation: '90d', status: 'Healthy', lastRotated: '2025-11-01', accessors: 2 },
    { id: 's-5', name: 'GitHub Deploy Token', type: 'Token', rotation: '30d', status: 'Healthy', lastRotated: '2026-01-05', accessors: 6 },
    { id: 's-6', name: 'Signing Certificate', type: 'Certificate', rotation: '365d', status: 'Healthy', lastRotated: '2025-06-15', accessors: 3 },
  ]);

  const [stats, setStats] = useState([
    { label: 'Secrets', value: 842 },
    { label: 'Auto-rotated', value: '63%' },
    { label: 'Shared vaults', value: 28 },
    { label: 'Access requests (24h)', value: 44 },
  ]);

  const vaults = [
    { name: 'Production', secrets: 186, members: 12, policy: 'Restricted' },
    { name: 'Staging', secrets: 142, members: 28, policy: 'Standard' },
    { name: 'CI/CD', secrets: 94, members: 8, policy: 'Automated' },
    { name: 'Break-glass', secrets: 6, members: 2, policy: 'Emergency Only' },
    { name: 'Third-party', secrets: 78, members: 14, policy: 'Monitored' },
  ];

  const accessRequests = [
    { user: 'alice@anchor.ai', secret: 'Prod Database', reason: 'Schema migration', status: 'Pending', time: '12m ago' },
    { user: 'bob@anchor.ai', secret: 'AWS Root Key', reason: 'Infrastructure change', status: 'Approved', time: '1h ago' },
    { user: 'contractor@acme.com', secret: 'Staging API Key', reason: 'Integration testing', status: 'Denied', time: '3h ago' },
    { user: 'deploy-bot', secret: 'GitHub Deploy Token', reason: 'Automated deployment', status: 'Auto-approved', time: '4h ago' },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await backendApi.modules.getDashboard('password-vault');
      if ((result as any)?.stats) setStats(prev => (result as any).stats.length > 0 ? (result as any).stats : prev);
      if ((result as any)?.items) setSecrets(prev => (result as any).items.length > 0 ? (result as any).items : prev);
    } catch (err) {
      logger.error('Failed to load vault dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityAudit = async () => {
    setAnalyzing(true);
    try {
      const result = await backendApi.modules.analyze('password-vault', 'Audit our secrets management posture including rotation compliance, access patterns, and exposure risks');
      if ((result as any)?.analysis) setAnalysisResult((result as any).analysis);
    } catch (err) {
      logger.error('Vault audit failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const statusColor = (s: string) => s === 'Healthy' || s === 'Approved' || s === 'Auto-approved' ? 'text-green-400' : s === 'Rotating' || s === 'Pending' ? 'text-yellow-400' : s === 'Guarded' ? 'text-cyan-400' : 'text-red-400';

  if (loading) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-500">Password Vault</h1>
          <p className="text-slate-400">Enterprise secrets management with rotation, approvals, and audit.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSecurityAudit} disabled={analyzing}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {analyzing ? 'Auditing...' : 'AI Vault Audit'}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-green-400 font-semibold">HSM backed</div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {(['secrets', 'vaults', 'requests', 'audit'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-slate-800 text-amber-400 border border-slate-700 border-b-0' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'secrets' ? 'Secrets' : tab === 'vaults' ? 'Vaults' : tab === 'requests' ? 'Access Requests' : 'Audit Log'}
          </button>
        ))}
      </div>

      {activeTab === 'secrets' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Managed Secrets</h2>
          {secrets.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">{item.type} | Rotation: {item.rotation} | Accessors: {item.accessors} | Last: {item.lastRotated}</div>
              </div>
              <span className={`text-xs font-medium ${statusColor(item.status)}`}>{item.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'vaults' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Vault Partitions</h2>
          {vaults.map(v => (
            <div key={v.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{v.name}</div>
                <div className="text-xs text-slate-500">{v.secrets} secrets | {v.members} members</div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${v.policy === 'Emergency Only' ? 'bg-red-500/20 text-red-300' : v.policy === 'Restricted' ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300'}`}>{v.policy}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Access Requests</h2>
          {accessRequests.map((req, i) => (
            <div key={i} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{req.user}</span>
                <span className={`text-xs ${statusColor(req.status)}`}>{req.status}</span>
              </div>
              <div className="text-slate-400 mt-1">Secret: {req.secret} | Reason: {req.reason}</div>
              <div className="text-xs text-slate-500 mt-1">{req.time}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
          <h3 className="font-semibold mb-2">Recent Vault Activity</h3>
          {[{ action: 'Secret rotated', target: 'Stripe API Key', user: 'system', time: '28m ago' },
            { action: 'Access granted', target: 'Prod Database', user: 'alice@anchor.ai', time: '1h ago' },
            { action: 'Access denied', target: 'AWS Root Key', user: 'contractor@acme.com', time: '3h ago' },
            { action: 'Secret created', target: 'new-service-token', user: 'admin', time: '5h ago' },
            { action: 'Vault policy updated', target: 'Production', user: 'admin', time: '1d ago' },
          ].map((log, i) => (
            <div key={i} className="bg-slate-900 rounded-lg p-3 text-sm flex justify-between items-center">
              <div><span className="font-medium">{log.action}</span> <span className="text-slate-400">→ {log.target}</span></div>
              <div className="text-xs text-slate-500">{log.user} • {log.time}</div>
            </div>
          ))}
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-amber-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-amber-400 mb-2">AI Vault Security Audit</h3>
          <div className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</div>
        </div>
      )}
    </div>
  );
};

export default PasswordVault;
