import React from 'react';

const NetworkSegmentation: React.FC = () => {
  const policies = [
    { id: 'seg-1', name: 'Prod to DB', status: 'Restricted', effect: 'Allow 5432', notes: 'mTLS enforced' },
    { id: 'seg-2', name: 'User to Admin', status: 'Blocked', effect: 'Deny lateral', notes: 'Zero trust enforced' },
    { id: 'seg-3', name: 'CI to Repo', status: 'Restricted', effect: 'Allow git+443', notes: 'Signed commits required' },
  ];

  const stats = [
    { label: 'Segments', value: 42 },
    { label: 'Policies', value: 186 },
    { label: 'Violations (24h)', value: 9 },
    { label: 'Auto blocks', value: 7 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-rose-400 to-orange-400">Network Segmentation</h1>
          <p className="text-slate-400">Micro-segmentation, zero trust policies, and lateral movement prevention.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Enforcement: Inline</div>
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
          <h2 className="text-lg font-semibold">Policies</h2>
          <span className="text-xs text-slate-400">Enforced</span>
        </div>
        <div className="space-y-3">
          {policies.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">{item.notes}</div>
              </div>
              <div className="text-right text-xs text-green-300">
                <div>{item.status}</div>
                <div className="text-slate-400">{item.effect}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkSegmentation;
