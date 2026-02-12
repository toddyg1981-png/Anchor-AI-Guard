import React, { useState } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

const SIEMPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'correlations' | 'sources' | 'rules' | 'search'>('events');

  const tabs = [
    { key: 'events' as const, label: 'Event Stream' },
    { key: 'correlations' as const, label: 'Correlated Alerts' },
    { key: 'sources' as const, label: 'Log Sources' },
    { key: 'rules' as const, label: 'Detection Rules' },
    { key: 'search' as const, label: 'Log Search' },
  ];

  const events = [
    { id: 'e-1', timestamp: '2026-02-12 09:14:33.442', source: 'WAF', severity: 'Critical', message: 'SQL injection blocked — POST /api/auth/login from 203.0.113.42', category: 'Web Attack', eps: 42 },
    { id: 'e-2', timestamp: '2026-02-12 09:14:31.891', source: 'DNS Resolver', severity: 'Critical', message: 'DNS tunneling detected — exfil-tunnel.bad-actor.net (TXT, high entropy)', category: 'Exfiltration', eps: 8 },
    { id: 'e-3', timestamp: '2026-02-12 09:14:29.103', source: 'EDR Agent', severity: 'High', message: 'Suspicious PowerShell execution on WORKSTATION-042 — encoded command', category: 'Endpoint', eps: 156 },
    { id: 'e-4', timestamp: '2026-02-12 09:14:27.554', source: 'IAM / Azure AD', severity: 'Medium', message: 'Impossible travel: admin@anchor.ai login from London 3m after New York', category: 'Identity', eps: 23 },
    { id: 'e-5', timestamp: '2026-02-12 09:14:25.012', source: 'Firewall', severity: 'Low', message: 'Outbound connection to known scanning service (Shodan) from 10.20.4.55', category: 'Reconnaissance', eps: 890 },
    { id: 'e-6', timestamp: '2026-02-12 09:14:22.771', source: 'Cloud Audit', severity: 'High', message: 'AWS S3 bucket "prod-backups" ACL changed to public-read', category: 'Cloud', eps: 34 },
    { id: 'e-7', timestamp: '2026-02-12 09:14:18.339', source: 'DLP', severity: 'Critical', message: 'PII detected in outbound email (12,000 customer records)', category: 'Data Loss', eps: 5 },
  ];

  const correlatedAlerts = [
    { id: 'c-1', name: 'Active Breach — Lateral Movement Chain', severity: 'Critical', sources: ['EDR', 'IAM', 'Firewall'], events: 47, mitreTactics: ['Initial Access', 'Lateral Movement', 'Exfiltration'], timestamp: '2026-02-12 09:12:00', status: 'Open — SOC Investigating' },
    { id: 'c-2', name: 'Credential Stuffing Campaign', severity: 'High', sources: ['WAF', 'IAM', 'DNS'], events: 891, mitreTactics: ['Credential Access', 'Brute Force'], timestamp: '2026-02-12 08:55:00', status: 'Auto-Mitigated' },
    { id: 'c-3', name: 'Cloud Misconfiguration → Data Exposure', severity: 'High', sources: ['Cloud Audit', 'DLP'], events: 12, mitreTactics: ['Collection', 'Exfiltration'], timestamp: '2026-02-12 09:14:22', status: 'Open — Remediating' },
    { id: 'c-4', name: 'DNS Exfiltration from Compromised Workstation', severity: 'Critical', sources: ['DNS', 'EDR', 'DLP'], events: 234, mitreTactics: ['Exfiltration', 'Command and Control'], timestamp: '2026-02-12 09:14:31', status: 'Contained' },
  ];

  const logSources = [
    { name: 'EDR / XDR Agents', type: 'Endpoint', eps: 12400, status: 'Connected', retention: '90 days', format: 'JSON' },
    { name: 'Web Application Firewall', type: 'Network', eps: 4200, status: 'Connected', retention: '90 days', format: 'JSON' },
    { name: 'DNS Resolver Logs', type: 'Network', eps: 28400, status: 'Connected', retention: '90 days', format: 'JSON' },
    { name: 'AWS CloudTrail', type: 'Cloud', eps: 3400, status: 'Connected', retention: '365 days', format: 'JSON' },
    { name: 'Azure AD / Entra', type: 'Identity', eps: 2300, status: 'Connected', retention: '365 days', format: 'JSON' },
    { name: 'Firewall (Palo Alto)', type: 'Network', eps: 89000, status: 'Connected', retention: '30 days', format: 'Syslog' },
    { name: 'Kubernetes Audit', type: 'Cloud', eps: 5600, status: 'Connected', retention: '90 days', format: 'JSON' },
    { name: 'DLP Engine', type: 'Data', eps: 500, status: 'Connected', retention: '180 days', format: 'JSON' },
    { name: 'Email Gateway', type: 'Network', eps: 1800, status: 'Connected', retention: '90 days', format: 'CEF' },
    { name: 'Application Logs', type: 'Application', eps: 34000, status: 'Connected', retention: '30 days', format: 'JSON' },
  ];

  const detectionRules = [
    { id: 'R-001', name: 'Brute Force Login (5+ failures in 5m)', category: 'Identity', mitre: 'T1110', enabled: true, fires24h: 23 },
    { id: 'R-002', name: 'Impossible Travel Login', category: 'Identity', mitre: 'T1078', enabled: true, fires24h: 3 },
    { id: 'R-003', name: 'PowerShell Encoded Command', category: 'Endpoint', mitre: 'T1059.001', enabled: true, fires24h: 12 },
    { id: 'R-004', name: 'DNS Tunneling (entropy > 3.5)', category: 'Network', mitre: 'T1048.003', enabled: true, fires24h: 8 },
    { id: 'R-005', name: 'S3 Bucket ACL → Public', category: 'Cloud', mitre: 'T1530', enabled: true, fires24h: 1 },
    { id: 'R-006', name: 'Lateral Movement via PsExec/WMI', category: 'Endpoint', mitre: 'T1021', enabled: true, fires24h: 4 },
    { id: 'R-007', name: 'Large Data Exfiltration (>100MB)', category: 'Data', mitre: 'T1041', enabled: true, fires24h: 2 },
    { id: 'R-008', name: 'New Admin Account Created', category: 'Identity', mitre: 'T1136', enabled: true, fires24h: 0 },
    { id: 'R-009', name: 'DGA Domain Resolution', category: 'Network', mitre: 'T1568.002', enabled: true, fires24h: 15 },
    { id: 'R-010', name: 'Multi-Vector Attack Correlation', category: 'Cross-Domain', mitre: 'Multiple', enabled: true, fires24h: 2 },
  ];

  const totalEPS = logSources.reduce((sum, s) => sum + s.eps, 0);
  const stats = [
    { label: 'Events/Second', value: totalEPS.toLocaleString() },
    { label: 'Log Sources', value: logSources.length.toString() },
    { label: 'Active Alerts', value: correlatedAlerts.filter(a => a.status.startsWith('Open')).length.toString() },
    { label: 'Detection Rules', value: detectionRules.length.toString() },
  ];

  const { loading, analyzing, analysisResult, runAnalysis, clearAnalysis } = useSecurityModule('siem', {
    events, correlatedAlerts, detectionRules, logSources, stats,
  });

  const severityColor = (s: string) => { switch (s) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };

  if (loading) return (<div className="bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" /></div>);

  return (
    <div className="bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">SIEM &amp; Log Management</h1>
          <p className="text-slate-400">Centralized log ingestion, correlation engine, threat detection, and cross-domain attack chain analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => runAnalysis()} disabled={analyzing} className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">{analyzing ? 'Analyzing…' : '🤖 AI Analysis'}</button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-green-400">Ingestion: Healthy</div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (<div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.label}</div><div className="text-2xl font-semibold mt-1">{s.value}</div></div>))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-1">
        {tabs.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-cyan-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>))}
      </div>

      {activeTab === 'events' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Live Event Stream</h2>
          {events.map(e => (
            <div key={e.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1 flex-1"><div className="text-slate-300">{e.message}</div><div className="text-xs text-slate-500">{e.source} · {e.category} · {e.timestamp}</div></div>
              <span className={`text-xs font-medium ml-4 ${severityColor(e.severity)}`}>{e.severity}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'correlations' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Correlated Attack Chains</h2>
          {correlatedAlerts.map(c => (
            <div key={c.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm space-y-2">
              <div className="flex items-center justify-between"><span className="font-semibold text-lg">{c.name}</span><span className={`text-xs font-medium ${severityColor(c.severity)}`}>{c.severity}</span></div>
              <div className="flex flex-wrap gap-1">{c.mitreTactics.map(t => <span key={t} className="bg-slate-800 text-xs text-cyan-300 px-2 py-0.5 rounded">{t}</span>)}</div>
              <div className="flex items-center justify-between text-xs text-slate-500"><span>{c.events} events from {c.sources.join(', ')}</span><span className={c.status.includes('Open') ? 'text-red-400' : 'text-green-400'}>{c.status}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Connected Log Sources</h2>
          {logSources.map(s => (
            <div key={s.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold">{s.name} <span className="text-xs text-slate-500">[{s.type}]</span></div><div className="text-xs text-slate-400">Format: {s.format} · Retention: {s.retention}</div></div>
              <div className="flex items-center gap-3 text-xs"><span className="text-yellow-300">{s.eps.toLocaleString()} EPS</span><span className="text-green-400">{s.status}</span></div>
            </div>
          ))}
          <div className="text-sm text-slate-400 text-right">Total ingestion: <span className="text-white font-semibold">{totalEPS.toLocaleString()} EPS</span></div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Detection Rules (MITRE ATT&CK Mapped)</h2>
          {detectionRules.map(r => (
            <div key={r.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div><span className="text-xs text-cyan-400 mr-2">{r.id}</span><span className="text-slate-200">{r.name}</span><span className="ml-2 text-xs text-slate-500">[{r.category} · {r.mitre}]</span></div>
              <div className="flex items-center gap-3 text-xs"><span className="text-yellow-300">{r.fires24h} fires</span><span className={r.enabled ? 'text-green-400' : 'text-slate-500'}>{r.enabled ? 'Enabled' : 'Disabled'}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'search' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Log Search</h2>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <div className="flex gap-2"><input type="text" placeholder='source:"EDR" AND severity:"Critical" AND timestamp:[now-1h TO now]' className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" /><button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Search</button></div>
            <div className="text-xs text-slate-500 mt-2">Lucene-style query syntax · Search across {totalEPS.toLocaleString()} EPS from {logSources.length} sources · Retention up to 365 days</div>
          </div>
          <div className="text-center text-slate-500 text-sm py-8">Enter a search query to explore logs across all connected sources.</div>
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-cyan-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-cyan-400">🤖 AI Analysis</h2><button onClick={() => clearAnalysis()} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default SIEMPlatform;
