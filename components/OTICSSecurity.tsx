import React from 'react';

const OTICSSecurity: React.FC = () => {
  const alerts = [
    { id: 'o-1', system: 'SCADA-01', type: 'Protocol anomaly', severity: 'High', status: 'Contained' },
    { id: 'o-2', system: 'PLC-Line3', type: 'Unauthorized write', severity: 'Critical', status: 'Blocked' },
    { id: 'o-3', system: 'HMI-02', type: 'Remote access', severity: 'Medium', status: 'Investigating' },
  ];

  const stats = [
    { label: 'Sites', value: 7 },
    { label: 'Controllers', value: 182 },
    { label: 'Critical alerts (24h)', value: 3 },
    { label: 'Safety interlocks', value: '100%' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-400">OT / ICS Security</h1>
          <p className="text-slate-400">Defend industrial control systems with protocol-aware monitoring and safeguards.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Safety mode: Enforced</div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Alerts</h2>
          <span className="text-xs text-slate-400">OT</span>
        </div>
        <div className="space-y-3">
          {alerts.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.system}</div>
                <div className="text-xs text-slate-500">{item.type}</div>
              </div>
              <div className={`text-xs ${item.severity === 'Critical' ? 'text-red-300' : 'text-green-300'}`}>{item.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OTICSSecurity;
