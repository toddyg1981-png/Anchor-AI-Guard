import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

type Tab = 'workflows' | 'playbooks' | 'integrations' | 'metrics';

const SecurityAutomation: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('workflows');

  const workflows = [
    { id: 'w-1', name: 'Ticket enrichment pipeline', trigger: 'New alert ingested', triggerCount: 312, lastRun: '2m ago', status: 'active' as const },
    { id: 'w-2', name: 'IOC auto-blocking', trigger: 'Threat-intel match', triggerCount: 87, lastRun: '6m ago', status: 'active' as const },
    { id: 'w-3', name: 'Alert triage & dedup', trigger: 'SIEM correlation rule', triggerCount: 1204, lastRun: '1m ago', status: 'active' as const },
    { id: 'w-4', name: 'Phishing response', trigger: 'User report / email sandbox', triggerCount: 43, lastRun: '22m ago', status: 'paused' as const },
    { id: 'w-5', name: 'Compromised credential lockout', trigger: 'UEBA high-risk score', triggerCount: 18, lastRun: '1h ago', status: 'active' as const },
  ];

  const playbooks = [
    { id: 'p-1', name: 'Ransomware containment', steps: 8, avgExecTime: '4m 12s', successRate: 97 },
    { id: 'p-2', name: 'Lateral movement isolation', steps: 6, avgExecTime: '2m 48s', successRate: 94 },
    { id: 'p-3', name: 'Data exfiltration response', steps: 10, avgExecTime: '5m 33s', successRate: 91 },
    { id: 'p-4', name: 'Insider threat escalation', steps: 7, avgExecTime: '3m 05s', successRate: 89 },
  ];

  const integrations = [
    { name: 'SIEM (Splunk)', type: 'SIEM', apiStatus: 'healthy', latency: '42ms' },
    { name: 'ServiceNow', type: 'Ticketing', apiStatus: 'healthy', latency: '110ms' },
    { name: 'CrowdStrike EDR', type: 'EDR', apiStatus: 'healthy', latency: '68ms' },
    { name: 'Palo Alto NGFW', type: 'Firewall', apiStatus: 'degraded', latency: '230ms' },
    { name: 'Slack Webhooks', type: 'Notification', apiStatus: 'healthy', latency: '55ms' },
    { name: 'Azure AD', type: 'IAM', apiStatus: 'healthy', latency: '78ms' },
  ];

  const metrics = {
    mttrBefore: '47m',
    mttrAfter: '11m',
    mttrImprovement: '76%',
    automationRate: '83%',
    falsePositiveReduction: '62%',
    executionsToday: 142,
    humanEscalations: 19,
    avgAutomationTime: '19s',
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'workflows', label: 'Workflows' },
    { key: 'playbooks', label: 'Playbooks' },
    { key: 'integrations', label: 'Integrations' },
    { key: 'metrics', label: 'Metrics' },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      await backendApi.modules.getDashboard('security-automation');
    } catch { /* use local data */ }
    setLoading(false);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await backendApi.modules.analyze(
        'security-automation',
        'Analyze automation coverage for detection-to-response gaps and recommend new playbooks'
      );
      setAnalysisResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    } catch {
      setAnalysisResult('Analysis unavailable — backend not reachable.');
    }
    setAnalyzing(false);
  };

  const statusColor = (s: string) => (s === 'active' ? 'text-green-400' : 'text-yellow-400');
  const apiColor = (s: string) => (s === 'healthy' ? 'text-green-400' : 'text-yellow-400');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-indigo-500">Security Automation</h1>
          <p className="text-slate-400">No-code workflows to react in seconds across your stack.</p>
        </div>
        <button onClick={runAnalysis} disabled={analyzing} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          {analyzing ? 'Analyzing…' : '🤖 AI Analysis'}
        </button>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Executions (24h)', value: metrics.executionsToday }, { label: 'Human escalations', value: metrics.humanEscalations }, { label: 'Avg automation time', value: metrics.avgAutomationTime }, { label: 'Automation rate', value: metrics.automationRate }].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800 border border-slate-700 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === t.key ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Workflows tab */}
      {activeTab === 'workflows' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Active Automation Workflows</h2>
          {workflows.map(w => (
            <div key={w.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="font-semibold">{w.name}</span>
                <div className="text-slate-400 text-xs">Trigger: {w.trigger}</div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-xs text-slate-300">Triggered {w.triggerCount}x</div>
                <div className="text-xs text-slate-400">Last: {w.lastRun}</div>
                <span className={`text-xs font-medium ${statusColor(w.status)}`}>{w.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Playbooks tab */}
      {activeTab === 'playbooks' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Runbooks &amp; Playbooks</h2>
          {playbooks.map(p => (
            <div key={p.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="font-semibold">{p.name}</span>
                <div className="text-xs text-slate-400">{p.steps} steps · Avg {p.avgExecTime}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-400">{p.successRate}%</div>
                <div className="text-xs text-slate-400">success rate</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Integrations tab */}
      {activeTab === 'integrations' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Connected Tools</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {integrations.map(i => (
              <div key={i.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                <div>
                  <span className="font-semibold">{i.name}</span>
                  <div className="text-xs text-slate-400">{i.type}</div>
                </div>
                <div className="text-right space-y-1">
                  <span className={`text-xs font-medium ${apiColor(i.apiStatus)}`}>{i.apiStatus}</span>
                  <div className="text-xs text-slate-400">{i.latency}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics tab */}
      {activeTab === 'metrics' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold">Automation Impact Metrics</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{metrics.mttrImprovement}</div>
              <div className="text-sm text-slate-400 mt-1">MTTR improvement</div>
              <div className="text-xs text-slate-500 mt-1">{metrics.mttrBefore} → {metrics.mttrAfter}</div>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{metrics.automationRate}</div>
              <div className="text-sm text-slate-400 mt-1">Automation rate</div>
              <div className="text-xs text-slate-500 mt-1">Alerts handled without human intervention</div>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{metrics.falsePositiveReduction}</div>
              <div className="text-sm text-slate-400 mt-1">False-positive reduction</div>
              <div className="text-xs text-slate-500 mt-1">Via enrichment + correlation tuning</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis result */}
      {analysisResult && (
        <div className="bg-slate-800 border border-purple-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-purple-300">AI Analysis Result</h2>
            <button onClick={() => setAnalysisResult(null)} className="text-xs text-slate-400 hover:text-white">Dismiss</button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default SecurityAutomation;
