import React from 'react';

const SOARPlatform: React.FC = () => {
  const playbooks = [
    { id: 'pb-1', name: 'Ransomware Containment', steps: 12, status: 'Ready', triggers: ['EDR critical alert', 'Beacon detected'] },
    { id: 'pb-2', name: 'Phishing Triage', steps: 8, status: 'Ready', triggers: ['Email reported', 'URL sandbox hit'] },
    { id: 'pb-3', name: 'Cloud Key Leak', steps: 10, status: 'Ready', triggers: ['Git secret found', 'CASB alert'] },
  ];

  const executions = [
    { id: 'ex-1', playbook: 'Phishing Triage', result: 'Completed', duration: '2m 11s', time: '5m ago' },
    { id: 'ex-2', playbook: 'Ransomware Containment', result: 'Completed', duration: '6m 02s', time: '29m ago' },
    { id: 'ex-3', playbook: 'Cloud Key Leak', result: 'Completed', duration: '3m 44s', time: '1h ago' },
  ];

  const integrations = ['EDR', 'SIEM', 'Email Gateway', 'Threat Intel', 'Ticketing', 'Slack', 'PagerDuty', 'Cloud IAM'];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-red-500">SOAR Platform</h1>
          <p className="text-slate-400">Security orchestration and automated response across your stack.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Automation uptime: 99.99%</div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Runs (24h)', value: 86 }, { label: 'Avg run time', value: '2m 53s' }, { label: 'Auto resolved', value: '63%' }, { label: 'Playbooks ready', value: 28 }].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Playbooks</h2>
            <span className="text-xs text-slate-400">Production</span>
          </div>
          {playbooks.map(pb => (
            <div key={pb.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{pb.name}</span>
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs">{pb.status}</span>
              </div>
              <div className="text-slate-300 mt-1">{pb.steps} steps • Triggers: {pb.triggers.join(', ')}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Executions</h2>
            <span className="text-xs text-slate-400">Automated</span>
          </div>
          {executions.map(ex => (
            <div key={ex.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{ex.playbook}</span>
                <span className="text-xs text-green-300">{ex.result}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 mt-1">
                <span>{ex.duration}</span>
                <span className="text-xs text-slate-500">{ex.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Integrations</h2>
          <span className="text-xs text-slate-400">Connected systems</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {integrations.map(name => (
            <span key={name} className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-sm">{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SOARPlatform;
