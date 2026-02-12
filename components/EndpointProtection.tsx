import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

interface Device {
  id: string;
  hostname: string;
  platform: string;
  osVersion: string;
  status: 'online' | 'offline' | 'compromised' | 'isolated';
  lastSeen: string;
  riskScore: number;
  complianceStatus: string;
  protectionStatus: {
    realTimeProtection: boolean;
    firewallEnabled: boolean;
    encryptionEnabled: boolean;
    antivirusUpdated: boolean;
    osPatched: boolean;
  };
}

interface Threat {
  id: string;
  endpointId: string;
  detectedAt: string;
  threatType: string;
  threatName: string;
  severity: string;
  status: string;
  actionTaken: string;
  mitreTactic?: string;
  mitreTechnique?: string;
}

interface Stats {
  devices: {
    total: number;
    online: number;
    offline: number;
    compromised: number;
    isolated: number;
    compliant: number;
    avgRiskScore: number;
  };
  threats: {
    total: number;
    last24h: number;
    critical: number;
    active: number;
    blocked: number;
    quarantined: number;
  };
  events: {
    total: number;
    last24h: number;
    byType: Record<string, number>;
  };
  policies: {
    total: number;
    enabled: number;
  };
  protectionScore: number;
}

export const EndpointProtectionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'threats' | 'policies' | 'quarantine'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [_selectedDevice, _setSelectedDevice] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [policyStates, setPolicyStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, devicesRes, threatsRes] = await Promise.all([
        backendApi.endpointProtection.getStats(),
        backendApi.endpointProtection.getDevices(),
        backendApi.endpointProtection.getThreats()
      ]);
      setStats(statsRes);
      setDevices(devicesRes.devices as Device[]);
      setThreats(threatsRes.threats);
    } catch (error) {
      logger.error('Failed to load endpoint data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIsolateDevice = async (deviceId: string) => {
    setActionLoading(deviceId);
    try {
      await backendApi.endpointProtection.isolateDevice(deviceId, 'Manual isolation from dashboard');
      await loadData();
    } catch (error) {
      logger.error('Failed to isolate device:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreDevice = async (deviceId: string) => {
    setActionLoading(deviceId);
    try {
      await backendApi.endpointProtection.restoreDevice(deviceId);
      await loadData();
    } catch (error) {
      logger.error('Failed to restore device:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleScanDevice = async (deviceId: string, scanType: 'quick' | 'full') => {
    setActionLoading(deviceId);
    try {
      const result = await backendApi.endpointProtection.scanDevice(deviceId, scanType);
      alert(`${result.message}\nEstimated duration: ${result.estimatedDuration}`);
    } catch (error) {
      logger.error('Failed to initiate scan:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-500/20';
      case 'offline': return 'text-gray-400 bg-gray-500/20';
      case 'compromised': return 'text-red-400 bg-red-500/20';
      case 'isolated': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'windows': return '🪟';
      case 'macos': return '🍎';
      case 'linux': return '🐧';
      case 'ios': return '📱';
      case 'android': return '🤖';
      default: return '💻';
    }
  };

  if (loading) {
    return (
      <div className="bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🛡️</span>
            <h1 className="text-3xl font-bold bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Endpoint Detection & Response
            </h1>
            <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-xs font-bold">
              EDR / XDR
            </span>
          </div>
          <p className="text-purple-300">
            Real-time protection for Windows, macOS, Linux, iOS & Android devices
          </p>
        </div>

        {/* Protection Score Banner */}
        {stats && (
          <div className="mb-8 bg-linear-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-1">Overall Protection Score</h3>
                <p className="text-purple-300 text-sm">Based on device compliance, active threats, and policy coverage</p>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-bold ${
                  stats.protectionScore >= 80 ? 'text-green-400' :
                  stats.protectionScore >= 60 ? 'text-yellow-400' :
                  stats.protectionScore >= 40 ? 'text-orange-400' : 'text-red-400'
                }`}>
                  {stats.protectionScore}%
                </div>
                <p className="text-sm text-purple-400">
                  {stats.protectionScore >= 80 ? 'Excellent' :
                   stats.protectionScore >= 60 ? 'Good' :
                   stats.protectionScore >= 40 ? 'Needs Attention' : 'Critical'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-black/40 border border-cyan-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-cyan-400">{stats.devices.total}</div>
              <div className="text-sm text-purple-300">Total Devices</div>
            </div>
            <div className="bg-black/40 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{stats.devices.online}</div>
              <div className="text-sm text-purple-300">Online</div>
            </div>
            <div className="bg-black/40 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-red-400">{stats.devices.compromised}</div>
              <div className="text-sm text-purple-300">Compromised</div>
            </div>
            <div className="bg-black/40 border border-orange-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-400">{stats.threats.last24h}</div>
              <div className="text-sm text-purple-300">Threats (24h)</div>
            </div>
            <div className="bg-black/40 border border-pink-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-pink-400">{stats.threats.blocked}</div>
              <div className="text-sm text-purple-300">Blocked</div>
            </div>
            <div className="bg-black/40 border border-purple-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{stats.policies.enabled}</div>
              <div className="text-sm text-purple-300">Active Policies</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['overview', 'devices', 'threats', 'policies', 'quarantine'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-linear-to-r from-cyan-500 to-purple-500 text-white'
                  : 'bg-black/40 border border-purple-500/30 text-purple-400 hover:border-cyan-500/50'
              }`}
            >
              {tab === 'overview' && '📊 '}
              {tab === 'devices' && '💻 '}
              {tab === 'threats' && '🚨 '}
              {tab === 'policies' && '📋 '}
              {tab === 'quarantine' && '🔒 '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && stats && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Device Health */}
            <div className="bg-black/40 border border-cyan-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">Device Health</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Online</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      {/* Dynamic width based on data */}
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${stats.devices.total ? (stats.devices.online / stats.devices.total) * 100 : 0}%` }} // eslint-disable-line
                      />
                    </div>
                    <span className="text-green-400 w-12 text-right">{stats.devices.online}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Offline</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      {/* Dynamic width based on data */}
                      <div 
                        className="h-full bg-gray-500 rounded-full"
                        style={{ width: `${stats.devices.total ? (stats.devices.offline / stats.devices.total) * 100 : 0}%` }} // eslint-disable-line
                      />
                    </div>
                    <span className="text-gray-400 w-12 text-right">{stats.devices.offline}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Compromised</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      {/* Dynamic width based on data */}
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${stats.devices.total ? (stats.devices.compromised / stats.devices.total) * 100 : 0}%` }} // eslint-disable-line
                      />
                    </div>
                    <span className="text-red-400 w-12 text-right">{stats.devices.compromised}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Isolated</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      {/* Dynamic width based on data */}
                      <div 
                        className="h-full bg-yellow-500 rounded-full"
                        style={{ width: `${stats.devices.total ? (stats.devices.isolated / stats.devices.total) * 100 : 0}%` }} // eslint-disable-line
                      />
                    </div>
                    <span className="text-yellow-400 w-12 text-right">{stats.devices.isolated}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Threat Summary */}
            <div className="bg-black/40 border border-red-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-4">Threat Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.threats.critical}</div>
                  <div className="text-xs text-red-300">Critical</div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-400">{stats.threats.active}</div>
                  <div className="text-xs text-orange-300">Active</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.threats.blocked}</div>
                  <div className="text-xs text-green-300">Blocked</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.threats.quarantined}</div>
                  <div className="text-xs text-yellow-300">Quarantined</div>
                </div>
              </div>
            </div>

            {/* Recent Threats */}
            <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Recent Threats</h3>
              {threats.length === 0 ? (
                <div className="text-center py-8 text-purple-400">
                  <span className="text-4xl mb-2 block">🎉</span>
                  No threats detected. Your devices are secure!
                </div>
              ) : (
                <div className="space-y-3">
                  {threats.slice(0, 5).map((threat) => (
                    <div key={threat.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getSeverityColor(threat.severity)}`}>
                          {threat.severity.toUpperCase()}
                        </span>
                        <div>
                          <div className="text-cyan-300 font-medium">{threat.threatName}</div>
                          <div className="text-xs text-purple-400">{threat.threatType} • {threat.actionTaken}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        threat.status === 'blocked' ? 'bg-green-500/20 text-green-400' :
                        threat.status === 'quarantined' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {threat.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="bg-black/40 border border-cyan-500/30 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/40 border-b border-cyan-500/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Device</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Platform</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Risk</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Protection</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Last Seen</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-purple-400">
                        <span className="text-4xl mb-2 block">📱</span>
                        No devices enrolled yet. Install the Anchor agent on your devices to get started.
                      </td>
                    </tr>
                  ) : (
                    devices.map((device) => (
                      <tr key={device.id} className="border-b border-gray-800 hover:bg-white/5">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getPlatformIcon(device.platform)}</span>
                            <div>
                              <div className="text-cyan-300 font-medium">{device.hostname}</div>
                              <div className="text-xs text-purple-400">{device.osVersion}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-purple-300 capitalize">{device.platform}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(device.status)}`}>
                            {device.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                              {/* Dynamic risk bar */}
                              <div 
                                className={`h-full rounded-full ${
                                  device.riskScore > 70 ? 'bg-red-500' :
                                  device.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${device.riskScore}%` }} // eslint-disable-line
                              />
                            </div>
                            <span className={`text-sm ${
                              device.riskScore > 70 ? 'text-red-400' :
                              device.riskScore > 40 ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                              {device.riskScore}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <span title="Real-time Protection" className={device.protectionStatus.realTimeProtection ? 'text-green-400' : 'text-red-400'}>🛡️</span>
                            <span title="Firewall" className={device.protectionStatus.firewallEnabled ? 'text-green-400' : 'text-red-400'}>🔥</span>
                            <span title="Encryption" className={device.protectionStatus.encryptionEnabled ? 'text-green-400' : 'text-red-400'}>🔐</span>
                            <span title="Updated" className={device.protectionStatus.antivirusUpdated ? 'text-green-400' : 'text-red-400'}>✓</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-purple-300 text-sm">
                          {new Date(device.lastSeen).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleScanDevice(device.id, 'quick')}
                              disabled={actionLoading === device.id}
                              className="px-2 py-1 text-xs bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50"
                            >
                              Scan
                            </button>
                            {device.status === 'isolated' ? (
                              <button
                                onClick={() => handleRestoreDevice(device.id)}
                                disabled={actionLoading === device.id}
                                className="px-2 py-1 text-xs bg-green-500/20 border border-green-500/30 rounded text-green-400 hover:bg-green-500/30 disabled:opacity-50"
                              >
                                Restore
                              </button>
                            ) : (
                              <button
                                onClick={() => handleIsolateDevice(device.id)}
                                disabled={actionLoading === device.id}
                                className="px-2 py-1 text-xs bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 disabled:opacity-50"
                              >
                                Isolate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'threats' && (
          <div className="bg-black/40 border border-red-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Detected Threats</h3>
            {threats.length === 0 ? (
              <div className="text-center py-12 text-purple-400">
                <span className="text-4xl mb-2 block">✅</span>
                No threats detected across your endpoints.
              </div>
            ) : (
              <div className="space-y-4">
                {threats.map((threat) => (
                  <div key={threat.id} className={`p-4 rounded-lg border ${getSeverityColor(threat.severity)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{threat.threatName}</h4>
                        <p className="text-sm text-purple-300">{threat.threatType} • Detected {new Date(threat.detectedAt).toLocaleString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        threat.status === 'blocked' ? 'bg-green-500 text-white' :
                        threat.status === 'quarantined' ? 'bg-yellow-500 text-black' :
                        threat.status === 'removed' ? 'bg-blue-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {threat.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {threat.mitreTactic && (
                        <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">
                          {threat.mitreTactic}
                        </span>
                      )}
                      {threat.mitreTechnique && (
                        <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-300">
                          {threat.mitreTechnique}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-500/20 border border-gray-500/30 rounded text-gray-300">
                        {threat.actionTaken}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-purple-400">Protection Policies</h3>
              <button onClick={() => setShowPolicyForm(!showPolicyForm)} className="px-4 py-2 bg-linear-to-r from-cyan-500 to-purple-500 rounded-lg text-white font-medium hover:from-purple-500 hover:to-cyan-500 transition-all">
                + Create Policy
              </button>
            </div>
            {showPolicyForm && (
              <div className="mt-4 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                <h4 className="text-white font-medium mb-3">New Security Policy</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input type="text" placeholder="Policy name" className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                  <select title="Policy category" className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                    <option>Endpoint Protection</option><option>Network Security</option><option>Access Control</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowPolicyForm(false); }} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg">Create</button>
                  <button onClick={() => setShowPolicyForm(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">Cancel</button>
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Default Policies */}
              {[
                { name: 'Real-time Protection', description: 'Continuously monitor for threats', enabled: true, type: 'protection' },
                { name: 'Firewall Rules', description: 'Block unauthorized network access', enabled: true, type: 'firewall' },
                { name: 'USB Device Control', description: 'Restrict removable media', enabled: false, type: 'device-control' },
                { name: 'Application Whitelist', description: 'Only allow approved applications', enabled: false, type: 'application-control' },
                { name: 'Disk Encryption', description: 'Enforce BitLocker/FileVault', enabled: true, type: 'encryption' },
                { name: 'Ransomware Protection', description: 'Protect against file encryption attacks', enabled: true, type: 'protection' },
              ].map((policy, idx) => (
                <div key={idx} className="p-4 bg-black/30 border border-gray-700 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-cyan-300">{policy.name}</h4>
                    <p className="text-sm text-purple-400">{policy.description}</p>
                    <span className="text-xs text-gray-500">{policy.type}</span>
                  </div>
                  <button onClick={() => setPolicyStates(prev => ({ ...prev, [policy.name]: !(prev[policy.name] ?? policy.enabled) }))} title={`Toggle ${policy.name}`} className={`w-12 h-6 rounded-full transition-all ${
                    (policyStates[policy.name] ?? policy.enabled) ? 'bg-green-500' : 'bg-gray-600'
                  }`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${
                      (policyStates[policy.name] ?? policy.enabled) ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'quarantine' && (
          <div className="bg-black/40 border border-yellow-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Quarantined Files</h3>
            <div className="text-center py-12 text-purple-400">
              <span className="text-4xl mb-2 block">📦</span>
              No files in quarantine.
              <p className="text-sm mt-2">Suspicious files will appear here when detected and quarantined.</p>
            </div>
          </div>
        )}

        {/* Platform Support Banner */}
        <div className="mt-8 bg-linear-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 border border-cyan-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 text-center">Supported Platforms</h3>
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="text-center">
              <span className="text-4xl block mb-2">🪟</span>
              <span className="text-purple-300 text-sm">Windows 10/11</span>
            </div>
            <div className="text-center">
              <span className="text-4xl block mb-2">🍎</span>
              <span className="text-purple-300 text-sm">macOS 12+</span>
            </div>
            <div className="text-center">
              <span className="text-4xl block mb-2">🐧</span>
              <span className="text-purple-300 text-sm">Linux (Ubuntu, RHEL)</span>
            </div>
            <div className="text-center">
              <span className="text-4xl block mb-2">📱</span>
              <span className="text-purple-300 text-sm">iOS 15+</span>
            </div>
            <div className="text-center">
              <span className="text-4xl block mb-2">🤖</span>
              <span className="text-purple-300 text-sm">Android 12+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndpointProtectionDashboard;
