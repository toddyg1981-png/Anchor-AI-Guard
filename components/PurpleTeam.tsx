import React from 'react';

const PurpleTeam: React.FC = () => {
  const exercises = [
    { id: 'pt-1', name: 'Credential Theft Emulation', result: 'Detected', mttr: '4m', status: 'Closed' },
    { id: 'pt-2', name: 'Ransomware Kill Chain', result: 'Contained', mttr: '7m', status: 'Closed' },
    { id: 'pt-3', name: 'Cloud PrivEsc', result: 'Gaps Found', mttr: 'Pending', status: 'Open' },
  ];

  const stats = [
    { label: 'Exercises (Q1)', value: 11 },
    { label: 'Detections improved', value: 18 },
    { label: 'Playbooks tuned', value: 9 },
    { label: 'Residual gaps', value: 3 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">Purple Team</h1>
          <p className="text-slate-400">Red/Blue collaboration, adversary emulation, and control validation.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">MITRE mappings ready</div>
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
          <h2 className="text-lg font-semibold">Exercises</h2>
          <span className="text-xs text-slate-400">Closed-loop</span>
        </div>
        <div className="space-y-3">
          {exercises.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">Result: {item.result}</div>
              </div>
              <div className="text-right text-xs text-green-300">
                <div>{item.status}</div>
                <div className="text-slate-400">MTTR: {item.mttr}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PurpleTeam;
