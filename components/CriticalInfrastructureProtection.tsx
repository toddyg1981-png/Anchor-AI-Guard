import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

interface Sector {
  id: string;
  name: string;
  icon: string;
  status: 'secure' | 'elevated' | 'critical';
  assets: number;
  activeAlerts: number;
  complianceScore: number;
  frameworks: string[];
}

interface InfrastructureAsset {
  id: string;
  name: string;
  sector: string;
  type: string;
  location: string;
  status: 'online' | 'degraded' | 'offline';
  lastScan: string;
  vulnerabilities: number;
  criticalVulns: number;
}

interface ComplianceFramework {
  name: string;
  score: number;
  status: 'compliant' | 'partial' | 'non-compliant';
  lastAudit: string;
  nextAudit: string;
}

const CriticalInfrastructureProtection: React.FC = () => {
  const [sectors] = useState<Sector[]>([
    {
      id: 'energy',
      name: 'Energy',
      icon: '⚡',
      status: 'secure',
      assets: 847,
      activeAlerts: 3,
      complianceScore: 94,
      frameworks: ['NERC CIP', 'NIST CSF'],
    },
    {
      id: 'water',
      name: 'Water & Wastewater',
      icon: '💧',
      status: 'elevated',
      assets: 234,
      activeAlerts: 8,
      complianceScore: 87,
      frameworks: ['AWWA', 'EPA Guidelines'],
    },
    {
      id: 'transportation',
      name: 'Transportation',
      icon: '🚂',
      status: 'secure',
      assets: 521,
      activeAlerts: 2,
      complianceScore: 91,
      frameworks: ['TSA Directives', 'DOT'],
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: '🏥',
      status: 'secure',
      assets: 1247,
      activeAlerts: 12,
      complianceScore: 89,
      frameworks: ['HIPAA', 'HITECH'],
    },
    {
      id: 'financial',
      name: 'Financial Services',
      icon: '🏦',
      status: 'secure',
      assets: 892,
      activeAlerts: 5,
      complianceScore: 96,
      frameworks: ['PCI-DSS', 'SOX', 'GLBA'],
    },
    {
      id: 'communications',
      name: 'Communications',
      icon: '📡',
      status: 'elevated',
      assets: 1521,
      activeAlerts: 15,
      complianceScore: 85,
      frameworks: ['FCC', 'CISA'],
    },
  ]);

  const [assets] = useState<InfrastructureAsset[]>([
    {
      id: 'asset-1',
      name: 'Primary Substation Alpha',
      sector: 'Energy',
      type: 'SCADA',
      location: 'Region 1',
      status: 'online',
      lastScan: '5 minutes ago',
      vulnerabilities: 3,
      criticalVulns: 0,
    },
    {
      id: 'asset-2',
      name: 'Water Treatment Plant 7',
      sector: 'Water',
      type: 'PLC Network',
      location: 'Region 3',
      status: 'degraded',
      lastScan: '2 hours ago',
      vulnerabilities: 8,
      criticalVulns: 2,
    },
    {
      id: 'asset-3',
      name: 'Rail Control Center',
      sector: 'Transportation',
      type: 'Control System',
      location: 'Central',
      status: 'online',
      lastScan: '15 minutes ago',
      vulnerabilities: 1,
      criticalVulns: 0,
    },
  ]);

  const [complianceFrameworks] = useState<ComplianceFramework[]>([
    { name: 'NERC CIP', score: 94, status: 'compliant', lastAudit: '2026-01-15', nextAudit: '2026-07-15' },
    { name: 'NIST CSF', score: 91, status: 'compliant', lastAudit: '2026-01-20', nextAudit: '2027-01-20' },
    { name: 'IEC 62443', score: 87, status: 'partial', lastAudit: '2025-12-10', nextAudit: '2026-06-10' },
    { name: 'TSA Pipeline', score: 95, status: 'compliant', lastAudit: '2026-01-05', nextAudit: '2026-04-05' },
  ]);

  const [threatLevel, _setThreatLevel] = useState<'low' | 'guarded' | 'elevated' | 'high' | 'severe'>('elevated');
  const [liveMetric, setLiveMetric] = useState(0);

  const [backendLoading, setBackendLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    (async () => {
      setBackendLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('critical-infrastructure');
        if (res)       } catch (e) { console.error(e); } finally { setBackendLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await backendApi.modules.analyze('critical-infrastructure', 'Analyze critical infrastructure protection for SCADA/ICS vulnerabilities and recommend hardening measures');
      if ((res as any)?.analysis) setAnalysisResult((res as any).analysis);
    } catch (e) { console.error(e); } finally { setAnalyzing(false); }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetric((prev) => prev + Math.floor(Math.random() * 100) + 50);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'guarded': return 'bg-blue-500';
      case 'elevated': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'severe': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'text-green-400';
      case 'elevated': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Threat Level */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🏗️ Critical Infrastructure Protection</h1>
          <p className="text-gray-400 mt-1">16 Critical Sectors — Real-time monitoring and compliance</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAIAnalysis}
            disabled={analyzing || backendLoading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {analyzing ? '⏳ Analyzing...' : '🤖 AI Analysis'}
          </button>
          <div className="text-right">
            <div className="text-xs text-gray-500">National Threat Level</div>
            <div className={`px-4 py-2 rounded-lg text-white font-bold ${getThreatLevelColor(threatLevel)}`}>
              {threatLevel.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Sector Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {sectors.map((sector) => (
          <div
            key={sector.id}
            className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 hover:border-cyan-500/50 transition-colors cursor-pointer"
          >
            <div className="text-3xl mb-2">{sector.icon}</div>
            <h3 className="text-white font-semibold text-sm mb-1">{sector.name}</h3>
            <div className={`text-xs font-medium mb-2 ${getStatusColor(sector.status)}`}>
              {sector.status.toUpperCase()}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Assets</span>
                <span className="text-white">{sector.assets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Alerts</span>
                <span className={sector.activeAlerts > 5 ? 'text-yellow-400' : 'text-green-400'}>
                  {sector.activeAlerts}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Compliance</span>
                <span className="text-cyan-400">{sector.complianceScore}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Real-Time Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Assets Monitored', value: '5,262', color: 'cyan', live: true },
          { label: 'Events/Hour', value: (847291 + liveMetric).toLocaleString(), color: 'purple', live: true },
          { label: 'Active Threats', value: '23', color: 'orange', live: false },
          { label: 'Avg Response Time', value: '4.2 min', color: 'green', live: false },
        ].map((metric, idx) => (
          <div key={idx} className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5 text-center">
            <div className="text-sm text-gray-400 mb-1">{metric.label}</div>
            <div className={`text-3xl font-bold text-${metric.color}-400`}>
              {metric.live && <span className="animate-pulse">●</span>} {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Asset Monitoring */}
      <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span> Critical Asset Monitoring
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700">
                <th className="text-left py-2">Asset</th>
                <th className="text-left py-2">Sector</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Location</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Vulns</th>
                <th className="text-left py-2">Last Scan</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 text-white font-medium">{asset.name}</td>
                  <td className="py-3 text-gray-400">{asset.sector}</td>
                  <td className="py-3 text-gray-400">{asset.type}</td>
                  <td className="py-3 text-gray-400">{asset.location}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      asset.status === 'online' ? 'bg-green-500/20 text-green-400' :
                      asset.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-gray-400">{asset.vulnerabilities}</span>
                    {asset.criticalVulns > 0 && (
                      <span className="text-red-400 ml-1">({asset.criticalVulns} crit)</span>
                    )}
                  </td>
                  <td className="py-3 text-gray-500">{asset.lastScan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Frameworks */}
      <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span> Regulatory Compliance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {complianceFrameworks.map((framework, idx) => (
            <div key={idx} className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">{framework.name}</h3>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  framework.status === 'compliant' ? 'bg-green-500/20 text-green-400' :
                  framework.status === 'partial' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {framework.status}
                </span>
              </div>
              <div className="text-3xl font-bold text-cyan-400 mb-2">{framework.score}%</div>
              <div className="text-xs text-gray-500">
                <div>Last Audit: {framework.lastAudit}</div>
                <div>Next Audit: {framework.nextAudit}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-linear-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">🛡️ Critical Infrastructure Value</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-400">Average Breach Cost</div>
            <div className="text-2xl font-bold text-red-400">$9.4M</div>
            <div className="text-xs text-gray-500">Critical infrastructure sector</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Downtime Cost/Hour</div>
            <div className="text-2xl font-bold text-orange-400">$500K</div>
            <div className="text-xs text-gray-500">Average across sectors</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Compliance Penalties</div>
            <div className="text-2xl font-bold text-yellow-400">$1M/day</div>
            <div className="text-xs text-gray-500">NERC CIP violations</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Anchor ROI</div>
            <div className="text-2xl font-bold text-green-400">47x</div>
            <div className="text-xs text-gray-500">Risk-adjusted return</div>
          </div>
        </div>
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

export default CriticalInfrastructureProtection;
