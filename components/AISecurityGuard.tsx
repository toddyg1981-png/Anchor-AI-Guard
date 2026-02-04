import React from 'react';

const AISecurityGuard: React.FC = () => {
  const protections = [
    { id: 'pj-1', title: 'Prompt Injection Shield', detail: 'Context firewalls, instruction boundary checks, and policy-aware output filtering.', status: 'Active' },
    { id: 'pj-2', title: 'Data Egress Controls', detail: 'Secrets redaction, PII masking, and sensitive pattern blocking before model calls.', status: 'Active' },
    { id: 'pj-3', title: 'Model Supply Chain', detail: 'Model hash verification, signed artifact checks, and provenance tracking.', status: 'Healthy' },
    { id: 'pj-4', title: 'Tenant Isolation', detail: 'Per-tenant contexts, token quotas, and abuse rate-limits.', status: 'Healthy' },
  ];

  const detections = [
    { id: 'det-1', type: 'Prompt Injection', severity: 'High', source: 'ChatOps', action: 'Blocked', time: '2m ago' },
    { id: 'det-2', type: 'Data Exfil Attempt', severity: 'Critical', source: 'Analyst Copilot', action: 'Sanitized', time: '18m ago' },
    { id: 'det-3', type: 'Model Abuse', severity: 'Medium', source: 'Public API', action: 'Rate Limited', time: '42m ago' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">AI Security Guard</h1>
          <p className="text-slate-400">Protect LLMs from prompt injection, data leakage, and supply-chain risks.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-green-400 font-semibold">Live Guarding</div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Detections (24h)', value: 38 }, { label: 'Blocks', value: 22 }, { label: 'Sanitized Outputs', value: 51 }, { label: 'Models Protected', value: 6 }].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Protections</h2>
            <span className="text-xs text-slate-400">Defense in depth</span>
          </div>
          {protections.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{item.title}</div>
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs">{item.status}</span>
              </div>
              <p className="text-sm text-slate-300 mt-1">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Detections</h2>
            <span className="text-xs text-slate-400">LLM runtime</span>
          </div>
          {detections.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.type}</span>
                <span className={`px-2 py-1 rounded text-xs ${item.severity === 'Critical' ? 'bg-red-500/20 text-red-300' : item.severity === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-200'}`}>{item.severity}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 mt-1">
                <span>{item.source}</span>
                <span className="text-xs text-green-300">{item.action}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">{item.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Guardrails</h2>
          <span className="text-xs text-slate-400">Policy enforcements</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          {["Secret scrubbing", "PII masking", "Toxicity filters", "Jailbreak pattern matching", "Response rate limiting", "Output signature verification"].map(item => (
            <div key={item} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
              <span className="text-slate-300">{item}</span>
              <span className="text-green-400 text-xs">On</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AISecurityGuard;
