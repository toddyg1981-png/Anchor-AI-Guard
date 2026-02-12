import React, { useState } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

const CASBSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shadow-it' | 'apps' | 'policies' | 'incidents' | 'analytics'>('shadow-it');

  const tabs = [
    { key: 'shadow-it' as const, label: 'Shadow IT Discovery' },
    { key: 'apps' as const, label: 'Sanctioned Apps' },
    { key: 'policies' as const, label: 'Policies' },
    { key: 'incidents' as const, label: 'Incidents' },
    { key: 'analytics' as const, label: 'Analytics' },
  ];

  const shadowITApps = [
    { name: 'WeTransfer', category: 'File Sharing', users: 34, riskScore: 8, dataVolume: '12.4 GB', verdict: 'Block', reason: 'Unencrypted file transfer, no DLP' },
    { name: 'ChatGPT (personal)', category: 'AI / ML', users: 67, riskScore: 9, dataVolume: '890 MB', verdict: 'Block', reason: 'Code & data leakage to external LLM' },
    { name: 'Notion (personal)', category: 'Productivity', users: 12, riskScore: 6, dataVolume: '2.1 GB', verdict: 'Monitor', reason: 'Duplicate of sanctioned Confluence' },
    { name: 'Personal Gmail', category: 'Webmail', users: 89, riskScore: 7, dataVolume: '4.8 GB', verdict: 'Block uploads', reason: 'Data exfiltration risk via attachments' },
    { name: 'Dropbox (personal)', category: 'Cloud Storage', users: 23, riskScore: 8, dataVolume: '34.2 GB', verdict: 'Block', reason: 'Unmanaged cloud storage, no audit trail' },
    { name: 'Pastebin', category: 'Code Sharing', users: 8, riskScore: 9, dataVolume: '120 MB', verdict: 'Block', reason: 'Public code sharing — secrets exposure risk' },
    { name: 'Airtable', category: 'Database', users: 5, riskScore: 5, dataVolume: '340 MB', verdict: 'Monitor', reason: 'Customer data outside sanctioned CRM' },
  ];

  const sanctionedApps = [
    { name: 'Microsoft 365', category: 'Productivity', users: 412, compliance: 'Compliant', dlpEnabled: true, ssoEnabled: true, lastAudit: '2026-02-10' },
    { name: 'Slack', category: 'Communication', users: 380, compliance: 'Compliant', dlpEnabled: true, ssoEnabled: true, lastAudit: '2026-02-09' },
    { name: 'GitHub Enterprise', category: 'Development', users: 245, compliance: 'Compliant', dlpEnabled: true, ssoEnabled: true, lastAudit: '2026-02-11' },
    { name: 'Salesforce', category: 'CRM', users: 89, compliance: 'Compliant', dlpEnabled: true, ssoEnabled: true, lastAudit: '2026-02-08' },
    { name: 'AWS Console', category: 'Cloud', users: 42, compliance: 'Compliant', dlpEnabled: false, ssoEnabled: true, lastAudit: '2026-02-11' },
    { name: 'Confluence', category: 'Documentation', users: 310, compliance: 'Review Needed', dlpEnabled: false, ssoEnabled: true, lastAudit: '2026-01-28' },
    { name: 'Jira', category: 'Project Mgmt', users: 298, compliance: 'Compliant', dlpEnabled: true, ssoEnabled: true, lastAudit: '2026-02-07' },
  ];

  const casbPolicies = [
    { name: 'Block unsanctioned file sharing', scope: 'All users', status: 'Enforced', action: 'Block + Alert', violations: 423 },
    { name: 'Block uploads to personal AI services', scope: 'All users', status: 'Enforced', action: 'Block + DLP scan', violations: 891 },
    { name: 'Restrict personal webmail attachments', scope: 'All users', status: 'Enforced', action: 'Block uploads > 1MB', violations: 234 },
    { name: 'SSO enforcement for all sanctioned apps', scope: 'Sanctioned apps', status: 'Enforced', action: 'Block non-SSO login', violations: 12 },
    { name: 'DLP policy for PII in cloud apps', scope: 'All cloud apps', status: 'Enforced', action: 'Block + Quarantine', violations: 56 },
    { name: 'Block public code sharing', scope: 'Developers', status: 'Enforced', action: 'Block + Alert SOC', violations: 18 },
    { name: 'Session timeout 8h for all SaaS', scope: 'All apps', status: 'Enforced', action: 'Force re-auth', violations: 0 },
  ];

  const incidents = [
    { id: 'i-1', timestamp: '2026-02-12 09:08:44', user: 'dev-3@anchor.ai', app: 'ChatGPT', action: 'Pasted proprietary source code', severity: 'Critical', status: 'Auto-Blocked', dataVolume: '14 KB' },
    { id: 'i-2', timestamp: '2026-02-12 08:45:11', user: 'marketing@anchor.ai', app: 'Personal Gmail', action: 'Attached customer list spreadsheet', severity: 'High', status: 'Auto-Blocked', dataVolume: '2.3 MB' },
    { id: 'i-3', timestamp: '2026-02-12 08:22:33', user: 'contractor@partner.co', app: 'WeTransfer', action: 'Uploaded internal design docs', severity: 'High', status: 'Auto-Blocked', dataVolume: '45 MB' },
    { id: 'i-4', timestamp: '2026-02-11 17:14:08', user: 'dev-7@anchor.ai', app: 'Pastebin', action: 'Posted API key in public paste', severity: 'Critical', status: 'Auto-Blocked + Key Rotated', dataVolume: '1 KB' },
    { id: 'i-5', timestamp: '2026-02-11 14:55:22', user: 'sales@anchor.ai', app: 'Dropbox (personal)', action: 'Synced CRM export to personal cloud', severity: 'High', status: 'Blocked + SOC Notified', dataVolume: '12 MB' },
  ];

  const stats = [
    { label: 'Shadow IT Apps', value: '142' },
    { label: 'Sanctioned Apps', value: '28' },
    { label: 'Policy Violations (24h)', value: '67' },
    { label: 'Data Exfil Blocked', value: '2.4 GB' },
  ];

  const { loading, analyzing, analysisResult, runAnalysis } = useSecurityModule('casb', {
    saasApps, policies, dlpAlerts, stats,
  });

  const severityColor = (s: string) => { switch (s) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };
  const riskColor = (score: number) => score >= 8 ? 'text-red-400' : score >= 6 ? 'text-orange-400' : score >= 4 ? 'text-yellow-400' : 'text-green-400';

  if (loading) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400" /></div>);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Cloud Access Security Broker</h1>
          <p className="text-slate-400">Shadow IT discovery, SaaS governance, DLP for cloud apps, and data exfiltration prevention.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={runAnalysis} disabled={analyzing} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">{analyzing ? 'Analyzing…' : '🤖 AI Analysis'}</button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (<div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.label}</div><div className="text-2xl font-semibold mt-1">{s.value}</div></div>))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-1">
        {tabs.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-indigo-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>))}
      </div>

      {activeTab === 'shadow-it' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Discovered Shadow IT Applications</h2>
          {shadowITApps.map(a => (
            <div key={a.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="font-semibold">{a.name}</span><span className="text-xs text-slate-500">[{a.category}]</span></div><span className={`text-xs font-medium ${riskColor(a.riskScore)}`}>Risk: {a.riskScore}/10</span></div>
              <div className="text-slate-300 text-xs">{a.reason}</div>
              <div className="flex items-center justify-between text-xs text-slate-500"><span>{a.users} users · {a.dataVolume}</span><span className={a.verdict === 'Block' ? 'text-red-400' : 'text-yellow-400'}>{a.verdict}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'apps' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Sanctioned Cloud Applications</h2>
          {sanctionedApps.map(a => (
            <div key={a.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold">{a.name} <span className="text-xs text-slate-500">[{a.category}]</span></div><div className="text-xs text-slate-500">{a.users} users · Last audit: {a.lastAudit}</div></div>
              <div className="flex items-center gap-2 text-xs">
                {a.ssoEnabled && <span className="bg-green-900 text-green-300 px-2 py-0.5 rounded">SSO</span>}
                {a.dlpEnabled && <span className="bg-blue-900 text-blue-300 px-2 py-0.5 rounded">DLP</span>}
                <span className={a.compliance === 'Compliant' ? 'text-green-400' : 'text-yellow-400'}>{a.compliance}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">CASB Policies</h2>
          {casbPolicies.map(p => (
            <div key={p.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div><span className="text-slate-200">{p.name}</span><span className="ml-2 text-xs text-slate-500">[{p.scope}]</span></div>
              <div className="flex items-center gap-3 text-xs"><span className="text-slate-400">{p.violations} violations</span><span className="text-green-400">{p.status}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Data Protection Incidents</h2>
          {incidents.map(i => (
            <div key={i.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center justify-between"><span className="font-semibold">{i.user} → {i.app}</span><span className={`text-xs font-medium ${severityColor(i.severity)}`}>{i.severity}</span></div>
              <div className="text-slate-300">{i.action}</div>
              <div className="flex items-center justify-between text-xs text-slate-500"><span>{i.dataVolume} · {i.timestamp}</span><span className="text-green-400">{i.status}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">SaaS Risk Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ l: 'High-Risk Apps', v: '23' }, { l: 'Unmanaged Accounts', v: '312' }, { l: 'Data Transferred (30d)', v: '2.4 TB' }, { l: 'Blocked Transfers', v: '891' }].map(s => (
              <div key={s.l} className="bg-slate-900 border border-slate-700 rounded-xl p-3"><div className="text-slate-400 text-xs">{s.l}</div><div className="text-xl font-semibold mt-1">{s.v}</div></div>
            ))}
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-indigo-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-indigo-400">🤖 AI Analysis</h2><button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default CASBSecurity;
