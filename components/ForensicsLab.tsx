import React from 'react';

const ForensicsLab: React.FC = () => {
  const cases = [
    { id: 'f-1', name: 'Ransomware Case #443', status: 'Analyzing', evidence: 18 },
    { id: 'f-2', name: 'Phishing BEC #227', status: 'Reporting', evidence: 9 },
    { id: 'f-3', name: 'Insider Copy #112', status: 'Collection', evidence: 14 },
  ];

  const stats = [
    { label: 'Open cases', value: 12 },
    { label: 'Chain-of-custody intact', value: '100%' },
    { label: 'Artifacts', value: 184 },
    { label: 'Imaged systems', value: 26 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">Forensics Lab</h1>
          <p className="text-slate-400">Evidence collection, chain of custody, and timeline analysis.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Write blockers: Active</div>
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
          <h2 className="text-lg font-semibold">Cases</h2>
          <span className="text-xs text-slate-400">Chain of custody</span>
        </div>
        <div className="space-y-3">
          {cases.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">Evidence items: {item.evidence}</div>
              </div>
              <div className="text-xs text-green-300">{item.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForensicsLab;
