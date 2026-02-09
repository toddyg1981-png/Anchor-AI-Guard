import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

// ============================================================================
// CI/CD SECURITY PIPELINE - SECURE DEVOPS GATES & POLICY ENGINE
// ============================================================================

interface Pipeline {
  id: string;
  name: string;
  repository: string;
  branch: string;
  platform: 'github' | 'gitlab' | 'jenkins' | 'azure' | 'bitbucket';
  status: 'passed' | 'failed' | 'running' | 'blocked';
  securityScore: number;
  lastRun: string;
  duration: string;
  stages: PipelineStage[];
}

interface PipelineStage {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending' | 'skipped' | 'blocked';
  type: 'build' | 'test' | 'security' | 'deploy' | 'approval';
  duration: string;
  findings: number;
  criticalFindings: number;
}

interface SecurityGate {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  enforcement: 'block' | 'warn' | 'info';
  threshold: number;
  currentValue?: number;
  passed?: boolean;
}

interface SecretScanResult {
  id: string;
  file: string;
  line: number;
  secretType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  snippet: string;
  recommendation: string;
}

interface PolicyViolation {
  id: string;
  policy: string;
  resource: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  remediation: string;
}

export const CICDSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipelines' | 'gates' | 'secrets' | 'policies' | 'iac'>('pipelines');
  const [_selectedPipeline, _setSelectedPipeline] = useState<string | null>(null);
  const [_loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [scanStatus, setScanStatus] = useState<string>('idle');
  const [actionStatus, setActionStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('cicd-security');
        // eslint-disable-line no-console
      } catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await backendApi.modules.analyze('cicd-security', 'Analyze CI/CD pipeline security for supply chain risks, secret exposure, and policy violations') as Record<string, unknown>;
      if (res?.analysis) setAnalysisResult(res.analysis as string);
    } catch (e) { console.error(e); } finally { setAnalyzing(false); }
  };

  // Mock pipelines
  const pipelines: Pipeline[] = [
    {
      id: 'pipe-1',
      name: 'Production Deploy',
      repository: 'company/main-app',
      branch: 'main',
      platform: 'github',
      status: 'blocked',
      securityScore: 45,
      lastRun: '2026-02-04T11:30:00Z',
      duration: '8m 32s',
      stages: [
        { id: 's1', name: 'Build', status: 'passed', type: 'build', duration: '2m 15s', findings: 0, criticalFindings: 0 },
        { id: 's2', name: 'Unit Tests', status: 'passed', type: 'test', duration: '1m 45s', findings: 0, criticalFindings: 0 },
        { id: 's3', name: 'SAST Scan', status: 'failed', type: 'security', duration: '3m 20s', findings: 12, criticalFindings: 3 },
        { id: 's4', name: 'Secret Detection', status: 'failed', type: 'security', duration: '45s', findings: 2, criticalFindings: 2 },
        { id: 's5', name: 'SCA Scan', status: 'passed', type: 'security', duration: '1m 10s', findings: 5, criticalFindings: 0 },
        { id: 's6', name: 'Deploy Staging', status: 'blocked', type: 'deploy', duration: '-', findings: 0, criticalFindings: 0 },
        { id: 's7', name: 'DAST Scan', status: 'pending', type: 'security', duration: '-', findings: 0, criticalFindings: 0 },
        { id: 's8', name: 'Deploy Production', status: 'pending', type: 'deploy', duration: '-', findings: 0, criticalFindings: 0 }
      ]
    },
    {
      id: 'pipe-2',
      name: 'Feature Branch CI',
      repository: 'company/main-app',
      branch: 'feature/user-auth',
      platform: 'github',
      status: 'passed',
      securityScore: 92,
      lastRun: '2026-02-04T10:15:00Z',
      duration: '5m 12s',
      stages: [
        { id: 's1', name: 'Build', status: 'passed', type: 'build', duration: '1m 55s', findings: 0, criticalFindings: 0 },
        { id: 's2', name: 'Unit Tests', status: 'passed', type: 'test', duration: '1m 30s', findings: 0, criticalFindings: 0 },
        { id: 's3', name: 'SAST Scan', status: 'passed', type: 'security', duration: '2m 45s', findings: 2, criticalFindings: 0 },
        { id: 's4', name: 'Secret Detection', status: 'passed', type: 'security', duration: '40s', findings: 0, criticalFindings: 0 }
      ]
    },
    {
      id: 'pipe-3',
      name: 'Nightly Security Scan',
      repository: 'company/api-service',
      branch: 'develop',
      platform: 'gitlab',
      status: 'running',
      securityScore: 78,
      lastRun: '2026-02-04T02:00:00Z',
      duration: '15m+',
      stages: [
        { id: 's1', name: 'SAST Deep Scan', status: 'passed', type: 'security', duration: '8m 20s', findings: 7, criticalFindings: 1 },
        { id: 's2', name: 'SCA Full Audit', status: 'passed', type: 'security', duration: '4m 15s', findings: 23, criticalFindings: 2 },
        { id: 's3', name: 'Container Scan', status: 'running', type: 'security', duration: '3m+', findings: 0, criticalFindings: 0 },
        { id: 's4', name: 'IaC Scan', status: 'pending', type: 'security', duration: '-', findings: 0, criticalFindings: 0 }
      ]
    }
  ];

  // Security gates
  const securityGates: SecurityGate[] = [
    { id: 'gate-1', name: 'No Critical Vulnerabilities', description: 'Block deployment if critical vulnerabilities are found', enabled: true, enforcement: 'block', threshold: 0, currentValue: 3, passed: false },
    { id: 'gate-2', name: 'No Exposed Secrets', description: 'Block deployment if secrets are detected in code', enabled: true, enforcement: 'block', threshold: 0, currentValue: 2, passed: false },
    { id: 'gate-3', name: 'High Vulnerabilities Limit', description: 'Maximum 5 high severity vulnerabilities allowed', enabled: true, enforcement: 'block', threshold: 5, currentValue: 4, passed: true },
    { id: 'gate-4', name: 'Code Coverage', description: 'Minimum 80% code coverage required', enabled: true, enforcement: 'warn', threshold: 80, currentValue: 75, passed: false },
    { id: 'gate-5', name: 'License Compliance', description: 'Only approved licenses allowed', enabled: true, enforcement: 'block', threshold: 100, currentValue: 100, passed: true },
    { id: 'gate-6', name: 'Container Image Size', description: 'Maximum container image size of 500MB', enabled: false, enforcement: 'warn', threshold: 500, currentValue: 320, passed: true },
    { id: 'gate-7', name: 'Dependency Age', description: 'No dependencies older than 2 years', enabled: true, enforcement: 'info', threshold: 730, currentValue: 847, passed: false },
    { id: 'gate-8', name: 'SBOM Generation', description: 'SBOM must be generated for all builds', enabled: true, enforcement: 'block', threshold: 100, currentValue: 100, passed: true }
  ];

  // Secret scan results
  const secretResults: SecretScanResult[] = [
    { id: 'sec-1', file: 'config/database.js', line: 23, secretType: 'Database Password', severity: 'critical', snippet: 'const DB_PASS = "pr0d_p@ssw0rd_2024"', recommendation: 'Use environment variables or secret manager' },
    { id: 'sec-2', file: '.env.production', line: 5, secretType: 'AWS Access Key', severity: 'critical', snippet: 'AWS_ACCESS_KEY_ID=AKIA***************', recommendation: 'Remove from repository and rotate credentials immediately' },
    { id: 'sec-3', file: 'src/services/stripe.ts', line: 12, secretType: 'Stripe API Key', severity: 'high', snippet: 'const STRIPE_KEY = "sk_live_***"', recommendation: 'Move to secure configuration management' },
    { id: 'sec-4', file: 'tests/fixtures/auth.json', line: 8, secretType: 'JWT Secret', severity: 'medium', snippet: '"jwt_secret": "test_secret_123"', recommendation: 'Use different secrets for test and production' }
  ];

  // Policy violations
  const policyViolations: PolicyViolation[] = [
    { id: 'pol-1', policy: 'Container runs as root', resource: 'Dockerfile:15', severity: 'high', description: 'Container is configured to run as root user', remediation: 'Add USER directive to run as non-root user' },
    { id: 'pol-2', policy: 'No resource limits', resource: 'k8s/deployment.yaml:24', severity: 'medium', description: 'Pod has no CPU or memory limits defined', remediation: 'Add resources.limits section to pod spec' },
    { id: 'pol-3', policy: 'Privileged container', resource: 'docker-compose.yml:18', severity: 'critical', description: 'Container runs in privileged mode', remediation: 'Remove privileged: true setting' },
    { id: 'pol-4', policy: 'Latest tag used', resource: 'Dockerfile:1', severity: 'medium', description: 'Base image uses :latest tag', remediation: 'Pin to specific image version for reproducibility' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-400 bg-green-500/10 border-green-500';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500';
      case 'running': return 'text-blue-400 bg-blue-500/10 border-blue-500';
      case 'blocked': return 'text-orange-400 bg-orange-500/10 border-orange-500';
      case 'pending': return 'text-gray-400 bg-gray-500/10 border-gray-500';
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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'github': return '🐙';
      case 'gitlab': return '🦊';
      case 'jenkins': return '🤵';
      case 'azure': return '☁️';
      default: return '🔧';
    }
  };

  const blockedGates = securityGates.filter(g => g.enabled && g.enforcement === 'block' && !g.passed).length;
  const totalFindings = pipelines.reduce((sum, p) => sum + p.stages.reduce((s, st) => s + st.findings, 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🔄 CI/CD Security</h1>
          <p className="text-gray-400">Pipeline security gates, secret detection, and policy enforcement</p>
          <button onClick={handleAIAnalysis} disabled={analyzing} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm">{analyzing ? 'Analyzing...' : 'AI Analysis'}</button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('gates')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium">
            ⚙️ Configure Gates
          </button>
          <button onClick={() => {
            if (scanStatus !== 'idle') return;
            setScanStatus('scanning');
            setTimeout(() => {
              setScanStatus('complete');
              setTimeout(() => setScanStatus('idle'), 2000);
            }, 3000);
          }} className={`px-4 py-2 rounded-lg font-medium ${
            scanStatus === 'scanning' ? 'bg-yellow-500 hover:bg-yellow-600' :
            scanStatus === 'complete' ? 'bg-green-600' :
            'bg-green-500 hover:bg-green-600'
          }`} disabled={scanStatus !== 'idle'}>
            {scanStatus === 'scanning' ? '⏳ Scanning...' : scanStatus === 'complete' ? '✓ Complete' : '▶️ Run Security Scan'}
          </button>
        </div>
      </div>

      {/* Blocked Alert */}
      {blockedGates > 0 && (
        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/50 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚫</span>
            <div>
              <h3 className="text-orange-400 font-bold text-lg">Deployment Blocked</h3>
              <p className="text-gray-400">
                {blockedGates} security gate(s) failed. Resolve issues before deployment can proceed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-white">{pipelines.length}</div>
          <div className="text-gray-400 text-sm">Active Pipelines</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">{pipelines.filter(p => p.status === 'passed').length}</div>
          <div className="text-gray-400 text-sm">Passed</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-400">{pipelines.filter(p => p.status === 'failed' || p.status === 'blocked').length}</div>
          <div className="text-gray-400 text-sm">Blocked/Failed</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-orange-400">{blockedGates}</div>
          <div className="text-gray-400 text-sm">Failed Gates</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-400">{secretResults.length}</div>
          <div className="text-gray-400 text-sm">Secrets Found</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-400">{totalFindings}</div>
          <div className="text-gray-400 text-sm">Total Findings</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'pipelines', label: '🔄 Pipelines' },
          { id: 'gates', label: '🚧 Security Gates' },
          { id: 'secrets', label: '🔐 Secret Detection' },
          { id: 'policies', label: '📜 Policies' },
          { id: 'iac', label: '🏗️ IaC Security' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-green-500/20 text-green-400 border border-green-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pipelines Tab */}
      {activeTab === 'pipelines' && (
        <div className="space-y-6">
          {pipelines.map(pipeline => (
            <div key={pipeline.id} className={`rounded-xl border ${getStatusColor(pipeline.status)}`}>
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPlatformIcon(pipeline.platform)}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{pipeline.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-mono">{pipeline.repository}</span>
                        <span>•</span>
                        <span className="text-cyan-400">{pipeline.branch}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        pipeline.securityScore >= 80 ? 'text-green-400' :
                        pipeline.securityScore >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>{pipeline.securityScore}</div>
                      <div className="text-xs text-gray-500">Security Score</div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase border ${getStatusColor(pipeline.status)}`}>
                      {pipeline.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Pipeline Stages */}
              <div className="p-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {pipeline.stages.map((stage, idx) => (
                    <React.Fragment key={stage.id}>
                      <div className={`shrink-0 p-3 rounded-lg border min-w-[140px] ${getStatusColor(stage.status)}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium uppercase opacity-70">{stage.type}</span>
                          {stage.status === 'running' && (
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          )}
                        </div>
                        <div className="font-medium text-sm">{stage.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{stage.duration}</div>
                        {stage.findings > 0 && (
                          <div className="mt-2 flex gap-1">
                            {stage.criticalFindings > 0 && (
                              <span className="px-1.5 py-0.5 bg-red-500 text-white rounded text-xs font-bold">
                                {stage.criticalFindings}C
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                              {stage.findings} issues
                            </span>
                          </div>
                        )}
                      </div>
                      {idx < pipeline.stages.length - 1 && (
                        <div className="text-gray-600 shrink-0">→</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security Gates Tab */}
      {activeTab === 'gates' && (
        <div className="space-y-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🚧 Security Gate Configuration</h2>
            <div className="space-y-3">
              {securityGates.map(gate => (
                <div key={gate.id} className={`p-4 rounded-lg border ${
                  !gate.enabled ? 'bg-gray-800/30 border-gray-700 opacity-60' :
                  gate.passed ? 'bg-green-500/10 border-green-500/30' :
                  gate.enforcement === 'block' ? 'bg-red-500/10 border-red-500/50' :
                  'bg-yellow-500/10 border-yellow-500/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={gate.enabled} className="sr-only peer" readOnly />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{gate.name}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            gate.enforcement === 'block' ? 'bg-red-500 text-white' :
                            gate.enforcement === 'warn' ? 'bg-yellow-500 text-black' :
                            'bg-blue-500 text-white'
                          }`}>
                            {gate.enforcement.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{gate.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {gate.enabled && gate.currentValue !== undefined && (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${gate.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {gate.currentValue} / {gate.threshold}
                          </div>
                          <div className="text-xs text-gray-500">Current / Threshold</div>
                        </div>
                      )}
                      {gate.enabled && (
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          gate.passed ? 'bg-green-500/20 text-green-400 border border-green-500' :
                          'bg-red-500/20 text-red-400 border border-red-500'
                        }`}>
                          {gate.passed ? '✓ PASSED' : '✗ FAILED'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Secret Detection Tab */}
      {activeTab === 'secrets' && (
        <div className="space-y-4">
          {secretResults.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <h3 className="text-red-400 font-bold">Secrets Detected in Codebase!</h3>
                  <p className="text-gray-400 text-sm">
                    Found {secretResults.length} hardcoded secrets. These must be removed and rotated immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {secretResults.map(secret => (
            <div key={secret.id} className={`p-6 rounded-xl border ${getSeverityColor(secret.severity)}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl">🔐</span>
                    <h3 className="text-lg font-semibold">{secret.secretType}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getSeverityColor(secret.severity)}`}>
                      {secret.severity}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 font-mono">
                    {secret.file}:{secret.line}
                  </div>
                </div>
                <button className={`px-3 py-1 rounded text-sm ${
                  actionStatus[secret.id] === 'done' ? 'bg-green-500/20 border border-green-500 text-green-400' :
                  actionStatus[secret.id] === 'processing' ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-400' :
                  'bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-400'
                }`} disabled={!!actionStatus[secret.id]} onClick={() => {
                  setActionStatus(prev => ({ ...prev, [secret.id]: 'processing' }));
                  setTimeout(() => {
                    setActionStatus(prev => ({ ...prev, [secret.id]: 'done' }));
                    setTimeout(() => setActionStatus(prev => ({ ...prev, [secret.id]: '' })), 2000);
                  }, 1500);
                }}>
                  {actionStatus[secret.id] === 'processing' ? '⏳ Revoking...' : actionStatus[secret.id] === 'done' ? '✓ Revoked' : 'Revoke & Rotate'}
                </button>
              </div>

              <div className="p-3 bg-black/50 rounded-lg font-mono text-sm mb-4">
                <code className="text-orange-400">{secret.snippet}</code>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <span className="text-green-400 text-sm">💡 {secret.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📜 Policy Violations</h2>
            <div className="space-y-3">
              {policyViolations.map(violation => (
                <div key={violation.id} className={`p-4 rounded-lg border ${getSeverityColor(violation.severity)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{violation.policy}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getSeverityColor(violation.severity)}`}>
                          {violation.severity}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 font-mono">{violation.resource}</div>
                    </div>
                    <button className={`px-3 py-1 rounded text-sm ${
                      actionStatus[violation.id] === 'done' ? 'bg-green-500/20 border border-green-500 text-green-400' :
                      actionStatus[violation.id] === 'processing' ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-400' :
                      'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500 text-cyan-400'
                    }`} disabled={!!actionStatus[violation.id]} onClick={() => {
                      setActionStatus(prev => ({ ...prev, [violation.id]: 'processing' }));
                      setTimeout(() => {
                        setActionStatus(prev => ({ ...prev, [violation.id]: 'done' }));
                        setTimeout(() => setActionStatus(prev => ({ ...prev, [violation.id]: '' })), 2000);
                      }, 1500);
                    }}>
                      {actionStatus[violation.id] === 'processing' ? '⏳ Fixing...' : actionStatus[violation.id] === 'done' ? '✓ Fixed' : 'Auto-Fix'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{violation.description}</p>
                  <div className="p-2 bg-green-500/10 border border-green-500/30 rounded text-sm">
                    <span className="text-green-400">💡 {violation.remediation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* IaC Security Tab */}
      {activeTab === 'iac' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">🏗️ Infrastructure as Code Scanning</h2>
              <div className="space-y-3">
                {[
                  { name: 'Terraform', files: 12, issues: 5, icon: '⚙️' },
                  { name: 'Kubernetes', files: 8, issues: 3, icon: '☸️' },
                  { name: 'CloudFormation', files: 4, issues: 1, icon: '☁️' },
                  { name: 'Dockerfile', files: 3, issues: 2, icon: '🐳' },
                  { name: 'Ansible', files: 6, issues: 0, icon: '🅰️' }
                ].map((iac, idx) => (
                  <div key={idx} className="p-3 bg-gray-800/50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{iac.icon}</span>
                      <span className="font-medium">{iac.name}</span>
                      <span className="text-sm text-gray-500">{iac.files} files</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      iac.issues === 0 ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {iac.issues === 0 ? '✓ Clean' : `${iac.issues} issues`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">🔍 Compliance Frameworks</h2>
              <div className="space-y-3">
                {[
                  { name: 'CIS Benchmarks', compliance: 87, total: 156 },
                  { name: 'AWS Well-Architected', compliance: 92, total: 47 },
                  { name: 'NIST 800-53', compliance: 78, total: 89 },
                  { name: 'SOC 2', compliance: 85, total: 64 }
                ].map((framework, idx) => (
                  <div key={idx} className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{framework.name}</span>
                      <span className={`font-bold ${
                        framework.compliance >= 90 ? 'text-green-400' :
                        framework.compliance >= 70 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>{framework.compliance}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          framework.compliance >= 90 ? 'bg-green-500' :
                          framework.compliance >= 70 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${framework.compliance}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(framework.total * framework.compliance / 100)} / {framework.total} controls passing
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {analysisResult && (
        <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-4 mt-4">
          <div className="flex justify-between items-center mb-2"><h3 className="font-semibold text-blue-400">AI Analysis</h3><button onClick={() => setAnalysisResult('')} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <div className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</div>
        </div>
      )}
    </div>
  );
};

export default CICDSecurity;
