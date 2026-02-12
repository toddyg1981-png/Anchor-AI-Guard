import React, { useState } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

const PatchManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'deployed' | 'policies' | 'rollback' | 'compliance'>('pending');

  const tabs = [
    { key: 'pending' as const, label: 'Pending Patches' },
    { key: 'deployed' as const, label: 'Recently Deployed' },
    { key: 'policies' as const, label: 'Policies' },
    { key: 'rollback' as const, label: 'Rollback Log' },
    { key: 'compliance' as const, label: 'Compliance' },
  ];

  const pendingPatches = [
    { id: 'p-1', name: 'CVE-2026-0155 — OpenSSL RCE', severity: 'Critical', affectedAssets: 342, patchAvailable: '2026-02-10', deployWindow: '2026-02-13 02:00 UTC', status: 'Scheduled', type: 'OS Library' },
    { id: 'p-2', name: 'CVE-2026-0201 — Linux Kernel Privilege Escalation', severity: 'Critical', affectedAssets: 189, patchAvailable: '2026-02-08', deployWindow: '2026-02-14 02:00 UTC', status: 'Testing', type: 'OS Kernel' },
    { id: 'p-3', name: 'CVE-2025-9988 — PostgreSQL Auth Bypass', severity: 'High', affectedAssets: 12, patchAvailable: '2026-02-05', deployWindow: '2026-02-15 02:00 UTC', status: 'Approved', type: 'Database' },
    { id: 'p-4', name: 'CVE-2026-0089 — Node.js HTTP/2 DoS', severity: 'High', affectedAssets: 67, patchAvailable: '2026-02-11', deployWindow: '2026-02-16 02:00 UTC', status: 'Testing', type: 'Runtime' },
    { id: 'p-5', name: 'MS-2026-Feb — Windows Cumulative Update', severity: 'Medium', affectedAssets: 423, patchAvailable: '2026-02-11', deployWindow: '2026-02-18 04:00 UTC', status: 'Pending Approval', type: 'OS' },
    { id: 'p-6', name: 'CVE-2025-8877 — Apache Log4j2 (new vector)', severity: 'Critical', affectedAssets: 28, patchAvailable: '2026-02-01', deployWindow: 'OVERDUE', status: 'Blocked — Dependency Conflict', type: 'Java Library' },
  ];

  const recentDeployments = [
    { id: 'd-1', name: 'CVE-2026-0044 — nginx Buffer Overflow', deployedAt: '2026-02-11 02:14:33', assets: 89, success: 89, failed: 0, rollback: false, type: 'Web Server' },
    { id: 'd-2', name: 'CVE-2025-9901 — Docker Engine Escape', deployedAt: '2026-02-10 02:08:11', assets: 42, success: 41, failed: 1, rollback: false, type: 'Container Runtime' },
    { id: 'd-3', name: 'MS-2026-Jan — Windows Server Update', deployedAt: '2026-02-08 04:00:00', assets: 423, success: 418, failed: 5, rollback: false, type: 'OS' },
    { id: 'd-4', name: 'CVE-2025-8811 — Redis RCE', deployedAt: '2026-02-07 02:22:55', assets: 18, success: 18, failed: 0, rollback: false, type: 'Database' },
  ];

  const patchPolicies = [
    { name: 'Critical patches within 72 hours', scope: 'All systems', status: 'Enforced', compliance: '88%' },
    { name: 'High patches within 7 days', scope: 'All systems', status: 'Enforced', compliance: '94%' },
    { name: 'Medium patches within 30 days', scope: 'All systems', status: 'Enforced', compliance: '97%' },
    { name: 'Test in staging before production', scope: 'Production', status: 'Enforced', compliance: '100%' },
    { name: 'Auto-rollback on failure > 5%', scope: 'All deployments', status: 'Enforced', compliance: '100%' },
    { name: 'Maintenance window: 02:00-06:00 UTC', scope: 'Production', status: 'Enforced', compliance: '96%' },
    { name: 'Zero downtime for critical services', scope: 'Tier-1 services', status: 'Enforced', compliance: '100%' },
  ];

  const rollbackLog = [
    { id: 'r-1', patch: 'CVE-2025-7744 — glibc update', originalDeploy: '2026-01-28', rollbackAt: '2026-01-28 03:14', reason: 'Application crash on 12% of hosts', affectedAssets: 34, status: 'Rolled Back → Re-patched 2026-02-02' },
    { id: 'r-2', patch: 'MS-2025-Dec — .NET Runtime', originalDeploy: '2025-12-15', rollbackAt: '2025-12-15 05:22', reason: 'API response time 3x slower', affectedAssets: 8, status: 'Rolled Back → Vendor fix applied 2025-12-22' },
  ];

  const complianceData = {
    overallScore: '94.2%',
    criticalSLA: '88%',
    highSLA: '94%',
    mediumSLA: '97%',
    overduePatches: 1,
    avgPatchTime: '4.2 days',
    coverage: '99.1%',
  };

  const stats = [
    { label: 'Pending Patches', value: pendingPatches.length },
    { label: 'Overdue', value: pendingPatches.filter(p => p.deployWindow === 'OVERDUE').length },
    { label: 'Avg Patch Time', value: complianceData.avgPatchTime },
    { label: 'Compliance', value: complianceData.overallScore },
  ];

  const { loading, analyzing, analysisResult, runAnalysis, clearAnalysis } = useSecurityModule('patch-management', {
    pendingPatches, recentDeployments, complianceData, patchPolicies, rollbackLog, stats,
  });

  const severityColor = (s: string) => { switch (s) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };

  if (loading) return (<div className="bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-400" /></div>);

  return (
    <div className="bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-400">Patch Management</h1>
          <p className="text-slate-400">Automated patch orchestration, SLA tracking, staged rollouts, and rollback automation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => runAnalysis()} disabled={analyzing} className="bg-lime-600 hover:bg-lime-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">{analyzing ? 'Analyzing…' : '🤖 AI Analysis'}</button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (<div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.label}</div><div className="text-2xl font-semibold mt-1">{s.value}</div></div>))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-1">
        {tabs.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-lime-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>))}
      </div>

      {activeTab === 'pending' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Pending Patches</h2>
          {pendingPatches.map(p => (
            <div key={p.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center justify-between"><span className="font-semibold">{p.name}</span><span className={`text-xs font-medium ${severityColor(p.severity)}`}>{p.severity}</span></div>
              <div className="flex items-center justify-between text-xs text-slate-400"><span>{p.affectedAssets} assets · {p.type}</span><span className={p.deployWindow === 'OVERDUE' ? 'text-red-400 font-bold' : p.status.includes('Blocked') ? 'text-red-400' : 'text-slate-400'}>{p.status} · {p.deployWindow}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'deployed' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Recently Deployed</h2>
          {recentDeployments.map(d => (
            <div key={d.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold">{d.name}</div><div className="text-xs text-slate-500">{d.deployedAt} · {d.type}</div></div>
              <div className="flex items-center gap-3 text-xs"><span className="text-green-400">{d.success} ok</span>{d.failed > 0 && <span className="text-red-400">{d.failed} failed</span>}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Patch Policies</h2>
          {patchPolicies.map(p => (
            <div key={p.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div><span className="text-slate-200">{p.name}</span><span className="ml-2 text-xs text-slate-500">[{p.scope}]</span></div>
              <div className="flex items-center gap-3 text-xs"><span className="text-green-400">{p.status}</span><span className={parseInt(p.compliance) >= 95 ? 'text-green-400' : parseInt(p.compliance) >= 85 ? 'text-yellow-400' : 'text-red-400'}>{p.compliance}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'rollback' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Rollback History</h2>
          {rollbackLog.map(r => (
            <div key={r.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm space-y-2">
              <div className="font-semibold text-orange-300">{r.patch}</div>
              <div className="text-slate-300">{r.reason}</div>
              <div className="text-xs text-slate-500">Deployed: {r.originalDeploy} · Rolled back: {r.rollbackAt} · {r.affectedAssets} assets</div>
              <div className="text-xs text-green-400">{r.status}</div>
            </div>
          ))}
          {rollbackLog.length === 0 && <div className="text-center text-slate-500 py-8">No rollbacks recorded.</div>}
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-semibold">Patch SLA Compliance</h2>
            {[{ label: 'Critical (72h)', value: complianceData.criticalSLA }, { label: 'High (7d)', value: complianceData.highSLA }, { label: 'Medium (30d)', value: complianceData.mediumSLA }].map(s => (
              <div key={s.label} className="flex items-center justify-between text-sm"><span className="text-slate-400">{s.label}</span><span className={parseInt(s.value) >= 95 ? 'text-green-400' : parseInt(s.value) >= 85 ? 'text-yellow-400' : 'text-red-400'}>{s.value}</span></div>
            ))}
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-semibold">Fleet Coverage</h2>
            {[{ label: 'Asset Coverage', value: complianceData.coverage }, { label: 'Overdue Patches', value: complianceData.overduePatches }, { label: 'Avg Time to Patch', value: complianceData.avgPatchTime }, { label: 'Overall Score', value: complianceData.overallScore }].map(s => (
              <div key={s.label} className="flex items-center justify-between text-sm"><span className="text-slate-400">{s.label}</span><span className="text-white font-medium">{s.value}</span></div>
            ))}
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-lime-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-lime-400">🤖 AI Analysis</h2><button onClick={() => clearAnalysis()} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default PatchManagement;
