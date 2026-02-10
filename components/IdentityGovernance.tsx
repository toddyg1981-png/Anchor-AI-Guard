import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

type Tab = 'identities' | 'access-reviews' | 'lifecycle' | 'privileged';

const IdentityGovernance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('identities');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'identities', label: 'Identities' },
    { key: 'access-reviews', label: 'Access Reviews' },
    { key: 'lifecycle', label: 'Lifecycle' },
    { key: 'privileged', label: 'Privileged' },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      await backendApi.modules.getDashboard('identity-governance');
    } catch (e) {
      logger.error('Failed to load identity governance dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setAnalysisResult(null);
      const res = await backendApi.modules.analyze(
        'identity-governance',
        'Analyze identity posture for excessive privileges, orphaned accounts, and access review gaps'
      );
      setAnalysisResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    } catch (e) {
      setAnalysisResult('Analysis failed — please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const stats = [
    { label: 'Identities', value: '18,452' },
    { label: 'Privileged', value: '312' },
    { label: 'Orphaned', value: '44' },
    { label: 'SoD Violations', value: '6' },
  ];

  const identities = [
    { name: 'Alice Carter', type: 'User', role: 'DevOps Lead', dept: 'Engineering', lastLogin: '2026-02-06', risk: 12 },
    { name: 'svc-deploy-prod', type: 'Service Account', role: 'Deployer', dept: 'Platform', lastLogin: '2026-02-07', risk: 68 },
    { name: 'api-key-analytics', type: 'API Key', role: 'Read-Only', dept: 'Data', lastLogin: '2026-01-29', risk: 34 },
    { name: 'Bob Mitchell', type: 'User', role: 'DBA', dept: 'Engineering', lastLogin: '2026-02-05', risk: 45 },
    { name: 'svc-backup-nightly', type: 'Service Account', role: 'Backup Operator', dept: 'Infra', lastLogin: '2026-02-07', risk: 22 },
  ];

  const accessReviews = [
    { id: 'r-1', name: 'Quarterly Access Review', status: 'In Progress', owners: 42, due: '2026-02-28', autoRevoke: true },
    { id: 'r-2', name: 'Privileged Accounts', status: 'Scheduled', owners: 12, due: '2026-03-05', autoRevoke: true },
    { id: 'r-3', name: 'Vendor Access', status: 'Completed', owners: 18, due: '2026-01-31', autoRevoke: false },
    { id: 'r-4', name: 'Stale Service Accounts', status: 'In Progress', owners: 8, due: '2026-02-20', autoRevoke: true },
  ];

  const lifecycleWorkflows = [
    { id: 'l-1', type: 'Joiner', name: 'New Hire Provisioning', status: 'Active', triggers: 'HR Onboarding', lastRun: '2026-02-06' },
    { id: 'l-2', type: 'Mover', name: 'Department Transfer', status: 'Active', triggers: 'Role Change', lastRun: '2026-02-04' },
    { id: 'l-3', type: 'Leaver', name: 'Termination Deprovisioning', status: 'Active', triggers: 'HR Offboarding', lastRun: '2026-02-05' },
    { id: 'l-4', type: 'Joiner', name: 'Contractor Onboarding', status: 'Paused', triggers: 'Vendor Portal', lastRun: '2026-01-22' },
  ];

  const pamEntries = [
    { id: 'p-1', account: 'root@prod-db-01', vault: 'CyberArk', lastRotated: '2026-02-01', jit: true, sessions: 14 },
    { id: 'p-2', account: 'admin@firewall-core', vault: 'HashiVault', lastRotated: '2026-01-28', jit: false, sessions: 7 },
    { id: 'p-3', account: 'sa@azure-prod', vault: 'CyberArk', lastRotated: '2026-02-05', jit: true, sessions: 22 },
    { id: 'p-4', account: 'dba@oracle-fin', vault: 'HashiVault', lastRotated: '2026-01-15', jit: false, sessions: 3 },
  ];

  const riskColor = (score: number) =>
    score >= 60 ? 'text-red-400' : score >= 30 ? 'text-yellow-400' : 'text-green-400';

  const typeColor = (type: string) => {
    if (type === 'Joiner') return 'text-green-400';
    if (type === 'Mover') return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-indigo-400">Identity Governance</h1>
          <p className="text-slate-400">Access reviews, least privilege enforcement, and joiner/mover/leaver controls.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            {analyzing ? (
              <><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" /> Analyzing…</>
            ) : (
              '🤖 AI Analyze'
            )}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">SoD policies: Enabled</div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === t.key ? 'bg-slate-800 text-cyan-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Identities Tab */}
      {activeTab === 'identities' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold mb-2">Identity Inventory</h2>
          {identities.map(id => (
            <div key={id.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold">{id.name}</div>
                <div className="text-xs text-slate-500">{id.type} · {id.dept}</div>
              </div>
              <div className="text-xs text-slate-400 text-center px-4">{id.role}</div>
              <div className="text-xs text-slate-400 text-center px-4">Last login: {id.lastLogin}</div>
              <div className={`text-sm font-bold ${riskColor(id.risk)}`}>Risk {id.risk}</div>
            </div>
          ))}
        </div>
      )}

      {/* Access Reviews Tab */}
      {activeTab === 'access-reviews' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Pending Access Certifications</h2>
            <span className="text-xs text-slate-400">Auto-Revoke available</span>
          </div>
          {accessReviews.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">Owners: {item.owners}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-0.5 rounded ${item.autoRevoke ? 'bg-green-900/50 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
                  {item.autoRevoke ? 'Auto-Revoke ON' : 'Manual'}
                </span>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Due {item.due}</div>
                  <div className={`text-xs ${item.status === 'Completed' ? 'text-green-300' : item.status === 'In Progress' ? 'text-yellow-300' : 'text-slate-400'}`}>{item.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lifecycle Tab */}
      {activeTab === 'lifecycle' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold mb-2">Provisioning / Deprovisioning Workflows</h2>
          {lifecycleWorkflows.map(wf => (
            <div key={wf.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold">{wf.name}</div>
                <div className="text-xs text-slate-500">Trigger: {wf.triggers}</div>
              </div>
              <span className={`text-xs font-bold px-2 ${typeColor(wf.type)}`}>{wf.type}</span>
              <span className={`text-xs px-2 py-0.5 rounded ml-3 ${wf.status === 'Active' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}>{wf.status}</span>
              <div className="text-xs text-slate-400 ml-4">Last run: {wf.lastRun}</div>
            </div>
          ))}
        </div>
      )}

      {/* Privileged Tab */}
      {activeTab === 'privileged' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold mb-2">PAM Vault & Privileged Sessions</h2>
          {pamEntries.map(p => (
            <div key={p.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold font-mono">{p.account}</div>
                <div className="text-xs text-slate-500">Vault: {p.vault}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-0.5 rounded ${p.jit ? 'bg-cyan-900/50 text-cyan-300' : 'bg-slate-700 text-slate-400'}`}>
                  {p.jit ? 'JIT Enabled' : 'Standing'}
                </span>
                <div className="text-xs text-slate-400">{p.sessions} sessions</div>
                <div className="text-xs text-slate-400">Rotated: {p.lastRotated}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="bg-slate-800 border border-indigo-600 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-indigo-300">🤖 AI Analysis</h2>
            <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white text-sm">✕ Close</button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default IdentityGovernance;
