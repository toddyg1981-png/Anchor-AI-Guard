import React from 'react';

const PasswordVault: React.FC = () => {
  const secrets = [
    { id: 's-1', name: 'Prod Database', type: 'DB Cred', rotation: '14d', status: 'Healthy' },
    { id: 's-2', name: 'Stripe API Key', type: 'API Key', rotation: '30d', status: 'Rotating' },
    { id: 's-3', name: 'Admin Break-glass', type: 'Password', rotation: '7d', status: 'Guarded' },
  ];

  const stats = [
    { label: 'Secrets', value: 842 },
    { label: 'Auto-rotated', value: '63%' },
    { label: 'Shared vaults', value: 28 },
    { label: 'Access requests (24h)', value: 44 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Password Vault</h1>
          <p className="text-slate-400">Enterprise secrets management with rotation, approvals, and audit.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-green-400 font-semibold">HSM backed</div>
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
          <h2 className="text-lg font-semibold">Top Secrets</h2>
          <span className="text-xs text-slate-400">Zero trust sharing</span>
        </div>
        <div className="space-y-3">
          {secrets.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">{item.type}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Rotation: {item.rotation}</div>
                <div className="text-green-300 text-xs">{item.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PasswordVault;
