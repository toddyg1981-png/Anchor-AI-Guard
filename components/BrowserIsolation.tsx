import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

const BrowserIsolation: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'policies' | 'threats-blocked' | 'analytics'>('sessions');

  const tabs = [
    { key: 'sessions' as const, label: 'Sessions' },
    { key: 'policies' as const, label: 'Policies' },
    { key: 'threats-blocked' as const, label: 'Threats Blocked' },
    { key: 'analytics' as const, label: 'Analytics' },
  ];

  const sessions = [
    { id: 's-1', user: 'alice@anchor.ai', urlCategory: 'News / Media', renderMode: 'Pixel', riskLevel: 'Low', site: 'news-site.com', time: '2m ago' },
    { id: 's-2', user: 'cfo@anchor.ai', urlCategory: 'File Sharing', renderMode: 'DOM', riskLevel: 'High', site: 'file-share.net', time: '14m ago' },
    { id: 's-3', user: 'contractor@anchor.ai', urlCategory: 'Uncategorized', renderMode: 'Stream', riskLevel: 'Critical', site: 'unknown-domain.xyz', time: '21m ago' },
    { id: 's-4', user: 'dev@anchor.ai', urlCategory: 'Developer Tools', renderMode: 'DOM', riskLevel: 'Low', site: 'github.com', time: '28m ago' },
    { id: 's-5', user: 'hr@anchor.ai', urlCategory: 'Social Media', renderMode: 'Pixel', riskLevel: 'Medium', site: 'linkedin.com', time: '35m ago' },
  ];

  const policies = [
    { name: 'Untrusted sites open in isolation', category: 'URL Categorization', status: 'On' },
    { name: 'Download sanitization (MIME and macros)', category: 'File Download', status: 'On' },
    { name: 'Clipboard copy/paste restrictions', category: 'Clipboard', status: 'On' },
    { name: 'Session recording for high-risk roles', category: 'URL Categorization', status: 'On' },
    { name: 'Time-of-click URL analysis', category: 'URL Categorization', status: 'On' },
    { name: 'Block executable downloads', category: 'File Download', status: 'On' },
    { name: 'Disable file uploads to uncategorized', category: 'File Download', status: 'Off' },
    { name: 'Print watermarking enabled', category: 'Clipboard', status: 'On' },
  ];

  const threatsBlocked = [
    { id: 't-1', type: 'Malware', description: 'Trojan dropper via drive-by download', source: 'malicious-cdn.xyz/payload.js', timestamp: '2026-02-07 09:14:22', severity: 'Critical' },
    { id: 't-2', type: 'Phishing', description: 'Credential harvesting page mimicking O365', source: 'login-m1crosoft.com', timestamp: '2026-02-07 08:52:11', severity: 'High' },
    { id: 't-3', type: 'Drive-by', description: 'Exploit kit targeting browser CVE-2025-4891', source: 'ad-network.biz/iframe', timestamp: '2026-02-07 07:31:09', severity: 'Critical' },
    { id: 't-4', type: 'Malware', description: 'Ransomware loader disguised as PDF', source: 'fileshare.net/invoice.pdf.exe', timestamp: '2026-02-07 06:18:44', severity: 'High' },
    { id: 't-5', type: 'Phishing', description: 'Fake SSO portal for internal apps', source: 'anchor-sso-login.tk', timestamp: '2026-02-06 23:05:37', severity: 'Medium' },
  ];

  const analytics = {
    bandwidthSaved: '42.3 GB',
    avgSessionDuration: '8m 32s',
    peakConcurrent: 312,
    userAdoption: '87%',
    isolatedPageLoads: 14829,
    policyBlocks: 643,
    avgLatencyOverhead: '18ms',
    topCategories: [
      { category: 'Uncategorized', pct: 34 },
      { category: 'File Sharing', pct: 22 },
      { category: 'Social Media', pct: 18 },
      { category: 'News / Media', pct: 14 },
      { category: 'Other', pct: 12 },
    ],
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      await backendApi.modules.getDashboard('browser-isolation');
    } catch { /* use defaults */ } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setAnalysisResult(null);
      const res = await backendApi.modules.analyze('browser-isolation', 'Analyze browser isolation sessions for policy evasion attempts and recommend tighter policies');
      setAnalysisResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    } catch {
      setAnalysisResult('Analysis unavailable — backend did not respond.');
    } finally {
      setAnalyzing(false);
    }
  };

  const riskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">Browser Isolation</h1>
          <p className="text-slate-400">Remote browser isolation to stop drive-by malware and zero-days.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={runAnalysis} disabled={analyzing} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            {analyzing ? <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" /> Analyzing...</> : '🤖 AI Analysis'}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Isolation nodes: Healthy</div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Isolated sessions (24h)', value: '1,842' }, { label: 'Threats blocked', value: '61' }, { label: 'Downloads sanitized', value: '204' }, { label: 'High-risk users', value: '38' }].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 border-b border-slate-700 pb-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-emerald-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Active Isolation Sessions</h2>
          {sessions.map(s => (
            <div key={s.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-semibold">{s.user}</div>
                <div className="text-slate-300">{s.site} <span className="text-slate-500">· {s.urlCategory}</span></div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-xs text-slate-400">{s.time}</div>
                <div className="text-xs"><span className="text-blue-400">{s.renderMode}</span> · <span className={riskColor(s.riskLevel)}>{s.riskLevel}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Isolation Policies</h2>
          {policies.map(p => (
            <div key={p.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <span className="text-slate-300">{p.name}</span>
                <span className="ml-2 text-xs text-slate-500">[{p.category}]</span>
              </div>
              <span className={`text-xs font-medium ${p.status === 'On' ? 'text-green-400' : 'text-red-400'}`}>{p.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Threats Blocked Tab */}
      {activeTab === 'threats-blocked' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Threats Blocked by Isolation</h2>
          {threatsBlocked.map(t => (
            <div key={t.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{t.type}</span>
                <span className={`text-xs font-medium ${riskColor(t.severity)}`}>{t.severity}</span>
              </div>
              <div className="text-slate-300">{t.description}</div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{t.source}</span>
                <span>{t.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Bandwidth saved', value: analytics.bandwidthSaved },
              { label: 'Avg session duration', value: analytics.avgSessionDuration },
              { label: 'Peak concurrent', value: analytics.peakConcurrent },
              { label: 'User adoption', value: analytics.userAdoption },
            ].map(m => (
              <div key={m.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="text-slate-400 text-sm">{m.label}</div>
                <div className="text-2xl font-semibold mt-1">{m.value}</div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
              <h2 className="text-lg font-semibold">Performance</h2>
              <div className="text-sm text-slate-300">Isolated page loads: <span className="text-white font-medium">{analytics.isolatedPageLoads.toLocaleString()}</span></div>
              <div className="text-sm text-slate-300">Policy blocks: <span className="text-white font-medium">{analytics.policyBlocks}</span></div>
              <div className="text-sm text-slate-300">Avg latency overhead: <span className="text-white font-medium">{analytics.avgLatencyOverhead}</span></div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
              <h2 className="text-lg font-semibold">Top Isolated Categories</h2>
              {analytics.topCategories.map(c => (
                <div key={c.category} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{c.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-2"><div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${c.pct}%` }} /></div>
                    <span className="text-slate-400 text-xs w-8 text-right">{c.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="bg-slate-800 border border-emerald-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-emerald-400">🤖 AI Analysis</h2>
            <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white text-sm">✕</button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default BrowserIsolation;
