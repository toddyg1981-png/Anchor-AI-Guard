import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';
import { logger } from '../utils/logger';

interface SOCAgent {
  id: string;
  name: string;
  type: 'detection' | 'investigation' | 'response' | 'hunting' | 'reporting';
  status: 'active' | 'idle' | 'processing';
  tasksCompleted: number;
  accuracy: number;
  lastAction: string;
  lastActionTime: string;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  description: string;
  status: 'new' | 'investigating' | 'contained' | 'resolved';
  assignedAgent: string;
  humanEscalation: boolean;
}

interface AutomatedResponse {
  id: string;
  triggeredBy: string;
  action: string;
  target: string;
  status: 'pending' | 'executed' | 'rolled-back';
  timestamp: string;
  confidence: number;
}

const AutonomousSOC: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [socDashboard, setSocDashboard] = useState<unknown>(null);
  const [liveEvents, setLiveEvents] = useState<unknown[]>([]);
  const [playbooks, setPlaybooks] = useState<unknown[]>([]);

  // Fetch real data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboard, eventsResp, playbooksResp] = await Promise.all([
          backendApi.soc.getDashboard(),
          backendApi.soc.getEvents({ limit: 10 }),
          backendApi.soc.getPlaybooks(),
        ]);
        setSocDashboard(dashboard);
        setLiveEvents((eventsResp as { events: unknown[] })?.events || []);
        setPlaybooks((playbooksResp as { playbooks: unknown[] })?.playbooks || []);
        logger.info('SOC data loaded', { dashboard });
      } catch (err) {
        logger.error('Failed to load SOC data', { error: err });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [agents] = useState<SOCAgent[]>([
    {
      id: 'agent-1',
      name: 'SENTINEL-α',
      type: 'detection',
      status: 'active',
      tasksCompleted: 15847,
      accuracy: 99.7,
      lastAction: 'Analyzed 2,847 network flows',
      lastActionTime: '2 seconds ago',
    },
    {
      id: 'agent-2',
      name: 'HUNTER-β',
      type: 'hunting',
      status: 'processing',
      tasksCompleted: 3291,
      accuracy: 98.9,
      lastAction: 'Proactive threat hunt in DMZ',
      lastActionTime: '15 seconds ago',
    },
    {
      id: 'agent-3',
      name: 'RESPONDER-γ',
      type: 'response',
      status: 'active',
      tasksCompleted: 892,
      accuracy: 99.2,
      lastAction: 'Isolated compromised endpoint',
      lastActionTime: '1 minute ago',
    },
    {
      id: 'agent-4',
      name: 'ANALYST-δ',
      type: 'investigation',
      status: 'processing',
      tasksCompleted: 4521,
      accuracy: 97.8,
      lastAction: 'Correlating APT indicators',
      lastActionTime: '30 seconds ago',
    },
    {
      id: 'agent-5',
      name: 'REPORTER-ε',
      type: 'reporting',
      status: 'idle',
      tasksCompleted: 1205,
      accuracy: 99.9,
      lastAction: 'Generated executive briefing',
      lastActionTime: '5 minutes ago',
    },
  ]);

  const [events] = useState<SecurityEvent[]>([
    {
      id: 'evt-1',
      timestamp: new Date().toISOString(),
      type: 'Lateral Movement Detected',
      severity: 'critical',
      source: '10.0.15.42',
      description: 'Anomalous RDP connections from compromised workstation',
      status: 'investigating',
      assignedAgent: 'ANALYST-δ',
      humanEscalation: true,
    },
    {
      id: 'evt-2',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      type: 'Malware Beacon',
      severity: 'high',
      source: '10.0.22.15',
      description: 'C2 communication pattern detected - Cobalt Strike signature',
      status: 'contained',
      assignedAgent: 'RESPONDER-γ',
      humanEscalation: false,
    },
    {
      id: 'evt-3',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: 'Credential Stuffing',
      severity: 'high',
      source: 'External',
      description: '847 failed auth attempts against VPN gateway',
      status: 'resolved',
      assignedAgent: 'RESPONDER-γ',
      humanEscalation: false,
    },
  ]);

  const [responses] = useState<AutomatedResponse[]>([
    {
      id: 'resp-1',
      triggeredBy: 'Lateral Movement Detection',
      action: 'Network Isolation',
      target: '10.0.15.42',
      status: 'executed',
      timestamp: new Date(Date.now() - 45000).toISOString(),
      confidence: 94.2,
    },
    {
      id: 'resp-2',
      triggeredBy: 'C2 Beacon Detection',
      action: 'Process Termination + Memory Dump',
      target: '10.0.22.15',
      status: 'executed',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      confidence: 98.7,
    },
    {
      id: 'resp-3',
      triggeredBy: 'Credential Attack',
      action: 'IP Block + Rate Limit',
      target: 'WAF Policy',
      status: 'executed',
      timestamp: new Date(Date.now() - 360000).toISOString(),
      confidence: 99.1,
    },
  ]);

  const [metrics] = useState({
    mttr: '4.2 minutes',
    mttd: '12 seconds',
    automationRate: 94.7,
    falsePositiveRate: 0.3,
    eventsPerDay: 2847291,
    humanEscalations: 23,
    costSavings: '$2.4M/month',
    analystEquivalent: 47,
  });

  const [liveCounter, setLiveCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCounter((prev) => prev + Math.floor(Math.random() * 50) + 10);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'processing': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🤖 Autonomous SOC</h1>
          <p className="text-gray-400 mt-1">AI-Powered Security Operations Center — Zero Human Intervention Required</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-500">Events Processed Today</div>
            <div className="text-2xl font-mono font-bold text-cyan-400">
              {(metrics.eventsPerDay + liveCounter).toLocaleString()}
            </div>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">FULLY AUTONOMOUS</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'MTTD', value: metrics.mttd, color: 'cyan' },
          { label: 'MTTR', value: metrics.mttr, color: 'green' },
          { label: 'Automation', value: `${metrics.automationRate}%`, color: 'purple' },
          { label: 'False Positive', value: `${metrics.falsePositiveRate}%`, color: 'emerald' },
          { label: 'Daily Events', value: '2.8M+', color: 'blue' },
          { label: 'Human Escalations', value: metrics.humanEscalations.toString(), color: 'orange' },
          { label: 'Cost Savings', value: metrics.costSavings, color: 'yellow' },
          { label: 'Analyst Equivalent', value: `${metrics.analystEquivalent} FTEs`, color: 'pink' },
        ].map((metric, idx) => (
          <div key={idx} className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
            <div className={`text-lg font-bold text-${metric.color}-400`}>{metric.value}</div>
          </div>
        ))}
      </div>

      {/* AI Agents */}
      <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🧠</span> AI Security Agents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-bold text-cyan-400">{agent.name}</span>
                <span className={`text-xs ${getStatusColor(agent.status)} flex items-center gap-1`}>
                  {agent.status === 'processing' && (
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  )}
                  {agent.status.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-2 capitalize">{agent.type} Agent</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tasks</span>
                  <span className="text-white">{agent.tasksCompleted.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Accuracy</span>
                  <span className="text-green-400">{agent.accuracy}%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <div className="text-xs text-gray-400 truncate">{agent.lastAction}</div>
                <div className="text-xs text-gray-600">{agent.lastActionTime}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Security Events */}
        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span> Live Security Events
          </h2>
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </span>
                    <span className="text-white font-medium">{event.type}</span>
                  </div>
                  {event.humanEscalation && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                      👤 HUMAN REVIEW
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-2">{event.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Source: {event.source}</span>
                  <span className="text-cyan-400">Agent: {event.assignedAgent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Automated Responses */}
        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span> Automated Responses
          </h2>
          <div className="space-y-3">
            {responses.map((response) => (
              <div
                key={response.id}
                className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{response.action}</span>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                    ✓ {response.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  Triggered by: {response.triggeredBy}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Target: {response.target}</span>
                  <span className="text-cyan-400">Confidence: {response.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROI Calculator */}
      <div className="bg-linear-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">💰 ROI: Autonomous SOC vs Traditional SOC</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-400">Traditional SOC Cost</div>
            <div className="text-2xl font-bold text-red-400">$4.2M/year</div>
            <div className="text-xs text-gray-500">20 analysts @ $150K + tools</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Anchor Autonomous SOC</div>
            <div className="text-2xl font-bold text-green-400">$1.2M/year</div>
            <div className="text-xs text-gray-500">Platform + 3 senior analysts</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Annual Savings</div>
            <div className="text-2xl font-bold text-yellow-400">$3.0M/year</div>
            <div className="text-xs text-gray-500">71% cost reduction</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Efficiency Gain</div>
            <div className="text-2xl font-bold text-cyan-400">47x</div>
            <div className="text-xs text-gray-500">Equivalent analyst capacity</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutonomousSOC;
