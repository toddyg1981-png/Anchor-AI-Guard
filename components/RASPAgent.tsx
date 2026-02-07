import React, { useState, useEffect } from 'react';

// ============================================================================
// RASP AGENT - RUNTIME APPLICATION SELF-PROTECTION
// ============================================================================

interface RASPAgent {
  id: string;
  applicationName: string;
  environment: 'production' | 'staging' | 'development';
  language: 'node' | 'python' | 'java' | 'dotnet' | 'go' | 'ruby';
  version: string;
  status: 'active' | 'passive' | 'disabled' | 'error';
  lastHeartbeat: string;
  blockedAttacks: number;
  detectedThreats: number;
  performance: { cpu: number; memory: number; latency: number };
}

interface RuntimeAttack {
  id: string;
  timestamp: string;
  agentId: string;
  applicationName: string;
  attackType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  action: 'blocked' | 'detected' | 'allowed';
  sourceIP: string;
  requestPath: string;
  payload: string;
  stackTrace?: string;
}

interface ProtectionRule {
  id: string;
  name: string;
  category: 'injection' | 'authentication' | 'access_control' | 'cryptography' | 'deserialization';
  enabled: boolean;
  mode: 'block' | 'detect' | 'off';
  attacksBlocked: number;
}

export const RASPAgent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'agents' | 'attacks' | 'rules' | 'analytics'>('agents');
  const [_selectedAgent, _setSelectedAgent] = useState<RASPAgent | null>(null);
  const [realtimeAttacks, setRealtimeAttacks] = useState<RuntimeAttack[]>([]);
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [liveMode, setLiveMode] = useState(false);

  // Mock RASP agents
  const agents: RASPAgent[] = [
    { id: 'agent-1', applicationName: 'api-service', environment: 'production', language: 'node', version: '3.2.1', status: 'active', lastHeartbeat: '2026-02-04T11:59:55Z', blockedAttacks: 1247, detectedThreats: 45, performance: { cpu: 2.3, memory: 128, latency: 0.8 } },
    { id: 'agent-2', applicationName: 'payment-service', environment: 'production', language: 'java', version: '3.2.1', status: 'active', lastHeartbeat: '2026-02-04T11:59:58Z', blockedAttacks: 892, detectedThreats: 23, performance: { cpu: 4.1, memory: 256, latency: 1.2 } },
    { id: 'agent-3', applicationName: 'user-service', environment: 'production', language: 'python', version: '3.2.0', status: 'passive', lastHeartbeat: '2026-02-04T11:59:50Z', blockedAttacks: 0, detectedThreats: 156, performance: { cpu: 1.8, memory: 96, latency: 0.5 } },
    { id: 'agent-4', applicationName: 'admin-portal', environment: 'production', language: 'dotnet', version: '3.2.1', status: 'active', lastHeartbeat: '2026-02-04T11:59:52Z', blockedAttacks: 567, detectedThreats: 12, performance: { cpu: 3.2, memory: 192, latency: 1.0 } },
    { id: 'agent-5', applicationName: 'analytics-service', environment: 'staging', language: 'go', version: '3.2.1', status: 'active', lastHeartbeat: '2026-02-04T11:59:45Z', blockedAttacks: 89, detectedThreats: 5, performance: { cpu: 0.9, memory: 64, latency: 0.3 } },
    { id: 'agent-6', applicationName: 'legacy-api', environment: 'production', language: 'ruby', version: '3.1.0', status: 'error', lastHeartbeat: '2026-02-04T11:45:00Z', blockedAttacks: 234, detectedThreats: 78, performance: { cpu: 0, memory: 0, latency: 0 } }
  ];

  // Mock attacks
  const attacks: RuntimeAttack[] = [
    { id: 'atk-1', timestamp: '2026-02-04T11:59:58Z', agentId: 'agent-1', applicationName: 'api-service', attackType: 'SQL Injection', severity: 'critical', action: 'blocked', sourceIP: '185.234.72.15', requestPath: '/api/users?id=1 OR 1=1', payload: "' OR '1'='1' --", stackTrace: 'at DatabaseService.query(line 145)' },
    { id: 'atk-2', timestamp: '2026-02-04T11:59:45Z', agentId: 'agent-2', applicationName: 'payment-service', attackType: 'Path Traversal', severity: 'high', action: 'blocked', sourceIP: '192.168.1.100', requestPath: '/api/files/../../../etc/passwd', payload: '../../../etc/passwd' },
    { id: 'atk-3', timestamp: '2026-02-04T11:59:30Z', agentId: 'agent-1', applicationName: 'api-service', attackType: 'XSS', severity: 'medium', action: 'blocked', sourceIP: '10.0.0.55', requestPath: '/api/comments', payload: '<script>alert("xss")</script>' },
    { id: 'atk-4', timestamp: '2026-02-04T11:59:15Z', agentId: 'agent-3', applicationName: 'user-service', attackType: 'Command Injection', severity: 'critical', action: 'detected', sourceIP: '203.45.67.89', requestPath: '/api/ping', payload: '; cat /etc/passwd' },
    { id: 'atk-5', timestamp: '2026-02-04T11:58:55Z', agentId: 'agent-4', applicationName: 'admin-portal', attackType: 'LDAP Injection', severity: 'high', action: 'blocked', sourceIP: '172.16.0.25', requestPath: '/api/ldap/search', payload: '*)(&(objectClass=*)' },
    { id: 'atk-6', timestamp: '2026-02-04T11:58:30Z', agentId: 'agent-1', applicationName: 'api-service', attackType: 'Deserialization', severity: 'critical', action: 'blocked', sourceIP: '45.67.89.123', requestPath: '/api/import', payload: 'rO0ABXNyABNqYXZhLnV0aWwuSGFzaE1hcA...' }
  ];

  // Protection rules
  const protectionRules: ProtectionRule[] = [
    { id: 'rule-1', name: 'SQL Injection Protection', category: 'injection', enabled: true, mode: 'block', attacksBlocked: 4521 },
    { id: 'rule-2', name: 'XSS Protection', category: 'injection', enabled: true, mode: 'block', attacksBlocked: 2345 },
    { id: 'rule-3', name: 'Command Injection Protection', category: 'injection', enabled: true, mode: 'block', attacksBlocked: 892 },
    { id: 'rule-4', name: 'Path Traversal Protection', category: 'access_control', enabled: true, mode: 'block', attacksBlocked: 1567 },
    { id: 'rule-5', name: 'LDAP Injection Protection', category: 'injection', enabled: true, mode: 'block', attacksBlocked: 234 },
    { id: 'rule-6', name: 'XML External Entity (XXE)', category: 'injection', enabled: true, mode: 'block', attacksBlocked: 156 },
    { id: 'rule-7', name: 'Insecure Deserialization', category: 'deserialization', enabled: true, mode: 'block', attacksBlocked: 445 },
    { id: 'rule-8', name: 'Weak Cryptography Detection', category: 'cryptography', enabled: true, mode: 'detect', attacksBlocked: 0 },
    { id: 'rule-9', name: 'Authentication Bypass', category: 'authentication', enabled: true, mode: 'block', attacksBlocked: 789 },
    { id: 'rule-10', name: 'Broken Access Control', category: 'access_control', enabled: true, mode: 'block', attacksBlocked: 1023 }
  ];

  // Simulate realtime attacks
  useEffect(() => {
    const interval = setInterval(() => {
      const attackTypes = ['SQL Injection', 'XSS', 'Path Traversal', 'Command Injection', 'SSRF'];
      const severities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
      const newAttack: RuntimeAttack = {
        id: `atk-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agentId: agents[Math.floor(Math.random() * 4)].id,
        applicationName: agents[Math.floor(Math.random() * 4)].applicationName,
        attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        action: Math.random() > 0.1 ? 'blocked' : 'detected',
        sourceIP: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        requestPath: '/api/' + ['users', 'orders', 'products', 'auth'][Math.floor(Math.random() * 4)],
        payload: 'Malicious payload...'
      };
      setRealtimeAttacks(prev => [newAttack, ...prev.slice(0, 9)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10 border-green-500';
      case 'passive': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      case 'disabled': return 'text-gray-400 bg-gray-500/10 border-gray-500';
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500';
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

  const getLanguageIcon = (lang: string) => {
    switch (lang) {
      case 'node': return '🟢';
      case 'python': return '🐍';
      case 'java': return '☕';
      case 'dotnet': return '🔷';
      case 'go': return '🐹';
      case 'ruby': return '💎';
      default: return '⚙️';
    }
  };

  const totalBlockedAttacks = agents.reduce((sum, a) => sum + a.blockedAttacks, 0);
  const activeAgents = agents.filter(a => a.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🛡️ RASP Agent</h1>
          <p className="text-gray-400">Runtime Application Self-Protection - Real-time attack prevention</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => { setShowDeployForm(!showDeployForm); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium">
            📥 Deploy Agent
          </button>
          <button onClick={() => { setLiveMode(!liveMode); alert(liveMode ? 'Live mode disabled — switching to passive monitoring.' : 'Live mode enabled — all agents now actively blocking threats.'); }} className={`px-4 py-2 rounded-lg font-medium ${liveMode ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
            {liveMode ? '🔴 Live Mode ON' : '🟢 Live Mode OFF'}
          </button>
        </div>
      </div>

      {/* Real-time Alert Banner */}
      {realtimeAttacks.length > 0 && realtimeAttacks[0].action === 'blocked' && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <span className="text-green-400 font-bold">Attack Blocked! </span>
              <span className="text-gray-400">
                {realtimeAttacks[0].attackType} from {realtimeAttacks[0].sourceIP} on {realtimeAttacks[0].applicationName}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Agent Form */}
      {showDeployForm && (
        <div className="mb-6 p-4 bg-gray-900/80 border border-cyan-500/30 rounded-xl">
          <h3 className="font-semibold mb-3">📥 Deploy New RASP Agent</h3>
          <p className="text-sm text-gray-400 mb-3">Run the following command in your application environment to deploy the Anchor RASP agent:</p>
          <div className="p-3 bg-black/50 rounded-lg font-mono text-sm text-cyan-400 mb-3 flex items-center justify-between">
            <code>npx @anchor/rasp-agent deploy --env production --mode block</code>
            <button onClick={() => { navigator.clipboard.writeText('npx @anchor/rasp-agent deploy --env production --mode block'); alert('Deploy command copied to clipboard!'); }} className="ml-3 px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500 rounded text-xs text-cyan-400">Copy</button>
          </div>
          <button onClick={() => setShowDeployForm(false)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">Close</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-white">{agents.length}</div>
          <div className="text-gray-400 text-sm">Total Agents</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">{activeAgents}</div>
          <div className="text-gray-400 text-sm">Active (Blocking)</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-400">{totalBlockedAttacks.toLocaleString()}</div>
          <div className="text-gray-400 text-sm">Attacks Blocked</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-400">{agents.reduce((sum, a) => sum + a.detectedThreats, 0)}</div>
          <div className="text-gray-400 text-sm">Threats Detected</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-400">{protectionRules.filter(r => r.enabled).length}</div>
          <div className="text-gray-400 text-sm">Rules Active</div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-cyan-400">&lt;1ms</div>
          <div className="text-gray-400 text-sm">Avg Latency</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'agents', label: '🤖 Agents' },
          { id: 'attacks', label: '⚔️ Live Attacks' },
          { id: 'rules', label: '📋 Protection Rules' },
          { id: 'analytics', label: '📊 Analytics' }
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

      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          {agents.map(agent => (
            <div key={agent.id} className={`p-6 rounded-xl border ${getStatusColor(agent.status)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{getLanguageIcon(agent.language)}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{agent.applicationName}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                      {agent.status === 'active' && (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          Blocking
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{agent.language}</span>
                      <span>•</span>
                      <span>v{agent.version}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        agent.environment === 'production' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {agent.environment}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{agent.blockedAttacks.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Blocked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-400">{agent.detectedThreats}</div>
                    <div className="text-xs text-gray-500">Detected</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-400">Last heartbeat</div>
                    <div>{new Date(agent.lastHeartbeat).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">CPU:</span>
                  <span className={agent.performance.cpu > 5 ? 'text-yellow-400' : 'text-green-400'}>
                    {agent.performance.cpu}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Memory:</span>
                  <span className={agent.performance.memory > 200 ? 'text-yellow-400' : 'text-green-400'}>
                    {agent.performance.memory}MB
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Latency Overhead:</span>
                  <span className={agent.performance.latency > 1 ? 'text-yellow-400' : 'text-green-400'}>
                    {agent.performance.latency}ms
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Attacks Tab */}
      {activeTab === 'attacks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">⚔️ Live Attack Feed</h2>
            <span className="flex items-center gap-2 text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Real-time
            </span>
          </div>

          {[...realtimeAttacks, ...attacks].slice(0, 15).map((attack, idx) => (
            <div key={attack.id} className={`p-4 rounded-xl border ${
              attack.action === 'blocked' ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
            } ${idx === 0 ? 'animate-pulse' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    attack.action === 'blocked' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                  }`}>
                    {attack.action === 'blocked' ? '🛡️ BLOCKED' : '👁️ DETECTED'}
                  </span>
                  <span className="font-medium">{attack.attackType}</span>
                  <span className={`px-2 py-0.5 rounded text-xs border ${getSeverityColor(attack.severity)}`}>
                    {attack.severity}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{new Date(attack.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>🎯 {attack.applicationName}</span>
                <span>🌐 {attack.sourceIP}</span>
                <span className="font-mono text-cyan-400">{attack.requestPath}</span>
              </div>
              <div className="mt-2 p-2 bg-black/30 rounded font-mono text-xs text-orange-400 truncate">
                {attack.payload}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Protection Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {protectionRules.map(rule => (
            <div key={rule.id} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={rule.enabled} className="sr-only peer" readOnly />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                  <div>
                    <h3 className="font-medium">{rule.name}</h3>
                    <span className="text-sm text-gray-500">{rule.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">{rule.attacksBlocked.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Attacks blocked</div>
                  </div>
                  <select 
                    value={rule.mode}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm"
                    disabled
                  >
                    <option value="block">🛡️ Block</option>
                    <option value="detect">👁️ Detect</option>
                    <option value="off">⚪ Off</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Attack Distribution</h2>
            <div className="space-y-3">
              {[
                { type: 'SQL Injection', count: 4521, color: 'bg-red-500' },
                { type: 'XSS', count: 2345, color: 'bg-orange-500' },
                { type: 'Path Traversal', count: 1567, color: 'bg-yellow-500' },
                { type: 'Command Injection', count: 892, color: 'bg-green-500' },
                { type: 'Authentication Bypass', count: 789, color: 'bg-blue-500' },
                { type: 'Other', count: 456, color: 'bg-purple-500' }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.type}</span>
                    <span className="text-gray-400">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${(item.count / 4521) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🎯 Top Targeted Applications</h2>
            <div className="space-y-3">
              {agents.sort((a, b) => b.blockedAttacks - a.blockedAttacks).slice(0, 5).map(agent => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span>{getLanguageIcon(agent.language)}</span>
                    <span className="font-medium">{agent.applicationName}</span>
                  </div>
                  <span className="text-green-400 font-bold">{agent.blockedAttacks.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RASPAgent;
