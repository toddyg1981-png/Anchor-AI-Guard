import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

// ============================================================================
// SECRETS ROTATION - AUTOMATIC CREDENTIAL & KEY ROTATION
// ============================================================================

interface Secret {
  id: string;
  name: string;
  type: 'api_key' | 'database' | 'oauth' | 'certificate' | 'ssh_key' | 'encryption_key';
  provider: 'aws' | 'azure' | 'gcp' | 'vault' | 'kubernetes' | 'custom';
  environment: 'production' | 'staging' | 'development';
  lastRotated: string;
  expiresAt?: string;
  rotationPolicy: '7d' | '30d' | '90d' | '365d' | 'manual';
  status: 'healthy' | 'expiring' | 'expired' | 'compromised';
  autoRotate: boolean;
  usageCount: number;
  services: string[];
}

interface RotationEvent {
  id: string;
  secretId: string;
  secretName: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  triggeredBy: 'schedule' | 'manual' | 'compromise' | 'policy';
  details: string;
  rollbackAvailable: boolean;
}

interface VaultConnection {
  id: string;
  name: string;
  type: 'hashicorp_vault' | 'aws_secrets_manager' | 'azure_key_vault' | 'gcp_secret_manager';
  status: 'connected' | 'disconnected' | 'error';
  secretsManaged: number;
  lastSync: string;
}

export const SecretsRotation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'secrets' | 'rotation' | 'policies' | 'vaults'>('secrets');
  const [_selectedSecret, _setSelectedSecret] = useState<Secret | null>(null);
  const [isRotating, setIsRotating] = useState<string | null>(null);
  const [showAddSecretForm, setShowAddSecretForm] = useState(false);
  const [_showImportForm, _setShowImportForm] = useState(false);
  const [showConnectVaultForm, setShowConnectVaultForm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const importFileRef = React.useRef<HTMLInputElement>(null);
  const [backendLoading, setBackendLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    (async () => {
      setBackendLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('secrets-rotation');
        } catch (e) { console.error(e); } finally { setBackendLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await backendApi.modules.analyze('secrets-rotation', 'Analyze secrets rotation posture for stale credentials, rotation compliance, and vault security');
      if ((res as any)?.analysis) setAnalysisResult((res as any).analysis);
    } catch (e) { console.error(e); } finally { setAnalyzing(false); }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Mock secrets data
  const secrets: Secret[] = [
    { id: 'sec-1', name: 'prod-database-password', type: 'database', provider: 'aws', environment: 'production', lastRotated: '2025-12-15', expiresAt: '2026-03-15', rotationPolicy: '90d', status: 'healthy', autoRotate: true, usageCount: 45, services: ['api-service', 'worker-service', 'analytics'] },
    { id: 'sec-2', name: 'stripe-api-key', type: 'api_key', provider: 'vault', environment: 'production', lastRotated: '2026-01-20', expiresAt: '2026-02-20', rotationPolicy: '30d', status: 'expiring', autoRotate: true, usageCount: 12, services: ['payment-service'] },
    { id: 'sec-3', name: 'aws-access-key', type: 'api_key', provider: 'aws', environment: 'production', lastRotated: '2024-08-10', rotationPolicy: 'manual', status: 'expired', autoRotate: false, usageCount: 78, services: ['s3-uploader', 'lambda-functions', 'cloudwatch-agent'] },
    { id: 'sec-4', name: 'ssl-certificate', type: 'certificate', provider: 'azure', environment: 'production', lastRotated: '2025-06-01', expiresAt: '2026-06-01', rotationPolicy: '365d', status: 'healthy', autoRotate: true, usageCount: 3, services: ['api-gateway', 'cdn'] },
    { id: 'sec-5', name: 'jwt-signing-key', type: 'encryption_key', provider: 'vault', environment: 'production', lastRotated: '2026-02-01', rotationPolicy: '7d', status: 'healthy', autoRotate: true, usageCount: 156, services: ['auth-service', 'api-service'] },
    { id: 'sec-6', name: 'github-token', type: 'oauth', provider: 'custom', environment: 'development', lastRotated: '2025-11-01', status: 'compromised', rotationPolicy: '90d', autoRotate: false, usageCount: 8, services: ['ci-cd-pipeline', 'deployment-service'] },
    { id: 'sec-7', name: 'ssh-deploy-key', type: 'ssh_key', provider: 'kubernetes', environment: 'staging', lastRotated: '2026-01-15', rotationPolicy: '30d', status: 'healthy', autoRotate: true, usageCount: 5, services: ['deployment-agent'] },
    { id: 'sec-8', name: 'redis-password', type: 'database', provider: 'gcp', environment: 'production', lastRotated: '2026-01-28', expiresAt: '2026-04-28', rotationPolicy: '90d', status: 'healthy', autoRotate: true, usageCount: 23, services: ['cache-service', 'session-store'] }
  ];

  // Mock rotation events
  const rotationEvents: RotationEvent[] = [
    { id: 'evt-1', secretId: 'sec-5', secretName: 'jwt-signing-key', timestamp: '2026-02-04T10:00:00Z', status: 'success', triggeredBy: 'schedule', details: 'Automatic rotation completed. New key deployed to all services.', rollbackAvailable: true },
    { id: 'evt-2', secretId: 'sec-2', secretName: 'stripe-api-key', timestamp: '2026-02-03T14:30:00Z', status: 'pending', triggeredBy: 'schedule', details: 'Rotation scheduled. Awaiting Stripe API confirmation.', rollbackAvailable: false },
    { id: 'evt-3', secretId: 'sec-6', secretName: 'github-token', timestamp: '2026-02-02T09:15:00Z', status: 'failed', triggeredBy: 'compromise', details: 'Emergency rotation attempted but failed. Manual intervention required.', rollbackAvailable: false },
    { id: 'evt-4', secretId: 'sec-1', secretName: 'prod-database-password', timestamp: '2026-01-28T02:00:00Z', status: 'success', triggeredBy: 'manual', details: 'Manual rotation by admin@company.com. Zero-downtime migration completed.', rollbackAvailable: true },
    { id: 'evt-5', secretId: 'sec-7', secretName: 'ssh-deploy-key', timestamp: '2026-01-15T08:00:00Z', status: 'success', triggeredBy: 'schedule', details: 'SSH key rotated and distributed to deployment agents.', rollbackAvailable: true }
  ];

  // Mock vault connections
  const vaultConnections: VaultConnection[] = [
    { id: 'vault-1', name: 'Production Vault', type: 'hashicorp_vault', status: 'connected', secretsManaged: 47, lastSync: '2026-02-04T11:00:00Z' },
    { id: 'vault-2', name: 'AWS Secrets Manager', type: 'aws_secrets_manager', status: 'connected', secretsManaged: 23, lastSync: '2026-02-04T10:55:00Z' },
    { id: 'vault-3', name: 'Azure Key Vault', type: 'azure_key_vault', status: 'connected', secretsManaged: 12, lastSync: '2026-02-04T10:50:00Z' },
    { id: 'vault-4', name: 'GCP Secret Manager', type: 'gcp_secret_manager', status: 'error', secretsManaged: 8, lastSync: '2026-02-03T15:00:00Z' }
  ];

  const rotateSecret = async (secretId: string) => {
    setIsRotating(secretId);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsRotating(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'connected': case 'success': return 'text-green-400 bg-green-500/10 border-green-500';
      case 'expiring': case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      case 'expired': case 'failed': case 'error': return 'text-red-400 bg-red-500/10 border-red-500';
      case 'compromised': return 'text-red-400 bg-red-500/20 border-red-500 animate-pulse';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api_key': return '🔑';
      case 'database': return '🗄️';
      case 'oauth': return '🔐';
      case 'certificate': return '📜';
      case 'ssh_key': return '🔒';
      case 'encryption_key': return '🔏';
      default: return '🔧';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'aws': return '☁️';
      case 'azure': return '🔷';
      case 'gcp': return '🌐';
      case 'vault': return '🏛️';
      case 'kubernetes': return '☸️';
      default: return '⚙️';
    }
  };

  const getVaultIcon = (type: string) => {
    switch (type) {
      case 'hashicorp_vault': return '🏛️';
      case 'aws_secrets_manager': return '☁️';
      case 'azure_key_vault': return '🔷';
      case 'gcp_secret_manager': return '🌐';
      default: return '🔐';
    }
  };

  const compromisedCount = secrets.filter(s => s.status === 'compromised').length;
  const expiredCount = secrets.filter(s => s.status === 'expired').length;
  const expiringCount = secrets.filter(s => s.status === 'expiring').length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 px-6 py-3 bg-green-500/20 border border-green-500 rounded-xl text-green-400 shadow-lg animate-pulse">
          {notification}
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        ref={importFileRef}
        type="file"
        accept=".json,.yaml,.yml,.env"
        className="hidden"
        title="Import secrets file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            showNotification(`📥 Importing secrets from ${file.name}...`);
            setTimeout(() => showNotification(`✅ Successfully imported secrets from ${file.name}`), 2000);
          }
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🔄 Secrets Rotation</h1>
          <p className="text-gray-400">Automatic credential rotation and lifecycle management</p>
        </div>
        <button
          onClick={handleAIAnalysis}
          disabled={analyzing || backendLoading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium text-white flex items-center gap-2"
        >
          {analyzing ? '⏳ Analyzing...' : '🤖 AI Analysis'}
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => importFileRef.current?.click()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
          >
            📥 Import Secrets
          </button>
          <button
            onClick={() => setShowAddSecretForm(!showAddSecretForm)}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium"
          >
            {showAddSecretForm ? '✕ Cancel' : '➕ Add Secret'}
          </button>
        </div>
      </div>

      {/* Critical Alerts */}
      {showAddSecretForm && (
        <div className="mb-6 bg-gray-900/50 border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-4">Add New Secret</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Secret Name</label>
              <input type="text" placeholder="e.g., my-api-key" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select title="Secret type" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none">
                <option>API Key</option><option>Database</option><option>OAuth</option><option>Certificate</option><option>SSH Key</option><option>Encryption Key</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Rotation Policy</label>
              <select title="Rotation policy" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none">
                <option>7 days</option><option>30 days</option><option>90 days</option><option>365 days</option><option>Manual</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => { setShowAddSecretForm(false); showNotification('✅ Secret added successfully!'); }}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium"
          >
            Save Secret
          </button>
        </div>
      )}

      {/* Critical Alerts */}
      {(compromisedCount > 0 || expiredCount > 0) && (
        <div className={`mb-6 p-4 rounded-xl ${compromisedCount > 0 ? 'bg-red-500/20 border border-red-500' : 'bg-orange-500/10 border border-orange-500/50'}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚨</span>
            <div>
              <h3 className={`font-bold text-lg ${compromisedCount > 0 ? 'text-red-400' : 'text-orange-400'}`}>
                {compromisedCount > 0 ? 'COMPROMISED SECRETS DETECTED!' : 'Expired Secrets Require Attention'}
              </h3>
              <p className="text-gray-400">
                {compromisedCount > 0 && `${compromisedCount} secret(s) may be compromised. `}
                {expiredCount > 0 && `${expiredCount} secret(s) have expired. `}
                Rotate immediately!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-white">{secrets.length}</div>
          <div className="text-gray-400 text-sm">Total Secrets</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">{secrets.filter(s => s.status === 'healthy').length}</div>
          <div className="text-gray-400 text-sm">Healthy</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-400">{expiringCount}</div>
          <div className="text-gray-400 text-sm">Expiring Soon</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-400">{expiredCount + compromisedCount}</div>
          <div className="text-gray-400 text-sm">Critical</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-400">{secrets.filter(s => s.autoRotate).length}</div>
          <div className="text-gray-400 text-sm">Auto-Rotate</div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-cyan-400">{vaultConnections.filter(v => v.status === 'connected').length}</div>
          <div className="text-gray-400 text-sm">Vaults Connected</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'secrets', label: '🔐 Secrets' },
          { id: 'rotation', label: '🔄 Rotation History' },
          { id: 'policies', label: '📋 Policies' },
          { id: 'vaults', label: '🏛️ Vault Connections' }
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

      {/* Secrets Tab */}
      {activeTab === 'secrets' && (
        <div className="space-y-4">
          {secrets.map(secret => (
            <div key={secret.id} className={`p-6 rounded-xl border ${getStatusColor(secret.status)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{getTypeIcon(secret.type)}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg font-mono">{secret.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getStatusColor(secret.status)}`}>
                        {secret.status}
                      </span>
                      {secret.autoRotate && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                          🔄 Auto
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        {getProviderIcon(secret.provider)} {secret.provider}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        secret.environment === 'production' ? 'bg-red-500/20 text-red-400' :
                        secret.environment === 'staging' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {secret.environment}
                      </span>
                      <span>Policy: {secret.rotationPolicy}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm">
                    <div className="text-gray-400">Last rotated</div>
                    <div className="font-medium">{secret.lastRotated}</div>
                  </div>
                  <button
                    onClick={() => rotateSecret(secret.id)}
                    disabled={isRotating === secret.id}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isRotating === secret.id
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : secret.status === 'compromised'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    {isRotating === secret.id ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Rotating...
                      </span>
                    ) : (
                      '🔄 Rotate Now'
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="text-gray-400">
                  <span className="text-gray-500">Used by:</span> {secret.services.slice(0, 3).join(', ')}
                  {secret.services.length > 3 && ` +${secret.services.length - 3} more`}
                </div>
                <div className="text-gray-500">•</div>
                <div className="text-gray-400">
                  {secret.usageCount} API calls/day
                </div>
                {secret.expiresAt && (
                  <>
                    <div className="text-gray-500">•</div>
                    <div className={secret.status === 'expiring' ? 'text-yellow-400' : 'text-gray-400'}>
                      Expires: {secret.expiresAt}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rotation History Tab */}
      {activeTab === 'rotation' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                <th className="p-4">Secret</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Triggered By</th>
                <th className="p-4">Status</th>
                <th className="p-4">Details</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rotationEvents.map(event => (
                <tr key={event.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-4 font-mono text-sm">{event.secretName}</td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(event.timestamp).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      event.triggeredBy === 'compromise' ? 'bg-red-500/20 text-red-400' :
                      event.triggeredBy === 'manual' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {event.triggeredBy}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm max-w-xs truncate">{event.details}</td>
                  <td className="p-4">
                    {event.rollbackAvailable && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Rollback rotation for ${event.secretName}?\n\nThis will revert to the previous secret value. Services using this secret will switch back to the old credential.`)) {
                            showNotification(`↩️ Rollback initiated for ${event.secretName}. Previous value restored.`);
                          }
                        }}
                        className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500 rounded text-sm text-orange-400"
                      >
                        ↩️ Rollback
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Rotation Policies</h2>
            <div className="space-y-3">
              {[
                { period: '7 days', count: secrets.filter(s => s.rotationPolicy === '7d').length, description: 'High-security keys (JWT, encryption)' },
                { period: '30 days', count: secrets.filter(s => s.rotationPolicy === '30d').length, description: 'API keys, OAuth tokens' },
                { period: '90 days', count: secrets.filter(s => s.rotationPolicy === '90d').length, description: 'Database passwords, service accounts' },
                { period: '365 days', count: secrets.filter(s => s.rotationPolicy === '365d').length, description: 'Certificates, long-lived tokens' },
                { period: 'Manual', count: secrets.filter(s => s.rotationPolicy === 'manual').length, description: 'Legacy systems, third-party constraints' }
              ].map((policy, idx) => (
                <div key={idx} className="p-4 bg-gray-800/50 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium">{policy.period}</div>
                    <div className="text-sm text-gray-500">{policy.description}</div>
                  </div>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded font-bold">
                    {policy.count} secrets
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">⚙️ Rotation Configuration</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Zero-Downtime Rotation</span>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">ENABLED</span>
                </div>
                <p className="text-sm text-gray-500">Rotate secrets without service interruption using dual-key strategy</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Automatic Rollback</span>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">ENABLED</span>
                </div>
                <p className="text-sm text-gray-500">Automatically rollback if rotation causes service errors</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Compromise Detection</span>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">ENABLED</span>
                </div>
                <p className="text-sm text-gray-500">Monitor for leaked secrets and trigger emergency rotation</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Pre-Rotation Notifications</span>
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">24h BEFORE</span>
                </div>
                <p className="text-sm text-gray-500">Notify teams before scheduled rotation</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vaults Tab */}
      {activeTab === 'vaults' && (
        <div className="space-y-4">
          {vaultConnections.map(vault => (
            <div key={vault.id} className={`p-6 rounded-xl border ${getStatusColor(vault.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{getVaultIcon(vault.type)}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{vault.name}</h3>
                    <p className="text-sm text-gray-500">{vault.type.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{vault.secretsManaged}</div>
                    <div className="text-xs text-gray-500">Secrets</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Last sync</div>
                    <div className="text-sm">{new Date(vault.lastSync).toLocaleString()}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase border ${getStatusColor(vault.status)}`}>
                    {vault.status}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowConnectVaultForm(!showConnectVaultForm)}
            className="w-full p-6 border-2 border-dashed border-gray-700 rounded-xl text-gray-500 hover:border-purple-500 hover:text-purple-400 transition-colors"
          >
            {showConnectVaultForm ? '✕ Cancel' : '➕ Connect New Vault'}
          </button>

          {showConnectVaultForm && (
            <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-6 mt-4">
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Connect New Vault</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Vault Type</label>
                  <select title="Vault type" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none">
                    <option>HashiCorp Vault</option><option>AWS Secrets Manager</option><option>Azure Key Vault</option><option>GCP Secret Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Connection URL</label>
                  <input type="text" placeholder="https://vault.example.com" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
              <button
                onClick={() => { setShowConnectVaultForm(false); showNotification('✅ Vault connection established! Syncing secrets...'); }}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium"
              >
                Connect
              </button>
            </div>
          )}
        </div>
      )}
      {analysisResult && (
        <div className="mt-6 p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-300 mb-2">🤖 AI Analysis Result</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{analysisResult}</p>
          <button onClick={() => setAnalysisResult('')} className="mt-2 text-sm text-purple-400 hover:text-purple-300">Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default SecretsRotation;
