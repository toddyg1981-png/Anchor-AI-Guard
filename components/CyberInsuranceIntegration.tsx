import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

interface RiskScore {
  overall: number;
  trend: 'improving' | 'stable' | 'declining';
  categories: {
    name: string;
    score: number;
    weight: number;
    factors: string[];
  }[];
}

interface InsurancePolicy {
  id: string;
  provider: string;
  policyNumber: string;
  coverage: string;
  premium: string;
  deductible: string;
  status: 'active' | 'pending' | 'expired';
  renewalDate: string;
  riskTier: 'preferred' | 'standard' | 'high-risk';
}

interface PremiumImpact {
  action: string;
  currentScore: number;
  projectedScore: number;
  premiumReduction: string;
  effort: 'low' | 'medium' | 'high';
  timeToImplement: string;
}

const CyberInsuranceIntegration: React.FC = () => {
  const [riskScore] = useState<RiskScore>({
    overall: 742,
    trend: 'improving',
    categories: [
      {
        name: 'Endpoint Security',
        score: 85,
        weight: 20,
        factors: ['EDR deployed', 'Patch compliance 94%', 'MFA enabled'],
      },
      {
        name: 'Network Security',
        score: 78,
        weight: 20,
        factors: ['Segmentation partial', 'Firewall rules audited', 'IDS/IPS active'],
      },
      {
        name: 'Data Protection',
        score: 72,
        weight: 15,
        factors: ['Encryption at rest', 'DLP deployed', 'Backup tested'],
      },
      {
        name: 'Access Control',
        score: 88,
        weight: 15,
        factors: ['MFA 100%', 'PAM implemented', 'SSO deployed'],
      },
      {
        name: 'Incident Response',
        score: 65,
        weight: 15,
        factors: ['IR plan exists', 'Tabletop needed', 'MTTR 4.2 hours'],
      },
      {
        name: 'Governance',
        score: 80,
        weight: 15,
        factors: ['CISO appointed', 'Board reporting', 'Security budget adequate'],
      },
    ],
  });

  const [policies] = useState<InsurancePolicy[]>([
    {
      id: 'pol-1',
      provider: 'Coalition',
      policyNumber: 'CYB-2026-48291',
      coverage: '$10M',
      premium: '$285,000/yr',
      deductible: '$100,000',
      status: 'active',
      renewalDate: '2026-12-15',
      riskTier: 'preferred',
    },
    {
      id: 'pol-2',
      provider: 'Beazley',
      policyNumber: 'BZL-9182734',
      coverage: '$5M (Excess)',
      premium: '$95,000/yr',
      deductible: '$250,000',
      status: 'active',
      renewalDate: '2026-12-15',
      riskTier: 'standard',
    },
  ]);

  const [premiumOptimizations] = useState<PremiumImpact[]>([
    {
      action: 'Deploy network segmentation',
      currentScore: 78,
      projectedScore: 92,
      premiumReduction: '$42,000/yr',
      effort: 'high',
      timeToImplement: '3 months',
    },
    {
      action: 'Complete IR tabletop exercise',
      currentScore: 65,
      projectedScore: 85,
      premiumReduction: '$28,000/yr',
      effort: 'low',
      timeToImplement: '2 weeks',
    },
    {
      action: 'Achieve SOC 2 Type II',
      currentScore: 80,
      projectedScore: 95,
      premiumReduction: '$55,000/yr',
      effort: 'high',
      timeToImplement: '6 months',
    },
    {
      action: 'Implement privileged session recording',
      currentScore: 88,
      projectedScore: 95,
      premiumReduction: '$18,000/yr',
      effort: 'medium',
      timeToImplement: '1 month',
    },
  ]);

  const [backendLoading, setBackendLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    (async () => {
      setBackendLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('cyber-insurance');
        if (res) console.log('Dashboard loaded:', res);
      } catch (e) { console.error(e); } finally { setBackendLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await backendApi.modules.analyze('cyber-insurance', 'Analyze cyber insurance posture, coverage gaps, and risk factors affecting premiums');
      if ((res as any)?.analysis) setAnalysisResult((res as any).analysis);
    } catch (e) { console.error(e); } finally { setAnalyzing(false); }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 800) return 'A+';
    if (score >= 750) return 'A';
    if (score >= 700) return 'A-';
    if (score >= 650) return 'B+';
    if (score >= 600) return 'B';
    return 'C';
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'preferred': return 'text-green-400 bg-green-500/20';
      case 'standard': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-red-400 bg-red-500/20';
    }
  };

  const exportRiskReport = () => {
    const lines = [
      'Anchor Security - Cyber Risk Report',
      `Generated: ${new Date().toISOString()}`,
      '',
      `Overall Risk Score: ${riskScore.overall}/900`,
      `Trend: ${riskScore.trend}`,
      '',
      'Category Scores:',
      ...riskScore.categories.map(c => `  ${c.name}: ${c.score}/100 (weight: ${c.weight}%) - ${c.factors.join(', ')}`),
      '',
      'Active Policies:',
      ...policies.map(p => `  ${p.provider} (${p.policyNumber}) - Coverage: ${p.coverage}, Premium: ${p.premium}, Tier: ${p.riskTier}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-report-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🛡️ Cyber Insurance Integration</h1>
          <p className="text-gray-400 mt-1">Real-time risk scoring for insurers — Lower premiums through verified security</p>
        </div>
        <button onClick={exportRiskReport} className="px-4 py-2 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity">
          Export Risk Report
        </button>
        <button
          onClick={handleAIAnalysis}
          disabled={analyzing || backendLoading}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {analyzing ? '⏳ Analyzing...' : '🤖 AI Analysis'}
        </button>
      </div>

      {/* Risk Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Score */}
        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="text-sm text-gray-400 mb-2">Cyber Risk Score</div>
          <div className="relative">
            <div className="text-7xl font-bold text-cyan-400">{riskScore.overall}</div>
            <div className="absolute -right-8 top-2">
              <span className={`text-2xl font-bold ${getScoreColor(riskScore.overall)}`}>
                {getScoreGrade(riskScore.overall)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-green-400">↑</span>
            <span className="text-sm text-green-400">+23 pts this month</span>
          </div>
          <div className="text-xs text-gray-500 mt-4">Score range: 300-850</div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Risk Category Breakdown</h2>
          <div className="space-y-3">
            {riskScore.categories.map((cat, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{cat.weight}% weight</span>
                    <span className={`font-semibold ${getScoreColor(cat.score)}`}>{cat.score}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      cat.score >= 80 ? 'bg-green-500' : cat.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Policies */}
      <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span> Active Insurance Policies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{policy.provider}</h3>
                  <p className="text-xs text-gray-500">{policy.policyNumber}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTierColor(policy.riskTier)}`}>
                  {policy.riskTier.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Coverage</span>
                  <div className="text-cyan-400 font-semibold">{policy.coverage}</div>
                </div>
                <div>
                  <span className="text-gray-500">Premium</span>
                  <div className="text-white font-semibold">{policy.premium}</div>
                </div>
                <div>
                  <span className="text-gray-500">Deductible</span>
                  <div className="text-white">{policy.deductible}</div>
                </div>
                <div>
                  <span className="text-gray-500">Renewal</span>
                  <div className="text-white">{policy.renewalDate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Optimization */}
      <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">💰</span> Premium Optimization Opportunities
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Total potential savings: <span className="text-green-400 font-bold">$143,000/year</span>
        </p>
        <div className="space-y-3">
          {premiumOptimizations.map((opt, idx) => (
            <div
              key={idx}
              className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h4 className="text-white font-medium">{opt.action}</h4>
                <div className="flex items-center gap-4 mt-1 text-xs">
                  <span className="text-gray-500">
                    Score: {opt.currentScore} → <span className="text-green-400">{opt.projectedScore}</span>
                  </span>
                  <span className={`px-1.5 py-0.5 rounded ${
                    opt.effort === 'low' ? 'bg-green-500/20 text-green-400' :
                    opt.effort === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {opt.effort} effort
                  </span>
                  <span className="text-gray-500">{opt.timeToImplement}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">{opt.premiumReduction}</div>
                <div className="text-xs text-gray-500">annual savings</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insurer API Integration */}
      <div className="bg-linear-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">🔗 Connected Insurers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Coalition', 'Beazley', 'Chubb', 'AIG'].map((insurer, idx) => (
            <div key={idx} className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-white font-medium mb-1">{insurer}</div>
              <div className="text-xs text-green-400">✓ API Connected</div>
              <div className="text-xs text-gray-500">Real-time sync</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Anchor shares verified security posture data with insurers via secure API, enabling dynamic premium adjustments based on your actual security controls.
        </p>
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

export default CyberInsuranceIntegration;
