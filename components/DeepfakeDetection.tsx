import React, { useState } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

const DeepfakeDetection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'detections' | 'realtime' | 'policies' | 'analytics'>('detections');

  const tabs = [
    { key: 'detections' as const, label: 'Detections' },
    { key: 'realtime' as const, label: 'Real-Time Monitoring' },
    { key: 'policies' as const, label: 'Policies' },
    { key: 'analytics' as const, label: 'Analytics' },
  ];

  const detections = [
    { id: 'df-1', timestamp: '2026-02-12 09:08:44', type: 'Voice Deepfake', target: 'CFO impersonation call to finance team', confidence: 97.4, method: 'Neural voice cloning', source: 'VoIP Gateway', severity: 'Critical', status: 'Auto-Blocked', detail: 'AI-generated voice mimicking CFO requesting $2.4M wire transfer — spectral analysis flagged unnatural formant transitions' },
    { id: 'df-2', timestamp: '2026-02-12 08:22:11', type: 'Video Deepfake', target: 'CEO video message to all-hands Zoom', confidence: 94.1, method: 'Face swap (FaceSwap v4)', source: 'Video Conference', severity: 'Critical', status: 'Quarantined', detail: 'Deepfake video of CEO announcing layoffs — detected via blink rate anomaly and lip-sync mismatch' },
    { id: 'df-3', timestamp: '2026-02-11 16:33:55', type: 'Document Forgery', target: 'Fabricated board resolution PDF', confidence: 89.2, method: 'AI-generated signatures', source: 'Email Attachment', severity: 'High', status: 'Flagged', detail: 'Forged document with AI-generated signatures — pixel-level analysis detected GAN artifacts' },
    { id: 'df-4', timestamp: '2026-02-11 11:14:22', type: 'Voice Deepfake', target: 'IT admin impersonation for password reset', confidence: 92.8, method: 'Voice synthesis', source: 'Phone System', severity: 'High', status: 'Auto-Blocked', detail: 'Caller requested password reset using synthetic voice matching IT admin — prosody analysis flagged' },
    { id: 'df-5', timestamp: '2026-02-10 14:45:03', type: 'Image Manipulation', target: 'Modified ID badge photo for physical access', confidence: 86.5, method: 'GAN face generation', source: 'Badge System', severity: 'Medium', status: 'Alert Sent', detail: 'Submitted badge photo detected as AI-generated — no matching employee in HR system' },
  ];

  const realtimeMonitors = [
    { channel: 'Video Conferencing (Zoom/Teams)', status: 'Active', checked24h: 142, detected: 1, latency: '< 200ms', method: 'Facial landmark + lip sync + blink rate' },
    { channel: 'VoIP / Phone System', status: 'Active', checked24h: 891, detected: 2, latency: '< 100ms', method: 'Spectral analysis + prosody + voice print' },
    { channel: 'Email Attachments (Images/PDFs)', status: 'Active', checked24h: 4200, detected: 1, latency: '< 2s', method: 'GAN artifact detection + metadata analysis' },
    { channel: 'Badge / Identity Photos', status: 'Active', checked24h: 34, detected: 1, latency: '< 500ms', method: 'Face generation classifier + HR cross-ref' },
    { channel: 'Social Media Mentions', status: 'Active', checked24h: 2300, detected: 0, latency: '< 5s', method: 'Brand impersonation + face matching' },
  ];

  const dfPolicies = [
    { name: 'Auto-block voice deepfakes on financial calls', scope: 'Finance team', status: 'Enforced' },
    { name: 'Flag video deepfakes in all-hands meetings', scope: 'Company-wide', status: 'Enforced' },
    { name: 'Require voice verification for password resets', scope: 'IT / Help Desk', status: 'Enforced' },
    { name: 'Scan all email image attachments for GAN artifacts', scope: 'All users', status: 'Enforced' },
    { name: 'Cross-reference badge photos with HR database', scope: 'Physical security', status: 'Enforced' },
    { name: 'Alert C-suite on any deepfake targeting executives', scope: 'Executive team', status: 'Enforced' },
    { name: 'Dual verification for wire transfers > $10K', scope: 'Finance', status: 'Enforced' },
  ];

  const analyticsData = {
    totalScanned30d: 28400,
    deepfakesDetected30d: 18,
    falsePositiveRate: '0.8%',
    avgConfidence: '93.2%',
    byType: [
      { type: 'Voice Deepfake', count: 8, pct: 44 },
      { type: 'Video Deepfake', count: 4, pct: 22 },
      { type: 'Document Forgery', count: 3, pct: 17 },
      { type: 'Image Manipulation', count: 2, pct: 11 },
      { type: 'Text Generation', count: 1, pct: 6 },
    ],
  };

  const stats = [
    { label: 'Scanned (30d)', value: analyticsData.totalScanned30d.toLocaleString() },
    { label: 'Deepfakes Found', value: analyticsData.deepfakesDetected30d },
    { label: 'Avg Confidence', value: analyticsData.avgConfidence },
    { label: 'False Positive', value: analyticsData.falsePositiveRate },
  ];

  const { loading, analyzing, analysisResult, runAnalysis, clearAnalysis } = useSecurityModule('deepfake-detection', {
    detections, realtimeMonitors, dfPolicies, analyticsData, stats,
  });

  const severityColor = (s: string) => { switch (s) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };

  if (loading) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-400" /></div>);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400">Deepfake Detection</h1><span className="bg-fuchsia-900 text-fuchsia-300 text-xs font-bold px-2 py-1 rounded-full">WORLD FIRST</span></div>
          <p className="text-slate-400">Real-time voice, video, and image deepfake detection — protect against synthetic media social engineering.</p>
        </div>
        <button onClick={() => runAnalysis()} disabled={analyzing} className="bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">{analyzing ? 'Analyzing…' : '🤖 AI Analysis'}</button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (<div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.label}</div><div className="text-2xl font-semibold mt-1">{s.value}</div></div>))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-1">
        {tabs.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-fuchsia-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>))}
      </div>

      {activeTab === 'detections' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Deepfake Detections</h2>
          {detections.map(d => (
            <div key={d.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm space-y-2">
              <div className="flex items-center justify-between"><span className="font-semibold">{d.type} — {d.target}</span><span className={`text-xs font-medium ${severityColor(d.severity)}`}>{d.severity}</span></div>
              <div className="text-slate-300 text-xs">{d.detail}</div>
              <div className="flex items-center justify-between text-xs text-slate-500"><span>Confidence: <span className="text-white">{d.confidence}%</span> · {d.method} · {d.source}</span><span className={d.status.includes('Block') ? 'text-red-400' : 'text-yellow-400'}>{d.status}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'realtime' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Real-Time Monitoring Channels</h2>
          {realtimeMonitors.map(m => (
            <div key={m.channel} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold">{m.channel}</div><div className="text-xs text-slate-400">{m.method} · Latency: {m.latency}</div></div>
              <div className="flex items-center gap-3 text-xs"><span className="text-slate-400">{m.checked24h} checked</span><span className={m.detected > 0 ? 'text-red-400' : 'text-green-400'}>{m.detected} detected</span><span className="text-green-400">{m.status}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Deepfake Defense Policies</h2>
          {dfPolicies.map(p => (
            <div key={p.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div><span className="text-slate-200">{p.name}</span><span className="ml-2 text-xs text-slate-500">[{p.scope}]</span></div>
              <span className="text-xs text-green-400">{p.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Deepfake Breakdown by Type</h2>
          {analyticsData.byType.map(t => (
            <div key={t.type} className="flex items-center justify-between text-sm"><span className="text-slate-300">{t.type}</span><div className="flex items-center gap-2"><div className="w-28 bg-slate-700 rounded-full h-2"><div className="bg-fuchsia-400 h-2 rounded-full" style={{ width: `${t.pct}%` }} /></div><span className="text-slate-400 text-xs w-8 text-right">{t.count}</span></div></div>
          ))}
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-fuchsia-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-fuchsia-400">🤖 AI Analysis</h2><button onClick={() => clearAnalysis()} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default DeepfakeDetection;
