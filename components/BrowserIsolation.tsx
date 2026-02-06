import React from 'react';

const BrowserIsolation: React.FC = () => {
  const sessions = [
    { id: 's-1', user: 'alice@anchor.ai', site: 'news-site.com', action: 'Allowed (isolated)', time: '2m ago' },
    { id: 's-2', user: 'cfo@anchor.ai', site: 'file-share.net', action: 'Downloads stripped', time: '14m ago' },
    { id: 's-3', user: 'contractor@anchor.ai', site: 'unknown-domain.xyz', action: 'Blocked', time: '21m ago' },
  ];

  const policies = ['Untrusted sites open in isolation', 'Download sanitization (MIME and macros)', 'Clipboard and print controls', 'Session recording for high-risk roles', 'Time-of-click URL analysis'];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">Browser Isolation</h1>
          <p className="text-slate-400">Remote browser isolation to stop drive-by malware and zero-days.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Isolation nodes: Healthy</div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Isolated sessions (24h)', value: 1842 }, { label: 'Blocked', value: 61 }, { label: 'Downloads sanitized', value: 204 }, { label: 'High-risk users', value: 38 }].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Sessions</h2>
            <span className="text-xs text-slate-400">Isolation</span>
          </div>
          {sessions.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.user}</span>
                <span className="text-xs text-slate-400">{item.time}</span>
              </div>
              <div className="text-slate-300 mt-1">{item.site}</div>
              <div className="text-xs text-green-300 mt-1">{item.action}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Policies</h2>
            <span className="text-xs text-slate-400">Applied</span>
          </div>
          <div className="space-y-2 text-sm">
            {policies.map(item => (
              <div key={item} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
                <span className="text-slate-300">{item}</span>
                <span className="text-green-400 text-xs">On</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserIsolation;
