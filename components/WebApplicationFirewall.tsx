import React, { useState } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

const WebApplicationFirewall: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'traffic' | 'rules' | 'blocked' | 'ratelimit' | 'analytics'>('traffic');

  const tabs = [
    { key: 'traffic' as const, label: 'Live Traffic' },
    { key: 'rules' as const, label: 'WAF Rules' },
    { key: 'blocked' as const, label: 'Blocked Requests' },
    { key: 'ratelimit' as const, label: 'Rate Limiting' },
    { key: 'analytics' as const, label: 'Analytics' },
  ];

  const liveTraffic = [
    { id: 'r-1', timestamp: '09:14:33', method: 'POST', path: '/api/auth/login', sourceIP: '203.0.113.42', country: 'CN', statusCode: 403, verdict: 'Blocked', rule: 'SQLi Pattern', latency: '2ms' },
    { id: 'r-2', timestamp: '09:14:31', method: 'GET', path: '/api/users/me', sourceIP: '198.51.100.8', country: 'US', statusCode: 200, verdict: 'Allowed', rule: '-', latency: '45ms' },
    { id: 'r-3', timestamp: '09:14:29', method: 'GET', path: '/../../etc/passwd', sourceIP: '192.0.2.99', country: 'RU', statusCode: 403, verdict: 'Blocked', rule: 'Path Traversal', latency: '1ms' },
    { id: 'r-4', timestamp: '09:14:27', method: 'POST', path: '/api/comments', sourceIP: '203.0.113.55', country: 'BR', statusCode: 403, verdict: 'Blocked', rule: 'XSS Pattern', latency: '2ms' },
    { id: 'r-5', timestamp: '09:14:25', method: 'GET', path: '/api/dashboard', sourceIP: '198.51.100.12', country: 'GB', statusCode: 200, verdict: 'Allowed', rule: '-', latency: '38ms' },
    { id: 'r-6', timestamp: '09:14:22', method: 'PUT', path: '/api/settings', sourceIP: '198.51.100.8', country: 'US', statusCode: 200, verdict: 'Allowed', rule: '-', latency: '52ms' },
    { id: 'r-7', timestamp: '09:14:18', method: 'POST', path: '/api/search', sourceIP: '203.0.113.77', country: 'IR', statusCode: 429, verdict: 'Rate Limited', rule: 'Rate Limit', latency: '1ms' },
  ];

  const wafRules = [
    { id: 'CRS-941', name: 'XSS Attack Detection', category: 'OWASP CRS', mode: 'Block', hits24h: 342, status: 'Enforced', paranoia: 2 },
    { id: 'CRS-942', name: 'SQL Injection Detection', category: 'OWASP CRS', mode: 'Block', hits24h: 891, status: 'Enforced', paranoia: 2 },
    { id: 'CRS-930', name: 'Local File Inclusion', category: 'OWASP CRS', mode: 'Block', hits24h: 124, status: 'Enforced', paranoia: 1 },
    { id: 'CRS-931', name: 'Remote File Inclusion', category: 'OWASP CRS', mode: 'Block', hits24h: 67, status: 'Enforced', paranoia: 1 },
    { id: 'CRS-932', name: 'Remote Code Execution', category: 'OWASP CRS', mode: 'Block', hits24h: 203, status: 'Enforced', paranoia: 2 },
    { id: 'CRS-944', name: 'Java Attack Detection', category: 'OWASP CRS', mode: 'Block', hits24h: 45, status: 'Enforced', paranoia: 1 },
    { id: 'ANC-001', name: 'AI-Powered Anomaly Detection', category: 'Anchor ML', mode: 'Block', hits24h: 156, status: 'Enforced', paranoia: 3 },
    { id: 'ANC-002', name: 'Bot / Scraper Detection', category: 'Anchor ML', mode: 'Challenge', hits24h: 1203, status: 'Enforced', paranoia: 2 },
    { id: 'ANC-003', name: 'API Abuse Pattern', category: 'Anchor ML', mode: 'Block', hits24h: 89, status: 'Enforced', paranoia: 2 },
    { id: 'ANC-004', name: 'Credential Stuffing', category: 'Anchor ML', mode: 'Block + CAPTCHA', hits24h: 412, status: 'Enforced', paranoia: 3 },
    { id: 'GEO-001', name: 'Geo-Blocking (Sanctioned)', category: 'GeoIP', mode: 'Block', hits24h: 78, status: 'Enforced', paranoia: 1 },
  ];

  const blockedRequests = [
    { id: 'b-1', timestamp: '2026-02-12 09:14:33', sourceIP: '203.0.113.42', method: 'POST', path: '/api/auth/login', rule: 'CRS-942 (SQLi)', payload: "' OR 1=1 --", severity: 'Critical', country: 'CN' },
    { id: 'b-2', timestamp: '2026-02-12 09:14:29', sourceIP: '192.0.2.99', method: 'GET', path: '/../../etc/passwd', rule: 'CRS-930 (LFI)', payload: '../../etc/passwd', severity: 'Critical', country: 'RU' },
    { id: 'b-3', timestamp: '2026-02-12 09:14:27', sourceIP: '203.0.113.55', method: 'POST', path: '/api/comments', rule: 'CRS-941 (XSS)', payload: '<script>document.location=…</script>', severity: 'High', country: 'BR' },
    { id: 'b-4', timestamp: '2026-02-12 09:12:44', sourceIP: '203.0.113.77', method: 'POST', path: '/api/auth/login', rule: 'ANC-004 (Credential Stuffing)', payload: '4,200 login attempts in 10 min', severity: 'Critical', country: 'IR' },
    { id: 'b-5', timestamp: '2026-02-12 09:08:11', sourceIP: '198.51.100.200', method: 'GET', path: '/wp-admin/install.php', rule: 'ANC-001 (Anomaly)', payload: 'WordPress probe on non-WP app', severity: 'Medium', country: 'DE' },
    { id: 'b-6', timestamp: '2026-02-12 08:55:02', sourceIP: '203.0.113.88', method: 'POST', path: '/api/graphql', rule: 'CRS-932 (RCE)', payload: 'Nested introspection DoS query', severity: 'High', country: 'KP' },
  ];

  const rateLimits = [
    { endpoint: '/api/auth/login', limit: '10 req/min per IP', current: 'Enforced', blocked24h: 4821, action: 'CAPTCHA → 429' },
    { endpoint: '/api/auth/register', limit: '5 req/min per IP', current: 'Enforced', blocked24h: 1203, action: '429 + Temp Ban' },
    { endpoint: '/api/search', limit: '60 req/min per user', current: 'Enforced', blocked24h: 342, action: '429' },
    { endpoint: '/api/graphql', limit: '30 req/min per user', current: 'Enforced', blocked24h: 89, action: '429 + Depth Limit' },
    { endpoint: '/api/*', limit: '300 req/min per IP (global)', current: 'Enforced', blocked24h: 156, action: '429 + IP Ban (1h)' },
    { endpoint: '/api/export/*', limit: '5 req/hour per user', current: 'Enforced', blocked24h: 23, action: '429' },
  ];

  const analytics = {
    totalRequests24h: '14.2M',
    blockedRequests24h: '42,891',
    blockRate: '0.30%',
    falsePositiveRate: '0.02%',
    avgInspectionLatency: '3.1ms',
    topAttackTypes: [
      { type: 'SQL Injection', pct: 31 },
      { type: 'Bot / Scraper', pct: 24 },
      { type: 'Credential Stuffing', pct: 18 },
      { type: 'XSS', pct: 12 },
      { type: 'Path Traversal / LFI', pct: 8 },
      { type: 'RCE Attempts', pct: 7 },
    ],
    topCountries: [
      { country: 'CN', pct: 28 },
      { country: 'RU', pct: 19 },
      { country: 'IR', pct: 12 },
      { country: 'BR', pct: 9 },
      { country: 'US', pct: 8 },
    ],
  };

  const { loading, analyzing, analysisResult, runAnalysis } = useSecurityModule('waf', {
    liveTraffic, wafRules, blocked, rateLimitConfig,
  });

  const severityColor = (s: string) => { switch (s) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };
  const verdictColor = (v: string) => v === 'Blocked' ? 'text-red-400' : v === 'Rate Limited' ? 'text-yellow-400' : 'text-green-400';

  if (loading) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-400" /></div>);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Web Application Firewall</h1>
          <p className="text-slate-400">OWASP CRS + AI-powered request inspection, bot detection, and rate limiting.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={runAnalysis} disabled={analyzing} className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">{analyzing ? 'Analyzing…' : '🤖 AI Analysis'}</button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-green-400">WAF: Active</div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[{ label: 'Total Requests', value: analytics.totalRequests24h }, { label: 'Blocked', value: analytics.blockedRequests24h }, { label: 'Block Rate', value: analytics.blockRate }, { label: 'False Positive', value: analytics.falsePositiveRate }, { label: 'Inspection Latency', value: analytics.avgInspectionLatency }].map(s => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.label}</div><div className="text-2xl font-semibold mt-1">{s.value}</div></div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-1">
        {tabs.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-red-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>))}
      </div>

      {activeTab === 'traffic' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Live Request Stream</h2>
          {liveTraffic.map(r => (
            <div key={r.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold"><span className="text-cyan-400">{r.method}</span> {r.path}</div><div className="text-xs text-slate-500">{r.sourceIP} · {r.country}{r.rule !== '-' ? ` · ${r.rule}` : ''}</div></div>
              <div className="text-right space-y-1"><span className={`text-xs font-medium ${verdictColor(r.verdict)}`}>{r.verdict}</span><div className="text-xs text-slate-500">{r.latency} · {r.timestamp}</div></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">WAF Rule Sets</h2>
          {wafRules.map(r => (
            <div key={r.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div><span className="text-xs text-cyan-400 mr-2">{r.id}</span><span className="text-slate-200">{r.name}</span><span className="ml-2 text-xs text-slate-500">[{r.category}]</span></div>
              <div className="flex items-center gap-4 text-xs"><span className="text-slate-400">PL{r.paranoia}</span><span className="text-yellow-300">{r.hits24h} hits</span><span className={r.mode === 'Block' ? 'text-red-400' : 'text-yellow-400'}>{r.mode}</span><span className="text-green-400">{r.status}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'blocked' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Blocked Requests</h2>
          {blockedRequests.map(b => (
            <div key={b.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center justify-between"><span className="font-semibold text-red-300">{b.method} {b.path}</span><span className={`text-xs font-medium ${severityColor(b.severity)}`}>{b.severity}</span></div>
              <div className="text-slate-300 text-xs font-mono bg-slate-950 rounded px-2 py-1">{b.payload}</div>
              <div className="flex items-center justify-between text-xs text-slate-500"><span>{b.sourceIP} ({b.country}) · {b.rule}</span><span>{b.timestamp}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ratelimit' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Rate Limiting Rules</h2>
          {rateLimits.map(r => (
            <div key={r.endpoint} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold text-cyan-300 font-mono">{r.endpoint}</div><div className="text-xs text-slate-500">{r.limit} → {r.action}</div></div>
              <div className="text-right"><div className="text-sm">{r.blocked24h.toLocaleString()} blocked</div><span className="text-xs text-green-400">{r.current}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
              <h2 className="text-lg font-semibold">Top Attack Types</h2>
              {analytics.topAttackTypes.map(a => (
                <div key={a.type} className="flex items-center justify-between text-sm"><span className="text-slate-300">{a.type}</span><div className="flex items-center gap-2"><div className="w-28 bg-slate-700 rounded-full h-2"><div className="bg-red-400 h-2 rounded-full" style={{ width: `${a.pct}%` }} /></div><span className="text-slate-400 text-xs w-8 text-right">{a.pct}%</span></div></div>
              ))}
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
              <h2 className="text-lg font-semibold">Top Attack Origins</h2>
              {analytics.topCountries.map(c => (
                <div key={c.country} className="flex items-center justify-between text-sm"><span className="text-slate-300">{c.country}</span><div className="flex items-center gap-2"><div className="w-28 bg-slate-700 rounded-full h-2"><div className="bg-orange-400 h-2 rounded-full" style={{ width: `${c.pct * 2}%` }} /></div><span className="text-slate-400 text-xs w-8 text-right">{c.pct}%</span></div></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-red-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-red-400">🤖 AI Analysis</h2><button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default WebApplicationFirewall;
