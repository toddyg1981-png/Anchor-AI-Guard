import React, { useState } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

const PrivilegedAccessManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'accounts' | 'policies' | 'jit' | 'recording'>('sessions');

  const tabs = [
    { key: 'sessions' as const, label: 'Active Sessions' },
    { key: 'accounts' as const, label: 'Privileged Accounts' },
    { key: 'policies' as const, label: 'Policies' },
    { key: 'jit' as const, label: 'Just-In-Time Access' },
    { key: 'recording' as const, label: 'Session Recording' },
  ];

  const activeSessions = [
    { id: 'ps-1', user: 'admin@anchor.ai', targetSystem: 'prod-db-master', protocol: 'SSH', started: '09:02:14', duration: '12m', riskScore: 'Low', jit: true, recording: true },
    { id: 'ps-2', user: 'dba@anchor.ai', targetSystem: 'analytics-cluster', protocol: 'RDP', started: '08:44:31', duration: '30m', riskScore: 'Medium', jit: true, recording: true },
    { id: 'ps-3', user: 'sre-lead@anchor.ai', targetSystem: 'k8s-control-plane', protocol: 'kubectl', started: '08:15:00', duration: '59m', riskScore: 'High', jit: false, recording: true },
    { id: 'ps-4', user: 'contractor@partner.co', targetSystem: 'staging-api-01', protocol: 'SSH', started: '07:30:22', duration: '1h 44m', riskScore: 'Critical', jit: true, recording: true },
    { id: 'ps-5', user: 'cloud-ops@anchor.ai', targetSystem: 'aws-root-account', protocol: 'Console', started: '09:08:55', duration: '5m', riskScore: 'Critical', jit: true, recording: true },
  ];

  const privilegedAccounts = [
    { id: 'a-1', name: 'root (prod-db-master)', type: 'Local Admin', vaulted: true, lastUsed: '2026-02-12 09:02', rotationDue: '2026-02-14', passwordAge: '12d', sessions30d: 42 },
    { id: 'a-2', name: 'Administrator (win-dc-01)', type: 'Domain Admin', vaulted: true, lastUsed: '2026-02-11 14:22', rotationDue: '2026-02-13', passwordAge: '13d', sessions30d: 18 },
    { id: 'a-3', name: 'AWS Root Account', type: 'Cloud Root', vaulted: true, lastUsed: '2026-02-12 09:08', rotationDue: 'N/A (MFA only)', passwordAge: 'N/A', sessions30d: 3 },
    { id: 'a-4', name: 'sa-k8s-admin', type: 'Service Account', vaulted: true, lastUsed: '2026-02-12 08:15', rotationDue: '2026-02-15', passwordAge: '9d', sessions30d: 312 },
    { id: 'a-5', name: 'postgres (analytics)', type: 'Database', vaulted: true, lastUsed: '2026-02-12 08:44', rotationDue: '2026-02-16', passwordAge: '8d', sessions30d: 89 },
    { id: 'a-6', name: 'root (legacy-app-01)', type: 'Local Admin', vaulted: false, lastUsed: '2026-01-15 11:00', rotationDue: 'OVERDUE', passwordAge: '94d', sessions30d: 0 },
  ];

  const policies = [
    { name: 'Password rotation every 14 days', scope: 'All vaulted accounts', status: 'Enforced', compliance: '94%' },
    { name: 'Session recording for all priv access', scope: 'All privileged sessions', status: 'Enforced', compliance: '100%' },
    { name: 'JIT access required for production', scope: 'Production systems', status: 'Enforced', compliance: '88%' },
    { name: 'MFA for all privileged checkout', scope: 'All accounts', status: 'Enforced', compliance: '100%' },
    { name: 'Maximum session duration 4 hours', scope: 'All sessions', status: 'Enforced', compliance: '97%' },
    { name: 'Dual approval for cloud root accounts', scope: 'AWS/Azure/GCP root', status: 'Enforced', compliance: '100%' },
    { name: 'Contractor access expires in 8 hours', scope: 'External users', status: 'Enforced', compliance: '92%' },
    { name: 'No standing admin access', scope: 'All internal users', status: 'Enforced', compliance: '85%' },
  ];

  const jitRequests = [
    { id: 'j-1', requester: 'contractor@partner.co', target: 'staging-api-01', reason: 'Deploy hotfix v2.14.3', approved: true, approver: 'sre-lead@anchor.ai', duration: '2h', expires: '2026-02-12 09:30', status: 'Active' },
    { id: 'j-2', requester: 'dba@anchor.ai', target: 'analytics-cluster', reason: 'Monthly index rebuild', approved: true, approver: 'Auto-Approved (policy)', duration: '1h', expires: '2026-02-12 09:44', status: 'Active' },
    { id: 'j-3', requester: 'dev@anchor.ai', target: 'prod-db-master', reason: 'Debug slow query', approved: false, approver: 'Pending', duration: '30m', expires: '-', status: 'Pending Approval' },
    { id: 'j-4', requester: 'cloud-ops@anchor.ai', target: 'aws-root-account', reason: 'Update billing alert', approved: true, approver: 'cto@anchor.ai + cfo@anchor.ai', duration: '15m', expires: '2026-02-12 09:23', status: 'Active' },
    { id: 'j-5', requester: 'intern@anchor.ai', target: 'prod-k8s-cluster', reason: 'Learning Kubernetes', approved: false, approver: 'Auto-Denied (policy)', duration: '-', expires: '-', status: 'Denied' },
  ];

  const recordings = [
    { id: 'r-1', user: 'admin@anchor.ai', target: 'prod-db-master', protocol: 'SSH', timestamp: '2026-02-12 09:02', duration: '12m 44s', commands: 847, flaggedCommands: 0, risk: 'Low' },
    { id: 'r-2', user: 'contractor@partner.co', target: 'staging-api-01', protocol: 'SSH', timestamp: '2026-02-12 07:30', duration: '1h 44m', commands: 2103, flaggedCommands: 3, risk: 'High' },
    { id: 'r-3', user: 'sre-lead@anchor.ai', target: 'k8s-control-plane', protocol: 'kubectl', timestamp: '2026-02-12 08:15', duration: '59m', commands: 312, flaggedCommands: 1, risk: 'Medium' },
    { id: 'r-4', user: 'cloud-ops@anchor.ai', target: 'aws-root-account', protocol: 'Console', timestamp: '2026-02-12 09:08', duration: '5m 12s', commands: 8, flaggedCommands: 0, risk: 'Low' },
  ];

  const stats = [
    { label: 'Active Sessions', value: activeSessions.length },
    { label: 'Vaulted Accounts', value: '48' },
    { label: 'JIT Requests (24h)', value: '23' },
    { label: 'Overdue Rotations', value: '1' },
  ];

  const { loading, analyzing, analysisResult, runAnalysis, clearAnalysis } = useSecurityModule('pam', {
    privilegedAccounts, activeSessions, jitRequests, recordings, policies, stats,
  });

  const riskColor = (r: string) => { switch (r) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };

  if (loading) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400" /></div>);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">Privileged Access Management</h1>
          <p className="text-slate-400">Password vaulting, JIT access, session recording, and zero standing privilege enforcement.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => runAnalysis()} disabled={analyzing} className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">{analyzing ? 'Analyzing…' : '🤖 AI Analysis'}</button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-green-400">Vault: Sealed</div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (<div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.label}</div><div className="text-2xl font-semibold mt-1">{s.value}</div></div>))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-1">
        {tabs.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-amber-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>))}
      </div>

      {activeTab === 'sessions' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Active Privileged Sessions</h2>
          {activeSessions.map(s => (
            <div key={s.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold">{s.user}</div><div className="text-xs text-slate-400">{s.targetSystem} · {s.protocol} · {s.duration}</div></div>
              <div className="flex items-center gap-3 text-xs">
                {s.jit && <span className="bg-green-900 text-green-300 px-2 py-0.5 rounded">JIT</span>}
                {s.recording && <span className="bg-blue-900 text-blue-300 px-2 py-0.5 rounded">🔴 REC</span>}
                <span className={riskColor(s.riskScore)}>{s.riskScore}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Privileged Accounts</h2>
          {privilegedAccounts.map(a => (
            <div key={a.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold">{a.name}</div><div className="text-xs text-slate-500">{a.type} · {a.sessions30d} sessions (30d)</div></div>
              <div className="flex items-center gap-3 text-xs">
                <span className={a.vaulted ? 'text-green-400' : 'text-red-400'}>{a.vaulted ? 'Vaulted' : 'NOT VAULTED'}</span>
                <span className={a.rotationDue === 'OVERDUE' ? 'text-red-400 font-bold' : 'text-slate-400'}>{a.rotationDue}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">PAM Policies</h2>
          {policies.map(p => (
            <div key={p.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div><span className="text-slate-200">{p.name}</span><span className="ml-2 text-xs text-slate-500">[{p.scope}]</span></div>
              <div className="flex items-center gap-3 text-xs"><span className="text-green-400">{p.status}</span><span className="text-slate-400">{p.compliance} compliant</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'jit' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Just-In-Time Access Requests</h2>
          {jitRequests.map(j => (
            <div key={j.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center justify-between"><span className="font-semibold">{j.requester} → {j.target}</span><span className={`text-xs font-medium ${j.status === 'Active' ? 'text-green-400' : j.status === 'Denied' ? 'text-red-400' : 'text-yellow-400'}`}>{j.status}</span></div>
              <div className="text-slate-300 text-xs">{j.reason}</div>
              <div className="text-xs text-slate-500">Approver: {j.approver} · Duration: {j.duration}{j.expires !== '-' ? ` · Expires: ${j.expires}` : ''}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'recording' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Session Recordings</h2>
          {recordings.map(r => (
            <div key={r.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold">{r.user} → {r.target}</div><div className="text-xs text-slate-500">{r.protocol} · {r.timestamp} · {r.duration}</div></div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400">{r.commands} cmds</span>
                <span className={r.flaggedCommands > 0 ? 'text-red-400' : 'text-green-400'}>{r.flaggedCommands} flagged</span>
                <span className={riskColor(r.risk)}>{r.risk}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-amber-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-amber-400">🤖 AI Analysis</h2><button onClick={() => clearAnalysis()} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default PrivilegedAccessManagement;
