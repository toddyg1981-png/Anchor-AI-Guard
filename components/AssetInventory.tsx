import React from 'react';

const AssetInventory: React.FC = () => {
  const assets = [
    { id: 'a-1', name: 'api.anchor.ai', type: 'Service', owner: 'Platform', status: 'Active' },
    { id: 'a-2', name: 'vpn.anchor.ai', type: 'Network', owner: 'Infra', status: 'Active' },
    { id: 'a-3', name: 'MacBook-184', type: 'Endpoint', owner: 'Employee', status: 'Active' },
  ];

  const stats = [
    { label: 'Assets', value: 12842 },
    { label: 'Unmanaged', value: 54 },
    { label: 'Critical', value: 622 },
    { label: 'New (24h)', value: 38 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">Asset Inventory</h1>
          <p className="text-slate-400">Unified CMDB with discovery across cloud, endpoints, and network.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Discovery: Continuous</div>
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
          <h2 className="text-lg font-semibold">Recent Assets</h2>
          <span className="text-xs text-slate-400">Discovered</span>
        </div>
        <div className="space-y-3">
          {assets.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">{item.type}</div>
              </div>
              <div className="text-right text-xs text-green-300">
                <div>{item.status}</div>
                <div className="text-slate-400">Owner: {item.owner}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetInventory;
