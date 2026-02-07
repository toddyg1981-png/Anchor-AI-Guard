import React, { useState, useEffect } from 'react';

// ============================================================================
// BREACH SIMULATOR - AUTOMATED RED TEAM & ATTACK SIMULATION
// ============================================================================

interface AttackScenario {
  id: string;
  name: string;
  description: string;
  category: 'external' | 'insider' | 'supply_chain' | 'ransomware' | 'apt';
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'expert';
  techniques: string[];
  estimatedDuration: string;
  status: 'ready' | 'running' | 'completed' | 'failed';
  successRate?: number;
}

interface SimulationResult {
  id: string;
  scenarioId: string;
  scenarioName: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'aborted';
  attackPath: AttackStep[];
  findings: SimulationFinding[];
  overallSuccess: boolean;
  securityScore: number;
  detectionRate: number;
  meanTimeToDetect?: number;
}

interface AttackStep {
  id: string;
  name: string;
  technique: string;
  mitreTactic: string;
  mitreId: string;
  status: 'pending' | 'executing' | 'success' | 'failed' | 'detected';
  timestamp?: string;
  details?: string;
}

interface SimulationFinding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  attackStep: string;
  description: string;
  evidence: string;
  recommendation: string;
  detected: boolean;
  detectionTime?: number;
}

export const BreachSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'simulations' | 'results' | 'mitre'>('scenarios');
  const [_selectedScenario, setSelectedScenario] = useState<AttackScenario | null>(null);
  const [runningSimulation, setRunningSimulation] = useState<SimulationResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Attack scenarios
  const scenarios: AttackScenario[] = [
    {
      id: 'scen-1',
      name: 'Phishing Campaign',
      description: 'Simulate a targeted spear-phishing attack against employees with credential harvesting and lateral movement',
      category: 'external',
      difficulty: 'intermediate',
      techniques: ['T1566.001', 'T1078', 'T1021.001', 'T1003.001'],
      estimatedDuration: '15 min',
      status: 'ready'
    },
    {
      id: 'scen-2',
      name: 'Ransomware Deployment',
      description: 'Full ransomware attack chain from initial access to encryption, testing backup integrity and incident response',
      category: 'ransomware',
      difficulty: 'advanced',
      techniques: ['T1486', 'T1490', 'T1489', 'T1529'],
      estimatedDuration: '30 min',
      status: 'ready'
    },
    {
      id: 'scen-3',
      name: 'Insider Threat',
      description: 'Simulate malicious insider with legitimate access attempting data exfiltration',
      category: 'insider',
      difficulty: 'intermediate',
      techniques: ['T1078', 'T1074', 'T1567', 'T1048'],
      estimatedDuration: '20 min',
      status: 'ready'
    },
    {
      id: 'scen-4',
      name: 'Supply Chain Attack',
      description: 'Compromise through trusted third-party software or vendor access',
      category: 'supply_chain',
      difficulty: 'expert',
      techniques: ['T1195.002', 'T1199', 'T1059.001', 'T1071.001'],
      estimatedDuration: '45 min',
      status: 'ready'
    },
    {
      id: 'scen-5',
      name: 'APT Persistence',
      description: 'Advanced persistent threat establishing long-term presence with multiple persistence mechanisms',
      category: 'apt',
      difficulty: 'expert',
      techniques: ['T1547.001', 'T1053.005', 'T1543.003', 'T1136.001'],
      estimatedDuration: '60 min',
      status: 'ready'
    },
    {
      id: 'scen-6',
      name: 'Credential Stuffing',
      description: 'Automated credential stuffing attack against authentication endpoints using leaked credentials',
      category: 'external',
      difficulty: 'basic',
      techniques: ['T1110.004', 'T1078.001', 'T1087.002'],
      estimatedDuration: '10 min',
      status: 'completed',
      successRate: 23
    }
  ];

  // Mock simulation result
  const mockSimulationResult: SimulationResult = {
    id: 'sim-1',
    scenarioId: 'scen-1',
    scenarioName: 'Phishing Campaign',
    startTime: '2026-02-04T10:00:00Z',
    endTime: '2026-02-04T10:18:00Z',
    status: 'completed',
    attackPath: [
      { id: 'step-1', name: 'Reconnaissance', technique: 'OSINT gathering', mitreTactic: 'Reconnaissance', mitreId: 'T1589', status: 'success', timestamp: '10:00:15', details: 'Gathered employee emails from LinkedIn' },
      { id: 'step-2', name: 'Weaponization', technique: 'Craft phishing email', mitreTactic: 'Resource Development', mitreId: 'T1566.001', status: 'success', timestamp: '10:02:30', details: 'Created convincing IT support email with malicious link' },
      { id: 'step-3', name: 'Delivery', technique: 'Send phishing emails', mitreTactic: 'Initial Access', mitreId: 'T1566.001', status: 'success', timestamp: '10:05:00', details: 'Sent to 50 targets, 12 clicked link' },
      { id: 'step-4', name: 'Credential Harvest', technique: 'Capture credentials', mitreTactic: 'Credential Access', mitreId: 'T1056.001', status: 'success', timestamp: '10:08:00', details: '8 users entered credentials' },
      { id: 'step-5', name: 'Valid Account Access', technique: 'Use stolen credentials', mitreTactic: 'Persistence', mitreId: 'T1078', status: 'detected', timestamp: '10:12:00', details: 'Login attempt triggered anomaly detection' },
      { id: 'step-6', name: 'Lateral Movement', technique: 'RDP to other systems', mitreTactic: 'Lateral Movement', mitreId: 'T1021.001', status: 'failed', timestamp: '10:15:00', details: 'Blocked by network segmentation' }
    ],
    findings: [
      { id: 'find-1', title: 'No SPF/DKIM validation', severity: 'high', attackStep: 'Delivery', description: 'Email system accepted spoofed emails without proper validation', evidence: 'Phishing emails delivered to 50 users', recommendation: 'Implement strict SPF, DKIM, and DMARC policies', detected: false },
      { id: 'find-2', title: '24% phishing click rate', severity: 'high', attackStep: 'Delivery', description: '12 out of 50 users clicked on phishing link', evidence: 'User click tracking data', recommendation: 'Implement security awareness training program', detected: false },
      { id: 'find-3', title: 'Credential reuse detected', severity: 'critical', attackStep: 'Credential Harvest', description: '3 users entered their actual corporate credentials', evidence: 'Captured credentials validated against AD', recommendation: 'Implement MFA and password managers', detected: false },
      { id: 'find-4', title: 'Anomalous login detected', severity: 'low', attackStep: 'Valid Account Access', description: 'SIEM detected unusual login pattern', evidence: 'Alert triggered within 4 minutes', recommendation: 'Continue monitoring, tune detection rules', detected: true, detectionTime: 240 }
    ],
    overallSuccess: false,
    securityScore: 68,
    detectionRate: 50,
    meanTimeToDetect: 240
  };

  // MITRE ATT&CK Tactics
  const mitreTactics = [
    { id: 'TA0043', name: 'Reconnaissance', techniques: 10, coverage: 40 },
    { id: 'TA0042', name: 'Resource Development', techniques: 7, coverage: 30 },
    { id: 'TA0001', name: 'Initial Access', techniques: 9, coverage: 70 },
    { id: 'TA0002', name: 'Execution', techniques: 12, coverage: 85 },
    { id: 'TA0003', name: 'Persistence', techniques: 19, coverage: 60 },
    { id: 'TA0004', name: 'Privilege Escalation', techniques: 13, coverage: 55 },
    { id: 'TA0005', name: 'Defense Evasion', techniques: 42, coverage: 45 },
    { id: 'TA0006', name: 'Credential Access', techniques: 17, coverage: 75 },
    { id: 'TA0007', name: 'Discovery', techniques: 31, coverage: 65 },
    { id: 'TA0008', name: 'Lateral Movement', techniques: 9, coverage: 80 },
    { id: 'TA0009', name: 'Collection', techniques: 17, coverage: 50 },
    { id: 'TA0011', name: 'Command and Control', techniques: 16, coverage: 70 },
    { id: 'TA0010', name: 'Exfiltration', techniques: 9, coverage: 60 },
    { id: 'TA0040', name: 'Impact', techniques: 13, coverage: 90 }
  ];

  const startSimulation = (scenario: AttackScenario) => {
    setSelectedScenario(scenario);
    setRunningSimulation({
      ...mockSimulationResult,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      status: 'running',
      attackPath: mockSimulationResult.attackPath.map(s => ({ ...s, status: 'pending' as const }))
    });
    setCurrentStep(0);
    setActiveTab('simulations');
  };

  // Simulate attack progress
  useEffect(() => {
    if (runningSimulation?.status === 'running' && currentStep < runningSimulation.attackPath.length) {
      const timer = setTimeout(() => {
        setRunningSimulation(prev => {
          if (!prev) return null;
          const newPath = [...prev.attackPath];
          newPath[currentStep] = { ...newPath[currentStep], status: mockSimulationResult.attackPath[currentStep].status };
          return { ...prev, attackPath: newPath };
        });
        setCurrentStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (runningSimulation && currentStep >= runningSimulation.attackPath.length) {
      setRunningSimulation(prev => prev ? { ...prev, status: 'completed' } : null);
    }
  }, [runningSimulation, currentStep]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'text-green-400 bg-green-500/10 border-green-500';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      case 'advanced': return 'text-orange-400 bg-orange-500/10 border-orange-500';
      case 'expert': return 'text-red-400 bg-red-500/10 border-red-500';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'external': return '🌐';
      case 'insider': return '👤';
      case 'supply_chain': return '⛓️';
      case 'ransomware': return '🔒';
      case 'apt': return '🎯';
      default: return '⚔️';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-500/10 border-green-500';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500';
      case 'detected': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      case 'executing': return 'text-blue-400 bg-blue-500/10 border-blue-500 animate-pulse';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      default: return 'text-green-400 bg-green-500/10 border-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">💥 Breach Simulator</h1>
          <p className="text-gray-400">Automated red team attack simulation and penetration testing</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => { setActiveTab('results'); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium">
            📊 View Reports
          </button>
          <button onClick={() => alert('Custom Attack Builder:\n\nSelect attack vector, target system, techniques (MITRE ATT&CK), and payload type to create a custom breach simulation scenario.')} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium">
            🎯 Custom Attack
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-white">{scenarios.length}</div>
          <div className="text-gray-400 text-sm">Attack Scenarios</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-400">68</div>
          <div className="text-gray-400 text-sm">Security Score</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">50%</div>
          <div className="text-gray-400 text-sm">Detection Rate</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-400">4m</div>
          <div className="text-gray-400 text-sm">Mean Time to Detect</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-400">14</div>
          <div className="text-gray-400 text-sm">MITRE Tactics</div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-cyan-400">62%</div>
          <div className="text-gray-400 text-sm">Coverage</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'scenarios', label: '🎭 Attack Scenarios' },
          { id: 'simulations', label: '⚡ Live Simulation' },
          { id: 'results', label: '📊 Results' },
          { id: 'mitre', label: '🗺️ MITRE Coverage' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-red-500/20 text-red-400 border border-red-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scenarios Tab */}
      {activeTab === 'scenarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {scenarios.map(scenario => (
            <div key={scenario.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-red-500/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCategoryIcon(scenario.category)}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{scenario.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs border ${getDifficultyColor(scenario.difficulty)}`}>
                        {scenario.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">{scenario.estimatedDuration}</span>
                    </div>
                  </div>
                </div>
                {scenario.status === 'completed' && scenario.successRate !== undefined && (
                  <div className="text-right">
                    <div className={`text-xl font-bold ${scenario.successRate > 50 ? 'text-red-400' : 'text-green-400'}`}>
                      {scenario.successRate}%
                    </div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>
                )}
              </div>

              <p className="text-gray-400 text-sm mb-4">{scenario.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {scenario.techniques.map((tech, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-800 text-cyan-400 rounded text-xs font-mono">
                    {tech}
                  </span>
                ))}
              </div>

              <button
                onClick={() => startSimulation(scenario)}
                disabled={scenario.status === 'running'}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  scenario.status === 'running'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {scenario.status === 'running' ? '⏳ Running...' : '▶️ Start Simulation'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Live Simulation Tab */}
      {activeTab === 'simulations' && runningSimulation && (
        <div className="space-y-6">
          {/* Simulation Header */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">{runningSimulation.scenarioName}</h2>
                <p className="text-gray-400 text-sm">
                  {runningSimulation.status === 'running' ? 'Simulation in progress...' : 'Simulation completed'}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-lg font-bold ${
                runningSimulation.status === 'running'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500 animate-pulse'
                  : 'bg-green-500/20 text-green-400 border border-green-500'
              }`}>
                {runningSimulation.status === 'running' ? '⏳ RUNNING' : '✓ COMPLETED'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round((currentStep / runningSimulation.attackPath.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / runningSimulation.attackPath.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Attack Path */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">⚔️ Attack Path Execution</h3>
            <div className="space-y-3">
              {runningSimulation.attackPath.map((step, idx) => (
                <div key={step.id} className={`p-4 rounded-lg border ${getStepStatusColor(step.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full text-sm font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-medium">{step.name}</span>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-mono text-cyan-400">{step.mitreId}</span>
                          <span>•</span>
                          <span>{step.mitreTactic}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {step.timestamp && (
                        <span className="text-sm text-gray-500">{step.timestamp}</span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStepStatusColor(step.status)}`}>
                        {step.status === 'executing' && (
                          <svg className="animate-spin h-3 w-3 inline mr-1" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        )}
                        {step.status}
                      </span>
                    </div>
                  </div>
                  {step.details && step.status !== 'pending' && (
                    <p className="text-sm text-gray-400 ml-11">{step.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'simulations' && !runningSimulation && (
        <div className="text-center py-20 text-gray-500">
          <span className="text-6xl mb-4 block">🎯</span>
          <p>No active simulation. Select a scenario to begin.</p>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-6 rounded-xl border ${mockSimulationResult.overallSuccess ? 'bg-red-500/10 border-red-500/50' : 'bg-green-500/10 border-green-500/50'}`}>
              <h3 className="text-lg font-semibold mb-2">Attack Outcome</h3>
              <div className={`text-2xl font-bold ${mockSimulationResult.overallSuccess ? 'text-red-400' : 'text-green-400'}`}>
                {mockSimulationResult.overallSuccess ? '💀 BREACHED' : '🛡️ DEFENDED'}
              </div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Security Score</h3>
              <div className={`text-2xl font-bold ${
                mockSimulationResult.securityScore >= 80 ? 'text-green-400' :
                mockSimulationResult.securityScore >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>{mockSimulationResult.securityScore}/100</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Detection Rate</h3>
              <div className="text-2xl font-bold text-cyan-400">{mockSimulationResult.detectionRate}%</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">MTTD</h3>
              <div className="text-2xl font-bold text-purple-400">{mockSimulationResult.meanTimeToDetect}s</div>
            </div>
          </div>

          {/* Findings */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🔍 Security Findings</h2>
            <div className="space-y-4">
              {mockSimulationResult.findings.map(finding => (
                <div key={finding.id} className={`p-4 rounded-lg border ${getSeverityColor(finding.severity)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{finding.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getSeverityColor(finding.severity)}`}>
                          {finding.severity}
                        </span>
                        {finding.detected && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                            🔔 DETECTED
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">Attack Step: {finding.attackStep}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{finding.description}</p>
                  <div className="p-2 bg-black/30 rounded text-sm font-mono text-orange-400 mb-2">
                    {finding.evidence}
                  </div>
                  <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                    <span className="text-green-400 text-sm">💡 {finding.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MITRE Coverage Tab */}
      {activeTab === 'mitre' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🗺️ MITRE ATT&CK Coverage</h2>
            <p className="text-gray-400 mb-6">
              Test coverage across MITRE ATT&CK framework tactics and techniques
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mitreTactics.map(tactic => (
                <div key={tactic.id} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">{tactic.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({tactic.id})</span>
                    </div>
                    <span className={`font-bold ${
                      tactic.coverage >= 80 ? 'text-green-400' :
                      tactic.coverage >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>{tactic.coverage}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
                    <div 
                      className={`h-full rounded-full ${
                        tactic.coverage >= 80 ? 'bg-green-500' :
                        tactic.coverage >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${tactic.coverage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(tactic.techniques * tactic.coverage / 100)} / {tactic.techniques} techniques tested
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreachSimulator;
