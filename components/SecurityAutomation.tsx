import React from 'react';

const SecurityAutomation: React.FC = () => {
  const workflows = [
    { id: 'w-1', name: 'Auto-block malicious IP', trigger: 'SIEM correlation', outcome: 'Firewall rule pushed', time: '4m ago' },
    { id: 'w-2', name: 'Reset compromised account', trigger: 'UEBA high risk', outcome: 'Password reset + token revoke', time: '17m ago' },
    { id: 'w-3', name: 'Quarantine suspicious attachment', trigger: 'Email sandbox', outcome: 'File removed + ticket opened', time: '33m ago' },
  ];

  const integrations = ['SIEM', 'EDR', 'Firewall', 'Email Gateway', 'IAM', 'Ticketing', 'Slack'];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-indigo-500">Security Automation</h1>
          <p className="text-slate-400">No-code workflows to react in seconds across your stack.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Queue depth: Low</div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Executions (24h)', value: 142 }, { label: 'Human escalations', value: 19 }, { label: 'Avg automation time', value: '19s' }, { label: 'Active workflows', value: 34 }].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Runs</h2>
            <span className="text-xs text-slate-400">Orchestrated</span>
          </div>
          {workflows.map(flow => (
            <div key={flow.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{flow.name}</span>
                <span className="text-xs text-slate-400">{flow.time}</span>
              </div>
              <div className="text-slate-300 mt-1">Trigger: {flow.trigger}</div>
              <div className="text-xs text-green-300 mt-1">{flow.outcome}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Integrations</h2>
            <span className="text-xs text-slate-400">Connected</span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {integrations.map(name => (
              <span key={name} className="px-2 py-1 rounded bg-slate-900 border border-slate-700">{name}</span>
            ))}
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Safety checks (change windows, approvals)</span>
              <span className="text-green-400 text-xs">On</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Requires approvals for destructive actions; enforces guardrails on privileged workflows.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAutomation;
