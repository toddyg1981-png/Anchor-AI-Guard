import React from 'react';

const ThreatModeling: React.FC = () => {
  const models = [
    { id: 'tm-1', name: 'Payments Platform', method: 'STRIDE', risks: 12, status: 'In Review' },
    { id: 'tm-2', name: 'Mobile App', method: 'LINDDUN', risks: 7, status: 'Approved' },
    { id: 'tm-3', name: 'AI Pipeline', method: 'ATT&CK Mapping', risks: 9, status: 'Draft' },
  ];

  const stats = [
    { label: 'Models', value: 38 },
    { label: 'High risks', value: 14 },
    { label: 'Controls mapped', value: 122 },
    { label: 'Open tasks', value: 26 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-blue-400">Threat Modeling</h1>
          <p className="text-slate-400">STRIDE/DREAD, attack trees, and MITRE mappings for every system.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Coverage: 82%</div>
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
          <h2 className="text-lg font-semibold">Models</h2>
          <span className="text-xs text-slate-400">Design phase</span>
        </div>
        <div className="space-y-3">
          {models.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">Method: {item.method}</div>
              </div>
              <div className="text-right text-xs text-green-300">
                <div>{item.status}</div>
                <div className="text-slate-400">Risks: {item.risks}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreatModeling;
