import React, { useState } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

const DNSSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queries' | 'policies' | 'threats' | 'sinkhole' | 'analytics'>('queries');

  const tabs = [
    { key: 'queries' as const, label: 'Live Queries' },
    { key: 'policies' as const, label: 'Filtering Policies' },
    { key: 'threats' as const, label: 'Threat Detections' },
    { key: 'sinkhole' as const, label: 'DNS Sinkhole' },
    { key: 'analytics' as const, label: 'Analytics' },
  ];

  const liveQueries = [
    { id: 'q-1', timestamp: '2026-02-12 09:14:33', source: '10.20.4.55', domain: 'api.github.com', type: 'A', response: '140.82.121.5', latency: '4ms', verdict: 'Allow', category: 'Developer Tools' },
    { id: 'q-2', timestamp: '2026-02-12 09:14:31', source: '10.20.2.12', domain: 'c2-beacon.malware.xyz', type: 'A', response: 'NXDOMAIN (sinkholed)', latency: '1ms', verdict: 'Blocked', category: 'C2 / Malware' },
    { id: 'q-3', timestamp: '2026-02-12 09:14:29', source: '10.20.1.88', domain: 'exfil-tunnel.bad-actor.net', type: 'TXT', response: 'BLOCKED', latency: '1ms', verdict: 'Blocked', category: 'DNS Tunneling' },
    { id: 'q-4', timestamp: '2026-02-12 09:14:27', source: '10.50.3.21', domain: 'dga-a8f3k2m9.biz', type: 'A', response: 'NXDOMAIN (sinkholed)', latency: '1ms', verdict: 'Blocked', category: 'DGA Domain' },
    { id: 'q-5', timestamp: '2026-02-12 09:14:25', source: '10.20.5.100', domain: 'outlook.office365.com', type: 'CNAME', response: 'outlook.ha.office365.com', latency: '8ms', verdict: 'Allow', category: 'Productivity' },
    { id: 'q-6', timestamp: '2026-02-12 09:14:22', source: '10.20.4.77', domain: 'fast-flux-node-42.phish.ru', type: 'A', response: 'BLOCKED', latency: '1ms', verdict: 'Blocked', category: 'Fast Flux' },
    { id: 'q-7', timestamp: '2026-02-12 09:14:18', source: '10.20.1.10', domain: 'slack.com', type: 'A', response: '34.226.134.26', latency: '6ms', verdict: 'Allow', category: 'Collaboration' },
  ];

  const filteringPolicies = [
    { name: 'Block known malware domains', feeds: 'Threat Intel (12M domains)', status: 'Enforced', action: 'Sinkhole' },
    { name: 'Block DGA-generated domains', feeds: 'ML DGA Classifier v3.2', status: 'Enforced', action: 'NXDOMAIN' },
    { name: 'Block DNS tunneling (high entropy)', feeds: 'Entropy Analyzer', status: 'Enforced', action: 'Drop + Alert' },
    { name: 'Block newly registered domains (<7d)', feeds: 'WHOIS Feed', status: 'Enforced', action: 'NXDOMAIN' },
    { name: 'Block fast-flux DNS patterns', feeds: 'Fast-Flux Detector', status: 'Enforced', action: 'Sinkhole' },
    { name: 'Enforce DNSSEC validation', feeds: 'Root Trust Anchors', status: 'Enforced', action: 'SERVFAIL on invalid' },
    { name: 'Block typosquat lookalike domains', feeds: 'Brand Protection Feed', status: 'Enforced', action: 'NXDOMAIN + Alert' },
    { name: 'Block crypto-mining pools', feeds: 'Mining Pool List (4,200)', status: 'Enforced', action: 'Sinkhole' },
    { name: 'Block adult / gambling content', feeds: 'Category Filter', status: 'Off', action: 'NXDOMAIN' },
    { name: 'Log all DNS-over-HTTPS bypass attempts', feeds: 'DoH Detector', status: 'Enforced', action: 'Log + Block' },
  ];

  const threatDetections = [
    { id: 't-1', timestamp: '2026-02-12 09:12:44', type: 'DNS Tunneling', domain: 'exfil-tunnel.bad-actor.net', source: '10.20.1.88', severity: 'Critical', detail: 'High-entropy TXT queries detected — 2.4 MB data exfil attempt over 12 minutes', status: 'Auto-Blocked' },
    { id: 't-2', timestamp: '2026-02-12 09:08:11', type: 'DGA Activity', domain: 'dga-a8f3k2m9.biz', source: '10.50.3.21', severity: 'Critical', detail: 'ML classifier flagged algorithmically-generated domain (confidence 99.2%)', status: 'Auto-Blocked' },
    { id: 't-3', timestamp: '2026-02-12 08:55:02', type: 'C2 Beacon', domain: 'c2-beacon.malware.xyz', source: '10.20.2.12', severity: 'Critical', detail: 'Known Cobalt Strike C2 infrastructure — 15-second beacon interval detected', status: 'Sinkholed' },
    { id: 't-4', timestamp: '2026-02-12 08:41:19', type: 'Fast Flux', domain: 'fast-flux-node-42.phish.ru', source: '10.20.4.77', severity: 'High', detail: '42 A records in 60 seconds — bulletproof hosting pattern', status: 'Auto-Blocked' },
    { id: 't-5', timestamp: '2026-02-12 07:33:55', type: 'DNSSEC Failure', domain: 'partner-api.example.co', source: '10.20.5.100', severity: 'Medium', detail: 'RRSIG validation failed — possible cache poisoning attempt', status: 'Quarantined' },
    { id: 't-6', timestamp: '2026-02-12 06:18:03', type: 'Typosquat', domain: 'anchr-security.com', source: '10.20.3.44', severity: 'High', detail: 'Lookalike domain registered 2 days ago — Levenshtein distance 1 from anchor-security.com', status: 'Auto-Blocked' },
  ];

  const sinkholeEntries = [
    { domain: 'c2-beacon.malware.xyz', sinkholeIP: '127.0.0.1', source: 'Threat Intel Feed', hitCount: 847, firstSeen: '2026-01-28', lastHit: '2026-02-12 09:14:31' },
    { domain: '*.dga-*.biz', sinkholeIP: '127.0.0.1', source: 'ML DGA Classifier', hitCount: 12403, firstSeen: '2026-01-15', lastHit: '2026-02-12 09:14:27' },
    { domain: 'fast-flux-node-*.phish.ru', sinkholeIP: '0.0.0.0', source: 'Fast-Flux Detector', hitCount: 3291, firstSeen: '2026-02-01', lastHit: '2026-02-12 09:14:22' },
    { domain: 'mining-pool-*.crypto.xyz', sinkholeIP: '127.0.0.1', source: 'Mining Pool List', hitCount: 562, firstSeen: '2026-02-05', lastHit: '2026-02-12 08:44:11' },
    { domain: 'anchr-security.com', sinkholeIP: '127.0.0.1', source: 'Brand Protection', hitCount: 23, firstSeen: '2026-02-10', lastHit: '2026-02-12 06:18:03' },
  ];

  const analytics = {
    totalQueries24h: 2_847_392,
    blockedQueries24h: 18_421,
    blockRate: '0.65%',
    avgLatency: '4.2ms',
    dnssecValidated: '94.7%',
    uniqueDomains: 142_381,
    topBlocked: [
      { category: 'C2 / Malware', count: 8421, pct: 46 },
      { category: 'DGA Domains', count: 4103, pct: 22 },
      { category: 'DNS Tunneling', count: 2847, pct: 15 },
      { category: 'Newly Registered', count: 1891, pct: 10 },
      { category: 'Fast Flux', count: 1159, pct: 7 },
    ],
  };

  const stats = [
    { label: 'Queries (24h)', value: analytics.totalQueries24h.toLocaleString() },
    { label: 'Blocked (24h)', value: analytics.blockedQueries24h.toLocaleString() },
    { label: 'Avg Latency', value: analytics.avgLatency },
    { label: 'DNSSEC Coverage', value: analytics.dnssecValidated },
  ];

  const { loading, analyzing, analysisResult, runAnalysis } = useSecurityModule('dns-security', {
    liveQueries, filteringPolicies, threatDetections, sinkholeData, analytics, stats,
  });

  const severityColor = (s: string) => {
    switch (s) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; }
  };

  const verdictColor = (v: string) => v === 'Blocked' || v.includes('Block') ? 'text-red-400' : v === 'Sinkholed' ? 'text-orange-400' : 'text-green-400';

  if (loading) {
    return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400" /></div>);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">DNS Security</h1>
          <p className="text-slate-400">DNS filtering, sinkholing, tunneling detection, DNSSEC enforcement &amp; DGA classification.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={runAnalysis} disabled={analyzing} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            {analyzing ? 'Analyzing…' : '🤖 AI Analysis'}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Resolver: Healthy</div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (<div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.label}</div><div className="text-2xl font-semibold mt-1">{s.value}</div></div>))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-1">
        {tabs.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-blue-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>))}
      </div>

      {activeTab === 'queries' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Live DNS Query Stream</h2>
          {liveQueries.map(q => (
            <div key={q.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-semibold">{q.domain}</div>
                <div className="text-slate-400 text-xs">{q.source} · {q.type} · {q.category}</div>
              </div>
              <div className="text-right space-y-1">
                <span className={`text-xs font-medium ${verdictColor(q.verdict)}`}>{q.verdict}</span>
                <div className="text-xs text-slate-500">{q.latency} · {q.timestamp.split(' ')[1]}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">DNS Filtering Policies</h2>
          {filteringPolicies.map(p => (
            <div key={p.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div><span className="text-slate-200">{p.name}</span><span className="ml-2 text-xs text-slate-500">[{p.feeds}]</span></div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{p.action}</span>
                <span className={`text-xs font-medium ${p.status === 'Enforced' ? 'text-green-400' : 'text-slate-500'}`}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'threats' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">DNS Threat Detections</h2>
          {threatDetections.map(t => (
            <div key={t.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{t.type}</span>
                <span className={`text-xs font-medium ${severityColor(t.severity)}`}>{t.severity}</span>
              </div>
              <div className="text-slate-300">{t.detail}</div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{t.domain} — {t.source}</span>
                <span className={verdictColor(t.status)}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sinkhole' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">DNS Sinkhole</h2>
          <p className="text-sm text-slate-400">Domains redirected to sinkhole IPs to neutralize malicious traffic.</p>
          {sinkholeEntries.map(s => (
            <div key={s.domain} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-semibold text-red-300">{s.domain}</div>
                <div className="text-xs text-slate-500">→ {s.sinkholeIP} · Source: {s.source}</div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-sm">{s.hitCount.toLocaleString()} hits</div>
                <div className="text-xs text-slate-500">Last: {s.lastHit}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[{ label: 'Block Rate', value: analytics.blockRate }, { label: 'Unique Domains', value: analytics.uniqueDomains.toLocaleString() }, { label: 'DNSSEC Validated', value: analytics.dnssecValidated }].map(m => (
              <div key={m.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{m.label}</div><div className="text-2xl font-semibold mt-1">{m.value}</div></div>
            ))}
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-semibold">Top Blocked Categories</h2>
            {analytics.topBlocked.map(c => (
              <div key={c.category} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{c.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-700 rounded-full h-2"><div className="bg-blue-400 h-2 rounded-full" style={{ width: `${c.pct}%` }} /></div>
                  <span className="text-slate-400 text-xs w-16 text-right">{c.count.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-blue-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-blue-400">🤖 AI Analysis</h2><button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default DNSSecurity;
