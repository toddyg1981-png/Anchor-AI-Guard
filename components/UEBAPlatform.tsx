import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

const UEBAPlatform: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'anomalies' | 'users' | 'entities' | 'baselines'>('anomalies');

  const tabs = [
    { key: 'anomalies' as const, label: 'Anomalies' },
    { key: 'users' as const, label: 'Users' },
    { key: 'entities' as const, label: 'Entities' },
    { key: 'baselines' as const, label: 'Baselines' },
  ];

  useEffect(() => {
    const loadDashboard = async () => {
      try { await backendApi.modules.getDashboard('ueba'); } catch (_) {}
      setLoading(false);
    };
    loadDashboard();
  }, []);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await backendApi.modules.analyze('ueba', 'Analyze user and entity behavior anomalies for insider threat indicators, compromised accounts, and policy violations');
      setAnalysisResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    } catch (_) {
      setAnalysisResult('Analysis unavailable – backend offline.');
    }
    setAnalyzing(false);
  };

  const anomalies = [
    { id: 'u-1', user: 'alice@anchor.ai', behavior: 'Impossible travel (Sydney → Frankfurt in 4 min)', risk: 95, entity: 'Workstation-A12', ts: '2026-02-07 03:14 UTC' },
    { id: 'u-2', user: 'svc-backup', behavior: 'Off-hours access to financial share', risk: 82, entity: 'FileServer-03', ts: '2026-02-07 02:48 UTC' },
    { id: 'u-3', user: 'contractor@anchor.ai', behavior: 'Mass download – 2.4 GB in 8 min', risk: 88, entity: 'SharePoint-Prod', ts: '2026-02-06 22:31 UTC' },
    { id: 'u-4', user: 'ops-lead@anchor.ai', behavior: 'Privilege escalation to Domain Admin', risk: 97, entity: 'DC-Primary', ts: '2026-02-06 19:05 UTC' },
  ];

  const users = [
    { user: 'alice@anchor.ai', score: 92, peerAvg: 34, logins: '142 / 30d', topResources: 'Finance DB, HR Portal', change: '+8' },
    { user: 'svc-backup', score: 78, peerAvg: 21, logins: '720 / 30d', topResources: 'Backup Vault, File Shares', change: '+12' },
    { user: 'contractor@anchor.ai', score: 66, peerAvg: 30, logins: '38 / 30d', topResources: 'SharePoint, Teams', change: '-4' },
    { user: 'ops-lead@anchor.ai', score: 59, peerAvg: 28, logins: '210 / 30d', topResources: 'AD, Azure Console', change: '+3' },
    { user: 'cfo@anchor.ai', score: 44, peerAvg: 36, logins: '95 / 30d', topResources: 'Finance Portal, Email', change: '+1' },
  ];

  const entities = [
    { name: 'Workstation-A12', type: 'Device', deviation: 4.2, baseline: 'Login cadence', owner: 'alice@anchor.ai' },
    { name: 'FileServer-03', type: 'Server', deviation: 3.8, baseline: 'Access volume', owner: 'infra-team' },
    { name: 'svc-deploy', type: 'Service Account', deviation: 5.1, baseline: 'API call rate', owner: 'devops' },
    { name: 'DC-Primary', type: 'Domain Controller', deviation: 6.7, baseline: 'Auth requests', owner: 'ad-admins' },
  ];

  const baselines = [
    { model: 'Login Velocity', category: 'Authentication', status: 'Trained', accuracy: '96.2%', updated: '2026-02-06' },
    { model: 'Data Egress', category: 'Data Movement', status: 'Trained', accuracy: '94.8%', updated: '2026-02-06' },
    { model: 'Role Escalation', category: 'Privilege', status: 'Retraining', accuracy: '91.5%', updated: '2026-02-05' },
    { model: 'Device Health', category: 'Endpoint', status: 'Trained', accuracy: '93.1%', updated: '2026-02-07' },
    { model: 'Network Anomaly', category: 'Network', status: 'Trained', accuracy: '95.4%', updated: '2026-02-06' },
    { model: 'App Usage', category: 'Application', status: 'Trained', accuracy: '92.7%', updated: '2026-02-05' },
  ];

  if (loading) {
    return (
      <div className="bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-500">UEBA Platform</h1>
          <p className="text-slate-400">User and entity behavior analytics with risk scoring and anomaly detection.</p>
        </div>
        <button onClick={runAnalysis} disabled={analyzing} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
          {analyzing && <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />}
          {analyzing ? 'Analyzing…' : '🤖 AI Analysis'}
        </button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Anomalies (24h)', value: 41 }, { label: 'Critical/High', value: 7 }, { label: 'Entities Tracked', value: '5,200' }, { label: 'Mean Triage Time', value: '11m' }].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-white border border-slate-700 border-b-0' : 'text-slate-400 hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Anomalies Tab */}
      {activeTab === 'anomalies' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Behavioral Anomalies Detected</h2>
          {anomalies.map(a => (
            <div key={a.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{a.user}</span>
                <span className={`px-2 py-1 rounded text-xs ${a.risk >= 90 ? 'bg-red-500/20 text-red-300' : a.risk >= 80 ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-200'}`}>Risk {a.risk}</span>
              </div>
              <div className="text-slate-300 mt-1">{a.behavior}</div>
              <div className="flex gap-4 text-xs text-slate-500 mt-1">
                <span>Entity: {a.entity}</span>
                <span>{a.ts}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">User Risk Scores</h2>
          {users.map(u => (
            <div key={u.user} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-semibold">{u.user}</div>
                <div className="text-xs text-slate-500">Logins: {u.logins} · Peer avg: {u.peerAvg}</div>
                <div className="text-xs text-slate-500">Top resources: {u.topResources}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold">{u.score}</div>
                <div className={`text-xs ${u.change.startsWith('+') ? 'text-red-400' : 'text-green-400'}`}>{u.change}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Entities Tab */}
      {activeTab === 'entities' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Entity Anomalies</h2>
          {entities.map(e => (
            <div key={e.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-semibold">{e.name}</div>
                <div className="text-xs text-slate-500">{e.type} · Owner: {e.owner}</div>
                <div className="text-xs text-slate-500">Baseline: {e.baseline}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold">{e.deviation}σ</div>
                <div className="text-xs text-orange-400">deviation</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Baselines Tab */}
      {activeTab === 'baselines' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">ML Model Baselines</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {baselines.map(b => (
              <div key={b.model} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{b.model}</span>
                  <span className={`px-2 py-1 rounded text-xs ${b.status === 'Trained' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-200'}`}>{b.status}</span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500 mt-2">
                  <span>Category: {b.category}</span>
                  <span>Accuracy: {b.accuracy}</span>
                  <span>Updated: {b.updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-blue-400 mb-2">🤖 AI Analysis</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default UEBAPlatform;
