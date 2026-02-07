import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

// ============================================================================
// INCIDENT RESPONSE AUTOMATION
// ============================================================================
// When an attack is detected, this system automatically responds
// Containment, eradication, and recovery - all automated where safe
// ============================================================================

interface Playbook {
  id: string;
  name: string;
  description: string;
  trigger: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  actions: PlaybookAction[];
  lastRun?: string;
  timesExecuted: number;
  avgResponseTime: string;
  enabled: boolean;
}

interface PlaybookAction {
  step: number;
  name: string;
  type: 'contain' | 'eradicate' | 'recover' | 'notify' | 'investigate';
  automated: boolean;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

interface ActiveIncident {
  id: string;
  timestamp: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'detected' | 'containing' | 'eradicating' | 'recovering' | 'resolved';
  playbookId: string;
  currentStep: number;
  totalSteps: number;
  timeElapsed: string;
}

export const IncidentResponseAutomation: React.FC = () => {
  const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const [backendLoading, setBackendLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    (async () => {
      setBackendLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('incident-response');
        if (res) console.log('Dashboard loaded:', res);
      } catch (e) { console.error(e); } finally { setBackendLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await backendApi.modules.analyze('incident-response', 'Analyze incident response automation for playbook coverage gaps and MTTR optimization opportunities');
      if ((res as any)?.analysis) setAnalysisResult((res as any).analysis);
    } catch (e) { console.error(e); } finally { setAnalyzing(false); }
  };

  // Incident Response Playbooks
  const playbooks: Playbook[] = [
    {
      id: 'pb-1',
      name: 'Brute Force Response',
      description: 'Automated response to credential stuffing and brute force attacks',
      trigger: 'Multiple failed login attempts (>10 in 1 minute)',
      severity: 'medium',
      actions: [
        { step: 1, name: 'Block source IP', type: 'contain', automated: true },
        { step: 2, name: 'Add IP to threat feed', type: 'contain', automated: true },
        { step: 3, name: 'Alert security team', type: 'notify', automated: true },
        { step: 4, name: 'Check for compromised accounts', type: 'investigate', automated: true },
        { step: 5, name: 'Reset affected passwords', type: 'eradicate', automated: false },
        { step: 6, name: 'Document incident', type: 'recover', automated: true }
      ],
      lastRun: '2026-02-04T11:45:00Z',
      timesExecuted: 23,
      avgResponseTime: '< 30 sec',
      enabled: true
    },
    {
      id: 'pb-2',
      name: 'SQL Injection Response',
      description: 'Block and investigate SQL injection attempts',
      trigger: 'WAF detects SQL injection pattern',
      severity: 'high',
      actions: [
        { step: 1, name: 'Block request & IP', type: 'contain', automated: true },
        { step: 2, name: 'Capture full request details', type: 'investigate', automated: true },
        { step: 3, name: 'Scan for successful injections', type: 'investigate', automated: true },
        { step: 4, name: 'Alert security team', type: 'notify', automated: true },
        { step: 5, name: 'Check database integrity', type: 'investigate', automated: true },
        { step: 6, name: 'Report to authorities if data breach', type: 'notify', automated: false }
      ],
      lastRun: '2026-02-04T11:55:00Z',
      timesExecuted: 156,
      avgResponseTime: '< 10 sec',
      enabled: true
    },
    {
      id: 'pb-3',
      name: 'Data Exfiltration Response',
      description: 'Detect and stop unauthorized data extraction',
      trigger: 'Large data transfer detected or unusual access pattern',
      severity: 'critical',
      actions: [
        { step: 1, name: 'Kill active sessions', type: 'contain', automated: true },
        { step: 2, name: 'Block all egress traffic', type: 'contain', automated: true },
        { step: 3, name: 'Page on-call engineer', type: 'notify', automated: true },
        { step: 4, name: 'Capture forensic snapshot', type: 'investigate', automated: true },
        { step: 5, name: 'Identify compromised data', type: 'investigate', automated: false },
        { step: 6, name: 'Activate breach response', type: 'notify', automated: false }
      ],
      timesExecuted: 0,
      avgResponseTime: '< 5 sec',
      enabled: true
    },
    {
      id: 'pb-4',
      name: 'Ransomware Detection',
      description: 'Immediate isolation when ransomware indicators detected',
      trigger: 'File encryption patterns or known ransomware signatures',
      severity: 'critical',
      actions: [
        { step: 1, name: 'Isolate affected systems', type: 'contain', automated: true },
        { step: 2, name: 'Disable network shares', type: 'contain', automated: true },
        { step: 3, name: 'PANIC MODE activation', type: 'contain', automated: true },
        { step: 4, name: 'Page all security staff', type: 'notify', automated: true },
        { step: 5, name: 'Preserve evidence', type: 'investigate', automated: true },
        { step: 6, name: 'Prepare backup restoration', type: 'recover', automated: false }
      ],
      timesExecuted: 0,
      avgResponseTime: '< 3 sec',
      enabled: true
    },
    {
      id: 'pb-5',
      name: 'Account Compromise',
      description: 'Response when account takeover is detected',
      trigger: 'Impossible travel, new device + sensitive action, or credential leak match',
      severity: 'high',
      actions: [
        { step: 1, name: 'Suspend account', type: 'contain', automated: true },
        { step: 2, name: 'Revoke all sessions', type: 'contain', automated: true },
        { step: 3, name: 'Notify account owner', type: 'notify', automated: true },
        { step: 4, name: 'Review recent activity', type: 'investigate', automated: true },
        { step: 5, name: 'Reset credentials', type: 'eradicate', automated: false },
        { step: 6, name: 'Re-enable with MFA', type: 'recover', automated: false }
      ],
      lastRun: '2026-02-03T14:30:00Z',
      timesExecuted: 5,
      avgResponseTime: '< 15 sec',
      enabled: true
    }
  ];

  // Simulate an incident
  const [activeIncident, setActiveIncident] = useState<ActiveIncident | null>(null);

  const runSimulation = (playbookId: string) => {
    setIsSimulating(true);
    const playbook = playbooks.find(p => p.id === playbookId);
    if (!playbook) return;

    setActiveIncident({
      id: `inc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: playbook.name,
      severity: playbook.severity,
      status: 'detected',
      playbookId,
      currentStep: 0,
      totalSteps: playbook.actions.length,
      timeElapsed: '0s'
    });

    // Simulate steps
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step <= playbook.actions.length) {
        setActiveIncident(prev => prev ? {
          ...prev,
          currentStep: step,
          status: step === playbook.actions.length ? 'resolved' : 'containing',
          timeElapsed: `${step * 5}s`
        } : null);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setTimeout(() => setActiveIncident(null), 3000);
      }
    }, 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 border-red-500 text-red-400';
      case 'high': return 'bg-orange-500/10 border-orange-500 text-orange-400';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500 text-yellow-400';
      default: return 'bg-blue-500/10 border-blue-500 text-blue-400';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'contain': return '🛡️';
      case 'eradicate': return '🗑️';
      case 'recover': return '♻️';
      case 'notify': return '📢';
      case 'investigate': return '🔍';
      default: return '⚡';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">⚡ Incident Response Automation</h1>
          <p className="text-gray-400">Automated playbooks for rapid threat containment and eradication</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAIAnalysis}
            disabled={analyzing || backendLoading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {analyzing ? '⏳ Analyzing...' : '🤖 AI Analysis'}
          </button>
          <div className="text-center px-4 py-2 bg-green-500/10 border border-green-500 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{playbooks.filter(p => p.enabled).length}/{playbooks.length}</div>
            <div className="text-xs text-gray-400">Playbooks Active</div>
          </div>
        </div>
      </div>

      {/* Active Incident Alert */}
      {activeIncident && (
        <div className={`mb-6 p-6 rounded-xl border-2 ${getSeverityColor(activeIncident.severity)} animate-pulse`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <h3 className="font-bold text-lg">INCIDENT RESPONSE IN PROGRESS</h3>
                <p className="text-sm">{activeIncident.type}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{activeIncident.timeElapsed}</div>
              <div className="text-sm text-gray-400">elapsed</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {playbooks.find(p => p.id === activeIncident.playbookId)?.actions.map((_action, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 rounded-full ${
                  idx < activeIncident.currentStep ? 'bg-green-500' :
                  idx === activeIncident.currentStep ? 'bg-yellow-500 animate-pulse' :
                  'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-400">
            Step {activeIncident.currentStep}/{activeIncident.totalSteps}: {
              playbooks.find(p => p.id === activeIncident.playbookId)?.actions[activeIncident.currentStep - 1]?.name || 'Completed'
            }
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-cyan-400">{playbooks.reduce((sum, p) => sum + p.timesExecuted, 0)}</div>
          <div className="text-gray-400 text-sm">Incidents Handled</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400">&lt; 30s</div>
          <div className="text-gray-400 text-sm">Avg Response Time</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-400">100%</div>
          <div className="text-gray-400 text-sm">Auto-Contained</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400">0</div>
          <div className="text-gray-400 text-sm">Active Incidents</div>
        </div>
      </div>

      {/* Playbooks */}
      <div className="space-y-4">
        {playbooks.map(playbook => (
          <div
            key={playbook.id}
            className={`bg-gray-900/50 border rounded-xl overflow-hidden ${
              selectedPlaybook === playbook.id ? 'border-cyan-500' : 'border-gray-800'
            }`}
          >
            <div
              className="p-6 cursor-pointer"
              onClick={() => setSelectedPlaybook(selectedPlaybook === playbook.id ? null : playbook.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">📋</span>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{playbook.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getSeverityColor(playbook.severity)}`}>
                        {playbook.severity}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${playbook.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {playbook.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{playbook.description}</p>
                    <p className="text-gray-500 text-xs mt-1">Trigger: {playbook.trigger}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-cyan-400">{playbook.timesExecuted}</div>
                    <div className="text-xs text-gray-500">executions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{playbook.avgResponseTime}</div>
                    <div className="text-xs text-gray-500">response</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); runSimulation(playbook.id); }}
                    disabled={isSimulating}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isSimulating ? 'bg-gray-600 text-gray-400' : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                    }`}
                  >
                    🧪 Test
                  </button>
                </div>
              </div>
            </div>

            {selectedPlaybook === playbook.id && (
              <div className="border-t border-gray-800 p-6 bg-gray-800/30">
                <h4 className="font-medium mb-4">Response Actions</h4>
                <div className="space-y-2">
                  {playbook.actions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg">
                      <span className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-sm font-bold">
                        {action.step}
                      </span>
                      <span className="text-xl">{getActionIcon(action.type)}</span>
                      <span className="flex-1">{action.name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        action.automated ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {action.automated ? '⚡ Automated' : '👤 Manual'}
                      </span>
                    </div>
                  ))}
                </div>
                {playbook.lastRun && (
                  <p className="text-xs text-gray-500 mt-4">
                    Last executed: {new Date(playbook.lastRun).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-purple-400">🤖 AI Analysis Result</h3>
            <button onClick={() => setAnalysisResult('')} className="text-gray-500 hover:text-white">✕</button>
          </div>
          <div className="text-gray-300 whitespace-pre-wrap">{analysisResult}</div>
        </div>
      )}
    </div>
  );
};

export default IncidentResponseAutomation;
