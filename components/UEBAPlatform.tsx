import React from 'react';

const UEBAPlatform: React.FC = () => {
  const anomalies = [
    { id: 'u-1', user: 'alice@anchor.ai', behavior: 'Impossible travel (Sydney -> Frankfurt 4m)', severity: 'High', status: 'Investigating' },
    { id: 'u-2', user: 'svc-backup', behavior: 'Sudden data access spike 5x baseline', severity: 'Medium', status: 'Triaged' },
    { id: 'u-3', user: 'contractor@anchor.ai', behavior: 'Privileged role assignment outside change window', severity: 'High', status: 'Open' },
  ];

  const scores = [
    { user: 'alice@anchor.ai', score: 92, change: '+8' },
    { user: 'svc-backup', score: 78, change: '+12' },
    { user: 'contractor@anchor.ai', score: 66, change: '-4' },
    { user: 'cfo@anchor.ai', score: 59, change: '+3' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-500">UEBA Platform</h1>
          <p className="text-slate-400">User and entity behavior analytics with risk scoring and anomaly detection.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Model refresh: 15m</div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Anomalies (24h)', value: 41 }, { label: 'Critical/High', value: 7 }, { label: 'Entities Tracked', value: 5200 }, { label: 'Mean time to triage', value: '11m' }].map(card => (
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
            <span className="text-xs text-slate-400">Behavioral</span>
          </div>
          {anomalies.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.user}</span>
                <span className={`px-2 py-1 rounded text-xs ${item.severity === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-200'}`}>{item.severity}</span>
              </div>
              <div className="text-slate-300 mt-1">{item.behavior}</div>
              <div className="text-xs text-slate-500 mt-1">{item.status}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Risk Scores</h2>
            <span className="text-xs text-slate-400">Entities</span>
          </div>
          <div className="space-y-2">
            {scores.map(item => (
              <div key={item.user} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                <div>
                  <div className="font-semibold">{item.user}</div>
                  <div className="text-xs text-slate-500">Risk score</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold">{item.score}</div>
                  <div className="text-xs text-green-400">{item.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Analytics Models</h2>
          <span className="text-xs text-slate-400">Signals fused</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          {["Login velocity", "Data egress", "Role escalations", "Device health", "Network anomalies", "App usage"]
            .map(item => (
              <div key={item} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
                <span className="text-slate-300">{item}</span>
                <span className="text-green-400 text-xs">Active</span>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UEBAPlatform;
