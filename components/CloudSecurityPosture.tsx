import React, { useState } from 'react';

// ============================================================================
// CLOUD SECURITY POSTURE MANAGEMENT (CSPM)
// ============================================================================

interface CloudAccount {
  id: string;
  name: string;
  provider: 'aws' | 'azure' | 'gcp' | 'oracle' | 'alibaba';
  accountId: string;
  region: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  resources: number;
  findings: number;
  criticalFindings: number;
  complianceScore: number;
}

interface CloudFinding {
  id: string;
  accountId: string;
  provider: string;
  service: string;
  resourceType: string;
  resourceId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  remediation: string;
  compliance: string[];
  autoRemediable: boolean;
}

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  passedControls: number;
  failedControls: number;
  totalControls: number;
  score: number;
}

export const CloudSecurityPosture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'compliance' | 'resources' | 'identity'>('overview');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [isRemediating, setIsRemediating] = useState<string | null>(null);

  // Mock cloud accounts
  const accounts: CloudAccount[] = [
    { id: 'acc-1', name: 'Production AWS', provider: 'aws', accountId: '123456789012', region: 'ap-southeast-2', status: 'connected', lastSync: '2026-02-04T11:55:00Z', resources: 456, findings: 45, criticalFindings: 8, complianceScore: 72 },
    { id: 'acc-2', name: 'Development AWS', provider: 'aws', accountId: '234567890123', region: 'ap-southeast-2', status: 'connected', lastSync: '2026-02-04T11:50:00Z', resources: 234, findings: 23, criticalFindings: 2, complianceScore: 85 },
    { id: 'acc-3', name: 'Production Azure', provider: 'azure', accountId: 'sub-prod-001', region: 'australiaeast', status: 'connected', lastSync: '2026-02-04T11:45:00Z', resources: 189, findings: 18, criticalFindings: 3, complianceScore: 78 },
    { id: 'acc-4', name: 'GCP Analytics', provider: 'gcp', accountId: 'analytics-proj-123', region: 'australia-southeast1', status: 'connected', lastSync: '2026-02-04T11:40:00Z', resources: 67, findings: 8, criticalFindings: 1, complianceScore: 91 }
  ];

  // Mock findings
  const findings: CloudFinding[] = [
    { id: 'cfind-1', accountId: 'acc-1', provider: 'aws', service: 'S3', resourceType: 'S3 Bucket', resourceId: 'company-prod-data-backup', severity: 'critical', title: 'S3 bucket publicly accessible', description: 'The S3 bucket has public read access enabled, potentially exposing sensitive data', remediation: 'Remove public access by modifying the bucket policy and enabling S3 Block Public Access', compliance: ['CIS AWS 2.1.5', 'SOC 2', 'GDPR'], autoRemediable: true },
    { id: 'cfind-2', accountId: 'acc-1', provider: 'aws', service: 'EC2', resourceType: 'Security Group', resourceId: 'sg-0abc123def456', severity: 'critical', title: 'Security group allows unrestricted SSH access', description: 'Security group allows SSH (port 22) access from 0.0.0.0/0', remediation: 'Restrict SSH access to specific IP ranges or use AWS Systems Manager Session Manager', compliance: ['CIS AWS 5.2', 'PCI DSS'], autoRemediable: true },
    { id: 'cfind-3', accountId: 'acc-1', provider: 'aws', service: 'RDS', resourceType: 'Database', resourceId: 'prod-mysql-primary', severity: 'high', title: 'RDS instance not encrypted', description: 'RDS database instance does not have encryption at rest enabled', remediation: 'Enable encryption at rest using AWS KMS. Note: requires database migration', compliance: ['CIS AWS 2.3.1', 'HIPAA', 'SOC 2'], autoRemediable: false },
    { id: 'cfind-4', accountId: 'acc-3', provider: 'azure', service: 'Storage', resourceType: 'Storage Account', resourceId: 'prodstorageaccount', severity: 'high', title: 'Storage account allows HTTP traffic', description: 'Azure Storage Account accepts unencrypted HTTP connections', remediation: 'Enable "Secure transfer required" setting on the storage account', compliance: ['CIS Azure 3.1', 'Essential Eight'], autoRemediable: true },
    { id: 'cfind-5', accountId: 'acc-1', provider: 'aws', service: 'IAM', resourceType: 'IAM User', resourceId: 'service-account-prod', severity: 'critical', title: 'IAM user with overly permissive policy', description: 'IAM user has AdministratorAccess policy attached', remediation: 'Apply principle of least privilege. Create custom policy with only required permissions', compliance: ['CIS AWS 1.16', 'SOC 2'], autoRemediable: false },
    { id: 'cfind-6', accountId: 'acc-4', provider: 'gcp', service: 'GCE', resourceType: 'VM Instance', resourceId: 'analytics-worker-1', severity: 'medium', title: 'VM instance has public IP', description: 'Compute Engine instance has external IP address assigned', remediation: 'Remove external IP and use Cloud NAT for outbound connectivity', compliance: ['CIS GCP 4.9'], autoRemediable: true },
    { id: 'cfind-7', accountId: 'acc-1', provider: 'aws', service: 'CloudTrail', resourceType: 'Trail', resourceId: 'management-events-trail', severity: 'high', title: 'CloudTrail log file validation disabled', description: 'CloudTrail log file integrity validation is not enabled', remediation: 'Enable log file validation to detect tampering of log files', compliance: ['CIS AWS 3.2', 'SOC 2'], autoRemediable: true }
  ];

  // Compliance frameworks
  const complianceFrameworks: ComplianceFramework[] = [
    { id: 'cis-aws', name: 'CIS AWS Foundations', description: 'Center for Internet Security AWS Benchmark', passedControls: 156, failedControls: 23, totalControls: 179, score: 87 },
    { id: 'cis-azure', name: 'CIS Azure Foundations', description: 'Center for Internet Security Azure Benchmark', passedControls: 89, failedControls: 12, totalControls: 101, score: 88 },
    { id: 'essential-8', name: 'Essential Eight', description: 'Australian Cyber Security Centre Essential Eight', passedControls: 7, failedControls: 1, totalControls: 8, score: 87 },
    { id: 'soc2', name: 'SOC 2', description: 'Service Organization Control 2', passedControls: 234, failedControls: 34, totalControls: 268, score: 87 },
    { id: 'pci-dss', name: 'PCI DSS v4.0', description: 'Payment Card Industry Data Security Standard', passedControls: 189, failedControls: 28, totalControls: 217, score: 87 },
    { id: 'hipaa', name: 'HIPAA', description: 'Health Insurance Portability and Accountability Act', passedControls: 78, failedControls: 8, totalControls: 86, score: 91 }
  ];

  const autoRemediate = async (findingId: string) => {
    setIsRemediating(findingId);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsRemediating(null);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'aws': return '☁️';
      case 'azure': return '🔷';
      case 'gcp': return '🌐';
      case 'oracle': return '🔴';
      case 'alibaba': return '🟠';
      default: return '☁️';
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 's3': return '🪣';
      case 'ec2': return '🖥️';
      case 'rds': return '🗄️';
      case 'iam': return '👤';
      case 'storage': return '💾';
      case 'gce': return '🖥️';
      case 'cloudtrail': return '📜';
      default: return '⚙️';
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

  const totalResources = accounts.reduce((sum, a) => sum + a.resources, 0);
  const totalFindings = accounts.reduce((sum, a) => sum + a.findings, 0);
  const criticalFindings = accounts.reduce((sum, a) => sum + a.criticalFindings, 0);
  const avgCompliance = Math.round(accounts.reduce((sum, a) => sum + a.complianceScore, 0) / accounts.length);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">☁️ Cloud Security Posture</h1>
          <p className="text-gray-400">Multi-cloud security configuration and compliance management</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="all">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium">
            ➕ Connect Account
          </button>
          <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium">
            🔄 Sync All
          </button>
        </div>
      </div>

      {/* Critical Alert */}
      {criticalFindings > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚨</span>
            <div>
              <h3 className="text-red-400 font-bold text-lg">Critical Misconfigurations Detected</h3>
              <p className="text-gray-400">
                Found {criticalFindings} critical cloud misconfigurations across your accounts. 
                {findings.filter(f => f.severity === 'critical' && f.autoRemediable).length} can be auto-remediated.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-white">{accounts.length}</div>
          <div className="text-gray-400 text-sm">Cloud Accounts</div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-cyan-400">{totalResources}</div>
          <div className="text-gray-400 text-sm">Resources</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-400">{criticalFindings}</div>
          <div className="text-gray-400 text-sm">Critical</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-orange-400">{totalFindings}</div>
          <div className="text-gray-400 text-sm">Total Findings</div>
        </div>
        <div className={`border rounded-xl p-4 ${
          avgCompliance >= 80 ? 'bg-green-500/10 border-green-500/30' :
          avgCompliance >= 60 ? 'bg-yellow-500/10 border-yellow-500/30' :
          'bg-red-500/10 border-red-500/30'
        }`}>
          <div className={`text-3xl font-bold ${
            avgCompliance >= 80 ? 'text-green-400' :
            avgCompliance >= 60 ? 'text-yellow-400' :
            'text-red-400'
          }`}>{avgCompliance}%</div>
          <div className="text-gray-400 text-sm">Compliance</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-400">{findings.filter(f => f.autoRemediable).length}</div>
          <div className="text-gray-400 text-sm">Auto-Fixable</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'findings', label: '🐛 Findings' },
          { id: 'compliance', label: '📋 Compliance' },
          { id: 'resources', label: '🏗️ Resources' },
          { id: 'identity', label: '👤 Identity' }
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
          {/* Cloud Accounts */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">☁️ Connected Accounts</h2>
            <div className="space-y-3">
              {accounts.map(account => (
                <div key={account.id} className={`p-4 rounded-lg border ${
                  account.status === 'connected' ? 'bg-gray-800/50 border-gray-700' : 'bg-red-500/10 border-red-500/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getProviderIcon(account.provider)}</span>
                      <span className="font-medium">{account.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        account.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {account.status}
                      </span>
                    </div>
                    <div className={`text-xl font-bold ${
                      account.complianceScore >= 80 ? 'text-green-400' :
                      account.complianceScore >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>{account.complianceScore}%</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{account.resources} resources</span>
                    <span className="text-orange-400">{account.findings} findings</span>
                    {account.criticalFindings > 0 && (
                      <span className="text-red-400">{account.criticalFindings} critical</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Findings by Service */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Findings by Service</h2>
            <div className="space-y-3">
              {[
                { service: 'S3', icon: '🪣', findings: 12, critical: 3 },
                { service: 'EC2', icon: '🖥️', findings: 15, critical: 2 },
                { service: 'IAM', icon: '👤', findings: 8, critical: 2 },
                { service: 'RDS', icon: '🗄️', findings: 5, critical: 1 },
                { service: 'CloudTrail', icon: '📜', findings: 3, critical: 0 },
                { service: 'Azure Storage', icon: '💾', findings: 4, critical: 1 }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.service}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400">{item.findings}</span>
                    {item.critical > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-bold">
                        {item.critical}C
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Overview */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">📋 Compliance Posture</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {complianceFrameworks.map(framework => (
                <div key={framework.id} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{framework.name}</span>
                    <span className={`text-xl font-bold ${
                      framework.score >= 80 ? 'text-green-400' :
                      framework.score >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>{framework.score}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full rounded-full ${
                        framework.score >= 80 ? 'bg-green-500' :
                        framework.score >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${framework.score}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {framework.passedControls} / {framework.totalControls} controls
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Findings Tab */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {findings.map(finding => (
            <div key={finding.id} className={`p-6 rounded-xl border ${getSeverityColor(finding.severity)}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{getServiceIcon(finding.service)}</span>
                    <span className="text-xl">{getProviderIcon(finding.provider)}</span>
                    <h3 className="font-semibold">{finding.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getSeverityColor(finding.severity)}`}>
                      {finding.severity}
                    </span>
                    {finding.autoRemediable && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                        🔧 Auto-Fix
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {finding.service} • {finding.resourceType} • {finding.resourceId}
                  </div>
                </div>
                {finding.autoRemediable && (
                  <button
                    onClick={() => autoRemediate(finding.id)}
                    disabled={isRemediating === finding.id}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isRemediating === finding.id
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isRemediating === finding.id ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Fixing...
                      </span>
                    ) : (
                      '🔧 Auto-Remediate'
                    )}
                  </button>
                )}
              </div>

              <p className="text-gray-400 mb-4">{finding.description}</p>

              <div className="space-y-3">
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <span className="text-green-400 text-sm">💡 {finding.remediation}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {finding.compliance.map((comp, idx) => (
                    <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          {complianceFrameworks.map(framework => (
            <div key={framework.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{framework.name}</h3>
                  <p className="text-gray-500">{framework.description}</p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    framework.score >= 80 ? 'text-green-400' :
                    framework.score >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>{framework.score}%</div>
                  <div className="text-sm text-gray-500">Compliance Score</div>
                </div>
              </div>
              
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full rounded-full ${
                    framework.score >= 80 ? 'bg-green-500' :
                    framework.score >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${framework.score}%` }}
                />
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-gray-400">Passed: {framework.passedControls}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-gray-400">Failed: {framework.failedControls}</span>
                </div>
                <div className="text-gray-500">
                  Total: {framework.totalControls} controls
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">🏗️ Cloud Resources</h2>
          <p className="text-gray-400 mb-4">Inventory of {totalResources} resources across all connected cloud accounts</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'EC2 Instances', count: 45, vulnerable: 8 },
              { type: 'S3 Buckets', count: 23, vulnerable: 5 },
              { type: 'RDS Databases', count: 12, vulnerable: 2 },
              { type: 'Lambda Functions', count: 67, vulnerable: 3 },
              { type: 'IAM Users', count: 34, vulnerable: 8 },
              { type: 'Security Groups', count: 89, vulnerable: 15 },
              { type: 'VPCs', count: 8, vulnerable: 1 },
              { type: 'Load Balancers', count: 15, vulnerable: 2 }
            ].map((resource, idx) => (
              <div key={idx} className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{resource.type}</span>
                  <span className="text-cyan-400 font-bold">{resource.count}</span>
                </div>
                {resource.vulnerable > 0 && (
                  <span className="text-sm text-orange-400">⚠️ {resource.vulnerable} vulnerable</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Identity Tab */}
      {activeTab === 'identity' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">👤 Identity & Access Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="text-3xl font-bold text-red-400">8</div>
                <div className="text-gray-400">Overprivileged Users</div>
              </div>
              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <div className="text-3xl font-bold text-orange-400">12</div>
                <div className="text-gray-400">Unused Credentials</div>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="text-3xl font-bold text-yellow-400">5</div>
                <div className="text-gray-400">No MFA Enabled</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudSecurityPosture;
