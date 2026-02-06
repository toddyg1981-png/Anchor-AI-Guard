import React from 'react';

const NetworkTrafficAnalysis: React.FC = () => {
  const anomalies = [
    { id: 'n-1', label: 'Beaconing pattern to 185.234.218.42', severity: 'Critical', action: 'Blocked', time: '1m ago' },
    { id: 'n-2', label: 'High DNS TXT queries (possible tunneling)', severity: 'High', action: 'Alerted', time: '6m ago' },
    { id: 'n-3', label: 'Lateral SMB scans from ENG-33', severity: 'Medium', action: 'Investigating', time: '18m ago' },
  ];

  const topTalkers = [
    { src: '10.0.1.24', dst: 'api.anchor.ai', bytes: '4.2 GB', sessions: 842 },
    { src: '10.0.3.18', dst: 'storage.anchor.ai', bytes: '3.1 GB', sessions: 655 },
    { src: '10.0.9.55', dst: 'unknown-external', bytes: '860 MB', sessions: 91 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-teal-400">Network Traffic Analysis</h1>
          <p className="text-slate-400">Flow analytics, anomaly detection, and east-west visibility.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Span/mirror feeds: OK</div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Flows (24h)', value: '12.8M' }, { label: 'Anomalies', value: 23 }, { label: 'Blocked', value: 11 }, { label: 'TLS coverage', value: '91%' }].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Anomalies</h2>
            <span className="text-xs text-slate-400">Network</span>
          </div>
          {anomalies.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.label}</span>
                <span className={`px-2 py-1 rounded text-xs ${item.severity === 'Critical' ? 'bg-red-500/20 text-red-300' : item.severity === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-200'}`}>{item.severity}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 mt-1">
                <span>{item.action}</span>
                <span className="text-xs text-slate-500">{item.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top Talkers</h2>
            <span className="text-xs text-slate-400">Volume</span>
          </div>
          {topTalkers.map(item => (
            <div key={item.src + item.dst} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.src}</span>
                <span className="text-slate-400">{item.dst}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 mt-1">
                <span>{item.bytes}</span>
                <span className="text-xs text-slate-500">{item.sessions} sessions</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Monitored Protocols</h2>
          <span className="text-xs text-slate-400">Coverage</span>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {['HTTP/S', 'DNS', 'SMTP', 'SMB', 'RDP', 'SSH', 'Database', 'Custom TCP/UDP'].map(p => (
            <span key={p} className="px-2 py-1 rounded bg-slate-900 border border-slate-700">{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkTrafficAnalysis;
