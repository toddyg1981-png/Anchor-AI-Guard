import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

// ============================================================================
// DARK WEB MONITOR - CREDENTIAL & DATA LEAK DETECTION
// ============================================================================

interface DarkWebAlert {
  id: string;
  type: 'credential' | 'source_code' | 'api_key' | 'database' | 'document' | 'pii';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
  discoveredAt: string;
  affectedAssets: string[];
  exposedData: string[];
  status: 'new' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
  recommendedActions: string[];
  rawSnippet?: string;
}

interface BreachRecord {
  id: string;
  breachName: string;
  breachDate: string;
  discoveredDate: string;
  affectedEmails: number;
  dataTypes: string[];
  description: string;
  severity: 'critical' | 'high' | 'medium';
}

interface MonitoredAsset {
  id: string;
  type: 'domain' | 'email' | 'keyword' | 'ip' | 'api_key_pattern';
  value: string;
  status: 'active' | 'paused';
  alertCount: number;
  lastChecked: string;
}

interface DarkWebStats {
  totalAlerts: number;
  criticalAlerts: number;
  resolvedAlerts: number;
  monitoredAssets: number;
  breachesDetected: number;
  credentialsExposed: number;
  lastScanTime: string;
}

// ============================================================================
// DARK WEB MONITOR COMPONENT
// ============================================================================

export const DarkWebMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'breaches' | 'assets' | 'search'>('alerts');
  const [selectedAlert, setSelectedAlert] = useState<DarkWebAlert | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddAssetForm, setShowAddAssetForm] = useState(false);
  const [assetMenuId, setAssetMenuId] = useState<string | null>(null);
  const [alertStatuses, setAlertStatuses] = useState<Record<string, DarkWebAlert['status']>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [_searchPerformed, setSearchPerformed] = useState(false);

  const [backendLoading, setBackendLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    (async () => {
      setBackendLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('dark-web');
        if (res)       } catch (e) { console.error(e); } finally { setBackendLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await backendApi.modules.analyze('dark-web', 'Analyze dark web monitoring findings for credential exposure, data leaks, and threat actor activity');
      if ((res as any)?.analysis) setAnalysisResult((res as any).analysis);
    } catch (e) { console.error(e); } finally { setAnalyzing(false); }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Mock data
  const stats: DarkWebStats = {
    totalAlerts: 23,
    criticalAlerts: 4,
    resolvedAlerts: 15,
    monitoredAssets: 12,
    breachesDetected: 3,
    credentialsExposed: 847,
    lastScanTime: new Date().toISOString()
  };

  const alerts: DarkWebAlert[] = [
    {
      id: 'dw-001',
      type: 'credential',
      severity: 'critical',
      title: 'Employee Credentials Found on Dark Web Forum',
      description: 'Multiple employee email/password combinations discovered on a dark web marketplace.',
      source: 'BreachForums (Tor Hidden Service)',
      discoveredAt: '2026-02-04T08:30:00Z',
      affectedAssets: ['john.smith@company.com', 'sarah.jones@company.com', 'admin@company.com'],
      exposedData: ['Email addresses', 'Plaintext passwords', 'Company domain'],
      status: 'new',
      recommendedActions: [
        'Force password reset for affected accounts immediately',
        'Enable MFA on all affected accounts',
        'Check for unauthorized access in audit logs',
        'Notify affected employees'
      ],
      rawSnippet: 'company.com:john.smith@company.com:P@ssw0rd123\ncompany.com:sarah.jones@company.com:Welcome2024!'
    },
    {
      id: 'dw-002',
      type: 'api_key',
      severity: 'critical',
      title: 'AWS Access Keys Exposed in Paste Site',
      description: 'AWS access key and secret key found in a public paste, potentially from committed code.',
      source: 'Pastebin.com',
      discoveredAt: '2026-02-03T14:20:00Z',
      affectedAssets: ['AWS Account: 123456789012'],
      exposedData: ['AWS Access Key ID', 'AWS Secret Access Key', 'Region configuration'],
      status: 'investigating',
      recommendedActions: [
        'Rotate AWS credentials immediately',
        'Review CloudTrail for unauthorized API calls',
        'Check for resource creation/modification',
        'Implement AWS Secrets Manager'
      ],
      rawSnippet: 'AKIA****************\nwJalrXUtnFEMI/K7MDENG/bPxRfiCY********'
    },
    {
      id: 'dw-003',
      type: 'source_code',
      severity: 'high',
      title: 'Internal Repository Code Leaked',
      description: 'Portions of internal application source code found on a code sharing site.',
      source: 'GitHub Gist (Public)',
      discoveredAt: '2026-02-02T22:15:00Z',
      affectedAssets: ['payment-service', 'auth-middleware'],
      exposedData: ['Source code', 'Database connection strings', 'Internal API endpoints'],
      status: 'confirmed',
      recommendedActions: [
        'Request takedown from platform',
        'Rotate all exposed credentials',
        'Review code for additional secrets',
        'Implement pre-commit secret scanning'
      ]
    },
    {
      id: 'dw-004',
      type: 'database',
      severity: 'critical',
      title: 'Customer Database Dump for Sale',
      description: 'A database dump claiming to contain customer records is being sold on a dark web market.',
      source: 'Dark Web Marketplace',
      discoveredAt: '2026-02-01T16:45:00Z',
      affectedAssets: ['Customer Database'],
      exposedData: ['Customer names', 'Email addresses', 'Phone numbers', 'Purchase history'],
      status: 'investigating',
      recommendedActions: [
        'Verify if data matches internal records',
        'Engage incident response team',
        'Prepare breach notification if confirmed',
        'Contact law enforcement'
      ]
    },
    {
      id: 'dw-005',
      type: 'pii',
      severity: 'high',
      title: 'Employee PII in Data Breach Compilation',
      description: 'Employee personal information found in a compilation of multiple breaches.',
      source: 'Breach Compilation Database',
      discoveredAt: '2026-01-30T11:00:00Z',
      affectedAssets: ['HR Records'],
      exposedData: ['Full names', 'Personal email addresses', 'Phone numbers'],
      status: 'resolved',
      recommendedActions: [
        'Notify affected employees',
        'Offer identity monitoring services',
        'Review data handling procedures'
      ]
    }
  ];

  const breaches: BreachRecord[] = [
    {
      id: 'breach-001',
      breachName: 'MegaCorp Data Breach 2025',
      breachDate: '2025-11-15',
      discoveredDate: '2025-12-01',
      affectedEmails: 12,
      dataTypes: ['Email', 'Password', 'Name'],
      description: 'Large-scale breach affecting multiple organizations. Your domain was found in the dump.',
      severity: 'critical'
    },
    {
      id: 'breach-002',
      breachName: 'CloudService Incident',
      breachDate: '2025-09-20',
      discoveredDate: '2025-10-05',
      affectedEmails: 5,
      dataTypes: ['Email', 'API Keys'],
      description: 'Third-party cloud service breach exposing customer API credentials.',
      severity: 'high'
    },
    {
      id: 'breach-003',
      breachName: 'Marketing Platform Leak',
      breachDate: '2025-07-10',
      discoveredDate: '2025-08-01',
      affectedEmails: 28,
      dataTypes: ['Email', 'Name', 'Company'],
      description: 'Marketing automation platform breach exposing subscriber data.',
      severity: 'medium'
    }
  ];

  const monitoredAssets: MonitoredAsset[] = [
    { id: 'asset-001', type: 'domain', value: 'company.com', status: 'active', alertCount: 8, lastChecked: '2026-02-04T10:00:00Z' },
    { id: 'asset-002', type: 'domain', value: 'company.com.au', status: 'active', alertCount: 2, lastChecked: '2026-02-04T10:00:00Z' },
    { id: 'asset-003', type: 'email', value: '*@company.com', status: 'active', alertCount: 12, lastChecked: '2026-02-04T10:00:00Z' },
    { id: 'asset-004', type: 'keyword', value: '"company internal"', status: 'active', alertCount: 1, lastChecked: '2026-02-04T10:00:00Z' },
    { id: 'asset-005', type: 'ip', value: '203.45.67.0/24', status: 'active', alertCount: 0, lastChecked: '2026-02-04T10:00:00Z' },
    { id: 'asset-006', type: 'api_key_pattern', value: 'COMPANY_API_*', status: 'active', alertCount: 3, lastChecked: '2026-02-04T10:00:00Z' },
  ];

  const runScan = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 5000));
    setIsScanning(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-red-400 bg-red-500/20';
      case 'investigating': return 'text-yellow-400 bg-yellow-500/20';
      case 'confirmed': return 'text-orange-400 bg-orange-500/20';
      case 'resolved': return 'text-green-400 bg-green-500/20';
      case 'false_positive': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credential': return '🔑';
      case 'source_code': return '💻';
      case 'api_key': return '🔐';
      case 'database': return '🗄️';
      case 'document': return '📄';
      case 'pii': return '👤';
      default: return '⚠️';
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
          <h1 className="text-3xl font-bold mb-2">🕵️ Dark Web Monitor</h1>
          <p className="text-gray-400">Real-time detection of leaked credentials, code, and data</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAIAnalysis}
            disabled={analyzing || backendLoading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {analyzing ? '⏳ Analyzing...' : '🤖 AI Analysis'}
          </button>
          <div className="text-sm text-gray-400">
            Last scan: {new Date(stats.lastScanTime).toLocaleTimeString()}
          </div>
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
                Scanning Dark Web...
              </>
            ) : (
              <>🔍 Run Deep Scan</>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-white">{stats.totalAlerts}</div>
          <div className="text-gray-400 text-sm">Total Alerts</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-400">{stats.criticalAlerts}</div>
          <div className="text-gray-400 text-sm">Critical</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">{stats.resolvedAlerts}</div>
          <div className="text-gray-400 text-sm">Resolved</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-400">{stats.monitoredAssets}</div>
          <div className="text-gray-400 text-sm">Monitored Assets</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-orange-400">{stats.breachesDetected}</div>
          <div className="text-gray-400 text-sm">Breaches</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-400">{stats.credentialsExposed}</div>
          <div className="text-gray-400 text-sm">Credentials Exposed</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'alerts', label: '🚨 Alerts', count: stats.totalAlerts - stats.resolvedAlerts },
          { id: 'breaches', label: '💀 Breaches', count: breaches.length },
          { id: 'assets', label: '🎯 Monitored Assets', count: monitoredAssets.length },
          { id: 'search', label: '🔍 Deep Search', count: null }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.filter(a => a.status !== 'resolved' && a.status !== 'false_positive').map(alert => (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{getTypeIcon(alert.type)}</span>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getStatusColor(alertStatuses[alert.id] || alert.status)}`}>
                        {(alertStatuses[alert.id] || alert.status).replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📍 {alert.source}</span>
                      <span>🕐 {new Date(alert.discoveredAt).toLocaleString()}</span>
                      <span>📦 {alert.affectedAssets.length} affected assets</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Breaches Tab */}
      {activeTab === 'breaches' && (
        <div className="space-y-4">
          {breaches.map(breach => (
            <div key={breach.id} className={`p-4 rounded-xl border ${getSeverityColor(breach.severity)}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{breach.breachName}</h3>
                  <p className="text-gray-400 text-sm">{breach.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase ${getSeverityColor(breach.severity)}`}>
                  {breach.severity}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Breach Date</span>
                  <p className="font-medium">{breach.breachDate}</p>
                </div>
                <div>
                  <span className="text-gray-500">Discovered</span>
                  <p className="font-medium">{breach.discoveredDate}</p>
                </div>
                <div>
                  <span className="text-gray-500">Your Affected Emails</span>
                  <p className="font-medium text-red-400">{breach.affectedEmails}</p>
                </div>
                <div>
                  <span className="text-gray-500">Data Types</span>
                  <p className="font-medium">{breach.dataTypes.join(', ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Monitored Assets Tab */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Monitored Assets</h2>
            <button
              onClick={() => setShowAddAssetForm(!showAddAssetForm)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium"
            >
              {showAddAssetForm ? '✕ Cancel' : '+ Add Asset'}
            </button>
          </div>

          {showAddAssetForm && (
            <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-6 mb-4">
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Add Monitored Asset</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Asset Type</label>
                  <select title="Asset type" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none">
                    <option>Domain</option><option>Email</option><option>Keyword</option><option>IP Address</option><option>API Key Pattern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Value</label>
                  <input type="text" placeholder="e.g., example.com" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
              <button
                onClick={() => { setShowAddAssetForm(false); showNotification('✅ Asset added to monitoring list'); }}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium"
              >
                Add Asset
              </button>
            </div>
          )}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                  <th className="p-4">Type</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Alerts</th>
                  <th className="p-4">Last Checked</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {monitoredAssets.map(asset => (
                  <tr key={asset.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs uppercase">{asset.type}</span>
                    </td>
                    <td className="p-4 font-mono text-sm">{asset.value}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        asset.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={asset.alertCount > 0 ? 'text-red-400 font-bold' : 'text-gray-400'}>
                        {asset.alertCount}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(asset.lastChecked).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <button
                          onClick={() => setAssetMenuId(assetMenuId === asset.id ? null : asset.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          ⋮
                        </button>
                        {assetMenuId === asset.id && (
                          <div className="absolute right-0 top-8 z-10 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1">
                            <button
                              onClick={() => { setAssetMenuId(null); showNotification(`Paused monitoring for ${asset.value}`); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                            >
                              ⏸ Pause Monitoring
                            </button>
                            <button
                              onClick={() => { setAssetMenuId(null); showNotification(`Scanning ${asset.value}...`); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                            >
                              🔍 Scan Now
                            </button>
                            <button
                              onClick={() => { setAssetMenuId(null); navigator.clipboard.writeText(asset.value); showNotification(`Copied ${asset.value} to clipboard`); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                            >
                              📋 Copy Value
                            </button>
                            <button
                              onClick={() => { if (window.confirm(`Remove ${asset.value} from monitoring?`)) { setAssetMenuId(null); showNotification(`Removed ${asset.value} from monitoring`); } }}
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                            >
                              🗑 Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deep Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🔍 Deep Web Search</h2>
            <p className="text-gray-400 mb-4">Search for specific data across dark web sources, paste sites, and breach databases.</p>
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter email, domain, keyword, or hash to search..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (!searchQuery.trim()) { showNotification('⚠️ Please enter a search query'); return; }
                  setSearchPerformed(true);
                  showNotification(`🔍 Searching dark web for "${searchQuery}"...`);
                }}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium"
              >
                Search
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="text-gray-500 text-sm">Quick search:</span>
              <button className="text-purple-400 text-sm hover:underline" onClick={() => setSearchQuery('company.com')}>
                Your domain
              </button>
              <button className="text-purple-400 text-sm hover:underline" onClick={() => setSearchQuery('admin@company.com')}>
                Admin email
              </button>
              <button className="text-purple-400 text-sm hover:underline" onClick={() => setSearchQuery('API_KEY')}>
                API keys
              </button>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Search Sources</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Tor Hidden Services', status: 'active', icon: '🧅' },
                { name: 'Paste Sites', status: 'active', icon: '📋' },
                { name: 'Breach Databases', status: 'active', icon: '💀' },
                { name: 'Code Repositories', status: 'active', icon: '💻' },
                { name: 'Dark Web Forums', status: 'active', icon: '💬' },
                { name: 'Marketplaces', status: 'active', icon: '🏪' },
                { name: 'IRC Channels', status: 'active', icon: '📡' },
                { name: 'Telegram Groups', status: 'active', icon: '✈️' }
              ].map(source => (
                <div key={source.name} className="p-3 bg-gray-800/50 rounded-lg flex items-center gap-3">
                  <span className="text-xl">{source.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{source.name}</p>
                    <p className="text-xs text-green-400">● Active</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{getTypeIcon(selectedAlert.type)}</span>
                <div>
                  <h2 className="text-xl font-bold">{selectedAlert.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getSeverityColor(selectedAlert.severity)}`}>
                      {selectedAlert.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getStatusColor(alertStatuses[selectedAlert.id] || selectedAlert.status)}`}>
                      {(alertStatuses[selectedAlert.id] || selectedAlert.status).replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="text-gray-400 hover:text-white" aria-label="Close alert details">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-sm text-gray-400 mb-2">Description</h3>
                <p className="text-gray-200">{selectedAlert.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-2">Source</h3>
                  <p className="text-gray-200">{selectedAlert.source}</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-2">Discovered</h3>
                  <p className="text-gray-200">{new Date(selectedAlert.discoveredAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-sm text-gray-400 mb-2">Affected Assets</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAlert.affectedAssets.map((asset, i) => (
                    <span key={i} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                      {asset}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-sm text-gray-400 mb-2">Exposed Data Types</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAlert.exposedData.map((data, i) => (
                    <span key={i} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                      {data}
                    </span>
                  ))}
                </div>
              </div>

              {selectedAlert.rawSnippet && (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-2">Raw Data Sample (Redacted)</h3>
                  <pre className="text-xs text-gray-400 font-mono bg-black/50 p-3 rounded overflow-x-auto">
                    {selectedAlert.rawSnippet}
                  </pre>
                </div>
              )}

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h3 className="text-sm text-red-400 font-medium mb-2">⚡ Recommended Actions</h3>
                <ul className="space-y-2">
                  {selectedAlert.recommendedActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-red-400 mt-0.5">→</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setAlertStatuses(prev => ({ ...prev, [selectedAlert.id]: 'investigating' }));
                  showNotification(`🔍 Alert "${selectedAlert.title}" marked as investigating`);
                  setSelectedAlert(null);
                }}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-medium"
              >
                Mark as Investigating
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Create incident for: ${selectedAlert.title}?`)) {
                    showNotification(`🚨 Incident INC-${Math.floor(Math.random() * 9000 + 1000)} created for "${selectedAlert.title}"`);
                    setSelectedAlert(null);
                  }
                }}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium"
              >
                Create Incident
              </button>
            </div>
          </div>
        </div>
      )}

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

export default DarkWebMonitor;
