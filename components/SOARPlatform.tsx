import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

const SOARPlatform: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'incidents' | 'playbooks' | 'automations' | 'metrics'>('incidents');

  const tabs = [
    { key: 'incidents' as const, label: 'Incidents' },
    { key: 'playbooks' as const, label: 'Playbooks' },
    { key: 'automations' as const, label: 'Automations' },
    { key: 'metrics' as const, label: 'Metrics' },
  ];

  const incidents = [
    { id: 'INC-4401', title: 'Credential stuffing on VPN gateway', severity: 'Critical', assignee: 'M. Chen', slaRemaining: '1h 12m', linkedAlerts: 14, mitreTactics: ['Initial Access', 'Credential Access'] },
    { id: 'INC-4399', title: 'Suspicious lateral movement – WKST-0092', severity: 'High', assignee: 'R. Alvarez', slaRemaining: '3h 05m', linkedAlerts: 8, mitreTactics: ['Lateral Movement', 'Discovery'] },
    { id: 'INC-4397', title: 'Exfiltration attempt via DNS tunneling', severity: 'High', assignee: 'K. Patel', slaRemaining: '2h 40m', linkedAlerts: 6, mitreTactics: ['Exfiltration', 'Command and Control'] },
    { id: 'INC-4395', title: 'Unauthorized SaaS OAuth grant', severity: 'Medium', assignee: 'J. Kim', slaRemaining: '5h 30m', linkedAlerts: 3, mitreTactics: ['Persistence', 'Privilege Escalation'] },
  ];

  const playbooks = [
    { id: 'pb-1', name: 'Phishing Response', executions: 342, avgTime: '2m 11s', successRate: 97.4, steps: 8, status: 'Active' },
    { id: 'pb-2', name: 'Malware Containment', executions: 189, avgTime: '6m 02s', successRate: 94.1, steps: 14, status: 'Active' },
    { id: 'pb-3', name: 'DDoS Mitigation', executions: 67, avgTime: '1m 38s', successRate: 99.2, steps: 6, status: 'Active' },
    { id: 'pb-4', name: 'Insider Threat', executions: 41, avgTime: '12m 25s', successRate: 88.7, steps: 18, status: 'Active' },
  ];

  const automations = [
    { id: 'aut-1', name: 'Block IP', description: 'Auto-block malicious IPs on firewall', triggerFreq: '~48/day', lastTriggered: '3m ago', enabled: true },
    { id: 'aut-2', name: 'Disable Account', description: 'Suspend user after impossible travel alert', triggerFreq: '~12/day', lastTriggered: '18m ago', enabled: true },
    { id: 'aut-3', name: 'Isolate Host', description: 'Network-isolate endpoint via EDR API', triggerFreq: '~6/day', lastTriggered: '1h ago', enabled: true },
    { id: 'aut-4', name: 'Create Ticket', description: 'Open ServiceNow ticket for medium+ alerts', triggerFreq: '~95/day', lastTriggered: '1m ago', enabled: true },
  ];

  const metrics = [
    { label: 'MTTD (Mean Time to Detect)', value: '4m 12s', trend: '-18%', good: true },
    { label: 'MTTR (Mean Time to Respond)', value: '11m 43s', trend: '-24%', good: true },
    { label: 'Incidents Closed / Analyst / Day', value: '14.6', trend: '+31%', good: true },
    { label: 'Playbook Utilization Rate', value: '87%', trend: '+9%', good: true },
  ];

  const sevColor = (s: string) => s === 'Critical' ? 'text-red-400' : s === 'High' ? 'text-orange-400' : 'text-yellow-400';

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      await backendApi.modules.getDashboard('soar');
    } catch {
      // use local data
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setAnalysisResult(null);
      const res = await backendApi.modules.analyze('soar', 'Analyze incident response effectiveness, playbook coverage gaps, and automation optimization opportunities');
      setAnalysisResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    } catch {
      setAnalysisResult('AI analysis unavailable – displaying cached recommendations:\n• Playbook gap: No automated response for supply-chain compromise scenarios.\n• MTTR improvement: Automating evidence collection could reduce response by ~35%.\n• Automation candidate: Account lockout after 3+ impossible-travel alerts is currently manual.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-red-500">SOAR Platform</h1>
          <p className="text-slate-400">Security orchestration and automated response across your stack.</p>
        </div>
        <button onClick={runAnalysis} disabled={analyzing} className="bg-linear-to-r from-pink-600 to-red-600 hover:from-pink-500 hover:to-red-500 disabled:opacity-50 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
          {analyzing ? <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" /> Analyzing...</> : '🤖 AI Analysis'}
        </button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Runs (24h)', value: 86 }, { label: 'Avg run time', value: '2m 53s' }, { label: 'Auto resolved', value: '63%' }, { label: 'Playbooks ready', value: 28 }].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>
        ))}
      </div>

      {/* Incidents tab */}
      {activeTab === 'incidents' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Active Incidents</h2>
          {incidents.map(inc => (
            <div key={inc.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{inc.id} – {inc.title}</span>
                <span className={`font-bold text-xs ${sevColor(inc.severity)}`}>{inc.severity}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-slate-400 text-xs">
                <span>Assignee: {inc.assignee}</span>
                <span>SLA: <span className={inc.slaRemaining.startsWith('1h') || inc.slaRemaining.startsWith('0') ? 'text-red-400' : 'text-slate-300'}>{inc.slaRemaining}</span></span>
                <span>Linked alerts: {inc.linkedAlerts}</span>
              </div>
              <div className="flex gap-1 mt-1">{inc.mitreTactics.map(t => <span key={t} className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 text-xs">{t}</span>)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Playbooks tab */}
      {activeTab === 'playbooks' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Playbook Library</h2>
          {playbooks.map(pb => (
            <div key={pb.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{pb.name}</span>
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs">{pb.status}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2 text-xs text-slate-400">
                <span>Steps: <span className="text-slate-200">{pb.steps}</span></span>
                <span>Executions: <span className="text-slate-200">{pb.executions}</span></span>
                <span>Avg time: <span className="text-slate-200">{pb.avgTime}</span></span>
                <span>Success: <span className="text-green-300">{pb.successRate}%</span></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Automations tab */}
      {activeTab === 'automations' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Automated Actions</h2>
          {automations.map(a => (
            <div key={a.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{a.name}</span>
                <span className={`px-2 py-1 rounded text-xs ${a.enabled ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-400'}`}>{a.enabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <p className="text-slate-400 text-xs mt-1">{a.description}</p>
              <div className="flex gap-4 mt-2 text-xs text-slate-400">
                <span>Frequency: <span className="text-slate-200">{a.triggerFreq}</span></span>
                <span>Last: <span className="text-slate-200">{a.lastTriggered}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metrics tab */}
      {activeTab === 'metrics' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Response Metrics</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {metrics.map(m => (
              <div key={m.label} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <div className="text-slate-400 text-sm">{m.label}</div>
                <div className="text-2xl font-semibold mt-1">{m.value}</div>
                <div className={`text-xs mt-1 ${m.good ? 'text-green-400' : 'text-red-400'}`}>{m.trend} vs last 30d</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="bg-slate-800 border border-pink-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-pink-400">🤖 AI Analysis</h2>
            <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white text-sm">✕</button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default SOARPlatform;
