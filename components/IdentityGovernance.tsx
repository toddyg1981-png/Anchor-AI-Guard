import React from 'react';

const IdentityGovernance: React.FC = () => {
  const reviews = [
    { id: 'r-1', name: 'Quarterly Access Review', status: 'In Progress', owners: 42, due: '2026-02-28' },
    { id: 'r-2', name: 'Privileged Accounts', status: 'Scheduled', owners: 12, due: '2026-03-05' },
    { id: 'r-3', name: 'Vendor Access', status: 'Completed', owners: 18, due: '2026-01-31' },
  ];

  const stats = [
    { label: 'Identities', value: 18452 },
    { label: 'Privileged', value: 312 },
    { label: 'Orphaned', value: 44 },
    { label: 'SoD Violations', value: 6 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Identity Governance</h1>
          <p className="text-slate-400">Access reviews, least privilege enforcement, and joiner/mover/leaver controls.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">SoD policies: Enabled</div>
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
          <h2 className="text-lg font-semibold">Access Reviews</h2>
          <span className="text-xs text-slate-400">Lifecycle</span>
        </div>
        <div className="space-y-3">
          {reviews.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">Owners: {item.owners}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Due {item.due}</div>
                <div className="text-green-300 text-xs">{item.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IdentityGovernance;
