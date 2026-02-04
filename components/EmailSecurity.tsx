import React from 'react';

const EmailSecurity: React.FC = () => {
  const threats = [
    { id: 'e-1', subject: 'Invoice - urgent action', type: 'Phishing', severity: 'High', status: 'Quarantined', time: '7m ago' },
    { id: 'e-2', subject: 'Payroll update', type: 'Credential Theft', severity: 'Critical', status: 'Blocked', time: '16m ago' },
    { id: 'e-3', subject: 'Security alert', type: 'BEC', severity: 'Medium', status: 'Review', time: '41m ago' },
  ];

  const posture = [
    { label: 'DMARC', value: 'Reject', color: 'text-green-400' },
    { label: 'SPF', value: 'Pass', color: 'text-green-400' },
    { label: 'DKIM', value: 'Aligned', color: 'text-green-400' },
    { label: 'ARC', value: 'Enabled', color: 'text-green-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Email Security</h1>
          <p className="text-slate-400">Inbound protection, phishing defense, and domain authentication.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Inbound protection: On</div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Emails scanned (24h)', value: '1.2M' }, { label: 'Malicious', value: 184 }, { label: 'Quarantined', value: 133 }, { label: 'User reports', value: 61 }].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Threats</h2>
            <span className="text-xs text-slate-400">Email</span>
          </div>
          {threats.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.subject}</span>
                <span className={`px-2 py-1 rounded text-xs ${item.severity === 'Critical' ? 'bg-red-500/20 text-red-300' : item.severity === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-200'}`}>{item.severity}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 mt-1">
                <span>{item.type}</span>
                <span className="text-xs text-green-300">{item.status}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">{item.time}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Domain Posture</h2>
            <span className="text-xs text-slate-400">Authentication</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {posture.map(item => (
              <div key={item.label} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
                <span className="text-slate-300">{item.label}</span>
                <span className={`font-semibold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Link and attachment sandboxing</span>
              <span className="text-green-400 font-semibold">Enabled</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Detonates links/files in isolation prior to delivery; rewrites URLs with time-of-click protection.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSecurity;
