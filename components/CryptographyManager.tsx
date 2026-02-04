import React from 'react';

const CryptographyManager: React.FC = () => {
  const certs = [
    { id: 'c-1', name: 'api.anchor.ai', status: 'Valid', expires: '2026-06-12' },
    { id: 'c-2', name: 'vpn.anchor.ai', status: 'Expiring', expires: '2026-02-20' },
    { id: 'c-3', name: 'internal-ca', status: 'Root', expires: '2034-01-01' },
  ];

  const stats = [
    { label: 'Keys managed', value: 1240 },
    { label: 'Certificates', value: 218 },
    { label: 'Expiring <30d', value: 7 },
    { label: 'HSM clusters', value: 3 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Cryptography Manager</h1>
          <p className="text-slate-400">Keys, certificates, and signing with hardware-backed protection.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">PKI health: Good</div>
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
          <h2 className="text-lg font-semibold">Certificates</h2>
          <span className="text-xs text-slate-400">Lifecycle</span>
        </div>
        <div className="space-y-3">
          {certs.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">Expires {item.expires}</div>
              </div>
              <div className="text-green-300 text-xs">{item.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CryptographyManager;
