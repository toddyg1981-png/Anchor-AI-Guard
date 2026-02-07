import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

const EmailSecurity: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'threats' | 'policies' | 'quarantine' | 'analytics'>('threats');

  const tabs = [
    { key: 'threats' as const, label: 'Threats' },
    { key: 'policies' as const, label: 'Policies' },
    { key: 'quarantine' as const, label: 'Quarantine' },
    { key: 'analytics' as const, label: 'Analytics' },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      await backendApi.modules.getDashboard('email-security');
    } catch (err) {
      console.error('Failed to load email security dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setAnalysisResult(null);
      const result = await backendApi.modules.analyze('email-security', 'Analyze email threat patterns, DMARC/DKIM/SPF compliance, and recommend policy improvements');
      setAnalysisResult(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    } catch (err) {
      setAnalysisResult('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const threats = [
    { id: 'e-1', subject: 'Invoice #4892 - urgent action required', sender: 'accounts@fak3-vendor.com', type: 'Phishing', severity: 'High', status: 'Quarantined', time: '7m ago' },
    { id: 'e-2', subject: 'Payroll update - new bank details', sender: 'ceo@comp4ny-spoof.net', type: 'BEC', severity: 'Critical', status: 'Blocked', time: '16m ago' },
    { id: 'e-3', subject: 'Shared document: Q4 Report.xlsm', sender: 'noreply@fileshare-mal.io', type: 'Malware Attachment', severity: 'Critical', status: 'Blocked', time: '28m ago' },
    { id: 'e-4', subject: 'Your account has been compromised', sender: 'security@micros0ft-alert.com', type: 'Credential Harvesting', severity: 'High', status: 'Quarantined', time: '41m ago' },
  ];

  const policies = [
    { label: 'DMARC', value: 'p=reject; rua=mailto:dmarc@anchor.dev', status: 'Active', color: 'text-green-400' },
    { label: 'DKIM', value: '2048-bit RSA, selector: s1', status: 'Aligned', color: 'text-green-400' },
    { label: 'SPF', value: 'v=spf1 include:_spf.anchor.dev -all', status: 'Pass', color: 'text-green-400' },
    { label: 'Content Filtering', value: 'Block macros, executables, encrypted archives', status: 'Enforced', color: 'text-blue-400' },
    { label: 'DLP - PII', value: 'SSN, credit card, passport patterns', status: 'Active', color: 'text-green-400' },
    { label: 'DLP - Financial', value: 'Wire transfer keywords, SWIFT codes', status: 'Active', color: 'text-green-400' },
  ];

  const quarantine = [
    { id: 'q-1', subject: 'Wire transfer confirmation', sender: 'finance@susp1cious.org', reason: 'BEC Pattern', received: '12m ago' },
    { id: 'q-2', subject: 'Download your package receipt', sender: 'tracking@not-ups.com', reason: 'Phishing URL', received: '34m ago' },
    { id: 'q-3', subject: 'Meeting notes.zip', sender: 'colleague@typo-domain.com', reason: 'Malicious Attachment', received: '1h ago' },
    { id: 'q-4', subject: 'Action required: verify identity', sender: 'hr@sp00fed-corp.net', reason: 'Credential Harvesting', received: '2h ago' },
  ];

  const analytics = [
    { label: 'Emails scanned (24h)', value: '1.2M' },
    { label: 'Malicious blocked', value: '184' },
    { label: 'Quarantined', value: '133' },
    { label: 'User-reported phishing', value: '61' },
    { label: 'Avg detection time', value: '1.2s' },
    { label: 'False positive rate', value: '0.03%' },
    { label: 'Outbound DLP triggers', value: '17' },
    { label: 'Safe links rewrites', value: '48.3K' },
  ];

  const trendData = [
    { period: 'Mon', phishing: 42, bec: 8, malware: 15 },
    { period: 'Tue', phishing: 37, bec: 11, malware: 9 },
    { period: 'Wed', phishing: 55, bec: 6, malware: 22 },
    { period: 'Thu', phishing: 48, bec: 14, malware: 18 },
    { period: 'Fri', phishing: 31, bec: 9, malware: 12 },
    { period: 'Sat', phishing: 12, bec: 3, malware: 5 },
    { period: 'Sun', phishing: 8, bec: 2, malware: 3 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-blue-500">Email Security</h1>
          <p className="text-slate-400">Inbound protection, phishing defense, and domain authentication.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={runAnalysis} disabled={analyzing} className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            {analyzing ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <span>🤖</span>}
            {analyzing ? 'Analyzing...' : 'AI Analysis'}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Inbound protection: On</div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Threats Tab */}
      {activeTab === 'threats' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Email Threats</h2>
              <span className="text-xs text-slate-400">{threats.length} detected</span>
            </div>
            {threats.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{item.subject}</span>
                  <span className={`px-2 py-1 rounded text-xs ${item.severity === 'Critical' ? 'bg-red-500/20 text-red-300' : item.severity === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-200'}`}>{item.severity}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">From: {item.sender}</div>
                <div className="flex items-center justify-between text-slate-400 mt-1">
                  <span>{item.type}</span>
                  <span className="text-xs text-green-300">{item.status}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Domain Authentication &amp; Policies</h2>
              <span className="text-xs text-slate-400">DMARC / DKIM / SPF</span>
            </div>
            {policies.map(item => (
              <div key={item.label} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{item.label}</span>
                  <span className={`font-semibold text-xs ${item.color}`}>{item.status}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quarantine Tab */}
      {activeTab === 'quarantine' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Quarantined Messages</h2>
              <span className="text-xs text-slate-400">{quarantine.length} held</span>
            </div>
            {quarantine.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{item.subject}</span>
                  <span className="text-xs text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded">{item.reason}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">From: {item.sender} · {item.received}</div>
                <div className="flex gap-2 mt-2">
                  <button className="px-3 py-1 text-xs bg-green-600/20 text-green-300 border border-green-600/30 rounded hover:bg-green-600/30 transition-colors">Release</button>
                  <button className="px-3 py-1 text-xs bg-red-600/20 text-red-300 border border-red-600/30 rounded hover:bg-red-600/30 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.map(card => (
              <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="text-slate-400 text-sm">{card.label}</div>
                <div className="text-2xl font-semibold mt-1">{card.value}</div>
              </div>
            ))}
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-semibold">Weekly Threat Trends</h2>
            <div className="space-y-2">
              {trendData.map(row => (
                <div key={row.period} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                  <span className="text-slate-300 w-12 font-medium">{row.period}</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-orange-300">Phishing: {row.phishing}</span>
                    <span className="text-red-300">BEC: {row.bec}</span>
                    <span className="text-purple-300">Malware: {row.malware}</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="h-2 bg-orange-500/60 rounded" style={{ width: `${row.phishing * 1.5}px` }}></div>
                    <div className="h-2 bg-red-500/60 rounded" style={{ width: `${row.bec * 1.5}px` }}></div>
                    <div className="h-2 bg-purple-500/60 rounded" style={{ width: `${row.malware * 1.5}px` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="bg-slate-800 border border-sky-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-sky-400">🤖 AI Analysis</h2>
            <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white text-sm">✕</button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-900 rounded-lg p-3 border border-slate-700 max-h-64 overflow-y-auto">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default EmailSecurity;
