import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

// ============================================================================
// ZERO TRUST SECURITY MODEL
// ============================================================================
// "Never trust, always verify" - Every request is authenticated and authorized
// Microsegmentation, continuous verification, least privilege access
// ============================================================================

interface ZeroTrustPolicy {
  id: string;
  name: string;
  description: string;
  type: 'identity' | 'device' | 'network' | 'application' | 'data';
  status: 'enforced' | 'monitoring' | 'disabled';
  violations: number;
  lastTriggered?: string;
}

interface AccessRequest {
  id: string;
  timestamp: string;
  user: string;
  resource: string;
  action: string;
  decision: 'allow' | 'deny' | 'challenge';
  riskScore: number;
  factors: string[];
}

interface TrustScore {
  category: string;
  score: number;
  maxScore: number;
  factors: { name: string; status: 'pass' | 'fail' | 'warn' }[];
}

export const ZeroTrustSecurity: React.FC = () => {
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendPosture, setBackendPosture] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [posture, dashboard] = await Promise.all([
          backendApi.zeroTrust.getPosture(),
          backendApi.modules.getDashboard('zero-trust'),
        ]);
        setBackendPosture(posture);
      } catch (err) {
        logger.error('Failed to load zero trust data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await backendApi.modules.analyze('zero-trust', 'Zero Trust Architecture posture assessment', 'Evaluate our zero trust implementation maturity and provide recommendations');
      setAiAnalysis(result);
    } catch (err) {
      logger.error('AI analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Zero Trust Policies
  const policies: ZeroTrustPolicy[] = [
    { id: 'zt-1', name: 'Identity Verification', description: 'Multi-factor authentication required for all access', type: 'identity', status: 'enforced', violations: 0 },
    { id: 'zt-2', name: 'Device Trust', description: 'Only managed devices with valid certificates allowed', type: 'device', status: 'enforced', violations: 2, lastTriggered: '2026-02-04T10:30:00Z' },
    { id: 'zt-3', name: 'Network Microsegmentation', description: 'East-west traffic restricted between segments', type: 'network', status: 'enforced', violations: 0 },
    { id: 'zt-4', name: 'Application Access', description: 'Just-in-time access with automatic revocation', type: 'application', status: 'enforced', violations: 1, lastTriggered: '2026-02-04T09:15:00Z' },
    { id: 'zt-5', name: 'Data Classification', description: 'Access based on data sensitivity and user clearance', type: 'data', status: 'enforced', violations: 0 },
    { id: 'zt-6', name: 'Continuous Verification', description: 'Re-authenticate on context changes', type: 'identity', status: 'enforced', violations: 5, lastTriggered: '2026-02-04T11:45:00Z' },
    { id: 'zt-7', name: 'Least Privilege', description: 'Minimum permissions required for task', type: 'application', status: 'enforced', violations: 0 },
    { id: 'zt-8', name: 'Encryption Everywhere', description: 'All data encrypted in transit and at rest', type: 'data', status: 'enforced', violations: 0 }
  ];

  // Recent access requests
  const accessRequests: AccessRequest[] = [
    { id: 'ar-1', timestamp: '2026-02-04T11:59:00Z', user: 'todd@anchor.security', resource: '/api/admin', action: 'GET', decision: 'allow', riskScore: 5, factors: ['MFA verified', 'Known device', 'Normal location'] },
    { id: 'ar-2', timestamp: '2026-02-04T11:58:30Z', user: 'service-bot', resource: '/api/scan', action: 'POST', decision: 'allow', riskScore: 10, factors: ['Service account', 'Internal network', 'Valid token'] },
    { id: 'ar-3', timestamp: '2026-02-04T11:58:00Z', user: 'unknown', resource: '/api/admin', action: 'GET', decision: 'deny', riskScore: 95, factors: ['No auth', 'Unknown IP', 'Suspicious UA'] },
    { id: 'ar-4', timestamp: '2026-02-04T11:57:30Z', user: 'todd@anchor.security', resource: '/api/settings', action: 'PUT', decision: 'challenge', riskScore: 45, factors: ['MFA verified', 'New IP detected', 'Sensitive resource'] },
    { id: 'ar-5', timestamp: '2026-02-04T11:57:00Z', user: 'backup@anchor.security', resource: '/db/backup', action: 'GET', decision: 'allow', riskScore: 15, factors: ['Service account', 'Scheduled time', 'Normal pattern'] }
  ];

  // Trust scores
  const trustScores: TrustScore[] = [
    { category: 'Identity', score: 98, maxScore: 100, factors: [
      { name: 'MFA Enabled', status: 'pass' },
      { name: 'Strong Passwords', status: 'pass' },
      { name: 'No Shared Accounts', status: 'pass' },
      { name: 'Session Timeout', status: 'pass' }
    ]},
    { category: 'Device', score: 95, maxScore: 100, factors: [
      { name: 'Managed Devices', status: 'pass' },
      { name: 'Endpoint Protection', status: 'pass' },
      { name: 'Disk Encryption', status: 'pass' },
      { name: 'OS Updated', status: 'warn' }
    ]},
    { category: 'Network', score: 100, maxScore: 100, factors: [
      { name: 'TLS Everywhere', status: 'pass' },
      { name: 'Firewall Rules', status: 'pass' },
      { name: 'Microsegmentation', status: 'pass' },
      { name: 'DNS Security', status: 'pass' }
    ]},
    { category: 'Application', score: 97, maxScore: 100, factors: [
      { name: 'RBAC Enforced', status: 'pass' },
      { name: 'API Authentication', status: 'pass' },
      { name: 'Input Validation', status: 'pass' },
      { name: 'Rate Limiting', status: 'pass' }
    ]},
    { category: 'Data', score: 100, maxScore: 100, factors: [
      { name: 'Encryption at Rest', status: 'pass' },
      { name: 'Encryption in Transit', status: 'pass' },
      { name: 'Access Logging', status: 'pass' },
      { name: 'DLP Enabled', status: 'pass' }
    ]}
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'identity': return '👤';
      case 'device': return '💻';
      case 'network': return '🌐';
      case 'application': return '📱';
      case 'data': return '📁';
      default: return '🔒';
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'allow': return 'bg-green-500 text-white';
      case 'deny': return 'bg-red-500 text-white';
      case 'challenge': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const overallScore = backendPosture?.overallScore || Math.round(trustScores.reduce((sum, t) => sum + t.score, 0) / trustScores.length);
  const maturityLevel = backendPosture?.maturityLevel || 'Advancing';

  if (loading) {
    return (
      <div className="bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Zero Trust posture data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🔐 Zero Trust Security</h1>
          <p className="text-gray-400">&quot;Never trust, always verify&quot; - Continuous authentication & authorization</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={runAIAnalysis} disabled={analyzing} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50">
            {analyzing ? '⏳ Analyzing...' : '🤖 AI Assessment'}
          </button>
          <div className="text-center px-4 py-2 bg-blue-500/10 border border-blue-500 rounded-xl">
            <div className="text-lg font-bold text-blue-400">{maturityLevel}</div>
            <div className="text-xs text-gray-400">Maturity</div>
          </div>
          <div className="text-center px-6 py-3 bg-green-500/10 border border-green-500 rounded-xl">
            <div className="text-3xl font-bold text-green-400">{overallScore}%</div>
            <div className="text-xs text-gray-400">Zero Trust Score</div>
          </div>
        </div>
      </div>

      {aiAnalysis && (
        <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
          <h3 className="text-lg font-semibold text-purple-400 mb-2">🤖 AI Zero Trust Assessment</h3>
          <p className="text-gray-300 mb-2">{aiAnalysis.assessment || 'Analysis complete'}</p>
          <div className="flex gap-4 text-sm">
            <span className="text-cyan-400">Score: {aiAnalysis.score || overallScore}/100</span>
            <span className="text-yellow-400">Risk: {aiAnalysis.riskLevel || 'medium'}</span>
            <span className="text-green-400">Source: {aiAnalysis.source || 'AI'}</span>
          </div>
          {aiAnalysis.recommendations?.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-400 mb-1">Recommendations:</p>
              {aiAnalysis.recommendations.slice(0, 3).map((r: any, i: number) => (
                <p key={i} className="text-sm text-gray-300">• {r.action || r}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trust Pillars */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {trustScores.map((trust, idx) => (
          <div key={idx} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{getTypeIcon(trust.category.toLowerCase())}</span>
              <span className={`text-2xl font-bold ${
                trust.score >= 95 ? 'text-green-400' :
                trust.score >= 80 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {trust.score}%
              </span>
            </div>
            <h3 className="font-medium mb-2">{trust.category}</h3>
            <div className="space-y-1">
              {trust.factors.map((factor, fIdx) => (
                <div key={fIdx} className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    factor.status === 'pass' ? 'bg-green-400' :
                    factor.status === 'warn' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></span>
                  <span className="text-gray-400">{factor.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policies */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Zero Trust Policies</h2>
          <div className="space-y-3">
            {policies.map(policy => (
              <div
                key={policy.id}
                onClick={() => setSelectedPolicy(policy.id === selectedPolicy ? null : policy.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  policy.id === selectedPolicy ? 'border-cyan-500 bg-cyan-500/10' :
                  policy.status === 'enforced' ? 'border-green-500/30 bg-green-500/5' :
                  'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getTypeIcon(policy.type)}</span>
                    <span className="font-medium">{policy.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {policy.violations > 0 && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                        {policy.violations} violations
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      policy.status === 'enforced' ? 'bg-green-500/20 text-green-400' :
                      policy.status === 'monitoring' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {policy.status}
                    </span>
                  </div>
                </div>
                {policy.id === selectedPolicy && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-400">{policy.description}</p>
                    {policy.lastTriggered && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last triggered: {new Date(policy.lastTriggered).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Access Requests */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">🔍 Access Decisions (Live)</h2>
          <div className="space-y-3">
            {accessRequests.map(request => (
              <div
                key={request.id}
                className={`p-4 rounded-lg border ${
                  request.decision === 'deny' ? 'border-red-500/50 bg-red-500/5' :
                  request.decision === 'challenge' ? 'border-yellow-500/50 bg-yellow-500/5' :
                  'border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getDecisionColor(request.decision)}`}>
                      {request.decision.toUpperCase()}
                    </span>
                    <span className="font-mono text-sm text-cyan-400">{request.user}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(request.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <span className="px-1 bg-gray-700 rounded text-xs">{request.action}</span>
                  <span>{request.resource}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {request.factors.map((factor, idx) => (
                      <span key={idx} className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                        {factor}
                      </span>
                    ))}
                  </div>
                  <div className={`text-sm font-bold ${
                    request.riskScore > 70 ? 'text-red-400' :
                    request.riskScore > 40 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    Risk: {request.riskScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zero Trust Architecture Diagram */}
      <div className="mt-6 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">🏗️ Zero Trust Architecture</h2>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {['User', 'Device', 'Network', 'Application', 'Data'].map((layer, idx) => (
            <React.Fragment key={layer}>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center mb-2">
                  <span className="text-2xl">{getTypeIcon(layer.toLowerCase())}</span>
                </div>
                <span className="text-sm font-medium">{layer}</span>
                <span className="text-xs text-gray-500">Verify</span>
              </div>
              {idx < 4 && (
                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-cyan-500/50"></div>
                  <span className="text-cyan-500">→</span>
                  <div className="w-8 h-0.5 bg-cyan-500/50"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          Every request is authenticated and authorized at every layer. No implicit trust.
        </div>
      </div>
    </div>
  );
};

export default ZeroTrustSecurity;
