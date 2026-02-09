import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

const TABS = ['flows', 'anomalies', 'protocols', 'captures'] as const;
type Tab = typeof TABS[number];

const NetworkTrafficAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('flows');

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try { setLoading(true); await backendApi.modules.getDashboard('network-traffic'); }
    catch (e) { console.error('Failed to load network traffic dashboard', e); }
    finally { setLoading(false); }
  };

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      const res = await backendApi.modules.analyze('network-traffic', 'Analyze network traffic patterns for anomalies, C2 beaconing, data exfiltration, and lateral movement indicators');
      setAnalysisResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    } catch (e) { setAnalysisResult('Analysis failed – see console for details.'); console.error(e); }
    finally { setAnalyzing(false); }
  };

  const anomalies = [
    { id: 'n-1', label: 'DNS tunneling via TXT records to suspicious domain', severity: 'Critical', action: 'Blocked', time: '1m ago' },
    { id: 'n-2', label: 'Beaconing pattern to 185.234.218.42 every 60s', severity: 'Critical', action: 'Blocked', time: '3m ago' },
    { id: 'n-3', label: 'Unusual outbound on port 4444 from WORKSTATION-17', severity: 'High', action: 'Alerted', time: '8m ago' },
    { id: 'n-4', label: 'Large outbound transfer 2.1 GB to 91.215.85.10', severity: 'High', action: 'Investigating', time: '14m ago' },
    { id: 'n-5', label: 'Lateral SMB scans from ENG-33 across /24 subnet', severity: 'Medium', action: 'Investigating', time: '18m ago' },
  ];

  const flows = [
    { src: '10.0.1.24:49812', dst: '52.35.18.200:443', bytes: '1.2 GB', packets: '842K', proto: 'TCP', flags: 'SYN ACK PSH' },
    { src: '10.0.3.18:52100', dst: '13.107.42.14:443', bytes: '980 MB', packets: '655K', proto: 'TCP', flags: 'SYN ACK' },
    { src: '10.0.9.55:61234', dst: '91.215.85.10:8080', bytes: '860 MB', packets: '91K', proto: 'TCP', flags: 'SYN ACK PSH FIN' },
    { src: '10.0.2.10:53', dst: '8.8.8.8:53', bytes: '42 MB', packets: '310K', proto: 'UDP', flags: '—' },
    { src: '10.0.5.77:22', dst: '10.0.5.200:49300', bytes: '18 MB', packets: '12K', proto: 'TCP', flags: 'SYN ACK PSH' },
  ];

  const topTalkers = [
    { src: '10.0.1.24', dst: 'api.anchor.ai', bytes: '4.2 GB', sessions: 842 },
    { src: '10.0.3.18', dst: 'storage.anchor.ai', bytes: '3.1 GB', sessions: 655 },
    { src: '10.0.9.55', dst: 'unknown-external', bytes: '860 MB', sessions: 91 },
  ];

  const protocols = [
    { name: 'HTTPS (TLS 1.3)', pct: 62, bytes: '7.9 GB', anomalous: false },
    { name: 'HTTP (plaintext)', pct: 4, bytes: '512 MB', anomalous: true },
    { name: 'DNS', pct: 14, bytes: '1.8 GB', anomalous: true },
    { name: 'SSH', pct: 8, bytes: '1.0 GB', anomalous: false },
    { name: 'RDP', pct: 3, bytes: '384 MB', anomalous: true },
    { name: 'SMB', pct: 5, bytes: '640 MB', anomalous: true },
    { name: 'Other TCP/UDP', pct: 4, bytes: '512 MB', anomalous: false },
  ];

  const captures = [
    { id: 'pcap-1', name: 'full-capture-20260207-0800.pcap', size: '1.4 GB', duration: '60 min', filter: 'host 10.0.9.55', ts: '2026-02-07 08:00' },
    { id: 'pcap-2', name: 'dns-anomaly-20260207-0730.pcap', size: '82 MB', duration: '15 min', filter: 'port 53 and tcp', ts: '2026-02-07 07:30' },
    { id: 'pcap-3', name: 'smb-lateral-20260206-2200.pcap', size: '220 MB', duration: '30 min', filter: 'port 445', ts: '2026-02-06 22:00' },
    { id: 'pcap-4', name: 'exfil-suspect-20260206-1900.pcap', size: '2.1 GB', duration: '45 min', filter: 'host 91.215.85.10', ts: '2026-02-06 19:00' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
      </div>
    );
  }

  const handleDownload = (captureId: string) => {
    const blob = new Blob(['PCAP capture data'], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capture-${captureId}.pcap`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sevColor = (s: string) => s === 'Critical' ? 'bg-red-500/20 text-red-300' : s === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-200';

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-teal-400">Network Traffic Analysis</h1>
          <p className="text-slate-400">Flow analytics, anomaly detection, and east-west visibility.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={runAnalysis} disabled={analyzing} className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-sm font-medium flex items-center gap-2">
            {analyzing && <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />}
            {analyzing ? 'Analyzing…' : '🤖 AI Analyze'}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Span/mirror feeds: OK</div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Flows (24h)', value: '12.8M' }, { label: 'Anomalies', value: anomalies.length }, { label: 'Blocked', value: 2 }, { label: 'TLS Coverage', value: '91%' }].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-t-lg text-sm font-medium capitalize ${activeTab === t ? 'bg-slate-800 text-cyan-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>{t}</button>
        ))}
      </div>

      {/* Flows tab */}
      {activeTab === 'flows' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-semibold">Top Talkers</h2>
            {topTalkers.map(item => (
              <div key={item.src + item.dst} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                <span className="font-semibold">{item.src} → {item.dst}</span>
                <span className="text-slate-400">{item.bytes} · {item.sessions} sessions</span>
              </div>
            ))}
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 overflow-x-auto">
            <h2 className="text-lg font-semibold mb-3">Flow Records</h2>
            <table className="w-full text-sm text-left">
              <thead className="text-slate-400 border-b border-slate-700">
                <tr><th className="py-2 pr-4">Source</th><th className="py-2 pr-4">Destination</th><th className="py-2 pr-4">Bytes</th><th className="py-2 pr-4">Packets</th><th className="py-2 pr-4">Protocol</th><th className="py-2">Flags</th></tr>
              </thead>
              <tbody>
                {flows.map((f, i) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-2 pr-4 font-mono">{f.src}</td><td className="py-2 pr-4 font-mono">{f.dst}</td><td className="py-2 pr-4">{f.bytes}</td><td className="py-2 pr-4">{f.packets}</td><td className="py-2 pr-4">{f.proto}</td><td className="py-2 text-slate-400">{f.flags}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Anomalies tab */}
      {activeTab === 'anomalies' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Detected Anomalies</h2>
          {anomalies.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.label}</span>
                <span className={`px-2 py-1 rounded text-xs ${sevColor(item.severity)}`}>{item.severity}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 mt-1">
                <span>{item.action}</span>
                <span className="text-xs text-slate-500">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Protocols tab */}
      {activeTab === 'protocols' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Protocol Distribution</h2>
          {protocols.map(p => (
            <div key={p.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold flex items-center gap-2">{p.name}{p.anomalous && <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-300">Anomalous traffic</span>}</span>
                <span className="text-slate-400">{p.bytes} ({p.pct}%)</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${p.anomalous ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Captures tab */}
      {activeTab === 'captures' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">PCAP Capture Sessions</h2>
          {captures.map(c => (
            <div key={c.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold font-mono">{c.name}</span>
                <button onClick={() => handleDownload(c.id || 'latest')} className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-xs font-medium">Download</button>
              </div>
              <div className="flex items-center gap-4 text-slate-400 mt-1 text-xs">
                <span>Size: {c.size}</span>
                <span>Duration: {c.duration}</span>
                <span>Filter: <code className="text-cyan-300">{c.filter}</code></span>
                <span className="text-slate-500">{c.ts}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="bg-slate-800 border border-cyan-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-cyan-400">🤖 AI Analysis Result</h2>
            <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white text-sm">✕ Close</button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap max-h-64 overflow-y-auto">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default NetworkTrafficAnalysis;
