import React from 'react';

const SecurityMetrics: React.FC = () => {
  const kpis = [
    { id: 'kpi-1', name: 'MTTD', value: '54s', trend: 'improving' },
    { id: 'kpi-2', name: 'MTTR', value: '6m', trend: 'flat' },
    { id: 'kpi-3', name: 'Patch SLA', value: '92%', trend: 'improving' },
    { id: 'kpi-4', name: 'Phish click rate', value: '2.1%', trend: 'improving' },
  ];

  const risks = [
    { id: 'r-1', name: 'Identity', score: 18 },
    { id: 'r-2', name: 'Cloud', score: 22 },
    { id: 'r-3', name: 'Endpoint', score: 14 },
    { id: 'r-4', name: 'Third-party', score: 26 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Security Metrics</h1>
          <p className="text-slate-400">KPIs, OKRs, and risk scores for executives and boards.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Reporting: Weekly</div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(card => (
          <div key={card.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.name}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
            <div className="text-xs text-green-300">{card.trend}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Risk Domains</h2>
          <span className="text-xs text-slate-400">Heat</span>
        </div>
        <div className="space-y-3">
          {risks.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="font-semibold">{item.name}</div>
              <div className="text-right text-xs text-green-300">Score: {item.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityMetrics;
