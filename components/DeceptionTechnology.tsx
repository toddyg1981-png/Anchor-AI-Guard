import React from 'react';

const DeceptionTechnology: React.FC = () => {
  const decoys = [
    { id: 'd-1', name: 'Decoy AD Controller', lure: 'Fake LDAP creds', status: 'Active' },
    { id: 'd-2', name: 'Canary Database', lure: 'Honey tokens', status: 'Active' },
    { id: 'd-3', name: 'Decoy S3 Bucket', lure: 'Breadcrumb keys', status: 'Active' },
  ];

  const stats = [
    { label: 'Decoys', value: 58 },
    { label: 'Triggers (24h)', value: 12 },
    { label: 'Captured TTPs', value: 19 },
    { label: 'Alerts to SOC', value: 12 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">Deception Technology</h1>
          <p className="text-slate-400">High-fidelity decoys, honeytokens, and attacker misdirection.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Breadcrumbs planted</div>
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
          <h2 className="text-lg font-semibold">Active Decoys</h2>
          <span className="text-xs text-slate-400">Trap surface</span>
        </div>
        <div className="space-y-3">
          {decoys.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">{item.lure}</div>
              </div>
              <div className="text-green-300 text-xs">{item.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeceptionTechnology;
