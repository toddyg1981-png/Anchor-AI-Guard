import React, { useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';
import { useAuth } from '../hooks/useAuth';
import { DemoBanner, DemoAPIKeyWarning, DemoModeIndicator } from './DemoBanner';

interface APIKey {
  id: string;
  keyPreview: string;
  name: string;
  plan: string;
  enabled: boolean;
  rateLimit: number;
  monthlyQuota: number;
  monthlyUsed: number;
  lastUsed: string;
  createdAt: string;
}

interface UsageData {
  summary: {
    totalRequests: number;
    totalQuota: number | string;
    activeKeys: number;
    totalKeys: number;
  };
  byKey: Array<{
    keyId: string;
    name: string;
    plan: string;
    used: number;
    quota: number;
    percentage: number;
    lastUsed: string;
  }>;
  dailyUsage: Record<string, number>;
}

export default function AnchorIntelligenceDashboard() {
  const { isDemoMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'usage' | 'playground'>('overview');
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPlan, setNewKeyPlan] = useState('starter');
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Playground state
  const [playgroundKey, setPlaygroundKey] = useState('');
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState('status');
  const [playgroundBody, setPlaygroundBody] = useState('');
  const [playgroundResult, setPlaygroundResult] = useState('');
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [keysRes, usageRes] = await Promise.all([
        backendApi.anchorIntelligence.getKeys(),
        backendApi.anchorIntelligence.getUsage(),
      ]);
      setKeys(keysRes.keys || []);
      setUsage(usageRes);
    } catch (err) {
      logger.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createKey = async () => {
    if (!newKeyName) return;
    try {
      const res = await backendApi.anchorIntelligence.createKey({
        name: newKeyName,
        plan: newKeyPlan,
      });
      if (res.apiKey?.key) {
        setCreatedKey(res.apiKey.key);
        setNewKeyName('');
        setShowCreateKey(false);
        loadData();
      }
    } catch (err) {
      logger.error('Failed to create API key:', err);
    }
  };

  const revokeKey = async (keyId: string) => {
    if (!confirm('Are you sure? This cannot be undone. Any applications using this key will immediately lose access.')) return;
    try {
      await backendApi.anchorIntelligence.revokeKey(keyId);
      loadData();
    } catch (err) {
      logger.error('Failed to revoke key:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const runPlayground = async () => {
    if (!playgroundKey) {
      setPlaygroundResult(JSON.stringify({ error: 'Enter your API key first' }, null, 2));
      return;
    }
    setPlaygroundLoading(true);
    try {
      let result;
      switch (playgroundEndpoint) {
        case 'status':
          result = await backendApi.anchorIntelligence.getThreats(playgroundKey);
          break;
        case 'threats':
          result = await backendApi.anchorIntelligence.getThreats(playgroundKey, { limit: 5 });
          break;
        case 'analyze':
          const analyzeBody = playgroundBody ? JSON.parse(playgroundBody) : { type: 'vulnerability', data: 'CVE-2024-3400 Palo Alto PAN-OS Command Injection' };
          result = await backendApi.anchorIntelligence.analyze(playgroundKey, analyzeBody);
          break;
        case 'rules':
          const rulesBody = playgroundBody ? JSON.parse(playgroundBody) : { threat: 'Cobalt Strike beacon C2', format: 'sigma' };
          result = await backendApi.anchorIntelligence.generateRule(playgroundKey, rulesBody);
          break;
        case 'predict':
          const predictBody = playgroundBody ? JSON.parse(playgroundBody) : { industry: 'Technology', timeframe: '30 days' };
          result = await backendApi.anchorIntelligence.predict(playgroundKey, predictBody);
          break;
        case 'enrich':
          const enrichBody = playgroundBody ? JSON.parse(playgroundBody) : { type: 'ip', value: '185.220.101.1' };
          result = await backendApi.anchorIntelligence.enrich(playgroundKey, enrichBody);
          break;
        default:
          result = { error: 'Unknown endpoint' };
      }
      setPlaygroundResult(JSON.stringify(result, null, 2));
    } catch (err: unknown) {
      setPlaygroundResult(JSON.stringify({ error: err instanceof Error ? err.message : 'Request failed' }, null, 2));
    } finally {
      setPlaygroundLoading(false);
    }
  };

  const planColors: Record<string, string> = {
    starter: 'bg-gray-500/20 text-gray-400',
    professional: 'bg-purple-500/20 text-purple-400',
    enterprise: 'bg-blue-500/20 text-blue-400',
    unlimited: 'bg-amber-500/20 text-amber-400',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center font-bold text-lg">AI</div>
                <div>
                  <h1 className="text-xl font-bold">Anchor Intelligence Dashboard</h1>
                  <p className="text-gray-400 text-sm">Manage your API keys, monitor usage, and test endpoints</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreateKey(true)}
              className="px-4 py-2 bg-purple-600 rounded-lg font-medium hover:bg-purple-500 transition-all text-sm"
            >
              + New API Key
            </button>
            {isDemoMode && <DemoModeIndicator className="ml-3" />}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            {(['overview', 'keys', 'usage', 'playground'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'keys' ? 'API Keys' : tab === 'usage' ? 'Usage & Billing' : 'API Playground'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Created Key Modal */}
      {createdKey && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-8 max-w-lg w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">{isDemoMode ? '🎭' : '🔑'}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isDemoMode ? 'Demo API Key Created!' : 'API Key Created!'}
              </h3>
              {isDemoMode && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 text-left">
                  <p className="text-amber-400 text-sm font-medium">⚠️ This is a DEMO key</p>
                  <p className="text-amber-300/80 text-xs mt-1">
                    This key is for demonstration only and will NOT work for real API integrations. 
                    <a href="https://anchoraiguard.com/signup" className="underline ml-1">Create a real account</a> to get working API keys.
                  </p>
                </div>
              )}
              <p className="text-red-400 text-sm font-medium mb-4">
                Copy this key now. It will NEVER be shown again.
              </p>
              <div className="bg-gray-800 rounded-lg p-4 mb-4 flex items-center gap-2">
                <code className="text-green-400 text-sm flex-1 break-all">{createdKey}</code>
                <button
                  onClick={() => copyToClipboard(createdKey)}
                  className="px-3 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600 transition-all flex-shrink-0"
                >
                  {copySuccess ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <button
                onClick={() => setCreatedKey(null)}
                className="px-6 py-2 bg-purple-600 rounded-lg font-medium hover:bg-purple-500 transition-all"
              >
                I've Saved My Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Key Modal */}
      {showCreateKey && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create New API Key</h3>
            {isDemoMode && <DemoAPIKeyWarning />}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Key Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production SIEM Integration"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Plan</label>
                <select
                  value={newKeyPlan}
                  onChange={e => setNewKeyPlan(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="starter">Starter ($99,990/mo)</option>
                  <option value="professional">Professional ($499,990/mo)</option>
                  <option value="enterprise">Enterprise ($2,499,990/mo)</option>
                  <option value="unlimited">Unlimited / OEM (Custom)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={createKey}
                  disabled={!newKeyName}
                  className="flex-1 py-3 bg-purple-600 rounded-lg font-bold hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDemoMode ? 'Create Demo Key' : 'Create Key'}
                </button>
                <button
                  onClick={() => setShowCreateKey(false)}
                  className="px-6 py-3 bg-gray-800 rounded-lg font-medium hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Demo Mode Banner */}
            {isDemoMode && <DemoBanner className="mb-6" />}

            {/* ==================== OVERVIEW ==================== */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <div className="text-3xl font-bold text-purple-400">{usage?.summary.activeKeys || 0}</div>
                    <div className="text-gray-400 text-sm mt-1">Active API Keys</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <div className="text-3xl font-bold text-blue-400">{(usage?.summary.totalRequests || 0).toLocaleString()}</div>
                    <div className="text-gray-400 text-sm mt-1">Total Requests (Month)</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <div className="text-3xl font-bold text-cyan-400">
                      {typeof usage?.summary.totalQuota === 'number' ? usage.summary.totalQuota.toLocaleString() : 'Unlimited'}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">Monthly Quota</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <div className="text-3xl font-bold text-green-400">
                      {usage?.summary.totalRequests && typeof usage.summary.totalQuota === 'number'
                        ? `${Math.round((usage.summary.totalRequests / usage.summary.totalQuota) * 100)}%`
                        : '0%'}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">Quota Used</div>
                  </div>
                </div>

                {/* Recent Keys */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-bold mb-4">API Keys</h3>
                  {keys.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🔑</div>
                      <p className="text-gray-400 mb-4">No API keys yet. Create one to get started.</p>
                      <button
                        onClick={() => setShowCreateKey(true)}
                        className="px-6 py-2 bg-purple-600 rounded-lg font-medium hover:bg-purple-500 transition-all"
                      >
                        Create Your First API Key
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {keys.slice(0, 5).map(key => (
                        <div key={key.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${key.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div>
                              <div className="font-medium">{key.name}</div>
                              <div className="text-gray-500 text-xs font-mono">{key.keyPreview}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${planColors[key.plan] || 'bg-gray-700 text-gray-300'}`}>
                              {key.plan.toUpperCase()}
                            </span>
                            <span className="text-gray-400 text-sm">{key.monthlyUsed.toLocaleString()} / {key.monthlyQuota > 0 ? key.monthlyQuota.toLocaleString() : '∞'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Links */}
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('playground')}
                    className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all text-left"
                  >
                    <div className="text-2xl mb-2">🧪</div>
                    <h4 className="font-bold">API Playground</h4>
                    <p className="text-gray-400 text-sm mt-1">Test endpoints interactively</p>
                  </button>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('usage'); }}
                    className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-all text-left block"
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <h4 className="font-bold">Usage Analytics</h4>
                    <p className="text-gray-400 text-sm mt-1">Monitor requests and quotas</p>
                  </a>
                  <a
                    href="#"
                    className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-cyan-500/50 transition-all text-left block"
                  >
                    <div className="text-2xl mb-2">📖</div>
                    <h4 className="font-bold">API Documentation</h4>
                    <p className="text-gray-400 text-sm mt-1">Full reference and examples</p>
                  </a>
                </div>
              </div>
            )}

            {/* ==================== API KEYS ==================== */}
            {activeTab === 'keys' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">API Keys ({keys.length})</h2>
                  <button
                    onClick={() => setShowCreateKey(true)}
                    className="px-4 py-2 bg-purple-600 rounded-lg font-medium hover:bg-purple-500 transition-all text-sm"
                  >
                    + Create Key
                  </button>
                </div>

                {keys.length === 0 ? (
                  <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
                    <div className="text-5xl mb-4">🔐</div>
                    <h3 className="text-xl font-bold mb-2">No API Keys</h3>
                    <p className="text-gray-400 mb-6">Create an API key to start using Anchor Intelligence.</p>
                    <button
                      onClick={() => setShowCreateKey(true)}
                      className="px-6 py-3 bg-purple-600 rounded-lg font-bold hover:bg-purple-500 transition-all"
                    >
                      Create Your First Key
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {keys.map(key => (
                      <div key={key.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-lg">{key.name}</h3>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${planColors[key.plan] || 'bg-gray-700 text-gray-300'}`}>
                                {key.plan.toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                key.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {key.enabled ? 'ACTIVE' : 'REVOKED'}
                              </span>
                            </div>
                            <div className="text-gray-500 text-sm font-mono mt-1">{key.keyPreview}</div>
                          </div>
                          {key.enabled && (
                            <button
                              onClick={() => revokeKey(key.id)}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-all"
                            >
                              Revoke
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-800">
                          <div>
                            <div className="text-gray-500 text-xs">Rate Limit</div>
                            <div className="font-medium">{key.rateLimit} req/min</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Monthly Usage</div>
                            <div className="font-medium">
                              {key.monthlyUsed.toLocaleString()} / {key.monthlyQuota > 0 ? key.monthlyQuota.toLocaleString() : '∞'}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Created</div>
                            <div className="font-medium">{new Date(key.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Last Used</div>
                            <div className="font-medium">{new Date(key.lastUsed).toLocaleDateString()}</div>
                          </div>
                        </div>

                        {/* Usage bar */}
                        {key.monthlyQuota > 0 && (
                          <div className="mt-4">
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  (key.monthlyUsed / key.monthlyQuota) > 0.9 ? 'bg-red-500' :
                                  (key.monthlyUsed / key.monthlyQuota) > 0.7 ? 'bg-yellow-500' : 'bg-purple-500'
                                }`}
                                style={{ width: `${Math.min((key.monthlyUsed / key.monthlyQuota) * 100, 100)}%` }}
                              />
                            </div>
                            <div className="text-gray-500 text-xs mt-1">
                              {Math.round((key.monthlyUsed / key.monthlyQuota) * 100)}% of monthly quota used
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ==================== USAGE ==================== */}
            {activeTab === 'usage' && usage && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold">Usage & Billing</h2>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <div className="text-2xl font-bold text-purple-400">{usage.summary.totalRequests.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">Total Requests</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <div className="text-2xl font-bold text-blue-400">
                      {typeof usage.summary.totalQuota === 'number' ? usage.summary.totalQuota.toLocaleString() : 'Unlimited'}
                    </div>
                    <div className="text-gray-400 text-sm">Monthly Quota</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <div className="text-2xl font-bold text-green-400">{usage.summary.activeKeys}</div>
                    <div className="text-gray-400 text-sm">Active Keys</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <div className="text-2xl font-bold text-cyan-400">{usage.summary.totalKeys}</div>
                    <div className="text-gray-400 text-sm">Total Keys</div>
                  </div>
                </div>

                {/* Usage by Key */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-bold mb-4">Usage by Key</h3>
                  <div className="space-y-4">
                    {usage.byKey.map((keyUsage, i) => (
                      <div key={i} className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{keyUsage.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${planColors[keyUsage.plan] || ''}`}>
                              {keyUsage.plan.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-gray-400 text-sm">
                            {keyUsage.used.toLocaleString()} / {keyUsage.quota > 0 ? keyUsage.quota.toLocaleString() : '∞'}
                          </span>
                        </div>
                        {keyUsage.quota > 0 && (
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                keyUsage.percentage > 90 ? 'bg-red-500' :
                                keyUsage.percentage > 70 ? 'bg-yellow-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${Math.min(keyUsage.percentage, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    {usage.byKey.length === 0 && (
                      <p className="text-gray-400 text-center py-4">No usage data yet</p>
                    )}
                  </div>
                </div>

                {/* Daily Usage */}
                {Object.keys(usage.dailyUsage).length > 0 && (
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-bold mb-4">Daily Usage (Last 30 Days)</h3>
                    <div className="flex items-end gap-1 h-32">
                      {Object.entries(usage.dailyUsage).slice(-30).map(([day, count], i) => {
                        const max = Math.max(...Object.values(usage.dailyUsage));
                        const height = max > 0 ? (count / max) * 100 : 0;
                        return (
                          <div
                            key={i}
                            className="flex-1 bg-purple-500/60 rounded-t hover:bg-purple-400/60 transition-all"
                            style={{ height: `${Math.max(height, 2)}%` }}
                            title={`${day}: ${count} requests`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== PLAYGROUND ==================== */}
            {activeTab === 'playground' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">API Playground</h2>
                <p className="text-gray-400">Test Anchor Intelligence API endpoints interactively.</p>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Request */}
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
                    <h3 className="font-bold">Request</h3>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">API Key</label>
                      <input
                        type="password"
                        value={playgroundKey}
                        onChange={e => setPlaygroundKey(e.target.value)}
                        placeholder="anc_your_api_key_here"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Endpoint</label>
                      <select
                        value={playgroundEndpoint}
                        onChange={e => {
                          setPlaygroundEndpoint(e.target.value);
                          // Set default body
                          const defaults: Record<string, string> = {
                            status: '',
                            threats: '',
                            analyze: JSON.stringify({ type: 'vulnerability', data: 'CVE-2024-3400 PAN-OS Command Injection' }, null, 2),
                            rules: JSON.stringify({ threat: 'Cobalt Strike beacon', format: 'sigma' }, null, 2),
                            predict: JSON.stringify({ industry: 'Technology', timeframe: '30 days' }, null, 2),
                            enrich: JSON.stringify({ type: 'ip', value: '185.220.101.1' }, null, 2),
                          };
                          setPlaygroundBody(defaults[e.target.value] || '');
                        }}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none text-sm"
                      >
                        <option value="status">GET /v1/status — API Status</option>
                        <option value="threats">GET /v1/threats — Threat Feed</option>
                        <option value="analyze">POST /v1/analyze — Threat Analysis</option>
                        <option value="rules">POST /v1/rules/generate — Rule Generation</option>
                        <option value="predict">POST /v1/predict — Predictions</option>
                        <option value="enrich">POST /v1/enrich — IOC Enrichment</option>
                      </select>
                    </div>

                    {playgroundBody && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Request Body (JSON)</label>
                        <textarea
                          value={playgroundBody}
                          onChange={e => setPlaygroundBody(e.target.value)}
                          rows={6}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-purple-500 focus:outline-none resize-none"
                        />
                      </div>
                    )}

                    <button
                      onClick={runPlayground}
                      disabled={playgroundLoading}
                      className="w-full py-3 bg-purple-600 rounded-lg font-bold hover:bg-purple-500 transition-all disabled:opacity-50"
                    >
                      {playgroundLoading ? 'Running...' : 'Send Request'}
                    </button>
                  </div>

                  {/* Response */}
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">Response</h3>
                      {playgroundResult && (
                        <button
                          onClick={() => copyToClipboard(playgroundResult)}
                          className="px-3 py-1 bg-gray-800 rounded text-xs hover:bg-gray-700 transition-all"
                        >
                          {copySuccess ? '✓ Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                    <pre className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-auto max-h-[400px] font-mono">
                      {playgroundResult || 'Response will appear here...'}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
