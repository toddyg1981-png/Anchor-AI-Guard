import React from 'react';

const ContainerSecurity: React.FC = () => {
  const findings = [
    { id: 'k-1', name: 'Outdated base image (nginx:1.19)', severity: 'High', status: 'Open' },
    { id: 'k-2', name: 'Privileged pod detected', severity: 'Critical', status: 'Isolated' },
    { id: 'k-3', name: 'Public image pull', severity: 'Medium', status: 'In Review' },
  ];

  const stats = [
    { label: 'Clusters', value: 12 },
    { label: 'Namespaces', value: 148 },
    { label: 'Images scanned (24h)', value: 862 },
    { label: 'Runtime blocks', value: 11 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">Container Security</h1>
          <p className="text-slate-400">Image scanning, runtime protection, and Kubernetes posture.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Admission control: On</div>
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
          <h2 className="text-lg font-semibold">Runtime Findings</h2>
          <span className="text-xs text-slate-400">K8s</span>
        </div>
        <div className="space-y-3">
          {findings.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">Severity: {item.severity}</div>
              </div>
              <div className="text-green-300 text-xs">{item.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContainerSecurity;
