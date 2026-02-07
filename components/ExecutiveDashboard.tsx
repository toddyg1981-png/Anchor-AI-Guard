import React, { useState } from 'react';

// ============================================================================
// EXECUTIVE RISK DASHBOARD - BOARD-LEVEL SECURITY REPORTING
// ============================================================================

interface RiskMetrics {
  totalExposure: number;
  potentialLoss: number;
  riskReduction: number;
  complianceScore: number;
  securityPosture: 'critical' | 'high' | 'medium' | 'low' | 'excellent';
}

interface RiskTrend {
  date: string;
  exposure: number;
  vulns: number;
  score: number;
}

interface IndustryBenchmark {
  category: string;
  yourScore: number;
  industryAvg: number;
  topPerformers: number;
}

interface BreachScenario {
  id: string;
  name: string;
  probability: number;
  financialImpact: number;
  reputationalImpact: 'low' | 'medium' | 'high' | 'critical';
  attackVector: string;
  affectedAssets: string[];
  mitigationCost: number;
  timeToRemediate: string;
}

interface SecurityInvestment {
  category: string;
  currentSpend: number;
  recommendedSpend: number;
  riskReductionPotential: number;
}

// FAIR Model Risk Quantification
interface FAIRAnalysis {
  lef: { min: number; likely: number; max: number }; // Loss Event Frequency
  lm: { min: number; likely: number; max: number };  // Loss Magnitude
  ale: number; // Annualized Loss Expectancy
  confidence: number;
}

// ============================================================================
// EXECUTIVE DASHBOARD COMPONENT
// ============================================================================

export const ExecutiveDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('90d');
  const [selectedScenario, setSelectedScenario] = useState<BreachScenario | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Mock data - in production, this comes from backend analysis
  const riskMetrics: RiskMetrics = {
    totalExposure: 4200000,
    potentialLoss: 12500000,
    riskReduction: 68,
    complianceScore: 72,
    securityPosture: 'medium'
  };

  const riskTrends: RiskTrend[] = [
    { date: '2025-09', exposure: 8500000, vulns: 245, score: 45 },
    { date: '2025-10', exposure: 7200000, vulns: 198, score: 52 },
    { date: '2025-11', exposure: 5800000, vulns: 156, score: 61 },
    { date: '2025-12', exposure: 4900000, vulns: 123, score: 68 },
    { date: '2026-01', exposure: 4200000, vulns: 98, score: 72 },
    { date: '2026-02', exposure: 4200000, vulns: 87, score: 76 },
  ];

  const benchmarks: IndustryBenchmark[] = [
    { category: 'Vulnerability Management', yourScore: 72, industryAvg: 58, topPerformers: 89 },
    { category: 'Patch Compliance', yourScore: 65, industryAvg: 52, topPerformers: 94 },
    { category: 'Security Awareness', yourScore: 78, industryAvg: 61, topPerformers: 92 },
    { category: 'Incident Response', yourScore: 58, industryAvg: 49, topPerformers: 87 },
    { category: 'Access Control', yourScore: 81, industryAvg: 63, topPerformers: 95 },
    { category: 'Data Protection', yourScore: 69, industryAvg: 55, topPerformers: 91 },
  ];

  const breachScenarios: BreachScenario[] = [
    {
      id: 'scenario-1',
      name: 'Ransomware Attack via Unpatched Server',
      probability: 0.35,
      financialImpact: 8500000,
      reputationalImpact: 'critical',
      attackVector: 'Exploitation of CVE-2024-21762 in FortiOS',
      affectedAssets: ['Production Database', 'File Servers', 'ERP System'],
      mitigationCost: 150000,
      timeToRemediate: '2-3 weeks'
    },
    {
      id: 'scenario-2',
      name: 'Data Breach via SQL Injection',
      probability: 0.25,
      financialImpact: 4200000,
      reputationalImpact: 'high',
      attackVector: 'SQLi in customer portal login',
      affectedAssets: ['Customer Database', 'Payment Records'],
      mitigationCost: 45000,
      timeToRemediate: '1 week'
    },
    {
      id: 'scenario-3',
      name: 'Supply Chain Compromise',
      probability: 0.15,
      financialImpact: 12000000,
      reputationalImpact: 'critical',
      attackVector: 'Compromised npm dependency',
      affectedAssets: ['All Production Applications', 'CI/CD Pipeline'],
      mitigationCost: 280000,
      timeToRemediate: '4-6 weeks'
    },
    {
      id: 'scenario-4',
      name: 'Insider Threat - Data Exfiltration',
      probability: 0.20,
      financialImpact: 2800000,
      reputationalImpact: 'medium',
      attackVector: 'Privileged user data theft',
      affectedAssets: ['Intellectual Property', 'Customer Lists'],
      mitigationCost: 95000,
      timeToRemediate: '2-3 weeks'
    },
    {
      id: 'scenario-5',
      name: 'Cloud Misconfiguration Exposure',
      probability: 0.40,
      financialImpact: 1500000,
      reputationalImpact: 'medium',
      attackVector: 'Public S3 bucket with sensitive data',
      affectedAssets: ['Cloud Storage', 'Backup Data'],
      mitigationCost: 25000,
      timeToRemediate: '1-2 days'
    }
  ];

  const securityInvestments: SecurityInvestment[] = [
    { category: 'Vulnerability Management', currentSpend: 120000, recommendedSpend: 180000, riskReductionPotential: 35 },
    { category: 'Security Training', currentSpend: 45000, recommendedSpend: 80000, riskReductionPotential: 25 },
    { category: 'Incident Response', currentSpend: 60000, recommendedSpend: 150000, riskReductionPotential: 40 },
    { category: 'Access Management', currentSpend: 95000, recommendedSpend: 120000, riskReductionPotential: 20 },
    { category: 'Monitoring & Detection', currentSpend: 180000, recommendedSpend: 250000, riskReductionPotential: 45 },
  ];

  // Calculate FAIR model
  const fairAnalysis: FAIRAnalysis = {
    lef: { min: 0.1, likely: 0.3, max: 0.6 },
    lm: { min: 1000000, likely: 4200000, max: 12000000 },
    ale: 4200000 * 0.3,
    confidence: 0.75
  };

  // Formatters
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const getPostureColor = (posture: string) => {
    switch (posture) {
      case 'excellent': return 'text-green-400 bg-green-500/10 border-green-500';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500';
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 px-6 py-3 bg-green-500/20 border border-green-500 rounded-xl text-green-400 shadow-lg animate-pulse">
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">📊 Executive Security Dashboard</h1>
          <p className="text-gray-400">Board-level risk quantification and reporting</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['30d', '90d', '1y'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium flex items-center gap-2"
          >
            📄 Generate Board Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Risk Exposure */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Current Risk Exposure</span>
            <span className="text-red-400 text-xs">▲ High Priority</span>
          </div>
          <div className="text-4xl font-bold text-red-400 mb-2">
            {formatCurrency(riskMetrics.totalExposure)}
          </div>
          <div className="text-gray-500 text-sm">Annualized potential loss</div>
          <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-green-500 via-yellow-500 to-red-500"
              style={{ width: '65%' }}
            />
          </div>
        </div>

        {/* Maximum Loss Scenario */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Worst-Case Scenario</span>
            <span className="text-gray-500 text-xs">95th percentile</span>
          </div>
          <div className="text-4xl font-bold text-orange-400 mb-2">
            {formatCurrency(riskMetrics.potentialLoss)}
          </div>
          <div className="text-gray-500 text-sm">Maximum potential impact</div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-orange-400">⚠️</span>
            <span className="text-gray-400">Requires board attention</span>
          </div>
        </div>

        {/* Risk Reduction */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Risk Reduction (90 days)</span>
            <span className="text-green-400 text-xs">▼ Improving</span>
          </div>
          <div className="text-4xl font-bold text-green-400 mb-2">
            {riskMetrics.riskReduction}%
          </div>
          <div className="text-gray-500 text-sm">Reduction from baseline</div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-green-400">↓</span>
            <span className="text-gray-400">{formatCurrency(4300000)} saved vs Q3</span>
          </div>
        </div>

        {/* Security Posture */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Security Posture</span>
            <span className="text-cyan-400 text-xs">Essential Eight</span>
          </div>
          <div className={`text-4xl font-bold mb-2 capitalize ${getPostureColor(riskMetrics.securityPosture).split(' ')[0]}`}>
            {riskMetrics.securityPosture}
          </div>
          <div className="text-gray-500 text-sm">Overall risk rating</div>
          <div className="mt-4">
            <div className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${getPostureColor(riskMetrics.securityPosture)}`}>
              ML2 Compliance
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Risk Trend Chart */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">📈 Risk Exposure Trend</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {riskTrends.map((trend, _index) => {
              const maxExposure = Math.max(...riskTrends.map(t => t.exposure));
              const height = (trend.exposure / maxExposure) * 100;
              return (
                <div key={trend.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-400">{formatCurrency(trend.exposure)}</div>
                  <div 
                    className="w-full bg-linear-to-t from-cyan-500/50 to-cyan-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-gray-500">{trend.date.split('-')[1]}/{trend.date.split('-')[0].slice(2)}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                <span className="text-gray-400">Risk Exposure</span>
              </div>
            </div>
            <div className="text-green-400">
              ↓ 50.6% reduction over 6 months
            </div>
          </div>
        </div>

        {/* Security Score */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">🎯 Security Score</h2>
          <div className="flex flex-col items-center justify-center h-48">
            <div className="relative w-40 h-40">
              {/* Circular progress */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="fill-none stroke-gray-800"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="fill-none stroke-cyan-500"
                  strokeWidth="12"
                  strokeDasharray={`${(riskMetrics.complianceScore / 100) * 440} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold">{riskMetrics.complianceScore}</div>
                  <div className="text-gray-400 text-sm">out of 100</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Industry Average</span>
              <span className="text-yellow-400">58</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Top Performers</span>
              <span className="text-green-400">89</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breach Scenarios & ROI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Breach Scenarios */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">⚠️ Top Risk Scenarios</h2>
          <div className="space-y-3">
            {breachScenarios.slice(0, 4).map(scenario => (
              <div
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario)}
                className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors border border-transparent hover:border-cyan-500/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{scenario.name}</h3>
                  <span className={`text-xs font-medium ${getImpactColor(scenario.reputationalImpact)}`}>
                    {scenario.reputationalImpact.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">
                      Impact: <span className="text-red-400 font-medium">{formatCurrency(scenario.financialImpact)}</span>
                    </span>
                    <span className="text-gray-400">
                      Prob: <span className="text-yellow-400 font-medium">{(scenario.probability * 100).toFixed(0)}%</span>
                    </span>
                  </div>
                  <span className="text-gray-500">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Investment ROI */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">💰 Security Investment ROI</h2>
          <div className="space-y-4">
            {securityInvestments.map(investment => {
              return (
                <div key={investment.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{investment.category}</span>
                    <span className="text-xs text-green-400">
                      +{investment.riskReductionPotential}% risk reduction
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${(investment.currentSpend / investment.recommendedSpend) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 w-24 text-right">
                      {formatCurrency(investment.currentSpend)} / {formatCurrency(investment.recommendedSpend)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-400 font-medium">Recommended Investment</p>
                <p className="text-gray-400 text-sm">To achieve optimal risk reduction</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-cyan-400">
                  {formatCurrency(securityInvestments.reduce((acc, i) => acc + (i.recommendedSpend - i.currentSpend), 0))}
                </p>
                <p className="text-xs text-gray-400">additional budget needed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Benchmarking */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">📊 Industry Benchmarking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benchmarks.map(benchmark => (
            <div key={benchmark.category} className="p-4 bg-gray-800/50 rounded-lg">
              <h3 className="font-medium text-sm mb-3">{benchmark.category}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyan-400">Your Score</span>
                  <span className="font-bold text-cyan-400">{benchmark.yourScore}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                  {/* Industry average marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10"
                    style={{ left: `${benchmark.industryAvg}%` }}
                  />
                  {/* Top performers marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-green-500 z-10"
                    style={{ left: `${benchmark.topPerformers}%` }}
                  />
                  {/* Your score */}
                  <div 
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${benchmark.yourScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Industry Avg: {benchmark.industryAvg}</span>
                  <span>Top 10%: {benchmark.topPerformers}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAIR Risk Model */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">🎲 FAIR Risk Analysis</h2>
        <p className="text-gray-400 text-sm mb-4">Factor Analysis of Information Risk - Quantitative model</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Loss Event Frequency</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-yellow-400">{fairAnalysis.lef.likely}</span>
              <span className="text-gray-500">events/year</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Range: {fairAnalysis.lef.min} - {fairAnalysis.lef.max}
            </div>
          </div>
          
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Loss Magnitude</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-red-400">{formatCurrency(fairAnalysis.lm.likely)}</span>
              <span className="text-gray-500">per event</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Range: {formatCurrency(fairAnalysis.lm.min)} - {formatCurrency(fairAnalysis.lm.max)}
            </div>
          </div>
          
          <div className="p-4 bg-gray-800/50 rounded-lg border border-red-500/30">
            <h3 className="text-sm text-gray-400 mb-2">Annualized Loss Expectancy</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-red-400">{formatCurrency(fairAnalysis.ale)}</span>
              <span className="text-gray-500">/year</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Confidence: {(fairAnalysis.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Detail Modal */}
      {selectedScenario && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">{selectedScenario.name}</h2>
                <span className={`text-sm font-medium ${getImpactColor(selectedScenario.reputationalImpact)}`}>
                  {selectedScenario.reputationalImpact.toUpperCase()} RISK
                </span>
              </div>
              <button onClick={() => setSelectedScenario(null)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Financial Impact</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(selectedScenario.financialImpact)}</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Probability</p>
                  <p className="text-2xl font-bold text-yellow-400">{(selectedScenario.probability * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Attack Vector</p>
                <p className="text-gray-300">{selectedScenario.attackVector}</p>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Affected Assets</p>
                <div className="flex flex-wrap gap-2">
                  {selectedScenario.affectedAssets.map(asset => (
                    <span key={asset} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                      {asset}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Mitigation Cost</p>
                  <p className="text-xl font-bold text-green-400">{formatCurrency(selectedScenario.mitigationCost)}</p>
                </div>
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Time to Remediate</p>
                  <p className="text-xl font-bold text-cyan-400">{selectedScenario.timeToRemediate}</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400 font-medium mb-2">💡 ROI Analysis</p>
                <p className="text-gray-300">
                  Investing {formatCurrency(selectedScenario.mitigationCost)} to mitigate this risk would protect against 
                  a potential {formatCurrency(selectedScenario.financialImpact)} loss — 
                  a <span className="text-green-400 font-bold">
                    {((selectedScenario.financialImpact / selectedScenario.mitigationCost) * 100).toFixed(0)}% ROI
                  </span>.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedScenario(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showNotification(`✅ Remediation task created for: ${selectedScenario.name}. Assigned to security team.`);
                  setSelectedScenario(null);
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium"
              >
                Create Remediation Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">📄 Board Security Report</h2>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="text-center mb-8 pb-6 border-b border-gray-700">
                <h1 className="text-3xl font-bold mb-2">Security Risk Report</h1>
                <p className="text-gray-400">Q1 2026 Board Presentation</p>
                <p className="text-gray-500 text-sm">Generated: {new Date().toLocaleDateString('en-AU')}</p>
              </div>

              <h2 className="text-xl font-bold mt-6 mb-4">Executive Summary</h2>
              <p className="text-gray-300">
                Our current annualized risk exposure stands at <strong className="text-red-400">{formatCurrency(riskMetrics.totalExposure)}</strong>, 
                representing a <strong className="text-green-400">{riskMetrics.riskReduction}% reduction</strong> from the previous quarter. 
                The organization&apos;s security posture is rated as <strong className="text-yellow-400">{riskMetrics.securityPosture}</strong>, 
                with a compliance score of <strong>{riskMetrics.complianceScore}/100</strong>.
              </p>

              <h2 className="text-xl font-bold mt-6 mb-4">Key Metrics</h2>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 text-gray-400">Current Risk Exposure</td>
                    <td className="py-2 text-right font-bold text-red-400">{formatCurrency(riskMetrics.totalExposure)}</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 text-gray-400">Worst-Case Scenario</td>
                    <td className="py-2 text-right font-bold text-orange-400">{formatCurrency(riskMetrics.potentialLoss)}</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 text-gray-400">Risk Reduction (90 days)</td>
                    <td className="py-2 text-right font-bold text-green-400">{riskMetrics.riskReduction}%</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 text-gray-400">Security Score</td>
                    <td className="py-2 text-right font-bold text-cyan-400">{riskMetrics.complianceScore}/100</td>
                  </tr>
                </tbody>
              </table>

              <h2 className="text-xl font-bold mt-6 mb-4">Recommendations</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Increase security budget by {formatCurrency(280000)} to address critical gaps</li>
                <li>Prioritize patching of internet-facing systems within 48 hours</li>
                <li>Deploy phishing-resistant MFA across all privileged accounts</li>
                <li>Complete Essential Eight Maturity Level 2 assessment</li>
              </ol>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showNotification('📊 Generating PowerPoint export...');
                  const content = `Security Risk Report - Q1 2026\nRisk Exposure: ${formatCurrency(riskMetrics.totalExposure)}\nSecurity Score: ${riskMetrics.complianceScore}/100\nRisk Reduction: ${riskMetrics.riskReduction}%`;
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'Security_Board_Report_Q1_2026.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                📊 Export PowerPoint
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium"
              >
                📄 Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveDashboard;
