import React from 'react';

const EDRPlatform: React.FC = () => {
  const alerts = [
    { id: 'a-1', title: 'Suspicious PowerShell', endpoint: 'WIN-042', severity: 'High', action: 'Contained', time: '3m ago' },
    { id: 'a-2', title: 'Credential Dump Attempt', endpoint: 'DC-01', severity: 'Critical', action: 'Blocked', time: '14m ago' },
    { id: 'a-3', title: 'Ransomware Behavior', endpoint: 'FIN-12', severity: 'Critical', action: 'Isolated', time: '28m ago' },
    { id: 'a-4', title: 'Unsigned Driver Load', endpoint: 'ENG-33', severity: 'Medium', action: 'Quarantined', time: '1h ago' },
  ];

  const coverage = [
    { label: 'Endpoints', value: 1840 },
    { label: 'Servers', value: 220 },
    { label: 'Containers', value: 310 },
    { label: 'Mobile', value: 460 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Endpoint Detection & Response</h1>
          <p className="text-slate-400">Real-time endpoint telemetry, detections, containment, and remediation.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-green-400 font-semibold">Sensors Healthy</div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Alerts (24h)', value: 124 }, { label: 'Critical', value: 9 }, { label: 'Auto-contained', value: 31 }, { label: 'Mean time to isolate', value: '28s' }].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Alerts</h2>
            <span className="text-xs text-slate-400">Live</span>
          </div>
          {alerts.map(alert => (
            <div key={alert.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{alert.title}</span>
                <span className={`px-2 py-1 rounded text-xs ${alert.severity === 'Critical' ? 'bg-red-500/20 text-red-300' : alert.severity === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-200'}`}>{alert.severity}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 mt-1">
                <span>{alert.endpoint}</span>
                <span className="text-green-300 text-xs">{alert.action}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">{alert.time}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Coverage</h2>
            <div className="grid grid-cols-2 gap-2">
              {coverage.map(item => (
                <div key={item.label} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Automatic Isolation</span>
              <span className="text-green-400 font-semibold">Enabled</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Compromised endpoints are isolated on match of ransomware, credential theft, or beaconing patterns.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EDRPlatform;
