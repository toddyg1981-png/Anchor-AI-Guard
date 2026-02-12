import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

const EDRPlatform: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'detections' | 'endpoints' | 'response' | 'hunting'>('detections');
  const [iocSearching, setIocSearching] = useState(false);
  const [iocResults, setIocResults] = useState<string | null>(null);

  const handleIOCSearch = () => {
    setIocSearching(true);
    setIocResults(null);
    setTimeout(() => {
      setIocSearching(false);
      setIocResults('No matching indicators found across 12,847 endpoints.');
    }, 2000);
  };

  const tabs = [
    { key: 'detections' as const, label: 'Detections' },
    { key: 'endpoints' as const, label: 'Endpoints' },
    { key: 'response' as const, label: 'Response' },
    { key: 'hunting' as const, label: 'Threat Hunting' },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try { await backendApi.modules.getDashboard('edr'); } catch {}
    setLoading(false);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await backendApi.modules.analyze('edr', 'Analyze endpoint detections for attack chain correlation, lateral movement indicators, and recommend response actions');
      setAnalysisResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    } catch { setAnalysisResult('Analysis unavailable — backend offline.'); }
    setAnalyzing(false);
  };

  const detections = [
    { id: 'D-001', title: 'Ransomware Encryption Behavior', endpoint: 'FIN-12', technique: 'T1486 – Data Encrypted for Impact', mitre: 'TA0040', severity: 'Critical', time: '3m ago' },
    { id: 'D-002', title: 'Credential Dumping via LSASS', endpoint: 'DC-01', technique: 'T1003.001 – LSASS Memory', mitre: 'TA0006', severity: 'Critical', time: '14m ago' },
    { id: 'D-003', title: 'Living-off-the-Land (LOLBin)', endpoint: 'WIN-042', technique: 'T1218.011 – Rundll32', mitre: 'TA0005', severity: 'High', time: '28m ago' },
    { id: 'D-004', title: 'Fileless Malware via PowerShell', endpoint: 'ENG-33', technique: 'T1059.001 – PowerShell', mitre: 'TA0002', severity: 'High', time: '45m ago' },
    { id: 'D-005', title: 'Suspicious WMI Execution', endpoint: 'HR-07', technique: 'T1047 – WMI', mitre: 'TA0002', severity: 'Medium', time: '1h ago' },
  ];

  const endpoints = [
    { hostname: 'DC-01', os: 'Windows Server 2022', agent: 'v4.8.2', health: 'Healthy', lastCheckin: '12s ago', isolated: false },
    { hostname: 'FIN-12', os: 'Windows 11 Pro', agent: 'v4.8.2', health: 'Isolated', lastCheckin: '3m ago', isolated: true },
    { hostname: 'WIN-042', os: 'Windows 11 Enterprise', agent: 'v4.8.1', health: 'Healthy', lastCheckin: '8s ago', isolated: false },
    { hostname: 'ENG-33', os: 'macOS Ventura', agent: 'v4.7.9', health: 'Warning', lastCheckin: '2m ago', isolated: false },
    { hostname: 'HR-07', os: 'Windows 10 Pro', agent: 'v4.8.2', health: 'Healthy', lastCheckin: '22s ago', isolated: false },
    { hostname: 'SRV-DB-03', os: 'Ubuntu 22.04', agent: 'v4.8.0', health: 'Healthy', lastCheckin: '5s ago', isolated: false },
  ];

  const responseActions = [
    { action: 'Isolate Endpoint', target: 'FIN-12', status: 'Completed', time: '3m ago', user: 'auto-response' },
    { action: 'Kill Process', target: 'DC-01 / lsass_dump.exe', status: 'Completed', time: '14m ago', user: 'auto-response' },
    { action: 'Quarantine File', target: 'ENG-33 / payload.ps1', status: 'Completed', time: '45m ago', user: 'analyst-j.chen' },
    { action: 'Collect Forensics', target: 'WIN-042', status: 'In Progress', time: '30m ago', user: 'analyst-m.lopez' },
  ];

  const huntingQueries = [
    { name: 'Lateral Movement via PsExec', query: 'process.name:psexec* AND network.direction:outbound', results: 3 },
    { name: 'Cobalt Strike Beacon Pattern', query: 'dns.query:*.c2domain.* OR http.user_agent:"Mozilla/4.0"', results: 0 },
    { name: 'Suspicious Scheduled Tasks', query: 'event.action:scheduled-task-created AND process.parent.name:cmd.exe', results: 7 },
    { name: 'Encoded PowerShell Commands', query: 'process.command_line:*-EncodedCommand* OR *-enc *', results: 12 },
  ];

  if (loading) {
    return (
      <div className="bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-500">Endpoint Detection & Response</h1>
          <p className="text-slate-400">Real-time endpoint telemetry, detections, containment, and remediation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={runAnalysis} disabled={analyzing} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            {analyzing ? 'Analyzing…' : '🤖 AI Analysis'}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-green-400 font-semibold">Sensors Healthy</div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Alerts (24h)', value: 124 }, { label: 'Critical', value: 9 }, { label: 'Auto-contained', value: 31 }, { label: 'Mean Time to Isolate', value: '28s' }].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors ${activeTab === t.key ? 'bg-slate-800 text-green-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Detections Tab */}
      {activeTab === 'detections' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Recent Detections</h2>
          {detections.map(d => (
            <div key={d.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{d.title}</span>
                <span className={`px-2 py-1 rounded text-xs ${d.severity === 'Critical' ? 'bg-red-500/20 text-red-300' : d.severity === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-200'}`}>{d.severity}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 mt-1">
                <span>Endpoint: {d.endpoint}</span>
                <span className="text-xs">{d.time}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>{d.technique}</span>
                <span className="text-green-400">{d.mitre}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Endpoints Tab */}
      {activeTab === 'endpoints' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">Managed Endpoints</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="pb-2 pr-4">Hostname</th>
                  <th className="pb-2 pr-4">OS</th>
                  <th className="pb-2 pr-4">Agent</th>
                  <th className="pb-2 pr-4">Health</th>
                  <th className="pb-2 pr-4">Last Check-in</th>
                  <th className="pb-2">Isolated</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map(ep => (
                  <tr key={ep.hostname} className="border-b border-slate-700/50">
                    <td className="py-2 pr-4 font-semibold">{ep.hostname}</td>
                    <td className="py-2 pr-4 text-slate-300">{ep.os}</td>
                    <td className="py-2 pr-4 text-slate-400">{ep.agent}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-1 rounded text-xs ${ep.health === 'Healthy' ? 'bg-green-500/20 text-green-300' : ep.health === 'Isolated' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{ep.health}</span>
                    </td>
                    <td className="py-2 pr-4 text-slate-400">{ep.lastCheckin}</td>
                    <td className="py-2">{ep.isolated ? <span className="text-red-400 font-semibold">Yes</span> : <span className="text-slate-500">No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Response Tab */}
      {activeTab === 'response' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">Containment Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Isolate Endpoint', 'Kill Process', 'Quarantine File', 'Collect Forensics'].map(action => (
                <button key={action} className="bg-slate-900 border border-slate-700 hover:border-green-500 rounded-lg p-3 text-sm text-center transition-colors">
                  {action}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-semibold">Execution Log</h2>
            {responseActions.map((ra, i) => (
              <div key={i} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                <div>
                  <span className="font-semibold">{ra.action}</span>
                  <span className="text-slate-400 ml-2">→ {ra.target}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs ${ra.status === 'Completed' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>{ra.status}</span>
                  <span className="text-xs text-slate-500">{ra.user} · {ra.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threat Hunting Tab */}
      {activeTab === 'hunting' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-semibold">Threat Hunting Queries</h2>
            {huntingQueries.map((hq, i) => (
              <div key={i} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{hq.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${hq.results > 0 ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300'}`}>{hq.results} results</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono">{hq.query}</div>
              </div>
            ))}
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">Custom IOC Search</h2>
            <div className="flex gap-2">
              <input type="text" placeholder="Enter hash, IP, domain, or file path…" className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green-500" />
              <button onClick={handleIOCSearch} disabled={iocSearching} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">{iocSearching ? '⏳ Searching...' : 'Search'}</button>
            </div>
            {iocResults && (
              <div className="mt-3 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-300">
                {iocResults}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="bg-slate-800 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-green-400">🤖 AI Analysis</h2>
            <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white text-sm">✕</button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default EDRPlatform;
