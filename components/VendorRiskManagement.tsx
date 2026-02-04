import React from 'react';

const VendorRiskManagement: React.FC = () => {
  const vendors = [
    { id: 'v-1', name: 'Cloud Provider', tier: 'Critical', status: 'In review', score: 78 },
    { id: 'v-2', name: 'Payments Gateway', tier: 'High', status: 'Approved', score: 84 },
    { id: 'v-3', name: 'CRM Platform', tier: 'Medium', status: 'Questionnaire sent', score: 73 },
  ];

  const stats = [
    { label: 'Vendors', value: 212 },
    { label: 'Critical vendors', value: 17 },
    { label: 'Open assessments', value: 24 },
    { label: 'Auto-monitoring', value: 61 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">Vendor Risk Management</h1>
          <p className="text-slate-400">Third-party risk, questionnaires, continuous monitoring, and SLAs.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">SIG/CAIQ templates</div>
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
          <h2 className="text-lg font-semibold">Assessments</h2>
          <span className="text-xs text-slate-400">Third-party</span>
        </div>
        <div className="space-y-3">
          {vendors.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">Tier: {item.tier}</div>
              </div>
              <div className="text-right text-xs text-green-300">
                <div>Score: {item.score}</div>
                <div className="text-slate-400">{item.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorRiskManagement;
