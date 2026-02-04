import React, { useState } from 'react';

// ============================================================================
// DATA LOSS PREVENTION (DLP)
// ============================================================================
// Protect sensitive data from unauthorized access, exfiltration, and leakage
// Classify data, monitor flows, prevent breaches, ensure compliance
// Critical for government - classified information protection
// ============================================================================

interface DataAsset {
  id: string;
  name: string;
  type: 'database' | 'file_share' | 'email' | 'cloud_storage' | 'endpoint' | 'api';
  classification: 'top_secret' | 'secret' | 'confidential' | 'restricted' | 'public';
  location: string;
  recordCount: number;
  sensitiveDataTypes: string[];
  encryptionStatus: 'encrypted' | 'partial' | 'unencrypted';
  accessControls: 'strict' | 'moderate' | 'weak';
  lastScan: string;
  riskScore: number;
}

interface DLPAlert {
  id: string;
  timestamp: string;
  type: 'exfiltration' | 'unauthorized_access' | 'policy_violation' | 'classification_mismatch' | 'bulk_download' | 'print_attempt' | 'email_leak';
  severity: 'critical' | 'high' | 'medium' | 'low';
  user: string;
  sourceAsset: string;
  destination?: string;
  dataTypes: string[];
  recordsAffected: number;
  action: 'blocked' | 'quarantined' | 'alerted' | 'allowed';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
}

interface DLPPolicy {
  id: string;
  name: string;
  description: string;
  dataTypes: string[];
  actions: string[];
  enabled: boolean;
  triggers: number;
  lastTriggered?: string;
}

interface SensitiveDataType {
  name: string;
  regex: string;
  instancesFound: number;
  locationsFound: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

export const DataLossPrevention: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'alerts' | 'policies' | 'discovery'>('dashboard');

  const dataAssets: DataAsset[] = [
    { id: 'da-1', name: 'Customer Database', type: 'database', classification: 'confidential', location: 'AWS RDS Sydney', recordCount: 2500000, sensitiveDataTypes: ['PII', 'Financial', 'Health'], encryptionStatus: 'encrypted', accessControls: 'strict', lastScan: '2026-02-04T06:00:00Z', riskScore: 35 },
    { id: 'da-2', name: 'HR File Share', type: 'file_share', classification: 'restricted', location: 'On-premises NAS', recordCount: 45000, sensitiveDataTypes: ['PII', 'TFN', 'Salary'], encryptionStatus: 'partial', accessControls: 'moderate', lastScan: '2026-02-04T06:00:00Z', riskScore: 55 },
    { id: 'da-3', name: 'Email System', type: 'email', classification: 'confidential', location: 'Microsoft 365', recordCount: 12000000, sensitiveDataTypes: ['PII', 'Business Secrets'], encryptionStatus: 'encrypted', accessControls: 'moderate', lastScan: '2026-02-04T06:00:00Z', riskScore: 45 },
    { id: 'da-4', name: 'Cloud Documents', type: 'cloud_storage', classification: 'restricted', location: 'Google Workspace', recordCount: 350000, sensitiveDataTypes: ['PII', 'Contracts', 'Legal'], encryptionStatus: 'encrypted', accessControls: 'weak', lastScan: '2026-02-04T06:00:00Z', riskScore: 72 },
    { id: 'da-5', name: 'Development API', type: 'api', classification: 'confidential', location: 'Internal Network', recordCount: 500000, sensitiveDataTypes: ['API Keys', 'Credentials'], encryptionStatus: 'encrypted', accessControls: 'strict', lastScan: '2026-02-04T06:00:00Z', riskScore: 28 },
    { id: 'da-6', name: 'Executive Laptops', type: 'endpoint', classification: 'secret', location: 'Corporate Endpoints', recordCount: 25000, sensitiveDataTypes: ['Strategy', 'M&A', 'Financial'], encryptionStatus: 'encrypted', accessControls: 'strict', lastScan: '2026-02-04T06:00:00Z', riskScore: 42 },
  ];

  const dlpAlerts: DLPAlert[] = [
    { id: 'alert-1', timestamp: '2026-02-04T11:45:00Z', type: 'bulk_download', severity: 'critical', user: 'john.smith@company.com', sourceAsset: 'Customer Database', destination: 'Personal USB', dataTypes: ['PII', 'Financial'], recordsAffected: 50000, action: 'blocked', status: 'investigating' },
    { id: 'alert-2', timestamp: '2026-02-04T11:30:00Z', type: 'email_leak', severity: 'high', user: 'sarah.jones@company.com', sourceAsset: 'Email System', destination: 'External Email', dataTypes: ['Contracts'], recordsAffected: 5, action: 'quarantined', status: 'open' },
    { id: 'alert-3', timestamp: '2026-02-04T10:15:00Z', type: 'unauthorized_access', severity: 'high', user: 'external_ip', sourceAsset: 'HR File Share', dataTypes: ['TFN', 'Salary'], recordsAffected: 1200, action: 'blocked', status: 'resolved' },
    { id: 'alert-4', timestamp: '2026-02-04T09:00:00Z', type: 'classification_mismatch', severity: 'medium', user: 'mike.brown@company.com', sourceAsset: 'Cloud Documents', dataTypes: ['Legal'], recordsAffected: 15, action: 'alerted', status: 'open' },
    { id: 'alert-5', timestamp: '2026-02-04T08:30:00Z', type: 'print_attempt', severity: 'medium', user: 'lisa.chen@company.com', sourceAsset: 'Executive Laptops', dataTypes: ['Strategy'], recordsAffected: 3, action: 'blocked', status: 'resolved' },
  ];

  const policies: DLPPolicy[] = [
    { id: 'p-1', name: 'PII Protection', description: 'Block exfiltration of Personally Identifiable Information', dataTypes: ['SSN', 'TFN', 'Passport', 'Driver License'], actions: ['Block', 'Alert', 'Log'], enabled: true, triggers: 234, lastTriggered: '2026-02-04T11:45:00Z' },
    { id: 'p-2', name: 'Financial Data Control', description: 'Protect credit card numbers, bank accounts, financial records', dataTypes: ['Credit Card', 'Bank Account', 'Financial Statement'], actions: ['Block', 'Encrypt', 'Alert'], enabled: true, triggers: 89, lastTriggered: '2026-02-04T10:30:00Z' },
    { id: 'p-3', name: 'Health Information (HIPAA)', description: 'Protect health records and medical information', dataTypes: ['Medicare', 'Health Records', 'Diagnosis'], actions: ['Block', 'Alert', 'Quarantine'], enabled: true, triggers: 45, lastTriggered: '2026-02-03T15:20:00Z' },
    { id: 'p-4', name: 'Source Code Protection', description: 'Prevent unauthorized sharing of proprietary code', dataTypes: ['Source Code', 'Algorithms', 'API Keys'], actions: ['Block', 'Alert'], enabled: true, triggers: 156, lastTriggered: '2026-02-04T09:15:00Z' },
    { id: 'p-5', name: 'Executive Communications', description: 'Protect sensitive executive and board communications', dataTypes: ['M&A', 'Strategy', 'Board Minutes'], actions: ['Encrypt', 'Alert', 'Log'], enabled: true, triggers: 23, lastTriggered: '2026-02-04T08:30:00Z' },
    { id: 'p-6', name: 'Government Classification', description: 'Enforce government security classification rules', dataTypes: ['Top Secret', 'Secret', 'Confidential'], actions: ['Block', 'Quarantine', 'Alert'], enabled: true, triggers: 12 },
  ];

  const sensitiveDataTypes: SensitiveDataType[] = [
    { name: 'Tax File Numbers (TFN)', regex: '\\d{3}\\s?\\d{3}\\s?\\d{3}', instancesFound: 2340000, locationsFound: 45, riskLevel: 'critical' },
    { name: 'Credit Card Numbers', regex: '\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}', instancesFound: 890000, locationsFound: 23, riskLevel: 'critical' },
    { name: 'Email Addresses', regex: '[\\w.-]+@[\\w.-]+\\.\\w+', instancesFound: 5670000, locationsFound: 156, riskLevel: 'medium' },
    { name: 'Phone Numbers', regex: '\\+?\\d{2}[\\s-]?\\d{4}[\\s-]?\\d{4}', instancesFound: 3450000, locationsFound: 89, riskLevel: 'low' },
    { name: 'Medicare Numbers', regex: '\\d{4}\\s?\\d{5}\\s?\\d{1}', instancesFound: 450000, locationsFound: 12, riskLevel: 'critical' },
    { name: 'API Keys', regex: '[a-zA-Z0-9]{32,}', instancesFound: 1234, locationsFound: 8, riskLevel: 'high' },
    { name: 'Bank Account Numbers', regex: 'BSB:\\s?\\d{3}-?\\d{3}\\s+Acc:\\s?\\d{6,9}', instancesFound: 234000, locationsFound: 15, riskLevel: 'high' },
  ];

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'top_secret': return 'bg-red-500/20 text-red-400 border-red-500';
      case 'secret': return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'confidential': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'restricted': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'public': return 'bg-green-500/20 text-green-400 border-green-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'blocked': return 'bg-green-500/20 text-green-400';
      case 'quarantined': return 'bg-yellow-500/20 text-yellow-400';
      case 'alerted': return 'bg-orange-500/20 text-orange-400';
      case 'allowed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const blockedToday = dlpAlerts.filter(a => a.action === 'blocked').length;
  const criticalAlerts = dlpAlerts.filter(a => a.severity === 'critical').length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🔒 Data Loss Prevention</h1>
          <p className="text-gray-400">Protect sensitive data from unauthorized access and exfiltration</p>
        </div>
        <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold">
          🔍 Run Data Discovery
        </button>
      </div>

      {/* Alert Banner */}
      {criticalAlerts > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <div className="font-bold text-red-400">{criticalAlerts} Critical Data Leak Attempts</div>
              <div className="text-sm text-gray-400">Bulk download and exfiltration attempts detected and blocked</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-cyan-400">{dataAssets.length}</div>
          <div className="text-sm text-gray-400">Data Assets</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{blockedToday}</div>
          <div className="text-sm text-gray-400">Blocked Today</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{criticalAlerts}</div>
          <div className="text-sm text-gray-400">Critical Alerts</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">{policies.filter(p => p.enabled).length}</div>
          <div className="text-sm text-gray-400">Active Policies</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{sensitiveDataTypes.length}</div>
          <div className="text-sm text-gray-400">Data Types</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-400">
            {(sensitiveDataTypes.reduce((sum, d) => sum + d.instancesFound, 0) / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-gray-400">Sensitive Records</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'assets', label: '💾 Data Assets' },
          { id: 'alerts', label: '⚠️ Alerts' },
          { id: 'policies', label: '📋 Policies' },
          { id: 'discovery', label: '🔍 Data Discovery' }
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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">🔥 Recent DLP Events</h3>
            <div className="space-y-3">
              {dlpAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className={`p-3 rounded-lg border ${
                  alert.severity === 'critical' ? 'border-red-500/30 bg-red-500/10' :
                  alert.severity === 'high' ? 'border-orange-500/30 bg-orange-500/10' :
                  'border-yellow-500/30 bg-yellow-500/10'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{alert.type.replace(/_/g, ' ')}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getActionColor(alert.action)}`}>
                      {alert.action}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">{alert.user}</div>
                  <div className="text-xs text-gray-500">{alert.recordsAffected.toLocaleString()} records</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">📊 Data Classification Overview</h3>
            <div className="space-y-4">
              {['top_secret', 'secret', 'confidential', 'restricted', 'public'].map(classification => {
                const count = dataAssets.filter(a => a.classification === classification).length;
                const total = dataAssets.length;
                return (
                  <div key={classification} className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs border ${getClassificationColor(classification)}`}>
                      {classification.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          classification === 'top_secret' ? 'bg-red-500' :
                          classification === 'secret' ? 'bg-orange-500' :
                          classification === 'confidential' ? 'bg-yellow-500' :
                          classification === 'restricted' ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="p-4">Asset</th>
                <th className="p-4">Type</th>
                <th className="p-4">Classification</th>
                <th className="p-4">Records</th>
                <th className="p-4">Data Types</th>
                <th className="p-4">Encryption</th>
                <th className="p-4">Risk</th>
              </tr>
            </thead>
            <tbody>
              {dataAssets.map(asset => (
                <tr key={asset.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-4">
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-xs text-gray-500">{asset.location}</div>
                  </td>
                  <td className="p-4">{asset.type.replace('_', ' ')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs border ${getClassificationColor(asset.classification)}`}>
                      {asset.classification.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">{asset.recordCount.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {asset.sensitiveDataTypes.slice(0, 3).map((dt, idx) => (
                        <span key={idx} className="px-1 py-0.5 bg-gray-700 rounded text-xs">{dt}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      asset.encryptionStatus === 'encrypted' ? 'bg-green-500/20 text-green-400' :
                      asset.encryptionStatus === 'partial' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {asset.encryptionStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className={`font-bold ${
                      asset.riskScore >= 60 ? 'text-red-400' :
                      asset.riskScore >= 40 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {asset.riskScore}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {dlpAlerts.map(alert => (
            <div key={alert.id} className={`p-6 rounded-xl border ${
              alert.severity === 'critical' ? 'border-red-500/30 bg-red-500/5' :
              alert.severity === 'high' ? 'border-orange-500/30 bg-orange-500/5' :
              'border-yellow-500/30 bg-yellow-500/5'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="font-semibold">{alert.type.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-sm text-gray-500">User: {alert.user}</div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${getActionColor(alert.action)}`}>
                    {alert.action}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    alert.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                    alert.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Source</div>
                  <div>{alert.sourceAsset}</div>
                </div>
                <div>
                  <div className="text-gray-500">Destination</div>
                  <div>{alert.destination || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Data Types</div>
                  <div className="flex gap-1">
                    {alert.dataTypes.map((dt, idx) => (
                      <span key={idx} className="px-1 py-0.5 bg-gray-700 rounded text-xs">{dt}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Records Affected</div>
                  <div className="font-bold text-red-400">{alert.recordsAffected.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          {policies.map(policy => (
            <div key={policy.id} className={`p-6 rounded-xl border ${
              policy.enabled ? 'border-green-500/30 bg-green-500/5' : 'border-gray-700 bg-gray-900/50'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{policy.name}</h3>
                  <p className="text-sm text-gray-400">{policy.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-cyan-400">{policy.triggers}</div>
                    <div className="text-xs text-gray-500">triggers</div>
                  </div>
                  <span className={`px-3 py-1 rounded ${
                    policy.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {policy.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">Protected data:</span>
                {policy.dataTypes.map((dt, idx) => (
                  <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">{dt}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discovery Tab */}
      {activeTab === 'discovery' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">🔍 Sensitive Data Discovery Results</h3>
          <div className="space-y-4">
            {sensitiveDataTypes.sort((a, b) => b.instancesFound - a.instancesFound).map(dataType => (
              <div key={dataType.name} className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{dataType.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      dataType.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
                      dataType.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      dataType.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {dataType.riskLevel}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-cyan-400">{dataType.instancesFound.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">instances in {dataType.locationsFound} locations</div>
                  </div>
                </div>
                <div className="font-mono text-xs text-gray-500 bg-gray-900 rounded p-2">
                  Pattern: {dataType.regex}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataLossPrevention;
