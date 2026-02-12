import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

// ============================================================================
// INSIDER THREAT DETECTION
// ============================================================================
// Monitors Anchor team member behavior for anomalies
// Detects compromised accounts, malicious insiders, or social engineering
// ============================================================================

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'security' | 'support';
  riskScore: number;
  lastActive: string;
  location: string;
  mfaEnabled: boolean;
  recentActions: number;
  anomalies: number;
  status: 'normal' | 'elevated' | 'suspicious' | 'locked';
}

interface BehaviorAnomaly {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  type: 'location' | 'time' | 'access_pattern' | 'data_access' | 'privilege_escalation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  resolved: boolean;
}

interface AccessPattern {
  hour: number;
  normal: number;
  current: number;
}

export const InsiderThreatDetection: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [backendLoading, setBackendLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    (async () => {
      setBackendLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('insider-threat');
        } catch (e) { logger.error(e); } finally { setBackendLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res: any = await backendApi.modules.analyze('insider-threat', 'Analyze insider threat indicators for behavioral anomalies, data exfiltration patterns, and policy violations');
      if (res?.analysis) setAnalysisResult(res.analysis);
    } catch (e) { logger.error(e); } finally { setAnalyzing(false); }
  };

  // Team members with risk scores
  const teamMembers: TeamMember[] = [
    { id: 'u1', name: 'Todd (Founder)', email: 'todd@anchor.security', role: 'admin', riskScore: 5, lastActive: '2026-02-04T11:58:00Z', location: 'Brisbane, AU', mfaEnabled: true, recentActions: 45, anomalies: 0, status: 'normal' },
    { id: 'u2', name: 'Security Bot', email: 'bot@anchor.security', role: 'security', riskScore: 2, lastActive: '2026-02-04T11:59:00Z', location: 'AWS Sydney', mfaEnabled: true, recentActions: 1247, anomalies: 0, status: 'normal' },
    { id: 'u3', name: 'CI/CD Service', email: 'cicd@anchor.security', role: 'developer', riskScore: 8, lastActive: '2026-02-04T11:55:00Z', location: 'GitHub Actions', mfaEnabled: true, recentActions: 89, anomalies: 1, status: 'normal' },
    { id: 'u4', name: 'Backup Service', email: 'backup@anchor.security', role: 'support', riskScore: 3, lastActive: '2026-02-04T10:00:00Z', location: 'AWS Sydney', mfaEnabled: true, recentActions: 12, anomalies: 0, status: 'normal' }
  ];

  // Behavior anomalies
  const [anomalies, setAnomalies] = useState<BehaviorAnomaly[]>([
    { id: 'a1', timestamp: '2026-02-04T03:00:00Z', userId: 'u3', userName: 'CI/CD Service', type: 'time', severity: 'low', description: 'Unusual deployment at 3:00 AM - outside normal hours', resolved: false },
    { id: 'a2', timestamp: '2026-02-03T22:15:00Z', userId: 'test', userName: 'Unknown User', type: 'access_pattern', severity: 'high', description: 'Failed SSH attempt to production server', resolved: true },
    { id: 'a3', timestamp: '2026-02-02T14:30:00Z', userId: 'external', userName: 'External IP', type: 'privilege_escalation', severity: 'critical', description: 'Attempted privilege escalation via API endpoint', resolved: true }
  ]);

  // Normal access pattern for visualization
  const accessPattern: AccessPattern[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    normal: hour >= 8 && hour <= 18 ? 80 + Math.random() * 20 : 10 + Math.random() * 10,
    current: hour >= 8 && hour <= 18 ? 75 + Math.random() * 25 : 5 + Math.random() * 15
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500/10 border-green-500 text-green-400';
      case 'elevated': return 'bg-yellow-500/10 border-yellow-500 text-yellow-400';
      case 'suspicious': return 'bg-orange-500/10 border-orange-500 text-orange-400';
      case 'locked': return 'bg-red-500/10 border-red-500 text-red-400';
      default: return 'bg-gray-500/10 border-gray-500 text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 border-red-500 text-red-400';
      case 'high': return 'bg-orange-500/10 border-orange-500 text-orange-400';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500 text-yellow-400';
      default: return 'bg-blue-500/10 border-blue-500 text-blue-400';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 50) return 'text-orange-400';
    if (score >= 30) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-slate-900 text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">👁️ Insider Threat Detection</h1>
          <p className="text-gray-400">User behavior analytics & anomaly detection for Anchor team</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleAIAnalysis} disabled={analyzing || backendLoading} className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500 rounded-lg text-purple-400 font-medium disabled:opacity-50 transition-colors">
            {analyzing ? '⏳ Analyzing...' : '🤖 AI Analysis'}
          </button>
          <div className="px-4 py-2 bg-green-500/10 border border-green-500 rounded-lg">
            <span className="text-green-400 font-bold">ALL CLEAR</span>
            <span className="text-gray-400 text-sm ml-2">No active threats</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-cyan-400">{teamMembers.length}</div>
          <div className="text-gray-400">Active Users</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400">{teamMembers.filter(m => m.mfaEnabled).length}</div>
          <div className="text-gray-400">MFA Enabled</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400">{anomalies.filter(a => !a.resolved).length}</div>
          <div className="text-gray-400">Active Anomalies</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400">{Math.round(teamMembers.reduce((sum, m) => sum + (100 - m.riskScore), 0) / teamMembers.length)}%</div>
          <div className="text-gray-400">Trust Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">👥 Team Risk Assessment</h2>
          <div className="space-y-3">
            {teamMembers.map(member => (
              <div
                key={member.id}
                onClick={() => setSelectedUser(member.id === selectedUser ? null : member.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  member.id === selectedUser ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      member.role === 'admin' ? 'bg-purple-500' :
                      member.role === 'developer' ? 'bg-blue-500' :
                      member.role === 'security' ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getRiskColor(member.riskScore)}`}>{member.riskScore}</div>
                      <div className="text-xs text-gray-500">risk</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </div>
                </div>
                {member.id === selectedUser && (
                  <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Last Active:</span>
                      <span className="ml-2">{new Date(member.lastActive).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <span className="ml-2">{member.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Recent Actions:</span>
                      <span className="ml-2">{member.recentActions}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Anomalies:</span>
                      <span className={`ml-2 ${member.anomalies > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {member.anomalies}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly Feed */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">⚠️ Behavior Anomalies</h2>
          <div className="space-y-3">
            {anomalies.map(anomaly => (
              <div
                key={anomaly.id}
                className={`p-4 rounded-lg border ${anomaly.resolved ? 'border-gray-700 opacity-60' : getSeverityColor(anomaly.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {anomaly.type === 'location' ? '📍' :
                       anomaly.type === 'time' ? '🕐' :
                       anomaly.type === 'access_pattern' ? '📊' :
                       anomaly.type === 'data_access' ? '📁' : '⚡'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity}
                    </span>
                    {anomaly.resolved && (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                        Resolved
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{new Date(anomaly.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-sm mb-1">{anomaly.description}</div>
                <div className="text-xs text-gray-500">User: {anomaly.userName}</div>
                {!anomaly.resolved && (
                  <button onClick={() => { if (window.confirm(`Mark anomaly "${anomaly.description}" as resolved?`)) { setAnomalies(prev => prev.map(a => a.id === anomaly.id ? { ...a, resolved: true } : a)); } }} className="mt-2 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500 rounded text-sm text-green-400">
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Access Pattern */}
      <div className="mt-6 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">📈 Access Pattern Analysis (24hr)</h2>
        <div className="flex items-end gap-1 h-32">
          {accessPattern.map((hour, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center gap-0.5">
                <div
                  className="w-full bg-cyan-500/50 rounded-t"
                  style={{ height: `${hour.current * 0.8}px` }}
                  title={`Current: ${Math.round(hour.current)}%`}
                ></div>
              </div>
              {idx % 4 === 0 && (
                <span className="text-xs text-gray-500">{hour.hour}:00</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500/50 rounded"></div>
            <span className="text-gray-400">Current Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-gray-500 rounded"></div>
            <span className="text-gray-400">Normal Baseline</span>
          </div>
        </div>
      </div>

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-purple-400">🤖 AI Analysis Result</h3>
            <button onClick={() => setAnalysisResult('')} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{analysisResult}</p>
        </div>
      )}
    </div>
  );
};

export default InsiderThreatDetection;
