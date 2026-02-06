import React, { useState } from 'react';

// ============================================================================
// ATTACK SURFACE MANAGEMENT (ASM)
// ============================================================================
// See your organization from the attacker's perspective
// Discover exposed assets, shadow IT, misconfigurations before hackers do
// ============================================================================

interface ExposedAsset {
  id: string;
  type: 'domain' | 'subdomain' | 'ip' | 'port' | 'api' | 'cloud' | 's3_bucket' | 'github_repo';
  identifier: string;
  discovered: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'new' | 'acknowledged' | 'investigating' | 'remediated' | 'accepted_risk';
  findings: string[];
  exposureType: 'intentional' | 'shadow_it' | 'misconfiguration' | 'leaked';
  owner?: string;
}

interface DomainIntel {
  domain: string;
  registrar: string;
  expiryDate: string;
  dnsRecords: number;
  subdomains: number;
  sslStatus: 'valid' | 'expiring' | 'expired' | 'invalid';
  sslExpiry?: string;
}

interface ExternalScan {
  id: string;
  timestamp: string;
  scope: string;
  assetsDiscovered: number;
  newAssets: number;
  criticalFindings: number;
  status: 'completed' | 'running' | 'scheduled';
}

export const AttackSurfaceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'domains' | 'scans'>('overview');
  const [isScanning, setIsScanning] = useState(false);
  const [riskFilter, setRiskFilter] = useState<'all' | 'critical'>('all');

  const exposedAssets: ExposedAsset[] = [
    { id: 'ea-1', type: 'subdomain', identifier: 'dev.anchor.security', discovered: '2026-02-04', riskLevel: 'critical', status: 'new', findings: ['Exposed admin panel', 'Default credentials', 'Debug mode enabled'], exposureType: 'misconfiguration' },
    { id: 'ea-2', type: 's3_bucket', identifier: 'anchor-backups-2024', discovered: '2026-02-03', riskLevel: 'critical', status: 'investigating', findings: ['Public read access', 'Contains sensitive data'], exposureType: 'misconfiguration' },
    { id: 'ea-3', type: 'api', identifier: 'api.anchor.security/v1/internal', discovered: '2026-02-02', riskLevel: 'high', status: 'acknowledged', findings: ['No authentication required', 'Exposes user data'], exposureType: 'shadow_it' },
    { id: 'ea-4', type: 'github_repo', identifier: 'anchor-security/legacy-scripts', discovered: '2026-02-01', riskLevel: 'high', status: 'remediated', findings: ['Exposed API keys', 'Database credentials in code'], exposureType: 'leaked' },
    { id: 'ea-5', type: 'port', identifier: '203.45.67.89:3389', discovered: '2026-01-30', riskLevel: 'high', status: 'remediated', findings: ['RDP exposed to internet', 'Brute force attempts detected'], exposureType: 'misconfiguration' },
    { id: 'ea-6', type: 'subdomain', identifier: 'staging.anchor.security', discovered: '2026-01-28', riskLevel: 'medium', status: 'accepted_risk', findings: ['Test environment exposed', 'Outdated software'], exposureType: 'intentional', owner: 'Engineering' },
    { id: 'ea-7', type: 'cloud', identifier: 'AWS Lambda: process-data-prod', discovered: '2026-02-04', riskLevel: 'medium', status: 'new', findings: ['Overly permissive IAM role'], exposureType: 'misconfiguration' },
    { id: 'ea-8', type: 'domain', identifier: 'anchr-security.com (typosquat)', discovered: '2026-02-04', riskLevel: 'high', status: 'new', findings: ['Possible phishing domain', 'Registered by unknown party'], exposureType: 'leaked' }
  ];

  const domainIntel: DomainIntel[] = [
    { domain: 'anchor.security', registrar: 'Cloudflare', expiryDate: '2027-01-15', dnsRecords: 45, subdomains: 12, sslStatus: 'valid', sslExpiry: '2026-08-15' },
    { domain: 'anchor.com.au', registrar: 'VentraIP', expiryDate: '2026-06-30', dnsRecords: 8, subdomains: 3, sslStatus: 'valid', sslExpiry: '2026-05-20' },
    { domain: 'getanchor.io', registrar: 'Namecheap', expiryDate: '2026-03-15', dnsRecords: 5, subdomains: 1, sslStatus: 'expiring', sslExpiry: '2026-02-28' }
  ];

  const scans: ExternalScan[] = [
    { id: 'scan-1', timestamp: '2026-02-04T06:00:00Z', scope: 'Full External Scan', assetsDiscovered: 156, newAssets: 3, criticalFindings: 2, status: 'completed' },
    { id: 'scan-2', timestamp: '2026-02-03T06:00:00Z', scope: 'Full External Scan', assetsDiscovered: 153, newAssets: 1, criticalFindings: 0, status: 'completed' },
    { id: 'scan-3', timestamp: '2026-02-02T06:00:00Z', scope: 'Full External Scan', assetsDiscovered: 152, newAssets: 5, criticalFindings: 1, status: 'completed' }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'domain': case 'subdomain': return '🌐';
      case 'ip': case 'port': return '🔌';
      case 'api': return '🔗';
      case 'cloud': return '☁️';
      case 's3_bucket': return '🪣';
      case 'github_repo': return '📦';
      default: return '📍';
    }
  };

  const criticalCount = exposedAssets.filter(a => a.riskLevel === 'critical' && a.status !== 'remediated').length;
  const highCount = exposedAssets.filter(a => a.riskLevel === 'high' && a.status !== 'remediated').length;

  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🎯 Attack Surface Management</h1>
          <p className="text-gray-400">See your organization from the attacker&apos;s perspective</p>
        </div>
        <button
          onClick={runScan}
          disabled={isScanning}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            isScanning
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500 animate-pulse'
              : 'bg-cyan-500 hover:bg-cyan-600 text-white'
          }`}
        >
          {isScanning ? '🔍 Scanning...' : '🔍 Run Full Scan'}
        </button>
      </div>

      {/* Alert Banner */}
      {criticalCount > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <div className="font-bold text-red-400">{criticalCount} Critical Exposures Found</div>
              <div className="text-sm text-gray-400">Immediate action required</div>
            </div>
          </div>
          <button onClick={() => { setRiskFilter('critical'); setActiveTab('assets'); }} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium">
            View Critical
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-cyan-400">{exposedAssets.length}</div>
          <div className="text-sm text-gray-400">Total Assets</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{criticalCount}</div>
          <div className="text-sm text-gray-400">Critical</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-400">{highCount}</div>
          <div className="text-sm text-gray-400">High Risk</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">{domainIntel.length}</div>
          <div className="text-sm text-gray-400">Domains</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{exposedAssets.filter(a => a.exposureType === 'shadow_it').length}</div>
          <div className="text-sm text-gray-400">Shadow IT</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{exposedAssets.filter(a => a.status === 'remediated').length}</div>
          <div className="text-sm text-gray-400">Remediated</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'assets', label: '🎯 Exposed Assets' },
          { id: 'domains', label: '🌐 Domains' },
          { id: 'scans', label: '🔍 Scan History' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">🔥 Recent Critical Findings</h3>
            <div className="space-y-3">
              {exposedAssets.filter(a => a.riskLevel === 'critical' || a.riskLevel === 'high').slice(0, 5).map(asset => (
                <div key={asset.id} className={`p-3 rounded-lg border ${getRiskColor(asset.riskLevel)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{getTypeIcon(asset.type)}</span>
                    <span className="font-medium">{asset.identifier}</span>
                  </div>
                  <div className="text-sm text-gray-400">{asset.findings[0]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">📈 Asset Discovery Trend</h3>
            <div className="h-48 flex items-end justify-around gap-2">
              {scans.slice().reverse().map((scan, idx) => (
                <div key={scan.id} className="flex flex-col items-center">
                  <div 
                    className="w-16 bg-linear-to-t from-cyan-500 to-purple-500 rounded-t"
                    style={{ height: `${scan.assetsDiscovered}px` }}
                  />
                  <div className="text-xs text-gray-500 mt-2">Day {idx + 1}</div>
                  <div className="text-xs text-gray-400">{scan.assetsDiscovered}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          {riskFilter === 'critical' && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-red-400 font-semibold">Showing critical assets only</span>
              <button onClick={() => setRiskFilter('all')} className="text-sm text-cyan-400 hover:text-cyan-300 underline">Show all</button>
            </div>
          )}
          {exposedAssets.filter(a => riskFilter === 'all' || a.riskLevel === 'critical').map(asset => (
            <div key={asset.id} className={`p-6 rounded-xl border ${getRiskColor(asset.riskLevel)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(asset.type)}</span>
                  <div>
                    <div className="font-semibold text-lg">{asset.identifier}</div>
                    <div className="text-sm text-gray-500">
                      {asset.type} • Discovered: {asset.discovered} • {asset.exposureType.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${getRiskColor(asset.riskLevel)}`}>
                    {asset.riskLevel}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    asset.status === 'remediated' ? 'bg-green-500/20 text-green-400' :
                    asset.status === 'new' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {asset.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {asset.findings.map((finding, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-800 rounded text-sm">
                    ⚠️ {finding}
                  </span>
                ))}
              </div>
              {asset.status !== 'remediated' && (
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500 rounded text-sm text-cyan-400">
                    Investigate
                  </button>
                  <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500 rounded text-sm text-green-400">
                    Mark Remediated
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Domains Tab */}
      {activeTab === 'domains' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="p-4">Domain</th>
                <th className="p-4">Registrar</th>
                <th className="p-4">Expiry</th>
                <th className="p-4">DNS Records</th>
                <th className="p-4">Subdomains</th>
                <th className="p-4">SSL Status</th>
              </tr>
            </thead>
            <tbody>
              {domainIntel.map((domain, idx) => (
                <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-4 font-medium">{domain.domain}</td>
                  <td className="p-4 text-gray-400">{domain.registrar}</td>
                  <td className="p-4">{domain.expiryDate}</td>
                  <td className="p-4">{domain.dnsRecords}</td>
                  <td className="p-4">{domain.subdomains}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      domain.sslStatus === 'valid' ? 'bg-green-500/20 text-green-400' :
                      domain.sslStatus === 'expiring' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {domain.sslStatus} {domain.sslExpiry && `(${domain.sslExpiry})`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Scans Tab */}
      {activeTab === 'scans' && (
        <div className="space-y-4">
          {scans.map(scan => (
            <div key={scan.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold">{scan.scope}</div>
                  <div className="text-sm text-gray-500">{new Date(scan.timestamp).toLocaleString()}</div>
                </div>
                <span className={`px-3 py-1 rounded ${
                  scan.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  scan.status === 'running' ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {scan.status}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xl font-bold text-cyan-400">{scan.assetsDiscovered}</div>
                  <div className="text-xs text-gray-500">Assets Found</div>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xl font-bold text-purple-400">{scan.newAssets}</div>
                  <div className="text-xs text-gray-500">New Assets</div>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xl font-bold text-red-400">{scan.criticalFindings}</div>
                  <div className="text-xs text-gray-500">Critical</div>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xl font-bold text-green-400">✓</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttackSurfaceManagement;
